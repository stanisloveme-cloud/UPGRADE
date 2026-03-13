(function() {
    // Tilda Integration Script for UPGRADE CRM v2.0
    // Pixel-Perfect implementation based on Bootstrap 5

    const STYLES = `
      #crm-schedule-root {
        max-width: 1200px;
        margin: 0 auto;
        padding: 20px;
        font-family: inherit;
        color: #212529;
      }

      #crm-schedule-root .v-hall {
        writing-mode: vertical-rl;
        transform: rotate(180deg);
      }

      #crm-schedule-root #prog-left-side {
        scrollbar-width: thin;
        scrollbar-color: #c5c5c5 #dfe9eb;
      }
      #crm-schedule-root #prog-left-side::-webkit-scrollbar {
        width: 4px;
      }
      #crm-schedule-root #prog-left-side::-webkit-scrollbar-track {
        border-radius: 5px;
        background-color: #dfe9eb;
      }
      #crm-schedule-root #prog-left-side::-webkit-scrollbar-thumb {
        background-color: #c5c5c5;
        border-radius: 5px;
      }

      #crm-schedule-root .bg-sidebar {
        background-color: #f8f9fa !important;
      }

      #crm-schedule-root a.prog-day-link {
        color: #0d6efd;
        text-decoration: none;
      }
      #crm-schedule-root a.prog-day-link.active {
        font-weight: bold;
        color: #000;
      }

      #crm-schedule-root .program-block-hilite {
        box-shadow: 0 0 15px rgba(13,110,253,0.5);
        transition: box-shadow 0.3s ease;
      }

      #crm-schedule-root .speaker-avatar {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        object-fit: cover;
        filter: grayscale(100%);
        box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      }
      
      #crm-schedule-root .sponsor-logo {
        max-height: 40px;
        max-width: 120px;
        object-fit: contain;
      }
    `;

    function injectDependencies() {
        if (!document.getElementById('bootstrap-css')) {
            const bsCss = document.createElement('link');
            bsCss.id = 'bootstrap-css';
            bsCss.rel = 'stylesheet';
            bsCss.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
            document.head.appendChild(bsCss);
        }

        if (!document.getElementById('crm-schedule-styles')) {
            const style = document.createElement('style');
            style.id = 'crm-schedule-styles';
            style.innerHTML = STYLES;
            document.head.appendChild(style);
        }
    }

    const scriptUrl = document.currentScript ? document.currentScript.src : '';
    let isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    let BASE_URL = 'https://devupgrade.space4you.ru';

    if (isLocal && scriptUrl.includes('localhost:5173')) {
        BASE_URL = 'https://devupgrade.space4you.ru';
    }

    async function loadSchedule(root) {
      const rootEventId = root.getAttribute('data-event-id');
      const EVENT_ID = rootEventId || window.crmEventId || 1; 
      
      const API_URL = `${BASE_URL}/api/public/events/${EVENT_ID}/website-data`;
      
      root.innerHTML = '<div class="text-center text-muted p-5">Загрузка программы...</div>';

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
        const data = await response.json();
        renderSchedule(root, data);
      } catch (error) {
        console.error('Error loading CRM schedule:', error);
        root.innerHTML = '<div class="text-center text-danger p-4">Не удалось загрузить расписание.</div>';
      }
    }

    function formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      }
      return dateString;
    }
    
    function extractDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      }
      return '';
    }

    function renderSchedule(root, data) {
      let sessions = [];
      
      if (data.halls && Array.isArray(data.halls)) {
        data.halls.forEach(hall => {
          if (hall.tracks && Array.isArray(hall.tracks)) {
            hall.tracks.forEach(track => {
              if (track.sessions && Array.isArray(track.sessions)) {
                const trackSessions = track.sessions.map(s => Object.assign({}, s, { hallName: hall.name, trackName: track.name }));
                sessions = sessions.concat(trackSessions);
              }
            });
          }
        });
      } else if (Array.isArray(data)) {
        data.forEach(hall => {
          if (hall.tracks && Array.isArray(hall.tracks)) {
            hall.tracks.forEach(track => {
              if (track.sessions && Array.isArray(track.sessions)) {
                const trackSessions = track.sessions.map(s => Object.assign({}, s, { hallName: hall.name, trackName: track.name }));
                sessions = sessions.concat(trackSessions);
              }
            });
          }
        });
      } else if (data.sessions && Array.isArray(data.sessions)) {
        sessions = data.sessions;
      }

      if (!sessions || sessions.length === 0) {
        root.innerHTML = '<div class="text-center p-5 fs-5">Программа в стадии формирования...</div>';
        return;
      }

      sessions.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      const sessionsByDate = {};
      sessions.forEach(s => {
          const dateStr = extractDate(s.startTime);
          if (dateStr) {
              if (!sessionsByDate[dateStr]) sessionsByDate[dateStr] = [];
              sessionsByDate[dateStr].push(s);
          }
      });
      
      const uniqueDates = Object.keys(sessionsByDate);

      let html = `
        <div class="container small px-0">
          <div class="row gx-1">
            <!-- Left Sidebar -->
            <div class="col-3 col-lg-2 fs-6 pb-2" style="z-index: 100;">
              <div id="prog-left-side" class="sticky-top bg-sidebar p-3 rounded-2 shadow-sm d-none d-md-block" style="top:90px; max-height: 80vh; overflow-y: auto;">
                <ul class="nav flex-column mb-auto">
      `;

      uniqueDates.forEach((date, i) => {
          html += `
            <li class="nav-item">
              <a href="#link-date-${i}" class="nav-link prog-day-link px-0 py-2 ${i === 0 ? 'active' : ''}">
                ${date}
              </a>
            </li>
          `;
      });
      
      html += `
                </ul>
              </div>
            </div>
            
            <!-- Main Content Area -->
            <div class="col-9 col-lg-10 pt-3">
              <div class="row align-items-start">
      `;

      uniqueDates.forEach((date, i) => {
          html += `<div id="link-date-${i}" class="w-100" style="scroll-margin-top: 90px;"></div>`;
          
          sessionsByDate[date].forEach(session => {
              const startTime = formatTime(session.startTime);
              const endTime = formatTime(session.endTime);
              const timeRange = startTime && endTime ? `${startTime} — ${endTime}` : startTime;

              const moderators = (session.speakers || []).filter(s => s.role === 'Организатор' || s.isModerator);
              const speakers = (session.speakers || []).filter(s => s.role !== 'Организатор' && !s.isModerator);
              const sponsors = session.sponsors || [];
              
              const blockId = `block-${session.id || Math.random().toString(36).substr(2, 9)}`;

              html += `
                <!-- Session Tile -->
                <div class="bg-body-tertiary col-12 col-lg mx-2 p-2 rounded-3 position-relative mb-3 shadow-sm" id="${blockId}">
                  
                  <!-- Session Link Wrapper -->
                  <a href="#${blockId}" class="stretched-link d-lg-none"></a>
                  
                  <div class="row shadow-sm mx-1 my-2 bg-body rounded-2 pb-0 pt-0 text-decoration-none text-dark d-flex overflow-hidden border">
                    
                    ${session.hallName ? `
                    <div class="col-1 p-0 m-0 border-end border-3 border-danger bg-danger bg-opacity-10 d-flex flex-column justify-content-center align-items-center">
                      <span class="v-hall fw-bold fs-6 text-danger py-2">${session.hallName}</span>
                    </div>
                    ` : ''}
                    
                    <div class="col py-2">
                       <div class="row">
                          <div class="col-12 col-lg-3 fw-bold fs-5 text-lg-end border-end pb-2 mb-2 pb-lg-0 mb-lg-0 border-sm-0 border-sm-bottom">
                            ${timeRange}
                          </div>
                          <div class="col-12 col-lg-9">
                            <span class="fw-bold fs-5">${session.title || session.name || ''}</span>
                            
                            <!-- Detailed Content (Visible on Desktop or Expandable) -->
                            <div class="mt-3">
                              ${session.description ? `<p class="text-muted small">${session.description}</p>` : ''}
                              
                              <!-- Sponsors -->
                              ${sponsors.length > 0 ? `
                                <div class="mb-3">
                                  <div class="d-flex flex-wrap gap-2">
                                    ${sponsors.map(sp => sp.logoFileUrl 
                                        ? `<img src="${BASE_URL}${sp.logoFileUrl}" alt="${sp.name}" class="sponsor-logo shadow-sm border rounded px-2 bg-white" onerror="this.src='${sp.logoFileUrl}'"/>` 
                                        : `<span class="badge bg-light text-dark border">${sp.name}</span>`
                                    ).join('')}
                                  </div>
                                </div>
                              ` : ''}
                              
                              <div class="row mt-3">
                                <!-- Moderators -->
                                ${moderators.length > 0 ? `
                                  <div class="col-12 col-md-6 mb-3">
                                    <div class="text-secondary small fw-bold text-uppercase mb-2">Модераторы</div>
                                    ${moderators.map(mod => {
                                      const sp = mod.speaker || mod;
                                      const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : `${BASE_URL}${sp.photoUrl}`) : '';
                                      return `
                                        <div class="d-flex align-items-center mb-2">
                                          ${photoUrl ? `<img src="${photoUrl}" class="speaker-avatar me-2" />` : ''}
                                          <div>
                                            <div class="fw-bold lh-sm">${sp.name || (sp.firstName + ' ' + sp.lastName)}</div>
                                            ${(sp.company || sp.position || sp.role) ? `
                                              <div class="small text-muted lh-1 mt-1">${sp.position || sp.role || ''} ${sp.company ? '<br/>' + sp.company : ''}</div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      `;
                                    }).join('')}
                                  </div>
                                ` : ''}
                                
                                <!-- Speakers -->
                                ${speakers.length > 0 ? `
                                  <div class="col-12 col-md-6 mb-3">
                                    <div class="text-secondary small fw-bold text-uppercase mb-2">Спикеры</div>
                                      ${speakers.map(s => {
                                      const sp = s.speaker || s;
                                      const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : `${BASE_URL}${sp.photoUrl}`) : '';
                                      return `
                                        <div class="d-flex align-items-center mb-2">
                                          ${photoUrl ? `<img src="${photoUrl}" class="speaker-avatar me-2" />` : ''}
                                          <div>
                                            <div class="fw-bold lh-sm">${sp.name || (sp.firstName + ' ' + sp.lastName)}</div>
                                            ${(sp.company || sp.position || sp.role) ? `
                                              <div class="small text-muted lh-1 mt-1">${sp.position || sp.role || ''} ${sp.company ? '<br/>' + sp.company : ''}</div>
                                            ` : ''}
                                          </div>
                                        </div>
                                      `;
                                    }).join('')}
                                  </div>
                                ` : ''}
                              </div>
                            </div>
                            
                          </div>
                       </div>
                    </div>
                  </div>
                </div>
              `;
          });
      });

      html += `
              </div>
            </div>
          </div>
        </div>
      `;

      root.innerHTML = html;
      
      const links = root.querySelectorAll('.prog-day-link');
      links.forEach(link => {
          link.addEventListener('click', function(e) {
              e.preventDefault();
              const targetId = this.getAttribute('href').substring(1);
              const targetEl = document.getElementById(targetId);
              if (targetEl) {
                  window.scrollTo({
                      top: targetEl.offsetTop - 100,
                      behavior: 'smooth'
                  });
              }
              links.forEach(l => l.classList.remove('active'));
              this.classList.add('active');
          });
      });
    }

    window.initUpgradeCrmWidget = function() {
        injectDependencies();
        const rootElements = document.querySelectorAll('#crm-schedule-root');
        rootElements.forEach(root => {
            loadSchedule(root);
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', window.initUpgradeCrmWidget);
    } else {
      window.initUpgradeCrmWidget();
    }
})();
