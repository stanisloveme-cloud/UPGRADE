import React, { useEffect, useRef } from 'react';
import { Typography, Space, Alert } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';

const { Paragraph } = Typography;

const TildaIntegrationPage: React.FC = () => {
    const previewContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // We load the script dynamically to ensure it parses the div newly mounted here.
        const scriptId = 'tilda-preview-v2';
        
        // Remove existing to force re-evaluation on route load
        const existingScript = document.getElementById(scriptId);
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = scriptId;
        // In dev environment it comes from public foldder, in prod it's served statically
        script.src = '/tilda-integration-v2.js?ts=' + new Date().getTime(); 
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (script.parentNode) {
                script.parentNode.removeChild(script);
            }
        };
    }, []);

    const htmlSnippet = `<!-- UPGRADE CRM Schedule Widget -->
<div id="crm-schedule-root" data-event-id="1"></div>
<script src="https://devupgrade.space4you.ru/tilda-integration-v2.js"></script>`;

    return (
        <PageContainer title="Интеграция с Tilda" subTitle="Виджет расписания для внешних сайтов">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                <Alert
                    message="Инструкция по установке"
                    description="Вставьте приведенный ниже HTML-код в блок T123 (HTML-код) на странице Tilda. Скрипт автоматически загрузит и отрисует актуальную сетку расписания."
                    type="info"
                    showIcon
                />

                <ProCard title="Код для вставки на сайт" bordered headerBordered>
                    <Paragraph copyable={{ text: htmlSnippet }}>
                        <pre style={{ margin: 0, padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            {htmlSnippet}
                        </pre>
                    </Paragraph>
                </ProCard>

                <ProCard title="Отладка: Живое превью виджета" bordered headerBordered tooltip="Так виджет выглядит прямо сейчас на основе текущих данных в базе">
                    {/* The root div that the script will attach to */}
                    <div id="crm-schedule-root" data-event-id="1" ref={previewContainerRef}></div>
                </ProCard>

            </Space>
        </PageContainer>
    );
};

export default TildaIntegrationPage;
