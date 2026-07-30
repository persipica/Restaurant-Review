import axios from 'axios';
import useMemberStore from '../store/useMemberStore';

const jwtAxios = axios.create();

jwtAxios.interceptors.request.use(
  (config) => {
    const state = useMemberStore.getState();

    const token =
      state.accessToken ||
      state.member?.accessToken ||
      state.member?.token ||
      state.token;

    if (!token) {
      console.log('jwtAxios 토큰 없음:', state);

      return Promise.reject({
        response: {
          status: 401,
          data: {
            error: 'REQUIRE_LOGIN',
            message: '로그인이 필요한 요청입니다.',
          },
        },
      });
    }

    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;

    console.log('jwtAxios Authorization 적용됨');

    return config;
  },
  (error) => Promise.reject(error)
);

jwtAxios.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export default jwtAxios;
