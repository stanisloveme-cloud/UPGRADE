import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Space, message, Modal, Input, Result, Spin, Row, Col, Layout } from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Content } = Layout;

const BrandApproval: React.FC = () => {
    const { hash } = useParams<{ hash: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [rejectModalVisible, setRejectModalVisible] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const [submitted, setSubmitted] = useState<{ status: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`/api/sponsors/public/approval/${hash}`);
                setData(res.data);
                if (res.data.status !== 'pending') {
                    setSubmitted({ status: res.data.status });
                }
            } catch (error) {
                message.error('Спонсор не найден или ссылка недействительна');
            } finally {
                setLoading(false);
            }
        };

        if (hash) {
            fetchData();
        }
    }, [hash]);

    const handleApprove = async () => {
        setSubmitting(true);
        try {
            await axios.patch(`/api/sponsors/public/approval/${hash}`, { status: 'approved' });
            setSubmitted({ status: 'approved' });
            message.success('Данные успешно подтверждены!');
        } catch (error) {
            message.error('Ошибка при сохранении');
        } finally {
            setSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            message.warning('Укажите причину отказа / комментарии для правок');
            return;
        }

        setSubmitting(true);
        try {
            await axios.patch(`/api/sponsors/public/approval/${hash}`, {
                status: 'rejected',
                rejectionReason
            });
            setSubmitted({ status: 'rejected' });
            message.success('Правки отправлены менеджеру');
            setRejectModalVisible(false);
        } catch (error) {
            message.error('Ошибка при сохранении');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', marginTop: 100 }}><Spin size="large" /></div>;
    }

    if (!data) {
        return <Result status="404" title="404" subTitle="Страница не найдена или ссылка недействительна." />;
    }



    const InfoRow = ({ title, help, value, isLink = false, isLogo = false, isHtml = false }: any) => {
        if (!value && !isLogo) return null;
        return (
            <Row style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' }}>
                <Col xs={24} sm={8} style={{ paddingRight: 24, marginBottom: 16 }}>
                    <div style={{ fontSize: 18, color: '#595959', marginBottom: 4 }}>{title}</div>
                    <div style={{ fontSize: 12, color: '#bfbfbf' }}>{help}</div>
                </Col>
                <Col xs={24} sm={16} style={{ display: 'flex', alignItems: 'center' }}>
                    {isLogo ? (
                        <div style={{ maxWidth: 200 }}>
                            <img src={value} alt="Logo" style={{ width: '100%', objectFit: 'contain' }} />
                        </div>
                    ) : isLink ? (
                        <a href={value.startsWith('http') ? value : `https://${value}`} target="_blank" rel="noreferrer" style={{ fontSize: 16 }}>
                            {value}
                        </a>
                    ) : isHtml ? (
                        <div style={{ fontSize: 16, color: '#262626' }} dangerouslySetInnerHTML={{ __html: value }} />
                    ) : (
                        <div style={{ fontSize: 16, color: '#262626' }}>{value}</div>
                    )}
                </Col>
            </Row>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh', background: '#fff' }}>
            <Content style={{ maxWidth: 1000, margin: '0 auto', padding: '60px 20px', width: '100%' }}>
                <Title level={3} style={{ fontWeight: 400, color: '#595959', marginBottom: 8 }}>
                    Данные о бренде для размещения в каталоге сервис-провайдеров
                </Title>
                <Title level={1} style={{ fontSize: 56, fontWeight: 300, marginTop: 0, marginBottom: 60, color: '#262626' }}>
                    {data.name}
                </Title>

                <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 32 }}>
                    <InfoRow
                        title="Наименование бренда"
                        help="Должно содержать только наименование бренда в том виде, в котором он написан на логотипе, без дополнительных приписок и транслитерации."
                        value={data.name}
                    />
                    <InfoRow
                        title="Короткое описание деятельности"
                        help="Очень коротко, чем занимается бренд. До 100 символов."
                        value={data.shortDescription}
                    />
                    <InfoRow
                        title="Описание для печатного каталога"
                        help="Чем занимается бренд. До 500 символов."
                        value={data.catalogDescription}
                        isHtml={true}
                    />
                    <InfoRow
                        title="Подробное описание для карты сервисов"
                        help=""
                        value={data.serviceCardDescription}
                        isHtml={true}
                    />
                    <InfoRow
                        title="Сайт"
                        help="Ссылка на сайт бренда."
                        value={data.websiteUrl}
                        isLink={true}
                    />
                    <InfoRow
                        title="Электронная почта"
                        help="Публичный email."
                        value={data.publicEmail}
                    />
                    <InfoRow
                        title="Телефон"
                        help="Публичный телефон."
                        value={data.publicPhone}
                    />
                    <InfoRow
                        title="Город"
                        help="Город базирования бренда."
                        value={data.city}
                    />
                    <InfoRow
                        title="Количество сотрудников"
                        help="Общее число сотрудников в компании."
                        value={data.employeeCount}
                    />
                    <InfoRow
                        title="Годовой оборот"
                        help="Оборот компании за последний год."
                        value={data.annualTurnover}
                    />
                    <InfoRow
                        title="Telegram"
                        help="Корпоративный Telegram аккаунт/канал."
                        value={data.telegram}
                        isLink={true}
                    />
                    <InfoRow
                        title="WhatsApp"
                        help="Корпоративный WhatsApp."
                        value={data.whatsapp}
                        isLink={true}
                    />
                    <InfoRow
                        title="Контактное лицо"
                        help="ФИО вашего менеджера/представителя."
                        value={data.contactName}
                    />
                    <InfoRow
                        title="Email контактного лица"
                        help="Электронная почта для внутренней связи."
                        value={data.contactEmail}
                    />
                    <InfoRow
                        title="Финдиректор / Подписант"
                        help="ФИО руководителя или подписанта."
                        value={data.cfoName}
                    />
                    
                    {data.cases && data.cases.length > 0 && (
                        <Row style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' }}>
                            <Col xs={24} sm={8} style={{ paddingRight: 24, marginBottom: 16 }}>
                                <div style={{ fontSize: 18, color: '#595959', marginBottom: 4 }}>Кейсы и презентации</div>
                                <div style={{ fontSize: 12, color: '#bfbfbf' }}>Ссылки на лучшие работы и документы.</div>
                            </Col>
                            <Col xs={24} sm={16} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {data.cases.map((cs: any, idx: number) => (
                                    <div key={idx} style={{ fontSize: 16 }}>
                                        <b style={{marginRight: 8}}>{cs.label}:</b> 
                                        <a href={cs.url?.startsWith('http') ? cs.url : `https://${cs.url}`} target="_blank" rel="noreferrer">
                                            {cs.url}
                                        </a>
                                    </div>
                                ))}
                            </Col>
                        </Row>
                    )}

                    <InfoRow
                        title="Логотип"
                        help="Логотип бренда (PNG/SVG)."
                        value={data.logoUrl}
                        isLogo={true}
                    />

                    {data.marketSegments && data.marketSegments.length > 0 && (
                        <Row style={{ marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid #f0f0f0' }}>
                            <Col xs={24} sm={8} style={{ paddingRight: 24, marginBottom: 16 }}>
                                <div style={{ fontSize: 18, color: '#595959', marginBottom: 4 }}>Сегменты рынка</div>
                                <div style={{ fontSize: 12, color: '#bfbfbf' }}>Сегменты, в которых работает бренд.</div>
                            </Col>
                            <Col xs={24} sm={16} style={{ display: 'flex', alignItems: 'center' }}>
                                <ul style={{ paddingLeft: 20, margin: 0, fontSize: 16 }}>
                                    {data.marketSegments.map((segment: string, idx: number) => (
                                        <li key={idx} style={{ marginBottom: 8 }}>{segment}</li>
                                    ))}
                                </ul>
                            </Col>
                        </Row>
                    )}
                </div>

                <div style={{ marginTop: 60 }}>
                    {submitted ? (
                        <Result
                            status={submitted.status === 'approved' ? 'success' : 'info'}
                            title={submitted.status === 'approved' ? 'Данные подтверждены' : 'Правки отправлены'}
                            subTitle="Спасибо за сотрудничество! Эта страница больше не требует действий."
                            style={{ background: '#fafafa', borderRadius: 8, padding: '32px' }}
                        />
                    ) : (
                        <>
                            <Title level={3} style={{ marginBottom: 32 }}>Выберите статус</Title>
                            <Space size="middle" wrap>
                                <Button
                                    shape="round"
                                    size="large"
                                    onClick={handleApprove}
                                    loading={submitting}
                                    style={{
                                        borderColor: '#52c41a',
                                        color: '#52c41a',
                                        padding: '0 32px',
                                        height: 48,
                                        fontSize: 16
                                    }}
                                >
                                    Данные верны, изменений не требуется
                                </Button>
                                <Button
                                    shape="round"
                                    size="large"
                                    onClick={() => setRejectModalVisible(true)}
                                    style={{
                                        borderColor: '#ff4d4f',
                                        color: '#ff4d4f',
                                        padding: '0 32px',
                                        height: 48,
                                        fontSize: 16
                                    }}
                                >
                                    Данные не верны, требуются изменения
                                </Button>
                            </Space>
                        </>
                    )}
                </div>

                <Modal
                    title="Отправить правки"
                    open={rejectModalVisible}
                    onCancel={() => setRejectModalVisible(false)}
                    onOk={handleReject}
                    confirmLoading={submitting}
                    okText="Отправить"
                    cancelText="Отмена"
                >
                    <div style={{ marginBottom: 16 }}>
                        <Text>Пожалуйста, опишите, что нужно исправить:</Text>
                    </div>
                    <TextArea
                        rows={4}
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        placeholder="Укажите, какие поля или файлы необходимо обновить..."
                    />
                </Modal>
            </Content>
        </Layout>
    );
};

export default BrandApproval;
