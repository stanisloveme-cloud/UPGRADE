import React from 'react';
import { ModalForm, ProFormText, ProFormTextArea, ProFormTimePicker, ProFormSelect } from '@ant-design/pro-components';
import { Button } from 'antd';
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

                const formattedValues = {
                    ...values,
                    startTime: formatTime(start),
                    endTime: formatTime(end),
                    // Ensure speakerIds are numbers (if array exists)
                    speakerIds: values.speakerIds?.map((id: any) => Number(id))
                };
                delete (formattedValues as any).timeRange;

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

            <ProFormSelect
                name="speakerIds"
                label="Спикеры"
                mode="multiple"
                placeholder="Выберите спикеров"
                options={speakers}
            />
        </ModalForm>
    );
};

export default SessionModal;
