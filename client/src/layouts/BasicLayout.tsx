import React from 'react';
import { ProLayout } from '@ant-design/pro-components';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Space } from 'antd';

export const BasicLayout: React.FC = () => {
    const location = useLocation();

    return (
        <ProLayout
            title="UPGRADE CRM"
            logo={null}
            location={{
                pathname: location.pathname,
            }}
            menuDataRender={() => [
                {
                    path: '/dashboard',
                    name: 'Дашборд',
                },
                {
                    path: '/events/2/program',
                    name: 'Редактор программы',
                },
                {
                    path: '/sales',
                    name: 'Продажи',
                },
            ]}
            menuItemRender={(item, dom) => (
                <Link to={item.path || '/'}>{dom}</Link>
            )}
            avatarProps={{
                src: 'https://gw.alipayobjects.com/zos/antfincdn/efFD%24IOql2/weixintupian_20170331104822.jpg',
                title: 'User',
                render: (_, dom) => {
                    return (
                        <Space>
                            <Avatar shape="square" size="small" icon={<UserOutlined />} />
                            User
                        </Space>
                    )
                }
            }}
            actionsRender={() => [<SettingOutlined key="settings" />]}
        >
            <Outlet />
        </ProLayout>
    );
};
