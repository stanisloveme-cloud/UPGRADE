(function() {
    console.log("UPGRADE CRM Tilda Sponsors Widget Loaded");

    let backendUrl = 'https://erp-upgrade.ru';
    if (document.currentScript && document.currentScript.src) {
        try { backendUrl = new URL(document.currentScript.src).origin; } catch (e) {}
    }

    const CONFIG = {
        API_BASE: backendUrl + '/api/public',
        rootId: 'crm-sponsors-root'
    };

    const STYLES = `
        /* General Setup */
        #crm-sponsors-root {
            font-family: Montserrat, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #212529;
            box-sizing: border-box;
            width: 100%;
        }
        #crm-sponsors-root * {
            box-sizing: border-box;
        }
        
        /* Grid Template */
        #crm-sponsors-root .upg-sponsor-grid-row {
            display: flex;
            flex-wrap: wrap;
            margin-left: -12px;
            margin-right: -12px;
            justify-content: center;
        }
        #crm-sponsors-root .upg-sponsor-card {
            width: 50%;
            padding: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 24px;
        }
        @media (min-width: 768px) {
            #crm-sponsors-root .upg-sponsor-card {
                width: 25%; /* 4 columns on desktop */
            }
        }
        #crm-sponsors-root .upg-sponsor-link, 
        #crm-sponsors-root .upg-sponsor-logo-wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 120px;
            padding: 16px;
            background-color: #ffffff;
            border: 1px solid #f0f0f0;
            border-radius: 8px;
            transition: all 0.2s ease-in-out;
            text-decoration: none;
            color: #212529;
        }
        #crm-sponsors-root .upg-sponsor-link:hover {
            box-shadow: 0 8px 24px rgba(0,0,0,0.08);
            transform: translateY(-2px);
            border-color: #e6e6e6;
        }
        #crm-sponsors-root .upg-logo-img {
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
            filter: grayscale(100%);
            opacity: 0.7;
            transition: all 0.3s ease;
        }
        #crm-sponsors-root .upg-sponsor-link:hover .upg-logo-img {
            filter: grayscale(0%);
            opacity: 1;
        }
        #crm-sponsors-root .upg-sponsor-no-logo {
            font-weight: 600;
            font-size: 16px;
            text-align: center;
        }
    `;

    function renderSponsors(root, sponsorsData, layout) {
        if (!Array.isArray(sponsorsData)) {
            root.innerHTML = '<div class="alert alert-danger">Неверный формат данных спонсоров.</div>';
            return;
        }

        if (sponsorsData.length === 0) {
            root.innerHTML = '<div class="text-muted p-4 text-center">Спонсоры для этого мероприятия не найдены.</div>';
            return;
        }

        let html = '<div class="upg-sponsor-grid-row">';
        
        sponsorsData.forEach(spk => {
            let logoHtml = '';
            // Handle cases where DB has /api/uploads vs flat uploads
            let logoUrl = spk.logoFileUrl || spk.logoUrl;
            if (logoUrl) {
                // Determine if we need to prepend backendUrl
                let finalUrl = logoUrl;
                if (logoUrl.startsWith('/api/') || logoUrl.startsWith('/uploads/')) {
                    finalUrl = backendUrl + logoUrl;
                }
                logoHtml = \`<img src="\${finalUrl}" class="upg-logo-img" alt="\${spk.name}">\`;
            } else {
                logoHtml = \`<span class="upg-sponsor-no-logo">\${spk.name}</span>\`;
            }

            const innerContent = logoHtml;
            const wrapClass = spk.websiteUrl ? "upg-sponsor-link" : "upg-sponsor-logo-wrap";
            const tag = spk.websiteUrl ? "a" : "div";
            const hrefAttr = spk.websiteUrl ? \` href="\${spk.websiteUrl.startsWith('http') ? spk.websiteUrl : 'https://' + spk.websiteUrl}" target="_blank" rel="noreferrer"\` : "";

            html += \`
                <div class="upg-sponsor-card">
                    <\${tag} class="\${wrapClass}"\${hrefAttr} title="\${spk.name}">
                        \${innerContent}
                    </\${tag}>
                </div>
            \`;
        });
        
        html += '</div>';

        root.innerHTML = html;
    }

    function init() {
        if (!document.getElementById('upg-bootstrap-overrides-sponsors')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'upg-bootstrap-overrides-sponsors';
            styleEl.innerHTML = STYLES;
            document.head.appendChild(styleEl);
        }

        const rootElements = document.querySelectorAll('#' + CONFIG.rootId);
        if (rootElements.length === 0) return;

        rootElements.forEach(root => {
            const eventId = root.getAttribute('data-event-id');
            const layout = root.getAttribute('data-layout') || 'grid';
            
            if (!eventId) return;

            root.innerHTML = '<div class="text-center p-5 text-muted">Загрузка спонсоров...</div>';

            fetch(\`\${CONFIG.API_BASE}/events/\${eventId}/sponsors\`)
                .then(response => {
                    if (!response.ok) throw new Error(\`Network error: \${response.status}\`);
                    return response.json();
                })
                .then(data => renderSponsors(root, data, layout))
                .catch(error => {
                    console.error('UPGRADE CRM Sponsors Widget Error:', error);
                    root.innerHTML = '<div class="alert alert-danger" style="color:red;">Не удалось загрузить данные спонсоров.</div>';
                });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
