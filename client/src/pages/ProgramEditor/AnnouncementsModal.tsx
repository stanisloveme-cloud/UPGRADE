import React, { useState, useEffect } from 'react';
import { Modal, message } from 'antd';
import { EditableProTable, ProColumns } from '@ant-design/pro-components';
import axios from 'axios';
import dayjs from 'dayjs';

interface AnnouncementsModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

type TrackAnnouncement = {
    id: number;
    name: string;
    hallName: string;
    materialType: string | null;
    readyDate: string | null;
    status: string;
    materialLink: string | null;
};

const AnnouncementsModal: React.FC<AnnouncementsModalProps> = ({ visible, onClose, eventId }) => {
    const [data, setData] = useState<TrackAnnouncement[]>([]);
    const [loading, setLoading] = useState(false);
    const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/events/${eventId}/announcements`);
            const formatted = res.data.map((item: any) => ({
                id: item.id,
                name: item.name,
                hallName: item.hall?.name || '-',
                materialType: item.materialType,
                readyDate: item.readyDate ? dayjs(item.readyDate).format('YYYY-MM-DD') : null,
                status: item.status || 'planned',
                materialLink: item.materialLink,
            }));
            setData(formatted);
        } catch (error) {
            message.error('Ошибка при загрузке анонсов');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && eventId) {
            fetchData();
        }
    }, [visible, eventId]);

    const handleSave = async (record: TrackAnnouncement) => {
        try {
            await axios.patch(`/api/events/${eventId}/announcements`, {
                updates: [record]
            });
            message.success('Анонс сохранен');
        } catch (error) {
            message.error('Ошибка сохранения');
            fetchData(); // reload to discard bad changes
        }
    };

    const columns: ProColumns<TrackAnnouncement>[] = [
        {
            title: 'Зал',
            dataIndex: 'hallName',
            readonly: true,
            width: '15%',
        },
        {
            title: 'Конференция / Трек',
            dataIndex: 'name',
            readonly: true,
            width: '25%',
            render: (dom) => <b>{dom}</b>
        },
        {
            title: 'Тип материала',
            dataIndex: 'materialType',
            valueType: 'text',
            width: '15%',
            fieldProps: {
                placeholder: 'Презентация, Пост...',
            }
        },
        {
            title: 'Дата готовности',
            dataIndex: 'readyDate',
            valueType: 'date',
            width: '15%',
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            valueType: 'select',
            width: '15%',
            valueEnum: {
                planned: { text: 'Запланирован', status: 'Default' },
                in_progress: { text: 'В работе', status: 'Processing' },
                ready: { text: 'Готово', status: 'Success' },
                published: { text: 'Опубликовано', status: 'Success' },
            },
        },
        {
            title: 'Ссылка',
            dataIndex: 'materialLink',
            valueType: 'text',
            width: '15%',
            render: (dom: any) => {
                if (!dom || dom === '-') return '-';
                return <a href={dom} target="_blank" rel="noreferrer">Перейти</a>;
            },
            fieldProps: {
                placeholder: 'https://...',
            }
        },
        {
            title: 'Опции',
            valueType: 'option',
            width: 100,
            render: (_text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.id);
                    }}
                >
                    Изменить
                </a>,
            ],
        },
    ];

    return (
        <Modal
            title="Анонсы деловой программы"
            open={visible}
            onCancel={onClose}
            width={1200}
            footer={null}
            destroyOnClose
        >
            <EditableProTable<TrackAnnouncement>
                rowKey="id"
                headerTitle="Контроль публикации материалов"
                maxLength={5}
                scroll={{ x: 900 }}
                loading={loading}
                recordCreatorProps={false}
                columns={columns}
                value={data}
                onChange={(val) => setData(val as TrackAnnouncement[])}
                editable={{
                    type: 'multiple',
                    editableKeys,
                    onSave: async (_rowKey, d, _row) => {
                        await handleSave(d);
                    },
                    onChange: setEditableRowKeys,
                }}
            />
        </Modal>
    );
};

export default AnnouncementsModal;
