import React, { useEffect } from 'react';
import { ModalForm, ProFormText, ProFormTimePicker } from '@ant-design/pro-components';
import { Form, Button } from 'antd';


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
                    startTime: initialValues.startTime, // Ensure format?
                    endTime: initialValues.endTime
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
                return onFinish(submission);
            }}
            form={form}
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
                                    if (window.confirm('Вы уверены, что хотите удалить этот трек? (Внимание: будут удалены все сессии в этом треке!)')) {
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
                            startTime: values[0],
                            endTime: values[1],
                        };
                    }}
                    rules={[{ required: true }]}
                />
            </div>
        </ModalForm>
    );
};

export default TrackModal;
