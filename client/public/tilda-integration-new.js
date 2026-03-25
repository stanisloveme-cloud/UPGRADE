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

    const PALETTES = [
        { trackBg: '#F5E7FF', cardBg: '#E9D5FF', trackText: '#592C74' }, // Purple
        { trackBg: '#EAF3FF', cardBg: '#DEEBFF', trackText: '#592C74' }, // Blue
        { trackBg: '#FEEDFF', cardBg: '#FBD4FF', trackText: '#592C74' }, // Pink
        { trackBg: '#EEF7E8', cardBg: '#DDF0D4', trackText: '#592C74' }  // Green
    ]; 

    const STYLES = "" +
        "/* Custom Tilda New Layout Utilities Without Bootstrap */\n" +
        "#crm-schedule-root {\n" +
        "    font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif;\n" +
        "    color: #333;\n" +
        "    box-sizing: border-box;\n" +
        "}\n" +
        "#crm-schedule-root *, #crm-schedule-root *::before, #crm-schedule-root *::after {\n" +
        "    box-sizing: border-box;\n" +
        "}\n" +
        ".upg-row {\n" +
        "    display: flex;\n" +
        "    flex-wrap: wrap;\n" +
        "    margin-right: -12px;\n" +
        "    margin-left: -12px;\n" +
        "}\n" +
        ".upg-col, .upg-col-12, .upg-col-md-6, .upg-col-lg-3 {\n" +
        "    position: relative;\n" +
        "    width: 100%;\n" +
        "    padding-right: 12px;\n" +
        "    padding-left: 12px;\n" +
        "}\n" +
        "@media (min-width: 768px) {\n" +
        "    .upg-col-md-6 { flex: 0 0 auto; width: 50%; }\n" +
        "}\n" +
        "@media (min-width: 992px) {\n" +
        "    .upg-col-lg-3 { flex: 0 0 auto; width: 25%; }\n" +
        "}\n" +
        ".upg-mb-2 { margin-bottom: 0.5rem; }\n" +
        ".upg-mb-3 { margin-bottom: 1rem; }\n" +
        ".upg-mb-4 { margin-bottom: 1.5rem; }\n" +
        ".upg-mt-4 { margin-top: 1.5rem; }\n" +
        ".upg-align-items-start { align-items: flex-start; }\n" +
        ".upg-text-center { text-align: center; }\n" +
        "#crm-schedule-root .upg-main-title {\n" +
        "    font-size: 2.2rem;\n" +
        "    font-weight: 800;\n" +
        "    text-transform: uppercase;\n" +
        "    color: #34125F;\n" +
        "    margin-bottom: 2.5rem;\n" +
        "    text-align: center;\n" +
        "}\n" +
        "#crm-schedule-root .upg-hall-block {\n" +
        "    background: #fff;\n" +
        "    border-radius: 16px;\n" +
        "    margin-bottom: 2rem;\n" +
        "}\n" +
        "#crm-schedule-root .upg-track-container {\n" +
        "    border-radius: 20px;\n" +
        "    padding: 20px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-hall-title {\n" +
        "    font-size: 16px;\n" +
        "    font-weight: 400;\n" +
        "    text-transform: uppercase;\n" +
        "    color: #592C74;\n" +
        "    margin-bottom: 0.5rem;\n" +
        "}\n" +
        "#crm-schedule-root .upg-track-title {\n" +
        "    font-size: 20px;\n" +
        "    font-weight: 700;\n" +
        "    text-transform: uppercase;\n" +
        "    color: #592C74;\n" +
        "    margin-bottom: 1.5rem;\n" +
        "    line-height: 22px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-session-card {\n" +
        "    border-radius: 15px;\n" +
        "    padding: 15px;\n" +
        "    display: flex;\n" +
        "    flex-direction: column;\n" +
        "    text-decoration: none;\n" +
        "    color: inherit;\n" +
        "    transition: transform 0.2s ease, box-shadow 0.2s ease;\n" +
        "    margin-bottom: 15px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-session-card:hover {\n" +
        "    transform: translateY(-2px);\n" +
        "    box-shadow: 0 4px 12px rgba(89, 44, 116, 0.1);\n" +
        "    cursor: pointer;\n" +
        "}\n" +
        "#crm-schedule-root .upg-time-pill {\n" +
        "    background: #FEF5ED;\n" +
        "    border-radius: 30px;\n" +
        "    padding: 4px 12px 3px;\n" +
        "    font-size: 12px;\n" +
        "    font-weight: 600;\n" +
        "    display: inline-block;\n" +
        "    margin-bottom: 12px;\n" +
        "    color: #592C74;\n" +
        "    align-self: flex-start;\n" +
        "}\n" +
        "#crm-schedule-root .upg-session-title {\n" +
        "    font-size: 12px;\n" +
        "    font-weight: 600;\n" +
        "    text-transform: uppercase;\n" +
        "    line-height: 1.4;\n" +
        "    color: #592C74;\n" +
        "    flex-grow: 1;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-section {\n" +
        "    margin-top: 3rem;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-track-title {\n" +
        "    font-size: 1.5rem;\n" +
        "    font-weight: 800;\n" +
        "    color: #592c74;\n" +
        "    margin-top: 2.5rem;\n" +
        "    margin-bottom: 1rem;\n" +
        "    text-transform: uppercase;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-card {\n" +
        "    background: #fff;\n" +
        "    border-radius: 12px;\n" +
        "    box-shadow: 0 4px 15px rgba(0,0,0,0.03);\n" +
        "    padding: 24px;\n" +
        "    margin-bottom: 15px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-time-pill {\n" +
        "    color: #592c74;\n" +
        "    border: 1px solid #592c74;\n" +
        "    border-radius: 20px;\n" +
        "    padding: 2px 12px;\n" +
        "    font-weight: 700;\n" +
        "    font-size: 0.8rem;\n" +
        "    display: inline-block;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-hall {\n" +
        "    color: #888;\n" +
        "    font-weight: 500;\n" +
        "    font-size: 0.75rem;\n" +
        "    letter-spacing: 0.05em;\n" +
        "    display: inline-block;\n" +
        "    margin-left: 12px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-title {\n" +
        "    font-size: 1rem;\n" +
        "    font-weight: 700;\n" +
        "    color: #592c74;\n" +
        "    line-height: 1.3;\n" +
        "    margin-top: 1rem;\n" +
        "    margin-bottom: 1rem;\n" +
        "    text-transform: uppercase;\n" +
        "}\n" +
        "#crm-schedule-root .upg-detailed-question {\n" +
        "    display: flex;\n" +
        "    align-items: flex-start;\n" +
        "    margin-bottom: 16px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-question-number {\n" +
        "    background-color: #d2db41;\n" +
        "    color: #592c74;\n" +
        "    width: 22px;\n" +
        "    height: 22px;\n" +
        "    border-radius: 50%;\n" +
        "    display: flex;\n" +
        "    align-items: center;\n" +
        "    justify-content: center;\n" +
        "    font-weight: 800;\n" +
        "    font-size: 0.7rem;\n" +
        "    flex-shrink: 0;\n" +
        "    margin-right: 10px;\n" +
        "}\n" +
        "#crm-schedule-root .upg-question-text {\n" +
        "    font-size: 0.75rem;\n" +
        "    color: #592c74;\n" +
        "    line-height: 1.3;\n" +
        "    font-weight: 500;\n" +
        "    margin-top: 2px;\n" +
        "}\n";

    function formatTime(startTime, endTime) {
        if (!startTime) return '';
        let sTime = startTime.indexOf('T') !== -1 ? new Date(startTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : startTime.split(':').slice(0, 2).join(':');
        if (endTime) {
            let eTime = endTime.indexOf('T') !== -1 ? new Date(endTime).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : endTime.split(':').slice(0, 2).join(':');
            return sTime + ' – ' + eTime;
        }
        return sTime;
    }

    function renderSchedule(root, data) {
        if (!data.halls || !Array.isArray(data.halls)) {
            root.innerHTML = '<div class="alert alert-danger m-4">Неверный формат данных.</div>';
            return;
        }

        const eventName = data.event ? data.event.name : 'ДЕЛОВАЯ ПРОГРАММА UPGRADE RETAIL';

        let html = '<div class="upg-container">';
        html += '<div class="upg-main-title">' + eventName.toUpperCase() + '</div>';

        let trackColorIndex = 0;

        data.halls.forEach(function(hall) {
            const hallName = hall.name === 'unknown' ? 'Главный зал' : (hall.name || 'Общий зал');
            const tracks = hall.tracks || [];
            
            if (tracks.length === 0) return;

            html += '<div class="upg-hall-block">';
            html += '<div class="upg-row">';

            let leftColHtml = '';
            let rightColHtml = '';
            let trackOutputIndex = 0;

            tracks.forEach(function(track) {
                const trackName = track.name || 'Общая программа';
                if (trackName === 'Без трека' && (!track.sessions || track.sessions.length === 0)) return;

                const palette = PALETTES[trackColorIndex % PALETTES.length];
                trackColorIndex++;

                let trackHtml = '<div class="upg-track-container upg-mb-4" style="background-color: ' + palette.trackBg + ';">';
                
                if (hallName !== 'Главный зал') {
                    trackHtml += '<div class="upg-hall-title">' + hallName + '</div>';
                }
                trackHtml += '<div class="upg-track-title" style="color: ' + palette.trackText + ';">' + trackName + '</div>';
                
                const sessionsArray = track.sessions || [];
                sessionsArray.sort(function(a,b) { return (a.startTime||'').localeCompare(b.startTime||''); });

                sessionsArray.forEach(function(session) {
                    const time = formatTime(session.startTime, session.endTime);
                    const safeTitle = session.name || 'Сессия';

                    trackHtml += '<a href="#detail-session-' + session.id + '" class="upg-session-card" style="background-color: ' + palette.cardBg + ';" data-session-id="' + session.id + '">';
                    trackHtml += '<div class="upg-time-pill">' + time + '</div>';
                    trackHtml += '<div class="upg-session-title">' + safeTitle + '</div>';
                    trackHtml += '</a>';
                });

                trackHtml += '</div>';

                if (trackOutputIndex % 2 === 0) {
                    leftColHtml += trackHtml;
                } else {
                    rightColHtml += trackHtml;
                }
                trackOutputIndex++;
            });

            html += '<div class="upg-col upg-col-md-6">' + leftColHtml + '</div>';
            html += '<div class="upg-col upg-col-md-6">' + rightColHtml + '</div>';

            html += '</div></div>';
        });

        // -----------------------------------------
        // Detailed Session List (Appended Below Grid)
        // -----------------------------------------
        html += '<div class="upg-detailed-section">';
        
        data.halls.forEach(function(hall) {
            const hallName = hall.name === 'unknown' ? 'Главный зал' : (hall.name || 'Общий зал');
            const tracks = hall.tracks || [];
            if (tracks.length === 0) return;

            tracks.forEach(function(track) {
                const trackName = track.name || 'Общая программа';
                if (trackName === 'Без трека' && (!track.sessions || track.sessions.length === 0)) return;

                const sessionsArray = track.sessions || [];
                if (sessionsArray.length === 0) return;

                html += '<div class="upg-detailed-track-title">' + trackName + '</div>';

                sessionsArray.forEach(function(session) {
                    const time = formatTime(session.startTime, session.endTime);
                    const safeTitle = session.name || 'Сессия';
                    
                    html += '<div class="upg-detailed-card" id="detail-session-' + session.id + '">';
                    html += '<div class="d-flex align-items-center flex-wrap" style="display:flex; align-items:center; flex-wrap:wrap;">';
                    html += '<div class="upg-detailed-time-pill">' + time + '</div>';
                    html += '<div class="upg-detailed-hall text-uppercase" style="text-transform:uppercase;">' + hallName + '</div>';
                    html += '</div>';
                    html += '<div class="upg-detailed-title">' + safeTitle + '</div>';

                    if (session.questions && session.questions.length > 0) {
                        html += '<div class="upg-row" style="margin-top: 1rem;">';
                        session.questions.forEach(function(q, i) {
                            let pillNum = '#' + (i + 1);
                            let qContent = q.title || "";
                            
                            // Handle legacy or specific input where title is just "#1" and body holds the real content
                            const titleIsJustNum = (q.title || '').trim().match(/^#\d+$/);
                            if (titleIsJustNum) {
                                pillNum = q.title.trim();
                                qContent = q.body || "";
                            } else {
                                // Title has real text. If body also exists, append it via HTML.
                                qContent = '<strong style="font-weight:600;">' + (q.title || '') + '</strong>' + (q.body ? '<br>' + q.body : '');
                            }

                            html += '<div class="upg-col upg-col-md-6 upg-col-lg-3">';
                            html += '<div class="upg-detailed-question">';
                            html += '<div class="upg-question-number">' + pillNum + '</div>';
                            html += '<div class="upg-question-text">' + qContent + '</div>';
                            html += '</div></div>';
                        });
                        html += '</div>';
                    }

                    html += '</div>'; // end upg-detailed-card
                });
            });
        });

        html += '</div>'; // end upg-detailed-section

        html += '</div>'; 
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

        rootElements.forEach(function(root) {
            const eventId = root.getAttribute('data-event-id') || 1;
            
            root.innerHTML = '<div class="text-center p-5 text-muted">Загрузка программы...</div>';

            fetch(CONFIG.API_BASE + '/events/' + eventId + '/website-data')
                .then(function(response) {
                    if (!response.ok) throw new Error('Network error: ' + response.status);
                    return response.json();
                })
                .then(function(data) { renderSchedule(root, data); })
                .catch(function(error) {
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