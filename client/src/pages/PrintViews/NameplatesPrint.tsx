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
                        @page { size: A5 landscape; margin: 0; }
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
                            height: '100vh', /* A5 landscape maps to full viewport height for print */
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            padding: '40px',
                            pageBreakAfter: 'always',
                            textAlign: 'center',
                            backgroundColor: '#fff'
                        }}
                    >
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
