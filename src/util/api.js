/* eslint-disable no-console */
const axios = require('axios');

const instance = axios.create({
  baseURL: 'http://localhost:8000',
  // baseURL: process.env.REACT_APP_VENMOLOL_API,
  // headers: {
  //   key: `${process.env.REACT_APP_VENMOLOL_API_KEY}`,
  // },
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
