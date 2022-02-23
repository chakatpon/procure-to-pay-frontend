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

import { B2PAPI } from "../../context/api";


export default function partnershipDetail(props) {
    const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
    const context = useContext(StoreContext);
    const AppApi = B2PAPI(StoreContext);
    const router = useRouter()

    const [actionHistory, setActionHistory] = useState([])
    const [onActionHistory, setOnActionHistory] = useState(false)
    const [totalRecordAction, setTotalRecordAction] = useState(0);
    const [pageActionHis, setPageActionHis] = useState(1);
    const [pageActionHisSize, setPageActionHisSize] = useState(10);

    const [data, setData] = useState("")


    useEffect(async () => {
        context.setTab("1")
        const buyerId = context.buyerDetailId
        // const supplierApprovalId = context.supplierNameApprovalDetailId
        const supplierId = context.supplierNameDetailId

        if (!supplierId) {
            window.location.replace('/profile/buyerLists/');
        } else {
            const dataDetail = await AppApi.getApi('p2p/api/v1/view/partnership', {
                "buyerCode": buyerId,
                "supplierCode": supplierId
            }, {
                method: "post", authorized: true,
            })

            if (dataDetail.status == 200) {
                intiialData(dataDetail.data)
            } else {
                showAlertDialog({
                    text: dataDetail.data.message,
                    icon: "warning",
                    showCloseButton: true,
                    showConfirmButton: true,
                })
            }
        }

    }, [router])

    const intiialData = (dataApi) => {
        setData(dataApi)

        const actionHis = _.get(dataApi, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
        setActionHistory(_.get(dataApi, 'historyList', ""))
        setTotalRecordAction(actionHis.length);

        hideLoading()
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
                                    Partnership Lists
                                </a>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item className="breadcrumb-item active">
                                Partnership Detail
                            </Breadcrumb.Item>
                        </Breadcrumb>
                    </div>

                    {/* <div>
                        <Modal
                            title=" "
                            footer={[]}
                            visible={showErrorCard}
                            closable={false}
                            onOk={() => {
                                // console.log("ok Error")
                                setShowErrorCard(false)
                                showLoading("Loading")
                                window.history.back()
                            }}
                            onCancel={() => {
                                setShowErrorCard(false)
                                showLoading("Loading")
                                window.history.back()
                            }}
                        >
                            <Result
                                status="error"
                                title={
                                    <p>
                                        {errorMessage}
                                    </p>
                                }
                            />
                        </Modal>
                    </div> */}

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
                                            _.get(data, 'paymentTerm') : "-"}
                                    </Descriptions.Item>
                                </Descriptions>


                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Financing">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {_.get(data, 'isFinancing', "") === true ? "Yes" : "No"}
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

                    <div className="row justify-content-md-center">

                        {context.isAllow("P6102", ["PARTNERSHIP_CREATE_EDIT"]) && (
                            <Button
                                className="btn btn-blue "
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
                        )}


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

partnershipDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
    const apiUrl = process.env.API_ENDPOINT;
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}