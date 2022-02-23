import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router'
import { connect } from 'react-redux';
import Link from "next/link";
import { Descriptions, Switch, Button, Table, Select, Input, Modal, Result, Form, Breadcrumb } from 'antd';
import {
    CheckCircleOutlined, DownOutlined
} from '@ant-design/icons';
import _ from "lodash";

import TableBlue from "../components/TableBlue";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";

import { B2PAPI } from "../../context/api";


export default function partnershipWaitingApproval(props) {
    const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
    const context = useContext(StoreContext);
    const router = useRouter()
    const AppApi = B2PAPI(StoreContext);
    const { Option } = Select

    const [supplierNameApprovalId, setSupplierNameApprovalId] = useState("")

    const [actionHistory, setActionHistory] = useState([])
    const [onActionHistory, setOnActionHistory] = useState(false)
    const [totalRecordAction, setTotalRecordAction] = useState(0);
    const [pageActionHis, setPageActionHis] = useState(1);
    const [pageActionHisSize, setPageActionHisSize] = useState(10);

    const [reasonCode, setReasonCode] = useState([])

    const [status, setStatus] = useState("")

    const [rejectModalShow, setRejectModalShow] = useState(false);
    const handleRejectModalClose = () => setRejectModalShow(false);
    const handleRejectModalShow = () => { setRejectModalShow(true); }

    const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
    const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
    const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

    const [data, setData] = useState("")


    useEffect(async () => {
        await context.setTab("2")
        const supplierApprovalId = context.supplierNameApprovalDetailId
        setSupplierNameApprovalId(supplierApprovalId)
        if (!supplierApprovalId) {
            showLoading("Loading")
            window.history.back()
        } else {

            const dataDetail = await AppApi.getApi('p2p/api/v1/view/partnership/waitingApproval', {
                "id": supplierApprovalId
            }, {
                method: "post", authorized: true,
            })
            // console.log(dataDetail);


            const actionHistoryApi = await AppApi.getApi('p2p/api/v1/view/history/partnership', {
                "id": supplierApprovalId
            }, {
                method: "post", authorized: true,
            })
            // console.log(actionHistoryApi);


            const reasonCodeApi = await AppApi.getApi('p2p/api/v1/get/reasonCode/type/PF', {}, {
                method: "get", authorized: true,
            })
            hideLoading()
            // console.log(reasonCodeApi);


            if (dataDetail.status == 200) {
                intiialData(dataDetail.data)
                // console.log(dataDetail.data);
                // hideLoading()
            } else {
                showAlertDialog({
                    text: dataDetail.data.message,
                    icon: "warning",
                    showCloseButton: true,
                    showConfirmButton: true,
                })
            }

            if (actionHistoryApi.status == 200) {
                intiialDataActionHistory(actionHistoryApi.data)
                // console.log(actionHistoryApi.data);
                // hideLoading()
            } else {
                showAlertDialog({
                    text: actionHistoryApi.data.message,
                    icon: "warning",
                    showCloseButton: true,
                    showConfirmButton: true,
                })
            }

            if (reasonCodeApi.status == 200) {
                hideLoading()
                // console.log(reasonCodeApi.data);
                const reasonCodeApiData = reasonCodeApi.data
                const reasonCodeItems = reasonCodeApiData.map((items) => {
                    return { option: items.name, value: items.code }
                })
                setReasonCode(reasonCodeItems)
            } else {
                showAlertDialog({
                    text: reasonCodeApi.data.message,
                    icon: "warning",
                    showCloseButton: true,
                    showConfirmButton: true,
                })
            }
        }

    }, [router])

    const intiialDataActionHistory = (dataApi) => {
        const actionHis = _.get(dataApi, "items", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
        setActionHistory(actionHis);
        setTotalRecordAction(actionHis.length);

    }

    const intiialData = (dataApi) => {

        setData(dataApi)
        // setActionHistory(_.get(dataApi, 'historyList', []))

        setStatus(_.get(dataApi, 'statusCode', ""))

        context.setPartnershipStatus(_.get(dataApi, 'statusCode', ""))

        // hideLoading()
    }

    const onChangePageActionHis = (pagination, filters, sorter, extra) => {
        setPageActionHis(pagination.current);
        setPageActionHisSize(pagination.pageSize);
    };

    const columnsActionHistory = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            className: "header-table-blue"
        },
        {
            title: 'Date Time',
            dataIndex: 'dateTime',
            key: 'dateTime',
            className: "header-table-blue"
        },
        {
            title: 'By User',
            dataIndex: 'by',
            key: 'by',
            className: "header-table-blue"
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            className: "header-table-blue",
            render: (text, record, index) => (
                <div >
                    {text === "" ? ("-") : (text)}
                </div>
            ),
        }
    ];

    const onApproved = async () => {
        // setAction("Approved")
        const idDetail = context.supplierNameApprovalDetailId
        handleApproveConfirmModalClose()
        showLoading("Loading")
        await AppApi.getApi('p2p/api/v1/approve/partnership', {
            "id": idDetail
        }, {
            method: "post", authorized: true,
        }).then(async (res) => {
            if (res.status == 200) {
                await hideLoading()

                showAlertDialog({
                    text: res.data.message,
                    icon: "success",
                    showCloseButton: false,
                    showConfirmButton: true,
                    routerLink: '/profile/partnershipLists'
                })

                // setMessageApi(res.data.message)
                // setShowSuccessCard(true)
                // const timeOut = setTimeout(() => {
                //     Router.push({
                //         pathname: '/profile/partnershipLists',
                //     });
                //     clearTimeout(timeOut);
                // }, 4000);
            } else {
                hideLoading()

                showAlertDialog({
                    text: res.data.message,
                    icon: "warning",
                    showCloseButton: true,
                    showConfirmButton: true,
                })

                // setMessageApi(res.data.message)
                // setShowErrorCard(true)
            }
        }
        )
    };

    const dialogRejectOnFinish = async (values) => {
        // setAction("Reject")
        const idDetail = context.supplierNameApprovalDetailId
        if (values.code && values.note) {
            handleRejectModalClose()
            showLoading("Loading")
            await AppApi.getApi('p2p/api/v1/reject/partnership', {
                "id": idDetail,
                "code": values.code,
                "note": values.note
            }, {
                method: "post", authorized: true,
            }).then(async (res) => {
                if (res.status == 200) {
                    await hideLoading()

                    showAlertDialog({
                        text: res.data.message,
                        icon: "success",
                        showCloseButton: false,
                        showConfirmButton: true,
                        routerLink: '/profile/partnershipLists'
                    })

                    // setMessageApi(res.data.message)
                    // setShowSuccessCard(true)
                    // const timeOut = setTimeout(() => {
                    //     Router.push({
                    //         pathname: '/profile/partnershipLists',
                    //     });
                    //     clearTimeout(timeOut);
                    // }, 4000);
                } else {
                    hideLoading()

                    showAlertDialog({
                        text: res.data.message,
                        icon: "warning",
                        showCloseButton: true,
                        showConfirmButton: true,
                    })

                    // setMessageApi(res.data.message)
                    // setShowErrorCard(true)
                }
            }
            )
        }
    };

    const onFinishFailed = (errorInfo) => {

    };

    return (
        <div className="container-fluid px-0">

            <section className="mb-8">
                <div className="container">

                    <div id="box-header" className="col-12 mb-10">
                        <Breadcrumb separator=">">
                            <Breadcrumb.Item className="breadcrumb-item">
                                Profile
                            </Breadcrumb.Item>
                            <Breadcrumb.Item className="breadcrumb-item">
                                Buyer Profile
                            </Breadcrumb.Item>
                            <Breadcrumb.Item className="breadcrumb-item">
                                <a
                                    onClick={async () => {
                                        showLoading("Loading")
                                        Router.push({
                                            pathname: "/profile/partnershipLists",
                                        });
                                    }}
                                // href='/profile/partnershipLists/'
                                >
                                    Partnership Approval Lists
                                </a>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item className="breadcrumb-item active">
                                Partnership Approval
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    {/* <Modal
                        title=" "
                        footer={[]}
                        visible={showSuccessCard}
                        closable={false}
                        onOk={() => {
                            // console.log("ok success")
                            setShowSuccessCard(false)
                        }}
                    // onCancel={() => {
                    //     setShowSuccessCard(false)
                    // }}
                    >
                        <Result
                            status="success"
                            title={
                                messageApi
                                // <p>
                                //     {action} this Partnership Successfully.
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
                                //     {action} this Partnership Something went wrong.
                                // </p>
                            }
                        />
                    </Modal>

                    <Modal
                        title=" "
                        visible={showApprovedCard}
                        // onOk={() => {
                        //     console.log("ok Approved " + id)
                        //     setShowApprovedCard(false)
                        //     setShowSuccessCard(true)
                        // }}
                        onCancel={() => {
                            setShowApprovedCard(false)
                        }}
                        footer={[]}
                        closable={false}
                    >
                        <div className="mt-1">
                            <p className="text-center" style={{ fontSize: "17px", fontWeight: "500" }}>
                                Please confirm to approve this Partnership
                            </p>
                            <div className="row justify-content-md-center mt-5">
                                <Button
                                    className="btn btn-blue mr-3"
                                    shape="round"
                                    onClick={async () => {
                                        await onApproved()
                                        // setShowApprovedCard(false)
                                        // setShowSuccessCard(true)
                                    }}
                                >
                                    Confirm
                                </Button>
                                <Button
                                    className="btn btn-orange"
                                    shape="round"
                                    onClick={() => {
                                        setShowApprovedCard(false)
                                    }}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                    </Modal>

                    <Modal title=" " visible={showRejectCard}
                        // onOk={() => {
                        //     console.log("ok Reject " + id)
                        //     setShowRejectCard(false)
                        // }}
                        onCancel={() => {
                            setShowRejectCard(false)
                        }}
                        closable={false}
                        footer={[]}
                    >
                        <div style={{ margin: "10px 30px 0px 30px" }}>
                            <div className="text-left">
                                <h5 style={{ fontSize: "17px", fontWeight: "500" }}>
                                    Reject Partnership
                                </h5>
                            </div>
                            <Form
                                className="mt3"
                                layout="vertical"
                                name="basic"
                                onFinishFailed={onFinishFailed}
                            >
                                <Form.Item
                                    className="text-left"
                                    label="Reject reason"
                                    name="rejectReason"
                                    rules={[{ required: true, message: 'Please fill in Reject Reason!' }]}
                                >
                                    <Select
                                        className="text-left"
                                        value={rejectReason}
                                        placeholder="Please select"
                                        onChange={(e) => {
                                            setRejectReason(e)
                                        }}
                                        style={{ width: "100%" }}
                                    >
                                        <Option hidden key="" value="">
                                            -- Please Select --
                                        </Option>
                                        {reasonCode.map((item) =>
                                            <Option value={item.code}>{item.name}</Option>
                                        )}
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    className="text-left"
                                    label="Note"
                                    name="note"
                                    rules={[{ required: true, message: 'Please fill in Note!' }]}
                                >
                                    <Input
                                        placeholder="Please remake"
                                        value={note}
                                        onChange={(e) => {
                                            setNote(e.target.value)
                                        }}
                                    />
                                </Form.Item>

                                <div className="row justify-content-md-center mt-5">
                                    <Button
                                        className="btn btn-blue mr-3"
                                        shape="round"
                                        htmlType="submit"
                                        onClick={() => {
                                            onFinish(rejectReason, note)
                                            // setShowRejectCard(false)
                                        }}
                                    >
                                        Confirm
                                    </Button>
                                    <Button
                                        className="btn btn-orange"
                                        shape="round"
                                        onClick={() => {
                                            setShowRejectCard(false)

                                        }}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </Form>

                        </div>
                    </Modal> */}

                    <DialogReason
                        mode="Reject"
                        title={<>Reject Partnership</>}
                        onFinish={dialogRejectOnFinish}
                        visible={rejectModalShow}
                        codeLists={reasonCode}
                        closable={false}
                        onClose={() => { handleRejectModalClose() }}
                    />

                    <DialogConfirm
                        visible={approveConfirmModalShow}
                        closable={false}
                        onFinish={() => {
                            onApproved();
                            handleApproveConfirmModalClose(false);
                        }}
                        onClose={() => { handleApproveConfirmModalClose() }}
                    >
                        Please confirm to approve this Partnership
                    </DialogConfirm>

                    <div className="row ml-3 mt-3">

                        <div className="row col-9">
                            <div className="col-7">
                                <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                                    Partnership
                                </h5>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Supplier Name (TH)">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'supplierNameTH', "-") ?
                                            _.get(data, 'supplierNameTH', "-") : "-"}
                                    </Descriptions.Item>
                                </Descriptions>


                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Supplier Name (EN)">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'supplierNameEN', "-") ?
                                            _.get(data, 'supplierNameEN', "-") : "-"}
                                    </Descriptions.Item>
                                </Descriptions>

                                {/* <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Supplier Code">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'supplierCode', "-") ?
                                            _.get(data, 'supplierCode', "-") : "-"}
                                    </Descriptions.Item>
                                </Descriptions> */}

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Payment Term">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'paymentTerm', "-") || _.get(data, 'paymentTerm', "-") == "0" ?
                                            _.get(data, 'paymentTerm', "-") : "-"}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Financing">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'isFinancing', "") == true ? "Yes" : "No"}
                                    </Descriptions.Item>
                                </Descriptions>


                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Status">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'isActive', "-") == true ? "Active" : "Inactive"}
                                    </Descriptions.Item>
                                </Descriptions>

                            </div>
                        </div>
                    </div>

                    <hr className="line" />

                    <div className="mb-10">
                        <Button
                            shape="btn btn-blue-transparent"
                            onClick={() => { setOnActionHistory(!onActionHistory) }}
                        >
                            Action History
                            <DownOutlined
                                rotate={onActionHistory ? 180 : ""}
                                style={{ fontSize: "12px", marginLeft: "10px", marginTop: "-2%" }}
                            />

                        </Button>

                        {onActionHistory ?
                            <div className="mt-3 mb-3">
                                <TableBlue
                                    scroll={{ y: 200 }}
                                    dataSource={actionHistory}
                                    columns={columnsActionHistory}
                                    total={totalRecordAction}
                                    onChange={onChangePageActionHis}
                                    current={pageActionHis}
                                    pageSize={pageActionHisSize}
                                    showPagination={true}
                                />
                            </div>
                            : ""
                        }
                    </div>

                    <hr style={{ borderColor: "#456fb6", borderWidth: "2px" }} />

                    <div className="row justify-content-md-center mt-5">

                        {/* PFK06, PFK01 ---> approve/reject
                            PFK08, PFK09 ---> Edit
                            PFK11 ---> Edit Proposal */}

                        {status == "PFK08" || status == "PFK09" || status == "PFK11" ?
                            (context.isAllow("P6102", ["PARTNERSHIP_CREATE_EDIT"]) && (
                                <Button
                                    className="btn btn-blue"
                                    shape="round"
                                    onClick={async () => {
                                        showLoading("Loading")
                                        Router.push({
                                            pathname: "/profile/addEditpartnership",
                                        });
                                    }}
                                >
                                    Edit
                                </Button>
                            ))
                            :
                            (
                                context.isAllow("P6102", ["PARTNERSHIP_APPROVE_REJECT"]) && (
                                    <div>
                                        <Button
                                            className="btn btn-blue"
                                            shape="round"
                                            onClick={() => { handleApproveConfirmModalShow() }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            className="btn btn-orange ml-2"
                                            shape="round"
                                            onClick={() => { handleRejectModalShow() }}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )
                            )
                        }

                        <Button
                            shape="round"
                            className="btn btn-blue-transparent ml-2"
                            onClick={() => {
                                showLoading("Loading")
                                window.history.back()
                            }}
                        >
                            Back
                        </Button>
                    </div>

                </div>
            </section>
        </div>
    )
}

partnershipWaitingApproval.Layout = Layout;
export async function getStaticProps({ locale }) {
    const apiUrl = process.env.API_ENDPOINT;
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}
