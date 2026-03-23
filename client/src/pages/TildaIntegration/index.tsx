import React, { useEffect, useState } from 'react';
import { Typography, Space, Alert, Select, message, Button, Radio } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { ExportOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Paragraph } = Typography;

interface Event {
    id: number;
    name: string;
}

const TildaIntegrationPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [template, setTemplate] = useState<'old' | 'new'>('new');
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

    const getScriptUrl = () => {
        return template === 'old' 
            ? "https://devupgrade.space4you.ru/tilda-integration-v2.js?v=4"
            : "https://devupgrade.space4you.ru/tilda-integration-new.js?v=1";
    };

    const htmlSnippet = `<!-- UPGRADE CRM Schedule Widget -->
<div id="crm-schedule-root" data-event-id="${selectedEventId || 1}"></div>
<script src="${getScriptUrl()}"></script>`;

    return (
        <PageContainer 
            title="Интеграция с Tilda" 
            subTitle="Виджет расписания для внешних сайтов"
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                <Alert
                    message="Инструкция по установке"
                    description="Сначала выберите нужное мероприятие из списка ниже, затем выберите шаблон (дизайн) виджета. Скопируйте сгенерированный HTML-код и вставьте его в блок T123 (HTML-код) на странице Tilda."
                    type="info"
                    showIcon
                />

                <ProCard 
                    title="Выбор мероприятия и шаблона" 
                    bordered 
                    headerBordered
                >
                    <Space direction="vertical" size="middle" style={{ width: '100%', maxWidth: 500 }}>
                        <div>
                            <div style={{ marginBottom: 6, fontWeight: 500 }}>Мероприятие:</div>
                            <Select
                                loading={loading}
                                value={selectedEventId}
                                onChange={(val) => setSelectedEventId(val)}
                                style={{ width: '100%' }}
                                placeholder="Выберите мероприятие"
                                options={events.map(ev => ({ label: `[ID: ${ev.id}] ${ev.name}`, value: ev.id }))}
                            />
                        </div>
                        <div>
                            <div style={{ marginBottom: 6, fontWeight: 500 }}>Шаблон (дизайн) виджета:</div>
                            <Radio.Group 
                                value={template} 
                                onChange={(e) => setTemplate(e.target.value)}
                                optionType="button"
                                buttonStyle="solid"
                            >
                                <Radio.Button value="old">Старый шаблон (Списком)</Radio.Button>
                                <Radio.Button value="new">Новый шаблон (Карточная сетка)</Radio.Button>
                            </Radio.Group>
                        </div>
                    </Space>
                </ProCard>

                <ProCard 
                    title="Код для вставки на сайт" 
                    bordered 
                    headerBordered
                    tooltip="Этот код привязан к выбранному выше мероприятию и шаблону"
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
                    tooltip="Открыть отдельную тестовую HTML-страницу с уже внедрённым скриптом"
                >
                    <Paragraph>
                        Чтобы проверить, как расписание выглядит на реальной странице прямо сейчас, нажмите на кнопку ниже.
                    </Paragraph>
                    <Button 
                        type="primary" 
                        size="large"
                        icon={<ExportOutlined />}
                        href={`/test-tilda-standalone.html?eventId=${selectedEventId || 1}&layout=${template}`}
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
