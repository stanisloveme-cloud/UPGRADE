import React from 'react';
import { DrawerForm, ProFormText, ProFormTextArea, ProFormTimePicker, ProFormSelect, ProFormList, ProFormDateTimePicker, ProFormSwitch, ProFormGroup, ProFormDependency, ProCard } from '@ant-design/pro-components';
import { Button, Upload, message } from 'antd';
import { FilePdfOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';


interface SessionModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<boolean>;
    onDelete?: (id: number) => void;
    initialValues?: any;
    trackId?: number; // Pre-selected track for creation
    tracks?: { value: number; label: string }[]; // Available tracks for selection
    speakers?: { value: number; label: string; phone?: string; telegram?: string; }[];
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
            hasPresentation: !!s.presentationTitle || !!s.presentationUrl,
            presentationTitle: s.presentationTitle,
            presentationUrl: s.presentationUrl
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
            width={1000}
            onOpenChange={(v) => !v && onClose()}
            onFinish={async (values) => {
                // Transform timeRange back to HH:mm strings
                const [start, end] = values.timeRange || [];

                const formatTime = (t: any) => {
                    if (!t) return null;
                    if (t && typeof t.format === 'function') return t.format('HH:mm');
                    if (typeof t === 'string') return t.substring(0, 5);
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
                        speakerId: Number(s.speakerId),
                        presentationUrl: s.hasPresentation ? s.presentationUrl : null,
                        presentationTitle: s.hasPresentation ? s.presentationTitle : null,
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

                try {
                    console.log('SessionModal onFinish fixed values:', formattedValues);
                    return await onFinish(formattedValues);
                } catch (error: any) {
                    console.error('SessionDrawer onFinish error:', error);
                    message.error(`Ошибка сохранения: ${error.message || 'Проверьте форму'}`);
                    return false;
                }
            }}
            initialValues={normalizedInitialValues}
            drawerProps={{ destroyOnClose: true }}
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
                                    if (window.confirm('Вы уверены, что хотите удалить эту сессию?')) {
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
                label="Название"
                placeholder="Введите название сессии"
                rules={[{ required: true, message: 'Обязательное поле' }]}
            />

            <ProFormTextArea
                name="description"
                label="Описание"
                placeholder="Краткое описание"
            />

            <ProFormGroup>
                <ProFormTimePicker.RangePicker
                    name="timeRange"
                    label="Время"
                    fieldProps={{ format: 'HH:mm' }}
                    rules={[{ required: true, message: 'Выберите время' }]}
                    width="md"
                />

                <ProFormSelect
                    name="trackId"
                    label="Трек"
                    options={tracks}
                    disabled={!!trackId} // If track is pre-selected (e.g. valid drop), disable selection? Or allow moving?
                    // For now, allow changing if not strictly enforced
                    placeholder="Выберите трек"
                    rules={[{ required: true, message: 'Выберите трек' }]}
                    width="md"
                />
            </ProFormGroup>

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
                itemContainerRender={(doms) => {
                    return <ProCard bordered size="small" style={{ marginBottom: 16 }}>{doms}</ProCard>;
                }}
            >
                {(_meta, _index, action) => (
                    <div style={{ width: '100%' }}>
                        {/* Row 1: Speaker Info */}
                        <ProFormGroup>
                            <div style={{ width: '300px' }}>
                                <ProFormSelect
                                    name="speakerId"
                                    label="Спикер"
                                    options={speakers}
                                    rules={[{ required: true, message: 'Обязательно' }]}
                                    fieldProps={{ showSearch: true, optionFilterProp: 'label' }}
                                />
                                <ProFormDependency name={['speakerId']}>
                                    {({ speakerId }) => {
                                        const foundSpeaker = speakers?.find((s: any) => s.value === speakerId);
                                        if (!foundSpeaker || (!foundSpeaker.phone && !foundSpeaker.telegram)) return null;
                                        return (
                                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '-20px', marginBottom: '8px' }}>
                                                {foundSpeaker.phone ? `📞 ${foundSpeaker.phone}   ` : ''}
                                                {foundSpeaker.telegram ? `✈️ ${foundSpeaker.telegram}` : ''}
                                            </div>
                                        );
                                    }}
                                </ProFormDependency>
                            </div>

                            <ProFormSelect
                                name="role"
                                label="Роль"
                                options={[
                                    { value: 'speaker', label: 'Спикер' },
                                    { value: 'moderator', label: 'Модератор' }
                                ]}
                                initialValue="speaker"
                                rules={[{ required: true, message: 'Обязательно' }]}
                                width="sm"
                            />

                            <ProFormText name="companySnapshot" label="Компания" width="sm" />
                            <ProFormText name="positionSnapshot" label="Должность" width="sm" />
                        </ProFormGroup>

                        {/* Row 2: Presentation Info */}
                        <ProFormGroup align="center">
                            <ProFormSwitch name="hasPresentation" label="С презентацией" />

                            <ProFormDependency name={['hasPresentation', 'presentationUrl']}>
                                {({ hasPresentation, presentationUrl }) => {
                                    if (!hasPresentation) return null;
                                    return (
                                        <div style={{ display: 'flex', gap: '16px', flex: 1, alignItems: 'center' }}>
                                            <ProFormText
                                                name="presentationTitle"
                                                label="Тема презентации"
                                                width="md"
                                                formItemProps={{ style: { marginBottom: 0 } }}
                                            />

                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                {presentationUrl ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '30px' }}>
                                                        <a href={presentationUrl} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                            <FilePdfOutlined /> Скачать презентацию
                                                        </a>
                                                        <Button type="link" danger size="small" onClick={() => action.setCurrentRowData({ presentationUrl: null })}>
                                                            Удалить
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Upload
                                                        name="file"
                                                        action="/api/uploads/presentation"
                                                        headers={{
                                                            authorization: `Bearer ${localStorage.getItem('token')}`,
                                                        }}
                                                        showUploadList={{
                                                            showDownloadIcon: true,
                                                            showRemoveIcon: true,
                                                        }}
                                                        accept=".pdf,.ppt,.pptx"
                                                        beforeUpload={(file) => {
                                                            const isLt30M = file.size / 1024 / 1024 < 30;
                                                            if (!isLt30M) {
                                                                message.error('Файл должен быть меньше 30MB!');
                                                            }
                                                            return isLt30M;
                                                        }}
                                                        onChange={(info: any) => {
                                                            if (info.file.status === 'done') {
                                                                message.success(`${info.file.name} загружен.`);
                                                                if (info.file.response?.url) {
                                                                    action.setCurrentRowData({ presentationUrl: info.file.response.url });
                                                                }
                                                            } else if (info.file.status === 'error') {
                                                                message.error(`${info.file.name} ошибка загрузки.`);
                                                            }
                                                        }}
                                                    >
                                                        <div style={{ paddingTop: '10px' }}>
                                                            <Button icon={<FilePdfOutlined />}>Загрузить файл</Button>
                                                        </div>
                                                    </Upload>
                                                )}
                                                {/* Hidden input to keep value in form */}
                                                <div style={{ display: 'none' }}>
                                                    <ProFormText name="presentationUrl" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }}
                            </ProFormDependency>
                        </ProFormGroup>
                    </div>
                )}
            </ProFormList>
        </DrawerForm>
    );
};

export default SessionDrawer;
