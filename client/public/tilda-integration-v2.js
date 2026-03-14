(function() {
    console.log("UPGRADE CRM Tilda Integration Widget V3 (Vanilla CSS) Loaded");

    const CONFIG = {
        API_BASE: 'https://devupgrade.space4you.ru/api/public',
        rootId: 'crm-schedule-root'
    };

    // --- VANILLA CSS STYLES ---
    // Specifically tailored to match the spring.upgrade.st/program UX without Bootstrap
    const STYLES = `
        /* Reset and Base within the Widget Context */
        .upg-widget {
            font-family: inherit; /* Usually Montserrat on Tilda */
            color: #333;
            line-height: 1.5;
            box-sizing: border-box;
            background: #fff;
            width: 100%;
        }
        .upg-widget * {
            box-sizing: inherit;
        }
        
        /* Layout Grid */
        .upg-layout {
            display: flex;
            flex-direction: column;
            width: 100%;
            margin: 0 auto;
        }
        @media (min-width: 900px) {
            .upg-layout {
                flex-direction: row;
                align-items: flex-start;
            }
        }

        /* Sidebar (Dates & Tracks list) */
        .upg-sidebar {
            background-color: #EBEBEB;
            padding: 30px;
            width: 100%;
        }
        @media (min-width: 900px) {
            .upg-sidebar {
                width: 25%;
                min-width: 250px;
                max-width: 300px;
                flex-shrink: 0;
                position: sticky;
                top: 20px;
                max-height: calc(100vh - 40px);
                overflow-y: auto;
            }
        }
        
        .upg-sidebar-date {
            font-size: 22px;
            font-weight: 700;
            color: #4B4698; /* Theme Purple */
            margin-top: 0;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #ccc;
        }
        
        .upg-sidebar-track-list {
            list-style: none;
            padding: 0;
            margin: 0 0 40px 0;
        }
        
        .upg-sidebar-track-item {
            margin-bottom: 12px;
        }
        
        .upg-sidebar-track-link {
            display: block;
            color: #333;
            text-decoration: none;
            font-size: 15px;
            transition: color 0.2s;
            cursor: pointer;
            line-height: 1.3;
        }
        .upg-sidebar-track-link:hover {
            color: #4B4698;
        }

        /* Main Content Panel */
        .upg-content {
            flex-grow: 1;
            padding: 0;
            background: #FAFAFB;
        }
        @media (min-width: 900px) {
            .upg-content {
                width: 75%;
            }
        }

        /* Grouping */
        .upg-date-group {
            margin-bottom: 0;
        }
        
        /* Track Header Row */
        .upg-track-header {
            font-size: 18px;
            font-weight: 500;
            color: #4B4698;
            padding: 15px 30px;
            background: #FAFAFB;
            border-bottom: 1px solid #EAEAEA;
            margin: 0;
            scroll-margin-top: 20px; /* For anchor links */
        }
        
        /* Hall row (Vertical Marker + Grid) */
        .upg-hall-row {
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #eee;
            background: #FAFAFB;
            min-height: 150px;
        }
        
        /* Vertical Hall Marker */
        .upg-hall-marker-wrap {
            width: 50px;
            flex-shrink: 0;
            border-right: 1px solid #EAEAEA;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px 0;
        }
        
        .upg-hall-marker {
            writing-mode: vertical-rl;
            transform: rotate(180deg);
            white-space: nowrap;
            color: #888;
            font-size: 14px;
            letter-spacing: 1px;
            font-weight: 500;
            text-transform: uppercase;
        }

        /* Sessions Grid */
        .upg-sessions-grid {
            flex-grow: 1;
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 15px;
            padding: 20px 30px;
            align-items: start;
        }
        
        /* Individual Session Card */
        .upg-session-card {
            background-color: #F4F4F4;
            border-radius: 6px;
            padding: 20px;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            transition: background-color 0.2s;
        }
        .upg-session-card:hover {
            background-color: #EEEEEE;
        }
        
        .upg-session-time {
            font-size: 13px;
            font-weight: 700;
            color: #000;
            margin-bottom: 10px;
        }
        
        .upg-session-title {
            font-size: 14px;
            color: #333;
            line-height: 1.4;
            flex-grow: 1; /* Pushes speakers to the bottom */
        }
        
        /* Speakers */
        .upg-speakers {
            margin-top: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .upg-speaker {
            display: flex;
            align-items: center;
        }
        .upg-speaker-avatar {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            margin-right: 10px;
            flex-shrink: 0;
            filter: grayscale(100%);
            background-color: #ddd;
        }
        .upg-speaker-info {
            display: flex;
            flex-direction: column;
        }
        .upg-speaker-name {
            font-size: 12px;
            font-weight: bold;
            color: #000;
        }
        .upg-speaker-role {
            font-size: 11px;
            color: #666;
            line-height: 1.2;
        }
        
        /* Utilities */
        .upg-loading, .upg-error {
            padding: 40px;
            text-align: center;
            font-family: sans-serif;
            color: #666;
            width: 100%;
        }
        .upg-error {
            color: #d9534f;
        }
    `;

    // --- HELPERS ---

    // Parses a datetime or time-only string and extracts the human-readable date
    function extractDate(dateString) {
      if (!dateString) return 'Программа';
      // If it's a short time-only format like '10:00'
      if (dateString.length <= 8 && dateString.includes(':')) {
          return 'Программа';
      }
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
      }
      return 'Программа';
    }

    // Formats the start and end times into "10:00 — 11:30"
    function formatTime(startTime, endTime) {
        if (!startTime) return '';
        let sTime = startTime;
        let eTime = endTime;
        
        // Process startTime
        if (sTime.includes('T')) {
            const d = new Date(sTime);
            if (!isNaN(d.getTime())) {
                sTime = d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            }
        } else {
            // "10:00:00" -> "10:00"
            sTime = sTime.split(':').slice(0, 2).join(':');
        }
        
        // Process endTime
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

    // Default Avatar Fully URL Encoded without quotes
    const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22%23ccc%22%3E%3Cpath%20d%3D%22M12%2012c2.21%200%204-1.79%204-4s-1.79-4-4-4-4%201.79-4%204%201.79%204%204%204zm0%202c-2.67%200-8%201.34-8%204v2h16v-2c0-2.66-5.33-4-8-4z%22%2F%3E%3C%2Fsvg%3E";


    // --- RENDERING CORE ---

    function renderSchedule(root, data) {
        // 1. Data Bucketing
        // We need to map data matching the legacy visual hierarchy:
        // Date -> Track -> Hall -> [Sessions]
        
        const buckets = {};
        
        if (!data.halls || !Array.isArray(data.halls)) {
            root.innerHTML = '<div class="upg-error">Неверный формат данных мероприятия.</div>';
            return;
        }

        data.halls.forEach(hall => {
            const hallName = hall.name || 'Общий зал';
            if (hall.tracks && Array.isArray(hall.tracks)) {
                hall.tracks.forEach(track => {
                    const trackName = track.name || 'Общая программа';
                    if (track.sessions && Array.isArray(track.sessions)) {
                        track.sessions.forEach(session => {
                            let dateKey = 'Программа';
                            if (session.startTime && session.startTime.includes('T')) {
                                dateKey = extractDate(session.startTime);
                            }
                            
                            if (!buckets[dateKey]) buckets[dateKey] = {};
                            if (!buckets[dateKey][trackName]) buckets[dateKey][trackName] = {};
                            if (!buckets[dateKey][trackName][hallName]) buckets[dateKey][trackName][hallName] = [];
                            
                            buckets[dateKey][trackName][hallName].push(session);
                        });
                    }
                });
            }
        });

        // 2. HTML Generation
        // Using string contatenation since it's the fastest and safest in this constrained context
        
        let html = `<div class="upg-widget"><div class="upg-layout">`;
        
        // --- Sidebar (Left) ---
        html += `<div class="upg-sidebar">`;
        for (const [dateKey, tracksObj] of Object.entries(buckets)) {
            html += `<h3 class="upg-sidebar-date">${dateKey}</h3>`;
            html += `<ul class="upg-sidebar-track-list">`;
            for (const trackName of Object.keys(tracksObj)) {
                // Anchor link safely encoded
                const anchorId = `track-${encodeURIComponent(trackName).replace(/[^a-zA-Z0-9]/g, '')}`;
                html += `
                    <li class="upg-sidebar-track-item">
                        <a href="#${anchorId}" class="upg-sidebar-track-link">${trackName}</a>
                    </li>
                `;
            }
            html += `</ul>`;
        }
        html += `</div>`; // End Sidebar
        
        
        // --- Main Content (Right) ---
        html += `<div class="upg-content">`;
        for (const [dateKey, tracksObj] of Object.entries(buckets)) {
            html += `<div class="upg-date-group">`;
            
            for (const [trackName, hallsObj] of Object.entries(tracksObj)) {
                const anchorId = `track-${encodeURIComponent(trackName).replace(/[^a-zA-Z0-9]/g, '')}`;
                
                // Track Header (e.g. "Ритейл стратегии")
                html += `<h2 class="upg-track-header" id="${anchorId}">${trackName}</h2>`;
                
                // Halls belonging to this Track
                for (const [hallName, sessionsArray] of Object.entries(hallsObj)) {
                    
                    // Sort sessions chronologically
                    sessionsArray.sort((a, b) => {
                        const tA = (a.startTime || '').split('T').pop();
                        const tB = (b.startTime || '').split('T').pop();
                        return tA.localeCompare(tB);
                    });
                    
                    html += `<div class="upg-hall-row">`;
                        // Vertical Hall Marker
                        html += `<div class="upg-hall-marker-wrap">`;
                        html += `<span class="upg-hall-marker">${hallName}</span>`;
                        html += `</div>`;
                        
                        // Session Grid
                        html += `<div class="upg-sessions-grid">`;
                        
                        sessionsArray.forEach(session => {
                            const timeRange = formatTime(session.startTime, session.endTime);
                            const sessionTitle = session.title || session.name || '';
                            
                            html += `<div class="upg-session-card">`;
                            html += `<div class="upg-session-time">${timeRange}</div>`;
                            html += `<div class="upg-session-title">${sessionTitle}</div>`;
                            
                            // Render Speakers
                            if (session.speakers && session.speakers.length > 0) {
                                html += `<div class="upg-speakers">`;
                                session.speakers.forEach(speaker => {
                                    const photoUrl = speaker.photoUrl || DEFAULT_AVATAR;
                                    const fullName = `${speaker.firstName || ''} ${speaker.lastName || ''}`.trim();
                                    const roleStr = `${speaker.position || ''} ${speaker.company || ''}`.trim();
                                    
                                    html += `
                                    <div class="upg-speaker">
                                        <div class="upg-speaker-avatar" style="background-image: url('${photoUrl}')"></div>
                                        <div class="upg-speaker-info">
                                            <span class="upg-speaker-name">${fullName}</span>
                                            <span class="upg-speaker-role">${roleStr}</span>
                                        </div>
                                    </div>
                                    `;
                                });
                                html += `</div>`;
                            }
                            html += `</div>`; // End Card
                        });
                        
                        html += `</div>`; // End Session Grid
                    html += `</div>`; // End Hall Row
                }
            }
            html += `</div>`; // End date-group
        }
        
        html += `</div>`; // End Main Content
        html += `</div></div>`; // End Layout & Widget Wrapper

        root.innerHTML = html;
        
        // Note: IntersectionObserver could be added here to highlight sidebar links on scroll,
        // but basic anchor links usually suffice for Tilda blocks.
    }


    // --- INITIALIZATION ---

    function init() {
        // Inject Custom CSS block to <head> exactly once
        if (!document.getElementById('upg-tilda-vanilla-styles')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'upg-tilda-vanilla-styles';
            styleEl.innerHTML = STYLES;
            document.head.appendChild(styleEl);
        }

        const rootElements = document.querySelectorAll('#' + CONFIG.rootId);
        if (rootElements.length === 0) {
            console.error(`UPGRADE CRM Tilda Widget: Container "#${CONFIG.rootId}" not found.`);
            return;
        }

        // Process all instances found (usually just one)
        rootElements.forEach(root => {
            const eventId = root.getAttribute('data-event-id') || 1;
            
            root.innerHTML = '<div class="upg-loading">Загрузка программы...</div>';

            fetch(`${CONFIG.API_BASE}/events/${eventId}/website-data`) // Supports mock local API_BASE logic if overridden
                .then(response => {
                    if (!response.ok) throw new Error(`Network error: ${response.status}`);
                    return response.json();
                })
                .then(data => {
                    renderSchedule(root, data);
                })
                .catch(error => {
                    console.error('UPGRADE CRM Tilda Widget Data Error:', error);
                    root.innerHTML = '<div class="upg-error">Не удалось загрузить данные расписания. Пожалуйста, обновите страницу.</div>';
                });
        });
    }

    // Attach to DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
