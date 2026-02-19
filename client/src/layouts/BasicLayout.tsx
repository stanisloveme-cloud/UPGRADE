import React from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { Avatar, Space, Dropdown, MenuProps } from 'antd';
import { useAuth } from '../auth/AuthProvider';

export const BasicLayout: React.FC = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const menuItems: MenuProps['items'] = [
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
                        path: '/dashboard',
                        name: 'Дашборд',
                    },
                    {
                        path: '/events/1/program', // Points to the main seeded event
                        name: 'Редактор программы',
                    },
                    {
                        path: '/sales',
                        name: 'Продажи',
                    },
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
                            </Space>
                        </Dropdown>
                    )
                }
            }}
        >
            <Outlet />
        </ProLayout>
    );
};
