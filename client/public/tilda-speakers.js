(function() {
    console.log("UPGRADE CRM Tilda Speakers Widget Loaded");

    let backendUrl = 'https://erp-upgrade.ru';
    // Находим скрипт по ID или отталкиваемся от текущего
    const currentScript = document.getElementById('crm-speakers-script') || document.currentScript;
    if (currentScript && currentScript.src) {
        try { backendUrl = new URL(currentScript.src).origin; } catch (e) {}
    }

    const CONFIG = {
        API_BASE: backendUrl + '/api/public',
        rootId: 'crm-speakers-root'
    };

    const STYLES = `
        /* General Setup */
        #crm-speakers-root {
            font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #212529;
            box-sizing: border-box;
        }
        #crm-speakers-root * {
            box-sizing: border-box;
        }
        
        /* List Template (Без фото) - Pixel Perfect */
        #crm-speakers-root .upg-speaker-list-row {
            display: flex;
            flex-wrap: wrap;
            margin-left: -12px;
            margin-right: -12px;
        }
        #crm-speakers-root .upg-speaker-list-item {
            width: 100%;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 16px;
            padding-bottom: 8px;
            padding-left: 12px;
            padding-right: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        @media (min-width: 768px) {
            #crm-speakers-root .upg-speaker-list-item {
                width: 50%;
            }
        }
        #crm-speakers-root .upg-speaker-name {
            font-weight: 700;
        }
        #crm-speakers-root .upg-speaker-session-info {
            color: #6c757d;
            font-size: 13px;
            margin-top: 4px;
        }

        /* Grid Template (С фото) */
        #crm-speakers-root .upg-speaker-grid-row {
            display: flex;
            flex-wrap: wrap;
            margin-left: -12px;
            margin-right: -12px;
        }
        #crm-speakers-root .upg-speaker-card {
            display: flex;
            flex-direction: row;
            width: 100%;
            padding-left: 12px;
            padding-right: 12px;
            margin-bottom: 24px;
        }
        @media (min-width: 992px) {
            #crm-speakers-root .upg-speaker-card {
                width: 50%;
            }
        }
        #crm-speakers-root .upg-photo-wrap {
            margin-right: 16px;
            flex-shrink: 0;
            width: 80px; 
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            background-color: #f5f5f5;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            color: #ccc;
        }
        #crm-speakers-root .upg-photo-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        #crm-speakers-root .upg-card-info {
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }
        #crm-speakers-root .upg-card-name {
            font-size: 16px; 
            font-weight: 700; 
            color: #212529; 
            margin-bottom: 4px;
        }
        #crm-speakers-root .upg-card-company {
            font-size: 14px; 
            font-weight: 600; 
            color: #6c757d; 
            margin-bottom: 2px;
        }
        #crm-speakers-root .upg-card-position {
            font-size: 14px; 
            font-weight: 400; 
            color: #212529; 
            margin-bottom: 8px;
        }
        #crm-speakers-root .upg-card-session {
            font-size: 12px; 
            line-height: 1.4; 
            color: #6c757d;
        }
    `;

    const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

    function formatDateFriendly(dateStr) {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('T')[0].split('-');
            if (parts.length === 3) {
                const day = parseInt(parts[2], 10);
                const month = parseInt(parts[1], 10) - 1;
                return day + ' ' + MONTHS[month];
            }
        } catch (e) {}
        return dateStr;
    }

    function formatTimeFriendly(start, end) {
        if (!start && !end) return '';
        const s = start && start.includes('T') ? start.split('T')[1].substring(0, 5) : '';
        const e = end && end.includes('T') ? end.split('T')[1].substring(0, 5) : '';
        if (s && e) return s + ' – ' + e;
        return s || e || '';
    }

    function buildSessionText(spk) {
        if (spk.isModerator) {
            return '<span style="font-weight: 700; font-size: 13px; color: #12003a; letter-spacing: 0.5px; text-transform: uppercase;">Модератор</span>';
        }
        
        if (!spk.sessionsInfo || spk.sessionsInfo.length === 0) return '';
        
        const texts = spk.sessionsInfo.map(s => {
            let prefix = '';
            const dateStr = formatDateFriendly(s.day);
            const timeStr = formatTimeFriendly(s.startTime, s.endTime);
            if (dateStr || timeStr) {
                prefix = [dateStr, timeStr].filter(Boolean).join(', ') + ' — ';
            }
            
            const paths = [];
            if (s.trackName) paths.push(s.trackName);
            if (s.sessionName) paths.push(s.sessionName);
            return prefix + paths.join(' / ');
        });
        return texts.join('<br>');
    }

    function renderSpeakers(root, speakersData, layout) {
        if (!Array.isArray(speakersData)) {
            root.innerHTML = '<div class="alert alert-danger" style="color:red;">Неверный формат данных спикеров.</div>';
            return;
        }

        if (speakersData.length === 0) {
            root.innerHTML = '<div class="text-muted p-4">Спикеры пока не добавлены.</div>';
            return;
        }

        let html = '';

        if (layout === 'grid') {
            html += '<div class="upg-speaker-grid-row">';
            speakersData.forEach(spk => {
                const fullName = (spk.firstName || '') + ' ' + (spk.lastName || '');
                const cleanName = fullName.trim();
                const positionPart = spk.position ? spk.position : '';
                const companyPart = spk.company ? spk.company : '';
                const sessionText = buildSessionText(spk);

                let photoHtml = '';
                if (spk.photoUrl) {
                    photoHtml = '<img src="' + backendUrl + spk.photoUrl + '" class="upg-photo-img" alt="' + cleanName + '">';
                } else {
                    const firstNameInitial = spk.firstName && spk.firstName.length > 0 ? spk.firstName[0] : '';
                    const lastNameInitial = spk.lastName && spk.lastName.length > 0 ? spk.lastName[0] : '';
                    const initials = (firstNameInitial + lastNameInitial).toUpperCase() || '?';
                    photoHtml = '<span>' + initials + '</span>';
                }

                html += '<div class="upg-speaker-card">';
                html += '<div class="upg-photo-wrap">' + photoHtml + '</div>';
                html += '<div class="upg-card-info">';
                html += '<div class="upg-card-name">' + cleanName + '</div>';
                if (companyPart) html += '<div class="upg-card-company">' + companyPart + '</div>';
                if (positionPart) html += '<div class="upg-card-position">' + positionPart + '</div>';
                if (sessionText) html += '<div class="upg-card-session">' + sessionText + '</div>';
                html += '</div></div>';
            });
            html += '</div>';
        } else {
            // Default: 'list'
            html += '<div class="upg-speaker-list-row">';
            speakersData.forEach(spk => {
                const fullName = (spk.firstName || '') + ' ' + (spk.lastName || '');
                const cleanName = fullName.trim();
                
                // Form: Name, Position, Company
                const titleParts = [];
                if (spk.position) titleParts.push(spk.position);
                if (spk.company) titleParts.push(spk.company);
                const titleLine = titleParts.length > 0 ? ', ' + titleParts.join(', ') : '';

                const sessionText = buildSessionText(spk);

                html += '<div class="upg-speaker-list-item">';
                html += '<span class="upg-speaker-name">' + cleanName + '</span>' + titleLine;
                if (sessionText) {
                    html += '<div class="upg-speaker-session-info">' + sessionText + '</div>';
                }
                html += '</div>';
            });
            html += '</div>';
        }

        root.innerHTML = html;
    }

    function init() {
        if (!document.getElementById('upg-bootstrap-overrides-speakers')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'upg-bootstrap-overrides-speakers';
            styleEl.innerHTML = STYLES;
            document.head.appendChild(styleEl);
        }

        const rootElements = document.querySelectorAll('#' + CONFIG.rootId);
        if (rootElements.length === 0) return;

        rootElements.forEach(root => {
            const eventId = root.getAttribute('data-event-id');
            const layout = root.getAttribute('data-layout') || 'list';
            
            if (!eventId) return;

            root.innerHTML = '<div class="text-center p-5 text-muted">Загрузка спикеров...</div>';

            fetch(CONFIG.API_BASE + '/events/' + eventId + '/speakers')
                .then(response => {
                    if (!response.ok) throw new Error('Network error: ' + response.status);
                    return response.json();
                })
                .then(data => renderSpeakers(root, data, layout))
                .catch(error => {
                    console.error('UPGRADE CRM Speakers Widget Error:', error);
                    root.innerHTML = '<div class="alert alert-danger" style="color:red;">Не удалось загрузить данные спикеров.</div>';
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();