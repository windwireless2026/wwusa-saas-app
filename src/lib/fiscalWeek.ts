/**
 * Fiscal Week Calculation Utility
 * 
 * Wind Wireless's fiscal week logic:
 * - Week closes every Friday
 * - Week 1 of the month = from Monday before the first Friday to that Friday
 * - Example: April 2026: Week 1 = Mar 29 - Apr 3 (first Friday is Apr 3)
 * - January 2026 had 5 Fridays, so 5 weeks
 */

export interface FiscalWeek {
    week: number;
    month: string; // YYYY-MM
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD (Friday)
    label: string; // "Semana 1", "Semana 2", etc
}

/**
 * Get all Fridays in a given month and the previous month (for first week calculation)
 */
function getFridaysInMonth(year: number, month: number): Date[] {
    const fridays: Date[] = [];
    
    // Start from the last week of previous month
    const prevDate = new Date(year, month - 1, 1);
    prevDate.setDate(0); // Last day of previous month
    
    // Find first Friday from last day of previous month going forward
    const daysUntilFriday = (5 - prevDate.getDay() + 7) % 7 || 7;
    const firstFriday = new Date(year, month - 1, prevDate.getDate() + daysUntilFriday);
    
    // Collect all Fridays in this month
    let currentFriday = firstFriday;
    while (currentFriday.getMonth() === month - 1 || 
           (currentFriday.getMonth() === month && currentFriday.getDate() <= 7)) {
        if (currentFriday.getMonth() === month - 1) {
            fridays.push(new Date(currentFriday));
        }
        currentFriday.setDate(currentFriday.getDate() + 7);
    }
    
    // Now get Fridays that belong to this month
    currentFriday = new Date(year, month - 1, 1);
    // Find first Friday of this month
    const firstDayMonth = new Date(year, month - 1, 1);
    const daysToFirstFridayMonth = (5 - firstDayMonth.getDay() + 7) % 7 || 7;
    currentFriday = new Date(year, month - 1, daysToFirstFridayMonth);
    
    fridays.length = 0; // Reset
    while (currentFriday.getMonth() === month - 1) {
        fridays.push(new Date(currentFriday));
        currentFriday.setDate(currentFriday.getDate() + 7);
    }
    
    return fridays;
}

/**
 * Get all fiscal weeks for a given month
 * Returns array of weeks with their date ranges
 */
export function getFiscalWeeksForMonth(year: number, month: number): FiscalWeek[] {
    const weeks: FiscalWeek[] = [];
    const fridays = getFridaysInMonth(year, month);
    
    if (fridays.length === 0) return weeks;
    
    fridays.forEach((friday, index) => {
        const weekNum = index + 1;
        const endDate = new Date(friday);
        
        // Week starts on Monday (or previous Monday if Friday is early in month)
        const startDate = new Date(friday);
        startDate.setDate(startDate.getDate() - 4); // 4 days back from Friday = Monday
        
        // Format dates
        const formatDate = (d: Date) => d.toISOString().split('T')[0];
        const monthStr = `${year}-${String(month).padStart(2, '0')}`;
        
        weeks.push({
            week: weekNum,
            month: monthStr,
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            label: `Semana ${weekNum}`,
        });
    });
    
    return weeks;
}

/**
 * Get fiscal week for a specific date
 */
export function getFiscalWeekForDate(dateStr: string): FiscalWeek | null {
    const [year, month] = dateStr.split('-').map(Number);
    const weeks = getFiscalWeeksForMonth(year, month);
    
    const checkDate = new Date(`${dateStr}T00:00:00`);
    
    for (const week of weeks) {
        const startDate = new Date(`${week.startDate}T00:00:00`);
        const endDate = new Date(`${week.endDate}T00:00:00`);
        
        if (checkDate >= startDate && checkDate <= endDate) {
            return week;
        }
    }
    
    return null;
}

/**
 * Get current fiscal week
 */
export function getCurrentFiscalWeek(): FiscalWeek | null {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const dateStr = today.toISOString().split('T')[0];
    
    return getFiscalWeekForDate(dateStr);
}

/**
 * Helper to get week label for display
 */
export function getWeekLabel(dateStr: string): string {
    const week = getFiscalWeekForDate(dateStr);
    if (!week) return '-';
    
    const [year, month] = dateStr.split('-').map(Number);
    const monthName = new Date(year, month - 1).toLocaleString('pt-BR', { month: 'long' });
    
    return `Semana ${week.week} - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;
}
