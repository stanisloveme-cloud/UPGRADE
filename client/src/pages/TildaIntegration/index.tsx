import React, { useEffect, useState } from 'react';
import { Typography, Space, Alert, Select, message, Button, Radio, Segmented } from 'antd';
import { PageContainer, ProCard } from '@ant-design/pro-components';
import { ExportOutlined, CalendarOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Paragraph } = Typography;

interface Event {
    id: number;
    name: string;
}

type IntegrationType = 'schedule' | 'speakers' | 'sponsors';

const TildaIntegrationPage: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
    const [template, setTemplate] = useState<'old' | 'new' | 'list' | 'grid'>('new');
    const [integrationType, setIntegrationType] = useState<IntegrationType>('schedule');
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
        const origin = window.location.origin || 'https://erp-upgrade.ru';
        if (integrationType === 'sponsors') {
            return `${origin}/tilda-sponsors.js?v=1`;
        }
        if (integrationType === 'speakers') {
            return `${origin}/tilda-speakers.js?v=2`;
        }
        return template === 'old' 
            ? `${origin}/tilda-integration-v2.js?v=5`
            : `${origin}/tilda-integration-new.js?v=5`;
    };

    const getRootId = () => {
        if (integrationType === 'sponsors') return "crm-sponsors-root";
        if (integrationType === 'speakers') return "crm-speakers-root";
        return "crm-schedule-root";
    };

    const isLayoutSupported = integrationType === 'speakers' || integrationType === 'sponsors';

    const htmlSnippet = `<!-- UPGRADE CRM ${integrationType === 'speakers' ? 'Speakers' : integrationType === 'sponsors' ? 'Sponsors' : 'Schedule'} Widget -->
<div id="${getRootId()}" data-event-id="${selectedEventId || 1}"${isLayoutSupported ? ` data-layout="${template}"` : ''}></div>
<script src="${getScriptUrl()}"></script>`;

    return (
        <PageContainer 
            title="Интеграция с Tilda" 
            subTitle="Виджеты для внешних сайтов"
        >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
                
                <Segmented
                    block
                    size="large"
                    value={integrationType}
                    onChange={(value) => setIntegrationType(value as IntegrationType)}
                    options={[
                        { label: 'Сетка мероприятий', value: 'schedule', icon: <CalendarOutlined /> },
                        { label: 'Спикеры мероприятий', value: 'speakers', icon: <UserOutlined /> },
                        { label: 'Спонсоры и партнеры', value: 'sponsors', icon: <CrownOutlined /> },
                    ]}
                />

                {(
                    <>
                        <Alert
                            message="Инструкция по установке"
                            description="Сначала выберите нужное мероприятие из списка ниже. Скопируйте сгенерированный HTML-код и вставьте его в блок T123 (HTML-код) на странице Tilda."
                            type="info"
                            showIcon
                        />

                        <ProCard 
                            title={`Настройка: ${integrationType === 'schedule' ? 'Расписание' : 'Спикеры'}`}
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
                                {integrationType === 'schedule' && (
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
                                )}
                                {integrationType === 'speakers' && (
                                    <div>
                                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Шаблон (дизайн) виджета:</div>
                                        <Radio.Group 
                                            value={template} 
                                            onChange={(e) => setTemplate(e.target.value)}
                                            optionType="button"
                                            buttonStyle="solid"
                                        >
                                            <Radio.Button value="list">Список (Без фото)</Radio.Button>
                                            <Radio.Button value="grid">Карточная сетка (С фото)</Radio.Button>
                                        </Radio.Group>
                                    </div>
                                )}
                                {integrationType === 'sponsors' && (
                                    <div>
                                        <div style={{ marginBottom: 6, fontWeight: 500 }}>Шаблон (дизайн) виджета:</div>
                                        <Radio.Group 
                                            value={template} 
                                            onChange={(e) => setTemplate(e.target.value)}
                                            optionType="button"
                                            buttonStyle="solid"
                                        >
                                            <Radio.Button value="grid">Сетка логотипов</Radio.Button>
                                        </Radio.Group>
                                    </div>
                                )}
                            </Space>
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
                            tooltip="Открыть отдельную тестовую HTML-страницу с уже внедрённым скриптом"
                        >
                            <Paragraph>
                                Чтобы проверить, как виджет выглядит на реальной странице прямо сейчас, нажмите на кнопку ниже.
                            </Paragraph>
                            <Button 
                                type="primary" 
                                size="large"
                                icon={<ExportOutlined />}
                                href={integrationType === 'sponsors' 
                                      ? `/test-tilda-sponsors-standalone.html?eventId=${selectedEventId || 1}&layout=${template}`
                                      : integrationType === 'schedule' 
                                      ? `/test-tilda-standalone.html?eventId=${selectedEventId || 1}&layout=${template}`
                                      : `/test-tilda-speakers-standalone.html?eventId=${selectedEventId || 1}&layout=${template}`
                                }
                                target="_blank"
                                disabled={!selectedEventId}
                            >
                                Посмотреть превью виджета
                            </Button>
                        </ProCard>
                    </>
                )}
            </Space>
        </PageContainer>
    );
};

export default TildaIntegrationPage;