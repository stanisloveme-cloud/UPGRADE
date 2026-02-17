import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { useNavigate, useLocation } from 'react-router-dom';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const from = location.state?.from?.pathname || '/dashboard';

    const onFinish = async (values: any) => {
        setLoading(true);
        setError(null); // Clear previous errors
        try {
            // Use relative path - assuming proxy or same origin
            const response = await axios.post('/auth/login', {
                username: values.username,
                password: values.password,
            });

            if (response.data.access_token) {
                login(response.data.access_token);
                message.success('Вход выполнен успешно');
                navigate(from, { replace: true });
            }
        } catch (err: any) {
            console.error('Login failed:', err);
            const errorMessage = err.response?.data?.message === 'Unauthorized'
                ? 'Неверный email или пароль'
                : (err.response?.data?.message || 'Ошибка сервера');

            setError(errorMessage);
            message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#f0f2f5'
        }}>
            <Card hoverable style={{ width: 400, padding: 20 }}>
                <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    {/* Use text logo if image is not available yet */}
                    <Title level={3}>UPGRADE CRM</Title>
                    <Text type="secondary">Вход в систему</Text>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    {error && (
                        <Alert
                            message="Ошибка"
                            description={error}
                            type="error"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                    )}
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: 'Введите email!' }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="Email" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: 'Введите пароль!' }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="Пароль" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
