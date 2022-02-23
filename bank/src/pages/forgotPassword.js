import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { Button, Modal, Input, Breadcrumb, Form, Result } from 'antd';
import { connect } from 'react-redux';
import _ from "lodash";

import Layout from "./components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "./../context/store";

import { B2PAPI } from "./../context/api";

export default function ForgotPassword(props) {
    const { showLoading, hideLoading, showAlertDialog, getStorage } = useContext(StoreContext);
    const AppApi = B2PAPI(StoreContext);

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [successPage, setSuccessPage] = useState(false)
    const [emailInvalid, setEmailInvalid] = useState("")


    useEffect(async () => {
        showLoading("Loading")
        if (await getStorage("accessToken")) {
            await Router.push({
                pathname: '/dashboard',
            });
        } else {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("userData");
            localStorage.removeItem("menuList");
            hideLoading()
        }
    }, [])

    const sensToEmail = async () => {
        showLoading("Loading")

        const location = window.location.href

        const sendApi = await AppApi.getApi('p2p/public/v1/recover/user', {
            email: email,
            username: username,
            recoverUrl: location.replace("forgotPassword", "resetPassword") + '/?token=',
        },
            {
                method: "post", authorized: true,
            })

        if (sendApi.status == 200) {
            hideLoading()

            // showAlertDialog({
            //     text: "URL to reset password was already sent.",
            //     icon: "success",
            //     showCloseButton: false,
            //     showConfirmButton: true,
            //     // routerLink: '/profile/branchApprovalLists'
            // })
            setSuccessPage(true)

            // setShowSuccessCard(true);
            // setSuccessPage(true)
            // const timeOut = setTimeout(() => {
            //     setShowSuccessCard(false);
            //     clearTimeout(timeOut);
            // }, 4000);
        } else if (sendApi.status == 422) {
            hideLoading()
            setEmailInvalid(_.get(sendApi, 'data.message', ''))
        } else {
            hideLoading()

            showAlertDialog({
                text: sendApi.data.message,
                icon: "warning",
                showCloseButton: true,
                showConfirmButton: true,
            })

            // setMessageApi(sendApi.data.message)
            // setShowErrorCard(true)
        }
    }
    const onFinishFailed = (errorInfo) => {

    }


    return (
        <div className="container-fluid px-0 col-8">

            <section className="mb-8">
                <div className="container">

                    <div id="box-header" className="mb-10">
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item className="breadcrumb-item active">
                                Forgot Password
                            </Breadcrumb.Item>
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
                        onCancel={() => {
                            setShowSuccessCard(false)
                        }}
                    >
                        <Result
                            status="success"
                            title={
                                <p>
                                    URL to reset password was already sent.
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

                    {!successPage ?
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
                                    <div className="ml-3">
                                        Enter your email
                                    </div>
                                </div>
                            </div>

                            <Form
                                //    form={form}
                                name="basic"
                                layout="vertical"
                                //    initialValues={initialDataForm}
                                onFinish={() => sensToEmail()}
                                onFinishFailed={onFinishFailed}
                            >

                                <Form.Item
                                    className="mt-4"
                                    label="Email"
                                    name="email"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please fill in Email',
                                        },
                                        {
                                            validator: (rule, value = '') => {
                                                // if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                                                //     && value !== '') {
                                                //     return Promise.reject('Please fill in English Language');
                                                // } else
                                                if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                                                    return Promise.reject('Invalid email format');
                                                } else {
                                                    return Promise.resolve();
                                                }
                                            },
                                        },
                                    ]}
                                    {...(emailInvalid && {
                                        // hasFeedback: true,
                                        // help: emailInvalid,
                                        validateStatus: "error",
                                    })}
                                >
                                    <Input
                                        id="email"
                                        variant="outlined"
                                        style={{ width: "100%" }}

                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value)
                                            setEmailInvalid("")
                                        }}
                                    />

                                </Form.Item>


                                <Form.Item
                                    className="mt-4"
                                    label="Username"
                                    name="username"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Please fill in Username',
                                        },
                                        {
                                            validator: (rule, value = '') => {
                                                // if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                                                //     && value !== '') {
                                                //     return Promise.reject('Please fill in English Language');
                                                // } else
                                                // if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                                                //     return Promise.reject('Invalid username format');
                                                // } else {
                                                return Promise.resolve();
                                                // }
                                            },
                                        },
                                    ]}
                                    {...(emailInvalid && {
                                        // hasFeedback: true,
                                        help: emailInvalid,
                                        validateStatus: "error",
                                    })}
                                >
                                    <Input
                                        id="username"
                                        variant="outlined"
                                        style={{ width: "100%" }}

                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value)
                                            setEmailInvalid("")
                                        }}
                                    />

                                </Form.Item>


                                <div className="row justify-content-md-center mt-5">
                                    <Button
                                        className="btn btn-blue"
                                        shape="round"
                                        htmlType="submit"
                                        onClick={() => { }}
                                    >
                                        Send
                                    </Button>

                                    <Button
                                        className="btn btn-blue-transparent ml-2"
                                        shape="round"
                                        onClick={() => {
                                            showLoading("Loading")
                                            window.history.back()
                                        }}
                                    >
                                        Back
                                    </Button>


                                </div>

                            </Form>

                        </div>
                        :
                        <div>
                            <h4 style={{ fontWeight: 'bold' }}>
                                Please check your email
                            </h4>
                            <h5 className="row" style={{ marginLeft: "0px" }}>
                                We sent a message to &nbsp;
                                <h5 style={{ fontWeight: 'bold' }}>
                                    {email}
                                </h5>
                                &nbsp; so you can get a passcode for reset password.
                            </h5>

                            <div className="row justify-content-md-center mt-5">
                                <Button
                                    className="btn btn-blue"
                                    // style={{ width: '20%' }}
                                    shape="round"
                                    onClick={() => {
                                        showLoading("Loading")
                                        Router.push({
                                            pathname: "/resetPassword"
                                        })
                                    }}
                                >
                                    Reset Password
                                </Button>
                            </div>

                        </div>
                    }

                </div>
            </section>
        </div >
    )
}

ForgotPassword.Layout = Layout;
export async function getStaticProps({ locale }) {
    const apiUrl = process.env.API_ENDPOINT;
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}