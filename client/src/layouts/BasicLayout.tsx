import React, { useState } from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, KeyOutlined } from '@ant-design/icons';
import { Avatar, Space, Dropdown, MenuProps, Modal, Form, Input, message } from 'antd';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';

export const BasicLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
    const [form] = Form.useForm();

    const handleChangePassword = async (values: any) => {
        try {
            await axios.post('/api/users/change-password', {
                newPassword: values.newPassword
            });
            message.success('Пароль успешно изменен');
            setIsPasswordModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Failed to change password:', error);
            message.error('Ошибка при изменении пароля');
        }
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'change-password',
            icon: <KeyOutlined />,
            label: 'Изменить пароль',
            onClick: () => setIsPasswordModalVisible(true),
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: () => {
                logout();
                navigate('/login');
            },
        },
    ];

    return (
        <ProLayout
            title="UPGRADE CRM"
            logo={null}
            location={{
                pathname: location.pathname,
            }}
            route={{
                routes: [
                    {
                        path: '/events',
                        name: 'Все мероприятия',
                    },
                    {
                        path: '/speakers',
                        name: 'Спикеры',
                    },
                    ...(user?.isSuperAdmin ? [{
                        path: '/sales',
                        name: 'Продажи',
                    }] : [])
                ]
            }}
            menuItemRender={(item, dom) => (
                <Link to={item.path || '/'}>{dom}</Link>
            )}
            avatarProps={{
                src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
                title: user?.username || 'User',
                render: (_, dom) => {
                    return (
                        <Dropdown menu={{ items: menuItems }}>
                            <Space>
                                <Avatar shape="square" size="small" icon={<UserOutlined />} />
                                {dom}
                                {user?.isSuperAdmin && <span style={{ fontSize: '10px', background: '#f5222d', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>ADMIN</span>}
                            </Space>
                        </Dropdown>
                    )
                }
            }}
        >
            <Outlet />

            <Modal
                title="Изменить пароль"
                open={isPasswordModalVisible}
                onCancel={() => setIsPasswordModalVisible(false)}
                onOk={() => form.submit()}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleChangePassword}
                >
                    <Form.Item
                        name="newPassword"
                        label="Новый пароль"
                        rules={[
                            { required: true, message: 'Введите новый пароль' },
                            { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
                        ]}
                    >
                        <Input.Password placeholder="Введите новый пароль" />
                    </Form.Item>
                </Form>
            </Modal>
        </ProLayout>
    );
};
