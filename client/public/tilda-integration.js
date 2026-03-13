(function() {
    // Tilda Integration Script for UPGRADE CRM v1.0.1
    // Retrieves schedule and speakers data and renders it cleanly.

    const STYLES = `
      /* Кастомные стили, специфичные для нашей интеграции (изолированные) */
      #crm-schedule-root {
        max-width: 1200px; margin: 0 auto; padding: 20px; font-family: Montserrat, sans-serif;
        color: rgb(33, 37, 41);
      }
      #crm-schedule-root * {
        box-sizing: border-box;
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
        max-height: 45px;
        max-width: 140px;
        object-fit: contain;
      }
      #crm-schedule-root .session-title {
        font-weight: 500;
        font-size: 1.15rem;
        color: rgb(33, 37, 41);
        line-height: 1.3;
        margin-top: 0;
        margin-bottom: 1rem;
        font-family: Montserrat, sans-serif;
      }
      #crm-schedule-root .time-col h5 {
        font-weight: 700; color: rgb(33, 37, 41); margin: 0; font-family: Montserrat, sans-serif;
        font-size: 1.15rem;
      }
      #crm-schedule-root .crm-border-top {
        border-top: 1px solid rgb(174, 175, 255) !important;
      }
      
      /* Flexbox Grid (без Bootstrap) */
      #crm-schedule-root .crm-row {
        display: flex;
        flex-wrap: wrap;
        margin-right: -15px;
        margin-left: -15px;
      }
      #crm-schedule-root .crm-col {
        position: relative;
        width: 100%;
        padding-right: 15px;
        padding-left: 15px;
      }
      @media (min-width: 992px) {
        #crm-schedule-root .crm-col-lg-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
        #crm-schedule-root .crm-col-lg-6 { flex: 0 0 50%; max-width: 50%; }
        #crm-schedule-root .crm-col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
        #crm-schedule-root .crm-text-lg-end { text-align: right !important; }
      }
      
      #crm-schedule-root .d-flex { display: flex !important; }
      #crm-schedule-root .align-items-center { align-items: center !important; }
      #crm-schedule-root .flex-wrap { flex-wrap: wrap !important; }
      #crm-schedule-root .gap-3 { gap: 1rem !important; }
      #crm-schedule-root .me-3 { margin-right: 1rem !important; }
      #crm-schedule-root .mb-2 { margin-bottom: 0.5rem !important; }
      #crm-schedule-root .mb-3 { margin-bottom: 1rem !important; }
      #crm-schedule-root .mb-4 { margin-bottom: 1.5rem !important; }
      #crm-schedule-root .mt-3 { margin-top: 1rem !important; }
      #crm-schedule-root .mt-4 { margin-top: 1.5rem !important; }
      #crm-schedule-root .pt-3 { padding-top: 1rem !important; }
      #crm-schedule-root .pt-4 { padding-top: 1.5rem !important; }
      #crm-schedule-root .text-muted { color: #6c757d !important; }
      #crm-schedule-root .small { font-size: 80%; font-weight: 400; }
      #crm-schedule-root .fw-bold { font-weight: 700 !important; color: #212529; }
      #crm-schedule-root .fw-light { font-weight: 300 !important; }
      #crm-schedule-root .fs-6 { font-size: 1rem !important; }
      #crm-schedule-root .lh-sm { line-height: 1.25 !important; }
    `;

    function injectStyles() {
        if (document.getElementById('crm-schedule-styles')) return;
        const style = document.createElement('style');
        style.id = 'crm-schedule-styles';
        style.innerHTML = STYLES;
        document.head.appendChild(style);
    }

    // Определяем окружение на основе того, где запущен скрипт
    // Если на localhost, стучимся на DevStand или локальный сервер
    const scriptUrl = document.currentScript ? document.currentScript.src : '';
    let isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // В боевом режиме всегда берем продакшн API
    let BASE_URL = 'https://devupgrade.space4you.ru';
    
    // Если тестирование проходит локально и хочется смотреть локальный бекенд:
    // if (isLocal && scriptUrl.includes('localhost:5173')) {
    //    BASE_URL = 'http://localhost:3000';
    // }

    async function loadSchedule(root) {
      // ID мероприятия берем из data-event-id="1" или используем 1 как fallback
      const rootEventId = root.getAttribute('data-event-id');
      const EVENT_ID = rootEventId || window.crmEventId || 1; 
      
      const API_URL = \`\${BASE_URL}/api/public/events/\${EVENT_ID}/website-data\`;
      
      root.innerHTML = '<div style="text-align: center; color: #888; padding: 50px;">Загрузка программы...</div>';

      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Network response was not ok: ' + response.status);
        const data = await response.json();
        renderSchedule(root, data);
      } catch (error) {
        console.error('Error loading CRM schedule:', error);
        root.innerHTML = '<div style="text-align: center; color: red; padding: 20px;">Не удалось загрузить расписание.</div>';
      }
    }

    function formatTime(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      // Если это ISO строка
      if (!isNaN(date.getTime())) {
          return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
      }
      return dateString; // fallback, если дата уже "10:00"
    }

    function renderSchedule(root, data) {
      const sessions = data.sessions || (Array.isArray(data) ? data : []);
      
      if (!sessions || sessions.length === 0) {
        root.innerHTML = '<div style="text-align: center; padding: 30px; font-size: 1.2rem;">Программа формируется...</div>';
        return;
      }

      let html = '';
      
      sessions.forEach(session => {
        const startTime = formatTime(session.startTime);
        const endTime = formatTime(session.endTime);
        const timeRange = startTime && endTime ? \`\${startTime} — \${endTime}\` : startTime;

        const moderators = (session.speakers || []).filter(s => s.role === 'Организатор' || s.isModerator);
        const speakers = (session.speakers || []).filter(s => s.role !== 'Организатор' && !s.isModerator);
        const sponsors = session.sponsors || [];

        let rowHtml = \`
          <div class="crm-row crm-border-top pt-4 mb-4">
            <div class="crm-col crm-col-lg-2 crm-text-lg-end mb-3 time-col">
                <h5>\${timeRange}</h5>
            </div>
            
            <div class="crm-col crm-col-lg-6 mb-3">
                <h5 class="session-title">\${session.title || session.name || ''}</h5>
                \${session.description ? \`<div class="mb-3 text-muted small">\${session.description}</div>\` : ''}
                
                \${sponsors.length > 0 ? \`
                  <div class="mt-4 pt-3" style="border-top: 1px solid #eee;">
                    <div class="small text-muted mb-2">Партнеры сессии:</div>
                    <div class="d-flex flex-wrap gap-3 align-items-center">
                      \${sponsors.map(sp => sp.logoFileUrl 
                          ? \`<img src="\${BASE_URL}\${sp.logoFileUrl}" alt="\${sp.name}" class="sponsor-logo" onerror="this.src='\${sp.logoFileUrl}'"/>\` 
                          : \`<span style="padding: 4px 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 12px;">\${sp.name}</span>\`
                      ).join('')}
                    </div>
                  </div>
                \` : ''}
            </div>

            <div class="crm-col crm-col-lg-4">
        \`;

        // Модераторы
        if (moderators.length > 0) {
          rowHtml += \`<div class="fw-light fs-6 mb-2 text-muted" style="text-transform: uppercase; font-size: 0.85rem !important;">Модератор\${moderators.length > 1 ? 'ы' : ''}</div>\`;
          moderators.forEach(mod => {
            const sp = mod.speaker || mod; // Поддержка разных форматов API
            const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : \`\${BASE_URL}\${sp.photoUrl}\`) : '';
            rowHtml += \`
              <div class="d-flex align-items-center mb-3">
                \${photoUrl ? \`<img src="\${photoUrl}" class="speaker-avatar me-3" />\` : ''}
                <div class="lh-sm">
                  <div class="fw-bold">\${sp.name || (sp.firstName + ' ' + sp.lastName)}</div>
                  <div class="small text-muted">\${sp.company || sp.position || sp.role || ''}</div>
                </div>
              </div>
            \`;
          });
        }

        // Спикеры
        if (speakers.length > 0) {
          rowHtml += \`<div class="fw-light fs-6 mb-2 mt-3 text-muted" style="text-transform: uppercase; font-size: 0.85rem !important;">Спикеры</div>\`;
          speakers.forEach(s => {
            const sp = s.speaker || s;
            const photoUrl = sp.photoUrl ? (sp.photoUrl.startsWith('http') ? sp.photoUrl : \`\${BASE_URL}\${sp.photoUrl}\`) : '';
            rowHtml += \`
              <div class="d-flex align-items-center mb-3">
                \${photoUrl ? \`<img src="\${photoUrl}" class="speaker-avatar me-3" />\` : ''}
                <div class="lh-sm">
                  <div class="fw-bold">\${sp.name || (sp.firstName + ' ' + sp.lastName)}</div>
                  <div class="small text-muted">\${sp.company || sp.position || sp.role || ''}</div>
                </div>
              </div>
            \`;
          });
        }

        rowHtml += \`
            </div>
          </div>
        \`;
        
        html += rowHtml;
      });

      root.innerHTML = html;
    }

    function init() {
        injectStyles();
        const rootElements = document.querySelectorAll('#crm-schedule-root');
        rootElements.forEach(root => {
            loadSchedule(root);
        });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
})();