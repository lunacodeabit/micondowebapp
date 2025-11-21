

export const getLocalDateString = (date?: string) => {
    return date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
};

export const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'N/A';
    // Create a date object assuming UTC to prevent off-by-one day errors from timezone conversion
    const date = new Date(dateString + 'T00:00:00Z');
    
    // An invalid dateString (like an empty string) results in an invalid Date object.
    // Check for this before trying to format.
    if (isNaN(date.getTime())) {
        return 'N/A';
    }

    return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        timeZone: 'UTC'
    });
};