import React from 'react';
import { ModalForm, ProFormText, ProFormTextArea, ProFormTimePicker, ProFormSelect } from '@ant-design/pro-components';
import { Button, Form, Input } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface SessionModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<boolean>;
    onDelete?: (id: number) => void;
    initialValues?: any;
    trackId?: number; // Pre-selected track for creation
    tracks?: { value: number; label: string }[]; // Available tracks for selection
    speakers?: { value: number; label: string }[];
}

const SessionModal: React.FC<SessionModalProps> = ({ visible, onClose, onFinish, onDelete, initialValues, trackId, tracks, speakers }) => {

    // Transform initial values (HH:mm strings to dayjs objects for TimePicker)
    const normalizedInitialValues = {
        ...initialValues,
        timeRange: initialValues?.startTime && initialValues?.endTime
            ? [dayjs(initialValues.startTime, 'HH:mm'), dayjs(initialValues.endTime, 'HH:mm')]
            : undefined,
        trackId: initialValues?.trackId || trackId,
        // Map speakers if they come as objects
        speakerIds: initialValues?.speakers?.map((s: any) => s.speakerId || s.id)
    };

    return (
        <ModalForm
            title={initialValues?.id ? "Редактирование сессии" : "Создание сессии"}
            open={visible}
            onOpenChange={(v) => !v && onClose()}
            onFinish={async (values) => {
                // Transform timeRange back to HH:mm strings
                const [start, end] = values.timeRange || [];

                const formatTime = (t: any) => {
                    if (!t) return null;
                    // If it's a dayjs object
                    if (t && typeof t.format === 'function') {
                        return t.format('HH:mm');
                    }
                    // If it's already a string, ensure it's 5 chars (HH:mm)
                    if (typeof t === 'string') {
                        return t.substring(0, 5);
                    }
                    return t;
                };

                const formattedValues: any = {
                    ...values,
                    startTime: formatTime(start),
                    endTime: formatTime(end),
                };
                delete formattedValues.timeRange;
                delete formattedValues.speakerIds;
                delete formattedValues.speakersDetails;

                // Format speakers array for backend
                if (values.speakerIds) {
                    formattedValues.speakers = values.speakerIds.map((id: any) => {
                        const details = values.speakersDetails?.[id] || {};
                        return {
                            speakerId: Number(id),
                            role: details.role || 'speaker', // default to speaker if not set
                            status: 'confirmed',
                            ...details
                        };
                    });
                }

                console.log('SessionModal onFinish fixed values:', formattedValues);
                return onFinish(formattedValues);
            }}
            initialValues={normalizedInitialValues}
            modalProps={{ destroyOnClose: true }}
            submitter={{
                searchConfig: {
                    submitText: 'Сохранить',
                    resetText: 'Отмена',
                },
                render: (_props, dom) => {
                    return [
                        initialValues?.id && onDelete && (
                            <Button
                                key="delete"
                                type="primary"
                                danger
                                onClick={() => {
                                    if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
                                        onDelete(initialValues.id);
                                    }
                                }}
                            >
                                Удалить
                            </Button>
                        ),
                        ...dom
                    ];
                },
            }}
        >
            <ProFormText
                name="name"
                label="Название"
                placeholder="Введите название сессии"
                rules={[{ required: true, message: 'Обязательное поле' }]}
            />

            <ProFormTextArea
                name="description"
                label="Описание"
                placeholder="Краткое описание"
            />

            <ProFormTimePicker.RangePicker
                name="timeRange"
                label="Время"
                fieldProps={{ format: 'HH:mm' }}
                rules={[{ required: true, message: 'Выберите время' }]}
            />

            <ProFormSelect
                name="trackId"
                label="Трек"
                options={tracks}
                disabled={!!trackId} // If track is pre-selected (e.g. valid drop), disable selection? Or allow moving?
                // For now, allow changing if not strictly enforced
                placeholder="Выберите трек"
                rules={[{ required: true, message: 'Выберите трек' }]}
            />

            {/* Enhanced Speaker Selection */}
            <ProFormSelect
                name="speakerIds"
                label="Добавить спикеров"
                mode="multiple"
                placeholder="Выберите спикеров"
                options={speakers}
                fieldProps={{
                    showSearch: true,
                    optionFilterProp: 'label',
                }}
            />

            {/* List of selected speakers with editable snapshots */}
            <Form.Item
                shouldUpdate={(prev, curr) => prev.speakerIds !== curr.speakerIds}
            >
                {({ getFieldValue }) => {
                    const selectedIds = getFieldValue('speakerIds') || [];
                    if (selectedIds.length === 0) return null;

                    return (
                        <div style={{ marginTop: 16, background: '#f5f5f5', padding: 12, borderRadius: 8 }}>
                            <div style={{ fontWeight: 'bold', marginBottom: 8 }}>Детали спикеров (Snapshot):</div>
                            {selectedIds.map((id: number) => {
                                const speaker = speakers?.find(s => s.value === id);
                                return (
                                    <div key={id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #e0e0e0' }}>
                                        <div style={{ fontWeight: 500, marginBottom: 4 }}>{speaker?.label}</div>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <Form.Item
                                                name={['speakersDetails', id, 'role']}
                                                noStyle
                                                initialValue={initialValues?.speakers?.find((s: any) => (s.speakerId || s.id) === id)?.role || 'speaker'}
                                            >
                                                <ProFormSelect
                                                    options={[
                                                        { value: 'speaker', label: 'Спикер' },
                                                        { value: 'moderator', label: 'Модератор' }
                                                    ]}
                                                    placeholder="Роль"
                                                    fieldProps={{ style: { width: 120 } }}
                                                />
                                            </Form.Item>
                                            <Form.Item
                                                name={['speakersDetails', id, 'companySnapshot']}
                                                noStyle
                                                initialValue={initialValues?.speakers?.find((s: any) => (s.speakerId || s.id) === id)?.companySnapshot}
                                            >
                                                <Input placeholder="Компания (на момент события)" style={{ flex: 1 }} />
                                            </Form.Item>
                                            <Form.Item
                                                name={['speakersDetails', id, 'positionSnapshot']}
                                                noStyle
                                                initialValue={initialValues?.speakers?.find((s: any) => (s.speakerId || s.id) === id)?.positionSnapshot}
                                            >
                                                <Input placeholder="Должность" style={{ flex: 1 }} />
                                            </Form.Item>
                                        </div>
                                        <div style={{ marginTop: 8 }}>
                                            <Form.Item
                                                name={['speakersDetails', id, 'presentationTitle']}
                                                noStyle
                                                initialValue={initialValues?.speakers?.find((s: any) => (s.speakerId || s.id) === id)?.presentationTitle}
                                            >
                                                <Input placeholder="Тема выступления / Презентация" prefix={<FileTextOutlined style={{ color: '#aaa' }} />} />
                                            </Form.Item>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            </Form.Item>
        </ModalForm>
    );
};

export default SessionModal;
