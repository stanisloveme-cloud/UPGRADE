import React from 'react';
import { Card, Typography, Row, Col, Divider, Space, Button } from 'antd';
import { EnvironmentOutlined, ClockCircleOutlined, CalendarOutlined, InfoCircleOutlined, PrinterOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

dayjs.locale('ru');

const { Title, Text, Paragraph } = Typography;

export interface SpeakerMemoProps {
    speakerName: string;
    eventName: string;
    sessionTitle: string;
    sessionStartTime: string;
    sessionEndTime: string;
    location: string;
    hallName: string;
    arrivalInstructions?: string;
    managerContacts?: string;
}

export const SpeakerMemo: React.FC<SpeakerMemoProps> = ({
    speakerName,
    eventName,
    sessionTitle,
    sessionStartTime,
    sessionEndTime,
    location,
    hallName,
    arrivalInstructions,
    managerContacts
}) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="speaker-memo-container">
            {/* Стили изолированы для компонента и для печати */}
            <style>
                {`
          @media print {
            body * {
              visibility: hidden;
            }
            .speaker-memo-container, .speaker-memo-container * {
              visibility: visible;
            }
            .speaker-memo-container {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 20px;
            }
            .print-hide {
              display: none !important;
            }
          }
          .speaker-memo-card {
            max-width: 800px;
            margin: 0 auto;
            border-top: 5px solid #1677ff;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
            background: #fff;
          }
          .speaker-memo-title {
            color: #1f1f1f;
            margin-bottom: 8px !important;
          }
        `}
            </style>

            <Card className="speaker-memo-card" bordered={false}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} className="speaker-memo-title">Памятка спикера</Title>
                    <Text type="secondary" style={{ fontSize: 16 }}>{eventName}</Text>
                </div>

                <Divider />

                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                        <Text type="secondary">Уважаемый(ая)</Text>
                        <Title level={3} style={{ marginTop: 4, marginBottom: 16, color: '#1677ff' }}>{speakerName}</Title>
                        <Paragraph style={{ fontSize: 16, lineHeight: 1.6 }}>
                            Мы рады приветствовать вас в качестве спикера на нашем мероприятии!
                            Ниже приведена организационная информация о вашем выступлении.
                        </Paragraph>
                    </div>

                    <Row gutter={[24, 24]}>
                        <Col span={24}>
                            <Card type="inner" title="Информация о сессии" bordered={false} style={{ background: '#f5f5f5', borderRadius: 8 }}>
                                <Row gutter={[24, 24]}>
                                    <Col xs={24} md={12}>
                                        <Space align="start" size="middle">
                                            <CalendarOutlined style={{ fontSize: 24, color: '#1677ff', marginTop: 4 }} />
                                            <div>
                                                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Дата</div>
                                                <strong style={{ fontSize: 18 }}>{dayjs(sessionStartTime).format('DD MMMM YYYY')}</strong>
                                            </div>
                                        </Space>
                                    </Col>
                                    <Col xs={24} md={12}>
                                        <Space align="start" size="middle">
                                            <ClockCircleOutlined style={{ fontSize: 24, color: '#1677ff', marginTop: 4 }} />
                                            <div>
                                                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>Время</div>
                                                <strong style={{ fontSize: 18 }}>
                                                    {dayjs(sessionStartTime).format('HH:mm')} - {dayjs(sessionEndTime).format('HH:mm')}
                                                </strong>
                                            </div>
                                        </Space>
                                    </Col>
                                    <Col span={24}>
                                        <Divider style={{ margin: '12px 0' }} />
                                        <div>
                                            <div style={{ color: '#8c8c8c', marginBottom: 8 }}>Тема выступления / Название сессии</div>
                                            <strong style={{ fontSize: 18, color: '#1f1f1f' }}>{sessionTitle}</strong>
                                        </div>
                                    </Col>
                                </Row>
                            </Card>
                        </Col>

                        <Col span={24}>
                            <div style={{ padding: '0 12px' }}>
                                <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1f1f1f' }}>
                                    <EnvironmentOutlined style={{ color: '#1677ff' }} /> Место проведения
                                </Title>
                                <Paragraph style={{ fontSize: 16 }}>
                                    <span style={{ color: '#8c8c8c' }}>Локация:</span> <strong style={{ marginLeft: 8 }}>{location}</strong> <br />
                                    <span style={{ color: '#8c8c8c' }}>Зал:</span> <strong style={{ marginLeft: 8 }}>{hallName}</strong>
                                </Paragraph>
                            </div>
                        </Col>

                        {(arrivalInstructions || managerContacts) && (
                            <Col span={24}>
                                <div style={{ padding: '0 12px' }}>
                                    <Title level={5} style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#1f1f1f' }}>
                                        <InfoCircleOutlined style={{ color: '#1677ff' }} /> Организационная информация
                                    </Title>

                                    {arrivalInstructions && (
                                        <div style={{ marginTop: 12 }}>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Прибытие / Навигация:</Text>
                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>{arrivalInstructions}</div>
                                        </div>
                                    )}

                                    {managerContacts && (
                                        <div style={{ marginTop: 16 }}>
                                            <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>Контакты менеджера:</Text>
                                            <div style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>{managerContacts}</div>
                                        </div>
                                    )}
                                </div>
                            </Col>
                        )}

                        <Col span={24}>
                            <Card type="inner" bodyStyle={{ padding: '16px 24px' }} style={{ borderColor: '#ffe58f', background: '#fffbe6', borderRadius: 8 }}>
                                <Text strong style={{ color: '#d48806', fontSize: 16 }}>Важно:</Text>
                                <ul style={{ paddingLeft: 20, marginTop: 12, color: '#d48806', marginBottom: 0, fontSize: 15, lineHeight: 1.6 }}>
                                    <li>Пожалуйста, прибудьте на площадку как минимум за <strong>30 минут</strong> до начала вашей сессии.</li>
                                    <li>Если у вас есть презентация, убедитесь, что она заранее отправлена организаторам или загружена на ваш флеш-накопитель.</li>
                                </ul>
                            </Card>
                        </Col>
                    </Row>
                </Space>

                <div className="print-hide" style={{ textAlign: 'center', marginTop: 40, paddingBottom: 20 }}>
                    <Button
                        type="primary"
                        icon={<PrinterOutlined />}
                        size="large"
                        onClick={handlePrint}
                    >
                        Распечатать памятку
                    </Button>
                </div>
            </Card>
        </div>
    );
};
