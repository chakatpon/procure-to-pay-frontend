import { http } from '../../../utils/Http';

export const refreshTokenApi = async (token) => {
  try {
    let responseData = await http.get('api/v1/refreshToken', {
      headers: { Authorization: 'Bearer ' + token },
    });

    if (responseData) {
      if (responseData.status == 200) {
        return responseData.data;
      }
    } else {
      return null;
    }
  } catch (err) {
    return null;
  }
};
