import React, { useState, useEffect } from 'react';
// import { StoreContext } from "../../context/store";
import { connect } from 'react-redux';
import Link from "next/link";

import TextField from '@material-ui/core/TextField';
import InputLabel from '@material-ui/core/InputLabel';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { Button, Table } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';
import BBLTableList from '../components/BBLTableList';


function branchLists(props) {
    const { blockUI, unblockUI } = props;

    // const context = useContext(StoreContext);

    const [branch, setBranch] = useState("Buyer")

    const [active, setActive] = useState("all")
    const [status, setStatus] = useState("all")

    const [current, setCurrent] = useState('1');
    const [pageSize, setPageSize] = useState('10');


    useEffect(() => {
        unblockUI()
    })



    const dataTable = []

    for (let i = 0; i < 85; i++) {

        dataTable.push(
            {
                key: i,
                "no": i + 1,
                "brachCode": `0000${i}`,
                "brachName": `สำนักงานที่ ${i + 1}`,
                "buyerNameTH": `โตโยต้า ${i + 1}`,
                "buyerNameEN": `Toyota ${i + 1}`,
                // "vatBrachCode": `0000${i}`,
                "createDate": "21-04-2021 00:00:20",
                "active": <CheckCircleOutlined style={{ color: "#52c41a" }} />,
                "status": "Approed",
            }
        )
    }


    const BuyerColumns = [

        {
            id: "1",
            title: "NO.",
            dataIndex: 'no',
            defaultSortOrder: 'ascend',
            // width: '10%',
            editable: true,
            align: "center",
            sorter: {
                compare: (a, b) => a.no - b.no,
            },
        },
        {
            id: "2",
            title: 'Branch Code',
            dataIndex: 'brachCode',
            defaultSortOrder: 'ascend',
            // width: '15%',
            editable: true,
            align: "center",
            sorter: {
                compare: (a, b) => a.age - b.age,
            },
            render: (text, record, index) => (
                <Link
                    onClick={() => blockUI()}
                    href={`/profile/branchDetail?mode=edit&mpfId=${text}`}
                    as="/profile/branchDetail"
                    style={{ color: "blue" }}
                >
                    {text}
                </Link>
            ),
        },
        {
            id: "3",
            title: 'Branch Name',
            dataIndex: 'brachName',
            defaultSortOrder: 'ascend',
            // width: '15%',
            align: "center",
            editable: true,
            sorter: {
                compare: (a, b) => a.brachName - b.brachName,
            },
        },
        {
            id: "4",
            title: 'Buyer Name (TH)',
            dataIndex: 'buyerNameTH',
            defaultSortOrder: 'ascend',
            // width: '15%',
            align: "center",
            editable: true,
            sorter: {
                compare: (a, b) => a.buyerNameTH - b.buyerNameTH,
            },
        },
        {
            id: "5",
            title: 'Buyer Name (EN)',
            dataIndex: 'buyerNameEN',
            defaultSortOrder: 'ascend',
            // width: '15%',
            align: "center",
            editable: true,
            sorter: {
                compare: (a, b) => a.buyerNameEN - b.buyerNameEN,
            },
        },
        // {
        //     id: "6",
        //     title: 'VAT Branch Code',
        //     dataIndex: 'vatBrachCode',
        //     defaultSortOrder: 'ascend',
        //     // width: '8%',
        //     align: "center",
        //     editable: true,
        //     render: text => <p style={{ color: "#003399" }}>{text}</p>,
        //     sorter: {
        //         compare: (a, b) => a.vatBrachCode - b.vatBrachCode,
        //     },
        // },
        {
            id: "7",
            title: 'Create Date',
            dataIndex: 'createDate',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: {
                compare: (a, b) => a.createDate - b.createDate,
            },
        },
        {
            id: "8",
            title: 'Active',
            dataIndex: 'active',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: {
                compare: (a, b) => a.active - b.active,
            },
        },
        {
            id: "9",
            title: "Status",
            dataIndex: 'status',
            defaultSortOrder: 'ascend',
            // width: '20%',
            editable: true,
            align: "center",
            sorter: {
                compare: (a, b) => a.status - b.status,
            },
        }
    ]

    const showTotal = () => `${(current * pageSize) - pageSize + 1} - ${current * pageSize} of ${dataTable.length} item(s)`

    const pageChanger = (e) => {
        if (e.current) {
            setCurrent(e.current)
        }
        if (e.pageSize) {
            setPageSize(e.pageSize)
        }
    }


    return (
        <div className="card-page">
            <div className="row justify-content-md-center">
                <div className="col-12" style={{ background: "#f0f0f0" }}>
                    <div className="card-body card-search">

                        <div className="row bbl-font ml-5 mr-5">

                            <p style={{ color: "#000" }}>
                                Profile &nbsp;
                            </p>

                            {'>'} &nbsp;

                            <p style={{ color: "#000" }}>
                                {branch} Profile &nbsp;
                            </p>

                            {'>'} &nbsp;

                            <a>
                                <div className="bbl-font-bold">
                                    Branch List
                            </div>
                            </a>
                        </div>


                        {/*  Search Bar */}

                        <div className="row ml-5 mr-5">
                            <TextField
                                className="mt-2 mr-3"
                                id="branchcode"
                                label="Brancd Code"
                                variant="outlined"
                                // value={branchcode}
                                style={{ width: "15%" }}
                                onChange={(e) => {
                                }}
                            />
                            <TextField
                                className="mt-2 mr-3"
                                id="branchname"
                                label="Branch Name"
                                variant="outlined"
                                // value={branchname}
                                style={{ width: "15%" }}
                                onChange={(e) => {
                                }}
                            />
                            <TextField
                                className="mt-2 mr-3"
                                id="buyername"
                                label="Buyer Name"
                                variant="outlined"
                                // value={buyername}
                                style={{ width: "15%" }}
                                onChange={(e) => {
                                }}
                            />

                            <div className="row align-self-center mt-2 ml-2">
                                <Button
                                    className="bbl-btn-blue mr-2 px-4"
                                    shape="round"
                                    onClick={() => { }}
                                    style={{
                                        height: "100%"
                                    }}
                                >
                                    Search
                                    </Button>
                                <Button
                                    className="bbl-btn-blue-light px-4"
                                    shape="round"
                                    onClick={() => { }}
                                >
                                    Clear
                                    </Button>
                            </div>
                        </div>
                        <div className="row mt-3 ml-5 mr-5">
                            <FormControl className="mt-2 mr-3" variant="outlined" style={{ width: "15%" }}>
                                <InputLabel htmlFor="outlined-age-native-simple">Active</InputLabel>
                                <Select
                                    value={active}
                                    onChange={(e) => {
                                        setActive(e.target.value)
                                        console.log(e.target.value);
                                    }}
                                    label="Active"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl className="mt-2 mr-3" variant="outlined" style={{ width: "15%" }}>
                                <InputLabel htmlFor="outlined-age-native-simple">Status</InputLabel>
                                <Select
                                    value={status}
                                    onChange={(e) => {
                                        setStatus(e.target.value)
                                        console.log(e.target.value);
                                    }}
                                    label="Status"
                                >
                                    <MenuItem value="all">All</MenuItem>
                                    <MenuItem value="approved">Approved</MenuItem>
                                    <MenuItem value="reject">Reject</MenuItem>
                                </Select>
                            </FormControl>
                        </div>
                    </div>


                    <div className="card-body mt-3 card-body card-search">
                        <div className="ml-5 mr-5">

                            {branch === "Bank" ?
                                <div className="text-right">
                                    <Button
                                        className="bbl-btn-blue mr-2 px-4"
                                        shape="round"
                                        onClick={() => { }}
                                        style={{
                                            height: "100%"
                                        }}
                                    >
                                        Create Profile
                                    </Button>
                                </div>
                                :
                                ""
                            }

                            <BBLTableList
                                columns={BuyerColumns}
                                dataSource={dataTable}
                                pagination={showTotal}
                                onChange={(e) => {
                                    pageChanger(e);
                                }}

                            />
                        </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(branchLists);
