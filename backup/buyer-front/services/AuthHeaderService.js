import { encryptStorage, decryptStorage } from '../src/lib/encrypStorage';
import { refreshTokenApi } from '../src/pages/api/RefreshTokenApi';

export default async function AuthHeaderService() {
  try {
    const localStorageObj = decryptStorage('user');
    let token = localStorageObj.token;
    const expToken = localStorageObj.expireTime;
    const dateNow = new Date();

    if (localStorageObj && token) {
      if ((expToken / 1000 ) < ((dateNow.getTime() / 1000) + 290)) {
        const refreshToken = await refreshTokenApi(token);
        if (refreshToken !== null) {
          const localStoreRefresh = {
            ...localStorageObj,
            expireTime: refreshToken.expireTime,
            token: refreshToken.token,
          }
          encryptStorage('user', localStoreRefresh);
          token = refreshToken.token;
          return { Authorization: 'Bearer ' + token };
        }
      } else {
        return { Authorization: 'Bearer ' + token };
      }
    } else {
      return {};
    }
  } catch (err) {
    console.log(err.message);
    return null;
  }
}
