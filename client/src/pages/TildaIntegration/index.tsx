import React, { useEffect, useRef, useState } from 'react';
import { Typography, Space, Alert, Select, message, Skeleton } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import axios from 'axios';

const { Paragraph } = Typography;

interface Event {
    id: number;
    name: string;
}

const TildaIntegrationPage: React.FC = () => {
    const previewContainerRef = useRef<HTMLDivElement>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch available events
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('/api/events');
                setEvents(response.data);
                if (response.data && response.data.length > 0) {
                    // Default to the first event
                    setSelectedEventId(response.data[0].id);
                }
            } catch (err) {
                console.error("Failed to load events", err);
                message.error("Не удалось загрузить список мероприятий");
            } finally {
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    // Load script ONCE, and manually trigger render when selectedEventId changes
    useEffect(() => {
        if (selectedEventId === null) return;

        // Clear the container to drop old UI
        if (previewContainerRef.current) {
            previewContainerRef.current.innerHTML = '';
        }

        const runRender = () => {
            if ((window as any).renderUpgTildaWidget) {
                (window as any).renderUpgTildaWidget();
            }
        };

        const scriptId = 'tilda-preview-v2';
        const existingScript = document.getElementById(scriptId);

        if (!existingScript) {
            // Prevent auto-init since we will manually trigger it
            (window as any).__UPG_PREVENT_AUTO_INIT = true;

            const script = document.createElement('script');
            script.id = scriptId;
            script.src = '/tilda-integration-v2.js?ts=' + new Date().getTime(); 
            script.async = true;
            script.onload = () => {
                runRender();
            };
            document.body.appendChild(script);
        } else {
            // Script already loaded, just trigger render
            runRender();
        }

        return () => {
            // No need to remove the script when unmounting, but we could if we wanted to
        };
    }, [selectedEventId]);

    const htmlSnippet = `<!-- UPGRADE CRM Schedule Widget -->
<div id="crm-schedule-root" data-event-id="${selectedEventId || 1}"></div>
<script src="https://devupgrade.space4you.ru/tilda-integration-v2.js"></script>`;

    return (
        <PageContainer 
            title="Интеграция с Tilda" 
            subTitle="Виджет расписания для внешних сайтов"
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                <Alert
                    message="Инструкция по установке"
                    description="Сначала выберите нужное мероприятие из списка ниже. Затем скопируйте сгенерированный HTML-код и вставьте его в блок T123 (HTML-код) на странице Tilda. Скрипт автоматически загрузит и отрисует актуальную сетку расписания."
                    type="info"
                    showIcon
                />

                <ProCard 
                    title="Выбор мероприятия" 
                    bordered 
                    headerBordered
                >
                    <div style={{ maxWidth: 400 }}>
                        <Select
                            loading={loading}
                            value={selectedEventId}
                            onChange={(val) => setSelectedEventId(val)}
                            style={{ width: '100%' }}
                            placeholder="Выберите мероприятие"
                            options={events.map(ev => ({ label: `[ID: ${ev.id}] ${ev.name}`, value: ev.id }))}
                        />
                    </div>
                </ProCard>

                <ProCard 
                    title="Код для вставки на сайт" 
                    bordered 
                    headerBordered
                    tooltip="Этот код привязан к выбранному выше мероприятию"
                >
                    <Paragraph copyable={{ text: htmlSnippet }}>
                        <pre style={{ margin: 0, padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                            {htmlSnippet}
                        </pre>
                    </Paragraph>
                </ProCard>

                <ProCard 
                    title="Отладка: Живое превью виджета" 
                    bordered 
                    headerBordered 
                    tooltip="Так виджет выглядит прямо сейчас на основе текущих данных выбранного мероприятия в базе"
                >
                    {!selectedEventId ? (
                        <Skeleton active />
                    ) : (
                        <div id="crm-schedule-root" data-event-id={selectedEventId} ref={previewContainerRef}></div>
                    )}
                </ProCard>

            </Space>
        </PageContainer>
    );
};

export default TildaIntegrationPage;
