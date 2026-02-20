import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { generateTimeSlots } from './utils';
import TrackBlock from './TrackBlock';

interface HallRowProps {
    hall: any;
    rowIndex: number;
    filters?: any;
    onSessionClick?: (session: any) => void;
    onTrackClick?: (track: any) => void;
    onEmptySlotClick?: (hallId: number, startTime: string) => void;
    onAddTrack?: (hallId: number) => void;
}

const HallRow: React.FC<HallRowProps> = ({ hall, rowIndex, filters, onSessionClick, onEmptySlotClick, onAddTrack, onTrackClick }) => {
    // Grid Row Index: +2 because Row 1 is Time header.
    const gridRow = rowIndex + 2;
    const timeSlots = generateTimeSlots();

    return (
        <>
            {/* Sticky Hall Header (Left Column) */}
            <div style={{
                gridColumn: 1,
                gridRow: gridRow,
                background: 'white',
                borderRight: '1px solid #d9d9d9',
                borderBottom: '1px solid #e8e8e8',
                padding: '16px',
                position: 'sticky',
                left: 0,
                zIndex: 10, // Must be higher than content
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
            }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{hall.name}</div>
                <div style={{ fontSize: '12px', color: '#8c8c8c' }}>{hall.capacity} чел.</div>
                <Button size="small" type="link" icon={<PlusOutlined />} onClick={() => onAddTrack?.(hall.id)}>Трек</Button>
            </div>

            {/* Clickable Grid Cells (Background) */}
            {timeSlots.map((time, index) => (
                <div
                    key={time}
                    onClick={() => onEmptySlotClick?.(hall.id, time)}
                    style={{
                        gridColumn: index + 2,
                        gridRow: gridRow,
                        borderRight: '1px solid #f0f0f0',
                        borderBottom: '1px solid #e8e8e8',
                        cursor: 'pointer',
                        zIndex: 1, // Base layer
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    title={`Создать сессию: ${time}`}
                />
            ))}

            {/* Render Tracks (Overlay) */}
            {hall.tracks?.map((track: any) => (
                <div key={track.id} style={{
                    display: 'contents', // Remove gridRow from here as it's passed to component
                }}>
                    <TrackBlock track={track} rowIndex={gridRow} filters={filters} onSessionClick={onSessionClick} onTrackClick={onTrackClick} />
                </div>
            ))}
        </>
    );
};

export default HallRow;
