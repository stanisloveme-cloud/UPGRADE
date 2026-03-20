import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const NameplatesPrint: React.FC = () => {
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

    if (!session) return <div style={{ padding: 40 }}>Загрузка данных для печати табличек...</div>;

    // Filter confirmed speakers and moderators
    const confirmedParticipants = session.speakers?.filter((s: any) => 
        (s.role === 'speaker' || s.role === 'moderator') && s.status === 'confirmed'
    ) || [];

    return (
        <div style={{ fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif' }}>
            <style>
                {`
                    @media print {
                        body { background: #fff; margin: 0; padding: 0; }
                        @page { size: A4 portrait; margin: 0; }
                    }
                    * {
                        box-sizing: border-box;
                    }
                `}
            </style>
            
            {confirmedParticipants.map((p: any, index: number) => {
                const speakerName = `${p.speaker?.lastName || ''} ${p.speaker?.firstName || ''}`;
                const company = p.speaker?.company || '';
                const position = p.speaker?.position || '';

                return (
                    <div 
                        key={index} 
                        style={{
                            width: '100vw',
                            height: '100vh', /* Maps to full A4 page */
                            display: 'flex',
                            flexDirection: 'column',
                            pageBreakAfter: 'always',
                            backgroundColor: '#fff'
                        }}
                    >
                        {/* === TOP HALF (MIRRORED FOR FOLDING) === */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            transform: 'rotate(180deg)',
                            textAlign: 'center',
                            padding: '40px',
                            borderBottom: '1px dashed #eee' /* subtle fold line */
                        }}>
                            <div style={{ fontSize: '20px', color: '#333', marginBottom: '15px' }}>
                                {session.startTime?.substring(0, 5)} - {session.endTime?.substring(0, 5)}
                            </div>
                            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '15px', maxWidth: '85%', lineHeight: '1.3' }}>
                                {session.name}
                            </div>
                            <div style={{ fontSize: '20px', color: '#555' }}>
                                Зал "{session.track?.hall?.name || 'Не указан'}"
                            </div>
                        </div>

                        {/* === BOTTOM HALF (NORMAL TENT FRONT) === */}
                        <div style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '40px'
                        }}>
                            <div style={{ fontSize: '50px', fontWeight: 'bold', marginBottom: '20px', lineHeight: '1.2' }}>
                                {speakerName}
                            </div>
                            {(company || position) && (
                                <div style={{ fontSize: '24px', color: '#555', lineHeight: '1.4', maxWidth: '80%' }}>
                                    <div>{position}</div>
                                    <div style={{ fontWeight: 'bold', marginTop: '10px' }}>{company}</div>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
            
            {confirmedParticipants.length === 0 && (
                <div style={{ padding: 40, fontSize: 24, textAlign: 'center' }}>
                    Нет подтвержденных спикеров для печати табличек.
                </div>
            )}
        </div>
    );
};

export default NameplatesPrint;
