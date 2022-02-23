import { http } from '../../../utils/Http';
import AuthHeaderService from '../../../services/AuthHeaderService';

export const getUserRole = async () => {
    try {
      const response = await http.get('api/v1/role', {
        headers: await AuthHeaderService(),
      });
      if (response) {
        return response;
      }
    } catch (error) {
      console.log(error);
      return null;
    }
  };