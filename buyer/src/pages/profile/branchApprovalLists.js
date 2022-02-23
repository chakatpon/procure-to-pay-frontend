import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import Router, { useRouter } from "next/router";

import { Button, Breadcrumb, Form, Input, Select, Modal, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';

import { B2PAPI } from "../../context/api";


export default function branchApprovalLists(props) {
    const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
    const context = useContext(StoreContext);
    const router = useRouter();
    const AppApi = B2PAPI(StoreContext);
    const { Option } = Select

    const [totalItem, setTotalItem] = useState("");
    const [totalRecord, setTotalRecord] = useState("");

    const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

    const [branchcode, setBranchcode] = useState("")
    const [branchname, setBranchname] = useState("")
    const [buyername, setBuyername] = useState("")
    const [active, setActive] = useState("")
    const [status, setStatus] = useState("")

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);


    useEffect(async () => {
        await initialData({ current, pageSize })
    }, [])

    const initialData = async ({ current, pageSize, searchList, sortList }) => {
        // console.log(current);
        setIsLoadingTable(true);

        const bodyRequest = {
            page: current,
            pageSize,
            searchList: searchList || [],
            sortList: sortList || [],
        };

        const mapData = (field, value) => {
            bodyRequest.searchList.push({
                field: field,
                value: value,
            });
        };

        if (branchcode !== '') {
            mapData('buyerBranchCode', branchcode);
        }
        if (branchname !== '') {
            mapData('buyerBranchName', branchname);
        }
        if (buyername !== '') {
            mapData('buyerCompName', buyername);
        }
        if (active !== '') {
            mapData('isActive', active);
        }
        if (status !== '') {
            mapData('statusCode', status);
        }

        const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/buyer/branch/profile/waitingApproval', bodyRequest, {
            method: "post", authorized: true,
        })
        setIsLoadingTable(false);
        // console.log(dataApi)

        if (dataApi.status == 200) {
            setTotalItem(_.get(dataApi, 'data.totalItem', 0))
            setTotalRecord(_.get(dataApi, 'data.totalRecord', 0))
            setDataTable(_.get(dataApi, 'data.items', []))
        } else {
            showAlertDialog({
                text: dataApi.data.message,
                icon: "warning",
                showCloseButton: true,
                showConfirmButton: true,
            })
        }

        hideLoading()
    }

    const BuyerColumns = [

        {
            id: "1",
            key: "1",
            title: "No.",
            dataIndex: 'no',
            sortOrder: sortedInfo.columnKey == '1' && sortedInfo.order,
            editable: true,
            width: '10%',
            align: "center",
            sorter: true,
        },
        {
            id: "2",
            key: "2",
            title: 'Branch Code',
            dataIndex: 'buyerBranchCode',
            sortOrder: sortedInfo.columnKey == '2' && sortedInfo.order,
            // width: '15%',
            editable: true,
            align: "center",
            sorter: true,
            render: (text, record, index) => (
                <a
                    className="btn-text blue"
                    onClick={async () => {
                        await context.setBranchDetailId(record.id)
                        showLoading("Loading")
                        Router.push({
                            pathname: "/profile/branchApprovalDetail",
                        });
                    }}
                // href="/profile/branchApprovalDetail"
                >
                    {text}
                </a >
            ),
        },
        {
            id: "3",
            key: "3",
            title: 'Branch Name',
            dataIndex: 'buyerBranchName',
            sortOrder: sortedInfo.columnKey == '3' && sortedInfo.order,
            // width: '15%',
            // align: "center",
            editable: true,
            sorter: true,
        },
        {
            id: "4",
            key: "4",
            title: 'Buyer Name(TH)',
            dataIndex: 'buyerCompNameTH',
            sortOrder: sortedInfo.columnKey == '4' && sortedInfo.order,
            // width: '15%',
            // align: "center",
            editable: true,
            sorter: true,
        },
        {
            id: "5",
            key: "5",
            title: 'Buyer Name(EN)',
            dataIndex: 'buyerCompNameEN',
            sortOrder: sortedInfo.columnKey == '5' && sortedInfo.order,
            // width: '15%',
            // align: "center",
            editable: true,
            sorter: true,
        },
        {
            id: "6",
            key: "6",
            title: 'Create Date',
            dataIndex: 'createDate',
            sortOrder: sortedInfo.columnKey == '6' && sortedInfo.order,
            // width: '10%',
            align: "center",
            editable: true,
            sorter: true,
        },
        {
            id: "7",
            key: "7",
            title: 'Active',
            dataIndex: 'isActive',
            sortOrder: sortedInfo.columnKey == '7' && sortedInfo.order,
            // width: '10%',
            align: "center",
            editable: true,
            sorter: true,
            render: (text, record, index) => (
                <div>
                    {text == true ?
                        <CheckCircleOutlined style={{ fontSize: '18px', color: '#1BAA6E' }} />
                        :
                        <CloseCircleOutlined style={{ fontSize: '18px', color: '#C12C20' }} />
                    }
                </div>
            )
        },
        {
            id: "8",
            key: "8",
            title: "Status",
            dataIndex: 'statusCode',
            sortOrder: sortedInfo.columnKey == '8' && sortedInfo.order,
            // width: '20%',
            editable: true,
            // align: "center",
            sorter: true,
            render: (text, record, index) => (
                <span dangerouslySetInnerHTML={{ __html: record.statusDesc }}></span>
            ),
        }
    ]

    // const showTotal = () => `${current * pageSize - pageSize + 1} -
    //  ${totalRecord < current * pageSize ? totalRecord : current * pageSize} of ${totalRecord} items`;

    const pageChanger = async (pagination, filters, sorter, extra) => {
        setSortedInfo(sorter)
        let inquiry = {};

        if (pagination.current) {
            setCurrent(pagination.current);
        }
        if (pagination.pageSize) {
            setPageSize(pagination.pageSize);
        }
        if (extra.action == 'sort') {
            // setCurrent(1)
            const sortValue = {
                field: sorter.field,
                order: sorter.order === 'descend' ? 'DESC' : 'ASC',
            };
            inquiry = {
                ...inquiry,
                current: pagination.current,
                pageSize: pagination.pageSize,
                sortList: [sortValue],
            };
        }
        if (extra.action == 'paginate') {
            inquiry = {
                ...inquiry,
                current: pagination.current,
                pageSize: pagination.pageSize,
            };
        }

        await initialData(inquiry)
    };

    const onSearch = async () => {
        setCurrent(1)
        const searchList = [];
        // const mapData = (field, value) => {
        //     searchList.push({
        //         field: field,
        //         value: value,
        //     });
        // };

        // if (branchcode !== '') {
        //     mapData('buyerBranchCode', branchcode);
        // }
        // if (branchname !== '') {
        //     mapData('buyerBranchName', branchname);
        // }
        // if (buyername !== '') {
        //     mapData('buyerCompName', buyername);
        // }
        // if (active !== '') {
        //     mapData('isActive', active);
        // }
        // if (status !== '') {
        //     mapData('statusCode', status);
        // }

        const inquiry = {
            current: 1,
            pageSize: pageSize,
            searchList: searchList,
        };

        await initialData(inquiry);
    };

    const [form] = Form.useForm();

    // const onFinish = () => {
    //     onSearch()
    // };

    const onClearSearch = async () => {
        setCurrent(1)
        setBranchcode("")
        setBranchname("")
        setBuyername("")
        setActive("")
        setStatus("")
        form.resetFields();

        setSortedInfo({ columnKey: null, order: null })

        setIsLoadingTable(true);

        const bodyRequest = {
            page: 1,
            pageSize,
            searchList: [],
            sortList: [],
        };

        const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/buyer/branch/profile/waitingApproval', bodyRequest, {
            method: "post", authorized: true,
        })
        setIsLoadingTable(false);
        // console.log(dataApi)

        if (dataApi.status == 200) {
            setTotalItem(_.get(dataApi, 'data.totalItem', 0))
            setTotalRecord(_.get(dataApi, 'data.totalRecord', 0))
            setDataTable(_.get(dataApi, 'data.items', []))
        } else {
            showAlertDialog({
                text: dataApi.data.message,
                icon: "warning",
                showCloseButton: true,
                showConfirmButton: true,
            })
        }

        hideLoading()
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
                            <Breadcrumb.Item className="breadcrumb-item active">
                                Branch Profile Approval Lists
                            </Breadcrumb.Item>
                        </Breadcrumb>

                    </div>

                    {/* <Modal
                        title=" "
                        footer={[]}
                        visible={errorCard}
                        closable={false}
                        onOk={() => {
                            // console.log("ok Error")
                            setErrorCrad(false)
                        }}
                        onCancel={() => {
                            setErrorCrad(false)
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
                    </Modal> */}


                    {/*   Search Bar  */}
                    <Form
                        className="form"
                        layout="vertical"
                        name="basic"
                        form={form}
                    // onFinish={onFinish}
                    >
                        <div className="row">
                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Branch Code</label>
                                <div className="controls">
                                    <Form.Item
                                        // label="Branch Code"
                                        name="branchcode"
                                    >
                                        <Input
                                            id="branchcode"
                                            variant="outlined"
                                            value={branchcode}
                                            onChange={(e) => {
                                                setBranchcode(e.target.value)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key == "Enter") {
                                                    onSearch()
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Branch Name</label>
                                <div className="controls">
                                    <Form.Item
                                        // label="Branch Name"
                                        name="branchname"
                                    >
                                        <Input
                                            id="branchname"
                                            variant="outlined"
                                            value={branchname}
                                            onChange={(e) => {
                                                setBranchname(e.target.value)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key == "Enter") {
                                                    onSearch()
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Buyer Name</label>
                                <div className="controls">
                                    <Form.Item
                                        // label="Buyer Name"
                                        name="buyername"
                                    >
                                        <Input
                                            id="buyername"
                                            variant="outlined"
                                            value={buyername}
                                            onChange={(e) => {
                                                setBuyername(e.target.value)
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key == "Enter") {
                                                    onSearch()
                                                }
                                            }}
                                        />
                                    </Form.Item>
                                </div>
                            </div>

                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Active</label>
                                <div className="controls">
                                    <Form.Item
                                    // label="Active"
                                    >
                                        <Select value={active} onChange={(value) => setActive(value)}>
                                            <Option value="">All</Option>
                                            <Option value="Y">Active</Option>
                                            <Option value="N">Inactive</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>


                            <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                                <Button
                                    className="btn btn-blue"
                                    shape="round"
                                    htmlType="submit"
                                    onClick={() => { onSearch() }}
                                >
                                    Search
                                </Button>

                                <Button
                                    className="btn btn-blue-transparent ml-2"
                                    shape="round"
                                    onClick={() => { onClearSearch() }}
                                >
                                    Clear
                                </Button>
                            </div>

                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Status</label>
                                <div className="controls">
                                    <Form.Item
                                        // label="Status"
                                        name="status"
                                    >
                                        <Select
                                            defaultValue=""
                                            value={status}
                                            onChange={(e) => {
                                                setStatus(e)
                                            }}
                                            label="Status"
                                        >
                                            <Option value="">All</Option>
                                            <Option value="PFB01">Waiting Create Approval</Option>
                                            <Option value="PFB06">Waiting Modify Approval</Option>
                                            <Option value="PFB11">Rejected Creating</Option>
                                            <Option value="PFB09">Rejected Modifying</Option>
                                        </Select>
                                    </Form.Item>
                                </div>
                            </div>

                        </div>
                    </Form>

                </div>
            </section>

            <div className="line-gap"></div>

            <section id="page-content" className="mt-5">
                <div className="ml-10 mr-10">

                    <BBLTableList
                        columns={BuyerColumns}
                        dataSource={dataTable}
                        // pagination={showTotal}
                        total={totalRecord}
                        current={current}
                        pageSize={pageSize}
                        loading={isLoadingTable}
                        onChange={pageChanger}
                    />
                </div>
            </section>

        </div >
    )
}

branchApprovalLists.Layout = Layout;
export async function getStaticProps({ locale }) {
    const apiUrl = process.env.API_ENDPOINT;
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}