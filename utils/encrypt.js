// utils/encrypt.js
const CryptoJS = require("crypto-js");

const encryptPayload = (data, secretKey) => {
  const ciphertext = CryptoJS.AES.encrypt(
    JSON.stringify(data),
    secretKey
  ).toString();
  return encodeURIComponent(ciphertext); // make it URL-safe
};

module.exports = { encryptPayload };
