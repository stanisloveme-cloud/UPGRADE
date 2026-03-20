import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Result, Spin, message } from 'antd';
import axios from 'axios';
import { SpeakerMemo } from '../components/SpeakerMemo/SpeakerMemo';

const SpeakerMemoPage: React.FC = () => {
    const { hash } = useParams<{ hash: string }>();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMemoData = async () => {
            try {
                const res = await axios.get(`/api/events/public/speaker-memo/${hash}`);
                setData(res.data);
            } catch (error) {
                message.error('Срок действия ссылки истек или данные не найдены.');
            } finally {
                setLoading(false);
            }
        };

        if (hash) {
            fetchMemoData();
        }
    }, [hash]);

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f5f5f5' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!data) {
        return <Result status="404" title="404" subTitle="Страница не найдена или ссылка недействительна." />;
    }

    // The backend should return the parsed HTML or the JSON fields required for SpeakerMemo
    // Let's adapt if it returns pre-parsed HTML or structured data
    // Usually the PRD-11 backend returns: { eventName, speakerName, sessionTitle, sessionStartTime, sessionEndTime, location, hallName, arrivalInstructions, managerContacts }

    // If we have an HTML template structure, the SpeakerMemo component we found earlier requires specific props:
    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px 0' }}>
            <SpeakerMemo
                speakerName={data.speakerName}
                hasPresentation={data.hasPresentation}
                eventName={data.eventName}
                eventLogoUrl={data.eventLogoUrl}
                sessionTitle={data.sessionTitle}
                sessionStartTime={data.sessionStartTime}
                sessionEndTime={data.sessionEndTime}
                location={data.location || 'Место проведения уточняется'}
                hallName={data.hallName}
                questions={data.questions}
                coSpeakers={data.coSpeakers}
                arrivalInstructions={data.htmlContent} // Using the HTML parsed content as arrivalInstructions for now if we want to show it
                managerContacts={data.managerContacts}
            />
        </div>
    );
};

export default SpeakerMemoPage;
