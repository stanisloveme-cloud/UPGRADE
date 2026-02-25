import React, { useEffect, useState } from 'react';
import { Modal, Form, Input, Upload, Avatar, message, Button, Checkbox, Image, Tooltip } from 'antd';
import { UserOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import ImgCrop from 'antd-img-crop';

interface SpeakerModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<void>;
    initialValues?: any;
    loading?: boolean;
}

const SpeakerModal: React.FC<SpeakerModalProps> = ({ visible, onClose, onFinish, initialValues, loading }) => {
    const [form] = Form.useForm();
    const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
    const [uploading, setUploading] = useState(false);
    const [uploadPercent, setUploadPercent] = useState(0);

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue(initialValues);
                setPhotoUrl(initialValues.photoUrl);
            } else {
                form.resetFields();
                setPhotoUrl(undefined);
            }
        }
    }, [visible, initialValues, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();

            // ONLY include form fields explicitly defined in CreateSpeakerDto/UpdateSpeakerDto.
            const payload = {
                firstName: values.firstName,
                lastName: values.lastName,
                company: values.company,
                position: values.position,
                email: values.email,
                phone: values.phone,
                telegram: values.telegram,
                bio: values.bio,
                internalComment: values.internalComment,
                hasAssistant: values.hasAssistant,
                assistantName: values.assistantName,
                assistantContact: values.assistantContact,
                photoUrl,
                ...(initialValues?.id && { id: initialValues.id })
            };

            await onFinish(payload);
            onClose();
        } catch (error: any) {
            console.error('Validation or Finalization failed:', error);
            if (error.errorFields) {
                const fields = error.errorFields.map((f: any) => f.name.join('.')).join(', ');
                message.error(`Заполните корректно поля: ${fields}`);
            } else {
                message.error(`Ошибка сохранения: ${error.message || 'Неизвестная ошибка'}`);
            }
        }
    };

    const handleUploadChange = (info: any) => {
        if (info.file.status === 'uploading') {
            setUploading(true);
            setUploadPercent(info.file.percent || 0);
        } else if (info.file.status === 'done') {
            setUploading(false);
            setUploadPercent(100);
            const url = info.file.response?.url;
            if (url) {
                setPhotoUrl(url);
                message.success('Фото успешно загружено');
            }
        } else if (info.file.status === 'error') {
            setUploading(false);
            message.error('Ошибка загрузки фото');
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
                {/* Photo Upload with Crop */}
                <Form.Item label="Фото">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {photoUrl ? (
                            <Image
                                width={80}
                                height={80}
                                src={photoUrl.startsWith('/uploads') ? `/api${photoUrl}` : photoUrl}
                                style={{ borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid #f0f0f0' }}
                            />
                        ) : (
                            <Avatar
                                size={80}
                                icon={<UserOutlined />}
                                style={{ flexShrink: 0, border: '2px solid #f0f0f0' }}
                            />
                        )}
                        <div>
                            <ImgCrop
                                cropShape="round"
                                showGrid
                                rotationSlider
                                showReset
                                modalTitle="Обрезать фото"
                                modalOk="Сохранить"
                                modalCancel="Отмена"
                            >
                                <Upload
                                    name="file"
                                    action="/api/uploads/speaker-photo"
                                    headers={{
                                        authorization: `Bearer ${localStorage.getItem('access_token')}`,
                                    }}
                                    showUploadList={false}
                                    accept="image/*"
                                    onChange={handleUploadChange}
                                >
                                    <Button icon={<UploadOutlined />} loading={uploading}>
                                        {uploading ? `Загрузка... ${Math.round(uploadPercent)}%` : 'Загрузить фото'}
                                    </Button>
                                </Upload>
                            </ImgCrop>
                            {photoUrl && (
                                <Tooltip title="Удалить фото">
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => setPhotoUrl(undefined)}
                                        style={{ marginLeft: 8 }}
                                    />
                                </Tooltip>
                            )}
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 4 }}>
                                JPG / PNG, до 5 МБ. Обрезка — по кругу.
                            </div>
                        </div>
                    </div>
                </Form.Item>

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
                    name="bio"
                    label="Био (Описание)"
                >
                    <Input.TextArea rows={3} placeholder="Краткая биография" />
                </Form.Item>

                {/* Assistant Block */}
                <div style={{ marginTop: 24, padding: 16, background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' }}>
                    <Form.Item
                        name="hasAssistant"
                        valuePropName="checked"
                        style={{ marginBottom: 0 }}
                    >
                        <Checkbox style={{ fontWeight: 500 }}>
                            Связь через секретаря
                        </Checkbox>
                    </Form.Item>

                    <Form.Item
                        shouldUpdate={(prevValues, currentValues) => prevValues.hasAssistant !== currentValues.hasAssistant}
                        noStyle
                    >
                        {({ getFieldValue }) => {
                            const isAssistant = !!getFieldValue('hasAssistant');
                            return (
                                <div style={{ display: isAssistant ? 'flex' : 'none', gap: 16, marginTop: 16 }}>
                                    <Form.Item
                                        name="assistantName"
                                        label="Имя секретаря"
                                        style={{ flex: 1, marginBottom: 0 }}
                                        rules={[{ required: isAssistant, message: 'Обязательное поле' }]}
                                    >
                                        <Input placeholder="Имя" />
                                    </Form.Item>
                                    <Form.Item
                                        name="assistantContact"
                                        label="Телефон/контакт секретаря"
                                        style={{ flex: 1, marginBottom: 0 }}
                                        rules={[{ required: isAssistant, message: 'Обязательное поле' }]}
                                    >
                                        <Input placeholder="Телефон или Telegram" />
                                    </Form.Item>
                                </div>
                            );
                        }}
                    </Form.Item>
                </div>

                <Form.Item
                    name="internalComment"
                    label="Внутренний комментарий"
                    style={{ marginTop: 24 }}
                >
                    <Input.TextArea rows={2} placeholder="Заметки для команды" />
                </Form.Item>
            </Form>
        </Modal >
    );
};

export default SpeakerModal;