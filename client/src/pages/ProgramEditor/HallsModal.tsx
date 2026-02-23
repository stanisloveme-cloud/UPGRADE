import React, { useEffect, useState } from 'react';
import { ModalForm, ProFormList, ProFormText, ProFormGroup } from '@ant-design/pro-components';
import { message, Form } from 'antd';
import axios from 'axios';

interface HallsModalProps {
    visible: boolean;
    onClose: () => void;
    eventId: number;
}

const HallsModal: React.FC<HallsModalProps> = ({ visible, onClose, eventId }) => {
    const [initialValues, setInitialValues] = useState<any>({ halls: [] });
    const [form] = Form.useForm();

    // Fetch halls on load
    useEffect(() => {
        if (visible) {
            axios.get('/api/halls')
                .then(res => {
                    const allHalls = res.data;
                    // Filter by eventId
                    const eventHalls = allHalls.filter((h: any) => h.eventId === Number(eventId));
                    const data = { halls: eventHalls };
                    setInitialValues(data);
                    form.setFieldsValue(data);
                })
                .catch(_err => message.error('Failed to load halls'));
        }
    }, [visible, form, eventId]);

    const handleSubmit = async (values: any) => {
        try {
            const currentHalls = values.halls || [];
            const originalHalls = initialValues.halls || [];

            const toDelete = originalHalls.filter((oh: any) => !currentHalls.find((ch: any) => ch.id === oh.id));
            const toUpdate = currentHalls.filter((ch: any) => ch.id);
            const toCreate = currentHalls.filter((ch: any) => !ch.id);

            // Execute requests
            await Promise.all([
                ...toDelete.map((h: any) => axios.delete(`/api/halls/${h.id}`)),
                ...toUpdate.map((h: any) => axios.patch(`/api/halls/${h.id}`, h)),
                ...toCreate.map(async (h: any) => {
                    const res = await axios.post('/api/halls', { ...h, eventId: eventId });
                    return res.data;
                })
            ]);

            message.success('Changes saved!');
            onClose();
            return true;
        } catch (error) {
            console.error(error);
            message.error('Failed to save changes');
            return false;
        }
    };

    return (
        <ModalForm
            title="Управление залами"
            open={visible}
            onOpenChange={(v) => !v && onClose()}
            onFinish={handleSubmit}
            initialValues={initialValues}
            form={form}
            modalProps={{ destroyOnClose: true }}
        >
            <ProFormList
                name="halls"
                initialValue={[]}
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: '+ Добавить зал',
                }}
                copyIconProps={{ tooltipText: 'Копировать' }}
                deleteIconProps={{ tooltipText: 'Удалить' }}
            >
                <ProFormGroup key="group">
                    {/* HIDDEN ID FIELD IS CRITICAL FOR DIFFING */}
                    <ProFormText name="id" hidden />

                    <ProFormText
                        name="name"
                        placeholder="Название зала"
                        rules={[{ required: true, message: 'Обязательное поле' }]}
                        width="md"
                    />
                    <ProFormText
                        name="capacity"
                        placeholder="Вместимость"
                        fieldProps={{ type: 'number' }}
                        transform={(val) => Number(val)}
                        width="sm"
                    />
                </ProFormGroup>
            </ProFormList>
        </ModalForm>
    );
};

export default HallsModal;
