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
                  <button class="btn btn-primary btn-block" id="loginBtn"><svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg> enter platform</button>
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
                  <span class="build-tag">v2.5</span>
                </div>
              </div>
              <nav class="site-nav" aria-label="Main navigation">
                <a href="#uploadSection" class="site-link"><svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> upload</a>
                <a href="#resultsSectionAnchor" class="site-link"><svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> results</a>
                <a href="#reviewsSection" class="site-link"><svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> reviews</a>
              </nav>
              <button class="mobile-menu-btn" id="mobileMenuBtn" aria-label="Toggle menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              </button>
              <div class="user-strip" id="userStrip" style="display:none;">
                <span id="displayUsername"></span>
                <button class="btn btn-secondary btn-compact" id="logoutBtn"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg> exit</button>
              </div>
            </header>

            <section class="hero-card panel reveal-up delay-1" id="uploadSection">
              <div class="hero-content">
                <h1>REDCORE<br>OCR<a href="./invoice-ocr.html" class="dot-link-hero" title="Invoice OCR"><span class="dot"></span></a></h1>
                <p class="subtitle">Premium universal OCR platform. Instant recognition for PDF and images with auto-language detection.</p>
                <div class="hero-stats">
                  <span>80+ languages</span>
                  <span>pdf + images</span>
                  <span>real-time simulation</span>
                </div>
              </div>
            </section>

            <main class="main-stack">
              <section class="panel upload-section reveal-up delay-2">
                <div class="upload-box" id="uploadBox">
                  <div class="upload-chip">universal ocr</div>
                  <h2><svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><polyline points="9 15 12 12 15 15"/></svg> upload files</h2>
                  <p>Drop PDF or image files. Select language or use auto-detect.</p>
                  <div class="lang-select-wrap">
                    <label for="langSelect" class="lang-label"><svg class="nav-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> language</label>
                    <select id="langSelect" class="lang-select"></select>
                  </div>
                  <input type="file" id="fileInput" accept=".pdf,image/*" multiple hidden>
                  <button class="btn btn-primary" id="pickFileBtn" type="button"><svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg> select files</button>
                </div>
              </section>

              <section class="panel progress-section" id="progressSection" style="display:none;">
                <div class="progress-top">
                  <h3><svg class="section-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> ocr processing</h3>
                  <button class="btn btn-secondary btn-compact" id="backToUploadBtn" type="button"><svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg> cancel</button>
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
                    <h2><svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg> extracted text</h2>
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
                  <button class="btn btn-success" id="downloadBtn" type="button"><svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> download excel</button>
                  <button class="btn btn-secondary" id="downloadTextBtn" type="button"><svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg> download text</button>
                </div>
              </section>

              <div class="section-divider"></div>

              <section class="panel reviews-section reveal-up" id="reviewsSection">
                <div class="results-header">
                  <div>
                    <h2><svg class="section-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> community reviews</h2>
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
                  <div class="star-rating" id="starRating">
                    <button type="button" class="star-btn" data-value="1">&#9733;</button>
                    <button type="button" class="star-btn" data-value="2">&#9733;</button>
                    <button type="button" class="star-btn" data-value="3">&#9733;</button>
                    <button type="button" class="star-btn" data-value="4">&#9733;</button>
                    <button type="button" class="star-btn" data-value="5">&#9733;</button>
                  </div>
                  <input type="text" id="newReviewText" class="auth-input" placeholder="Write a quick review...">
                  <button class="btn btn-secondary btn-compact" id="submitReviewBtn">post review</button>
                </div>
              </section>
            </main>

            <footer class="site-footer site-footer-min reveal-up delay-3">
              <div class="footer-links">
                <a href="./privacy.html" class="footer-link"><svg class="nav-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> privacy</a>
                <a href="./terms.html" class="footer-link"><svg class="nav-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg> terms</a>
                <a href="./about.html" class="footer-link"><svg class="nav-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> about</a>
                <a href="./contact.html" class="footer-link"><svg class="nav-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> contact</a>
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
