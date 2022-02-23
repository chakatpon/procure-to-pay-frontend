import CryptoJS from 'crypto-js';
import { isNull } from 'lodash';
import { SECRET_KEY } from '../../constant';

export const encryptStorage = (keyLocal, data) => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  localStorage.setItem(keyLocal, ciphertext);
};

export const decryptStorage = (keyLocal) => {
  const localStorageData = localStorage.getItem(keyLocal);
  if (isNull(localStorageData) === false) {
    const bytes = CryptoJS.AES.decrypt(localStorageData, SECRET_KEY);
    const decryptData = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decryptData;
  } else {
    return null;
  }
};
