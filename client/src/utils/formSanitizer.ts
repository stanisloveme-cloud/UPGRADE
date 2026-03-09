/**
 * Form Data Sanitization Utilities
 * 
 * Safely prepares database records for Ant Design Forms, preventing silent 
 * rendering crashes caused by malformed JSON strings, nulls in arrays, or missing required formats.
 */

interface SanitizeOptions {
    /** 
     * List of array fields that must be guaranteed to be an array.
     * If they arrive as JSON string, they will be parsed.
     * If they are undefined or null, they will default to [].
     */
    arrayFields?: string[];

    /** 
     * Fields that are lists of objects. 
     * This will filter out any 'null' or 'undefined' elements (holes) from the list. 
     */
    listFields?: string[];
}

export const sanitizeFormValues = (initialData: any, options: SanitizeOptions = {}) => {
    if (!initialData) return initialData;

    // Create a shallow copy to avoid mutating the original prop
    const sanitized = { ...initialData };

    // 1. Ensure required array fields are valid arrays (handles JSON string parsing)
    if (options.arrayFields) {
        options.arrayFields.forEach(field => {
            const val = sanitized[field];

            if (val === undefined || val === null) {
                sanitized[field] = [];
            } else if (typeof val === 'string') {
                try {
                    const parsed = JSON.parse(val);
                    sanitized[field] = Array.isArray(parsed) ? parsed : [];
                } catch (e) {
                    console.warn(`formSanitizer: Failed to parse field '${field}' as JSON array fallback. Defaulting to empty array.`, val);
                    sanitized[field] = [];
                }
            } else if (!Array.isArray(val)) {
                // If it's a number, boolean, or object that isn't an array
                sanitized[field] = [];
            }
        });
    }

    // 2. Clear holes (nulls/undefined) from Object Lists (ProFormLists)
    if (options.listFields) {
        options.listFields.forEach(field => {
            const val = sanitized[field];
            if (Array.isArray(val)) {
                sanitized[field] = val.filter(item => item !== null && item !== undefined);
            }
        });
    }

    return sanitized;
};
