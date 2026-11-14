// src/shared/api/superadminApi.ts
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
  const { data } = await api.get('/admin/dashboard/overview');
  const d = data.data ?? data;

  // Normalize: لو revenue رقم مش object
  const normalized: DashboardOverview = {
    revenue: typeof d.revenue === 'number'
      ? { value: d.revenue, growth: 0 }
      : { value: d.revenue?.value ?? 0, growth: d.revenue?.growth ?? 0 },
    pendingRequests: typeof d.pendingRequests === 'number'
      ? { value: d.pendingRequests, growth: 0 }
      : { value: d.pendingRequests?.value ?? 0, growth: d.pendingRequests?.growth ?? 0 },
    totalUsers: typeof d.totalUsers === 'number'
      ? { value: d.totalUsers, growth: 0 }
      : { value: d.totalUsers?.value ?? 0, growth: d.totalUsers?.growth ?? 0 },
    totalAcademies: typeof d.totalAcademies === 'number'
      ? { value: d.totalAcademies, growth: 0 }
      : { value: d.totalAcademies?.value ?? 0, growth: d.totalAcademies?.growth ?? 0 },
    badges: d.badges ?? { pendingRequests: 0, pendingMessages: 0, unreadNotifications: 0 },
  };
  return normalized;
},

  async getGrowth(days = 7): Promise<GrowthPoint[]> {
    const { data } = await api.get('/admin/dashboard/growth', {
      params: { days },
    });
    return data.data ?? data;
  },

  async getActivity(limit = 10): Promise<ActivityItem[]> {
    const { data } = await api.get('/admin/dashboard/activity', {
      params: { limit },
    });
    return data.data ?? data;
  },

  async getBadges() {
    const { data } = await api.get('/admin/dashboard/badges');
    return data.data ?? data;
  },
};

export default superadminApi;
