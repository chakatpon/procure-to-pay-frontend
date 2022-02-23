// import axios from '../node_modules/axios'
import { http } from '../../../utils/Http';

import AuthHeaderService from '../../../services/AuthHeaderService';

export const getForgotPassword = async (req) => {
  const data = {
    email: req.email,
    recoverUrl: "localhost:3000/resetPassword/?token="
  }

  return http
    .post('public/v1/recover/user', data)
    .then((res) => res)
    .catch(() => null)
};

export const getResetPassword = async (req) => {
  const data = {
    newPassword: req.newPassword,
    recoverToken: req.recoverToken
  }

  return http
    .post('public/v1/reset/password', data, { headers: { Authorization: `Bearer ${data.recoverToken}` } })
    .then((res) => res)
    .catch((err) => err)
}

export const getChangePassword = async (req) => {
  const data = {
    oldPassword: req.oldPassword,
    newPassword: req.newPassword
  }

  return http
    .post('api/v1/change/password', data, { headers: await AuthHeaderService() })
    .then((res) => res)
    .catch((err) => {
      if (err.message === "Request failed with status code 422") {
        const res = { status: 422 }
        return res
      }
      return err
    })
}