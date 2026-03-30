import React, { useEffect, useState } from 'react';
import { ProFormList, ProFormText, ProFormGroup, ProFormDigit } from '@ant-design/pro-components';
import { SafeModalForm } from '../../components/SafeForms/SafeModalForm';
import { message, Form } from 'antd';
import { hallsControllerFindAll, hallsControllerCreate, hallsControllerUpdate, hallsControllerRemove } from '../../api/generated/halls/halls';
import { CreateHallDto, UpdateHallDto } from '../../api/generated/model';

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
            hallsControllerFindAll()
                .then((allHalls: any) => {
                    // Filter by eventId
                    const eventHalls = (allHalls as unknown as any[]).filter((h: any) => h.eventId === Number(eventId));
                    const data = { halls: eventHalls };
                    setInitialValues(data);
                    form.setFieldsValue(data);
                })
                .catch((_err: any) => message.error('Failed to load halls'));
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
                ...toDelete.map((h: any) => hallsControllerRemove(h.id)),
                ...toUpdate.map((h: any) => { const { id, ...rest } = h; return hallsControllerUpdate(id, rest as UpdateHallDto); }),
                ...toCreate.map(async (h: any) => {
                    return await hallsControllerCreate({ ...h, eventId: Number(eventId) } as CreateHallDto);
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
        <SafeModalForm
            title="Управление залами"
            open={visible}
            onOpenChange={(v: boolean) => !v && onClose()}
            onFinish={handleSubmit}
            initialValues={initialValues}
            form={form}
            modalProps={{ destroyOnClose: true }}
            submitter={{
                searchConfig: {
                    submitText: 'Сохранить',
                    resetText: 'Отмена',
                }
            }}
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
                    <ProFormDigit
                        name="capacity"
                        placeholder="Вместимость"
                        width="sm"
                    />
                </ProFormGroup>
            </ProFormList>
        </SafeModalForm>
    );
};

export default HallsModal;
