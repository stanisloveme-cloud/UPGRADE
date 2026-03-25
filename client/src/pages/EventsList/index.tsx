import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Tag, Button, Space, message, Modal, Form, Input, DatePicker, Popconfirm } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthProvider';

interface Event {
    id: number;
    name: string;
    description?: string | null;
    startDate: string;
    endDate: string;
    status: 'draft' | 'published' | 'archived';
    location?: string;
    eventLogoUrl?: string;
}

const EventsList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEventId, setEditingEventId] = useState<number | null>(null);
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const { user } = useAuth();

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Failed to fetch events:', error);
            message.error('Ошибка загрузки мероприятий');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    const handleSave = async (values: any, bypassWarning = false) => {
        try {
            const newStartStr = values.dates[0].format('YYYY-MM-DD') + 'T00:00:00.000Z';
            const newEndStr = values.dates[1].format('YYYY-MM-DD') + 'T00:00:00.000Z';

            const payload = {
                name: values.name,
                description: values.description,
                startDate: newStartStr,
                endDate: newEndStr,
                location: values.location,
                eventLogoUrl: values.eventLogoUrl,
            };

            if (editingEventId && !bypassWarning) {
                const existingEvent = events.find(e => e.id === editingEventId);
                if (existingEvent) {
                    const oldStartStr = typeof existingEvent.startDate === 'string' && existingEvent.startDate.includes('T') ? existingEvent.startDate.split('T')[0] : existingEvent.startDate;
                    const oldEndStr = typeof existingEvent.endDate === 'string' && existingEvent.endDate.includes('T') ? existingEvent.endDate.split('T')[0] : existingEvent.endDate;
                    
                    const newStartStrPlain = newStartStr.split('T')[0];
                    const newEndStrPlain = newEndStr.split('T')[0];

                    const oldStart = new Date(oldStartStr);
                    oldStart.setHours(0,0,0,0);
                    const oldEnd = new Date(oldEndStr);
                    oldEnd.setHours(0,0,0,0);
                    
                    const newStart = new Date(newStartStrPlain);
                    newStart.setHours(0,0,0,0);
                    const newEnd = new Date(newEndStrPlain);
                    newEnd.setHours(0,0,0,0);

                    // Check if shrinking the bounds
                    if (newStart > oldStart || newEnd < oldEnd) {
                        try {
                            const structRes = await axios.get(`/api/events/${editingEventId}/full-structure`);
                            const data = structRes.data;
                            
                            let hasOutliers = false;
                            
                            if (data && data.halls) {
                                data.halls.forEach((hall: any) => {
                                    hall.tracks?.forEach((track: any) => {
                                        if (track.day) {
                                            const tDatePlain = track.day.split('T')[0];
                                            const tDate = new Date(tDatePlain);
                                            tDate.setHours(0,0,0,0);
                                            
                                            // Check if the track was inside old boundaries, but now falls outside new boundaries
                                            if (tDate >= oldStart && tDate <= oldEnd) {
                                                if (tDate < newStart || tDate > newEnd) {
                                                    hasOutliers = true;
                                                }
                                            }
                                        }
                                    });
                                });
                            }
                            
                            if (hasOutliers) {
                                Modal.confirm({
                                    title: 'Внимание!',
                                    content: 'Вы сокращаете даты мероприятия. На удаляемые дни уже назначены треки и сессии. Они перестанут отображаться в общей сетке программы. Вы уверены, что хотите сохранить новые даты?',
                                    okText: 'Да, сократить',
                                    cancelText: 'Отмена',
                                    okType: 'danger',
                                    onOk: () => {
                                        handleSave(values, true);
                                    }
                                });
                                return; // Stop execution and wait for confirm
                            }
                        } catch(err) {
                            console.error('Failed to check structure for outliers', err);
                        }
                    }
                }
            }

            if (editingEventId) {
                await axios.patch(`/api/events/${editingEventId}`, payload);
                message.success('Мероприятие обновлено');
                setIsModalVisible(false);
                setEditingEventId(null);
                form.resetFields();
                fetchEvents();
            } else {
                const response = await axios.post('/api/events', payload);
                message.success('Мероприятие создано');
                setIsModalVisible(false);
                setEditingEventId(null);
                form.resetFields();
                navigate(`/events/${response.data.id}/program`);
            }
        } catch (error) {
            console.error('Failed to save event:', error);
            message.error('Ошибка сохранения мероприятия');
        }
    };

    const handleEditClick = (record: Event) => {
        setEditingEventId(record.id);
        form.setFieldsValue({
            name: record.name,
            dates: [dayjs(record.startDate), dayjs(record.endDate)],
            description: record.description || '', // assuming the record might have description
            location: record.location,
            eventLogoUrl: record.eventLogoUrl,
        });
        setIsModalVisible(true);
    };

    const handleDeleteConfirm = async (record: Event) => {
        try {
            await axios.delete(`/api/events/${record.id}`);
            message.success('Мероприятие удалено');
            fetchEvents();
        } catch (error) {
            console.error('Failed to delete event:', error);
            message.error('Ошибка удаления мероприятия');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 80,
        },
        {
            title: 'Дата',
            key: 'date',
            render: (_: any, record: Event) => (
                <span>
                    {dayjs(record.startDate).format('YYYY.MM.DD')}
                    {record.startDate !== record.endDate && ` - ${dayjs(record.endDate).format('YYYY.MM.DD')}`}
                </span>
            ),
        },
        {
            title: 'Название',
            dataIndex: 'name',
            key: 'name',
            render: (text: string, record: Event) => (
                <a onClick={() => navigate(`/events/${record.id}/program`)} style={{ fontWeight: 500 }}>
                    {text}
                </a>
            ),
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'published') color = 'green';
                if (status === 'draft') color = 'orange';
                if (status === 'archived') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
        },
        {
            title: 'Действия',
            key: 'action',
            render: (_: any, record: Event) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        ghost
                        icon={<ExperimentOutlined />}
                        onClick={() => navigate(`/events/${record.id}/program`)}
                    >
                        Программа
                    </Button>
                    <Button
                        type="default"
                        icon={<EditOutlined />}
                        onClick={() => handleEditClick(record)}
                    >
                        Изменить
                    </Button>
                    {user?.isSuperAdmin && (
                        <div onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}>
                            <Popconfirm
                                title="Удалить мероприятие?"
                                description={`удалить мероприятие "${record.name}" (необратимо)?`}
                                onConfirm={() => handleDeleteConfirm(record)}
                                okText="Удалить"
                                cancelText="Отмена"
                                okButtonProps={{ danger: true }}
                            >
                                <Button
                                    danger
                                    icon={<DeleteOutlined />}
                                />
                            </Popconfirm>
                        </div>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title="Все мероприятия"
            extra={[
                user?.isSuperAdmin ? (
                    <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingEventId(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}>
                        Создать мероприятие
                    </Button>
                ) : null
            ]}
        >
            <Table
                columns={columns}
                dataSource={events}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            <Modal
                title={editingEventId ? "Редактирование мероприятия" : "Новое мероприятие"}
                open={isModalVisible}
                onCancel={() => {
                    setIsModalVisible(false);
                    setEditingEventId(null);
                    form.resetFields();
                }}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                >
                    <Form.Item
                        name="name"
                        label="Название"
                        rules={[{ required: true, message: 'Введите название мероприятия' }]}
                    >
                        <Input placeholder="Например: Upgrade Retail Autumn 2026" />
                    </Form.Item>

                    <Form.Item
                        name="dates"
                        label="Даты проведения"
                        rules={[{ required: true, message: 'Выберите даты' }]}
                    >
                        <DatePicker.RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Описание"
                    >
                        <Input.TextArea rows={3} placeholder="Краткое описание" />
                    </Form.Item>

                    <Form.Item
                        name="location"
                        label="Место проведения"
                    >
                        <Input placeholder="Например: ЦМТ, Москва" />
                    </Form.Item>

                    <Form.Item
                        name="eventLogoUrl"
                        label="URL логотипа мероприятия (для персонализации памяток)"
                    >
                        <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default EventsList;