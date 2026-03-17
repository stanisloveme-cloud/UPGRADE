import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);

// Grid Configuration
export const TIME_STEP = 30; // Minutes per column
export const START_HOUR = 9; // Grid starts at 09:00
export const END_HOUR = 20; // Grid ends at 20:00

export const START_MINUTES_FROM_MIDNIGHT = START_HOUR * 60;
export const END_MINUTES_FROM_MIDNIGHT = END_HOUR * 60;

/**
 * Generates an array of time slots strings ("09:00", "09:30"...)
 */
export const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    let currentMinutes = START_MINUTES_FROM_MIDNIGHT;
    const endMinutes = END_MINUTES_FROM_MIDNIGHT;

    while (currentMinutes < endMinutes) {
        const h = Math.floor(currentMinutes / 60);
        const m = currentMinutes % 60;
        slots.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        currentMinutes += TIME_STEP;
    }
    return slots;
};

/**
 * Returns total minutes from start of day for precise percentage calculations
 */
export const timeToMinutes = (timeStr: string): number => {
    if (!timeStr) return 0;
    const date = dayjs(timeStr, ['HH:mm', 'HH:mm:ss', 'YYYY-MM-DDTHH:mm:ss']);
    if (!date.isValid()) return 0;
    return date.hour() * 60 + date.minute();
};

/**
 * Converts a time string (HH:mm:ss) to a grid column start index.
 * Clamps to the visible grid bounds.
 */
export const timeToGridColumn = (timeStr: string): number => {
    if (!timeStr) return 2;
    const minutes = timeToMinutes(timeStr);
    const visibleMinutes = Math.max(START_MINUTES_FROM_MIDNIGHT, minutes);
    
    const offset = visibleMinutes - START_MINUTES_FROM_MIDNIGHT;
    const colIndex = Math.floor(offset / TIME_STEP) + 2; 
    
    return Math.max(2, colIndex);
};

/**
 * Calculates how many columns a duration spans, clamped to screen.
 */
export const durationToGridSpan = (startStr: string, endStr: string): number => {
    const startMins = Math.max(START_MINUTES_FROM_MIDNIGHT, timeToMinutes(startStr));
    const endMins = Math.min(END_MINUTES_FROM_MIDNIGHT, timeToMinutes(endStr));
    
    const diffMinutes = Math.max(0, endMins - startMins);
    return Math.ceil(diffMinutes / TIME_STEP);
};
