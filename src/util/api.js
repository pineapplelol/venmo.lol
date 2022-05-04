/* eslint-disable no-console */
const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:8000',
  // baseURL: process.env.REACT_APP_VENMOLOL_API,
});

export const getUserInformation = (username) =>
  instance.get(`/${username}`).then(
    (res) => res.data.user,
    () => null,
  );

export const getUserTransactions = (username) =>
  instance.get(`/${username}`).then(
    (res) => {
      return res.data.transactions;
    },
    () => null,
  );
