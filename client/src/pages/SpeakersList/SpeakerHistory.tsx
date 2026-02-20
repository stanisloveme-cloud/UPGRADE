import React, { useEffect, useState } from 'react';
import { Drawer, Timeline, Card, Tag, Rate, Spin, Empty } from 'antd';
import { ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

interface SpeakerHistoryProps {
    speakerId: number | null;
    visible: boolean;
    onClose: () => void;
}

interface HistoryItem {
    type: 'session' | 'rating';
    date: string;
    data: any;
}

const SpeakerHistory: React.FC<SpeakerHistoryProps> = ({ speakerId, visible, onClose }) => {
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [speaker, setSpeaker] = useState<any>(null);

    useEffect(() => {
        if (speakerId && visible) {
            fetchHistory();
        }
    }, [speakerId, visible]);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/speakers/${speakerId}`);
            const data = response.data;
            setSpeaker(data);

            const items: HistoryItem[] = [];

            // Process Sessions
            if (data.sessions) {
                data.sessions.forEach((s: any) => {
                    items.push({
                        type: 'session',
                        date: s.session?.startTime ? `${s.session.track?.day || '2025-01-01'}T${s.session.startTime}` : new Date().toISOString(), // Approximation if full date missing
                        data: s
                    });
                });
            }

            // Process Ratings
            if (data.ratings) {
                data.ratings.forEach((r: any) => {
                    items.push({
                        type: 'rating',
                        date: r.createdAt,
                        data: r
                    });
                });
            }

            // Sort by date descending
            items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            setHistory(items);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer
            title={speaker ? `История: ${speaker.firstName} ${speaker.lastName}` : 'История спикера'}
            placement="right"
            width={500}
            onClose={onClose}
            open={visible}
        >
            {loading ? <Spin style={{ display: 'block', margin: '20px auto' }} /> : (
                <>
                    {history.length === 0 ? <Empty description="Нет исторических данных" /> : (
                        <Timeline mode="left">
                            {history.map((item, index) => {
                                if (item.type === 'session') {
                                    const session = item.data.session;
                                    const snapshot = item.data;
                                    return (
                                        <Timeline.Item key={index} dot={<ClockCircleOutlined style={{ fontSize: '16px' }} />}>
                                            <Card size="small" title={session?.name} extra={<Tag color="blue">{dayjs(item.date).format('DD.MM.YYYY')}</Tag>}>
                                                <p><strong>Компания:</strong> {snapshot.companySnapshot || speaker.company} (Snapshot)</p>
                                                <p><strong>Должность:</strong> {snapshot.positionSnapshot || speaker.position} (Snapshot)</p>
                                                {snapshot.presentationTitle && <p><strong>Доклад:</strong> {snapshot.presentationTitle}</p>}
                                                <p><strong>Роль:</strong> {snapshot.role}</p>
                                            </Card>
                                        </Timeline.Item>
                                    );
                                } else {
                                    const rating = item.data;
                                    return (
                                        <Timeline.Item key={index} color="green" dot={<TrophyOutlined style={{ fontSize: '16px', color: 'gold' }} />}>
                                            <Card size="small" style={{ borderColor: 'gold' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <strong>Рейтинг выступления</strong>
                                                    <Rate disabled defaultValue={rating.score} style={{ fontSize: 14 }} />
                                                </div>
                                                <div style={{ marginTop: 8, fontStyle: 'italic', color: '#666' }}>
                                                    "{rating.comment}"
                                                </div>
                                                <div style={{ marginTop: 4, fontSize: 10, color: '#999' }}>
                                                    Событие: {rating.event?.name}
                                                </div>
                                            </Card>
                                        </Timeline.Item>
                                    );
                                }
                            })}
                        </Timeline>
                    )}
                </>
            )}
        </Drawer>
    );
};

export default SpeakerHistory;
