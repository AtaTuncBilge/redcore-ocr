(function () {
  const e = React.createElement;

  function App() {
    return e("div", {
      dangerouslySetInnerHTML: {
        __html: `
          <div class="bg-grid"></div>
          <div class="bg-glow"></div>

          <div class="app-shell" id="appShell">
            <header class="site-header panel reveal-up">
              <div class="site-brand">
                <div class="hero-mark">
                  <a class="dot-link" href="./invoice-ocr.html" title="Invoice OCR easter egg" aria-label="Go to Invoice OCR">
                    <span class="dot"></span>
                  </a>
                  <span class="brand">RED CORE OCR</span><span class="build-tag">build alpha</span>
                </div>
              </div>
              <nav class="site-nav" aria-label="Main menu">
                <a href="#uploadSection" class="site-link">Upload</a>
                <a href="#resultsSectionAnchor" class="site-link">Results</a>
              </nav>
            </header>

            <section class="hero-card panel reveal-up delay-1" id="uploadSection">
              <div class="hero-content">
                <h1>PDF OCR Reader</h1>
                <p class="subtitle">Run normal OCR on your PDFs and export the recognized text in seconds.</p>
                <div class="hero-stats">
                  <span>Real-Time OCR</span>
                  <span>80 Language Support</span>
                  <span>redcore-ocr made by red person</span>
                </div>
              </div>
            </section>

            <main class="main-stack">
              <section class="panel upload-section reveal-up delay-2">
                <div class="upload-box" id="uploadBox">
                  <div class="upload-chip">PDF + OCR</div>
                  <h2>Upload PDF</h2>
                  <p>Drop or select your PDF files. The system performs full-text OCR page by page.</p>
                  <input type="file" id="fileInput" accept=".pdf" multiple hidden>
                  <div class="language-control">
                    <label for="ocrLanguageSelect">OCR Language</label>
                    <select id="ocrLanguageSelect" class="auth-input" aria-label="OCR language"></select>
                  </div>
                  <button class="btn btn-primary" id="pickFileBtn" type="button">Select PDF</button>
                </div>
              </section>

              <section class="panel progress-section" id="progressSection" style="display:none;">
                <div class="progress-top">
                  <h3>OCR Processing</h3>
                  <button class="btn btn-secondary btn-compact" id="backToUploadBtn" type="button">Go Back</button>
                </div>
                <p class="progress-copy" id="progressText">Preparing...</p>
                <div class="progress-bar">
                  <div class="progress-fill" id="progressFill"></div>
                </div>
                <div class="processing-meta">
                  <span>Stability Rate</span>
                  <strong id="stabilityRate">0%</strong>
                </div>
              </section>

              <section class="panel results-section" id="resultsSection" style="display:none;">
                <div id="resultsSectionAnchor"></div>
                <div class="results-header">
                  <div>
                    <h2>Extracted OCR Text</h2>
                    <p>Recognized pages are listed below and can be downloaded as Excel.</p>
                  </div>
                  <div class="stats">
                    <div class="stat-pill"><span id="totalInvoices">0</span> Files</div>
                    <div class="stat-pill"><span id="totalItems">0</span> Pages</div>
                  </div>
                </div>

                <div id="warningBox" class="warning-box" style="display:none;"></div>
                <div class="table-wrap">
                  <table id="resultsTable">
                    <thead>
                      <tr>
                        <th>File</th>
                        <th>Page</th>
                        <th>Language</th>
                        <th>Confidence</th>
                        <th>Characters</th>
                        <th>Text Preview</th>
                      </tr>
                    </thead>
                    <tbody id="resultsBody"></tbody>
                  </table>
                </div>

                <div class="actions">
                  <button class="btn btn-success" id="downloadBtn" type="button">Download Excel</button>
                </div>
              </section>
            </main>

            <footer class="site-footer panel site-footer-min reveal-up delay-3">
              <p>redcore-ocr made by red person</p>
            </footer>
          </div>
        `
      }
    });
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));

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
}());
