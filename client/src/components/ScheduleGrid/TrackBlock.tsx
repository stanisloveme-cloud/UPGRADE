import React from 'react';
import { timeToGridColumn, durationToGridSpan, timeToMinutes, START_MINUTES_FROM_MIDNIGHT, END_MINUTES_FROM_MIDNIGHT } from './utils';
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
            <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', padding: '8px 8px 4px 8px', gap: '8px' }}>
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
                <Text strong style={{ fontSize: '12px', color: '#595959', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.name}</Text>
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
                        
                        // We must use the visible track segment for percentages since the TrackBlock width correlates to visible columns
                        const visibleTStart = Math.max(START_MINUTES_FROM_MIDNIGHT, tStart);
                        const visibleTEnd = Math.min(END_MINUTES_FROM_MIDNIGHT, tEnd);
                        const visibleTDuration = Math.max(1, visibleTEnd - visibleTStart);
                        
                        const sStart = timeToMinutes(session.startTime);
                        const sEnd = timeToMinutes(session.endTime);
                        
                        // Calculate session offset relative to the VISIBLE track start
                        const offset = Math.max(0, sStart - visibleTStart);
                        const visibleSDuration = Math.max(0, Math.min(sEnd, visibleTEnd) - sStart);
                        
                        const leftPercent = (offset / visibleTDuration) * 100;
                        const widthPercent = (visibleSDuration / visibleTDuration) * 100;

                        // Only render if session falls within visible area
                        if (sEnd <= visibleTStart || sStart >= visibleTEnd) return null;

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
