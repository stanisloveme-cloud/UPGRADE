import React, { useState, useEffect } from 'react';
import { Modal, message, Button, Tag } from 'antd';
import { ProTable } from '@ant-design/pro-components';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { MenuOutlined } from '@ant-design/icons';
import axios from 'axios';

interface SpeakerSortingModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

const Row = (props: any) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: props['data-row-key'],
    });

    const style = {
        ...props.style,
        transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
        transition,
        cursor: 'move',
        ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
    };

    return (
        <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {props.children}
        </tr>
    );
};

const statusMap: Record<string, { text: string; color: string }> = {
    confirmed: { text: 'Подтвержден', color: 'green' },
    pre_confirmed: { text: 'Предварительно подтвержден', color: 'lime' },
    contact: { text: 'Контакт', color: 'blue' },
    to_contact: { text: 'Надо связаться', color: 'orange' },
    declined: { text: 'Отказ', color: 'red' },
    review: { text: 'На рассмотрении', color: 'default' },
};

const SpeakerSortingModal: React.FC<SpeakerSortingModalProps> = ({ visible, onClose, eventId }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/events/${eventId}/session-speakers`);
            setData(res.data);
            setHasChanges(false);
        } catch (error) {
            message.error('Ошибка при загрузке спикеров');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (visible && eventId) {
            fetchData();
        }
    }, [visible, eventId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = data.map((item, index) => ({ id: item.id, sortOrder: index }));
            await axios.patch(`/api/events/${eventId}/session-speakers/sort`, { updates });
            message.success('Порядок сохранен');
            setHasChanges(false);
        } catch (error) {
            message.error('Ошибка сохранения порядка');
        } finally {
            setSaving(false);
        }
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { delay: 50, tolerance: 25 },
        })
    );

    const onDragEnd = ({ active, over }: DragEndEvent) => {
        if (active.id !== over?.id) {
            setData((prevData) => {
                const activeIndex = prevData.findIndex((i) => i.id === active.id);
                const overIndex = prevData.findIndex((i) => i.id === over?.id);
                const newData = [...prevData];
                const [movedItem] = newData.splice(activeIndex, 1);
                newData.splice(overIndex, 0, movedItem);
                setHasChanges(true);
                return newData;
            });
        }
    };

    const handleExport = () => {
        // Simple CSV Export
        const headers = ["Спикер", "Компания", "Должность", "Зал", "Трек", "Сессия", "Статус"];
        const rows = data.map(item => [
            `${item.speaker.lastName} ${item.speaker.firstName}`,
            item.speaker.company || '',
            item.speaker.position || '',
            item.session.track.hall.name,
            item.session.track.name,
            item.session.name,
            statusMap[item.status]?.text || item.status
        ]);

        let csvContent = "data:text/csv;charset=utf-8,\uFEFF"
            + headers.join(";") + "\n"
            + rows.map(e => e.join(";")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "speakers_export.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const columns = [
        {
            title: '',
            dataIndex: 'sort',
            width: 50,
            className: 'drag-visible',
            render: () => <MenuOutlined style={{ cursor: 'grab', color: '#999' }} />,
            hideInSearch: true,
        },
        {
            title: 'Спикер',
            dataIndex: ['speaker', 'lastName'],
            render: (_: any, record: any) => (
                <div>
                    <b>{record.speaker.lastName} {record.speaker.firstName}</b>
                    {record.speaker.isSponsor && <Tag color="gold" style={{ marginLeft: 8 }}>Спонсор</Tag>}
                </div>
            ),
        },
        {
            title: 'Компания / Должность',
            dataIndex: ['speaker', 'company'],
            render: (_: any, record: any) => (
                <div>
                    <div>{record.speaker.company || '-'}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{record.speaker.position || '-'}</div>
                </div>
            )
        },
        {
            title: 'Зал',
            dataIndex: ['session', 'track', 'hall', 'name'],
            filters: Array.from(new Set(data.map(d => d.session.track.hall.name))).map(name => ({ text: name, value: name })),
            onFilter: (value: any, record: any) => record.session.track.hall.name === value,
        },
        {
            title: 'Трек',
            dataIndex: ['session', 'track', 'name'],
            filters: Array.from(new Set(data.map(d => d.session.track.name))).map(name => ({ text: name, value: name })),
            onFilter: (value: any, record: any) => record.session.track.name === value,
        },
        {
            title: 'Сессия',
            dataIndex: ['session', 'name'],
        },
        {
            title: 'Статус',
            dataIndex: 'status',
            filters: Object.entries(statusMap).map(([key, val]) => ({ text: val.text, value: key })),
            onFilter: (value: any, record: any) => record.status === value,
            render: (_: any, record: any) => {
                const map = statusMap[record.status] || { text: record.status, color: 'default' };
                return <Tag color={map.color}>{map.text}</Tag>;
            }
        },
    ];

    return (
        <Modal
            title="Сортировка и экспорт спикеров"
            open={visible}
            onCancel={onClose}
            width={1200}
            footer={null}
            destroyOnClose
        >
            <DndContext sensors={sensors} onDragEnd={onDragEnd}>
                <SortableContext
                    items={data.map((i) => i.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <ProTable
                        columns={columns}
                        dataSource={data}
                        rowKey="id"
                        loading={loading}
                        search={false}
                        pagination={false}
                        components={{
                            body: {
                                row: Row,
                            },
                        }}
                        toolBarRender={() => [
                            <Button key="export" onClick={handleExport}>
                                Экспорт в CSV
                            </Button>,
                            <Button
                                key="save"
                                type={hasChanges ? "primary" : "default"}
                                onClick={handleSave}
                                loading={saving}
                                disabled={!hasChanges}
                            >
                                Сохранить сортировку
                            </Button>
                        ]}
                    />
                </SortableContext>
            </DndContext>
        </Modal>
    );
};

export default SpeakerSortingModal;
