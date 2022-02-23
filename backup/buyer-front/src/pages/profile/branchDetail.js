import React, { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router'
import { Descriptions, Button, Table } from 'antd';
import { connect } from 'react-redux';
import Link from "next/link";
import Icon, { DownOutlined } from '@ant-design/icons';

import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

function branchDetail(props) {
    const { blockUI, unblockUI } = props;

    const router = useRouter()

    const [branch, setBranch] = useState("Buyer")
    const [id, setId] = useState("")

    const [onActionHistory, setOnActionHistory] = useState(false)

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

                            <a href='/profile/branchLists/' style={{ color: "#000" }}>
                            Branch List &nbsp;
                            </a>

                        {'>'} &nbsp;

                        <a>
                            <div className="bbl-font-bold">
                                {branch} Branch Profile
                            </div>
                        </a>
                    </div>

                    <div className="row ml-3">
                        <div>
                            <img
                                src='/assets/image/toyota-logo.png'
                                className="border-img mr-3"
                                style={{
                                    width: "180px",
                                    height: "auto"
                                }}
                            />
                        </div>

                        <div className="row col-9">
                            <div className="col-7">
                                <p style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                                    Buyer Branch Detail
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
                            className="bbl-btn-blue mr-2 px-5"
                            shape="round"
                            onClick={() => {
                                blockUI()
                                Router.push({
                                    pathname: `/profile/addEditBranchProfile`,
                                    search: `?id=${id}`,
                                    as: `/profile/addEditBranchProfile`
                                })
                                    .then(() => unblockUI())
                            }}
                        >
                            Edit
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

export default connect(mapStateToProps, mapDispatchToProps)(branchDetail);