const PDF_SCALE = 1.8;
const MAX_FILES = 8;
const MAX_PREVIEW_CHARS = 240;

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// Tesseract CDN for languages we don't bundle locally
const TESS_CDN = "https://tessdata.projectnaptha.com/4.0.0";
const LOCAL_LANGS = ["eng", "tur"]; // available in ./lang-data/

// Language labels for display
const LANG_LABELS = {
  eng: "English", tur: "Turkish", deu: "German", fra: "French", ita: "Italian",
  spa: "Spanish", por: "Portuguese", nld: "Dutch", pol: "Polish", rus: "Russian",
  ukr: "Ukrainian", bul: "Bulgarian", hrv: "Croatian", ces: "Czech", dan: "Danish",
  fin: "Finnish", ell: "Greek", hun: "Hungarian", ron: "Romanian", srp: "Serbian",
  slk: "Slovak", slv: "Slovenian", swe: "Swedish", ara: "Arabic", heb: "Hebrew",
  fas: "Persian", urd: "Urdu", hin: "Hindi", ben: "Bengali", tam: "Tamil",
  tel: "Telugu", kan: "Kannada", mal: "Malayalam", tha: "Thai", vie: "Vietnamese",
  jpn: "Japanese", kor: "Korean", chi_sim: "Chinese (Simplified)", chi_tra: "Chinese (Traditional)",
  kat: "Georgian", hye: "Armenian", aze: "Azerbaijani", mon: "Mongolian"
};

let ocrRows = [];
let isProcessing = false;

const ui = {
  authOverlay: null,
  usernameInput: null,
  loginBtn: null,
  appShell: null,
  userStrip: null,
  displayUsername: null,
  logoutBtn: null,
  fileInput: null,
  pickFileBtn: null,
  uploadBox: null,
  progressSection: null,
  resultsSection: null,
  progressFill: null,
  progressText: null,
  resultsTextBox: null,
  totalInvoices: null,
  totalItems: null,
  stabilityRate: null,
  warningBox: null,
  downloadBtn: null,
  backToUploadBtn: null,
  resultsBackBtn: null,
  detectedLang: null,
  simulationContainer: null,
  simulationCanvas: null,
  simulationOverlay: null,
  submitReviewBtn: null,
  newReviewText: null,
  starRating: null
};

function bindUi() {
  ui.authOverlay = document.getElementById("authOverlay");
  ui.usernameInput = document.getElementById("usernameInput");
  ui.loginBtn = document.getElementById("loginBtn");
  ui.appShell = document.getElementById("appShell");
  ui.userStrip = document.getElementById("userStrip");
  ui.displayUsername = document.getElementById("displayUsername");
  ui.logoutBtn = document.getElementById("logoutBtn");

  ui.fileInput = document.getElementById("fileInput");
  ui.pickFileBtn = document.getElementById("pickFileBtn");
  ui.uploadBox = document.getElementById("uploadBox");
  ui.progressSection = document.getElementById("progressSection");
  ui.resultsSection = document.getElementById("resultsSection");
  ui.progressFill = document.getElementById("progressFill");
  ui.progressText = document.getElementById("progressText");
  ui.resultsTextBox = document.getElementById("resultsTextBox");
  ui.totalInvoices = document.getElementById("totalInvoices");
  ui.totalItems = document.getElementById("totalItems");
  ui.stabilityRate = document.getElementById("stabilityRate");
  ui.warningBox = document.getElementById("warningBox");
  ui.downloadBtn = document.getElementById("downloadBtn");
  ui.backToUploadBtn = document.getElementById("backToUploadBtn");
  ui.resultsBackBtn = document.getElementById("resultsBackBtn");
  ui.detectedLang = document.getElementById("detectedLang");

  ui.simulationContainer = document.getElementById("simulationContainer");
  ui.simulationCanvas = document.getElementById("simulationCanvas");
  ui.simulationOverlay = document.getElementById("simulationOverlay");

  ui.submitReviewBtn = document.getElementById("submitReviewBtn");
  ui.newReviewText = document.getElementById("newReviewText");
  ui.starRating = document.getElementById("starRating");

  return Boolean(
    ui.fileInput && ui.uploadBox && ui.progressSection && ui.resultsSection &&
    ui.progressFill && ui.progressText && ui.resultsTextBox && ui.downloadBtn
  );
}


// Check if all parts of a lang string are available locally
function isLocalLang(langStr) {
  var parts = langStr.split("+");
  return parts.every(function (p) { return LOCAL_LANGS.indexOf(p) !== -1; });
}

function handleAuth() {
  const savedUser = localStorage.getItem("redcore_username");

  const login = (username) => {
    if (!username || username.trim().length < 2) {
      alert("Please enter a valid username (min 2 chars).");
      return;
    }
    localStorage.setItem("redcore_username", username.trim());
    if (ui.authOverlay) ui.authOverlay.style.display = "none";
    if (ui.appShell) ui.appShell.style.display = "block";
    if (ui.userStrip) ui.userStrip.style.display = "inline-flex";
    if (ui.displayUsername) ui.displayUsername.textContent = username.trim();
  };

  const logout = () => {
    localStorage.removeItem("redcore_username");
    location.reload();
  };

  if (savedUser) {
    login(savedUser);
  }

  if (ui.loginBtn && ui.usernameInput) {
    ui.loginBtn.addEventListener("click", () => login(ui.usernameInput.value));
    ui.usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") login(ui.usernameInput.value);
    });
  }

  if (ui.logoutBtn) {
    ui.logoutBtn.addEventListener("click", logout);
  }
}

function initNavigation() {
  document.querySelectorAll(".site-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = link.getAttribute("href");
      if (!target || !target.startsWith("#")) return;
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function initStarRating() {
  if (!ui.starRating) return;
  const stars = ui.starRating.querySelectorAll(".star-btn");
  let selectedRating = 0;

  stars.forEach((star) => {
    star.addEventListener("click", () => {
      selectedRating = parseInt(star.dataset.value, 10);
      stars.forEach((s) => {
        const val = parseInt(s.dataset.value, 10);
        s.classList.toggle("active", val <= selectedRating);
      });
    });

    star.addEventListener("mouseenter", () => {
      const hoverVal = parseInt(star.dataset.value, 10);
      stars.forEach((s) => {
        const val = parseInt(s.dataset.value, 10);
        s.classList.toggle("hovered", val <= hoverVal);
      });
    });

    star.addEventListener("mouseleave", () => {
      stars.forEach((s) => s.classList.remove("hovered"));
    });
  });

  ui.starRating._getSelected = () => selectedRating;
  ui.starRating._reset = () => {
    selectedRating = 0;
    stars.forEach((s) => { s.classList.remove("active"); s.classList.remove("hovered"); });
  };
}

function initReviews() {
  if (ui.submitReviewBtn && ui.newReviewText) {
    ui.submitReviewBtn.addEventListener("click", () => {
      const text = ui.newReviewText.value.trim();
      const rating = ui.starRating ? ui.starRating._getSelected() : 0;
      if (!text) return;
      if (rating === 0) {
        alert("Please select a star rating.");
        return;
      }
      alert("Review posted! (Prototype — review not saved to server).");
      ui.newReviewText.value = "";
      if (ui.starRating && ui.starRating._reset) ui.starRating._reset();
    });
  }
}

function languageLabel(code) {
  return LANG_LABELS[code] || code.toUpperCase();
}

function inferLanguage(text) {
  var turkishPattern = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishPattern.test(text)) return "tur";
  return "eng";
}

// Detect script/language from OCR text by checking Unicode character ranges
function detectScriptLanguage(text) {
  var t = text || "";
  // Turkish specific
  if (/[çğıöşüÇĞİÖŞÜ]/.test(t)) return "tur";
  // Arabic script
  if (/[\u0600-\u06FF]/.test(t)) return "ara";
  // CJK (Chinese)
  if (/[\u4E00-\u9FFF]/.test(t)) return "chi_sim";
  // Japanese (Hiragana/Katakana)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(t)) return "jpn";
  // Korean (Hangul)
  if (/[\uAC00-\uD7AF\u1100-\u11FF]/.test(t)) return "kor";
  // Cyrillic (Russian default)
  if (/[\u0400-\u04FF]/.test(t)) return "rus";
  // Greek
  if (/[\u0370-\u03FF]/.test(t)) return "ell";
  // Hebrew
  if (/[\u0590-\u05FF]/.test(t)) return "heb";
  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(t)) return "hin";
  // Thai
  if (/[\u0E00-\u0E7F]/.test(t)) return "tha";
  // Bengali
  if (/[\u0980-\u09FF]/.test(t)) return "ben";
  // Tamil
  if (/[\u0B80-\u0BFF]/.test(t)) return "tam";
  // Georgian
  if (/[\u10A0-\u10FF]/.test(t)) return "kat";
  // Armenian
  if (/[\u0530-\u058F]/.test(t)) return "hye";
  // German (ß, umlauts)
  if (/[äöüßÄÖÜ]/.test(t)) return "deu";
  // French (accents)
  if (/[àâæçéèêëîïôœùûüÿ]/i.test(t)) return "fra";
  // Spanish (ñ, ¿, ¡)
  if (/[ñ¿¡]/i.test(t)) return "spa";
  // Portuguese
  if (/[ãõ]/i.test(t)) return "por";
  // Polish
  if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(t)) return "pol";
  // Romanian
  if (/[ăâîșțĂÂÎȘȚ]/.test(t)) return "ron";
  // Czech/Slovak
  if (/[ěščřžýáíéůúďťňĚŠČŘŽÝÁÍÉŮÚĎŤŇ]/.test(t)) return "ces";
  // Vietnamese
  if (/[\u01A0-\u01B0\u1EA0-\u1EF9]/.test(t)) return "vie";
  return "eng";
}

function deriveStabilityRate(progress) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  if (p >= 100) return 100;
  return Math.max(35, Math.min(99, Math.round(35 + p * 0.64)));
}

function updateProgress(progress, message) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  if (ui.progressFill) ui.progressFill.style.width = safeProgress + "%";
  if (ui.progressText) ui.progressText.textContent = message;
  if (ui.stabilityRate) ui.stabilityRate.textContent = deriveStabilityRate(safeProgress) + "%";
}

function setWarning(message) {
  if (!ui.warningBox) return;
  if (!message) {
    ui.warningBox.style.display = "none";
    ui.warningBox.textContent = "";
    return;
  }
  ui.warningBox.style.display = "block";
  ui.warningBox.textContent = message;
}

function goBackToUpload() {
  ocrRows = [];
  isProcessing = false;
  if (ui.fileInput) ui.fileInput.value = "";
  updateProgress(0, "Ready.");
  setWarning("");

  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) uploadSection.style.display = "block";
  if (ui.progressSection) ui.progressSection.style.display = "none";
  if (ui.resultsSection) ui.resultsSection.style.display = "none";
  if (ui.simulationOverlay) ui.simulationOverlay.innerHTML = "";
}

function sanitizeFiles(fileList) {
  return Array.from(fileList || [])
    .filter((file) => file && (file.type === "application/pdf" || file.type.startsWith("image/")))
    .slice(0, MAX_FILES);
}

async function renderPageToCanvas(pdfPage) {
  const viewport = pdfPage.getViewport({ scale: PDF_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });
  await pdfPage.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

async function loadImageToCanvas(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        resolve(canvas);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function releaseCanvas(canvas) {
  canvas.width = 0;
  canvas.height = 0;
}

function textPreview(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_PREVIEW_CHARS) return clean;
  return clean.slice(0, MAX_PREVIEW_CHARS) + "...";
}

function updateResultsView() {
  if (!ui.resultsTextBox) return;
  ui.resultsTextBox.innerHTML = "";

  if (!ocrRows.length) {
    const empty = document.createElement("p");
    empty.className = "results-empty";
    empty.textContent = "No OCR output was produced.";
    ui.resultsTextBox.appendChild(empty);
    if (ui.totalInvoices) ui.totalInvoices.textContent = "0";
    if (ui.totalItems) ui.totalItems.textContent = "0";
    return;
  }

  const uniqueFiles = new Set(ocrRows.map((row) => row.fileName));
  if (ui.totalInvoices) ui.totalInvoices.textContent = String(uniqueFiles.size);
  if (ui.totalItems) ui.totalItems.textContent = String(ocrRows.length);

  const groupedByFile = new Map();
  ocrRows.forEach((rowData) => {
    const existing = groupedByFile.get(rowData.fileName);
    if (existing) {
      existing.push(rowData);
      return;
    }
    groupedByFile.set(rowData.fileName, [rowData]);
  });

  const fragment = document.createDocumentFragment();

  groupedByFile.forEach((pages, fileName) => {
    const docBlock = document.createElement("section");
    docBlock.className = "ocr-doc-block";

    const title = document.createElement("h4");
    title.className = "ocr-doc-title";
    title.textContent = fileName;
    docBlock.appendChild(title);

    pages
      .slice()
      .sort((a, b) => a.page - b.page)
      .forEach((pageData) => {
        const pageBlock = document.createElement("article");
        pageBlock.className = "ocr-page-block";

        const meta = document.createElement("p");
        meta.className = "ocr-page-meta";
        meta.textContent = "Page " + pageData.page + " | " + pageData.language + " | " + Math.round(pageData.confidence) + "% confidence | " + pageData.characters + " chars";
        pageBlock.appendChild(meta);

        const text = document.createElement("pre");
        text.className = "ocr-page-text";
        text.textContent = String(pageData.fullText || "").trim() || "(No text found on this page)";
        pageBlock.appendChild(text);

        docBlock.appendChild(pageBlock);
      });

    fragment.appendChild(docBlock);
  });

  ui.resultsTextBox.appendChild(fragment);
}

function startSimulation(canvas) {
  if (!ui.simulationCanvas || !ui.simulationOverlay) return;

  const ctx = ui.simulationCanvas.getContext('2d');
  ui.simulationCanvas.width = canvas.width;
  ui.simulationCanvas.height = canvas.height;
  ctx.drawImage(canvas, 0, 0);

  ui.simulationOverlay.innerHTML = "";
  ui.simulationOverlay.style.width = ui.simulationCanvas.clientWidth + "px";
  ui.simulationOverlay.style.height = ui.simulationCanvas.clientHeight + "px";
}

function addSimulationWords(words) {
  if (!ui.simulationOverlay || !ui.simulationCanvas || !words || !words.length) return;

  var scaleX = ui.simulationCanvas.clientWidth / ui.simulationCanvas.width;
  var scaleY = ui.simulationCanvas.clientHeight / ui.simulationCanvas.height;
  var frag = document.createDocumentFragment();

  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    var span = document.createElement("span");
    span.className = "sim-word";
    span.textContent = word.text;
    span.style.left = (word.bbox.x0 * scaleX) + "px";
    span.style.top = (word.bbox.y0 * scaleY) + "px";
    span.style.fontSize = ((word.bbox.y1 - word.bbox.y0) * scaleY) + "px";
    frag.appendChild(span);
  }

  ui.simulationOverlay.appendChild(frag);
}

async function processFiles(files) {
  const validFiles = sanitizeFiles(files);
  if (!validFiles.length || isProcessing) return;

  isProcessing = true;
  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) uploadSection.style.display = "none";
  if (ui.progressSection) ui.progressSection.style.display = "block";
  if (ui.resultsSection) ui.resultsSection.style.display = "none";

  setWarning("");
  ocrRows = [];

  let worker;
  try {
    updateProgress(3, "Initializing OCR engine...");

    var workerOpts = {
      langPath: './lang-data',
      gzip: false,
      logger: function (m) {
        if (m.status === "recognizing text") {
          updateProgress(
            20 + Math.round(m.progress * 60),
            "OCR: " + Math.round(m.progress * 100) + "%"
          );
        }
      }
    };

    worker = await Tesseract.createWorker(workerOpts);

    // Pre-render all pages across all files for faster sequential OCR
    var allPages = [];
    for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex++) {
      const file = validFiles[fileIndex];
      updateProgress(10, "Rendering " + file.name + "...");

      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          allPages.push({ canvas: await renderPageToCanvas(page), fileName: file.name, page: p });
        }
        pdf.destroy();
      } else {
        allPages.push({ canvas: await loadImageToCanvas(file), fileName: file.name, page: 1 });
      }
    }

    // Auto-detect: OCR first page with eng, detect script, pick best language
    var ocrLang = "eng";
    if (allPages.length > 0) {
      updateProgress(12, "Detecting language...");
      if (ui.detectedLang) ui.detectedLang.textContent = "detecting...";
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      var probe = await worker.recognize(allPages[0].canvas);
      var detected = detectScriptLanguage(probe.data.text);
      ocrLang = detected;
      if (ui.detectedLang) ui.detectedLang.textContent = languageLabel(detected);

      // Re-initialize with detected language if different from eng
      if (detected !== "eng") {
        if (!isLocalLang(detected)) {
          await worker.terminate();
          worker = await Tesseract.createWorker({ langPath: TESS_CDN, gzip: true, logger: workerOpts.logger });
        }
        updateProgress(14, "Loading " + languageLabel(detected) + "...");
        await worker.loadLanguage(detected);
        await worker.initialize(detected);
      }
    } else {
      await worker.loadLanguage("eng");
      await worker.initialize("eng");
      if (ui.detectedLang) ui.detectedLang.textContent = "English";
    }

    // OCR each page
    for (let i = 0; i < allPages.length; i++) {
      if (!isProcessing) break;

      var pageInfo = allPages[i];
      startSimulation(pageInfo.canvas);
      updateProgress(15 + Math.round((i / allPages.length) * 70), "OCR page " + (i + 1) + "/" + allPages.length + "...");

      var result = await worker.recognize(pageInfo.canvas);
      var data = result.data;

      // Use detected/selected language for display
      var lang = ocrLang;
      if (ui.detectedLang) ui.detectedLang.textContent = languageLabel(lang);

      // Batch-add simulation words (no per-word delay)
      if (data.words && isProcessing) {
        addSimulationWords(data.words);
      }

      ocrRows.push({
        fileName: pageInfo.fileName,
        page: pageInfo.page,
        language: languageLabel(lang),
        confidence: data.confidence,
        characters: data.text.trim().length,
        preview: textPreview(data.text),
        fullText: data.text
      });

      // Release canvas memory after OCR
      releaseCanvas(pageInfo.canvas);
    }

    updateResultsView();
    updateProgress(100, "OCR completed.");

    if (ui.progressSection) ui.progressSection.style.display = "none";
    if (ui.resultsSection) ui.resultsSection.style.display = "block";

    window.dispatchEvent(new CustomEvent("ocr:completed", { detail: { count: ocrRows.length } }));

  } catch (error) {
    var errMsg = (error && error.message) ? error.message : String(error || "Unknown error");
    console.error("OCR Process Error:", error);
    if (isProcessing) {
      setWarning("OCR error: " + errMsg);
      alert("Processing error: " + errMsg);
      goBackToUpload();
    }
  } finally {
    isProcessing = false;
    if (worker) {
      try {
        await worker.terminate();
      } catch (e) {
        console.warn("Worker termination error:", e);
      }
    }
  }
}

function downloadText() {
  if (!ocrRows.length) return;
  var lines = ocrRows.map(function (row) {
    return "=== " + row.fileName + " | Page " + row.page + " | " + row.language + " | Confidence: " + Math.round(row.confidence) + "% ===\n" + row.fullText;
  });
  var content = lines.join("\n\n" + "—".repeat(60) + "\n\n");
  var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = "redcore_ocr_text_" + new Date().toISOString().slice(0, 10) + ".txt";
  a.click();
  URL.revokeObjectURL(url);
}

function downloadExcel() {
  if (!ocrRows.length) return;
  const sheetRows = ocrRows.map(row => [row.fileName, row.page, row.language, Math.round(row.confidence), row.characters, row.fullText]);
  const sheet = XLSX.utils.aoa_to_sheet([["File", "Page", "Language", "Confidence", "Characters", "OCR Text"], ...sheetRows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "OCR Text");
  XLSX.writeFile(workbook, "redcore_ocr_export_" + new Date().toISOString().slice(0, 10) + ".xlsx");
}

function wireEvents() {
  if (!bindUi()) { setTimeout(wireEvents, 80); return; }
  handleAuth();
  initNavigation();
  initStarRating();
  initReviews();

  ui.fileInput.addEventListener("change", function (e) { processFiles(e.target.files); });
  ui.pickFileBtn.addEventListener("click", function () { ui.fileInput.click(); });
  ui.downloadBtn.addEventListener("click", downloadExcel);
  var dlTextBtn = document.getElementById("downloadTextBtn");
  if (dlTextBtn) dlTextBtn.addEventListener("click", downloadText);
  if (ui.backToUploadBtn) ui.backToUploadBtn.addEventListener("click", goBackToUpload);
  if (ui.resultsBackBtn) ui.resultsBackBtn.addEventListener("click", goBackToUpload);

  ui.uploadBox.addEventListener("dragover", function (e) { e.preventDefault(); ui.uploadBox.classList.add("dragover"); });
  ui.uploadBox.addEventListener("dragleave", function () { ui.uploadBox.classList.remove("dragover"); });
  ui.uploadBox.addEventListener("drop", function (e) { e.preventDefault(); ui.uploadBox.classList.remove("dragover"); processFiles(e.dataTransfer.files); });
}

wireEvents();
