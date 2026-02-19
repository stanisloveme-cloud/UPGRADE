import React, { useEffect, useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Button, Space, message, Input, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import SpeakerModal from './SpeakerModal';

const SpeakersList: React.FC = () => {
    const [speakers, setSpeakers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const fetchSpeakers = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/speakers');
            setSpeakers(response.data);
        } catch (error) {
            console.error('Failed to fetch speakers:', error);
            message.error('Ошибка загрузки спикеров');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpeakers();
    }, []);

    const handleCreate = () => {
        setCurrentSpeaker(null);
        setModalVisible(true);
    };

    const handleEdit = (speaker: any) => {
        setCurrentSpeaker(speaker);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await axios.delete(`/api/speakers/${id}`);
            message.success('Спикер удален');
            fetchSpeakers();
        } catch (error) {
            console.error('Failed to delete speaker:', error);
            message.error('Ошибка удаления');
        }
    };

    const handleSave = async (values: any) => {
        try {
            if (values.id) {
                await axios.patch(`/api/speakers/${values.id}`, values);
                message.success('Спикер обновлен');
            } else {
                await axios.post('/api/speakers', values);
                message.success('Спикер добавлен');
            }
            fetchSpeakers();
        } catch (error) {
            console.error('Failed to save speaker:', error);
            message.error('Ошибка сохранения');
            throw error; // Let modal verify failure
        }
    };

    const filteredSpeakers = speakers.filter(s =>
        s.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
        s.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
        (s.company && s.company.toLowerCase().includes(searchText.toLowerCase()))
    );

    const columns = [
        {
            title: 'Фамилия Имя',
            key: 'name',
            render: (_: any, record: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {record.photoUrl && <img src={record.photoUrl} alt="" style={{ width: 24, height: 24, borderRadius: '50%', objectFit: 'cover' }} />}
                    <span style={{ fontWeight: 500 }}>{record.lastName} {record.firstName}</span>
                </div>
            ),
        },
        {
            title: 'Компания',
            dataIndex: 'company',
            key: 'company',
        },
        {
            title: 'Должность',
            dataIndex: 'position',
            key: 'position',
        },
        {
            title: 'Контакты',
            key: 'contacts',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={0} style={{ fontSize: 12 }}>
                    {record.email && <div>{record.email}</div>}
                    {record.telegram && <div style={{ color: '#1890ff' }}>{record.telegram}</div>}
                </Space>
            ),
        },
        {
            title: 'Действия',
            key: 'action',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                    <Popconfirm
                        title="Удалить спикера?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Да"
                        cancelText="Нет"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <PageContainer
            title="Спикеры"
            extra={[
                <Button key="create" type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
                    Добавить спикера
                </Button>
            ]}
        >
            <div style={{ marginBottom: 16 }}>
                <Input
                    placeholder="Поиск по имени или компании..."
                    prefix={<SearchOutlined />}
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 300 }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={filteredSpeakers}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 20 }}
                size="middle"
            />

            <SpeakerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onFinish={handleSave}
                initialValues={currentSpeaker}
            />
        </PageContainer>
    );
};

export default SpeakersList;
