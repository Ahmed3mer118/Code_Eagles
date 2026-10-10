import api from './client';

export interface DashboardOverview {
  revenue: { value: number; growth: number };
  pendingRequests: { value: number; growth: number };
  totalUsers: { value: number; growth: number };
  totalAcademies: { value: number; growth: number };
  badges: {
    pendingRequests: number;
    pendingMessages: number;
    unreadNotifications: number;
  };
}

export interface GrowthPoint {
  date: string;
  academies: number;
  users: number;
}

export interface ActivityItem {
  id: string;
  type: 'academy_join' | 'message' | 'testimonial' | 'signup';
  title: string;
  subtitle?: string;
  status?: string;
  createdAt: string;
}

export const superadminApi = {
  async getOverview(): Promise<DashboardOverview> {
    const { data } = await api.get('/api/admin/dashboard/overview');
    return data.data ?? data;
  },

  async getGrowth(days = 7): Promise<GrowthPoint[]> {
    const { data } = await api.get('/api/admin/dashboard/growth', {
      params: { days },
    });
    return data.data ?? data;
  },

  async getActivity(limit = 10): Promise<ActivityItem[]> {
    const { data } = await api.get('/api/admin/dashboard/activity', {
      params: { limit },
    });
    return data.data ?? data;
  },

  async getBadges() {
    const { data } = await api.get('/api/admin/dashboard/badges');
    return data.data ?? data;
  },
};

export default superadminApi;