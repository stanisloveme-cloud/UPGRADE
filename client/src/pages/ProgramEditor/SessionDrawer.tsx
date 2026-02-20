import React from 'react';
import { DrawerForm, ProFormText, ProFormTextArea, ProFormTimePicker, ProFormSelect, ProFormList, ProFormDateTimePicker, ProFormSwitch, ProFormGroup } from '@ant-design/pro-components';
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

const SessionDrawer: React.FC<SessionModalProps> = ({ visible, onClose, onFinish, onDelete, initialValues, trackId, tracks, speakers }) => {

    // Transform initial values (HH:mm strings to dayjs objects for TimePicker)
    const normalizedInitialValues = {
        ...initialValues,
        timeRange: initialValues?.startTime && initialValues?.endTime
            ? [dayjs(initialValues.startTime, 'HH:mm'), dayjs(initialValues.endTime, 'HH:mm')]
            : undefined,
        trackId: initialValues?.trackId || trackId,
        // Map speakers for ProFormList
        speakers: initialValues?.speakers?.map((s: any) => ({
            speakerId: s.speakerId || s.id,
            role: s.role || 'speaker',
            companySnapshot: s.companySnapshot,
            positionSnapshot: s.positionSnapshot,
            presentationTitle: s.presentationTitle
        })),
        // Map briefings dates to dayjs
        briefings: initialValues?.briefings?.map((b: any) => ({
            ...b,
            datetime: b.datetime ? dayjs(b.datetime) : undefined
        }))
    };

    return (
        <DrawerForm
            title={initialValues?.id ? "Редактирование сессии" : "Создание сессии"}
            open={visible}
            width={700}
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

                // Ensure speakerId is numeric for backend
                if (values.speakers) {
                    formattedValues.speakers = values.speakers.map((s: any) => ({
                        ...s,
                        speakerId: Number(s.speakerId)
                    }));
                }

                // Format briefings array for backend (dayjs -> ISO string)
                if (values.briefings) {
                    formattedValues.briefings = values.briefings.map((b: any) => ({
                        ...b,
                        datetime: b.datetime && typeof b.datetime.toISOString === 'function'
                            ? b.datetime.toISOString()
                            : b.datetime
                    }));
                }

                console.log('SessionModal onFinish fixed values:', formattedValues);
                return onFinish(formattedValues);
            }}
            initialValues={normalizedInitialValues}
            drawerProps={{ destroyOnClose: true }}
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

            {/* Questions List */}
            <ProFormList
                name="questions"
                label="Вопросы для обсуждения"
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: 'Добавить вопрос',
                }}
            >
                <ProFormGroup key="group">
                    <ProFormText
                        name="title"
                        placeholder="Краткий заголовок вопроса"
                        rules={[{ required: true }]}
                        colProps={{ span: 24 }}
                    />
                    <ProFormTextArea
                        name="body"
                        placeholder="Развернутое описание или тезисы"
                        colProps={{ span: 24 }}
                    />
                </ProFormGroup>
            </ProFormList>

            {/* Briefings List */}
            <ProFormList
                name="briefings"
                label="Бриф-звонки (Подготовка)"
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: 'Добавить бриф',
                }}
            >
                <ProFormGroup key="group">
                    <ProFormText
                        name="comment"
                        placeholder="Название брифа (например, 'Предварительный созвон')"
                        rules={[{ required: true }]}
                        colProps={{ span: 16 }}
                    />
                    <ProFormDateTimePicker
                        name="datetime"
                        placeholder="Дата и время"
                        rules={[{ required: true }]}
                        colProps={{ span: 8 }}
                    />
                    <ProFormSelect
                        name="moderatorId"
                        placeholder="Модератор (Кто ведет)"
                        options={speakers}
                        colProps={{ span: 12 }}
                    />
                    <ProFormText
                        name="link"
                        placeholder="Ссылка (Zoom/Meet)"
                        colProps={{ span: 8 }}
                    />
                    <ProFormSwitch
                        name="isDone"
                        label="Проведен"
                        colProps={{ span: 4 }}
                    />
                </ProFormGroup>
            </ProFormList>

            {/* Interactive Speakers List with Drag and Drop */}
            <ProFormList
                name="speakers"
                label="Спикеры сессии (Drag-and-Drop для сортировки)"
                creatorButtonProps={{
                    position: 'bottom',
                    creatorButtonText: 'Добавить спикера',
                }}
            >
                <ProFormGroup key="group">
                    <ProFormSelect
                        name="speakerId"
                        label="Спикер"
                        options={speakers}
                        rules={[{ required: true, message: 'Обязательно' }]}
                        fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
                        colProps={{ span: 16 }}
                    />
                    <ProFormSelect
                        name="role"
                        label="Роль"
                        options={[
                            { value: 'speaker', label: 'Спикер' },
                            { value: 'moderator', label: 'Модератор' }
                        ]}
                        initialValue="speaker"
                        rules={[{ required: true, message: 'Обязательно' }]}
                        colProps={{ span: 8 }}
                    />
                    <ProFormText
                        name="companySnapshot"
                        label="Компания (Snapshot)"
                        colProps={{ span: 8 }}
                    />
                    <ProFormText
                        name="positionSnapshot"
                        label="Должность (Snapshot)"
                        colProps={{ span: 8 }}
                    />
                    <ProFormText
                        name="presentationTitle"
                        label="Тема / Презентация"
                        colProps={{ span: 8 }}
                    />
                </ProFormGroup>
            </ProFormList>
        </DrawerForm>
    );
};

export default SessionDrawer;
