import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const ModeratorPrint: React.FC = () => {
    const { id } = useParams();
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        axios.get(`/api/sessions/${id}`).then(res => {
            setSession(res.data);
            setTimeout(() => {
                window.print();
            }, 500);
        });
    }, [id]);

    if (!session) return <div style={{ padding: 40 }}>Загрузка данных для печати...</div>;

    const moderators = session.speakers?.filter((s: any) => s.role === 'moderator' && s.status === 'confirmed') || [];
    const speakers = session.speakers?.filter((s: any) => s.role === 'speaker' && s.status === 'confirmed') || [];

    // format time string
    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        return timeStr.substring(0, 5);
    };

    return (
        <div style={{ 
            fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif', 
            padding: '20px 40px',
            color: '#000',
            maxWidth: '1000px',
            margin: '0 auto',
            backgroundColor: '#fff'
        }}>
            <style>
                {`
                    @media print {
                        body { background: #fff; margin: 0; padding: 0; }
                        @page { size: A4 portrait; margin: 15mm; }
                    }
                `}
            </style>

            <h1 style={{ fontSize: '24px', borderBottom: '2px solid #000', paddingBottom: '10px', marginBottom: '20px' }}>
                {session.name}
            </h1>

            <div style={{ fontSize: '16px', marginBottom: '30px', lineHeight: '1.6' }}>
                <div><strong>Дата и время:</strong> {session.track?.day ? dayjs(session.track.day).format('DD MMMM YYYY') : 'Дата не указана'}, {formatTime(session.startTime)} - {formatTime(session.endTime)}</div>
                <div><strong>Зал:</strong> {session.track?.hall?.name || 'Зал не указан'}</div>
                {moderators.length > 0 && (
                    <div><strong>Модератор:</strong> {moderators.map((m: any) => `${m.speaker?.lastName || ''} ${m.speaker?.firstName || ''}`).join(', ')}</div>
                )}
            </div>

            {speakers.length > 0 && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Подтвержденные спикеры</h2>
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, fontSize: '16px', lineHeight: '1.8' }}>
                        {speakers.map((s: any, i: number) => (
                            <li key={i} style={{ marginBottom: '10px' }}>
                                <strong>{s.speaker?.lastName} {s.speaker?.firstName}</strong> 
                                {s.speaker?.company ? ` — ${s.speaker.company}` : ''}
                                {s.speaker?.position ? `, ${s.speaker.position}` : ''}
                                {s.presentationUrl || s.presentationTitle ? (
                                    <span style={{ marginLeft: '10px', backgroundColor: '#e6f7ff', padding: '2px 8px', borderRadius: '4px', fontSize: '14px', border: '1px solid #91d5ff' }}>
                                        ✓ С презентацией
                                    </span>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {session.description && (
                <div style={{ marginBottom: '30px' }}>
                    <h2 style={{ fontSize: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Описание сессии</h2>
                    <div style={{ fontSize: '16px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {session.description}
                    </div>
                </div>
            )}

            {session.questions && session.questions.length > 0 && (
                <div>
                    <h2 style={{ fontSize: '20px', borderBottom: '1px solid #ccc', paddingBottom: '5px' }}>Вопросы для обсуждения</h2>
                    <ol style={{ fontSize: '16px', lineHeight: '1.6', paddingLeft: '20px' }}>
                        {session.questions.map((q: any, i: number) => (
                            <li key={i} style={{ marginBottom: '15px' }}>
                                <strong>{q.title}</strong>
                                {q.body && <div style={{ marginTop: '5px', color: '#333' }}>{q.body}</div>}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default ModeratorPrint;
