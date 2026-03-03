import { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormSelect, ProFormSwitch } from '@ant-design/pro-components';
import { message, Form } from 'antd';
import axios from 'axios';

interface UserModalProps {
    visible: boolean;
    onClose: () => void;
    onSuccess: () => void;
    user?: any;
}

export default function UserModal({ visible, onClose, onSuccess, user }: UserModalProps) {
    const [form] = Form.useForm();
    const isEdit = !!user;

    useEffect(() => {
        if (visible && user) {
            form.setFieldsValue({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                isActive: user.isActive,
                isSuperAdmin: user.isSuperAdmin,
                canManageSpeakers: user.canManageSpeakers,
                eventIds: user.events?.map((ue: any) => ue.event.id) || []
            });
        } else if (visible) {
            form.resetFields();
            form.setFieldValue('isActive', true);
            form.setFieldValue('canManageSpeakers', false);
            form.setFieldValue('isSuperAdmin', false);
        }
    }, [visible, user, form]);

    const handleSubmit = async (values: any) => {
        try {
            const payload = {
                ...values,
            };

            // If password is empty string (user left it blank for invite), strip it completely 
            // from the payload so backend DTO doesn't see an empty string and throw @MinLength(6).
            if (!payload.password || payload.password.trim() === '') {
                delete payload.password;
            }

            if (isEdit) {
                // Strip username so backend doesn't reject UpdateUserDto due to strict whitelisting
                delete payload.username;

                await axios.put(`/api/users/${user.id}`, payload);
                message.success('Пользователь обновлен');
            } else {
                await axios.post('/api/users', payload);
                message.success('Пользователь создан');
            }
            onSuccess();
            return true;
        } catch (error: any) {
            console.error("USER_MODAL_API_ERROR_DUMP:", error);

            if (error.response?.data?.message) {
                const msg = Array.isArray(error.response.data.message)
                    ? error.response.data.message.join(', ')
                    : error.response.data.message;
                message.error(msg);
                console.error("Backend Error Message:", msg);
            } else {
                message.error('Произошла ошибка при сохранении');
            }
            return false;
        }
    };

    return (
        <ModalForm
            title={isEdit ? 'Редактировать менеджера' : 'Новый менеджер'}
            open={visible}
            form={form}
            onOpenChange={(v) => !v && onClose()}
            onFinish={handleSubmit}
            onFinishFailed={(errorInfo: any) => {
                console.error("USER_MODAL_VALIDATION_ERROR_DUMP:", errorInfo);
                if (errorInfo.errorFields && errorInfo.errorFields.length > 0) {
                    message.error(`Ошибка валидации: ${errorInfo.errorFields[0].errors[0]}`);
                }
            }}
            modalProps={{
                destroyOnClose: true,
                maskClosable: false,
            }}
            submitter={{
                submitButtonProps: {
                    disabled: false,
                },
            }}
        >
            <ProFormText
                name="firstName"
                label="Имя"
                placeholder="Например: Иван"
            />

            <ProFormText
                name="lastName"
                label="Фамилия"
                placeholder="Например: Иванов"
            />

            <ProFormText
                name="username"
                label="Логин"
                rules={[{ required: true, message: 'Обязательное поле' }]}
                disabled={isEdit}
                placeholder="Manager Login (уникальный)"
            />

            <ProFormText
                name="email"
                label="Email"
                placeholder="Для сброса пароля и уведомлений"
                rules={[
                    { required: true, message: 'Обязательное поле' },
                    { type: 'email', message: 'Некорректный email' }
                ]}
            />

            <ProFormText.Password
                name="password"
                label={isEdit ? 'Новый пароль (оставьте пустым, чтобы не менять)' : 'Пароль (оставьте пустым для отправки Email-приглашения)'}
                rules={[{ min: 6, message: 'Минимум 6 символов' }]}
            />

            <ProFormSwitch
                name="isActive"
                label="Активен (Разрешить вход)"
            />

            <ProFormSwitch
                name="canManageSpeakers"
                label="Разрешить управлять спикерами"
            />

            <ProFormSwitch
                name="isSuperAdmin"
                label="Суперадминистратор (Полный доступ)"
            />

            <ProFormSelect
                name="eventIds"
                label="Доступ к мероприятиям (Конференциям)"
                mode="multiple"
                request={async () => {
                    try {
                        const { data } = await axios.get('/api/events');
                        return data.map((e: any) => ({
                            label: e.name,
                            value: e.id
                        }));
                    } catch (e) {
                        return [];
                    }
                }}
                placeholder="Выберите мероприятия, которыми может управлять менеджер"
                rules={[{ required: true, message: 'Минимум одно мероприятие' }]}
            />
        </ModalForm>
    );
}
