import { User } from '@/contexts/UserContext';

// Replace this with your actual Google Apps Script Web App URL
const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzHHMc7nVlvEDMIxi2XbwizndyMiiGfpLV4H-rYvBSafRQxV0PVekM2EwyElpiW48dP/exec';

export interface PrayerLog {
  gmail: string;
  name: string;
  age: number;
  gender: string;
  date: string;
  prayer: string;
  status: string;
  reason?: string;
  periodDay: boolean;
  timestamp: string;
  missedNamazCount?: number;
}

export const api = {
  // Check if user exists and return their data
  async checkUser(gmail: string): Promise<User | null> {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getUser&gmail=${encodeURIComponent(gmail)}`);
      const data = await response.json();
      return data.user || null;
    } catch (error) {
      console.error('Error checking user:', error);
      return null;
    }
  },

  // Create new user
  async createUser(user: User): Promise<boolean> {
    try {
      console.log('Creating user with data:', user);
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createUser',
          ...user,
        }),
      });
      
      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!data.success) {
        console.error('API returned error:', data.error || 'Unknown error');
      }
      
      return data.success;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  },

  // Log a missed prayer
  async logPrayer(log: Partial<PrayerLog>): Promise<boolean> {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'logPrayer',
          ...log,
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error logging prayer:', error);
      return false;
    }
  },

  // Get user's prayer logs
  async getUserLogs(gmail: string): Promise<PrayerLog[]> {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getUserLogs&gmail=${encodeURIComponent(gmail)}`);
      const data = await response.json();
      return data.logs || [];
    } catch (error) {
      console.error('Error fetching logs:', error);
      return [];
    }
  },

  // Get user statistics
  async getUserStats(gmail: string) {
    try {
      const response = await fetch(`${APPS_SCRIPT_URL}?action=getUserStats&gmail=${encodeURIComponent(gmail)}`);
      const data = await response.json();
      return data.stats || { totalMissed: 0, completed: 0, periodDays: 0 };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { totalMissed: 0, completed: 0, periodDays: 0 };
    }
  },

  // Update Qaza count
  async updateQazaCount(gmail: string, count: number): Promise<boolean> {
    try {
      const response = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateQaza',
          gmail,
          count,
        }),
      });
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error updating Qaza:', error);
      return false;
    }
  },
};
