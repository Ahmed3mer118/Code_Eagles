import axios from 'axios';
import API_BASE from '../config/apiBase';

export const publicService = {
  async getPlans() {
    const { data } = await axios.get(`${API_BASE}/platform/plans`);  // ✅
    return Array.isArray(data) ? data : data?.data || [];
  },
};

export default publicService;
