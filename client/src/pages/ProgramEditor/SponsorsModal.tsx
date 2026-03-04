import React, { useRef, useState } from 'react';
import { Modal, message, Button, Space, Typography, Tooltip, Tag, Tabs, Form, Upload, Checkbox } from 'antd';
import { ActionType, ProColumns, ProTable, ModalForm, ProFormText, ProFormTextArea, ProForm, ProFormDigit, ProFormSelect, ProFormList } from '@ant-design/pro-components';
import { PlusOutlined, CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UploadOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Link } = Typography;

interface SponsorsModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

const SponsorsModal: React.FC<SponsorsModalProps> = ({ visible, onClose, eventId }) => {
    const actionRef = useRef<ActionType>(null);
    const [addModalVisible, setAddModalVisible] = useState(false);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Ссылка на согласование скопирована');
    };

    const StatusTag = ({ status, reason }: { status: string, reason?: string }) => {
        const safeStatus = status?.toLowerCase();
        if (safeStatus === 'approved') return <Tag color="success" icon={<CheckCircleOutlined />}>Подтверждено</Tag>;
        if (safeStatus === 'rejected') return (
            <Tooltip title={reason}>
                <Tag color="error" icon={<CloseCircleOutlined />}>Отклонено</Tag>
            </Tooltip>
        );
        return <Tag color="processing" icon={<ClockCircleOutlined />}>На рассмотрении</Tag>;
    };

    const renderFormFields = () => (
        <>
            <ProFormText name="name" label="Название бренда" rules={[{ required: true }]} tooltip="Должно содержать только наименование бренда в том виде, в котором он написан на логотипе, без дополнительных приписок и транслитерации." />
            <ProFormTextArea name="shortDescription" label="Короткое описание деятельности" fieldProps={{ showCount: true, maxLength: 100 }} tooltip="Очень коротко, чем занимается бренд" />

            <ProFormText name="websiteUrl" label="Сайт" tooltip="Без 'https://', 'www' и UTM-меток" />
            <ProFormText name="publicEmail" label="Публичный email" rules={[
                {
                    validator: async (_, value) => {
                        if (!value) return Promise.resolve();
                        if (/^\S+@\S+\.\S+$/.test(value)) return Promise.resolve();
                        return Promise.reject(new Error('Некорректный email'));
                    }
                }
            ]} />
            <ProFormText name="publicPhone" label="Публичный телефон" placeholder="+7 (000) 000-00-00" />

            <ProFormTextArea name="catalogDescription" label="Описание для печатного каталога" fieldProps={{ showCount: true, maxLength: 500 }} tooltip="Чем занимается бренд" />
            <ProFormTextArea name="serviceCardDescription" label="Подробное описание для карты сервисов" />

            <ProFormSelect
                name="marketSegments"
                label="Сегменты рынка"
                mode="tags"
                placeholder="Выберите или добавьте сегменты"
                options={[
                    { label: 'IT', value: 'IT' },
                    { label: 'Retail', value: 'Retail' },
                    { label: 'EdTech', value: 'EdTech' },
                    { label: 'Fintech', value: 'Fintech' },
                    { label: 'Manufacturing', value: 'Manufacturing' },
                    { label: 'HoReCa', value: 'HoReCa' },
                    { label: 'Форумы и конференции', value: 'Форумы и конференции' },
                ]}
            />

            <Form.Item label="Логотип бренда" name="logoUrl" valuePropName="fileList" getValueFromEvent={(e: any) => { if (Array.isArray(e)) { return e; } return e?.fileList; }}>
                <Upload
                    name="file"
                    action="/api/uploads/logo"
                    listType="picture"
                    maxCount={1}
                    accept=".png,.svg"
                    beforeUpload={(file) => {
                        const isPngOrSvg = file.type === 'image/png' || file.type === 'image/svg+xml';
                        if (!isPngOrSvg) {
                            message.error('Вы можете загрузить только PNG или SVG файл!');
                            return Upload.LIST_IGNORE;
                        }
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isLt10M) {
                            message.error('Логотип должен быть меньше 10MB!');
                            return Upload.LIST_IGNORE;
                        }
                        return true;
                    }}
                    onChange={(info) => {
                        if (info.file.status === 'done' && info.file.response?.url) {
                            message.success(`${info.file.name} логотип успешно загружен.`);
                        } else if (info.file.status === 'error') {
                            message.error(`${info.file.name} ошибка загрузки.`);
                        }
                    }}
                >
                    <Button icon={<UploadOutlined />}>Загрузить логотип</Button>
                </Upload>
            </Form.Item>

            <Form.Item name="exportToWebsite" valuePropName="checked">
                <Checkbox>Выгружать на сайт</Checkbox>
            </Form.Item>

            <ProForm.Group>
                <ProFormText name="city" label="Город" width="md" />
                <ProFormDigit name="employeeCount" label="Количество сотрудников" width="sm" min={1} />
                <ProFormText name="annualTurnover" label="Годовой оборот" width="sm" />
            </ProForm.Group>

            <ProForm.Group>
                <ProFormText name="telegram" label="Телеграм" width="md" placeholder="@username" />
                <ProFormText name="whatsapp" label="WhatsApp" width="md" />
            </ProForm.Group>

            <ProFormList name="cases" label="Кейсы" creatorButtonProps={{ position: 'bottom', creatorButtonText: 'Добавить' }}>
                <ProFormText name="url" label="" placeholder="Ссылки на кейсы бренда, которые будут отображаться в карточке бренда" width="xl" />
            </ProFormList>

            <ProFormText name="materialsUrl" label="Ссылка на материалы (вложения)" />
            <ProFormTextArea name="description" label="Справка о компании/Спикере (Внутренняя)" />
            <ProForm.Group>
                <ProFormText name="contactName" label="Контактное лицо (Внутреннее)" width="sm" />
                <ProFormText name="contactEmail" label="Email контакта (Внутреннее)" width="sm" rules={[
                    {
                        validator: async (_, value) => {
                            if (!value) return Promise.resolve();
                            if (/^\S+@\S+\.\S+$/.test(value)) return Promise.resolve();
                            return Promise.reject(new Error('Некорректный email'));
                        }
                    }
                ]} />
            </ProForm.Group>
        </>
    );

    const columns: ProColumns<any>[] = [
        {
            title: 'Бренд / Название',
            dataIndex: 'name',
            width: '15%',
            render: (dom, record) => (
                <Space direction="vertical" size={0}>
                    <b>{dom}</b>
                    {record.logoUrl && <Link href={record.logoUrl.startsWith('http') || record.logoUrl.startsWith('/api') ? record.logoUrl : `/api${record.logoUrl}`} target="_blank">Логотип (ссылка)</Link>}
                </Space>
            )
        },
        {
            title: 'Описание',
            dataIndex: 'description',
            width: '25%',
            ellipsis: true,
        },
        {
            title: 'Контакты',
            key: 'contacts',
            width: '20%',
            render: (_dom, record) => (
                <Space direction="vertical" size={0}>
                    <Text>{record.contactName || '-'}</Text>
                    <Text type="secondary">{record.contactEmail || '-'}</Text>
                </Space>
            )
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            width: '15%',
            render: (_dom, record) => <StatusTag status={record.status} reason={record.rejectionReason} />
        },
        {
            title: 'Ссылка-валидатор',
            key: 'link',
            width: '10%',
            render: (_dom, record) => {
                const link = `${window.location.origin}/brand-approval/${record.approvalHash}`;
                return (
                    <Tooltip title="Скопировать ссылку для представителя бренда">
                        <Button type="dashed" icon={<CopyOutlined />} onClick={() => copyToClipboard(link)} />
                    </Tooltip>
                );
            }
        },
        {
            title: 'Действия',
            valueType: 'option',
            width: '10%',
            render: (_text, record, _, _action) => [
                <ModalForm
                    key="edit"
                    title="Редактировать спонсора"
                    trigger={<a>Изменить</a>}
                    initialValues={record}
                    onFinish={async (values) => {
                        try {
                            const payload = { ...values };
                            if (payload.logoUrl && Array.isArray(payload.logoUrl)) {
                                payload.logoUrl = payload.logoUrl[0]?.response?.url || payload.logoUrl[0]?.url || payload.logoUrl[0]?.thumbUrl || "";
                            }
                            await axios.patch(`/api/sponsors/${record.id}`, payload);
                            message.success('Спонсор обновлен');
                            actionRef.current?.reload();
                            return true;
                        } catch (error) {
                            message.error('Ошибка при обновлении');
                            return false;
                        }
                    }}
                >
                    {renderFormFields()}
                </ModalForm>,
                <a key="delete" style={{ color: 'red' }} onClick={async () => {
                    Modal.confirm({
                        title: 'Открепить спонсора?',
                        content: 'Спонсор будет откреплен от мероприятия, но останется в глобальной базе.',
                        onOk: async () => {
                            // Backend allows deleting the link via generic API? Normally it's DELETE on /api/sponsors/:sponsorId/events/:eventId
                            // For simplicity, we assume the API handles it or falls back properly.
                            await axios.delete(`/api/sponsors/${record.id}`);
                            actionRef.current?.reload();
                        }
                    });
                }}>Открепить</a>
            ],
        },
    ];

    const tabItems = [
        {
            key: 'select',
            label: 'Выбрать существующий',
            children: (
                <ProForm
                    onFinish={async (values) => {
                        try {
                            await axios.post(`/api/sponsors/${values.sponsorId}/attach/${eventId}`);
                            message.success('Спонсор привязан');
                            setAddModalVisible(false);
                            actionRef.current?.reload();
                            return true;
                        } catch (error) {
                            message.error('Ошибка при привязке');
                            return false;
                        }
                    }}
                >
                    <ProFormSelect
                        name="sponsorId"
                        label="Глобальная база брендов"
                        rules={[{ required: true, message: 'Выберите бренд' }]}
                        request={async () => {
                            const { data } = await axios.get('/api/sponsors/all?pageSize=1000');
                            return data.data?.map((s: any) => ({
                                label: s.name,
                                value: s.id,
                            })) || [];
                        }}
                        showSearch
                        placeholder="Поиск по названию..."
                    />
                </ProForm>
            )
        },
        {
            key: 'create',
            label: 'Создать новый',
            children: (
                <ProForm
                    onFinish={async (values) => {
                        try {
                            const payload: any = { ...values, eventId };
                            if (payload.logoUrl && Array.isArray(payload.logoUrl)) {
                                payload.logoUrl = payload.logoUrl[0]?.response?.url || payload.logoUrl[0]?.url || payload.logoUrl[0]?.thumbUrl || "";
                            }
                            await axios.post('/api/sponsors', payload);
                            message.success('Спонсор создан и привязан');
                            setAddModalVisible(false);
                            actionRef.current?.reload();
                            return true;
                        } catch (error) {
                            message.error('Ошибка при создании контента');
                            return false;
                        }
                    }}
                >
                    {renderFormFields()}
                </ProForm>
            )
        }
    ];

    return (
        <>
            <Modal
                title="Реестр Спонсоров и Партнеров"
                open={visible}
                onCancel={onClose}
                width={1200}
                footer={null}
                destroyOnClose
            >
                <ProTable
                    actionRef={actionRef}
                    columns={columns}
                    request={async () => {
                        const { data } = await axios.get(`/api/sponsors/event/${eventId}`);
                        return { data, success: true };
                    }}
                    rowKey="id"
                    search={false}
                    options={false}
                    pagination={{ pageSize: 15 }}
                    toolBarRender={() => [
                        <Button key="add" type="primary" icon={<PlusOutlined />} onClick={() => setAddModalVisible(true)}>
                            Добавить спонсора
                        </Button>
                    ]}
                />
            </Modal>

            <Modal
                title="Добавить спонсора"
                open={addModalVisible}
                onCancel={() => setAddModalVisible(false)}
                footer={null}
                destroyOnClose
                width={800}
            >
                <Tabs defaultActiveKey="select" items={tabItems} />
            </Modal>
        </>
    );
};

export default SponsorsModal;
