const PDF_SCALE = 2.4;
const MAX_FILES = 8;
const MAX_PREVIEW_CHARS = 240;

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const LANGUAGE_LABELS = {
  eng: "English",
  tur: "Turkish",
  deu: "German",
  fra: "French",
  ita: "Italian",
  spa: "Spanish",
  por: "Portuguese",
  ara: "Arabic",
  rus: "Russian",
  jpn: "Japanese",
  kor: "Korean",
  chi_sim: "Chinese (Simplified)",
  chi_tra: "Chinese (Traditional)",
  "eng+tur": "English + Turkish"
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
  resultsBody: null,
  totalInvoices: null,
  totalItems: null,
  stabilityRate: null,
  warningBox: null,
  downloadBtn: null,
  backToUploadBtn: null,
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
  ui.resultsBody = document.getElementById("resultsBody");
  ui.totalInvoices = document.getElementById("totalInvoices");
  ui.totalItems = document.getElementById("totalItems");
  ui.stabilityRate = document.getElementById("stabilityRate");
  ui.warningBox = document.getElementById("warningBox");
  ui.downloadBtn = document.getElementById("downloadBtn");
  ui.backToUploadBtn = document.getElementById("backToUploadBtn");
  ui.detectedLang = document.getElementById("detectedLang");

  ui.simulationContainer = document.getElementById("simulationContainer");
  ui.simulationCanvas = document.getElementById("simulationCanvas");
  ui.simulationOverlay = document.getElementById("simulationOverlay");

  ui.submitReviewBtn = document.getElementById("submitReviewBtn");
  ui.newReviewText = document.getElementById("newReviewText");
  ui.starRating = document.getElementById("starRating");

  return Boolean(
    ui.fileInput && ui.uploadBox && ui.progressSection && ui.resultsSection &&
    ui.progressFill && ui.progressText && ui.resultsBody && ui.downloadBtn
  );
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

  // Expose for review submission
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
  if (LANGUAGE_LABELS[code]) return LANGUAGE_LABELS[code];
  return code.toUpperCase();
}

function inferLanguage(text) {
  // Check for Turkish-specific chars in the OCR output
  const turkishPattern = /[çğıöşüÇĞİÖŞÜ]/;
  if (turkishPattern.test(text)) return "tur";
  return "eng";
}

function deriveStabilityRate(progress) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  if (p >= 100) return 100;
  return Math.max(35, Math.min(99, Math.round(35 + p * 0.64)));
}

function updateProgress(progress, message) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  if (ui.progressFill) ui.progressFill.style.width = `${safeProgress}%`;
  if (ui.progressText) ui.progressText.textContent = message;
  if (ui.stabilityRate) ui.stabilityRate.textContent = `${deriveStabilityRate(safeProgress)}%`;
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

function textPreview(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_PREVIEW_CHARS) return clean;
  return `${clean.slice(0, MAX_PREVIEW_CHARS)}...`;
}

function updateResultsTable() {
  if (!ui.resultsBody) return;
  ui.resultsBody.innerHTML = "";

  if (!ocrRows.length) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-row";
    cell.textContent = "No OCR output was produced.";
    row.appendChild(cell);
    ui.resultsBody.appendChild(row);
    if (ui.totalInvoices) ui.totalInvoices.textContent = "0";
    if (ui.totalItems) ui.totalItems.textContent = "0";
    return;
  }

  const uniqueFiles = new Set(ocrRows.map((row) => row.fileName));
  if (ui.totalInvoices) ui.totalInvoices.textContent = String(uniqueFiles.size);
  if (ui.totalItems) ui.totalItems.textContent = String(ocrRows.length);

  ocrRows.forEach((rowData) => {
    const row = document.createElement("tr");
    const cells = [
      rowData.fileName,
      String(rowData.page),
      rowData.language,
      `${Math.round(rowData.confidence)}%`,
      String(rowData.characters),
      rowData.preview
    ];

    cells.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 1 || index === 3) {
        const strong = document.createElement("strong");
        strong.textContent = value;
        cell.appendChild(strong);
      } else {
        cell.textContent = value;
      }
      row.appendChild(cell);
    });
    ui.resultsBody.appendChild(row);
  });
}

function startSimulation(canvas) {
  if (!ui.simulationCanvas || !ui.simulationOverlay) return;

  const ctx = ui.simulationCanvas.getContext('2d');
  ui.simulationCanvas.width = canvas.width;
  ui.simulationCanvas.height = canvas.height;
  ctx.drawImage(canvas, 0, 0);

  ui.simulationOverlay.innerHTML = "";
  ui.simulationOverlay.style.width = `${ui.simulationCanvas.clientWidth}px`;
  ui.simulationOverlay.style.height = `${ui.simulationCanvas.clientHeight}px`;
}

function addSimulationWord(word) {
  if (!ui.simulationOverlay || !ui.simulationCanvas) return;

  const span = document.createElement("span");
  span.className = "sim-word";
  span.textContent = word.text;

  const scaleX = ui.simulationCanvas.clientWidth / ui.simulationCanvas.width;
  const scaleY = ui.simulationCanvas.clientHeight / ui.simulationCanvas.height;

  span.style.left = `${word.bbox.x0 * scaleX}px`;
  span.style.top = `${word.bbox.y0 * scaleY}px`;
  span.style.fontSize = `${(word.bbox.y1 - word.bbox.y0) * scaleY}px`;

  ui.simulationOverlay.appendChild(span);
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
    updateProgress(5, "Initializing OCR engine...");

    // Tesseract.js 4.x: createWorker(langs, oem, options)
    // OEM 1 = LSTM only (best accuracy)
    worker = await Tesseract.createWorker("eng+tur", 1, {
      langPath: './lang-data',
      logger: function (m) {
        if (m.status === "recognizing text") {
          updateProgress(
            20 + Math.round(m.progress * 60),
            "Running OCR: " + Math.round(m.progress * 100) + "%"
          );
        }
      }
    });

    if (ui.detectedLang) ui.detectedLang.textContent = "English + Turkish";

    for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex++) {
      const file = validFiles[fileIndex];
      updateProgress(10, "Loading " + file.name + "...");

      let pages = [];
      if (file.type === "application/pdf") {
        const buffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(buffer).promise;
        for (let p = 1; p <= pdf.numPages; p++) {
          const page = await pdf.getPage(p);
          pages.push(await renderPageToCanvas(page));
        }
        pdf.destroy();
      } else {
        pages.push(await loadImageToCanvas(file));
      }

      for (let pIdx = 0; pIdx < pages.length; pIdx++) {
        const canvas = pages[pIdx];
        startSimulation(canvas);

        updateProgress(15, "OCR page " + (pIdx + 1) + "/" + pages.length + "...");

        var result = await worker.recognize(canvas);
        var data = result.data;

        // Infer dominant language from output (for display only)
        var lang = inferLanguage(data.text);
        if (ui.detectedLang) ui.detectedLang.textContent = languageLabel(lang);

        // Simulation: Add words with slight delay for visual effect
        if (data.words && isProcessing) {
          for (let i = 0; i < data.words.length; i++) {
            if (!isProcessing) break;
            addSimulationWord(data.words[i]);
            if (i % 8 === 0) await new Promise(function (r) { setTimeout(r, 5); });
          }
        }

        ocrRows.push({
          fileName: file.name,
          page: pIdx + 1,
          language: languageLabel(lang),
          confidence: data.confidence,
          characters: data.text.trim().length,
          preview: textPreview(data.text),
          fullText: data.text
        });
      }
    }

    updateResultsTable();
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
  if (ui.backToUploadBtn) ui.backToUploadBtn.addEventListener("click", goBackToUpload);

  ui.uploadBox.addEventListener("dragover", function (e) { e.preventDefault(); ui.uploadBox.classList.add("dragover"); });
  ui.uploadBox.addEventListener("dragleave", function () { ui.uploadBox.classList.remove("dragover"); });
  ui.uploadBox.addEventListener("drop", function (e) { e.preventDefault(); ui.uploadBox.classList.remove("dragover"); processFiles(e.dataTransfer.files); });
}

wireEvents();
