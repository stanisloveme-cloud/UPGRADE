import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;

export const ResetPasswordPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const token = searchParams.get('token');

    const onFinish = async (values: any) => {
        if (!token) {
            setError('Токен сброса пароля отсутствует в ссылке');
            return;
        }

        if (values.password !== values.confirm) {
            setError('Пароли не совпадают');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            await axios.post('/auth/reset-password', {
                token: token,
                newPassword: values.password
            });
            message.success('Пароль успешно изменен!');
            navigate('/login', { replace: true });
        } catch (err: any) {
            console.error('Reset password failed:', err);
            setError(err.response?.data?.message || 'Ошибка соединения или токен устарел');
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
                    <Title level={3}>UPGRADE CRM</Title>
                    <Text type="secondary">Создание нового пароля</Text>
                </div>

                {!token ? (
                    <Alert
                        message="Отсутствует токен"
                        description="Ссылка недействительна. Пожалуйста, запросите сброс пароля еще раз."
                        type="error"
                        showIcon
                        style={{ marginBottom: 24 }}
                    />
                ) : (
                    <Form
                        name="reset_password_form"
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
                            name="password"
                            rules={[
                                { required: true, message: 'Введите новый пароль!' },
                                { min: 6, message: 'Минимум 6 символов' }
                            ]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Новый пароль" />
                        </Form.Item>

                        <Form.Item
                            name="confirm"
                            rules={[{ required: true, message: 'Подтвердите пароль!' }]}
                        >
                            <Input.Password prefix={<LockOutlined />} placeholder="Повторите пароль" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Сохранить
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Link to="/login">Вернуться ко входу</Link>
                </div>
            </Card>
        </div>
    );
};
