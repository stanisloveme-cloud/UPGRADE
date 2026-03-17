import React from 'react';
import { timeToGridColumn, durationToGridSpan, timeToMinutes } from './utils';
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
            minHeight: '150px',
            minWidth: 0, // CRITICAL: prevent track content from blowing out the global grid tracks
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
        }}>
            {/* Track Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px 4px 8px' }}>
                <Text strong style={{ fontSize: '12px', color: '#595959', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</Text>
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

            {/* Sessions Container - Absolute percentage positioning for perfect timeline alignment */}
            {!filters?.hideSessions && (
                <div style={{
                    position: 'relative',
                    flex: 1,
                    width: '100%',
                    minHeight: '100px', // Prevent collapsing when empty
                }}>
                    {track.sessions?.map((session: any) => {
                        const tStart = timeToMinutes(track.startTime);
                        const tEnd = timeToMinutes(track.endTime);
                        const sStart = timeToMinutes(session.startTime);
                        const sEnd = timeToMinutes(session.endTime);
                        
                        // Prevent division by zero if track has 0 duration
                        const trackDuration = Math.max(1, tEnd - tStart);
                        const sessionDuration = Math.max(1, sEnd - sStart);
                        const offset = Math.max(0, sStart - tStart);
                        
                        const leftPercent = (offset / trackDuration) * 100;
                        const widthPercent = (sessionDuration / trackDuration) * 100;

                        return (
                            <div key={session.id} style={{
                                position: 'absolute',
                                left: `${leftPercent}%`,
                                width: `${widthPercent}%`,
                                top: 0,
                                bottom: '8px', // Padding from the bottom of track
                                padding: '0 2px' // Tiny gap between adjacent sessions
                            }}>
                                <SessionCard
                                    session={session}
                                    filters={filters}
                                    onClick={() => onSessionClick?.(session)}
                                />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default TrackBlock;
