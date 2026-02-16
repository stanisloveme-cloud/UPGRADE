import React from 'react';
import { Spin, Alert } from 'antd';
import TimeScale from './TimeScale';
import HallRow from './HallRow';
import { generateTimeSlots } from './utils';

interface ScheduleGridProps {
    data: any;
    loading: boolean;
    onSessionClick?: (session: any) => void;
    onEmptySlotClick?: (hallId: number, startTime: string) => void;
    onAddTrack?: (hallId: number) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ data, loading, onSessionClick, onEmptySlotClick, onAddTrack }) => {
    if (loading) return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;
    if (!data) return <Alert message="No data found" type="warning" showIcon />;

    const timeSlots = generateTimeSlots();

    return (
        <div style={{
            display: 'grid',
            // Column 1: Fixed 200px for Hall Names
            // Columns 2...N: 1fr for each time slot (approx 150px min width)
            gridTemplateColumns: `200px repeat(${timeSlots.length}, minmax(120px, 1fr))`,
            // Rows: Auto sized based on content
            gridAutoRows: 'minmax(100px, auto)',
            overflowX: 'auto',
            background: 'white',
            border: '1px solid #d9d9d9',
            borderRadius: '4px',
            position: 'relative',
            maxHeight: 'calc(100vh - 200px)', // Scrollable vertically
            overflowY: 'auto'
        }}>
            {/* Header Row */}
            <TimeScale />

            {/* Hall Rows */}
            {data.halls?.map((hall: any, index: number) => (
                <HallRow
                    key={hall.id}
                    hall={hall}
                    rowIndex={index}
                    onSessionClick={onSessionClick}
                    onEmptySlotClick={onEmptySlotClick}
                    onAddTrack={onAddTrack}
                />
            ))}
        </div>
    );
};

export default ScheduleGrid;
