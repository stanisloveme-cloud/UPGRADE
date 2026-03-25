import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormTimePicker, ProFormSelect } from '@ant-design/pro-components';
import { Form, Button, message } from 'antd';
import dayjs from 'dayjs';

interface TrackModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<boolean>;
    onDelete?: (id: number) => void;
    initialValues?: any;
    hallId?: number;
    eventId: number;
    defaultDay?: string;
    availableDays?: any[]; // optional, if we need to implement dropdown later
}

const TrackModal: React.FC<TrackModalProps> = ({ visible, onClose, onFinish, onDelete, initialValues, hallId, defaultDay, availableDays }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    timeRange: [
                        dayjs(initialValues.startTime || '09:00', 'HH:mm'),
                        dayjs(initialValues.endTime || '20:00', 'HH:mm')
                    ],
                    day: initialValues.day || defaultDay
                });
            } else {
                form.resetFields();
                if (defaultDay) {
                    form.setFieldsValue({ day: defaultDay });
                }
            }
        }
    }, [visible, initialValues, form]);

    return (
        <ModalForm
            title={initialValues?.id ? "Редактировать конференцию (трек)" : "Создать конференцию (трек)"}
            open={visible}
            onOpenChange={(v) => !v && onClose()}
            onFinish={async (values) => {
                const formatTime = (t: any) => {
                    if (!t) return null;
                    if (t && typeof t.format === 'function') return t.format('HH:mm');
                    if (typeof t === 'string') return t.substring(0, 5);
                    return t;
                };

                const [start, end] = values.timeRange || [];
                
                // Prepare values
                const submission = {
                    ...values,
                    id: initialValues?.id,
                    startTime: formatTime(start),
                    endTime: formatTime(end),
                    hallId: hallId || initialValues?.hallId,
                    // Use the selected day from the form or fallback to defaultDay
                    day: values.day ? `${values.day}T00:00:00.000Z` : (defaultDay ? `${defaultDay}T00:00:00.000Z` : new Date().toISOString()),
                };
                delete submission.timeRange;
                try {
                    return await onFinish(submission);
                } catch (error: any) {
                    console.error('TrackModal onFinish error:', error);
                    message.error(`Ошибка сохранения: ${error.message || 'Проверьте форму'}`);
                    return false;
                }
            }}
            form={form}
            modalProps={{ destroyOnClose: true }}
            submitter={{
                searchConfig: {
                    submitText: 'Сохранить',
                    resetText: 'Отмена',
                },
                render: (props, _dom) => {
                    return [
                        initialValues?.id && onDelete && (
                            <Button
                                key="delete"
                                type="primary"
                                danger
                                onClick={() => {
                                    if (window.confirm('Вы уверены, что хотите удалить этот трек? (Внимание: будут удалены все сессии в этом треке!)')) {
                                        onDelete(initialValues.id);
                                    }
                                }}
                            >
                                Удалить
                            </Button>
                        ),
                        <Button key="cancel" onClick={() => props.onReset?.()}>
                            Отмена
                        </Button>,
                        <Button key="submit" type="primary" onClick={() => props.submit?.()}>
                            Сохранить
                        </Button>
                    ];
                },
            }}
        >
            <ProFormText
                name="name"
                label="Название конференции"
                placeholder="Например: Ритейл стратегии"
                rules={[{ required: true, message: 'Обязательное поле' }]}
            />

            <ProFormText
                name="description"
                label="Описание (Аннотация)"
                placeholder="Краткое описание"
            />

            {(availableDays && availableDays.length > 0) && (
                <ProFormSelect
                    name="day"
                    label="День мероприятия"
                    options={availableDays}
                    rules={[{ required: true, message: 'Выберите день' }]}
                />
            )}

            <div style={{ display: 'flex', gap: 16 }}>
                <ProFormTimePicker.RangePicker
                    name="timeRange"
                    label="Время проведения"
                    fieldProps={{ format: 'HH:mm' }}
                    rules={[{ required: true }]}
                />
            </div>
        </ModalForm>
    );
};

export default TrackModal;