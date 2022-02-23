// import axios from '../node_modules/axios'
import { http } from '../../../utils/Http';

import AuthHeaderService from '../../../services/AuthHeaderService';

export const getMenuBuyer = async () => {
  try {
    let response = await http.get('api/v1/menu', { headers: await AuthHeaderService() });
    if (response.status == 200) {
      return response.data;
    }
  } catch (error) {
    localStorage.removeItem('user');
    window.location.replace('/login/');
    return null;
  }
};
