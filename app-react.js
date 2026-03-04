(function () {
  const e = React.createElement;

  function App() {
    const [navOpen, setNavOpen] = React.useState(false);

    React.useEffect(function () {
      var btn = document.getElementById('mobileMenuBtn');
      if (!btn) return;
      function toggle() {
        var nav = document.querySelector('.site-nav');
        if (!nav) return;
        var isOpen = nav.classList.toggle('nav-open');
        // Update icon
        btn.innerHTML = isOpen
          ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>'
          : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>';
      }
      btn.addEventListener('click', toggle);
      return function () { btn.removeEventListener('click', toggle); };
    }, []);

    return e("div", {
      dangerouslySetInnerHTML: {
        __html: `
          <!-- Multi-Layer Background System -->
          <div class="bg-base-gradient"></div>
          <div class="bg-noise"></div>
          <div class="bg-blob-container">
            <div class="bg-blob bg-blob--primary"></div>
            <div class="bg-blob bg-blob--secondary"></div>
            <div class="bg-blob bg-blob--tertiary"></div>
            <div class="bg-blob bg-blob--bottom"></div>
          </div>
          <div class="bg-grid"></div>

          <!-- Auth Overlay -->
          <div class="auth-overlay" id="authOverlay">
            <div class="auth-card">
              <div class="auth-mark">
                <span class="dot"></span>
              </div>
              <div class="auth-header">
                <h2>Welcome to Redcore</h2>
                <p>Enter your username to access the OCR platform.</p>
              </div>
              <div class="auth-form">
                <div class="form-group">
                  <label for="usernameInput">username</label>
                  <input type="text" id="usernameInput" class="auth-input" placeholder="Enter your name..." autocomplete="off">
                </div>
                <div class="auth-actions">
                  <button class="btn btn-primary btn-block" id="loginBtn">enter platform</button>
                </div>
              </div>
            </div>
          </div>

          <div class="app-shell" id="appShell" style="display:none;">
            <header class="site-header reveal-up">
              <div class="site-brand">
                <div class="hero-mark">
                  <span class="dot"></span>
                  <span class="brand">redcore-ocr</span>
                  <span class="build-tag">v2.4</span>
                </div>
              </div>
              <nav class="site-nav" aria-label="Main navigation">
                <a href="#uploadSection" class="site-link">upload</a>
                <a href="#resultsSectionAnchor" class="site-link">results</a>
                <a href="#reviewsSection" class="site-link">reviews</a>
              </nav>
              <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div class="user-strip" id="userStrip" style="display:none;">
                <span id="displayUsername"></span>
                <button class="btn btn-secondary btn-compact" id="logoutBtn">exit</button>
              </div>
            </header>

            <section class="hero-card panel reveal-up delay-1" id="uploadSection">
              <div class="hero-content">
                <h1>REDCORE<br>OCR<a href="./invoice-ocr.html" class="dot-link-hero" title="Invoice OCR"><span class="dot"></span></a></h1>
                <p class="subtitle">Premium universal OCR platform. Instant recognition for PDF and images with auto-language detection.</p>
                <div class="hero-stats">
                  <span>auto-language</span>
                  <span>pdf + images</span>
                  <span>real-time simulation</span>
                </div>
              </div>
            </section>

            <main class="main-stack">
              <section class="panel upload-section reveal-up delay-2">
                <div class="upload-box" id="uploadBox">
                  <div class="upload-chip">universal ocr</div>
                  <h2>upload files</h2>
                  <p>Drop PDF or image files. Language detected automatically.</p>
                  <input type="file" id="fileInput" accept=".pdf,image/*" multiple hidden>
                  <button class="btn btn-primary" id="pickFileBtn" type="button">select files</button>
                </div>
              </section>

              <section class="panel progress-section" id="progressSection" style="display:none;">
                <div class="progress-top">
                  <h3>ocr processing</h3>
                  <button class="btn btn-secondary btn-compact" id="backToUploadBtn" type="button">cancel</button>
                </div>

                <div class="simulation-view">
                  <div class="simulation-container" id="simulationContainer">
                    <canvas id="simulationCanvas"></canvas>
                    <div id="simulationOverlay" class="simulation-overlay"></div>
                  </div>
                  <div class="simulation-footer">
                    <div class="progress-bar">
                      <div class="progress-fill" id="progressFill"></div>
                    </div>
                    <div class="simulation-data-grid">
                      <div class="sim-stat">
                        <label>status</label>
                        <span id="progressText">analyzing...</span>
                      </div>
                      <div class="sim-stat">
                        <label>language</label>
                        <span id="detectedLang">detecting...</span>
                      </div>
                      <div class="sim-stat">
                        <label>stability</label>
                        <span id="stabilityRate">0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section class="panel results-section" id="resultsSection" style="display:none;">
                <div id="resultsSectionAnchor"></div>
                <div class="results-header">
                  <div>
                    <h2>extracted text</h2>
                    <p>Recognized pages listed below. Download as Excel.</p>
                  </div>
                  <div class="stats">
                    <div class="stat-pill"><span id="totalInvoices">0</span> files</div>
                    <div class="stat-pill"><span id="totalItems">0</span> pages</div>
                  </div>
                </div>

                <div id="warningBox" class="warning-box" style="display:none;"></div>
                <div class="table-wrap">
                  <table id="resultsTable">
                    <thead>
                      <tr>
                        <th>file</th>
                        <th>page</th>
                        <th>language</th>
                        <th>confidence</th>
                        <th>characters</th>
                        <th>text preview</th>
                      </tr>
                    </thead>
                    <tbody id="resultsBody"></tbody>
                  </table>
                </div>

                <div class="actions">
                  <button class="btn btn-success" id="downloadBtn" type="button">download excel</button>
                </div>
              </section>

              <div class="section-divider"></div>

              <section class="panel reviews-section reveal-up" id="reviewsSection">
                <div class="results-header">
                  <div>
                    <h2>community reviews</h2>
                    <p>What people are saying about Redcore OCR.</p>
                  </div>
                </div>
                <div class="reviews-grid">
                  <div class="review-card">
                    <div class="review-user">@ataberk</div>
                    <div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p>"The fastest OCR tool I've used for my research papers. 80 languages support is a life saver."</p>
                  </div>
                  <div class="review-card">
                    <div class="review-user">@dev_mira</div>
                    <div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p>"Clean UI and very accurate. The Excel export feature works flawlessly."</p>
                  </div>
                  <div class="review-card">
                    <div class="review-user">@red_person</div>
                    <div class="review-stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
                    <p>"Built this for speed and accuracy. Glad everyone is finding it useful!"</p>
                  </div>
                </div>
                <div class="review-form-simple">
                  <input type="text" id="newReviewText" class="auth-input" placeholder="Write a quick review...">
                  <button class="btn btn-secondary btn-compact" id="submitReviewBtn">post review</button>
                </div>
              </section>
            </main>

            <footer class="site-footer site-footer-min reveal-up delay-3">
              <div class="footer-links">
                <a href="./privacy.html" class="footer-link">privacy</a>
                <a href="./terms.html" class="footer-link">terms</a>
                <a href="./about.html" class="footer-link">about</a>
                <a href="./contact.html" class="footer-link">contact</a>
              </div>
              <p>redcore-ocr.cloud &mdash; made by red person</p>
            </footer>
          </div>
        `
      }
    });
  }

  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(e(App));
}());
