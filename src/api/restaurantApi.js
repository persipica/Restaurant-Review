import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';
import jwtAxios from './jwtAxios';

const prefix = `${API_BASE_URL}/restaurants`;

export const getRestaurantList = async () => {
  const response = await axios.get(`${prefix}/list`);
  return response.data;
};

export const getPopularRestaurantList = async () => {
  const response = await axios.get(`${prefix}/popular`);
  return response.data;
};

export const getRestaurant = async (rno) => {
  const response = await axios.get(`${prefix}/${rno}`);
  return response.data;
};

export const addRestaurant = async (formData) => {
  const response = await jwtAxios.post(`${prefix}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const modifyRestaurant = async (rno, formData) => {
  const response = await jwtAxios.put(`${prefix}/${rno}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

export const deleteRestaurant = async (rno) => {
  const response = await jwtAxios.delete(`${prefix}/${rno}`);
  return response.data;
};

export const getMyRestaurants = async () => {
  const response = await jwtAxios.get(`${prefix}/my`);
  return response.data;
};

export const getFavoriteRestaurants = async () => {
  const response = await jwtAxios.get(`${prefix}/favorites`);
  return response.data;
};

export const toggleFavoriteRestaurant = async (rno) => {
  const response = await jwtAxios.post(`${prefix}/${rno}/favorite`);
  return response.data;
};

export const getFavoriteStatus = async (rno) => {
  const response = await jwtAxios.get(`${prefix}/${rno}/favorite`);
  return response.data;
};

export const toggleRestaurantReaction = async (rno, reactionType) => {
  const response = await jwtAxios.post(`${prefix}/${rno}/reaction`, {
    reactionType,
  });

  return response.data;
};

export const getMyRestaurantReaction = async (rno) => {
  const response = await jwtAxios.get(`${prefix}/${rno}/reaction`);
  return response.data;
};
