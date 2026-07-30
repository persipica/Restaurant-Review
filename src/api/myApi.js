import { API_BASE_URL } from '../config/apiConfig';
import jwtAxios from './jwtAxios';

const prefix = `${API_BASE_URL}/member`;

export const getMyInfo = async () => {
  const response = await jwtAxios.get(`${prefix}/me`);
  return response.data;
};

export const modifyMyInfo = async (formData) => {
  const response = await jwtAxios.put(`${prefix}/modify`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteMyAccount = async () => {
  const response = await jwtAxios.delete(`${prefix}/delete`);
  return response.data;
};
