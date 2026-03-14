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
        border-radius: 5px;
        background-color: #c5c5c5;
      }
      
      #crm-schedule-root .date-badge-text { color: #000000 !important; }
      #crm-schedule-root .date-badge-border { border-color: #999999 !important; }
      #crm-schedule-root .bg-sidebar { background-color: #efefef; }
      #crm-schedule-root #prog-left-side {
        height: calc(100vh - 0px);
        top: 0px;
      }
      #crm-schedule-root .to-scroll {
        scroll-margin-top: calc(50px + 0px);
        transition: background-color 1s ease-out;
      }
      #crm-schedule-root .program-block-hilite { background-color: #fcfaf5; }
      
      #crm-schedule-root .speaker-avatar {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
        filter: grayscale(100%);
      }
      #crm-schedule-root .sponsor-logo {
        max-height: 40px;
        max-width: 120px;
        object-fit: contain;
      }
    `;

    function injectDependencies() {
        // Подключаем Bootstrap 5 CSS, если его нет
        if (!document.getElementById('crm-bootstrap-css') && !document.querySelector('link[href*="bootstrap"]')) {
            const link = document.createElement('link');
            link.id = 'crm-bootstrap-css';
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css';
            document.head.appendChild(link);
        }

        // Кастомные патчи
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
      const EVENT_ID = root.getAttribute('data-event-id') || window.crmEventId || 1; 
      const API_URL = `${BASE_URL}/api/public/events/${EVENT_ID}/website-data`;
      
      root.innerHTML = '<div class="d-flex justify-content-center my-5"><div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Загрузка...</span></div></div>';

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
        const data = await response.json();
        renderSchedule(root, data);
      } catch (error) {
        console.error('Error loading CRM schedule:', error);
        root.innerHTML = '<div class="alert alert-danger" role="alert">Не удалось загрузить расписание.</div>';
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

    function renderSchedule(root, data) {
      let sessions = [];
      
      if (data.halls && Array.isArray(data.halls)) {
        data.halls.forEach(hall => {
          if (hall.tracks && Array.isArray(hall.tracks)) {
            hall.tracks.forEach(track => {
              if (track.sessions && Array.isArray(track.sessions)) {
                const trackSessions = track.sessions.map(s => Object.assign({}, s, { hallId: hall.id, hallName: hall.name, trackName: track.name }));
                sessions = sessions.concat(trackSessions);
              }
            });
          }
        });
      }

      if (!sessions || sessions.length === 0) {
        root.innerHTML = '<div class="text-center py-5 fs-4 text-muted">Программа формируется...</div>';
        return;
      }

      sessions.sort((a, b) => {
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;
        return a.startTime.localeCompare(b.startTime);
      });

      // Группировка
      let datesMap = {}; // { 'YYYY-MM-DD': { halls: { 'HallName': [sessions] }, tracks: [...] } }
      
      sessions.forEach(session => {
          const dateObj = session.startTime ? new Date(session.startTime) : new Date();
          const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }); // "21 октября"
          
          if (!datesMap[dateStr]) {
              datesMap[dateStr] = { halls: {}, uniqueTracks: [] };
          }
          
          const hallName = session.hallName || 'Главный зал';
          if (!datesMap[dateStr].halls[hallName]) {
              datesMap[dateStr].halls[hallName] = [];
          }
          datesMap[dateStr].halls[hallName].push(session);
          
          if (session.trackName && !datesMap[dateStr].uniqueTracks.find(t => t.name === session.trackName)) {
              datesMap[dateStr].uniqueTracks.push({
                  name: session.trackName,
                  id: 'track-' + Math.random().toString(36).substr(2, 9)
              });
          }
      });

      let html = '<div class="container small" id="start-program"><div class="row">';

      // 1. ЛЕВЫЙ САЙДБАР (Sticky)
      html += `
        <div class="d-none d-lg-block col-3 sticky-top bg-sidebar overflow-y-auto pt-3 me-5" id="prog-left-side">
      `;
      Object.keys(datesMap).forEach((dateStr, dIdx) => {
          const dateId = 'date-' + dIdx;
          html += `
            <div class="mb-2">
                <a class="fw-bold lead text-decoration-none date-badge-text" href="#${dateId}">${dateStr}</a>
            </div>
            <ul class="list-unstyled mb-4">
          `;
          datesMap[dateStr].uniqueTracks.forEach(track => {
              html += `<li class="mb-2 fs-6"><a href="#${track.id}" class="text-decoration-none text-black">${track.name}</a></li>`;
          });
          html += `</ul>`;
      });
      html += `</div>`; // Конец сайдбара

      // 2. ОСНОВНОЙ КОНТЕНТ
      html += `<div class="col">`;
      
      // Шапка с датами (горизонтальная)
      html += `<div class="row overflow-hidden mb-2 mt-2"><div class="col text-nowrap">`;
      Object.keys(datesMap).forEach((dateStr, dIdx) => {
          if (dIdx > 0) html += `<span class="mx-3 lead">|</span>`;
          html += `<span class="${dIdx === 0 ? 'display-2' : 'lead'} date-badge-text"><a class="text-decoration-none text-dark" href="#date-${dIdx}">${dateStr}</a></span>`;
      });
      html += `</div></div>`;

      // Расписание по датам
      Object.keys(datesMap).forEach((dateStr, dIdx) => {
          html += `<div class="row my-4" id="date-${dIdx}"><div class="col">`;
          
          const hallsMap = datesMap[dateStr].halls;
          Object.keys(hallsMap).forEach(hallName => {
              const hallSessions = hallsMap[hallName];
              
              // Начинаем вывод зала
              html += `
                <div class="row mb-5">
                    <div class="v-hall col-auto p-0 border-start border-2 date-badge-border mb-3">
                        <h6 class="ps-1 m-0 text-end text-body-tertiary">Зал "${hallName}"</h6>
                    </div>
                    <div class="col">
              `;
              
              // Группировка сессий по трекам внутри зала для отображения заголовка трека
              const trackGroups = {};
              hallSessions.forEach(s => {
                 const tName = s.trackName || 'Без трека';
                 if (!trackGroups[tName]) trackGroups[tName] = [];
                 trackGroups[tName].push(s);
              });

              Object.keys(trackGroups).forEach(tName => {
                  const tSessions = trackGroups[tName];
                  const trackConfObj = datesMap[dateStr].uniqueTracks.find(t => t.name === tName) || { id: 'no-track' };
                  
                  // Заголовок трека над сессиями
                  if (tName !== 'Без трека') {
                      html += `
                        <div class="row gx-2 mb-3 mt-4 to-scroll" id="${trackConfObj.id}">
                            <div class="col h5 py-1 position-relative date-badge-text lh-base">
                                ${tName}
                            </div>
                        </div>
                      `;
                  }

                  // Выводим серые плашки сессий (Tile View)
                  html += `<div class="row g-2 g-md-3 mb-4">`;
                  tSessions.forEach(session => {
                      const startTime = formatTime(session.startTime);
                      const endTime = formatTime(session.endTime);
                      
                      html += `
                        <div class="bg-body-tertiary col-12 col-lg mx-1 p-3 rounded-3 position-relative to-scroll">
                            <a class="stretched-link" href="#session-${session.id}"></a>
                            <div class="fw-bold small mb-2">${startTime} — ${endTime}</div>
                            <div class="small lh-sm">${session.name || session.title}</div>
                        </div>
                      `;
                  });
                  html += `</div>`; // Конец плашек
              });
              
              html += `</div></div>`; // Конец зала (div.col и div.row)
          });

          // Теперь выводим ПОЛНЫЕ детали каждой сессии под сеткой залов
          html += `<div class="row mt-5"><div class="col">`;
          
          const flatDateSessions = [];
          Object.values(hallsMap).forEach(hs => flatDateSessions.push(...hs));
          
          // Сортировка детальных сессий хронологически
          flatDateSessions.sort((a, b) => {
              if (!a.startTime) return 1; if (!b.startTime) return -1;
              return a.startTime.localeCompare(b.startTime);
          });

          flatDateSessions.forEach(session => {
              const startTime = formatTime(session.startTime);
              const endTime = formatTime(session.endTime);
              const moderators = (session.speakers || []).filter(s => s.role === 'Организатор' || s.isModerator);
              const speakers = (session.speakers || []).filter(s => s.role !== 'Организатор' && !s.isModerator);
              const sponsors = session.sponsors || [];

              html += `
                <div class="to-scroll mb-5" id="session-${session.id}">
                    <h4 class="mt-1 date-badge-text lh-base">${session.name || session.title}</h4>
                    <h6 class="text-body-tertiary mb-3">Зал "${session.hallName || 'Главный'}"</h6>
                    
                    <div class="row border-top date-badge-border pt-4 mb-3">
                        <div class="col-12 col-lg-auto text-lg-end text-nowrap mb-3" style="min-width: 150px;">
                            <h6 class="fw-bold fs-5">${startTime} &nbsp;—&nbsp;${endTime}</h6>
                        </div>
                        
                        <div class="col-12 col-lg pe-lg-5">
                            ${session.description ? `<div class="mb-4 lh-sm">${session.description}</div>` : ''}
                            
                            ${sponsors.length > 0 ? `
                                <div class="mb-4">
                                    <div class="small text-muted mb-2 text-uppercase">Партнеры сессии:</div>
                                    <div class="d-flex flex-wrap gap-3 align-items-center">
                                    ${sponsors.map(sp => sp.logoFileUrl 
                                        ? `<img src="${BASE_URL}${sp.logoFileUrl}" class="sponsor-logo" onerror="this.src='${sp.logoFileUrl}'"/>` 
                                        : `<span class="badge border text-body-tertiary">${sp.name}</span>`
                                    ).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="col-12 col-lg-4">
              `;

              if (moderators.length > 0) {
                  html += `<div class="fw-light fs-6 mb-3 text-muted">Модераторы:</div><div class="row row-cols-1 mb-4">`;
                  moderators.forEach(mod => {
                      const sp = mod.speaker || mod;
                      const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : `${BASE_URL}${sp.photoUrl}`) : '';
                      html += `
                        <div class="col d-flex mb-3">
                            ${photoUrl ? `<img src="${photoUrl}" class="speaker-avatar me-3 shadow-sm" />` : ''}
                            <div class="lh-sm">
                                <span class="fw-bold">${sp.name || (sp.firstName + ' ' + sp.lastName)}, </span>
                                <span class="small">${sp.company || sp.position || sp.role || ''}</span>
                            </div>
                        </div>
                      `;
                  });
                  html += `</div>`;
              }

              if (speakers.length > 0) {
                  html += `<div class="fw-light fs-6 mb-3 text-muted">Спикеры:</div><div class="row row-cols-1 mb-2">`;
                  speakers.forEach(s => {
                      const sp = s.speaker || s;
                      const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : `${BASE_URL}${sp.photoUrl}`) : '';
                      html += `
                        <div class="col d-flex mb-3">
                            ${photoUrl ? `<img src="${photoUrl}" class="speaker-avatar me-3 shadow-sm" />` : ''}
                            <div class="lh-sm">
                                <span class="fw-bold">${sp.name || (sp.firstName + ' ' + sp.lastName)}, </span>
                                <span class="small">${sp.company || sp.position || sp.role || ''}</span>
                            </div>
                        </div>
                      `;
                  });
                  html += `</div>`;
              }

              html += `</div></div></div>`; // End details, row, session container
          });

          html += `</div></div>`; // End date col, row
      });

      html += `</div></div></div>`; // End main col, row, container

      root.innerHTML = html;
      
      // Инициализация тултипов и скроллинга (если Tilda/браузер поддерживает)
      setTimeout(() => {
          document.querySelectorAll('#crm-schedule-root a[href^="#"]').forEach(anchor => {
              anchor.addEventListener('click', function (e) {
                  e.preventDefault();
                  const targetId = this.getAttribute('href');
                  if(targetId === '#') return;
                  const target = document.querySelector(targetId);
                  if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                      target.classList.add('program-block-hilite');
                      setTimeout(() => target.classList.remove('program-block-hilite'), 2000);
                  }
              });
          });
      }, 500);
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
