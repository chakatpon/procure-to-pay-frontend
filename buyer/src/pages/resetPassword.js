import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from "next/router";
import { Button, Modal, Result, Breadcrumb, Form, Input } from "antd";
import { connect } from "react-redux";

import Layout from "./components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "./../context/store";

import { B2PAPI } from "./../context/api";

export default function ResetPassword(props) {
  const { showLoading, hideLoading, showAlertDialog, setStorage, getStorage } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);

  const router = useRouter();
  const path = router.asPath;
  const [form] = Form.useForm();
  const token = path.replace("/resetPassword?token=", "");

  const [passcode, setPasscode] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(async () => {
    showLoading("Loading");
    if (await getStorage("accessToken")) {
      await Router.push({
        pathname: "/dashboard",
      });
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("menuList");
      hideLoading();
    }
  }, [router]);

  const data = {
    newPassword: password,
    resetCode: passcode,
    // recoverToken: token,
  };

  const resetPassword = async (req) => {
    showLoading("Loading");

    // setStorage('accessToken', token)
    // console.log(req.recoverToken);

    const sendApi = await AppApi.getApi(
      "p2p/public/v1/reset/password",
      {
        newPassword: req.newPassword,
        resetCode: req.resetCode,
        // recoverToken: req.recoverToken,
      },
      {
        method: "post",
        authorized: false,
      }
    );

    if (sendApi.status == 200) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("menuList");
      hideLoading();

      showAlertDialog({
        text: "Reset Password Successfully.",
        icon: "success",
        showCloseButton: false,
        showConfirmButton: true,
        routerLink: "/login",
      });

      // setShowSuccessCard(true);
      // const timeOut = setTimeout(() => {
      //   showLoading("Loading")
      //   setShowSuccessCard(false);
      //   Router.push({
      //     pathname: '/login',
      //   });
      //   clearTimeout(timeOut);
      // }, 4000);
    } else {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("menuList");
      hideLoading();

      showAlertDialog({
        text: sendApi.data.message,
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: true,
      });

      // setMessageApi(sendApi.data.message)
      // setShowErrorCard(true)
    }
  };

  const onFinishFailed = (errorInfo) => {};

  return (
    <div className="container-fluid px-0 col-8">
      <section className="mb-8">
        <div className="container">
          <div id="box-header" className="mb-10">
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="breadcrumb-item active">Reset Password</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* <Modal
            title=" "
            footer={[]}
            visible={showSuccessCard}
            closable={false}
            onOk={() => {
              setShowSuccessCard(false)
            }}
          // onCancel={() => {
          //   setShowSuccessCard(false)
          // }}
          >
            <Result
              status="success"
              title={
                <p>
                  Reset Password Succesfully.
                </p>
              }
            />
          </Modal>

          <Modal
            title=" "
            footer={[]}
            visible={showErrorCard}
            closable={false}
            onOk={() => {
              // console.log("ok Error")
              setShowErrorCard(false)
            }}
            onCancel={() => {
              setShowErrorCard(false)
            }}
          >
            <Result
              status="error"
              title={
                messageApi
                // <p>
                //     {mode} this Buyer Branch Profile Something went wrong.
                // </p>
              }
            />
          </Modal> */}

          <div>
            <div
              className="mb-3"
              style={{
                width: "100%",
                height: "auto",
                border: "2px solid #f7f7f7",
                background: "#f7f7f7",
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px",
                }}
              >
                <div className="ml-3">Enter a Passcode (6 Digits)</div>
              </div>
            </div>

            <Form
              form={form}
              name="basic"
              layout="vertical"
              //    initialValues={initialDataForm}
              onFinish={() => resetPassword(data)}
              onFinishFailed={onFinishFailed}
            >
              <Form.Item
                label="Passcode"
                name="passcode"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Passcode",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  id="passcode"
                  maxLength={6}
                  // value={passcode}
                  onChange={(e) => {
                    setPasscode(e.target.value);
                  }}
                />
              </Form.Item>

              <div
                className="mb-3"
                style={{
                  width: "100%",
                  height: "auto",
                  border: "2px solid #f7f7f7",
                  background: "#f7f7f7",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: "#333333",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    marginLeft: "1%",
                    display: "table-cell",
                    height: "40px",
                  }}
                >
                  <div className="ml-3">Reset Password</div>
                </div>
              </div>

              <Form.Item
                label="Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Password",
                  },
                  {
                    pattern: "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
                    message: (
                      <>
                        Your password must contain:
                        <ul>
                          <li>at least 8 characters and</li>
                          <li>at least 1 lowercase letter (a-z) and</li>
                          <li>at least 1 uppercase letter (A-Z) and</li>
                          <li>at least 1 number (0-9) and</li>
                          <li>at least 1 special characters</li>
                        </ul>
                      </>
                    ),
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input.Password
                  className="mb-3"
                  id="password"
                  autoComplete="new-password"
                  // value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (confirmPassword !== "" && confirmPassword !== null) {
                      form.validateFields(["confirmPassword"]);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Confirm Password",
                  },
                  {
                    validator: (rule, value) => {
                      if (value !== password && value) {
                        return Promise.reject("Your new password and confirm password do not match.");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                // {...(password !== confirmPassword && {
                //   // hasFeedback: true,
                //   help: "Your new password and confirm password do not match.",
                //   validateStatus: "error",
                // })}
                style={{ width: "100%" }}
              >
                <Input.Password
                  className="mb-3"
                  id="confirmPassword"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
              </Form.Item>

              <div className="row justify-content-md-center mt-5">
                <Button
                  className="btn btn-blue"
                  shape="round"
                  htmlType="submit"
                  // onClick={() => {
                  //   onSend();
                  // }}
                >
                  Submit
                </Button>

                <Button
                  className="btn btn-blue-transparent ml-2"
                  shape="round"
                  onClick={() => {
                    showLoading("Loading");
                    Router.push({
                      pathname: "/login",
                    });
                  }}
                >
                  Back
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </section>
    </div>
  );
}

ResetPassword.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
