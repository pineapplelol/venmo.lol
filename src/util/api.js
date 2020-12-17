/* eslint-disable no-console */
const axios = require('axios');

const instance = axios.create({
  baseURL: process.env.REACT_APP_VENMOLOL_API,
});

export const getUserInformation = username => {
  return instance.get(`/${username}`).then(
    res => res.data.info,
    err => {
      console.error(err);
      return null;
    },
  );
};

export const getUserTransactions = username => {
  return instance.get(`/${username}`).then(
    res => res.data.transactions,
    err => {
      console.error(err);
      return null;
    },
  );
};
