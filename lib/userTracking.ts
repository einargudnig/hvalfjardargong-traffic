import { v4 as uuidv4 } from 'uuid';

const USER_ID_KEY = 'tunnel_traffic_user_id';

// Get or create user ID
export const getUserId = (): string => {
  // Only run on client
  if (typeof window === 'undefined') {
    return '';
  }
  
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    userId = uuidv4();
    localStorage.setItem(USER_ID_KEY, userId);
  }
  
  return userId;
};

// Check if user has reported recently (prevent spam)
export const hasReportedRecently = (tunnelId: string, direction: string): boolean => {
  // Only run on client
  if (typeof window === 'undefined') {
    return false;
  }
  
  const key = `last_report_${tunnelId}_${direction}`;
  const lastReportTime = localStorage.getItem(key);
  
  if (!lastReportTime) {
    return false;
  }
  
  const now = Date.now();
  const lastReport = parseInt(lastReportTime, 10);
  const timeDiff = now - lastReport;
  const fifteenMinutes = 15 * 60 * 1000;
  
  return timeDiff < fifteenMinutes;
};

// Record a new report
export const recordReport = (tunnelId: string, direction: string): void => {
  // Only run on client
  if (typeof window === 'undefined') {
    return;
  }
  
  const key = `last_report_${tunnelId}_${direction}`;
  localStorage.setItem(key, Date.now().toString());
};
