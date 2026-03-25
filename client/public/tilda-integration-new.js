(function() {
    console.log("UPGRADE CRM Tilda Integration Widget (NEW UX) Loaded");

    let backendUrl = 'https://erp-upgrade.ru';
    const scriptEl = document.currentScript || document.getElementById('crm-widget-script');
    if (scriptEl && scriptEl.src) {
        try { backendUrl = new URL(scriptEl.src).origin; } catch (e) {}
    }

    const CONFIG = {
        API_BASE: backendUrl + '/api/public',
        rootId: 'crm-schedule-root',
        defaultRegistrationUrl: 'https://spring.upgrade.st/registration'
    };

    const TRACK_ICONS = {}; // Optional mapping for future
    
    // Tilda Reference palettes
    const PALETTES = [
        { trackBg: '#F5E7FF', cardBg: '#E9D5FF', trackText: '#592C74' }, // Purple
        { trackBg: '#EAF3FF', cardBg: '#DEEBFF', trackText: '#592C74' }, // Blue
        { trackBg: '#FEEDFF', cardBg: '#FBD4FF', trackText: '#592C74' }, // Pink
        { trackBg: '#EEF7E8', cardBg: '#DDF0D4', trackText: '#592C74' }  // Green
    ]; 

    const STYLES = `
        /* Custom Tilda New Layout Utilities Without Bootstrap */
        #crm-schedule-root {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
            box-sizing: border-box;
        }
        #crm-schedule-root *, #crm-schedule-root *::before, #crm-schedule-root *::after {
            box-sizing: border-box;
        }
        
        /* Custom Flex Grid */
        .upg-row {
            display: flex;
            flex-wrap: wrap;
            margin-right: -12px;
            margin-left: -12px;
        }
        .upg-col, .upg-col-12, .upg-col-md-6, .upg-col-lg-3 {
            position: relative;
            width: 100%;
            padding-right: 12px;
            padding-left: 12px;
        }
        @media (min-width: 768px) {
            .upg-col-md-6 { flex: 0 0 auto; width: 50%; }
        }
        @media (min-width: 992px) {
            .upg-col-lg-3 { flex: 0 0 auto; width: 25%; }
        }
        
        /* Generic Helpers */
        .upg-mb-2 { margin-bottom: 0.5rem; }
        .upg-mb-3 { margin-bottom: 1rem; }
        .upg-mb-4 { margin-bottom: 1.5rem; }
        .upg-mt-4 { margin-top: 1.5rem; }
        .upg-align-items-start { align-items: flex-start; }
        .upg-text-center { text-align: center; }

        #crm-schedule-root .upg-main-title {
            font-size: 2.2rem;
            font-weight: 800;
            text-transform: uppercase;
            color: #34125F;
            margin-bottom: 2.5rem;
            text-align: center;
        }
        #crm-schedule-root .upg-hall-block {
            background: #fff;
            border-radius: 16px;
            margin-bottom: 2rem;
        }
        #crm-schedule-root .upg-track-container {
            border-radius: 20px;
            padding: 20px;
            height: 100%;
        }
        #crm-schedule-root .upg-hall-title {
            font-size: 16px;
            font-weight: 400;
            text-transform: uppercase;
            color: #592C74;
            margin-bottom: 0.5rem;
        }
        #crm-schedule-root .upg-track-title {
            font-size: 20px;
            font-weight: 700;
            text-transform: uppercase;
            color: #592C74;
            margin-bottom: 1.5rem;
            line-height: 22px;
        }
        #crm-schedule-root .upg-session-card {
            border-radius: 15px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
            margin-bottom: 15px;
        }
        #crm-schedule-root .upg-session-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(89, 44, 116, 0.1);
            cursor: pointer;
        }
        #crm-schedule-root .upg-time-pill {
            background: #FEF5ED;
            border-radius: 30px;
            padding: 4px 12px 3px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 12px;
            color: #592C74;
            align-self: flex-start;
        }
        #crm-schedule-root .upg-session-title {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            line-height: 1.4;
            color: #592C74;
            flex-grow: 1;
        }
        /* Detailed List Styles */
        #crm-schedule-root .upg-detailed-section {
            margin-top: 3rem;
        }
        #crm-schedule-root .upg-detailed-track-title {
            font-size: 1.5rem;
            font-weight: 800;
            color: #592c74;
            margin-top: 2.5rem;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }
        #crm-schedule-root .upg-detailed-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.03);
            padding: 24px;
            margin-bottom: 15px;
        }
        #crm-schedule-root .upg-detailed-time-pill {
            color: #592c74;
            border: 1px solid #592c74;
            border-radius: 20px;
            padding: 2px 12px;
            font-weight: 700;
            font-size: 0.8rem;
            display: inline-block;
        }
        #crm-schedule-root .upg-detailed-hall {
            color: #888;
            font-weight: 500;
            font-size: 0.75rem;
            letter-spacing: 0.05em;
            display: inline-block;
            margin-left: 12px;
        }
        #crm-schedule-root .upg-detailed-title {
            font-size: 1rem;
            font-weight: 700;
            color: #592c74;
            line-height: 1.3;
            margin-top: 1rem;
            margin-bottom: 1rem;
            text-transform: uppercase;
        }
        #crm-schedule-root .upg-detailed-question {
            display: flex;
            align-items: flex-start;
            margin-bottom: 16px;
        }
        #crm-schedule-root .upg-question-number {
            background-color: #d2db41;
            color: #592c74;
            width: 22px;
            height: 22px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 0.7rem;
            flex-shrink: 0;
            margin-right: 10px;
        }
        #crm-schedule-root .upg-question-text {
            font-size: 0.75rem;
            color: #592c74;
            line-height: 1.3;
            font-weight: 500;
            margin-top: 2px;
        }
    `;

    function formatTime(startTime, endTime) {
        if (!startTime) return '';
        let sTime = startTime.includes('T') ? new Date(startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : startTime.split(':').slice(0, 2).join(':');
        if (endTime) {
            let eTime = endTime.includes('T') ? new Date(endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : endTime.split(':').slice(0, 2).join(':');
            return `${sTime} – ${eTime}`;
        }
        return sTime;
    }

    function renderSchedule(root, data) {
        if (!data.halls || !Array.isArray(data.halls)) {
            root.innerHTML = '<div class="alert alert-danger m-4">Неверный формат данных.</div>';
            return;
        }

        const eventName = data.event ? data.event.name : 'ДЕЛОВАЯ ПРОГРАММА UPGRADE RETAIL';

        let html = `<div class="upg-container">`;
        html += `<div class="upg-main-title">${eventName.toUpperCase()}</div>`;

        let trackColorIndex = 0;

        data.halls.forEach(hall => {
            const hallName = hall.name === 'unknown' ? 'Главный зал' : (hall.name || 'Общий зал');
            const tracks = hall.tracks || [];
            
            if (tracks.length === 0) return;

            html += `<div class="upg-hall-block">`;
            html += `<div class="upg-row">`;

            tracks.forEach(track => {
                const trackName = track.name || 'Общая программа';
                if (trackName === 'Без трека' && (!track.sessions || track.sessions.length === 0)) return;

                const palette = PALETTES[trackColorIndex % PALETTES.length];
                trackColorIndex++;

                html += `<div class="upg-col upg-col-md-6 upg-mb-4">`;
                html += `<div class="upg-track-container" style="background-color: ${palette.trackBg};">`;
                
                if (hallName !== 'Главный зал') {
                    html += `<div class="upg-hall-title">${hallName}</div>`;
                }
                html += `<div class="upg-track-title" style="color: ${palette.trackText};">${trackName}</div>`;
                
                const sessionsArray = track.sessions || [];
                sessionsArray.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));

                sessionsArray.forEach(session => {
                    const time = formatTime(session.startTime, session.endTime);
                    const safeTitle = session.name || 'Сессия';

                    html += `
                        <a href="#detail-session-${session.id}" class="upg-session-card" style="background-color: ${palette.cardBg};" data-session-id="${session.id}">
                            <div class="upg-time-pill">${time}</div>
                            <div class="upg-session-title">${safeTitle}</div>
                        </a>
                    `;
                });

                html += `</div></div>`;
            });

            html += `</div></div>`;
        });

        // -----------------------------------------
        // Detailed Session List (Appended Below Grid)
        // -----------------------------------------
        html += `<div class="upg-detailed-section">`;
        
        data.halls.forEach(hall => {
            const hallName = hall.name === 'unknown' ? 'Главный зал' : (hall.name || 'Общий зал');
            const tracks = hall.tracks || [];
            if (tracks.length === 0) return;

            tracks.forEach(track => {
                const trackName = track.name || 'Общая программа';
                if (trackName === 'Без трека' && (!track.sessions || track.sessions.length === 0)) return;

                const sessionsArray = track.sessions || [];
                if (sessionsArray.length === 0) return;

                html += `<div class="upg-detailed-track-title">${trackName}</div>`;

                sessionsArray.forEach(session => {
                    const time = formatTime(session.startTime, session.endTime);
                    const safeTitle = session.name || 'Сессия';
                    
                    html += `
                        <div class="upg-detailed-card" id="detail-session-${session.id}">
                            <div class="d-flex align-items-center flex-wrap">
                                <div class="upg-detailed-time-pill">${time}</div>
                                <div class="upg-detailed-hall text-uppercase">${hallName}</div>
                            </div>
                            <div class="upg-detailed-title">${safeTitle}</div>
                    `;

                    if (session.questions && session.questions.length > 0) {
                        html += `<div class="upg-row" style="margin-top: 1rem;">`;
                        session.questions.forEach((q, i) => {
                            let pillNum = `#${i + 1}`;
                            let qContent = q.title || "";
                            
                            // Handle legacy or specific input where title is just "#1" and body holds the real content
                            const titleIsJustNum = (q.title || '').trim().match(/^#\d+$/);
                            if (titleIsJustNum) {
                                pillNum = q.title.trim();
                                qContent = q.body || "";
                            } else {
                                // Title has real text. If body also exists, append it via HTML.
                                qContent = `<strong style="font-weight:600;">${q.title || ''}</strong>` + (q.body ? `<br>${q.body}` : '');
                            }

                            html += `
                                <div class="upg-col upg-col-md-6 upg-col-lg-3">
                                    <div class="upg-detailed-question">
                                        <div class="upg-question-number">${pillNum}</div>
                                        <div class="upg-question-text">${qContent}</div>
                                    </div>
                                </div>
                            `;
                        });
                        html += `</div>`;
                    }

                    html += `</div>`; // end upg-detailed-card
                });
            });
        });

        html += `</div>`; // end upg-detailed-section

        html += `</div>`; 
        root.innerHTML = html;
        setupModals(root);
    }

    function setupModals(root) {}

    function init() {
        if (!document.getElementById('upg-bootstrap-overrides-new')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'upg-bootstrap-overrides-new';
            styleEl.innerHTML = STYLES;
            document.head.appendChild(styleEl);
        }

        const rootElements = document.querySelectorAll('#' + CONFIG.rootId);
        if (rootElements.length === 0) return;

        rootElements.forEach(root => {
            const eventId = root.getAttribute('data-event-id') || 1;
            
            root.innerHTML = '<div class="text-center p-5 text-muted">Загрузка программы...</div>';

            fetch(`${CONFIG.API_BASE}/events/${eventId}/website-data`)
                .then(response => {
                    if (!response.ok) throw new Error(`Network error: ${response.status}`);
                    return response.json();
                })
                .then(data => renderSchedule(root, data))
                .catch(error => {
                    console.error('UPGRADE CRM Tilda Widget Data Error:', error);
                    root.innerHTML = '<div class="alert alert-danger m-4">Не удалось загрузить данные расписания.</div>';
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        if (!window.__UPG_PREVENT_AUTO_INIT) {
            init();
        }
    }

    window.renderUpgTildaWidgetNew = init;
})();