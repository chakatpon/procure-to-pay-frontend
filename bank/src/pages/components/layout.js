import React from "react";
import HeaderMobile from "@/shared/components/HeaderMobile";
import Header from "@/shared/components/Header";
import Footer from "@/shared/components/Footer";
import QuickUserPanel from "@/shared/components/QuickUserPanel";
import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import { StoreContext } from "@/context/store";
import BlockUi from "react-block-ui";
import { useTranslation } from "next-i18next";
import { B2PAPI } from "@/context/api";
import "antd/dist/antd.css";
import Document, { Html, Head, Main, NextScript } from 'next/document'
import ErrorHandle from "@/shared/components/ErrorHandle";
import { get } from "lodash";
import { Modal,Button } from "antd";

export default function Layout({ children }) {
  const AppApi = B2PAPI(StoreContext);
  const router = useRouter();

  const path = router.asPath

  const nonLoginPage = router.asPath == "/login" ||
    router.asPath == "/forgotPassword" ||
    path.search("/resetPassword") != "-1"

  const { t, i18n } = useTranslation("layout");
  const {
    setProfileCanvas,
    appLoading,
    setAppLoading,
    appLoadingText,
    setAppLoadingText,
    loginUser,
    setLoginUser,
    showLoading,
    hideLoading,
    getStorage,
    setStorage,
    isLogin,
    setIsLogin,
    forceLogin

  } = useContext(StoreContext);
  // const { appLoading, setAppLoading } = useContext(StoreContext);
  // const { appLoadingText, setAppLoadingText } = useContext(StoreContext);
  // const { loginUser, setLoginUser } = useContext(StoreContext);
  // const { showLoading, hideLoading } = useContext(StoreContext);
  // const { getStorage, setStorage } = useContext(StoreContext);
  // const [isLogin, setIsLogin] = useContext(StoreContext);

  // ------ expire token variable -----
  const [intervalResult, setIntervalResult] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showModalConfirm, setShowModalConfirm] = useState(false)

  useEffect(() => {
    let interval;
    if (getStorage("accessToken")) {
      setIsLogin(false);
      if(router.asPath.search("/monitor/paymentDetail") != -1){
        showLoading("Preparing Payment Details");
      }else{
      showLoading("Preparing.");
      }
      checkLoginUser();

      // ---------- check token expire ---------
      const showModal = showModalConfirm === true;
      interval = setInterval(() => {
        checkTokenExpire(interval, showModal);
      }, 60000);

      setIntervalResult(interval);
    } else {
      if (!nonLoginPage) {
        clearInterval(interval);
        clearInterval(intervalResult);
        clearTimeout(timer);
        showLoading("Authentication.");
        router.push("/login");
      }
    }
  }, []);
  const checkLoginUser = async () => {
    try {
      let me = await AppApi.getApi("/p2p/api/v1/me", {}, { authorized: true });

      if (get(me, "status", 500) == 200) {
        let userData = getStorage("userData");
        let username = get(me, "data.username", "");
        let userDataUsername = get(userData, "username", "");
        // console.log(userData)
        if (username == userDataUsername) {
          setIsLogin(true);
          setLoginUser(getStorage("userData"));
          hideLoading();
        } else {

          ErrorHandle("User mismatch with current login session. Please contact call center to resolve issue.")
        }

      } else {
        if (!nonLoginPage) {
          forceLogin();
          showLoading("Authentication.");
          router.push("/login");
        }
      }
    } catch (err) {
      console.error(err);
      if (!nonLoginPage) {
        forceLogin();
        showLoading("Authentication.");
        router.push("/login");
      }
    }
  }

  const footerModal = (
    <div className="text-center">
      <Button
        className="btn btn-blue mr-3"
        shape="round"
        onClick={async () => {
          setShowModalConfirm(false);
          clearTimeout(timer);
          await refreshToken();
        }}
      >
        Yes
      </Button>
      <Button
        className="btn btn-orange"
        shape="round"
        onClick={() => {
          setIntervalResult(0);
          clearInterval(intervalResult);
          clearTimeout(timer);
          setShowModalConfirm(false);
        }}
      >
        No
      </Button>
    </div>
  );

  const checkTokenExpire = async (interval, showModal) => {
    const localStoreUser = getStorage("userData");
    const dateNow = new Date();
    if ((localStoreUser.expireTime / 1000) < ((dateNow.getTime() / 1000) + 380)) {
      // ---- don't forget () of condition it will wrong ---
      if (showModal === false) {
        setShowModalConfirm(true);
        clearInterval(interval);
        clearInterval(intervalResult);

        const timer = setTimeout(() => {
          setShowModalConfirm(false);
          clearTimeout(timer);
          logOut();
        }, 300000);

        setTimer(timer);
      }
    }
  };

  const refreshToken = async () => {
    const localStorageUser = getStorage("userData");
    // const { token } = localStorageUser;
    const refreshResult = await AppApi.getApi("/p2p/api/v1/refreshToken", {}, { method: "get", authorized: true });

    if (get(refreshResult, "status", 500) == 200) {
      const localStorageRefresh = {
        ...localStorageUser,
        expireTime: get(refreshResult.data,"expireTime",localStorageUser.expireTime),
        token: get(refreshResult.data,"token",localStorageUser.token),
      };
      setStorage('userData', localStorageRefresh);
      setStorage('accessToken', get(refreshResult.data,"token",localStorageUser.token));

      const showModal = false;
      const interval = setInterval(() => {
        checkTokenExpire(interval, showModal);
      }, 60000);

      setIntervalResult(interval);
    } else {
      logOut();
    }
  };

  const logOut = async () => {
    try {
      showLoading("Logging out")
      setProfileCanvas(false)
      const logout = await AppApi.getApi("/p2p/api/v1/signout", {}, { method: "post", authorized: true });
      if (!nonLoginPage) {
        forceLogin();
        hideLoading();
      }

    } catch (error) {
      hideLoading();
      ErrorHandle({ error, context });
    }
  }

  return !nonLoginPage && isLogin == false ? (
    <BlockUi
      key="no-auth-block"
      tag="div"
      className="loadingBody"
      blocking={true}
      message={t(appLoadingText)}
      keepInView
    />
  ) : (
    <>
      <BlockUi
        key="auth-block"
        tag="div"
        className="loadingBody"
        blocking={appLoading}
        message={t(appLoadingText)}
        keepInView
      >
        <HeaderMobile />
        <div className="d-flex flex-column flex-root">
          <div className="d-flex flex-row flex-column-fluid page">
            <div className="d-flex flex-column flex-row-fluid wrapper" id="bbl_wrapper">
              <Header />
              <Modal
                title=" "
                visible={showModalConfirm}
                closable={false}
                footer={footerModal}
                centered={true}
              >
                <h5 style={{ textAlign: 'center' }}>
                  Session will expire soon, will you continue?
                </h5>
              </Modal>
              <div className="content d-flex flex-column flex-column-fluid" id="bbl_content">
                <div className="d-flex flex-column"
                  onClick={() => setProfileCanvas(false)}
                >
                  {children}
                </div>
              </div>
              <Footer />
            </div>
          </div>
        </div>
        <QuickUserPanel />
      </BlockUi>
    </>
  );
}
