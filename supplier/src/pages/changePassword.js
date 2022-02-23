import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import { Button, Modal, Result, Breadcrumb, Input, Form } from "antd";
import { connect } from "react-redux";
import { get } from "lodash";

import Layout from "./components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "./../context/store";
import DialogConfirm from "@/shared/components/DialogConfirm";

import { B2PAPI } from "./../context/api";

export default function ChangePasswordprops(props) {
  const { showLoading, hideLoading, showAlertDialog, setStorage, getStorage } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const router = useRouter();

  const [form] = Form.useForm();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [alert, setAlert] = useState(false);
  const [alertMessagesCurrent, setAlertMessageCurrent] = useState("");
  const [alertMessagesNew, setAlertMessageNew] = useState("");

  // ====================== Modal ===================
  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => {
    setApproveConfirmModalShow(true);
  };

  useEffect(() => {
    hideLoading();
    form.resetFields();
  }, [router]);

  const changePassword = async () => {
    showLoading("Loading");

    const res = await AppApi.getApi(
      "p2p/api/v1/change/password",
      {
        oldPassword: currentPassword,
        newPassword: newPassword,
      },
      {
        method: "post",
        authorized: true,
      }
    );

    hideLoading();
    if (res.status != null) {
      if (res.status == 200) {
        let userData = getStorage("userData");
        if (get(userData, "forceChangePassword", "N") == "Y") {
          userData = { ...userData, forceChangePassword: "N" };
          setStorage("userData", userData);
        }
        showAlertDialog({
          text: get(res, "data.message", "Change Password Successfully."),
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          // routerLink: '/profile/branchApprovalLists'
        }).then(() => {
          window.location.replace("/dashboard");
        });
        form.resetFields();

        // setSuccessMessage(get(res, 'data.message', 'Change Password Successfully.'));
        // setShowSuccessCard(true);
      } else if (res.status == 422) {
        if (get(res, "data.message", "") === "Your current password is incorrect.") {
          setAlertMessageCurrent(get(res, "data.message", "Your current password is incorrect."));
        } else {
          setAlertMessageNew(get(res, "data.message", ""));
        }
      } else {
        showAlertDialog({
          text: get(res, "data.message", "Something went wrong."),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        });

        // setErrorMessage(get(res, 'data.message', 'Something went wrong.'));
        // setShowErrorCard(true);
      }
    }
  };

  const onFinishFailed = (errorInfo) => {};

  return (
    <div className="container-fluid px-0 col-8">
      <section className="mb-8">
        <div className="container">
          <div id="box-header" className="col-12 mb-10">
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="breadcrumb-item">Home</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Change Password</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* --------------- Modal for show success card ------------ */}
          {/* <Modal
            title=" "
            footer={[]}
            visible={showSuccessCard}
            closable={false}
            onOk={() => {
              setSuccessMessage("")
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              form.resetFields();

              setShowSuccessCard(false);
            }}
            onCancel={() => {
              setSuccessMessage("")
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              form.resetFields();

              setShowSuccessCard(false);
            }}
          >
            <Result
              status="success"
              title={
                successMessage
                // <p>
                //   Change Password Successfully.
                // </p>
              }
            />
          </Modal>

          <Modal
            title=" "
            footer={[]}
            visible={showErrorCard}
            closable={false}
            onOk={() => {
              setShowErrorCard(false);
            }}
            onCancel={() => {
              setShowErrorCard(false);
            }}
          >
            <Result
              status="error"
              title={
                errorMessage
              }
            />
          </Modal>

          <Modal
            title=" "
            visible={showConfirmCard}
            closable={false}
            onOk={() => {
              setShowConfirmCard(false);
            }}
            onCancel={() => {
              setShowConfirmCard(false);
            }}
            footer={
              <div className="row justify-content-md-center mt-5">
                <Button
                  className="btn btn-blue"
                  shape="round"
                  onClick={() => {
                    changePassword();
                    setShowConfirmCard(false);
                  }}
                >
                  Confirm
                </Button>
                <Button
                  className="btn btn-orange ml-2"
                  shape="round"
                  onClick={() => {
                    setShowConfirmCard(false);
                  }}
                >
                  Close
                </Button>
              </div>
            }
          >
            <div className="text-center">
              <span style={{ fontWeight: '500', fontSize: '17px' }}>{confirmMessage}</span>
            </div>
          </Modal> */}

          <DialogConfirm
            visible={approveConfirmModalShow}
            closable={false}
            onFinish={() => {
              changePassword();
              handleApproveConfirmModalClose(false);
            }}
            onClose={() => {
              handleApproveConfirmModalClose();
            }}
          >
            Please confirm to Change Password.
          </DialogConfirm>

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
              <div className="ml-3">Change Password</div>
            </div>
          </div>

          <Form
            form={form}
            name="basic"
            layout="vertical"
            //    initialValues={initialDataForm}
            onFinish={() => {
              if (alertMessagesCurrent === "" && alertMessagesNew === "") {
                handleApproveConfirmModalShow()
              }
            }}
            onFinishFailed={onFinishFailed}
          >
            <Form.Item
              label="Current Password"
              name="currentPassword"
              rules={[
                {
                  required: true,
                  message: "Please fill in Current Password",
                },
              ]}
              {...(alertMessagesCurrent != "" && {
                // hasFeedback: true,
                help: alertMessagesCurrent,
                validateStatus: "error",
              })}
            >
              <Input.Password
                className="mb-3"
                id="currentPassword"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  setAlertMessageCurrent("");
                }}
              />
            </Form.Item>

            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                {
                  required: true,
                  message: "Please fill in New Password",
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
              {...(alertMessagesNew != "" && {
                // hasFeedback: true,
                help: alertMessagesNew,
                validateStatus: "error",
              })}
            >
              <Input.Password
                className="mb-3"
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setAlertMessageNew("");
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
                    if (value !== newPassword && value) {
                      return Promise.reject("Your new password and confirm password do not match.");
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
              // {...(newPassword !== confirmPassword && {
              //   // hasFeedback: true,
              //   help:
              //     "Your new password and confirm password do not match.",
              //   validateStatus: "error",
              // })}
            >
              <Input.Password
                className="mb-3"
                id="confirmPassword"
                value={confirmPassword}
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
                  if (get(getStorage("userData"), "forceChangePassword", "N") == "Y") {
                    localStorage.clear();
                    window.location = "/login";
                  } else {
                    window.history.back();
                  }
                }}
              >
                Back
              </Button>
            </div>
          </Form>
        </div>
      </section>
    </div>
  );
}

ChangePasswordprops.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
