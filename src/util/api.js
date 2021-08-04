/* eslint-disable no-console */
const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.REACT_APP_VENMOLOL_API,
});

export const getUserInformation = (username) =>
  instance.get(`/${username}`).then(
    (res) => res.data.info,
    () => null,
  );

export const getUserTransactions = (username) =>
  instance.get(`/${username}`).then(
    (res) => res.data.transactions,
    () => null,
  );
