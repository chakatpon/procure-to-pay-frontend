// import axios from '../node_modules/axios'
import { http } from '../../../utils/Http';
import { decryptStorage } from '../../lib/encrypStorage';

export const getLoginBuyer = (req) => {
  const data = {
    // ldap: true,
    username: req.username,
    password: req.password,
    isRemember: req.isRemember,
  };

  return http
    .post('public/v1/signin', data)
    .then((res) => {
      return res;
    })
    .catch((error) => {
      console.log(error);
      localStorage.removeItem('user');
      if (error.response) {
        return error.response.data;
      }
    });
};

export const getCurrentUser = () => {
  try {
    return decryptStorage('user');
  } catch (error) {
    localStorage.removeItem('user');
    // window.location.replace("/login/");
    console.log(error.message);
  }
};

export const logout = () => {
  try {
    localStorage.removeItem('user');
    window.location.replace('/login/');
  } catch (error) {
    localStorage.removeItem('user');
    window.location.replace('/login/');
    console.log(error.message);
  }
};
