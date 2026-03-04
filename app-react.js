(function () {
  const e = React.createElement;

  function App() {
    return e("div", {
      dangerouslySetInnerHTML: {
        __html: `
          <div class="bg-grid"></div>
          <div class="bg-glow"></div>

          <!-- Auth Overlay -->
          <div class="auth-overlay" id="authOverlay">
            <div class="auth-card">
              <div class="auth-mark">
                <span class="dot"></span>
              </div>
              <div class="auth-header">
                <h2>Welcome to Redcore</h2>
                <p>Please enter your username to continue to the OCR platform.</p>
              </div>
              <div class="auth-form">
                <div class="form-group">
                  <label for="usernameInput">Username</label>
                  <input type="text" id="usernameInput" class="auth-input" placeholder="Enter your name..." autocomplete="off">
                </div>
                <div class="auth-actions">
                  <button class="btn btn-primary btn-block" id="loginBtn">enter platform</button>
                </div>
              </div>
            </div>
          </div>

          <div class="app-shell" id="appShell" style="display:none;">
            <header class="site-header panel reveal-up">
              <div class="site-brand">
                <div class="hero-mark">
                  <span class="dot"></span>
                  <span class="brand">redcore ocr</span><span class="build-tag">v2.2</span>
                </div>
              </div>
              <nav class="site-nav" aria-label="Main menu">
                <a href="#uploadSection" class="site-link">Upload</a>
                <a href="#resultsSectionAnchor" class="site-link">Results</a>
                <a href="#reviewsSection" class="site-link">Reviews</a>
              </nav>
              <div class="user-strip" id="userStrip" style="display:none;">
                <span id="displayUsername"></span>
                <button class="btn btn-secondary btn-compact" id="logoutBtn" style="border-radius: 999px; padding: 4px 10px; font-size: 0.7rem;">Exit</button>
              </div>
            </header>

            <section class="hero-card panel reveal-up delay-1" id="uploadSection">
              <div class="hero-content">
                <h1>redcore ocr<a href="./invoice-ocr.html" class="dot-link-hero" title="Secret Invoice OCR" style="text-decoration:none; margin-left:10px;"><span class="dot"></span></a></h1>
                <p class="subtitle">Advanced OCR with automatic language detection. Now supports PDF and Images.</p>
                <div class="hero-stats">
                  <span>Auto-Language</span>
                  <span>PDF + Images</span>
                  <span>Real-Time Simulation</span>
                </div>
              </div>
            </section>

            <main class="main-stack">
              <section class="panel upload-section reveal-up delay-2">
                <div class="upload-box" id="uploadBox">
                  <div class="upload-chip">UNIVERSAL OCR</div>
                  <h2>Upload Files</h2>
                  <p>Drop PDF or Image files (JPG, PNG). Language is detected automatically.</p>
                  <input type="file" id="fileInput" accept=".pdf,image/*" multiple hidden>
                  <button class="btn btn-primary" id="pickFileBtn" type="button">Select Files</button>
                </div>
              </section>

              <section class="panel progress-section" id="progressSection" style="display:none;">
                <div class="progress-top">
                  <h3>OCR Processing</h3>
                  <button class="btn btn-secondary btn-compact" id="backToUploadBtn" type="button">Cancel</button>
                </div>
                
                <!-- Simulation Container -->
                <div class="simulation-view">
                  <div class="simulation-container" id="simulationContainer">
                    <canvas id="simulationCanvas"></canvas>
                    <div id="simulationOverlay" class="simulation-overlay"></div>
                  </div>
                  <div class="simulation-meta">
                    <p class="progress-copy" id="progressText">Analyzing content...</p>
                    <div class="progress-bar">
                      <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="processing-meta">
                      <span>Detected Language: <strong id="detectedLang">Detecting...</strong></span>
                      <span>Stability: <strong id="stabilityRate">0%</strong></span>
                    </div>
                  </div>
                </div>
              </section>

              <section class="panel results-section" id="resultsSection" style="display:none;">
                <div id="resultsSectionAnchor"></div>
                <div class="results-header">
                  <div>
                    <h2>Extracted Text</h2>
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

              <section class="panel reviews-section reveal-up" id="reviewsSection">
                <div class="results-header">
                  <h2>Community Reviews</h2>
                  <p>What people are saying about Redcore OCR.</p>
                </div>
                <div class="reviews-grid">
                  <div class="review-card">
                    <div class="review-user">@ataberk</div>
                    <div class="review-stars">★★★★★</div>
                    <p>"The fastest OCR tool I've used for my research papers. 80 languages support is a life saver."</p>
                  </div>
                  <div class="review-card">
                    <div class="review-user">@dev_mira</div>
                    <div class="review-stars">★★★★★</div>
                    <p>"Clean UI and very accurate. The Excel export feature works flawlessly."</p>
                  </div>
                  <div class="review-card">
                    <div class="review-user">@red_person</div>
                    <div class="review-stars">★★★★★</div>
                    <p>"Built this for speed and accuracy. Glad everyone is finding it useful!"</p>
                  </div>
                </div>
                <div class="review-form-simple">
                  <input type="text" id="newReviewText" class="auth-input" placeholder="Write a quick review...">
                  <button class="btn btn-secondary btn-compact" id="submitReviewBtn">Post Review</button>
                </div>
              </section>
            </main>

            <footer class="site-footer panel site-footer-min reveal-up delay-3">
              <p>redcore-ocr.cloud | made by red person</p>
            </footer>
          </div>
        `
      }
    });
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));

  // Navigation and other logic will be handled in app.js
}());

