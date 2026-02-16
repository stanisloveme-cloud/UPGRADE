import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Grid Configuration
export const TIME_STEP = 30; // Minutes per column
export const START_HOUR = 9; // Grid starts at 09:00
export const END_HOUR = 20; // Grid ends at 20:00

// Total minutes from start of day (00:00) to grid start (09:00)
const START_MINUTES_FROM_MIDNIGHT = START_HOUR * 60;

/**
 * Generates an array of time slots strings ("09:00", "09:30"...)
 */
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    let currentMinutes = START_MINUTES_FROM_MIDNIGHT;
    const endMinutes = END_HOUR * 60;

    while (currentMinutes < endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        currentMinutes += TIME_STEP;
    }
    return slots;
};

/**
 * Converts a time string (HH:mm:ss) to a grid column start index.
 * Column 1 is the Hall Name header.
 * Column 2 starts at START_HOUR (09:00).
 */
export const timeToGridColumn = (timeStr: string): number => {
    if (!timeStr) return 2;
    
    // Parse time
    const date = dayjs(timeStr, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DDTHH:mm:ss']);
    const minutes = date.hour() * 60 + date.minute();
    
    // Calculate offset from grid start
    const offset = minutes - START_MINUTES_FROM_MIDNIGHT;
    
    // Calculate column index (1-based)
    // Col 1 = Header
    // Col 2 = 09:00-09:30
    const colIndex = Math.floor(offset / TIME_STEP) + 2; 
    
    return Math.max(2, colIndex); // Ensure we don't go before start
};

/**
 * Calculates how many columns a duration spans
 */
export const durationToGridSpan = (startStr: string, endStr: string): number => {
    const start = dayjs(startStr, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DDTHH:mm:ss']);
    const end = dayjs(endStr, ['HH:mm:ss', 'HH:mm', 'YYYY-MM-DDTHH:mm:ss']);
    
    const diffMinutes = end.diff(start, 'minute');
    return Math.ceil(diffMinutes / TIME_STEP);
};
