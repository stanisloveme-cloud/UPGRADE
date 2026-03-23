(function() {
    console.log("UPGRADE CRM Tilda Integration Widget (NEW UX) Loaded");

    let backendUrl = 'https://erp-upgrade.ru';
    if (document.currentScript && document.currentScript.src) {
        try { backendUrl = new URL(document.currentScript.src).origin; } catch (e) {}
    }

    const CONFIG = {
        API_BASE: backendUrl + '/api/public',
        rootId: 'crm-schedule-root',
        defaultRegistrationUrl: 'https://spring.upgrade.st/registration'
    };

    const TRACK_ICONS = {}; // Optional mapping for future
    
    // Tilda Grid palettes
    const PALETTES = [
        { bg: '#F2E9F7', trackText: '#4C1064' }, // Purple
        { bg: '#E2EEF8', trackText: '#4C1064' }, // Blue
        { bg: '#EBF4E5', trackText: '#4C1064' }, // Green-ish fallback
        { bg: '#FDECEF', trackText: '#4C1064' }  // Pink-ish fallback
    ];

    const SPEAKERS_MAP = {}; 

    const STYLES = `
        /* Custom Tilda New Layout Utilities */
        #crm-schedule-root {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
        }
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
        #crm-schedule-root .upg-track-col {
            padding: 1rem;
        }
        #crm-schedule-root .upg-hall-title {
            font-size: 0.95rem;
            text-transform: uppercase;
            color: #888;
            letter-spacing: 1px;
            margin-bottom: 0.2rem;
        }
        #crm-schedule-root .upg-track-title {
            font-size: 1.3rem;
            font-weight: 800;
            text-transform: uppercase;
            margin-bottom: 1.5rem;
            line-height: 1.2;
        }
        #crm-schedule-root .upg-session-card {
            border-radius: 12px;
            padding: 20px;
            height: 100%;
            display: flex;
            flex-direction: column;
            text-decoration: none;
            color: inherit;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        #crm-schedule-root .upg-session-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            cursor: pointer;
        }
        #crm-schedule-root .upg-time-pill {
            background: #ffffff;
            border-radius: 20px;
            padding: 4px 14px;
            font-size: 0.85rem;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 12px;
            color: #000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
            align-self: flex-start;
        }
        #crm-schedule-root .upg-session-title {
            font-size: 0.95rem;
            font-weight: 700;
            text-transform: uppercase;
            line-height: 1.3;
            flex-grow: 1;
        }
        #crm-schedule-root .upg-session-desc {
            font-size: 0.8rem;
            color: #666;
            margin-top: 10px;
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;  
            overflow: hidden;
        }
        /* Detailed List Styles */
        #crm-schedule-root .upg-detailed-section {
            margin-top: 5rem;
        }
        #crm-schedule-root .upg-detailed-track-title {
            font-size: 1.8rem;
            font-weight: 800;
            color: #592c74;
            margin-top: 3.5rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
        }
        #crm-schedule-root .upg-detailed-card {
            background: #fff;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
            padding: 30px;
            margin-bottom: 20px;
        }
        #crm-schedule-root .upg-detailed-time-pill {
            color: #592c74;
            border: 1px solid #592c74;
            border-radius: 30px;
            padding: 4px 14px;
            font-weight: 600;
            font-size: 0.95rem;
            display: inline-block;
        }
        #crm-schedule-root .upg-detailed-hall {
            color: #888;
            font-weight: 500;
            font-size: 0.95rem;
            letter-spacing: 0.05em;
            display: inline-block;
            margin-left: 15px;
        }
        #crm-schedule-root .upg-detailed-title {
            font-size: 1.25rem;
            font-weight: 700;
            color: #592c74;
            line-height: 1.35;
            margin-top: 1rem;
            margin-bottom: 1.5rem;
            text-transform: uppercase;
        }
        #crm-schedule-root .upg-detailed-question {
            display: flex;
            align-items: flex-start;
        }
        #crm-schedule-root .upg-question-number {
            background-color: #d2db41;
            color: #592c74;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 0.85rem;
            flex-shrink: 0;
            margin-right: 12px;
            box-shadow: 2px 2px 6px rgba(0,0,0,0.1);
        }
        #crm-schedule-root .upg-question-text {
            font-size: 0.85rem;
            color: #592c74;
            line-height: 1.35;
            font-weight: 500;
            margin-top: 4px;
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

        let html = `<div class="bootstrap-wrapper container-fluid p-0">`;
        html += `<div class="upg-main-title">${eventName.toUpperCase()}</div>`;

        let trackColorIndex = 0;

        data.halls.forEach(hall => {
            const hallName = hall.name === 'unknown' ? 'Главный зал' : (hall.name || 'Общий зал');
            const tracks = hall.tracks || [];
            
            if (tracks.length === 0) return;

            html += `<div class="upg-hall-block">`;
            html += `<div class="row g-4">`;

            tracks.forEach(track => {
                const trackName = track.name || 'Общая программа';
                if (trackName === 'Без трека' && (!track.sessions || track.sessions.length === 0)) return;

                const palette = PALETTES[trackColorIndex % PALETTES.length];
                trackColorIndex++;

                html += `<div class="col-12 col-xl-6 upg-track-col">`;
                
                if (hallName !== 'Главный зал') {
                    html += `<div class="upg-hall-title">${hallName}</div>`;
                }
                html += `<div class="upg-track-title" style="color: ${palette.trackText}">${trackName}</div>`;
                html += `<div class="row g-3">`;
                
                const sessionsArray = track.sessions || [];
                sessionsArray.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));

                sessionsArray.forEach(session => {
                    const time = formatTime(session.startTime, session.endTime);
                    const safeTitle = session.name || 'Сессия';
                    
                    let shortDesc = "";
                    if (session.questions && session.questions.length > 0) {
                        shortDesc = session.questions[0].title.substring(0, 80) + (session.questions[0].title.length > 80 ? '...' : '');
                    }

                    const sAnchor = `session-${session.id}`;

                    html += `
                        <div class="col-12 col-md-6">
                            <div class="upg-session-card" style="background-color: ${palette.bg};" data-session-id="${session.id}">
                                <div class="upg-time-pill">${time}</div>
                                <div class="upg-session-title">${safeTitle}</div>
                                ${shortDesc ? `<div class="upg-session-desc">${shortDesc}</div>` : ''}
                            </div>
                        </div>
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
                        html += `<div class="row g-4">`;
                        session.questions.forEach((q, i) => {
                            html += `
                                <div class="col-12 col-md-6 col-lg-3">
                                    <div class="upg-detailed-question">
                                        <div class="upg-question-number">#${i + 1}</div>
                                        <div class="upg-question-text">${q.title}</div>
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
