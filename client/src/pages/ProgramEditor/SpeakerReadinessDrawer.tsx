import React, { useRef } from 'react';
import { Drawer, Tag, message } from 'antd';
import { ProTable, ActionType, ProColumns } from '@ant-design/pro-components';
import { FilePdfOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

interface SpeakerReadinessDrawerProps {
    visible: boolean;
    eventId: number;
    onClose: () => void;
}

const statusMap: Record<string, { text: string; color: string }> = {
    'confirmed': { text: 'Подтвержден', color: 'success' },
    'pre_confirmed': { text: 'Предв. подтвержден', color: 'processing' },
    'contact': { text: 'Контакт', color: 'default' },
    'to_contact': { text: 'Выйти на связь', color: 'warning' },
    'declined': { text: 'Отказ', color: 'error' },
    'review': { text: 'На рассмотрении', color: 'default' }
};

const SpeakerReadinessDrawer: React.FC<SpeakerReadinessDrawerProps> = ({ visible, eventId, onClose }) => {
    const actionRef = useRef<ActionType>(null);

    const columns: ProColumns<any>[] = [
        {
            title: 'Спикер',
            dataIndex: 'speakerName',
            hideInSearch: true,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {record.speaker?.lastName} {record.speaker?.firstName}
                    </div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {record.companySnapshot || record.speaker?.company}
                    </div>
                </div>
            )
        },
        {
            title: 'Поиск по имени',
            dataIndex: 'keyword',
            hideInTable: true,
        },
        {
            title: 'Сессия',
            dataIndex: 'sessionInfo',
            hideInSearch: true,
            width: 250,
            render: (_, record) => (
                <div>
                    <div style={{ fontWeight: 500, fontSize: '13px' }}>{record.session?.name}</div>
                    <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                        {record.session?.track?.hall?.name} • {record.session?.startTime} - {record.session?.endTime}
                    </div>
                </div>
            )
        },
        {
            title: 'Статус участия',
            dataIndex: 'status',
            valueType: 'select',
            valueEnum: {
                'confirmed': { text: 'Подтвержден' },
                'pre_confirmed': { text: 'Предв. подтвержден' },
                'contact': { text: 'Контакт' },
                'to_contact': { text: 'Выйти на связь' },
                'declined': { text: 'Отказ' },
                'review': { text: 'На рассмотрении' }
            },
            render: (_, record) => {
                const mapInfo = statusMap[record.status] || statusMap['review'];
                return <Tag color={mapInfo.color}>{mapInfo.text}</Tag>;
            }
        },
        {
            title: 'Презентация',
            dataIndex: 'presentationStatus',
            valueType: 'select',
            valueEnum: {
                'pending': { text: 'Ожидается (Нужна)' },
                'uploaded': { text: 'Загружена' },
                'not_required': { text: 'Не требуется' }
            },
            render: (_, record) => {
                if (!record.hasPresentation) {
                    return <span style={{ color: '#bfbfbf', fontSize: '12px' }}>Не требуется</span>;
                }
                if (record.hasPresentation && !record.presentationUrl) {
                    return (
                        <Tag color="error" icon={<ExclamationCircleOutlined />}>
                            Требуется
                        </Tag>
                    );
                }
                return (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                            Загружена
                        </Tag>
                        <a href={record.presentationUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FilePdfOutlined /> Скачать
                        </a>
                        {record.presentationUpdatedAt && (
                            <span style={{ fontSize: '11px', color: '#8c8c8c' }}>
                                {dayjs(record.presentationUpdatedAt).format('DD.MM HH:mm')}
                            </span>
                        )}
                    </div>
                );
            }
        }
    ];

    return (
        <Drawer
            title="Контроль готовности спикеров"
            width={900}
            open={visible}
            onClose={onClose}
            bodyStyle={{ padding: 0 }}
            destroyOnClose
        >
            <ProTable
                columns={columns}
                actionRef={actionRef}
                rowKey="id"
                search={{
                    layout: 'vertical',
                    defaultCollapsed: false,
                }}
                options={false}
                pagination={{
                    pageSize: 50,
                    showSizeChanger: true
                }}
                request={async (params) => {
                    try {
                        const { data } = await axios.get(`/api/events/${eventId}/session-speakers`);
                        
                        let filtered = data;

                        // Local search filtering
                        if (params.keyword) {
                            const kw = params.keyword.toLowerCase();
                            filtered = filtered.filter((s: any) => 
                                s.speaker?.firstName?.toLowerCase().includes(kw) ||
                                s.speaker?.lastName?.toLowerCase().includes(kw)
                            );
                        }

                        if (params.status) {
                            filtered = filtered.filter((s: any) => s.status === params.status);
                        }

                        if (params.presentationStatus) {
                            if (params.presentationStatus === 'not_required') {
                                filtered = filtered.filter((s: any) => !s.hasPresentation);
                            } else if (params.presentationStatus === 'pending') {
                                filtered = filtered.filter((s: any) => s.hasPresentation && !s.presentationUrl);
                            } else if (params.presentationStatus === 'uploaded') {
                                filtered = filtered.filter((s: any) => s.hasPresentation && !!s.presentationUrl);
                            }
                        }

                        // Order by status importance (Pending presentations first) if no active sorter
                        filtered.sort((a: any, b: any) => {
                            const aPending = a.hasPresentation && !a.presentationUrl ? 1 : 0;
                            const bPending = b.hasPresentation && !b.presentationUrl ? 1 : 0;
                            if (aPending !== bPending) return bPending - aPending; // DESC
                            return 0;
                        });

                        return {
                            data: filtered,
                            success: true,
                            total: filtered.length
                        };
                    } catch (error) {
                        message.error('Ошибка загрузки данных спикеров');
                        return { data: [], success: false, total: 0 };
                    }
                }}
            />
        </Drawer>
    );
};

export default SpeakerReadinessDrawer;
