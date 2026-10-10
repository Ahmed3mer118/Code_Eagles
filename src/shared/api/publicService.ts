import axios from 'axios';
import API_BASE from '../config/apiBase';

export interface Plan {
  id: string;
  name: string;
  nameAr?: string;
  description?: string;
  descriptionAr?: string;
  price: number;
  currency?: string;
  durationMonths?: number;
  isPopular?: boolean;
  features?: string[] | Record<string, boolean>;
  featuresAr?: string[];
  sortOrder?: number;
  slug?: string;
}

export const publicService = {
  async getPlans(): Promise<Plan[]> {
    // ✅ API_BASE = http://localhost:3000/api/v1
    // ✅ المسار الكامل: /api/v1/api/platform/plans
    const { data } = await axios.get(`${API_BASE}/api/platform/plans`);
    return Array.isArray(data) ? data : data?.data || [];
  },
};

export default publicService;