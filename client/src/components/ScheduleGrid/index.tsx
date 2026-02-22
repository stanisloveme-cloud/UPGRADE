import React from 'react';
import { Spin, Alert } from 'antd';
import TimeScale from './TimeScale';
import HallRow from './HallRow';
import { generateTimeSlots } from './utils';

interface ScheduleGridProps {
    data: any;
    loading: boolean;
    filters?: any;
    onSessionClick?: (session: any) => void;
    onTrackClick?: (track: any) => void;
    onEmptySlotClick?: (hallId: number, startTime: string) => void;
    onAddTrack?: (hallId: number) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ data, loading, filters, onSessionClick, onEmptySlotClick, onAddTrack, onTrackClick }) => {
    console.log('[ScheduleGrid] Data received:', data);
    if (loading) return <div style={{ padding: 24, textAlign: 'center' }}><Spin size="large" /></div>;

    // Check if data is truly valid
    if (!data || !data.halls || data.halls.length === 0) {
        return (
            <Alert
                message="Мероприятие создано, но пока пусто"
                description={
                    <div>
                        <p>В этом мероприятии еще нет залов и расписания.</p>
                        <p>Нажмите кнопку <b>"Управление залами"</b> выше, чтобы добавить первый зал.</p>
                    </div>
                }
                type="info"
                showIcon
            />
        );
    }

    const timeSlots = generateTimeSlots();

    return (
        <div style={{
            display: 'grid',
            // Column 1: Fixed 200px for Hall Names
            // Columns 2...N: 1fr for each time slot (approx 96px min width to reduce by 20%)
            gridTemplateColumns: `200px repeat(${timeSlots.length}, minmax(96px, 1fr))`,
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
                    filters={filters}
                    onSessionClick={onSessionClick}
                    onTrackClick={onTrackClick}
                    onEmptySlotClick={onEmptySlotClick}
                    onAddTrack={onAddTrack}
                />
            ))}
        </div>
    );
};

export default ScheduleGrid;
