import React, { useState, useEffect, useMemo } from 'react';
import { Modal, message, Button, Input, Switch, Typography, Space, Tooltip, Drawer } from 'antd';
import { ProTable, ProColumns } from '@ant-design/pro-components';
import { CopyOutlined, EditOutlined, PhoneOutlined, MailOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Link, Title } = Typography;
const { TextArea } = Input;

interface SpeakerNotificationsModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

const SpeakerNotificationsModal: React.FC<SpeakerNotificationsModalProps> = ({ visible, onClose, eventId }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [onlyUnnotified, setOnlyUnnotified] = useState(false);

    const [templateDrawerVisible, setTemplateDrawerVisible] = useState(false);
    const [memoTemplate, setMemoTemplate] = useState('');

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/events/${eventId}/session-speakers`);
            setData(res.data);
        } catch (error) {
            message.error('Ошибка при загрузке спикеров');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && eventId) {
            fetchData();
        }
    }, [visible, eventId]);

    const handleToggleNotification = async (recordId: number, field: 'notifiedTg' | 'notifiedEmail', checked: boolean) => {
        const payload = { [field]: checked };
        try {
            await axios.patch(`/api/events/session-speakers/${recordId}`, payload);
            setData(prev => prev.map(item => item.id === recordId ? { ...item, ...payload } : item));
            message.success('Статус обновлен');
        } catch (error) {
            message.error('Ошибка обновления статуса');
        }
    };

    const fetchTemplate = async () => {
        try {
            const res = await axios.get(`/api/events/${eventId}/memo-template`);
            setMemoTemplate(res.data.memoTemplate || '<h1>Памятка спикера</h1><p>Уважаемый(ая) {{name}}, ждем вас на мероприятии {{eventName}}!</p><p>Сессия: {{sessionName}} в {{startTime}}, Зал: {{hallName}}.</p>');
        } catch (error) {
            message.error('Ошибка загрузки шаблона');
        }
    };

    const handleSaveTemplate = async () => {
        try {
            await axios.patch(`/api/events/${eventId}/memo-template`, { template: memoTemplate });
            message.success('Шаблон сохранен');
            setTemplateDrawerVisible(false);
        } catch (error) {
            message.error('Ошибка сохранения шаблона');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Ссылка скопирована');
    };

    const filteredData = useMemo(() => {
        let filtered = data;
        if (onlyUnnotified) {
            filtered = filtered.filter(item => !item.notifiedTg && !item.notifiedEmail);
        }
        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(item =>
                item.speaker.firstName.toLowerCase().includes(lowerSearch) ||
                item.speaker.lastName.toLowerCase().includes(lowerSearch) ||
                item.session.name.toLowerCase().includes(lowerSearch)
            );
        }
        return filtered;
    }, [data, search, onlyUnnotified]);

    const columns: ProColumns<any>[] = [
        {
            title: 'Спикер',
            dataIndex: ['speaker', 'lastName'],
            render: (_: any, record: any) => (
                <div>
                    <b>{record.speaker.lastName} {record.speaker.firstName}</b>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.session.name}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>{record.session.track.hall.name} • {record.session.startTime}</Text>
                </div>
            )
        },
        {
            title: 'Контакты',
            key: 'contacts',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0}>
                    {record.speaker.phone && (
                        <span><PhoneOutlined /> {record.speaker.phone}</span>
                    )}
                    {record.speaker.telegram && (
                        <span>
                            <Link href={record.speaker.telegram.startsWith('http') ? record.speaker.telegram : `https://t.me/${record.speaker.telegram.replace('@', '')}`} target="_blank">
                                Telegram ({record.speaker.telegram})
                            </Link>
                        </span>
                    )}
                    {record.speaker.email && (
                        <span><MailOutlined /> {record.speaker.email}</span>
                    )}
                </Space>
            )
        },
        {
            title: 'Памятка',
            key: 'memo',
            render: (_: any, record: any) => {
                const link = `${window.location.origin}/speaker-memo/${record.memoHash || record.id}`; // fallback id
                return (
                    <Space>
                        <Tooltip title="Скопировать ссылку для отправки спикеру">
                            <Button icon={<CopyOutlined />} onClick={() => copyToClipboard(link)}>
                                Скопировать
                            </Button>
                        </Tooltip>
                        <Tooltip title="Предпросмотр">
                            <a href={link} target="_blank" rel="noreferrer">Открыть</a>
                        </Tooltip>
                    </Space>
                );
            }
        },
        {
            title: 'Оповещен?',
            key: 'notified',
            render: (_: any, record: any) => (
                <Space direction="vertical">
                    <Space>
                        <Switch
                            checked={record.notifiedTg}
                            onChange={(chk) => handleToggleNotification(record.id, 'notifiedTg', chk)}
                            size="small"
                        />
                        <Text>В Телеграм</Text>
                    </Space>
                    <Space>
                        <Switch
                            checked={record.notifiedEmail}
                            onChange={(chk) => handleToggleNotification(record.id, 'notifiedEmail', chk)}
                            size="small"
                        />
                        <Text>На Email</Text>
                    </Space>
                </Space>
            )
        }
    ];

    return (
        <Modal
            title="Оповещение спикеров"
            open={visible}
            onCancel={onClose}
            width={1100}
            footer={null}
            destroyOnClose
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <Space>
                    <Input.Search
                        placeholder="Поиск по имени или сессии"
                        allowClear
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ width: 300 }}
                    />
                    <Switch
                        checked={onlyUnnotified}
                        onChange={setOnlyUnnotified}
                    />
                    <Text>Только не оповещенные</Text>
                </Space>
                <Button
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                        fetchTemplate();
                        setTemplateDrawerVisible(true);
                    }}
                >
                    Редактор шаблона памятки
                </Button>
            </div>

            <ProTable
                columns={columns}
                dataSource={filteredData}
                rowKey="id"
                loading={loading}
                search={false}
                options={false}
                pagination={{ pageSize: 15 }}
            />

            <Drawer
                title="Редактор шаблона памятки (HTML)"
                width={600}
                onClose={() => setTemplateDrawerVisible(false)}
                open={templateDrawerVisible}
                extra={
                    <Button type="primary" onClick={handleSaveTemplate}>
                        Сохранить
                    </Button>
                }
            >
                <div style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                        Доступные переменные: <br />
                        <b>{`{{name}}`}</b> - Имя спикера <br />
                        <b>{`{{sessionName}}`}</b> - Название сессии <br />
                        <b>{`{{hallName}}`}</b> - Название зала <br />
                        <b>{`{{startTime}}`}</b> - Время начала сессии <br />
                        <b>{`{{eventName}}`}</b> - Название мероприятия
                    </Text>
                </div>
                <TextArea
                    value={memoTemplate}
                    onChange={(e) => setMemoTemplate(e.target.value)}
                    rows={15}
                    style={{ fontFamily: 'monospace' }}
                />

                <div style={{ marginTop: 24 }}>
                    <Title level={5}>Предпросмотр блока:</Title>
                    <div
                        style={{ border: '1px solid #d9d9d9', padding: 16, borderRadius: 8, background: '#fafafa' }}
                        dangerouslySetInnerHTML={{ __html: memoTemplate.replace('{{name}}', 'Иван Иванов') }}
                    />
                </div>
            </Drawer>
        </Modal>
    );
};

export default SpeakerNotificationsModal;
