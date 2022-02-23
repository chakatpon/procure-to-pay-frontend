/* eslint-disable no-undef */
import React, { createContext, useState } from "react";
import { withCookies, useCookies } from "react-cookie";
import { get, filter, some } from "lodash";
import dynamic from "next/dynamic";
import CryptoJS from "crypto-js";
import aes from "crypto-js/aes";
import Swal from "sweetalert2";
import Router, { useRouter } from "next/router";
import getConfig from 'next/config';
export const StoreContext = createContext({});

export const StoreContextProvider = ({ children, SECRET_KEY }) => {
  const { publicRuntimeConfig } = getConfig();
  const [cookies, setCookie, removeCookie] = useCookies([]);
  const [appLoading, setAppLoading] = useState(false);
  const [appLoadingText, setAppLoadingText] = useState("Processing");
  const [encryptKey, setEncryptKey] = useState(publicRuntimeConfig.SECRET_KEY);
  const [appApiEndPoint, setAppApiEndPoint] = useState(publicRuntimeConfig.API_ENDPOINT);
  const [appSocketEndPoint, setAppSocketEndPoint] = useState(publicRuntimeConfig.SOCKET_ENDPOINT);
  const [loginUser, setLoginUser] = useState({});
  const [isLogin, setIsLogin] = useState("");
  const [appMenu, setAppMenu] = useState([]);
  const [editValue, setEditValue] = useState([]);
  const [appMenuActive, setAppMenuActive] = useState(false);
  const [profileCanvas, setProfileCanvas] = useState(false);
  const [permissionOfPage, setPermissionOfPage] = useState([]);

  const [buyerApprovalDetailId, setBuyerApprovalDetailId] = useState('');
  const [buyerDetailId, setBuyerDetailId] = useState('');
  const [branchDetailId, setBranchDetailId] = useState('');
  const [supplierNameDetailId, setSupplierNameDetailId] = useState('');
  const [supplierBranchNameDetailId, setSupplierBranchNameDetailId] = useState('');
  const [supplierNameApprovalDetailId, setSupplierNameApprovalDetailId] = useState('');
  const [tab, setTab] = useState('1');
  const [tabReport, setTabReport] = useState("summaryTable");
  const [messageLoading, setMessageLoading] = useState("");

  //FOR PO - START
  //FOR PO - END

  const router = useRouter();

  const showAlertDialog = async (opts) => {
    return await Swal.fire({
      heightAuto: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      ...opts,
    }).then((result) => {
      if (result.isConfirmed) {
        if (opts.routerLink) {
          Router.push({
            pathname: opts.routerLink,
          })
        }
      }
    })
  };

  const showStandardDialog = async (title, text, icon, routerLink, close = () => { }, showLoading, loading, time) => {
    await showAlertDialog({
      title,
      text,
      icon,
      routerLink,
      showCloseButton: true,
      showConfirmButton: true,
      close: close(),
      willClose: () => showLoading ? showLoadingDelay(loading, time) : null
    })
  }

  const showLoadingDelay = async (message, time = 3000) => {
    showLoading(message)
    await setTimeout(() => {
      hideLoading()
    }, time)
  }

  const assignParams = (data, config, text) => {
    let params = {};
    for (const [key, value] of Object.entries(get(config, "actionParams", {}))) {
      let v = "";
      if (value == ":value") {
        v = text;
      } else {
        v = get(data, value);
      }
      params = { ...params, [key]: v }
    }
    return params;
  }
  const setStorage = (key, data) => {
    var ciphertext;
    try {
      ciphertext = CryptoJS.AES.encrypt(JSON.stringify({data}), publicRuntimeConfig.SECRET_KEY || SECRET_KEY);
    } catch (e) {
      ciphertext = CryptoJS.AES.encrypt({data}, publicRuntimeConfig.SECRET_KEY || SECRET_KEY);
    }
    setCookie(key, data)
    //setCookie(key, ciphertext);
    localStorage.setItem(key, ciphertext);
  };
  const getStorage = (key) => {
    var ciphertext = localStorage.getItem(key);

    // var ciphertext = get(cookies,key,"");
    if (!ciphertext) {
      return "";
    }
    var bytes = CryptoJS.AES.decrypt(ciphertext, publicRuntimeConfig.SECRET_KEY || SECRET_KEY);
    var decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    try {
      return JSON.parse(decryptedData).data;
    } catch (e) {
      return decryptedData.data;
    }
  };

  const forceLogin = () => {
    localStorage.clear();
    // localStorage.removeItem("accessToken");
    // localStorage.removeItem("userData");
    // localStorage.removeItem("menuList");
    removeCookie("accessToken");
    router.push("/login");
  };

  const forceChangePassword = () => {
    router.push("/changePassword");
  }

  const showLoading = (message) => {
    setAppLoading(true);
    if (message) {
      setAppLoadingText(message);
    } else {
      if (messageLoading != "") {
        setAppLoadingText(messageLoading);
      } else {
        setAppLoadingText("Processing");
      }
    }
    // window.scrollTo(0,0)
  };

  const hideLoading = () => {
    setAppLoading(false);
    setAppLoadingText("Processing");
    // setAppMenu(false);
    // setAppMenu(false);
    // setLoginUser([]);
  };

  const isAllow = (mcode, roles) => {
    const userData = getStorage("userData");
    const menuList = getStorage("menuList");
    let perm = get(userData, "permission." + mcode, []).filter(p => roles.filter(s => s == p).length == 1);
    return perm.length > 0;
  }

  const setPermission = (currentPage) => {
    const resultMenu = getStorage("menu");
    if (resultMenu) {
      const localStorUser = getStorage("user");
      const permission = get(localStorUser, "permission", {});

      const permissionOfPage = filter(permission, (permiss, key) => {
        return some(resultMenu, (parentMenu) => {
          if (get(parentMenu, "subMenu", []).length > 0) {
            // ---- if parent menu have subMenu ----
            return some(parentMenu.subMenu, (sub1) => {
              if (get(sub1, "subMenu", []).length > 0) {
                // ---- if sub menu level 1 have subMenu ----
                return some(sub1.subMenu, (sub2) => sub2.url == currentPage && sub2.code == key);
              } else {
                // ---- if sub menu level 1 no subMenu ----
                return sub1.url == currentPage && sub1.code == key;
              }
            });
          } else {
            // ---- if parent menu no subMenu ----
            return parentMenu.url == currentPage && parentMenu.code == key;
          }
        });
      });

      setPermissionOfPage(permissionOfPage);
    }
  };
  const getSetting = (key, defaultValue) => {
    var userData = getStorage("userData");
    var savekey = userData.username + '-' + key + '-' + window.location.pathname;
    var val = getStorage(savekey);
    if (val) {
      return val;
    }
    if (typeof defaultValue == undefined) {
      return "";
    }
    return defaultValue;
  }
  const setSetting = (key, value) => {
    var userData = getStorage("userData");
    var savekey = userData.username + '-' + key + '-' + window.location.pathname;
    if (typeof value !== undefined) {
      return setStorage(savekey, value);
    } else {
      localStorage.removeItem(savekey);
    }
  }
  const store = {
    getStorage,
    setStorage,
    appLoading,
    setAppLoading,
    appLoadingText,
    setAppLoadingText,
    loginUser,
    setLoginUser,
    appMenu,
    setAppMenu,
    appMenuActive,
    setAppMenuActive,
    showLoading,
    showStandardDialog,
    hideLoading,
    profileCanvas,
    setProfileCanvas,
    showAlertDialog,
    forceLogin,
    forceChangePassword,
    isLogin,
    setIsLogin,
    permissionOfPage, setPermission,
    buyerApprovalDetailId,
    setBuyerApprovalDetailId,
    buyerDetailId,
    setBuyerDetailId,
    branchDetailId,
    setBranchDetailId,
    supplierNameDetailId,
    setSupplierNameDetailId,
    supplierBranchNameDetailId,
    setSupplierBranchNameDetailId,
    supplierNameApprovalDetailId,
    setSupplierNameApprovalDetailId,
    tab,
    setTab,
    tabReport,
    setTabReport,
    isAllow,
    editValue, setEditValue,
    assignParams,
    appApiEndPoint, setAppApiEndPoint,
    appSocketEndPoint, setAppSocketEndPoint,
    showLoadingDelay,
    getSetting, setSetting,
    setMessageLoading,
    messageLoading,
  };
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
};
