import React from 'react';
import { Card, Typography, Space, Badge } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface SessionCardProps {
    session: any;
    filters?: any;
    onClick?: () => void;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, filters, onClick }) => {
    // Mock counts for badges until backend provides aggregated counts
    const moderatorsCount = session.speakers?.filter((s: any) => s.role === 'moderator').length || 0;
    const speakersCount = session.speakers?.filter((s: any) => s.role === 'speaker').length || 0;

    return (
        <Card
            size="small"
            className="session-card"
            // hoverable - removed default antd hover
            onClick={onClick}
            style={{
                height: '100%',
                overflow: 'hidden',
                borderRadius: '4px',
                borderLeft: '4px solid #1890ff', // Accent color
                display: 'flex',
                flexDirection: 'column'
            }}
            bodyStyle={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column' }}
        >
            <div style={{ marginBottom: '4px' }}>
                <Text type="secondary" style={{ fontSize: '11px' }}>
                    {(session.start_time || '').slice(0, 5)} - {(session.end_time || '').slice(0, 5)}
                </Text>
            </div>

            <div style={{ flex: 1, marginBottom: '8px' }}>
                <Text strong style={{ fontSize: '12px', lineHeight: '1.2', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {session.name}
                </Text>
            </div>

            {!filters?.hideSpeakers && (
                <Space size={4} style={{ marginTop: 'auto' }}>
                    {moderatorsCount > 0 && (
                        <Badge count={moderatorsCount} style={{ backgroundColor: '#722ed1' }} showZero={false}>
                            <UserOutlined style={{ color: '#722ed1', fontSize: '14px', marginRight: 4 }} />
                        </Badge>
                    )}
                    {speakersCount > 0 && (
                        <Badge count={speakersCount} style={{ backgroundColor: '#52c41a' }} showZero={false}>
                            <UserOutlined style={{ color: '#52c41a', fontSize: '14px', marginRight: 4 }} />
                        </Badge>
                    )}
                </Space>
            )}

            {filters?.showPresenceStatus && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#52c41a', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#52c41a' }} />
                    Все спикеры на площадке
                </div>
            )}
        </Card>
    );
};

export default SessionCard;
