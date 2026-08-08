import getApiClient from './client';

export const contactApi = {
  async send(payload) {
    const { data } = await getApiClient().post('/api/contact', payload);
    return data;
  },
};
