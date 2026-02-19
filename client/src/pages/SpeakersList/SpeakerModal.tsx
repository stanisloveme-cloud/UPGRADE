import React, { useEffect } from 'react';
import { Modal, Form, Input } from 'antd';

interface SpeakerModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<void>;
    initialValues?: any;
    loading?: boolean;
}

const SpeakerModal: React.FC<SpeakerModalProps> = ({ visible, onClose, onFinish, initialValues, loading }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onFinish({ ...initialValues, ...values });
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
        }
    };

    return (
        <Modal
            title={initialValues ? "Редактирование спикера" : "Добавить спикера"}
            open={visible}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={600}
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
            >
                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="firstName"
                        label="Имя"
                        rules={[{ required: true, message: 'Введите имя' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="Иван" />
                    </Form.Item>
                    <Form.Item
                        name="lastName"
                        label="Фамилия"
                        rules={[{ required: true, message: 'Введите фамилию' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="Иванов" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="company"
                    label="Компания"
                >
                    <Input placeholder="Название компании" />
                </Form.Item>

                <Form.Item
                    name="position"
                    label="Должность"
                >
                    <Input placeholder="Должность" />
                </Form.Item>

                <div style={{ display: 'flex', gap: 16 }}>
                    <Form.Item
                        name="email"
                        label="Email"
                        rules={[{ type: 'email', message: 'Некорректный email' }]}
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="email@example.com" />
                    </Form.Item>
                    <Form.Item
                        name="telegram"
                        label="Telegram"
                        style={{ flex: 1 }}
                    >
                        <Input placeholder="@username" />
                    </Form.Item>
                </div>

                <Form.Item
                    name="phone"
                    label="Телефон"
                >
                    <Input placeholder="+7..." />
                </Form.Item>

                <Form.Item
                    name="photoUrl"
                    label="Ссылка на фото"
                >
                    <Input placeholder="https://..." />
                </Form.Item>

                <Form.Item
                    name="bio"
                    label="Био (Описание)"
                >
                    <Input.TextArea rows={3} placeholder="Краткая биография" />
                </Form.Item>

                <Form.Item
                    name="internalComment"
                    label="Внутренний комментарий"
                >
                    <Input.TextArea rows={2} placeholder="Заметки для команды" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default SpeakerModal;
