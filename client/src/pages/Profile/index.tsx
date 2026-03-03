import { useRef } from 'react';
import { PageContainer, ProTable, ActionType, ProColumns, ProCard, ProForm, ProFormText } from '@ant-design/pro-components';
import { Button, message, Tag, Typography, Divider } from 'antd';
import axios from 'axios';
import { useAuth } from '../../auth/AuthProvider';

const { Title, Text } = Typography;

export default function ProfilePage() {
    const { user } = useAuth();
    const actionRef = useRef<ActionType>(null);

    const handleUpdateProfile = async (values: any) => {
        try {
            await axios.put('/api/users/profile', values);
            message.success('Данные профиля обновлены');
            setTimeout(() => {
                window.location.reload();
            }, 500);
            return true;
        } catch (error) {
            message.error('Ошибка при обновлении профиля');
            return false;
        }
    };

    const columns: ProColumns[] = [
        {
            title: 'Мероприятие',
            dataIndex: ['track', 'hall', 'event', 'name'],
            search: false,
            render: (_, record) => record.track?.hall?.event?.name || 'Неизвестно',
        },
        {
            title: 'День',
            dataIndex: ['track', 'day'],
            valueType: 'date',
            search: false,
            render: (_, record) => {
                if (!record.track?.day) return '-';
                /* Format date locally if needed, ProTable usually handles valueType: date */
                return new Date(record.track.day).toLocaleDateString('ru-RU');
            }
        },
        {
            title: 'Трек',
            dataIndex: ['track', 'name'],
            search: false,
        },
        {
            title: 'Время',
            search: false,
            render: (_, record) => `${record.startTime} - ${record.endTime}`,
        },
        {
            title: 'Название сессии',
            dataIndex: 'name',
            search: false,
        },
        {
            title: 'Роль в системе',
            search: false,
            render: () => <Tag color="blue">Организатор (Менеджер)</Tag>,
        },
    ];

    return (
        <PageContainer title="Личный кабинет">
            <ProCard direction="column" ghost gutter={[0, 16]}>

                <ProCard title="Мои данные" bordered headerBordered>
                    <div style={{ maxWidth: 600 }}>
                        <ProForm
                            initialValues={{
                                firstName: user?.firstName,
                                lastName: user?.lastName,
                                username: user?.username,
                                email: user?.email
                            }}
                            onFinish={handleUpdateProfile}
                            submitter={{
                                searchConfig: {
                                    submitText: 'Сохранить изменения',
                                    resetText: 'Отмена',
                                },
                            }}
                        >
                            <ProFormText
                                name="username"
                                label="Логин"
                                disabled
                                tooltip="Логин нельзя изменить самостоятельно. Обратитесь к администратору."
                            />
                            <ProFormText
                                name="email"
                                label="Email"
                                placeholder="Для сброса пароля и уведомлений"
                                rules={[{ type: 'email', message: 'Некорректный email' }]}
                            />
                            <ProFormText
                                name="firstName"
                                label="Имя"
                                placeholder="Ваше имя"
                            />
                            <ProFormText
                                name="lastName"
                                label="Фамилия"
                                placeholder="Ваша фамилия"
                            />
                        </ProForm>

                        <Divider />
                        <Title level={5}>Запросить сброс пароля</Title>
                        <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                            Если вы забыли пароль или хотите его сбросить через Email (в будущем), нажмите кнопку ниже. В данный момент функция проектируется.
                            (Сменить пароль прямо сейчас вы можете в правом верхнем меню).
                        </Text>
                        <Button disabled>Отправить письмо для сброса</Button>
                    </div>
                </ProCard>

                <ProCard title="Мои закрепленные сессии" bordered headerBordered>
                    <ProTable
                        actionRef={actionRef}
                        rowKey="id"
                        search={false}
                        options={false}
                        pagination={{ pageSize: 10 }}
                        request={async () => {
                            try {
                                const { data } = await axios.get('/api/sessions');
                                // Filter sessions where managerId matches the current user
                                const mySessions = data.filter((s: any) => s.managerId === user?.id);
                                return {
                                    data: mySessions,
                                    success: true,
                                    total: mySessions.length,
                                };
                            } catch (error) {
                                message.error('Ошибка загрузки сессий');
                                return { success: false, data: [] };
                            }
                        }}
                        columns={columns}
                    />
                </ProCard>

            </ProCard>
        </PageContainer>
    );
}
