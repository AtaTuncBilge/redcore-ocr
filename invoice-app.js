const INVOICE_PDF_SCALE = 2.8;
const INVOICE_MAX_FILES = 5;

pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

let extractedData = [];

const ui = {
  // Auth elements
  authOverlay: null,
  usernameInput: null,
  loginBtn: null,
  appShell: null,
  userStrip: null,
  displayUsername: null,
  logoutBtn: null,

  // Invoice elements
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
  backToUploadBtn: null
};

function bindUi() {
  ui.authOverlay = document.getElementById("authOverlay");
  ui.usernameInput = document.getElementById("usernameInput");
  ui.loginBtn = document.getElementById("loginBtn");
  ui.appShell = document.getElementById("invoiceAppShell");
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

  return Boolean(
    ui.fileInput && ui.pickFileBtn && ui.uploadBox && ui.progressSection && ui.resultsSection &&
    ui.progressFill && ui.progressText && ui.resultsBody && ui.totalInvoices && ui.totalItems && ui.downloadBtn
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
  extractedData = [];
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
    .slice(0, INVOICE_MAX_FILES);
}

async function renderPageToCanvas(pdfPage) {
  const viewport = pdfPage.getViewport({ scale: INVOICE_PDF_SCALE });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d", { alpha: false });
  await pdfPage.render({ canvasContext: context, viewport }).promise;
  return canvas;
}

function displayResults() {
  if (!ui.resultsBody) {
    return;
  }

  ui.resultsBody.innerHTML = "";

  if (!Array.isArray(extractedData) || extractedData.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.className = "empty-row";
    cell.textContent = "No invoice line items were detected.";
    row.appendChild(cell);
    ui.resultsBody.appendChild(row);
    ui.totalInvoices.textContent = "0";
    ui.totalItems.textContent = "0";
    return;
  }

  const invoiceCount = new Set(extractedData.map((item) => item.invoiceNo)).size;
  ui.totalInvoices.textContent = String(invoiceCount);
  ui.totalItems.textContent = String(extractedData.length);

  extractedData.forEach((item) => {
    const row = document.createElement("tr");
    const values = [
      item.invoiceDate || "Unknown",
      item.invoiceNo || "Unknown",
      item.description || "-",
      item.quantity || "1",
      item.unitPrice || "Unknown",
      item.total || "Unknown"
    ];

    values.forEach((value, index) => {
      const cell = document.createElement("td");
      if (index === 1 || index === 5) {
        const strong = document.createElement("strong");
        strong.textContent = String(value);
        cell.appendChild(strong);
      } else {
        cell.textContent = String(value);
      }
      row.appendChild(cell);
    });

    ui.resultsBody.appendChild(row);
  });
}

async function createOcrWorker() {
  // Tesseract.js 4.x: createWorker(langs, oem, options)
  // gzip: false because local traineddata files are not gzipped
  const worker = await Tesseract.createWorker("tur+eng", 1, {
    langPath: './lang-data',
    gzip: false,
    logger: m => console.log(m)
  });
  return worker;
}

async function extractInvoiceRowsFromFile(file, worker) {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(buffer).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    updateProgress(
      20 + Math.round((pageNumber / pdf.numPages) * 65),
      `${file.name}: OCR page ${pageNumber}/${pdf.numPages}`
    );

    const page = await pdf.getPage(pageNumber);
    const canvas = await renderPageToCanvas(page);
    const result = await worker.recognize(canvas);
    pageTexts.push((result && result.data && result.data.text) || "");
  }

  pdf.destroy();

  const joinedText = pageTexts.join("\n--- SAYFA SONU ---\n");
  if (!window.OcrCore || typeof window.OcrCore.extractInvoiceDocument !== "function") {
    throw new Error("Invoice parser is not available.");
  }

  const parsed = window.OcrCore.extractInvoiceDocument(joinedText, { debug: false });
  return {
    items: Array.isArray(parsed.items) ? parsed.items : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
  };
}

async function processFiles(files) {
  const validFiles = sanitizeFiles(files);
  if (!validFiles.length) {
    alert("Please upload a valid PDF file.");
    return;
  }

  const uploadSection = document.querySelector(".upload-section");
  if (uploadSection) {
    uploadSection.style.display = "none";
  }
  ui.progressSection.style.display = "block";
  ui.resultsSection.style.display = "none";

  setWarning("");
  updateProgress(5, `Preparing invoice OCR for ${validFiles.length} file(s)...`);

  extractedData = [];
  const collectedWarnings = [];

  let worker;
  try {
    worker = await createOcrWorker();
    updateProgress(10, "OCR engine ready: Turkish + English");
    await worker.setParameters({
      preserve_interword_spaces: "1",
      user_defined_dpi: "300"
    });

    for (let index = 0; index < validFiles.length; index += 1) {
      const file = validFiles[index];
      updateProgress(15, `Processing ${index + 1}/${validFiles.length}: ${file.name}`);
      const parsed = await extractInvoiceRowsFromFile(file, worker);
      extractedData.push(...parsed.items);
      collectedWarnings.push(...parsed.warnings);
    }

    setWarning([...new Set(collectedWarnings)].join(" | "));
    displayResults();
    updateProgress(100, "Invoice OCR completed.");

    ui.progressSection.style.display = "none";
    ui.resultsSection.style.display = "block";
  } catch (error) {
    var errMsg = (error && error.message) ? error.message : String(error || "Unknown error");
    console.error("Invoice OCR Error:", error);
    setWarning("Invoice OCR error: " + errMsg);
    alert("An error occurred while processing invoices: " + errMsg);
    goBackToUpload();
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

function downloadExcel() {
  if (!Array.isArray(extractedData) || extractedData.length === 0) {
    alert("No invoice data available to download.");
    return;
  }

  const rows = extractedData.map((item) => [
    item.invoiceDate || "Unknown",
    item.invoiceNo || "Unknown",
    item.description || "-",
    Number(item.quantity) || 1,
    typeof window.OcrCore?.parseTurkishMoney === "function" ? window.OcrCore.parseTurkishMoney(item.unitPrice) : null,
    typeof window.OcrCore?.parseTurkishMoney === "function" ? window.OcrCore.parseTurkishMoney(item.total) : null
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([
    ["Invoice Date", "Invoice No", "Product Description", "Quantity", "Unit Price", "Total"],
    ...rows
  ]);

  sheet["!cols"] = [
    { wch: 16 },
    { wch: 20 },
    { wch: 58 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Invoice Items");
  const stamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `invoice_ocr_export_${stamp}.xlsx`);
}

function wireEvents() {
  if (!bindUi()) {
    setTimeout(wireEvents, 80);
    return;
  }

  handleAuth();

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

