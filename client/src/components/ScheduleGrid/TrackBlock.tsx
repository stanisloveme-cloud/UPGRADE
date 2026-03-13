import React from 'react';
import { timeToGridColumn, durationToGridSpan } from './utils';
import SessionCard from './SessionCard';
import { Typography, Button } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface TrackBlockProps {
    track: any;
    rowIndex: number;
    filters?: any;
    onSessionClick?: (session: any) => void;
    onTrackClick?: (track: any) => void;
}

const TrackBlock: React.FC<TrackBlockProps> = ({ track, rowIndex, filters, onSessionClick, onTrackClick }) => {
    const colStart = timeToGridColumn(track.startTime);
    const colSpan = durationToGridSpan(track.startTime, track.endTime);

    return (
        <div className="track-block" style={{
            gridColumn: `${colStart} / span ${colSpan}`,
            gridRow: rowIndex, // Use passed rowIndex
            background: '#f5f5f5',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            zIndex: 5, // Underneath sticky hall headers (20) and time scale (10)
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)', // Subtle shadow for depth
            padding: '8px',
            minHeight: '150px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
        }}>
            {/* Track Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <Text strong style={{ fontSize: '12px', color: '#595959' }}>{track.name}</Text>
                <Button
                    type="text"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={(e) => {
                        e.stopPropagation();
                        console.log('✏️ Track Edit clicked', track);
                        onTrackClick?.(track);
                    }}
                />
            </div>

            {/* Sessions Container - Grid aligned with time slots */}
            {!filters?.hideSessions && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: `repeat(${colSpan}, 1fr)`, // Subgrid matching track span
                    gap: '4px',
                    flex: 1,
                    position: 'relative'
                }}>
                    {track.sessions?.map((session: any) => (
                        <SessionCard
                            key={session.id}
                            session={session}
                            trackStart={track.startTime} // Pass track start to calculate relative offset
                            filters={filters}
                            onClick={() => onSessionClick?.(session)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrackBlock;
