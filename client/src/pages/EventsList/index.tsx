import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Tag, Button, Space, message, Modal, Form, Input, DatePicker } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined, PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthProvider';

interface Event {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    status: 'draft' | 'published' | 'archived';
}

const EventsList: React.FC = () => {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
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

    const handleCreate = async (values: any) => {
        try {
            const payload = {
                name: values.name,
                description: values.description,
                startDate: values.dates[0].toISOString(),
                endDate: values.dates[1].toISOString(),
            };
            const response = await axios.post('/api/events', payload);
            message.success('Мероприятие создано');
            setIsModalVisible(false);
            form.resetFields();
            // Redirect to the new event's program editor
            navigate(`/events/${response.data.id}/program`);
        } catch (error) {
            console.error('Failed to create event:', error);
            message.error('Ошибка создания мероприятия');
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
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title="Все мероприятия"
            extra={[
                user?.isSuperAdmin ? (
                    <Button key="create" type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
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
                title="Новое мероприятие"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreate}
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
                </Form>
            </Modal>
        </PageContainer>
    );
};

export default EventsList;
