import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { connect } from 'react-redux';
import { Descriptions, Button, Select, Input, Modal, Result, Table } from 'antd';
import Icon, { DownOutlined } from '@ant-design/icons';

import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

function branchApprovalDetail(props) {
    const { blockUI, unblockUI } = props;
    const router = useRouter()
    const { Option } = Select

    const [branch, setBranch] = useState("Buyer")

    const [showApprovedCard, setShowApprovedCard] = useState(false)
    const [showRejectCard, setShowRejectCard] = useState(false)
    const [showSuccessCard, setShowSuccessCard] = useState(false)

    const [onActionHistory, setOnActionHistory] = useState(false)


    const [id, setId] = useState("")

    useEffect(() => {
        unblockUI()
        const idForPath = router.query.id
        setId(idForPath)
    })

    const dataSourceActionHistory = [
        {
            key: '1',
            action: "Approved GR",
            datatime: "12/04/2021 13.00.00",
            byUser: "System",
            reason: "-"
        },
        {
            key: '2',
            action: "Approval",
            datatime: "12/04/2021 14.00.00",
            byUser: "Buyer: 00158",
            reason: "-"
        },
        {
            key: '3',
            action: "Approval",
            datatime: "12/04/2021 15.00.00",
            byUser: "Supplier: 00486",
            reason: "-"
        },
        {
            key: '4',
            action: "Approval",
            datatime: "12/04/2021 15.00.00",
            byUser: "Supplier: 00486",
            reason: "-"
        },
        {
            key: '5',
            action: "Approval",
            datatime: "12/04/2021 15.00.00",
            byUser: "Supplier: 00486",
            reason: "-"
        },
    ];

    const columnsActionHistory = [
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            className: "header-table-blue"
        },
        {
            title: 'Datatime',
            dataIndex: 'datatime',
            key: 'datatime',
            className: "header-table-blue"
        },
        {
            title: 'By User',
            dataIndex: 'byUser',
            key: 'byUser',
            className: "header-table-blue"
        },
        {
            title: 'Reason',
            dataIndex: 'reason',
            key: 'reason',
            className: "header-table-blue"
        }
    ];



    return (
        <div className="row justify-content-md-center">
            <div className="col-11">

                <div>
                    <div className="row bbl-font mt-3">

                        <p style={{ color: "#000" }}>
                            Profile &nbsp;
                            </p>

                        {'>'} &nbsp;

                            <p style={{ color: "#000" }}>
                            {branch} Profile &nbsp;
                            </p>

                        {'>'} &nbsp;

                        <a href='/profile/branchApprovalLists/' style={{ color: "#000" }}>
                            {branch} Branch Profile Approval Lists  &nbsp;
                            </a>

                        {'>'} &nbsp;

                        <a>
                            <div className="bbl-font-bold">
                                {branch} Branch Profile Approval
                            </div>
                        </a>
                    </div>

                    <Modal
                        title=" "
                        footer={[]}
                        visible={showSuccessCard}
                        closable={false}
                        onOk={() => {
                            console.log("ok success")
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
                                    Approve this Buyer Branch <br />
                                    Profile Successfully.
                                </p>
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
                            <p className="text-center" style={{ fontSize: "17px" }}>
                                Please confirm to approve this Buyer Branch Profile
                            </p>
                            <div className="row justify-content-md-center mt-4">
                                <Button
                                    className="bbl-btn-blue mr-3"
                                    shape="round"
                                    onClick={() => {
                                        console.log(`ok Approved ${id}`)
                                        setShowApprovedCard(false)
                                        setShowSuccessCard(true)
                                    }}
                                >
                                    Comfirm
                            </Button>
                                <Button
                                    className="bbl-btn-orange px-4"
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
                            <h5 style={{ fontWeight: "bolder" }}>Reject Buyer Branch Profile</h5>
                            <p>Reject reason</p>
                            <Select placeholder="Please select" style={{ width: "100%" }}>
                                <Option value="edit">Edit detail</Option>
                                <Option value="another">Another</Option>
                            </Select>

                            <div className="row mt-2 ml-1"> Note <p className="text-danger"> * </p></div>

                            <Input placeholder="Please remake" />

                            <div className="row justify-content-md-center mt-4">
                                <Button
                                    className="bbl-btn-blue mr-3"
                                    shape="round"
                                    onClick={() => {
                                        console.log(`ok Reject ${id}`)
                                        setShowRejectCard(false)
                                    }}
                                >
                                    Comfirm
                            </Button>
                                <Button
                                    className="bbl-btn-orange px-4"
                                    shape="round"
                                    onClick={() => {
                                        setShowRejectCard(false)

                                    }}
                                >
                                    Close
                            </Button>
                            </div>

                        </div>
                    </Modal>

                    <div className="row ml-3">
                        <div>
                            <img
                                src='/assets/image/toyota-logo.png' className="border-img mr-3"
                                style={{ width: "180px", height: "auto" }}
                            />
                        </div>

                        <div className="row col-9">
                            <div className="col-7">
                                <p style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                                    Buyer Detail
                            </p>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Legal Name">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        TLT,TH, Bangkok
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Code">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        TLT1234
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Code for iCash">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        TLT9876
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Code for iSupply">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        TLT9876
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Name">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        Toyota Leasing  Thailand
                                        </Descriptions.Item>
                                </Descriptions>
                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Tax ID">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        01055300028259
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Branch Code">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        {id}
                                    </Descriptions.Item>
                                </Descriptions>
                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Branch Name">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        สำนักงานใหญ่
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Address Detail">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        12/13 Silom Street
                                        </Descriptions.Item>
                                </Descriptions>
                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Sub District">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        สีลม
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="District">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        บางรัก
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Province">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        Bangkok
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Postcode">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        10500
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Payment Due Date">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        25
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="VAT Branch Code">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        -
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="VAT Branch Name">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        -
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                                    <Descriptions.Item label="Company Code">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        Active
                                        </Descriptions.Item>
                                </Descriptions>


                            </div>

                            <div className="col-1" />

                            <div className="col-4">
                                <p style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                                    Contect Person
                            </p>

                                <Descriptions colon={false} labelStyle={{ width: "100%" }}>
                                    <Descriptions.Item label="Kunanon Somkham" />
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Email">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        kunanon@xxxxx
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Mobile no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Office Tel no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Fax no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>


                                <Descriptions className="mt-3" colon={false} labelStyle={{ width: "100%" }}>
                                    <Descriptions.Item label="Kunanon Somkham" />
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Email">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        kunanon@xxxxx
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Mobile no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Office Tel no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                                    <Descriptions.Item label="Fax no.">
                                        <div style={{ marginRight: "12%" }}> : </div>
                                        02-3569442
                                        </Descriptions.Item>
                                </Descriptions>

                            </div>
                        </div>
                    </div>

                    <hr style={{ borderColor: "#456fb6", borderWidth: "2px" }} />

                    <Button
                        shape="round bbl-btn-blue-bark"
                        onClick={() => { setOnActionHistory(!onActionHistory) }}
                    >
                        <p>
                            Action History
                         <DownOutlined
                                rotate={onActionHistory ? 180 : ""}
                                style={{ fontSize: "12px", marginLeft: "10px", marginTop: "-2%" }}
                            />
                        </p>

                    </Button>

                    {onActionHistory ?
                        <div className="mt-3 mb-3">
                            <Table
                                pagination={false}
                                scroll={{ y: 200 }}
                                dataSource={dataSourceActionHistory}
                                columns={columnsActionHistory}
                            />
                        </div>
                        : ""
                    }



                    <div className="row justify-content-md-center">
                        <Button
                            className="bbl-btn-blue mr-2 px-4"
                            shape="round"
                            onClick={() => { setShowApprovedCard(true) }}
                        >
                            Approved
                    </Button>
                        <Button
                            className="bbl-btn-orange mr-2 px-4"
                            shape="round"
                            onClick={() => { setShowRejectCard(true) }}
                        >
                            Reject
                    </Button>
                        <Button
                            shape="round"
                            className="bbl-btn-blue-light mr-2 px-4"
                            onClick={() => {
                                blockUI()
                                window.history.back()
                            }}
                        >
                            Back
                    </Button>
                    </div>

                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(branchApprovalDetail);