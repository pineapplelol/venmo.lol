const axios = require("axios");

const instance = axios.create({
  // baseURL: "https://venmoapi.pineapple.lol",
  baseURL: "http://localhost:8000",
});

export const getUserInformation = (username) => {
  return instance.get(`/${username}`).then(
    (res) => res.data.info,
    (err) => {
      console.error(err);
      return null;
    }
  );
};

export const getUserTransactions = (username) => {
  return instance.get(`/${username}`).then(
    (res) => res.data.transactions,
    (err) => {
      console.error(err);
      return null;
    }
  );
};
