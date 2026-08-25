import getApiClient from './client';

export const contactApi = {
  async send(payload) {
    const { data } = await getApiClient().post('/api/contact', payload);
    return data;
  },

  async list() {
    const { data } = await getApiClient().get('/api/contact');
    return data;
  },

  async reply(id, adminReply) {
    const { data } = await getApiClient().post(`/api/contact/${id}/reply`, { adminReply });
    return data;
  },
};
