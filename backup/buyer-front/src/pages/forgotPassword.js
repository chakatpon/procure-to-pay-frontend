import React, { useState, useEffect } from 'react';
import TextField from '@material-ui/core/TextField';
import { Button, Modal, Result, Breadcrumb } from 'antd';
import { connect } from 'react-redux';

import * as Password from './api/PasswordApi'
import { BLOCK_UI, UNBLOCK_UI } from '../../constant/login';

function ForgotPassword(props) {
    const { blockUI, unblockUI } = props;

    const [email, setEmail] = useState("")
    const [alert, setAlert] = useState(false)
    const [alertFormat, setAlertFormat] = useState(false)
    const [alertMeassge, setAlertMeassge] = useState(false)
    const [showSuccessCard, setShowSuccessCard] = useState(false)

    const [emailErr, setEmailErr] = useState(false)


    useEffect(() => {
        unblockUI()
    })

    const sensToEmail = async (req) => {
        blockUI()
        Password.getForgotPassword(req).then((res) => {
            unblockUI()
            if (res.status != null) {
                if (res.status === 200) {
                    setShowSuccessCard(true)
                }
            }
        }).catch((err) => {
            console.log(err)
            setEmailErr(true)
            setAlertMeassge("Email ของคุณไม่ถูกต้อง")
        })
    }

    const onSend = () => {
        const data = {
            email: email || '',
        };
        if (email.length === 0) {
            setEmailErr(true)
            setAlert(true)
        }
        else {
            const emailFormat = /^.+@.+\..{2,3}$/
            if (!email.match(emailFormat)) {
                setEmailErr(true)
                setAlertFormat(true)
            } else {
                sensToEmail(data)
            }
        }
    }


    return (
        <div>
            <div className="card shadow-sm bg-white rounded adjust-height">
                <div
                    className="card-header bg-white"
                    style={{ borderBottomColor: "#ffffff", }} // minHeight: "768px"
                >
                    <div className="container">
                        <div className="row justify-content-md-center">
                            <div className="col-8">

                                <div className="row bbl-font mt-3 mb-3">
                                    <Breadcrumb>
                                        <Breadcrumb.Item href="/login">Home</Breadcrumb.Item>
                                        <Breadcrumb.Item className="bbl-font-bold">Forgot Password</Breadcrumb.Item>
                                    </Breadcrumb>
                                </div>

                                {/* <Modal
                                    title=" "
                                    footer={[]}
                                    bodyStyle={{ width: "max-content" }}
                                    visible={showSuccessCard}
                                    closable={false}
                                    onOk={() => {
                                        setShowSuccessCard(false)
                                        setEmail("")
                                    }}
                                    onCancel={() => {
                                        setShowSuccessCard(false)
                                        setEmail("")
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
                                </Modal> */}

                                {!showSuccessCard ?
                                    <div>
                                        <div
                                            style={{
                                                width: "100%",
                                                height: "auto",
                                                margin: "0px -15px 0px -15px",
                                                border: "2px solid #f7f7f7",
                                                background: "#f7f7f7",
                                                boxSizing: "border-box"
                                            }}
                                        >
                                            <div
                                                style={{
                                                    color: "#585858",
                                                    fontWeight: "bold",
                                                    verticalAlign: "middle",
                                                    marginLeft: "1%",
                                                    display: "table-cell",
                                                    height: "40px"
                                                }}>
                                                <div className="ml-3">
                                                    Enter your email
                                                </div>
                                            </div>
                                        </div>


                                        <div>
                                            <TextField
                                                className="mt-4"
                                                type="email"
                                                id="email"
                                                error={emailErr}
                                                label="Email"
                                                variant="outlined"
                                                style={{ flex: "auto", height: "80%", width: "100%" }}
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    setEmailErr(false)
                                                    setAlert(false)
                                                    setAlertFormat(false)
                                                    setAlertMeassge(false)
                                                }}
                                            />
                                            {alert ?
                                                <p className="text-danger">
                                                    กรุณากรอก Email
                                                </p>
                                                :
                                                ""
                                            }
                                            {alertFormat ?
                                                <p className="text-danger">
                                                    รูปแบบ Email ไม่ถูกต้อง
                                                </p>
                                                :
                                                ""
                                            }
                                            {alertMeassge ?
                                                <p className="text-danger">
                                                    Email ของคุณไม่ถูกต้อง
                                                </p>
                                                :
                                                ""
                                            }
                                        </div>

                                        <div className="row justify-content-md-center mt-3">
                                            <Button
                                                className="bbl-btn-blue mr-2 px-5"
                                                shape="round"
                                                onClick={() => { onSend() }}
                                            >
                                                Send
                                            </Button>

                                            <Button
                                                className="bbl-btn-blue-light px-5"
                                                shape="round"
                                                onClick={() => {
                                                    blockUI()
                                                    window.history.back()
                                                }}
                                            >
                                                Back
                                            </Button>

                                        </div>
                                    </div>
                                    :
                                    <div>
                                        <h4 style={{ fontWeight: 'bold', marginLeft: '-2%' }}>
                                            Please check your email
                                        </h4>
                                        <h5 className="row" >
                                            We sent a message to &nbsp;
                                            <h5 style={{ fontWeight: 'bold' }}>
                                                {email}
                                            </h5>
                                            &nbsp; so you can get link for reset password.
                                        </h5>

                                        <div className="row justify-content-md-center mt-3">
                                            <Button
                                                className="bbl-btn-blue-light mt-8"
                                                style={{ width: '20%' }}
                                                shape="round"
                                                onClick={() => {
                                                    blockUI()
                                                    window.history.back()
                                                }}
                                            >
                                                Back
                                            </Button>
                                        </div>
                                    </div>
                                }


                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ForgotPassword);