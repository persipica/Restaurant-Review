import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import jwtAxios from './jwtAxios';

const prefix = `${API_BASE_URL}/restaurants`;

export const getCommentList = async (rno, page = 1, size = 15) => {
  const response = await axios.get(`${prefix}/${rno}/comments`, {
    params: {
      page,
      size,
    },
  });

  return response.data;
};

export const addComment = async (rno, comment) => {
  const response = await jwtAxios.post(`${prefix}/${rno}/comments`, comment);

  return response.data;
};

export const modifyComment = async (rno, cno, comment) => {
  const response = await jwtAxios.put(
    `${prefix}/${rno}/comments/${cno}`,
    comment
  );

  return response.data;
};

export const deleteComment = async (rno, cno) => {
  const response = await jwtAxios.delete(`${prefix}/${rno}/comments/${cno}`);

  return response.data;
};
