const axios = require("axios").default;

module.exports = axios.create({
  baseURL: "http://localhost:3500",
  withCredentials: true,
});
