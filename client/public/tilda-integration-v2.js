(function() {
    console.log("UPGRADE CRM Tilda Integration Widget (Bootstrap 5 UX) Loaded");

    let backendUrl = 'https://erp-upgrade.ru';
    if (document.currentScript && document.currentScript.src) {
        try { backendUrl = new URL(document.currentScript.src).origin; } catch (e) {}
    }

    const CONFIG = {
        API_BASE: backendUrl + '/api/public',
        rootId: 'crm-schedule-root',
        defaultRegistrationUrl: 'https://spring.upgrade.st/registration'
    };

    const PALETTE = [
        { text: '#34125F', accent: '#8F6FAD' }, // Day 1
        { text: '#004F7A', accent: '#5594B8' }, // Day 2
        { text: '#005E3D', accent: '#529F81' }, // Day 3
        { text: '#6F1D1B', accent: '#A95C59' }  // Day 4
    ];

    const SPEAKERS_MAP = {}; // Store speaker data for modals

    const STYLES = `
        /* Custom Utilities */
        #crm-schedule-root .v-hall {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
        }
        #crm-schedule-root .to-scroll {
            scroll-margin-top: 90px;
        }
        #crm-schedule-root .sidebar-sticky {
            position: sticky;
            top: 70px;
            max-height: calc(100vh - 90px);
            overflow-y: auto;
        }
        #crm-schedule-root .speaker-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            object-fit: cover;
            filter: grayscale(100%);
        }
        #crm-schedule-root .text-body-tertiary {
            color: rgba(33, 37, 41, 0.5) !important;
        }
        #crm-schedule-root .nav-link-custom {
            color: #333;
            text-decoration: none;
            transition: color 0.2s, background-color 0.2s;
            display: block;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
            padding: 4px 8px;
            border-radius: 4px;
        }
        #crm-schedule-root .nav-link-custom:hover, #crm-schedule-root .nav-link-custom.active {
            color: #8F6FAD;
            background-color: rgba(143, 111, 173, 0.1);
            font-weight: 500;
        }
        #crm-schedule-root .bg-body-tertiary {
            background-color: #f8f9fa !important;
        }
        #crm-schedule-root .custom-session-card {
            border: 1px solid #dee2e6;
        }
        #crm-schedule-root .custom-session-card:hover {
            background-color: #e9ecef !important;
            cursor: pointer;
        }
        #crm-schedule-root .stretched-link::after {
            position: absolute;
            top: 0; right: 0; bottom: 0; left: 0;
            z-index: 1;
            content: "";
        }
        #crm-schedule-root .btn-participate {
            background-color: #aeafff;
            color: #fff;
            border-radius: 30px;
            padding: 10px 30px;
            font-weight: 700;
            text-decoration: none;
            display: inline-block;
            transition: 0.3s;
        }
        #crm-schedule-root .btn-participate:hover {
            background-color: #12003a;
            color: #fff;
        }
        /* Modal Styles */
        .upg-modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.5); z-index: 99999;
            display: none; align-items: center; justify-content: center;
            opacity: 0; transition: opacity 0.3s ease;
        }
        .upg-modal-overlay.show {
            display: flex; opacity: 1;
        }
        .upg-modal-container {
            background: #fff; border-radius: 12px; max-width: 500px; width: 90%;
            padding: 24px; position: relative; max-height: 90vh; overflow-y: auto;
            transform: scale(0.95); transition: transform 0.3s ease;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            font-family: inherit;
        }
        .upg-modal-overlay.show .upg-modal-container {
            transform: scale(1);
        }
        .upg-modal-close {
            position: absolute; top: 16px; right: 16px;
            background: none; border: none; font-size: 24px; cursor: pointer; color: #888;
        }
        .upg-modal-close:hover { color: #000; }
        .upg-modal-header { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; }
        .upg-modal-photo {
            width: 80px; height: 80px; border-radius: 50%; object-fit: cover;
            background-color: #f0f0f0; flex-shrink: 0; filter: grayscale(100%);
        }
        .upg-modal-name { font-size: 1.25rem; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; line-height: 1.2; }
        .upg-modal-pos { font-size: 0.9rem; color: #666; }
        .upg-modal-bio { font-size: 0.95rem; color: #444; line-height: 1.5; white-space: pre-wrap; }
    `;

    // --- HELPERS ---

    function extractDate(dateString) {
        if (!dateString) return { label: 'Программа', raw: 0 };
        if (dateString.length <= 8 && dateString.includes(':')) {
            return { label: 'Программа', raw: 0 };
        }
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return { 
                label: date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }), 
                raw: date.getTime() 
            };
        }
        return { label: 'Программа', raw: 0 };
    }

    function formatTime(startTime, endTime) {
        if (!startTime) return '';
        let sTime = startTime;
        let eTime = endTime;
        
        if (sTime.includes('T')) {
            const d = new Date(sTime);
            if (!isNaN(d.getTime())) {
                sTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            }
        } else {
            sTime = sTime.split(':').slice(0, 2).join(':');
        }
        
        if (eTime) {
           if (eTime.includes('T')) {
                const d = new Date(eTime);
                if (!isNaN(d.getTime())) {
                    eTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                }
            } else {
                eTime = eTime.split(':').slice(0, 2).join(':');
            }
            return `${sTime} — ${eTime}`;
        }
        return sTime;
    }

    // --- RENDERING CORE ---

    function renderSchedule(root, data, registrationUrl) {
        if (!data.halls || !Array.isArray(data.halls)) {
            root.innerHTML = '<div class="alert alert-danger m-4">Неверный формат данных мероприятия.</div>';
            return;
        }

        let allSessions = [];
        data.halls.forEach(hall => {
            (hall.tracks || []).forEach(track => {
                const dayInfo = track.day ? extractDate(track.day) : { label: 'Программа', raw: 0 };
                const dayKey = dayInfo.label;
                const trackName = track.name || 'Общая программа';
                (track.sessions || []).forEach(session => {
                    session.dayKey = dayKey;
                    session.rawDayTime = dayInfo.raw;
                    session.hallName = hall.name || 'Общий зал';
                    session.trackName = trackName;
                    allSessions.push(session);
                });
            });
        });

        // Group by Day -> Hall -> Track -> Sessions
        const scheduleByDay = {};
        allSessions.forEach(session => {
            if (!scheduleByDay[session.dayKey]) scheduleByDay[session.dayKey] = { halls: {}, tracks: {}, raw: session.rawDayTime };
            
            // For Grid
            if (!scheduleByDay[session.dayKey].halls[session.hallName]) {
                scheduleByDay[session.dayKey].halls[session.hallName] = {};
            }
            if (!scheduleByDay[session.dayKey].halls[session.hallName][session.trackName]) {
                scheduleByDay[session.dayKey].halls[session.hallName][session.trackName] = [];
            }
            scheduleByDay[session.dayKey].halls[session.hallName][session.trackName].push(session);

            // For Details
            if (!scheduleByDay[session.dayKey].tracks[session.trackName]) {
                scheduleByDay[session.dayKey].tracks[session.trackName] = { hallName: session.hallName, sessions: [] };
            }
            scheduleByDay[session.dayKey].tracks[session.trackName].sessions.push(session);
        });

        const sortedDays = Object.keys(scheduleByDay).sort((a, b) => scheduleByDay[a].raw - scheduleByDay[b].raw);

        let html = `<div class="bootstrap-wrapper container-fluid p-0"><div class="row align-items-start">`;
        
        // 1. Sidebar (Left)
        html += `<div class="col-12 col-lg-3 sidebar-sticky d-none d-lg-block bg-body-tertiary p-4 rounded-3 mb-4">`;
        sortedDays.forEach((day, dayIndex) => {
            const colors = PALETTE[dayIndex % PALETTE.length];
            html += `<a href="#day-${dayIndex}" class="text-decoration-none tilda-track-nav" style="display: block; margin-bottom: 0.5rem;"><h4 class="mb-2 fw-bold" style="color: ${colors.text}; margin-left: 8px;">${day}</h4></a>`;
            html += `<ul class="list-unstyled mb-4">`;
            const tracks = Object.keys(scheduleByDay[day].tracks);
            tracks.forEach(trackName => {
                const anchorId = `track-${encodeURIComponent(trackName).replace(/[^a-zA-Z0-9]/g, '')}`;
                html += `<li><a href="#${anchorId}" class="nav-link-custom tilda-track-nav">${trackName}</a></li>`;
            });
            html += `</ul>`;
        });
        html += `</div>`;

        // 2. Main Content (Right)
        html += `<div class="col-12 col-lg-9 px-lg-4">`;

        sortedDays.forEach((day, dayIndex) => {
            const colors = PALETTE[dayIndex % PALETTE.length];
            const hallsObj = scheduleByDay[day].halls;
            const tracksObj = scheduleByDay[day].tracks;

            html += `<div class="mb-5">`;
            
            // DAY HEADER
            html += `<h2 class="display-5 fw-bold mb-4 to-scroll" id="day-${dayIndex}" style="color: ${colors.text}">${day}</h2>`;

            // GRID VIEW (Сетка)
            html += `<div class="mb-5">`;
            for (const [hallName, trackGroup] of Object.entries(hallsObj)) {
                html += `<div class="row">`;
                
                // Левая колонка - Зал Конгресса
                html += `<div class="v-hall col-auto p-0 border-start border-2 border-danger mb-3" style="border-color: ${colors.accent} !important;">`;
                html += `<h6 class="ps-1 m-0 text-end text-body-tertiary" style="letter-spacing: 1px;">${hallName === 'unknown' ? 'Главный зал' : hallName}</h6>`;
                html += `</div>`;
                
                // Правая колонка - Треки и карточки
                html += `<div class="col">`;
                for (const [trackName, sessionsArray] of Object.entries(trackGroup)) {
                    const displayTrack = trackName === 'Без трека' ? '' : trackName;
                    const anchorId = `track-${encodeURIComponent(trackName).replace(/[^a-zA-Z0-9]/g, '')}`;
                    
                    if (displayTrack) {
                        // Название трека кликабельное
                        html += `<div class="row gx-2">`;
                        html += `<div class="col h6 py-1 position-relative" style="color: ${colors.text}">`;
                        html += `${displayTrack} <a class="stretched-link" href="#${anchorId}"></a>`;
                        html += `</div>`;
                        html += `</div>`;
                    }

                    // Сетка сессий в треке
                    html += `<div class="row g-3 mb-4">`;
                    sessionsArray.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));
                    
                    sessionsArray.forEach(session => {
                        const sAnchor = `session-${session.id}`;
                        const time = formatTime(session.startTime, session.endTime);
                        const safeTitle = session.name || 'Сессия';
                        
                        // Если нет описания - просто карточка. Если есть - показываем кусочек
                        let shortDesc = "";
                        if (session.questions && session.questions.length > 0) {
                            let q = session.questions[0];
                            let cleanTitle = (q.title || '').replace(/^(#\d+|№\d+)[:.]?\s*/, '').trim();
                            
                            // If title was ONLY the hashtag, display a snippet of the body text instead
                            if (!cleanTitle && q.body) {
                                cleanTitle = q.body.replace(/<br\s*\/?>/gi, ' ').trim();
                            }
                            
                            if (cleanTitle) {
                                shortDesc = cleanTitle.substring(0, 100) + (cleanTitle.length > 100 ? '...' : '');
                            }
                        }

                        html += `
                            <div class="col-12 col-md-6 col-xl-4">
                                <div class="bg-body-tertiary p-3 rounded-2 position-relative h-100 custom-session-card" style="transition: background 0.2s;">
                                    <a class="stretched-link" href="#${sAnchor}"></a>
                                    <div class="fw-bold small mb-2" style="font-size: 0.85rem;">${time}</div>
                                    <div class="small lh-sm" style="color: #212529; font-size: 1.0rem; font-weight: 500;">${safeTitle}</div>
                                    ${shortDesc ? `<div class="text-muted mt-2" style="font-size: 0.8rem;">${shortDesc}</div>` : ''}
                                </div>
                            </div>
                        `;
                    });
                    
                    html += `</div>`; // g-3
                }
                html += `</div>`; // col
                
                html += `</div>`; // row
            }
            html += `</div>`; // Grid View wrapper

            // DETAILED VIEW (Детализация по трекам)
            html += `<div>`;
            for (const [trackName, trackData] of Object.entries(tracksObj)) {
                if(trackName === 'Без трека' && trackData.sessions.length === 0) continue;
                
                const anchorId = `track-${encodeURIComponent(trackName).replace(/[^a-zA-Z0-9]/g, '')}`;
                
                html += `<div class="to-scroll mb-5 tilda-track-section" id="${anchorId}">`;
                if (trackName !== 'Без трека') {
                    html += `<h3 class="mt-1" style="color: ${colors.text}">${trackName}</h3>`;
                }
                const trackHall = trackData.hallName === 'unknown' ? 'Главный зал' : trackData.hallName;
                html += `<h6 class="text-body-tertiary mb-4">${trackHall}</h6>`;

                trackData.sessions.sort((a,b) => (a.startTime||'').localeCompare(b.startTime||''));
                
                trackData.sessions.forEach(session => {
                    const sAnchor = `session-${session.id}`;
                    const time = formatTime(session.startTime, session.endTime);
                    const questions = session.questions || [];
                    
                    const moderators = (session.speakers || []).filter(s => s.role === 'Организатор' || s.role === 'moderator').map(s => s.speaker).filter(Boolean);
                    const speakers = (session.speakers || []).filter(s => s.role !== 'Организатор' && s.role !== 'moderator').map(s => s.speaker).filter(Boolean);

                    html += `<div class="row to-scroll border-top pt-3 mb-4" id="${sAnchor}" style="border-color: ${colors.accent} !important;">`;
                    
                    html += `<div class="col-12 col-lg-2 text-lg-start mb-2 mb-lg-0">`;
                    html += `<span class="fw-bold" style="font-size: 1.05rem; letter-spacing: -0.5px;">${time}</span>`;
                    html += `</div>`;

                    html += `<div class="col-12 col-lg-6 mb-3 mb-lg-0 pe-lg-4">`;
                    html += `<h3 class="mb-3 lh-sm" style="font-weight: 500; font-size: 1.55rem; color: #1a1a1a; letter-spacing: -0.3px;">${session.name || 'Сессия'}</h3>`;
                   
                    if (questions.length > 0) {
                        html += `<ul class="list-unstyled mb-3">`;
                        questions.forEach((q, idx) => {
                            let titleText = q.title || '';
                            let hashMatch = titleText.match(/^(#\d+|№\d+)[:.]?\s*(.*)/);
                            
                            html += `<li class="d-flex mb-3" style="font-size: 0.85rem; line-height: 1.4;">`;
                            if (hashMatch) {
                                let remainderTitle = hashMatch[2].trim();
                                html += `<div><span class="fw-bold me-2">${hashMatch[1]}</span>`;
                                if (remainderTitle) html += `<span>${remainderTitle}</span>`;
                                if (q.body) html += ` <span class="text-muted ms-1">${q.body.trim().replace(/<br\s*\/?>/g, ' ')}</span>`;
                                html += `</div>`;
                            } else {
                                html += `<div>${q.title}`;
                                if (q.body) html += ` <span class="text-muted ms-1">${q.body.trim().replace(/<br\s*\/?>/g, ' ')}</span>`;
                                html += `</div>`;
                            }
                            html += `</li>`;
                        });
                        html += `</ul>`;
                    }
                    html += `</div>`;

                    // Блок людей
                    html += `<div class="col-12 col-lg-4 mt-3 mt-lg-0">`;
                    function renderPerson(p) {
                        const name = `${p.firstName || ''} ${p.lastName || ''}`.trim();
                        const pos = [p.position, p.company].filter(Boolean).join(', ');
                        
                        // Save to global map for modals
                        if (p.id) SPEAKERS_MAP[p.id] = p;

                        const bioBadge = p.bio ? `<div class="mt-2"><span class="speaker-modal-trigger" data-speaker-id="${p.id}" style="display: inline-block; border: 1px solid #dcdcdc; border-radius: 20px; padding: 3px 12px; font-size: 0.70rem; color: #888; cursor: pointer; transition: 0.2s; position: relative; z-index: 2;">подробнее о спикере</span></div>` : '';
                        
                        return `<div class="lh-sm mb-4" style="font-size: 0.85rem;"><span class="fw-bold text-dark" style="font-size: 0.95rem;">${name}${pos ? ',' : ''}</span><br><span class="text-muted pb-1" style="font-size: 0.8rem;">${pos}</span>${bioBadge}</div>`;
                    }

                    if (moderators.length > 0) {
                        html += `<div class="fw-light mb-2 text-muted" style="font-size: 0.75rem !important; text-transform: uppercase;">Модераторы:</div>`;
                        moderators.forEach(m => html += renderPerson(m));
                    }
                    if (speakers.length > 0) {
                        html += `<div class="fw-light mb-2 mt-4 text-muted" style="font-size: 0.75rem !important; text-transform: uppercase;">Спикеры:</div>`;
                        speakers.forEach(s => html += renderPerson(s));
                    }
                    html += `</div>`; 

                    html += `</div>`; // End row session
                });

                html += `</div>`; // End Track Block
            }
            html += `</div>`; 
            html += `</div>`; 
        });
        
        if (registrationUrl) {
            html += `<div class="text-center mt-5 mb-3">`;
            html += `<a href="${registrationUrl}" class="btn-participate" target="_blank" rel="noopener noreferrer">Участвовать</a>`;
            html += `</div>`;
        }

        html += `</div>`; 
        html += `</div></div>`; 

        root.innerHTML = html;
        
        // Navigation setup
        setupNavigation(root);
        setupModals(root);
    }

    function setupNavigation(root) {
        // Smooth scroll
        root.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetEl = document.getElementById(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                    targetEl.style.backgroundColor = 'rgba(143, 111, 173, 0.1)';
                    setTimeout(() => targetEl.style.backgroundColor = 'transparent', 1500);
                }
            });
        });

        // Scroll spy
        const navLinks = root.querySelectorAll('.tilda-track-nav');
        const sections = root.querySelectorAll('.tilda-track-section');
        
        window.addEventListener('scroll', () => {
            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (window.scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current) && current) {
                    link.classList.add('active');
                }
            });
        }, { passive: true });
    }

    function setupModals(root) {
        // Create modal DOM if not exists
        let modalOverlay = document.getElementById('upg-speaker-modal-overlay');
        if (!modalOverlay) {
            modalOverlay = document.createElement('div');
            modalOverlay.id = 'upg-speaker-modal-overlay';
            modalOverlay.className = 'upg-modal-overlay';
            modalOverlay.innerHTML = `
                <div class="upg-modal-container">
                    <button class="upg-modal-close" id="upg-modal-close-btn">&times;</button>
                    <div class="upg-modal-header">
                        <img id="upg-modal-img" class="upg-modal-photo" src="" alt="" style="display:none;" />
                        <div>
                            <div class="upg-modal-name" id="upg-modal-name"></div>
                            <div class="upg-modal-pos" id="upg-modal-pos"></div>
                        </div>
                    </div>
                    <div class="upg-modal-bio" id="upg-modal-bio"></div>
                </div>
            `;
            document.body.appendChild(modalOverlay);

            // Close events
            document.getElementById('upg-modal-close-btn').addEventListener('click', () => {
                modalOverlay.classList.remove('show');
                setTimeout(() => modalOverlay.style.display = 'none', 300);
            });
            modalOverlay.addEventListener('click', (e) => {
                if(e.target === modalOverlay) {
                    modalOverlay.classList.remove('show');
                    setTimeout(() => modalOverlay.style.display = 'none', 300);
                }
            });
        }

        // Delegate click for trigger buttons
        root.addEventListener('click', (e) => {
            const trigger = e.target.closest('.speaker-modal-trigger');
            if (trigger) {
                const speakerId = trigger.getAttribute('data-speaker-id');
                const speaker = SPEAKERS_MAP[speakerId];
                if (speaker) {
                    document.getElementById('upg-modal-name').textContent = `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim();
                    document.getElementById('upg-modal-pos').textContent = [speaker.position, speaker.company].filter(Boolean).join(', ');
                    
                    // Replace <br> variations with raw newlines since we use white-space: pre-wrap
                    const cleanBio = (speaker.bio || '').replace(/<br\s*\/?>/gi, '\n');
                    document.getElementById('upg-modal-bio').textContent = cleanBio;
                    
                    const imgEl = document.getElementById('upg-modal-img');
                    if (speaker.photoUrl) {
                        imgEl.src = speaker.photoUrl.startsWith('http') ? speaker.photoUrl : `${CONFIG.API_BASE.replace('/api/public', '')}${speaker.photoUrl}`;
                        imgEl.style.display = 'block';
                    } else {
                        imgEl.style.display = 'none';
                    }
                }

                    modalOverlay.style.display = 'flex';
                    // Trigger reflow for transition
                    void modalOverlay.offsetWidth;
                modalOverlay.classList.add('show');
            }
        });
    }

    // --- INITIALIZATION ---

    function init() {
        if (!document.getElementById('upg-bootstrap-overrides')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'upg-bootstrap-overrides';
            styleEl.innerHTML = STYLES;
            document.head.appendChild(styleEl);
        }

        const rootElements = document.querySelectorAll('#' + CONFIG.rootId);
        if (rootElements.length === 0) return;

        rootElements.forEach(root => {
            const eventId = root.getAttribute('data-event-id') || 1;
            const registrationUrl = root.getAttribute('data-registration-url') || CONFIG.defaultRegistrationUrl;
            
            root.innerHTML = '<div class="text-center p-5 text-muted">Загрузка программы...</div>';

            fetch(`${CONFIG.API_BASE}/events/${eventId}/website-data`)
                .then(response => {
                    if (!response.ok) throw new Error(`Network error: ${response.status}`);
                    return response.json();
                })
                .then(data => renderSchedule(root, data, registrationUrl))
                .catch(error => {
                    console.error('UPGRADE CRM Tilda Widget Data Error:', error);
                    root.innerHTML = '<div class="alert alert-danger m-4">Не удалось загрузить данные расписания. Пожалуйста, обновите страницу.</div>';
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Only auto-init if we haven't been instructed to be purely callable
        if (!window.__UPG_PREVENT_AUTO_INIT) {
            init();
        }
    }

    // Expose globally for the React CRM Preview UI to trigger manually
    window.renderUpgTildaWidget = init;
})();
