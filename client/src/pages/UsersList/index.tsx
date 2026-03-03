import { useRef, useState } from 'react';
import { PageContainer, ProTable, ProColumns } from '@ant-design/pro-components';
import { Button, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import axios from 'axios';
import UserModal from './UserModal';

export default function UsersList() {
    const actionRef = useRef<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);

    const columns: ProColumns[] = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 80,
            search: false,
        },
        {
            title: 'Имя Фамилия',
            render: (_, record) => {
                const name = [record.firstName, record.lastName].filter(Boolean).join(' ');
                return name ? name : <span style={{ color: '#ccc' }}>Не указано</span>;
            },
        },
        {
            title: 'Логин',
            dataIndex: 'username',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            render: (_, record) => record.email || <span style={{ color: '#ccc' }}>Не указан</span>,
        },
        {
            title: 'Статус',
            dataIndex: 'isActive',
            render: (_, record) => (
                <>
                    <Tag color={record.isActive ? 'green' : 'red'}>
                        {record.isActive ? 'Активен' : 'Заблокирован'}
                    </Tag>
                    {record.isSuperAdmin && <Tag color="gold" style={{ marginLeft: 8 }}>Супер-админ</Tag>}
                </>
            ),
        },
        {
            title: 'Мероприятия (Доступ)',
            dataIndex: 'events',
            render: (_, record) => {
                if (record.isSuperAdmin) return <Tag color="purple">Полный доступ ко всему</Tag>;
                if (!record.events || record.events.length === 0) return <Tag>Нет доступа</Tag>;
                return (
                    <>
                        {record.events.map((ue: any) => (
                            <Tag color="geekblue" key={ue.event.id}>{ue.event.name}</Tag>
                        ))}
                    </>
                );
            }
        },
        {
            title: 'Создан',
            dataIndex: 'createdAt',
            valueType: 'date',
            search: false,
        },
        {
            title: 'Действия',
            valueType: 'option',
            render: (_, record) => [
                <a
                    key="edit"
                    onClick={() => {
                        setEditingUser(record);
                        setModalVisible(true);
                    }}
                >
                    Редактировать
                </a>,
                <Popconfirm
                    key="delete"
                    title="Удалить менеджера?"
                    description="Это действие необратимо."
                    onConfirm={async () => {
                        try {
                            await axios.delete(`/api/users/${record.id}`);
                            message.success('Менеджер удален');
                            actionRef.current?.reload();
                        } catch (e) {
                            message.error('Ошибка при удалении');
                        }
                    }}
                    okText="Удалить"
                    cancelText="Отмена"
                    okButtonProps={{ danger: true }}
                >
                    <a style={{ color: 'red' }}>Удалить</a>
                </Popconfirm>,
            ],
        },
    ];

    return (
        <PageContainer>
            <ProTable
                headerTitle="Менеджеры системы"
                actionRef={actionRef}
                rowKey="id"
                search={false}
                request={async () => {
                    try {
                        const { data } = await axios.get('/api/users');
                        return {
                            data,
                            success: true,
                            total: data.length,
                        };
                    } catch (error) {
                        message.error('Ошибка загрузки пользователей');
                        return { success: false };
                    }
                }}
                columns={columns}
                toolBarRender={() => [
                    <Button
                        key="button"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setEditingUser(null);
                            setModalVisible(true);
                        }}
                        type="primary"
                    >
                        Создать менеджера
                    </Button>,
                ]}
            />
            {modalVisible && (
                <UserModal
                    visible={modalVisible}
                    onClose={() => setModalVisible(false)}
                    onSuccess={() => {
                        setModalVisible(false);
                        actionRef.current?.reload();
                    }}
                    user={editingUser}
                />
            )}
        </PageContainer>
    );
}
