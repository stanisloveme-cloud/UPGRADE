import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Alert } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import axios from 'axios';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

export const ForgotPasswordPage: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const onFinish = async (values: { email: string }) => {
        setLoading(true);
        try {
            await axios.post('/auth/forgot-password', { email: values.email });
            setSuccess(true);
            message.success('Письмо отправлено (проверьте консоль сервера для тестовой ссылки)');
        } catch (err: any) {
            console.error('Forgot password failed:', err);
            message.error('Ошибка при отправке запроса');
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
                    <Text type="secondary">Сброс пароля</Text>
                </div>

                {success ? (
                    <div style={{ textAlign: 'center' }}>
                        <Alert
                            message="Инструкции отправлены"
                            description="Если этот email зарегистрирован, на него было отправлено письмо со ссылкой для восстановления пароля."
                            type="success"
                            showIcon
                            style={{ marginBottom: 24 }}
                        />
                        <Link to="/login">
                            <Button type="primary" block>Вернуться к входу</Button>
                        </Link>
                    </div>
                ) : (
                    <Form
                        name="forgot_password_form"
                        onFinish={onFinish}
                        size="large"
                    >
                        <Text style={{ display: 'block', marginBottom: 16 }}>
                            Введите ваш Email, и мы отправим ссылку для сброса пароля.
                        </Text>
                        <Form.Item
                            name="email"
                            rules={[
                                { required: true, message: 'Введите email!' },
                                { type: 'email', message: 'Некорректный email' }
                            ]}
                        >
                            <Input prefix={<MailOutlined />} placeholder="Ваш Email" />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block loading={loading}>
                                Отправить ссылку
                            </Button>
                        </Form.Item>

                        <div style={{ textAlign: 'center' }}>
                            <Link to="/login">Вернуться назад</Link>
                        </div>
                    </Form>
                )}
            </Card>
        </div>
    );
};
