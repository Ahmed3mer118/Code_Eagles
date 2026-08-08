import AuthServices from './authService';

const auth = new AuthServices();

export function getApiClient() {
  return auth.getAxiosInstance();
}

export default getApiClient;
