import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Tag, Button, Space, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ExperimentOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

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
    const navigate = useNavigate();

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
        <PageContainer title="Все мероприятия">
            <Table
                columns={columns}
                dataSource={events}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </PageContainer>
    );
};

export default EventsList;
