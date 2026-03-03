import React, { useRef } from 'react';
import { Modal, message, Button, Space, Typography, Tooltip, Tag } from 'antd';
import { ActionType, ProColumns, ProTable, ModalForm, ProFormText, ProFormTextArea, ProForm, ProFormDigit, ProFormSelect, ProFormList } from '@ant-design/pro-components';
import { PlusOutlined, CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Link } = Typography;

interface SponsorsModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

const SponsorsModal: React.FC<SponsorsModalProps> = ({ visible, onClose, eventId }) => {
    const actionRef = useRef<ActionType>(null);

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
            <ProFormText name="publicEmail" label="Публичный email" rules={[{ type: 'email' }]} />
            <ProFormText name="publicPhone" label="Публичный телефон" placeholder="+7 (000) 000-00-00" />

            <ProFormTextArea name="catalogDescription" label="Описание для печатного каталога" fieldProps={{ showCount: true, maxLength: 500 }} tooltip="Чем занимается бренд" />
            <ProFormTextArea name="serviceCardDescription" label="Подробное описание для карты сервисов" />

            <ProFormSelect
                name="marketSegments"
                label="Сегменты рынка"
                mode="tags"
                placeholder="Выберите или добавьте сегменты"
                options={[{ label: 'Форумы и конференции', value: 'Форумы и конференции' }]}
            />

            <ProFormText name="logoUrl" label="Ссылка на логотип" placeholder="https://..." />

            <ProForm.Group>
                <ProFormText name="city" label="Город" width="md" />
                <ProFormDigit name="employeeCount" label="Количество сотрудников" width="sm" min={1} />
                <ProFormText name="annualTurnover" label="Годовой оборот" width="sm" />
            </ProForm.Group>

            <ProForm.Group>
                <ProFormText name="telegram" label="Телеграм" width="md" placeholder="@username" />
                <ProFormText name="whatsapp" label="WhatsApp" width="md" />
            </ProForm.Group>

            <ProForm.Group>
                <ProFormText name="cfoName" label="Финансовый директор" width="md" />
                <ProFormText name="cfoPhone" label="Телефон финансового директора" width="sm" />
                <ProFormText name="cfoEmail" label="Email финансового директора" width="sm" rules={[{ type: 'email' }]} />
            </ProForm.Group>

            <ProFormList name="cases" label="Кейсы" creatorButtonProps={{ position: 'bottom', creatorButtonText: 'Добавить' }}>
                <ProFormText name="url" label="" placeholder="Ссылки на кейсы бренда, которые будут отображаться в карточке бренда" width="xl" />
            </ProFormList>

            <ProFormText name="materialsUrl" label="Ссылка на материалы (вложения)" />
            <ProFormTextArea name="description" label="Справка о компании/Спикере (Внутренняя)" />
            <ProForm.Group>
                <ProFormText name="contactName" label="Контактное лицо (Внутреннее)" width="sm" />
                <ProFormText name="contactEmail" label="Email контакта (Внутреннее)" width="sm" rules={[{ type: 'email' }]} />
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
                    {record.logoUrl && <Link href={record.logoUrl} target="_blank">Логотип (ссылка)</Link>}
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
                            await axios.patch(`/api/sponsors/${record.id}`, values);
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
                        title: 'Удалить спонсора?',
                        onOk: async () => {
                            await axios.delete(`/api/sponsors/${record.id}`);
                            actionRef.current?.reload();
                        }
                    });
                }}>Удалить</a>
            ],
        },
    ];

    return (
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
                    <ModalForm
                        key="create"
                        title="Добавить спонсора"
                        trigger={<Button type="primary" icon={<PlusOutlined />}>Создать карточку</Button>}
                        onFinish={async (values) => {
                            try {
                                await axios.post('/api/sponsors', { ...values, eventId });
                                message.success('Спонсор добавлен');
                                actionRef.current?.reload();
                                return true;
                            } catch (error) {
                                message.error('Ошибка при создании контента');
                                return false;
                            }
                        }}
                    >
                        {renderFormFields()}
                    </ModalForm>
                ]}
            />
        </Modal>
    );
};

export default SponsorsModal;
