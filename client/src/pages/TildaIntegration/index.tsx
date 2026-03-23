import React, { useEffect, useState } from 'react';
import { Typography, Space, Alert, Select, message, Button } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { ExternalLinkAuthIcon } from '../../components/Icons/ExternalLinkAuthIcon'; // or generic icon
import { ExternalLinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Paragraph } = Typography;

interface Event {
    id: number;
    name: string;
}

const TildaIntegrationPage: React.FC = () => {
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

    const htmlSnippet = `<!-- UPGRADE CRM Schedule Widget -->
<div id="crm-schedule-root" data-event-id="${selectedEventId || 1}"></div>
<script src="https://devupgrade.space4you.ru/tilda-integration-v2.js?v=4"></script>`;

    return (
        <PageContainer 
            title="Интеграция с Tilda" 
            subTitle="Виджет расписания для внешних сайтов"
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                <Alert
                    message="Инструкция по установке"
                    description="Сначала выберите нужное мероприятие из списка ниже. Затем скопируйте сгенерированный HTML-код и вставьте его в блок T123 (HTML-код) на странице Tilda."
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
                    title="Тестовый стенд (Живое превью)" 
                    bordered 
                    headerBordered 
                    tooltip="Открыть отдельную тестовую HTML-страницу с уже внедрённым скриптом для выбранного мероприятия"
                >
                    <Paragraph>
                        Чтобы проверить, как расписание выглядит на реальной странице прямо сейчас, вы можете нажать на кнопку ниже. Будет сгенерирована отдельная вкладка с тестовой страницей, привязанной к вашему выбору.
                    </Paragraph>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<ExternalLinkOutlined />}
                        href={`/test-tilda-standalone.html?eventId=${selectedEventId || 1}`}
                        target="_blank"
                        disabled={!selectedEventId}
                    >
                        Посмотреть превью виджета
                    </Button>
                </ProCard>

            </Space>
        </PageContainer>
    );
};

export default TildaIntegrationPage;
