import axios from "axios";
import React from "react";
// import app from 'next/app';
import { StoreContext } from "@/context/store";
import _, { get } from "lodash";
import getConfig from "next/config";
import Router from "next/router";

const B2PAPI = (context) => {
  const { getStorage, setStorage, showAlertDialog } = React.useContext(context);
  const { publicRuntimeConfig } = getConfig();

  const getApi = async (endpoint, payload = [], options = []) => {
    const axiosConfig = {
      baseURL: publicRuntimeConfig.API_ENDPOINT,
      timeout: 10*60*1000,
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    };
    // console.log("axiosConfig", axiosConfig, endpoint, payload, options);
    const apiCall = axios.create(axiosConfig);

    let userData = getStorage("userData");
    let accessToken = getStorage("accessToken");
    let headers = {
      ...axiosConfig.headers,
    };
    if (_.get(options, "authorized", false)) {
      headers = {
        Authorization: _.join(["Bearer", accessToken], " "),
        ..._.get(options, "headers", []),
      };
    }
    let opts = {
      ...options,
      method: _.get(options, "method", "get"),
      url: endpoint,
      headers,
    };
    if (_.get(options, "method", "get") == "get") {
      if (payload) {
        opts = {
          ...opts,
          params: payload,
        };
      }
    } else {
      opts = {
        ...opts,
        data: payload,
      };
    }
    try {
      // console.log("opt : ",opts);
      // console.log("api Call : ", apiCall.request(opts));
      const response = await apiCall.request(opts);

      if (get(response, "data.isProcessing", false)) {
        // handle isProcessing http request flag from server (Async request)

        showAlertDialog({
          html: get(response, "data.message",""),
          customClass: { icon: "processing" },
          iconHtml:
            '<svg viewBox="64 64 896 896" focusable="false" data-icon="clock-circle" width="1.5em" height="1.5em" fill="#A7A5A5" aria-hidden="true"><path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z"></path><path d="M686.7 638.6L544.1 535.5V288c0-4.4-3.6-8-8-8H488c-4.4 0-8 3.6-8 8v275.4c0 2.6 1.2 5 3.3 6.5l165.4 120.6c3.6 2.6 8.6 1.8 11.2-1.7l28.6-39c2.6-3.7 1.8-8.7-1.8-11.2z"></path></svg>',
          confirmButtonText: "OK",
        }).then(() => {
          if (get(response, "data.redirectURL", "") !== "") {
            Router.push(get(response, "data.redirectURL"));
          } else {
            window.location.reload();
          }
        });
        return new Promise(() => {});
      }

      return response;
      
    } catch (error) {
      console.log("error :", error.response);
      console.log("error code :", error.code);
      if (get(error, "response.data.status") == 401) {
        // handle 401 http error code from server (Unauthorized)
        const timeOut = setTimeout(() => {
          localStorage.clear();
          window.location = "/login";
          clearTimeout(timeOut);
        }, 3000);
        error.response.data.message = "Session expired.Please login again.";
        return error.response;
      } else if (error.code == "ETIMEDOUT" || error.code == "ECONNABORTED" || get(error, "response.status") == 504) {
        // handle 504 http error code from server and timeout code from axios (timeout)
        showAlertDialog({
          title: "Connection timed out",
          text: "Connection timed out, please try reloading this page again.",
          icon: "error",
          confirmButtonText: "Reload Page",
        }).then(() => window.location.reload());
        // throw error;
        return new Promise(() => {});
      }
      if (get(error, "response.data.status") == 502) {
        // handle 502 http error code from server (bad gateway)
        showAlertDialog({
          title: "Connection failed",
          text: "Connection bad gateway, please try reloading this page again.",
          icon: "error",
          confirmButtonText: "Reload Page",
        }).then(() => window.location.reload());
        // throw error;
        return new Promise(() => {});
      } else {
        return error.response;
      }
    }
  };
  return {
    getApi,
  };
};
export { B2PAPI };
