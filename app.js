const PDF_SCALE = 2.4;
const MAX_FILES = 5;
const MAX_PREVIEW_CHARS = 240;

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const LANGUAGE_CODES = [
  "eng", "tur", "deu", "fra", "ita", "spa", "por", "ara", "rus", "jpn", "kor",
  "chi_sim", "chi_tra", "afr", "amh", "asm", "aze", "aze_cyrl", "bel", "ben",
  "bod", "bos", "bre", "bul", "cat", "ceb", "ces", "chr", "cym", "dan",
  "dzo", "ell", "enm", "epo", "est", "eus", "fao", "fas", "fil", "fin",
  "frk", "frm", "gle", "glg", "grc", "guj", "hat", "heb", "hin", "hrv",
  "hun", "hye", "iku", "ind", "isl", "ita_old", "jav", "kan", "kat", "kat_old",
  "kaz", "khm", "kir", "kmr", "lao", "lat", "lav", "lit", "ltz", "mal",
  "mar", "mkd", "mlt", "mon", "mri", "msa", "mya", "nep", "nld", "nor",
  "ori", "pan", "pol"
];

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
  chi_tra: "Chinese (Traditional)"
};

let ocrRows = [];

const ui = {
  // Auth elements
  authOverlay: null,
  usernameInput: null,
  loginBtn: null,
  appShell: null,
  userStrip: null,
  displayUsername: null,
  logoutBtn: null,

  // Main OCR elements
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
  languageSelect: null,

  // Review elements
  submitReviewBtn: null,
  newReviewText: null
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
  ui.languageSelect = document.getElementById("ocrLanguageSelect");

  ui.submitReviewBtn = document.getElementById("submitReviewBtn");
  ui.newReviewText = document.getElementById("newReviewText");

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
      if (!target || !target.startsWith("#")) {
        return;
      }
      const element = document.querySelector(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });
}

function initReviews() {
  if (ui.submitReviewBtn && ui.newReviewText) {
    ui.submitReviewBtn.addEventListener("click", () => {
      const text = ui.newReviewText.value.trim();
      if (!text) return;
      alert("Review posted! (This is a prototype, review not saved to server).");
      ui.newReviewText.value = "";
    });
  }
}

function titleCaseWord(word) {
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : "";
}

function languageLabel(code) {
  if (LANGUAGE_LABELS[code]) {
    return `${LANGUAGE_LABELS[code]} (${code})`;
  }

  return `${code.split("_").map(titleCaseWord).join(" ")} (${code})`;
}

function initLanguageSelect() {
  if (!ui.languageSelect) {
    return;
  }

  ui.languageSelect.innerHTML = "";

  LANGUAGE_CODES.forEach((code) => {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = languageLabel(code);
    if (code === "eng") {
      option.selected = true;
    }
    ui.languageSelect.appendChild(option);
  });
}

function getSelectedLanguage() {
  if (!ui.languageSelect || !ui.languageSelect.value) {
    return "eng";
  }
  return ui.languageSelect.value;
}

function deriveStabilityRate(progress) {
  const p = Math.max(0, Math.min(100, Number(progress) || 0));
  if (p >= 100) {
    return 100;
  }
  return Math.max(35, Math.min(99, Math.round(35 + p * 0.64)));
}

function updateProgress(progress, message) {
  const safeProgress = Math.max(0, Math.min(100, Number(progress) || 0));
  if (ui.progressFill) {
    ui.progressFill.style.width = `${safeProgress}%`;
  }
  if (ui.progressText) {
    ui.progressText.textContent = message;
  }
  if (ui.stabilityRate) {
    ui.stabilityRate.textContent = `${deriveStabilityRate(safeProgress)}%`;
  }
}

function setWarning(message) {
  if (!ui.warningBox) {
    return;
  }

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
  if (ui.fileInput) {
    ui.fileInput.value = "";
  }
  updateProgress(0, "Ready.");
  setWarning("");

  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) {
    uploadSection.style.display = "block";
  }
  if (ui.progressSection) {
    ui.progressSection.style.display = "none";
  }
  if (ui.resultsSection) {
    ui.resultsSection.style.display = "none";
  }
}

function sanitizeFiles(fileList) {
  return Array.from(fileList || [])
    .filter((file) => file && file.type === "application/pdf")
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

function textPreview(text) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= MAX_PREVIEW_CHARS) {
    return clean;
  }
  return `${clean.slice(0, MAX_PREVIEW_CHARS)}...`;
}

function updateResultsTable() {
  if (!ui.resultsBody) {
    return;
  }

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
  if (ui.totalInvoices) {
    ui.totalInvoices.textContent = String(uniqueFiles.size);
  }
  if (ui.totalItems) {
    ui.totalItems.textContent = String(ocrRows.length);
  }

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

async function createOcrWorker() {
  // Use local langPath for trained data, fallback to CDN if needed
  const options = {
    logger: m => console.log(m),
    langPath: './lang-data' // This points to our project folder
  };
  
  const worker = await Tesseract.createWorker(options);
  return worker;
}

async function processFiles(files) {
  const validFiles = sanitizeFiles(files);
  if (!validFiles.length) {
    alert("Please upload a valid PDF file.");
    return;
  }

  const selectedLanguage = getSelectedLanguage();
  const selectedLanguageLabel = languageLabel(selectedLanguage);
  const uploadSection = document.querySelector(".upload-section");

  if (uploadSection) {
    uploadSection.style.display = "none";
  }
  if (ui.progressSection) {
    ui.progressSection.style.display = "block";
  }
  if (ui.resultsSection) {
    ui.resultsSection.style.display = "none";
  }

  setWarning("");
  updateProgress(5, `Preparing OCR for ${validFiles.length} file(s)...`);

  ocrRows = [];

  let worker;
  try {
    worker = await createOcrWorker();
    updateProgress(10, `Loading OCR language: ${selectedLanguageLabel}`);
    await worker.loadLanguage(selectedLanguage);
    await worker.initialize(selectedLanguage);
    await worker.setParameters({
      preserve_interword_spaces: "1",
      user_defined_dpi: "300"
    });

    const pageCounts = [];
    for (let i = 0; i < validFiles.length; i += 1) {
      const buffer = await validFiles[i].arrayBuffer();
      const pdf = await pdfjsLib.getDocument(buffer).promise;
      pageCounts.push(pdf.numPages);
      pdf.destroy();
    }

    const totalPages = pageCounts.reduce((sum, count) => sum + count, 0);
    let pagesDone = 0;

    for (let fileIndex = 0; fileIndex < validFiles.length; fileIndex += 1) {
      const file = validFiles[fileIndex];
      const pdfBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument(pdfBuffer).promise;

      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const canvas = await renderPageToCanvas(page);
        const progressRatio = totalPages > 0 ? pagesDone / totalPages : 0;
        updateProgress(
          20 + Math.round(progressRatio * 70),
          `OCR running: ${file.name} page ${pageNumber}/${pdf.numPages}`
        );

        const result = await worker.recognize(canvas);
        const text = result && result.data ? result.data.text || "" : "";
        const confidence = result && result.data ? Number(result.data.confidence) || 0 : 0;

        ocrRows.push({
          fileName: file.name,
          page: pageNumber,
          language: selectedLanguage,
          confidence,
          characters: text.trim().length,
          preview: textPreview(text),
          fullText: text
        });

        pagesDone += 1;
      }

      pdf.destroy();
    }

    updateResultsTable();
    updateProgress(100, "OCR completed.");

    if (ui.progressSection) {
      ui.progressSection.style.display = "none";
    }
    if (ui.resultsSection) {
      ui.resultsSection.style.display = "block";
    }

    window.dispatchEvent(
      new CustomEvent("ocr:completed", {
        detail: {
          itemCount: ocrRows.length,
          fileCount: validFiles.length
        }
      })
    );
  } catch (error) {
    setWarning(`OCR error: ${error.message}`);
    alert(`An error occurred while processing OCR: ${error.message}`);
    goBackToUpload();
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

function downloadExcel() {
  if (!Array.isArray(ocrRows) || !ocrRows.length) {
    alert("No OCR data available to download.");
    return;
  }

  const sheetRows = ocrRows.map((row) => [
    row.fileName,
    row.page,
    row.language,
    Math.round(row.confidence),
    row.characters,
    row.fullText
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([
    ["File", "Page", "Language", "Confidence", "Characters", "OCR Text"],
    ...sheetRows
  ]);

  sheet["!cols"] = [
    { wch: 32 },
    { wch: 8 },
    { wch: 14 },
    { wch: 12 },
    { wch: 12 },
    { wch: 110 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "OCR Text");
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `redcore_ocr_export_${stamp}.xlsx`);
}

function wireEvents() {
  if (!bindUi()) {
    setTimeout(wireEvents, 80);
    return;
  }

  handleAuth();
  initNavigation();
  initLanguageSelect();
  initReviews();

  ui.fileInput.addEventListener("change", (event) => {
    processFiles(event.target.files);
  });

  ui.pickFileBtn.addEventListener("click", () => ui.fileInput.click());
  ui.downloadBtn.addEventListener("click", downloadExcel);

  if (ui.backToUploadBtn) {
    ui.backToUploadBtn.addEventListener("click", goBackToUpload);
  }

  ui.uploadBox.addEventListener("dragover", (event) => {
    event.preventDefault();
    ui.uploadBox.classList.add("dragover");
  });

  ui.uploadBox.addEventListener("dragleave", () => {
    ui.uploadBox.classList.remove("dragover");
  });

  ui.uploadBox.addEventListener("drop", (event) => {
    event.preventDefault();
    ui.uploadBox.classList.remove("dragover");
    processFiles(event.dataTransfer.files);
  });
}

wireEvents();

