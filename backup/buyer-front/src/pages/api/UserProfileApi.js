import { http } from '../../../utils/Http';
import AuthHeaderService from '../../../services/AuthHeaderService';

export const userProfileInquiry = async (requestBody) => {
  try {
    const response = await http.post('api/v1/inquiry/user/profile', requestBody, {
      headers: await AuthHeaderService(),
    });

    if (response && response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const companyAccess = async () => {
  try {
    const response = await http.get('api/v1/get/company/access', {
      headers: await AuthHeaderService(),
    });

    if (response && response.status === 200) {
      return response.data;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getUserDetail = async (id) => {
  try {
    const response = await http.post('api/v1/view/user/profile', id , {
      headers: await AuthHeaderService(),
    });
    if (response) {
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error.response.data);
    return null;
  }
};

export const getUserActionHistory = async (id) => {
  try {
    const response = await http.post('api/v1/view/history/user/profile', id , {
      headers: await AuthHeaderService(),
    });
    if (response) {
      return response;
    } else {
      return null;
    }
  } catch (error) {
    console.log(error.response.data);
    return null;
  }
};

export const createUserProfile = async (requestBody, options) => {
  try {
    const headerAuth = await AuthHeaderService();
    const response = await http.post('api/v1/create/user/profile', requestBody, {
      headers: { ...options, ...headerAuth },
    });
    if (response && response.status === 200) {
      return response.data;
    } else {
      return response;
    }
  } catch (error) {
    console.log(error.response.data);
    return null;
  }
};
