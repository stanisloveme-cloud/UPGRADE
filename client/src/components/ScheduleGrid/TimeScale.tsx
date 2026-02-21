import React from 'react';
import { generateTimeSlots } from './utils';




const TimeScale: React.FC = () => {
    const slots = generateTimeSlots();

    return (
        <>
            {/* Corner Cell (Hall / Time) */}
            <div style={{
                gridColumn: 1,
                gridRow: 1,
                background: '#f0f2f5',
                borderRight: '1px solid #d9d9d9',
                borderBottom: '1px solid #d9d9d9',
                position: 'sticky',
                left: 0,
                zIndex: 10, // Above everything: time slots (3) and hall rows (2)
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                color: '#595959',
                minWidth: '200px'
            }}>
                Залы
            </div>

            {/* Time Slots Header */}
            {slots.map((time, index) => (
                <div
                    key={time}
                    style={{
                        gridColumn: index + 2,
                        gridRow: 1,
                        background: '#fafafa',
                        borderRight: '1px solid #f0f0f0',
                        borderBottom: '1px solid #d9d9d9',
                        padding: '8px 4px',
                        textAlign: 'center',
                        color: '#8c8c8c',
                        fontSize: '12px',
                        fontWeight: 500,
                        position: 'sticky',
                        top: 0,
                        zIndex: 5
                    }}
                >
                    {time}
                </div>
            ))}
        </>
    );
};

export default TimeScale;
