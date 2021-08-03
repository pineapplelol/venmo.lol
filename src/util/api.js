/* eslint-disable no-console */
const axios = require('axios');

const instance = axios.create({
  baseURL: 'https://venmolol-api-9l8xm07lr-n3a9.vercel.app/',
});

export const getUserInformation = (username) =>
  instance.get(`/${username}`).then(
    (res) => res.data.info,
    (err) => {
      console.error(err);
      return null;
    },
  );

export const getUserTransactions = (username) =>
  instance.get(`/${username}`).then(
    (res) => res.data.transactions,
    (err) => {
      console.error(err);
      return null;
    },
  );
