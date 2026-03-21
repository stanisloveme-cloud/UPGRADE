import React, { useState, useRef, useEffect } from 'react';
import { ProFormText, ProFormTextArea, ProFormTimePicker, ProFormSelect, ProFormList, ProFormDateTimePicker, ProFormSwitch, ProFormGroup, ProFormDependency, ProCard } from '@ant-design/pro-components';
import { Button, Upload, message, Divider } from 'antd';
import { FilePdfOutlined, CopyOutlined, PrinterOutlined, IdcardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import SpeakerModal from '../SpeakersList/SpeakerModal';
import { SafeDrawerForm } from '../../components/SafeForms/SafeDrawerForm';
import { sanitizeFormValues } from '../../utils/formSanitizer';


interface SessionModalProps {
    visible: boolean;
    onClose: () => void;
    onFinish: (values: any) => Promise<boolean>;
    onDelete?: (id: number) => void;
    initialValues?: any;
    trackId?: number; // Pre-selected track for creation
    tracks?: { value: number; label: string }[]; // Available tracks for selection
    speakers?: { value: number; label: string; phone?: string; telegram?: string; company?: string; position?: string; }[];
    onSpeakerCreated?: () => Promise<void>;
}

const SessionDrawer: React.FC<SessionModalProps> = ({ visible, onClose, onFinish, onDelete, initialValues, trackId, tracks, speakers, onSpeakerCreated }) => {

    const [speakerModalVisible, setSpeakerModalVisible] = useState(false);
    const [addingSpeakerIndex, setAddingSpeakerIndex] = useState<number | null>(null);
    const [editingSpeakerData, setEditingSpeakerData] = useState<any>(null);
    const [submittingSpeaker, setSubmittingSpeaker] = useState(false);
    const formRef = useRef<any>(null);

    const handleCopyText = () => {
        if (!formRef.current) return;
        const values = formRef.current.getFieldsValue(true);
        let copyStr = `Сессия: ${values.name || ''}\n`;
        
        if (values.timeRange && values.timeRange.length === 2 && values.timeRange[0]) {
             const start = typeof values.timeRange[0].format === 'function' ? values.timeRange[0].format('HH:mm') : values.timeRange[0];
             const end = typeof values.timeRange[1]?.format === 'function' ? values.timeRange[1].format('HH:mm') : values.timeRange[1];
             copyStr += `Время: ${start} - ${end}\n`;
        }
        
        if (values.description) {
            copyStr += `\nОписание:\n${values.description}\n`;
        }

        if (values.questions && values.questions.length > 0) {
            copyStr += `\nВопросы:\n`;
            values.questions.forEach((q: any, i: number) => {
                copyStr += `#${i + 1} ${q.title || ''}\n`;
                if (q.body) {
                    copyStr += `   ${q.body}\n`;
                }
            });
        }
        
        navigator.clipboard.writeText(copyStr).then(() => {
            message.success('Текст скопирован в буфер обмена');
        }).catch(() => {
            message.error('Ошибка копирования текста. Возможно, браузер блокирует действие.');
        });
    };

    const handlePrintModerator = () => {
        if (!initialValues?.id) return;
        window.open(`/print/session/${initialValues.id}/moderator`, '_blank');
    };

    const handlePrintNameplates = () => {
        if (!initialValues?.id) return;
        window.open(`/print/session/${initialValues.id}/nameplates`, '_blank');
    };

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
            status: s.status || 'review',
            statusDate: s.statusDate,
            statusUser: s.statusUser,
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
        })),
        managerId: initialValues?.managerId || undefined // Explicitly expose
    };

    const sanitizedValues = sanitizeFormValues(normalizedInitialValues, {
        listFields: ['speakers', 'briefings', 'questions']
    });

    // Force Ant Design form to consume new initial values when opened
    // DrawerForm caches the underlying form instance indefinitely.
    useEffect(() => {
        if (visible && formRef.current) {
            formRef.current.resetFields();
            formRef.current.setFieldsValue(sanitizedValues);
            
            // Log form injection for debugging
            console.log("Drawer opened. Force-injected values:", sanitizedValues);
            console.log("Actual form fields after inject:", formRef.current.getFieldsValue());
        }
    }, [visible]);

    return (
        <SafeDrawerForm
            formRef={formRef}
            title={initialValues?.id ? "Редактирование сессии" : "Создание сессии"}
            open={visible}
            width={1000}
            drawerProps={{ 
                destroyOnClose: true,
                extra: initialValues?.id ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <Button icon={<CopyOutlined />} onClick={handleCopyText}>
                            Копировать текст
                        </Button>
                        <Button icon={<PrinterOutlined />} onClick={handlePrintModerator}>
                            Печать модератору
                        </Button>
                        <Button icon={<IdcardOutlined />} onClick={handlePrintNameplates}>
                            Печать табличек
                        </Button>
                    </div>
                ) : null
            }}
            onOpenChange={(v) => !v && onClose()}
            onFinish={async (values) => {
                try {
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

                    // Ensure id is passed for updates
                    if (initialValues?.id) {
                        formattedValues.id = initialValues.id;
                    }

                    delete formattedValues.timeRange;
                    delete formattedValues.speakerIds;
                    delete formattedValues.speakersDetails;

                    // Ensure speakerId is numeric for backend and strip out UI-only fields like `hasPresentation`
                    if (values.speakers) {
                        formattedValues.speakers = values.speakers
                            .filter((s: any) => s != null) // Avoid holes from drag&drop/deletion
                            .map((s: any) => ({
                                speakerId: Number(s.speakerId),
                                role: s.role,
                                status: s.status,
                                companySnapshot: s.companySnapshot,
                                positionSnapshot: s.positionSnapshot,
                                presentationUrl: s.hasPresentation ? s.presentationUrl : null,
                                presentationTitle: s.hasPresentation ? s.presentationTitle : null,
                            }));
                    }

                    if (values.questions) {
                        formattedValues.questions = values.questions
                            .filter((q: any) => q != null)
                            .map((q: any) => ({
                                title: q.title,
                                body: q.body
                            }));
                    }

                    // Format briefings array for backend (dayjs -> ISO string) and strip unnecessary fields
                    if (values.briefings) {
                        formattedValues.briefings = values.briefings
                            .filter((b: any) => b != null)
                            .map((b: any) => ({
                                moderatorId: b.moderatorId,
                                isDone: b.isDone,
                                link: b.link,
                                comment: b.comment,
                                datetime: b.datetime && typeof b.datetime.toISOString === 'function'
                                    ? b.datetime.toISOString()
                                    : b.datetime
                            }));
                    }

                    console.log('SessionModal onFinish fixed values:', formattedValues);
                    return await onFinish(formattedValues);
                } catch (error: any) {
                    console.error('SessionDrawer onFinish error:', error);
                    message.error(`Ошибка сохранения: ${error.message || 'Проверьте форму'}`);
                    return false;
                }
            }}
            initialValues={sanitizedValues}
            onDelete={initialValues?.id ? () => onDelete?.(initialValues.id) : undefined}
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

                <ProFormSelect
                    name="managerId"
                    label="Ответственный менеджер"
                    placeholder="Выберите менеджера"
                    request={async () => {
                        try {
                            const { data } = await axios.get('/api/users/managers');
                            return data.map((u: any) => ({
                                label: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username,
                                value: u.id
                            }));
                        } catch (e) {
                            return [];
                        }
                    }}
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
                                    fieldProps={{
                                        showSearch: true,
                                        optionFilterProp: 'label',
                                        onChange: (value) => {
                                            const foundSpeaker = speakers?.find((s: any) => s.value === value);
                                            if (foundSpeaker) {
                                                action.setCurrentRowData({
                                                    companySnapshot: foundSpeaker.company || '',
                                                    positionSnapshot: foundSpeaker.position || ''
                                                });
                                            }
                                        },
                                        dropdownRender: (menu) => (
                                            <>
                                                {menu}
                                                <Divider style={{ margin: '8px 0' }} />
                                                <Button type="text" block onClick={() => {
                                                    setAddingSpeakerIndex(_index);
                                                    setSpeakerModalVisible(true);
                                                }}>
                                                    + Добавить нового спикера
                                                </Button>
                                            </>
                                        )
                                    }}
                                />
                                <ProFormDependency name={['speakerId']}>
                                    {({ speakerId }) => {
                                        const foundSpeaker = speakers?.find((s: any) => s.value === speakerId);
                                        if (!foundSpeaker) return null;
                                        return (
                                            <div style={{ fontSize: '13px', marginTop: '-20px', marginBottom: '8px' }}>
                                                <a onClick={() => {
                                                    setEditingSpeakerData(foundSpeaker.speakerOrigin);
                                                    setSpeakerModalVisible(true);
                                                }} style={{ fontWeight: 500, marginRight: 8 }}>
                                                    Редактировать карточку спикера
                                                </a>
                                                <span style={{ color: '#8c8c8c' }}>
                                                    {foundSpeaker.phone ? `📞 ${foundSpeaker.phone}   ` : ''}
                                                    {foundSpeaker.telegram ? `✈️ ${foundSpeaker.telegram}` : ''}
                                                </span>
                                            </div>
                                        );
                                    }}
                                </ProFormDependency>
                                <ProFormText
                                    name="companySnapshot"
                                    placeholder="Компания"
                                    fieldProps={{ size: 'small' }}
                                    formItemProps={{ style: { marginBottom: 8 } }}
                                />
                                <ProFormText
                                    name="positionSnapshot"
                                    placeholder="Должность"
                                    fieldProps={{ size: 'small' }}
                                    formItemProps={{ style: { marginBottom: 0 } }}
                                />
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

                            <div style={{ width: '216px' }}>
                                <ProFormSelect
                                    name="status"
                                    label="Статус"
                                    options={[
                                        { value: 'confirmed', label: 'Подтвержден' },
                                        { value: 'pre_confirmed', label: 'Предварительно подтвержден' },
                                        { value: 'contact', label: 'Контакт' },
                                        { value: 'to_contact', label: 'Выйти на связь' },
                                        { value: 'declined', label: 'Отказ' },
                                        { value: 'review', label: 'На рассмотрении' }
                                    ]}
                                    initialValue="review"
                                    allowClear={false}
                                    width="sm"
                                />

                                <ProFormDependency name={['statusDate', 'statusUser']}>
                                    {({ statusDate, statusUser }) => {
                                        if (!statusDate) return null;
                                        const shortName = statusUser ? `${statusUser.lastName || ''} ${statusUser.firstName ? statusUser.firstName.charAt(0) + '.' : ''}` : '';
                                        return (
                                            <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '-20px', marginBottom: '8px' }}>
                                                {dayjs(statusDate).format('DD.MM.YY HH:mm')} {shortName ? `(${shortName})` : ''}
                                            </div>
                                        );
                                    }}
                                </ProFormDependency>
                            </div>


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

            {/* Inline Speaker Creation/Edit Modal */}
            <SpeakerModal
                visible={speakerModalVisible}
                loading={submittingSpeaker}
                initialValues={editingSpeakerData}
                onClose={() => {
                    setSpeakerModalVisible(false);
                    setAddingSpeakerIndex(null);
                    setEditingSpeakerData(null);
                }}
                onFinish={async (values) => {
                    try {
                        setSubmittingSpeaker(true);
                        const isEdit = !!editingSpeakerData?.id;
                        let response;
                        
                        if (isEdit) {
                            response = await axios.patch(`/api/speakers/${editingSpeakerData.id}`, values);
                        } else {
                            response = await axios.post('/api/speakers', values);
                        }
                        
                        message.success(`Спикер ${isEdit ? 'обновлен' : 'сохранён'}`);

                        // Refresh the global speaker list in parent
                        if (onSpeakerCreated) {
                            await onSpeakerCreated();
                        }

                        // Auto-fill the newly created speaker into the correct row
                        if (!isEdit && addingSpeakerIndex !== null && formRef.current) {
                            const currentList = formRef.current.getFieldValue('speakers') || [];
                            if (currentList[addingSpeakerIndex]) {
                                currentList[addingSpeakerIndex] = {
                                    ...currentList[addingSpeakerIndex],
                                    speakerId: response.data.id
                                };
                                formRef.current.setFieldsValue({ speakers: currentList });
                            }
                        }

                        setSpeakerModalVisible(false);
                        setAddingSpeakerIndex(null);
                        setEditingSpeakerData(null);
                    } catch (error) {
                        message.error('Ошибка сохранения спикера');
                    } finally {
                        setSubmittingSpeaker(false);
                    }
                }}
            />
        </SafeDrawerForm>
    );
};

export default SessionDrawer;