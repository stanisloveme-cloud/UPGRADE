import React, { useRef, useState, useEffect } from 'react';
import { PageContainer, ProTable, ActionType, ProColumns, ProFormText, ProFormTextArea, ProFormSelect, ProForm, ProFormDigit, ProFormList } from '@ant-design/pro-components';
import { Button, Tag, Typography, Tooltip, message, Space, Upload, Form, Modal } from 'antd';
import { CopyOutlined, CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UploadOutlined, CloudDownloadOutlined } from '@ant-design/icons';
import { MarketSegmentSelector } from '../../components/MarketSegmentSelector';
import axios from 'axios';
import dayjs from 'dayjs';
import { SafeModalForm } from '../../components/SafeForms/SafeModalForm';
import { sanitizeFormValues } from '../../utils/formSanitizer';

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
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text);
            message.success('Ссылка на согласование скопирована');
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                message.success('Ссылка на согласование скопирована');
            } catch (err) {
                message.error('Не удалось скопировать ссылку');
            }
            document.body.removeChild(textArea);
        }
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

    const handleImportLegacyBrands = () => {
        Modal.confirm({
            title: 'Импортировать бренды из старой системы?',
            content: 'Это действие загрузит бренды из файла миграции. Бренды с совпадающими названиями будут пропущены.',
            okText: 'Импортировать',
            cancelText: 'Отмена',
            onOk: async () => {
                const hide = message.loading('Выполняется импорт...', 0);
                try {
                    const res = await axios.post('/api/sponsors/import-legacy');
                    hide();
                    if (res.data) {
                        message.success(`Импорт завершен. Успешно: ${res.data.success}, Ошибок: ${res.data.errors}`);
                    }
                    actionRef.current?.reload();
                } catch (error) {
                    hide();
                    console.error('Import failed', error);
                    message.error('Ошибка при импорте. Проверьте консоль.');
                }
            }
        });
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

            <ProForm.Item name="segments">
                <MarketSegmentSelector />
            </ProForm.Item>

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
                <Button type="dashed" style={{ pointerEvents: 'none', border: 'none', padding: 0 }}>
                    <input type="checkbox" style={{ marginRight: 8, pointerEvents: 'auto' }} onClick={(e) => {
                        const evt = document.createEvent('HTMLEvents');
                        evt.initEvent('change', false, true);
                        e.currentTarget.dispatchEvent(evt);
                    }} /> Выгружать на сайт
                </Button>
            </Form.Item>

            <ProForm.Group>
                <ProFormText name="city" label="Город" width="md" />
                <ProFormDigit name="employeeCount" label="Количество сотрудников" width="sm" min={1} />
                <ProFormText name="annualTurnover" label="Годовой оборот" width="sm" />
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
            dataIndex: 'segments',
            valueType: 'cascader',
            request: async () => {
                const { data } = await axios.get('/api/market-segments/tree');
                return data;
            },
            fieldProps: {
                changeOnSelect: true,
                fieldNames: { label: 'name', value: 'id', children: 'children' }
            },
            render: (_, entity) => (
                <Space direction="vertical" size={4}>
                    <Space align="start">
                        {entity.logoUrl || entity.logoFileUrl ? (
                            <img
                                src={entity.logoUrl || entity.logoFileUrl}
                                alt="logo"
                                style={{ width: 60, height: 40, objectFit: 'contain', background: '#fff', border: '1px solid #f0f0f0', borderRadius: 4 }}
                            />
                        ) : (
                            <div style={{ width: 60, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fafafa', border: '1px solid #f0f0f0', borderRadius: 4, color: '#bfbfbf', fontSize: 16, fontWeight: 'bold' }}>
                                {entity.name?.[0]?.toUpperCase()}
                            </div>
                        )}
                        <Text style={{ maxWidth: 200 }} ellipsis={{ tooltip: entity.shortDescription }}>
                            {entity.shortDescription || 'Нет описания'}
                        </Text>
                    </Space>
                    {entity.segments && Array.isArray(entity.segments) && (
                        <div>
                            {entity.segments.map((s: any) => (
                                <Text key={s.marketSegment?.id} type="secondary" style={{ fontSize: '12px', marginRight: 8 }}>
                                    • {s.marketSegment?.name}
                                </Text>
                            ))}
                        </div>
                    )}
                </Space>
            ),
            width: 300,
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
                <SafeModalForm
                    key="edit"
                    title="Редактировать спонсора"
                    width={1000}
                    trigger={
                        <Button type="default" size="small" shape="round" style={{ borderColor: '#1890ff', color: '#1890ff' }}>
                            Редактировать
                        </Button>
                    }
                    initialValues={sanitizeFormValues({
                        ...record,
                        segments: Array.isArray(record.segments) ? record.segments.map((s: any) => [s.marketSegmentId]) : undefined,
                        logoUrl: record.logoUrl || record.logoFileUrl ? [{ uid: '-1', name: 'logo', status: 'done', url: record.logoUrl || record.logoFileUrl, response: { url: record.logoUrl || record.logoFileUrl } }] : []
                    }, { arrayFields: ['cases'], listFields: ['cases'] })}
                    onDelete={async () => {
                        try {
                            await axios.delete(`/api/sponsors/${record.id}`);
                            message.success('Бренд успешно удален');
                            actionRef.current?.reload();
                            return true;
                        } catch (error) {
                            message.error('Ошибка при удалении');
                            return false;
                        }
                    }}
                    onFinish={async (values) => {
                        try {
                            const payload = { ...values };
                            if (payload.logoUrl && Array.isArray(payload.logoUrl)) {
                                payload.logoUrl = payload.logoUrl[0]?.response?.url || payload.logoUrl[0]?.url || payload.logoUrl[0]?.thumbUrl || "";
                            }
                            await axios.patch(`/api/sponsors/${record.id}`, payload);
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
                </SafeModalForm>
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
                search={{ labelWidth: 'auto' }}
                actionRef={actionRef}
                columns={columns}
                request={async (params) => {
                    const { status, search, managerId, segments } = params;
                    let url = `/api/sponsors/all?`;
                    if (status && status !== 'all') url += `status=${status}&`;
                    if (search) url += `search=${search}&`;
                    if (managerId) url += `managerId=${managerId}&`;

                    if (segments && Array.isArray(segments)) {
                        // Cascader filter passes array of arrays if multiple, or just array of id path: e.g. [1, 2, 3] from a single selection
                        const flatSegments = Array.from(new Set(segments.flat()));
                        url += `segments=${flatSegments.join(',')}&`;
                    }

                    const { data } = await axios.get(url);
                    return { data, success: true };
                }}
                rowKey="id"
                pagination={{ defaultPageSize: 100, showSizeChanger: true, pageSizeOptions: ['15', '50', '100', '200'] }}
                rowClassName={(record) => {
                    if (record.status === 'approved') return 'row-approved';
                    if (record.status === 'rejected') return 'row-rejected';
                    return 'row-pending';
                }}
                toolBarRender={() => [
                    <Button key="import" type="primary" icon={<CloudDownloadOutlined />} onClick={handleImportLegacyBrands}>
                        Импорт из старой базы
                    </Button>
                ]}
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
