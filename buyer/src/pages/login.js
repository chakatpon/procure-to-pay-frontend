import Head from "next/head";
import { connect } from "react-redux";
import Router from "next/router";
import { useRouter } from "next/router";
import { get, sortBy, isEmpty, debounce, isEqual } from "lodash";
import { StoreContext } from "@/context/store";
import GuestLayout from "@/component/guestlayout";
import { useEffect, useContext, useState } from "react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Row, Col, Form, Input, Button, Checkbox, Alert } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";

import Link from "next/link";
import { B2PAPI } from "@/context/api";
import Swal from "sweetalert2";
export default function Login(props) {
  const { locale, locales, defaultLocale } = useRouter();
  const { setProfileCanvas, showLoading, hideLoading, showAlertDialog, setAppMenu, appMenu, getStorage, setStorage, loginUser, setLoginUser, isLogin, setIsLogin, forceChangePassword } = useContext(StoreContext);
  const [loginAlert, setLoginAlert] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { t, i18n } = useTranslation(["login"]);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  var passwdVisible = false;
  let initialValues = {};
  useEffect(async () => {
    showLoading("Loading");
    if (await getStorage("accessToken")) {
      if (get(getStorage("userData"), "forceChangePassword", "N") == "Y") {
        await forceChangePassword();
      } else {
        await Router.push({
          pathname: "/dashboard",
        });
      }
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("menuList");
      hideLoading();
    }

    try {
      hideLoading();
    } catch (e) {
      console.error(e);
      showAlertDialog({
        title: get(e, "response.data.error", "Error!"),
        text: get(e, "response.data.message", get(e, "message", "")),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
        // confirmButtonText: t("Signin Again"),
      });
      hideLoading();
    }
  }, []);
  const onFinish = async (values) => {
    try {
      showLoading("Signing Account");
      let res = await AppApi.getApi(
        "/p2p/public/v1/signin",
        {
          username: values.username,
          password: values.password,
          // isRemember: values.remember ? 'Y' : 'N' || 'N',
        },
        { method: "post" }
      );
      if (res.status != 200) {
        hideLoading();
        if (res.status == 422) {
          setErrorMessage("Username or Password is incorrect.");
          setShowError(true);
        } else {
          setErrorMessage(get(res, "data.message", get(res, "message", "Something went wrong, Please contact administrator to resolve the issue.")));
          setShowError(true);
        }
        // showAlertDialog({
        //   title: get(res, 'data.error', get(res, 'error', 'Error!')),
        //   text: get(res, 'data.message', get(res, 'message', 'Username/Password is invalid')),
        //   icon: 'warning',
        //   confirmButtonText: t('Signin Again')
        // })
        return;
      }
      setStorage("userData", res.data);
      setStorage("accessToken", res.data.token);
      setLoginUser(res.data);
      // setIsLogin(true);
      getMenu();
    } catch (error) {
      hideLoading();
      setErrorMessage(get(error, "response.data.message", get(error, "response.message", "Something went wrong, Please contact administrator to resolve the issue.")));
      setShowError(true);
      // showAlertDialog({
      //   title: get(error, 'response.data.error', get(error, 'response.error', 'Error!')),
      //   text: get(error, 'response.data.message', get(error, 'response.message', 'Username/Password is invalid')),
      //   icon: 'warning',
      //   confirmButtonText: t('Signin Again')
      // })
    }
  };
  const getSubMenu = async (permKey, permission, subMenu) => {
    subMenu = subMenu.filter((sm) => {
      let subOfSubMenu = get(sm, "subMenu", false);
      if (subOfSubMenu) {
        // ---------- menu have sub menu 2 level ------------------
        subOfSubMenu = subOfSubMenu.filter((subOfsm) => {
          if (permKey.includes(subOfsm.code)) {
            if (permission.filter((p) => p.code == subOfsm.code)[0].can.includes("SEARCH_VIEW")) {
              return true;
            }
            return false;
          }
          return false;
        });

        if (subOfSubMenu.length > 0) {
          sm.subMenu = subOfSubMenu;
          return true;
        } else {
          return false;
        }
      }

      if (permKey.includes(sm.code)) {
        // ---------- menu no have sub menu level 2 ------------------
        if (permission.filter((p) => p.code == sm.code)[0].can.includes("SEARCH_VIEW")) {
          return true;
        }
        return false;
      }
    });

    return subMenu;
  };

  const getMenu = async () => {
    try {
      let user = getStorage("userData");
      // let menuCacheKey = user.token + "-menu";
      // let menuOnlyPerms = await getStorage(menuCacheKey);
      // if(menuOnlyPerms){
      //   setAppMenu(menuOnlyPerms);
      //   return ;
      // }

      let menu = await AppApi.getApi("/p2p/api/v1/menu", {}, { authorized: true });
      if (get(menu, "status", 500) == 200) {
        let menudata = get(menu, "data", []);
        let permission = [];
        let permKey = [];
        let menuOnlyPerms = [];
        for (const [key, value] of Object.entries(get(user, "permission"))) {
          permKey.push(key);
          permission.push({ code: key, can: value });
        }

        for (let x in menudata) {
          let mMenu = menudata[x];
          let mcode = get(mMenu, "code");
          let subMenu = get(mMenu, "subMenu", false);

          if (permKey.includes(mcode)) {
            if (subMenu) {
              subMenu = await getSubMenu(permKey, permission, subMenu);
              mMenu.subMenu = subMenu;
              if (subMenu.length > 0) {
                menuOnlyPerms.push(mMenu);
              }
            } else {
              if (permission.filter((p) => p.code == mcode)[0].can.includes("SEARCH_VIEW")) {
                menuOnlyPerms.push(mMenu);
              }
            }
          } else {
            if (subMenu) {
              subMenu = await getSubMenu(permKey, permission, subMenu);
              mMenu.subMenu = subMenu;
              if (subMenu.length > 0) {
                menuOnlyPerms.push(mMenu);
              }
            }
          }
        }
        setStorage("menuList", menuOnlyPerms);
        await setAppMenu(menuOnlyPerms);

        setProfileCanvas(false);
        if (get(user, "forceChangePassword", "N") == "Y") {
          await forceChangePassword();
        } else {
          router.push("/dashboard");
        }
      } else {
        hideLoading();
        showAlertDialog({
          title: get(menu, "data.error", get(menu, "response.error", "Error!")),
          text: get(menu, "data.message", get(menu, "statusText", "User menu is not responding.")),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
          // confirmButtonText: t("Signin Again"),
        });
      }
    } catch (e) {
      hideLoading();
      showAlertDialog({
        title: get(e, "response.data.error", get(e, "response.error", "Error!")),
        text: get(e, "response.data.message", get(e, "response.message", get(menu, "statusText", "User menu is not responding."))),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
        // confirmButtonText: t("Signin Again"),
      });
    }
  };
  return (
    <>
      <Head>
        <title>LOGIN : BBL PROCURE TO PAY</title>
        <link href="assets/css/pages/login/classic/login-4.css" rel="stylesheet" type="text/css" />
      </Head>
      <div className="login login-4 login-signin-on d-flex flex-wrap align-items-center" id="bbl_login">
        <div className="col-8 mx-auto d-flex flex-wrap login-form p-0 position-relative overflow-hidden">
          <div id="head" className="col-6 d-flex align-items-center justify-content-center py-8">
            <div className="col-12 text-center">
              <h4 className="white mb-0 bold">Welcome to</h4>
              <h1 className="white mb-0 bold">
                Procure to <span className="orange">Pay</span>
              </h1>
            </div>
          </div>
          <div id="formContent" className="col-6 login-signin p-8 d-flex">
            <div className="col-12 px-0 align-self-center">
              {loginAlert ? <Alert className="mb-2 text-left" message={loginAlert} type="error" showIcon /> : <></>}
              <h3 className="mb-4 font-weight-bolder text-center">{t("Login to Buyer")}</h3>
              <Form labelCol={{ span: 12 }} initialValues={initialValues} onFinish={onFinish} className="ant-form-vertical">
                <Form.Item rowGap={0} label="Username" name="username" className="mb-8" rules={[{ required: true, message: "Please fill in username" }]}>
                  <Input autoComplete="off" placeholder={t("Username")} allowClear onChange={() => setShowError(false)} />
                </Form.Item>

                <Form.Item rowGap={0} label="Password" name="password" className="mb-5" rules={[{ required: true, message: "Please fill in password" }]}>
                  <Input.Password autoComplete="off" placeholder={t("Password")} iconRender={(passwdVisible) => (passwdVisible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)} onChange={() => setShowError(false)} />
                </Form.Item>

                {showError && <p style={{ color: "#ff4d4f", textAlign: "left" }}>{errorMessage}</p>}

                <Row className="ant-form-item mt-8 text-center" rowGap={0}>
                  <div className="ant-col ant-form-item-control">
                    <div className="ant-form-item-control-input">
                      <div className="ant-form-item-control-input-content">
                        <Button type="primary" htmlType="submit" className="btn-login">
                          Login
                        </Button>
                      </div>
                    </div>
                  </div>
                </Row>
                <Form.Item rowGap={0} className="mt-3 mb-3 text-center">
                  <Row rowGap={0} justify="center">
                    {/* <Col span={12}>
                      <Form.Item name="remember" valuePropName="checked" className="remember-me">
                        <Checkbox>Remember me</Checkbox>
                      </Form.Item>
                    </Col> */}
                    <Col span={24}>
                      <div className="forgot-password">
                        {/* <Link href="/forgotPassword" > */}
                        <a
                          className="a-forgot-password"
                          onClick={async () => {
                            showLoading("Loading");
                            Router.push({
                              pathname: "/forgotPassword",
                            });
                          }}
                        >
                          Forgot Password
                        </a>
                        {/* </Link> */}
                      </div>
                    </Col>
                  </Row>
                </Form.Item>
              </Form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
Login.Layout = GuestLayout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
