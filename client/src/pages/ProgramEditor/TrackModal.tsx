import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormTimePicker } from '@ant-design/pro-components';
import { Form, Button, message } from 'antd';


interface TrackModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<boolean>;
    onDelete?: (id: number) => void;
    initialValues?: any;
    hallId?: number;
    eventId: number;
}

const TrackModal: React.FC<TrackModalProps> = ({ visible, onClose, onFinish, onDelete, initialValues, hallId }) => {
    const [form] = Form.useForm();

    useEffect(() => {
        if (visible) {
            if (initialValues) {
                form.setFieldsValue({
                    ...initialValues,
                    timeRange: [initialValues.startTime || '09:00', initialValues.endTime || '20:00']
                });
            } else {
                form.resetFields();
            }
        }
    }, [visible, initialValues, form]);

    return (
        <ModalForm
            title={initialValues?.id ? "Редактировать конференцию (трек)" : "Создать конференцию (трек)"}
            open={visible}
            onOpenChange={(v) => !v && onClose()}
            onFinish={async (values) => {
                // Prepare values
                const submission = {
                    ...values,
                    hallId: hallId || initialValues?.hallId,
                    // If creating, we need a date. Default to event start date?
                    // Ideally we should ask for date or pick from event days.
                    // For MVP, hardcode day 1 or ask user.
                    // Let's assume day is passed or we default to '2025-10-21' (Day 1)
                    day: initialValues?.day || '2025-10-21T00:00:00.000Z',
                };
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

            <div style={{ display: 'flex', gap: 16 }}>
                <ProFormTimePicker.RangePicker
                    name="timeRange"
                    label="Время проведения"
                    fieldProps={{ format: 'HH:mm' }}
                    transform={(values) => {
                        return {
                            startTime: typeof values[0] === 'string' ? values[0].slice(0, 5) : values[0]?.format('HH:mm'),
                            endTime: typeof values[1] === 'string' ? values[1].slice(0, 5) : values[1]?.format('HH:mm'),
                        };
                    }}
                    rules={[{ required: true }]}
                />
            </div>
        </ModalForm>
    );
};

export default TrackModal;
