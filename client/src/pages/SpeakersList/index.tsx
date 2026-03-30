import React, { useState } from 'react';
import { PageContainer } from '@ant-design/pro-components';
import { Table, Button, Space, message, Input, Popconfirm, Image } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, HistoryOutlined } from '@ant-design/icons';
import { 
    useSpeakersControllerFindAll, 
    speakersControllerCreate, 
    speakersControllerUpdate, 
    speakersControllerRemove 
} from '../../api/generated/speakers/speakers';
import { SpeakerEntity } from '../../api/generated/model';
import SpeakerModal from './SpeakerModal';
import SpeakerHistory from './SpeakerHistory';

const SpeakersList: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<SpeakerEntity | null>(null);
    const [searchText, setSearchText] = useState('');
    const [historyVisible, setHistoryVisible] = useState(false);
    const [currentHistoryId, setCurrentHistoryId] = useState<number | null>(null);

    // CDD Data Fetching
    const { data: response, isLoading: loading, mutate: refreshSpeakers } = useSpeakersControllerFindAll();
    const speakers = (Array.isArray(response) ? response : response?.data) || [];

    const handleShowHistory = (id: number) => {
        setCurrentHistoryId(id);
        setHistoryVisible(true);
    };

    const handleCreate = () => {
        setCurrentSpeaker(null);
        setModalVisible(true);
    };

    const handleEdit = (speaker: SpeakerEntity) => {
        setCurrentSpeaker(speaker);
        setModalVisible(true);
    };

    const handleDelete = async (id: number) => {
        try {
            await speakersControllerRemove(id);
            message.success('Спикер удален');
            refreshSpeakers();
        } catch (error) {
            console.error('Failed to delete speaker:', error);
            message.error('Ошибка удаления');
        }
    };

    const handleSave = async (values: any) => {
        try {
            if (values.id) {
                const { id, ...payload } = values;
                await speakersControllerUpdate(id, payload);
                message.success('Спикер обновлен');
            } else {
                await speakersControllerCreate(values);
                message.success('Спикер добавлен');
            }
            refreshSpeakers();
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
                    {record.photoUrl && (
                        <Image
                            src={record.photoUrl.startsWith('http') || record.photoUrl.startsWith('/api') ? record.photoUrl : `/api${record.photoUrl.startsWith('/') ? '' : '/'}${record.photoUrl}`}
                            fallback="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iNDAiIGZpbGw9IiNmMGYwZjAiLz48Y2lyY2xlIGN4PSI0MCIgY3k9IjMwIiByPSIxNSIgZmlsbD0iI2Q5ZDlkOSIvPjxwYXRoIGQ9Ik0yMCA3MEMyMCA1MCA2MCA1MCA2MCA3MCIgZmlsbD0iI2Q5ZDlkOSIvPjwvc3ZnPg=="
                            alt={`${record.firstName} ${record.lastName}`}
                            width={32}
                            height={32}
                            style={{ borderRadius: '50%', objectFit: 'cover', filter: 'grayscale(100%)' }}
                            preview={{ mask: null }}
                        />
                    )}
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
                    <Button
                        type="text"
                        icon={<HistoryOutlined />}
                        title="История"
                        onClick={() => handleShowHistory(record.id)}
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
                pagination={{ 
                    defaultPageSize: 20, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100', '200']
                }}
                size="middle"
            />

            <SpeakerModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onFinish={handleSave}
                initialValues={currentSpeaker}
            />

            <SpeakerHistory
                speakerId={currentHistoryId}
                visible={historyVisible}
                onClose={() => setHistoryVisible(false)}
            />
        </PageContainer>
    );
};

export default SpeakersList;