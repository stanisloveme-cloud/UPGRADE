(function () {
    // Tilda Integration Widget for UPGRADE CRM
    // Handles dynamic rendering of Schedule, Speakers, and Sponsors
    
    // --- STYLES ---
    const STYLES = `
        .ucrm-widget {
            font-family: 'Montserrat', sans-serif;
            color: #212529;
            line-height: 1.5;
            max-width: 1200px;
            margin: 0 auto;
            box-sizing: border-box;
        }
        .ucrm-widget *, .ucrm-widget *::before, .ucrm-widget *::after {
            box-sizing: inherit;
        }
        .ucrm-loading { text-align: center; color: #888; padding: 2rem; font-size: 1.1rem; }
        .ucrm-error { color: #dc3545; text-align: center; padding: 1rem; border: 1px solid #dc3545; border-radius: 4px; }
        
        /* Typography */
        .ucrm-h5 { font-size: 1.25rem; font-weight: 700; margin-top: 0; margin-bottom: 1rem; line-height: 1.2; }
        .ucrm-text-muted { color: #6c757d; }
        .ucrm-small { font-size: 0.875em; }
        .ucrm-text-uppercase { text-transform: uppercase; }
        
        /* Layout & Utilities */
        .ucrm-row { display: flex; flex-wrap: wrap; margin-right: -15px; margin-left: -15px; }
        .ucrm-col { position: relative; width: 100%; padding-right: 15px; padding-left: 15px; }
        .ucrm-d-flex { display: flex; }
        .ucrm-flex-wrap { flex-wrap: wrap; }
        .ucrm-align-items-center { align-items: center; }
        .ucrm-justify-content-center { justify-content: center; }
        .ucrm-gap-3 { gap: 1rem; }
        .ucrm-mb-2 { margin-bottom: 0.5rem; }
        .ucrm-mb-3 { margin-bottom: 1rem; }
        .ucrm-mb-4 { margin-bottom: 1.5rem; }
        .ucrm-mt-3 { margin-top: 1rem; }
        .ucrm-mt-4 { margin-top: 1.5rem; }
        .ucrm-pt-3 { padding-top: 1rem; }
        .ucrm-pt-4 { padding-top: 1.5rem; }
        .ucrm-me-3 { margin-right: 1rem; }
        
        /* Grid Breakpoints */
        @media (min-width: 768px) {
            .ucrm-col-md-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
            .ucrm-col-md-3 { flex: 0 0 25%; max-width: 25%; }
            .ucrm-col-md-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
            .ucrm-col-md-6 { flex: 0 0 50%; max-width: 50%; }
        }
        @media (min-width: 992px) {
            .ucrm-col-lg-2 { flex: 0 0 16.666667%; max-width: 16.666667%; }
            .ucrm-col-lg-3 { flex: 0 0 25%; max-width: 25%; }
            .ucrm-col-lg-4 { flex: 0 0 33.333333%; max-width: 33.333333%; }
            .ucrm-col-lg-6 { flex: 0 0 50%; max-width: 50%; }
            .ucrm-text-lg-end { text-align: right; }
        }
        
        /* Specific Components */
        .ucrm-border-top { border-top: 1px solid #aeafff; }
        
        /* Schedule Specific */
        .ucrm-time-col { color: #212529; }
        .ucrm-session-title { color: #212529; }
        
        /* Speakers Specific */
        .ucrm-speaker-card { text-align: center; margin-bottom: 2rem; }
        .ucrm-speaker-img-wrapper { width: 150px; height: 150px; margin: 0 auto 1rem; border-radius: 50%; overflow: hidden; background: #f8f9fa; }
        .ucrm-speaker-img { width: 100%; height: 100%; object-fit: cover; filter: grayscale(100%); transition: filter 0.3s ease; }
        .ucrm-speaker-img:hover { filter: grayscale(0%); }
        .ucrm-speaker-name { font-weight: 700; color: #212529; margin-bottom: 0.25rem; font-size: 1.1rem; }
        .ucrm-speaker-company { font-size: 0.85rem; color: #6c757d; }
        
        /* Small avatar for schedule */
        .ucrm-avatar-sm { width: 50px; height: 50px; border-radius: 50%; object-fit: cover; filter: grayscale(100%); }
        
        /* Sponsors Specific */
        .ucrm-sponsor-card { 
            display: flex; align-items: center; justify-content: center;
            height: 100px; padding: 1rem; margin-bottom: 1.5rem;
            background: #fff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);
            transition: transform 0.2s;
        }
        .ucrm-sponsor-card:hover { transform: translateY(-3px); box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        .ucrm-sponsor-logo { max-width: 100%; max-height: 100%; object-fit: contain; }
    `;

    // --- UTILS ---
    const BASE_URL = 'https://devupgrade.space4you.ru';

    function injectStyles() {
        if (document.getElementById('ucrm-styles')) return;
        const style = document.createElement('style');
        style.id = 'ucrm-styles';
        style.innerHTML = STYLES;
        document.head.appendChild(style);
    }

    function formatTime(timeStr) {
        if (!timeStr) return '';
        // "09:00" -> "09:00" (Assuming DB stores HH:mm)
        // If it's a full Date string, we could parse it, but PRD says HH:mm
        return timeStr;
    }

    async function fetchData(endpoint) {
        try {
            const res = await fetch(`${BASE_URL}${endpoint}`);
            if (!res.ok) throw new Error(\`Network error: \${res.status}\`);
            return await res.json();
        } catch (e) {
            console.error('[UCRM Widget] Fetch error:', e);
            throw e;
        }
    }

    // --- RENDERERS ---

    async function renderSchedule(container, eventId) {
        container.innerHTML = '<div class="ucrm-loading">Загрузка расписания...</div>';
        try {
            const halls = await fetchData(\`/api/public/events/\${eventId}/schedule\`);
            if (!halls || halls.length === 0) {
                container.innerHTML = '<div class="ucrm-loading">Расписание формируется...</div>';
                return;
            }

            let html = '<div class="ucrm-widget">';
            
            // Render halls -> tracks -> sessions
            halls.forEach(hall => {
                // If there are multiple halls, we may want to show the hall name as a header
                // html += \`<h3 class="ucrm-h5 ucrm-mt-4">\${hall.name}</h3>\`;
                
                (hall.tracks || []).forEach(track => {
                    (track.sessions || []).forEach(session => {
                        const timeStr = \`\${formatTime(session.startTime)} — \${formatTime(session.endTime)}\`;
                        const moderators = (session.speakers || []).filter(s => s.role === 'moderator' || s.role === 'Организатор');
                        const speakers = (session.speakers || []).filter(s => s.role !== 'moderator' && s.role !== 'Организатор');

                        html += \`
                            <div class="ucrm-row ucrm-border-top ucrm-pt-4 ucrm-mb-4">
                                <div class="ucrm-col ucrm-col-lg-2 ucrm-text-lg-end ucrm-mb-3 ucrm-time-col">
                                    <h5 class="ucrm-h5">\${timeStr}</h5>
                                </div>
                                <div class="ucrm-col ucrm-col-lg-6 ucrm-mb-3">
                                    <h5 class="ucrm-h5 ucrm-session-title">\${session.name || ''}</h5>
                                    \${session.description ? \`<div class="ucrm-mb-3 ucrm-text-muted ucrm-small">\${session.description}</div>\` : ''}
                                </div>
                                <div class="ucrm-col ucrm-col-lg-4">
                        \`;

                        // Render Moderators
                        if (moderators.length > 0) {
                            html += \`<div class="ucrm-text-uppercase ucrm-text-muted ucrm-small ucrm-mb-2">Модератор\${moderators.length > 1 ? 'ы' : ''}</div>\`;
                            moderators.forEach(s => {
                                const sp = s.speaker;
                                html += \`
                                    <div class="ucrm-d-flex ucrm-align-items-center ucrm-mb-3">
                                        \${sp.photoUrl ? \`<img src="\${sp.photoUrl}" class="ucrm-avatar-sm ucrm-me-3" />\` : ''}
                                        <div>
                                            <div style="font-weight:700;">\${sp.firstName} \${sp.lastName}</div>
                                            <div class="ucrm-small ucrm-text-muted">\${sp.position || sp.role || ''} \${sp.company ? '- ' + sp.company : ''}</div>
                                        </div>
                                    </div>
                                \`;
                            });
                        }

                        // Render Speakers
                        if (speakers.length > 0) {
                            html += \`<div class="ucrm-text-uppercase ucrm-text-muted ucrm-small ucrm-mb-2 ucrm-mt-3">Спикеры</div>\`;
                            speakers.forEach(s => {
                                const sp = s.speaker;
                                html += \`
                                    <div class="ucrm-d-flex ucrm-align-items-center ucrm-mb-3">
                                        \${sp.photoUrl ? \`<img src="\${sp.photoUrl}" class="ucrm-avatar-sm ucrm-me-3" />\` : ''}
                                        <div>
                                            <div style="font-weight:700;">\${sp.firstName} \${sp.lastName}</div>
                                            <div class="ucrm-small ucrm-text-muted">\${sp.position || sp.role || ''} \${sp.company ? '- ' + sp.company : ''}</div>
                                        </div>
                                    </div>
                                \`;
                            });
                        }

                        html += \`</div></div>\`;
                    });
                });
            });

            html += '</div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div class="ucrm-error">Не удалось загрузить расписание.</div>';
        }
    }

    async function renderSpeakers(container, eventId) {
        container.innerHTML = '<div class="ucrm-loading">Загрузка спикеров...</div>';
        try {
            const speakers = await fetchData(\`/api/public/events/\${eventId}/speakers\`);
            if (!speakers || speakers.length === 0) {
                container.innerHTML = '<div class="ucrm-loading">Спикеры скоро появятся...</div>';
                return;
            }

            let html = '<div class="ucrm-widget"><div class="ucrm-row ucrm-justify-content-center">';
            
            speakers.forEach(sp => {
                html += \`
                    <div class="ucrm-col ucrm-col-md-4 ucrm-col-lg-3">
                        <div class="ucrm-speaker-card">
                            <div class="ucrm-speaker-img-wrapper">
                                \${sp.photoUrl ? \`<img src="\${sp.photoUrl}" class="ucrm-speaker-img" alt="\${sp.firstName} \${sp.lastName}"/>\` : ''}
                            </div>
                            <div class="ucrm-speaker-name">\${sp.firstName} \${sp.lastName}</div>
                            <div class="ucrm-speaker-company">\${sp.position || ''} \${sp.company ? '<br/>' + sp.company : ''}</div>
                        </div>
                    </div>
                \`;
            });

            html += '</div></div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div class="ucrm-error">Не удалось загрузить спикеров.</div>';
        }
    }

    async function renderSponsors(container, eventId) {
        container.innerHTML = '<div class="ucrm-loading">Загрузка партнеров...</div>';
        try {
            const sponsors = await fetchData(\`/api/public/events/\${eventId}/sponsors\`);
            if (!sponsors || sponsors.length === 0) {
                container.innerHTML = '<div class="ucrm-loading">Список партнеров формируется...</div>';
                return;
            }

            let html = '<div class="ucrm-widget"><div class="ucrm-row ucrm-justify-content-center">';
            
            sponsors.forEach(sp => {
                html += \`
                    <div class="ucrm-col ucrm-col-md-3 ucrm-col-lg-2">
                        \${sp.websiteUrl ? \`<a href="\${sp.websiteUrl}" target="_blank" class="ucrm-sponsor-card" style="text-decoration:none;">\` : \`<div class="ucrm-sponsor-card">\`}
                            \${sp.logoFileUrl 
                                ? \`<img src="\${sp.logoFileUrl}" class="ucrm-sponsor-logo" alt="\${sp.name}"/>\` 
                                : \`<span class="ucrm-small">\${sp.name}</span>\`
                            }
                        \${sp.websiteUrl ? \`</a>\` : \`</div>\`}
                    </div>
                \`;
            });

            html += '</div></div>';
            container.innerHTML = html;
        } catch (e) {
            container.innerHTML = '<div class="ucrm-error">Не удалось загрузить партнеров.</div>';
        }
    }

    // --- INITIALIZATION ---
    function init() {
        injectStyles();
        
        const widgets = document.querySelectorAll('.upgrade-crm-widget');
        widgets.forEach(widget => {
            const type = widget.getAttribute('data-widget');
            const eventId = widget.getAttribute('data-event-id');
            
            if (!eventId) {
                widget.innerHTML = '<div class="ucrm-error">Ошибка: Укажите data-event-id</div>';
                return;
            }

            if (type === 'schedule') {
                renderSchedule(widget, eventId);
            } else if (type === 'speakers') {
                renderSpeakers(widget, eventId);
            } else if (type === 'sponsors') {
                renderSponsors(widget, eventId);
            } else {
                widget.innerHTML = '<div class="ucrm-error">Ошибка: Неизвестный тип виджета (data-widget). Допустимы: schedule, speakers, sponsors</div>';
            }
        });
    }

    // Run on DOM load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
