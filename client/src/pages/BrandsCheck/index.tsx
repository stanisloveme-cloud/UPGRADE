import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable, ActionType, ProColumns, ModalForm, ProFormText, ProFormTextArea, ProFormSelect, ProForm, ProFormDigit, ProFormList } from '@ant-design/pro-components';
import { Button, Tag, Typography, Tooltip, message, Space, Avatar } from 'antd';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Text, Link } = Typography;

const BrandsCheck: React.FC = () => {
    const actionRef = useRef<ActionType>(null);
    const [managers, setManagers] = useState([]);

    useEffect(() => {
        const fetchManagers = async () => {
            try {
                const { data } = await axios.get('/api/users/managers');
                setManagers(data.map((m: any) => ({
                    label: `${m.firstName || m.username} ${m.lastName || ''}`.trim(),
                    value: m.id
                })));
            } catch (error) {
                console.error('Failed to fetch managers', error);
            }
        };
        fetchManagers();
    }, []);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        message.success('Ссылка на согласование скопирована');
    };

    const StatusTag = ({ status, reason }: { status: string, reason?: string }) => {
        const safeStatus = status?.toLowerCase();
        if (safeStatus === 'approved') return <Tag color="success" icon={<CheckCircleOutlined />}>Данные верны</Tag>;
        if (safeStatus === 'rejected') return (
            <Tooltip title={reason}>
                <Tag color="error" icon={<CloseCircleOutlined />}>Требует правки</Tag>
            </Tooltip>
        );
        return <Tag color="processing" icon={<ClockCircleOutlined />}>Нет ответа</Tag>;
    };

    const renderFormFields = () => (
        <>
            <ProForm.Group title="Системная информация (Только для Администраторов)">
                <ProFormSelect
                    name="status"
                    label="Статус проверки"
                    options={[
                        { label: 'Нет ответа (Pending)', value: 'pending' },
                        { label: 'Данные верны (Approved)', value: 'approved' },
                        { label: 'Требует правки (Rejected)', value: 'rejected' },
                    ]}
                    width="sm"
                />
                <ProFormSelect
                    name="assignedManagerId"
                    label="Ответственный менеджер"
                    options={managers}
                    width="md"
                    placeholder="Выберите менеджера"
                />
            </ProForm.Group>

            <ProFormTextArea name="rejectionReason" label="Комментарий менеджера (Причина отклонения)" fieldProps={{ rows: 3 }} />

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
            />

            <ProFormText name="logoUrl" label="Ссылка на логотип" placeholder="https://..." />

            <ProForm.Group>
                <ProFormText name="city" label="Город" width="md" />
                <ProFormDigit name="employeeCount" label="Количество сотрудников" width="sm" min={1} />
                <ProFormText name="annualTurnover" label="Годовой оборот" width="sm" />
            </ProForm.Group>

            <ProForm.Group title="Контакты CFO">
                <ProFormText name="cfoName" label="ФИО CFO" width="md" />
                <ProFormText name="cfoPhone" label="Телефон CFO" width="sm" />
                <ProFormText name="cfoEmail" label="Email CFO" rules={[{ type: 'email' }]} width="md" />
            </ProForm.Group>

            <ProFormList
                name="cases"
                label="Кейсы (ссылки на статьи или презентации)"
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: 'Добавить ссылочный кейс',
                }}
            >
                <ProForm.Group>
                    <ProFormText name="label" label="Название ссылки" width="md" />
                    <ProFormText name="url" label="URL (начинается с https://)" width="md" />
                </ProForm.Group>
            </ProFormList>

        </>
    );

    const columns: ProColumns<any>[] = [
        {
            title: 'Название',
            dataIndex: 'name',
            render: (dom, entity) => (
                <Space direction="vertical" size={2}>
                    <Text strong>{dom}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {dayjs(entity.createdAt).format('D MMMM YYYY г. в HH:mm')}
                    </Text>
                </Space>
            ),
            width: 200,
            hideInSearch: true,
        },
        {
            title: 'Поиск по названию бренда',
            dataIndex: 'search',
            hideInTable: true,
        },
        {
            title: 'Категории',
            dataIndex: 'marketSegments',
            render: (_, entity) => (
                <Space direction="vertical" size={4}>
                    <Space align="start">
                        {entity.logoUrl ? <Avatar src={entity.logoUrl} shape="circle" /> : <Avatar>{entity.name?.[0]}</Avatar>}
                        <Text>{entity.shortDescription || 'Нет описания'}</Text>
                    </Space>
                    {entity.marketSegments && Array.isArray(entity.marketSegments) && (
                        <div>
                            {entity.marketSegments.map((segment: string) => (
                                <Text key={segment} type="secondary" style={{ fontSize: '12px', marginRight: 8 }}>
                                    • {segment}
                                </Text>
                            ))}
                        </div>
                    )}
                </Space>
            ),
            width: 300,
            hideInSearch: true,
        },
        {
            title: 'Ссылка',
            dataIndex: 'approvalHash',
            render: (_, entity) => {
                const url = `${window.location.origin}/brand-approval/${entity.approvalHash}`;
                return (
                    <Space>
                        <Link href={url} target="_blank" ellipsis style={{ maxWidth: 150 }}>
                            {url}
                        </Link>
                        <Tooltip title="Копировать">
                            <Button
                                icon={<CopyOutlined />}
                                size="small"
                                onClick={() => copyToClipboard(url)}
                            />
                        </Tooltip>
                    </Space>
                );
            },
            hideInSearch: true,
            width: 200,
        },
        {
            title: 'Статус проверки',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                all: { text: 'Все статусы', status: 'Default' },
                pending: { text: 'Нет ответа', status: 'Processing' },
                approved: { text: 'Данные верны', status: 'Success' },
                rejected: { text: 'Требует правки', status: 'Error' },
            },
            render: (_, entity) => (
                <Space direction="vertical" size={2}>
                    <StatusTag status={entity.status} reason={entity.rejectionReason} />
                    {entity.status === 'approved' || entity.status === 'rejected' ? (
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {dayjs(entity.createdAt).format('D MMMM YYYY г., HH:mm')}
                        </Text>
                    ) : null}
                </Space>
            ),
            width: 150,
        },
        {
            title: 'Действия',
            valueType: 'option',
            width: 150,
            render: (_, record) => [
                <ModalForm
                    key="edit"
                    title="Редактировать спонсора"
                    trigger={
                        <Button type="default" size="small" shape="round" style={{ borderColor: '#1890ff', color: '#1890ff' }}>
                            Редактировать
                        </Button>
                    }
                    initialValues={record}
                    onFinish={async (values) => {
                        try {
                            await axios.patch(`/api/sponsors/${record.id}`, values);
                            message.success('Данные обновлены');
                            actionRef.current?.reload();
                            return true;
                        } catch (error) {
                            message.error('Ошибка при обновлении');
                            return false;
                        }
                    }}
                >
                    {renderFormFields()}
                </ModalForm>
            ],
        },
        {
            title: 'Ответственный менеджер',
            dataIndex: 'managerId',
            valueType: 'select',
            fieldProps: {
                options: [{ label: 'Все менеджеры', value: '' }, ...managers]
            },
            render: (_, entity) => {
                if (!entity.assignedManager) return <Text type="secondary">Не назначен</Text>;
                return (
                    <Space direction="vertical" size={0}>
                        <Text>{entity.assignedManager.firstName} {entity.assignedManager.lastName}</Text>
                        {entity.assignedManager.phone && (
                            <Text type="secondary" style={{ fontSize: '12px' }}>{entity.assignedManager.phone}</Text>
                        )}
                    </Space>
                )
            },
            width: 200,
        }
    ];

    return (
        <PageContainer title="Проверка Брендов">
            <ProTable
                actionRef={actionRef}
                columns={columns}
                request={async (params) => {
                    const { status, search, managerId } = params;
                    let url = `/api/sponsors/all?`;
                    if (status && status !== 'all') url += `status=${status}&`;
                    if (search) url += `search=${search}&`;
                    if (managerId) url += `managerId=${managerId}&`;

                    const { data } = await axios.get(url);
                    return { data, success: true };
                }}
                rowKey="id"
                pagination={{ pageSize: 15 }}
                rowClassName={(record) => {
                    if (record.status === 'approved') return 'row-approved';
                    if (record.status === 'rejected') return 'row-rejected';
                    return 'row-pending';
                }}
            />
            <style>{`
                .row-approved > td { background-color: #f6ffed !important; }
                .row-rejected > td { background-color: #fff1f0 !important; }
                .row-pending > td { background-color: #fffbe6 !important; }
            `}</style>
        </PageContainer>
    );
};

export default BrandsCheck;
