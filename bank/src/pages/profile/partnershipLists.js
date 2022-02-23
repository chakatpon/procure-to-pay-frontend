import React, { useState, useEffect, useContext } from 'react';
// import { StoreContext } from "../../context/store";
import { connect } from 'react-redux';
import Router, { useRouter } from "next/router";

import { Button, Form, Breadcrumb, Input, Select, Tabs, Modal, Result } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';

import { B2PAPI } from "../../context/api";

export default function partnershipLists(props) {
    const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
    const context = useContext(StoreContext);
    const AppApi = B2PAPI(StoreContext);
    const router = useRouter();
    const { TabPane } = Tabs;

    const { Option } = Select

    const [supplierName, setSupplierName] = useState("")
    const [tab, setTab] = useState("1")

    const [status, setStatus] = useState("")

    const [totalItem, setTotalItem] = useState("");
    const [totalRecord, setTotalRecord] = useState("");

    const [current, setCurrent] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [dataTable, setDataTable] = useState([]);
    const [isLoadingTable, setIsLoadingTable] = useState(false);

    const [totalItemWaiting, setTotalItemWaiting] = useState("");
    const [totalRecordWaiting, setTotalRecordWaiting] = useState("");

    const [currentWaiting, setCurrentWaiting] = useState(1);
    const [pageSizeWaiting, setPageSizeWaiting] = useState(10);
    const [dataTableWaiting, setDataTableWaiting] = useState([]);
    const [isLoadingTableWaiting, setIsLoadingTableWaiting] = useState(false);


    useEffect(async () => {
        setIsLoadingTable(true);
        setIsLoadingTableWaiting(true);

        if (context.tab == "2") {
            setTab("2")
        } else {
            setTab("1")
        }

        if (context.buyerDetailId == "") {
            Router.push({
                pathname: "/profile/buyerLists",
            });
        }
        await context.setSupplierNameDetailId("")
        await context.setSupplierNameApprovalDetailId("")

        hideLoading()
        // setPermission(router.route);
        // if (tab == "1") {
        await initialData({ current, pageSize })
        // } else {
        await initialDataWaiting({ current, pageSize })
        // }
    }, [])


    const initialData = async ({ current, pageSize, searchList, sortList }) => {
        // console.log(current);
        setIsLoadingTable(true);

        const bodyRequest = {
            buyerCode: context.buyerDetailId,
            page: current,
            pageSize,
            searchList: searchList ||
                [{
                    field: 'buyerCode',
                    value: context.buyerDetailId,
                }],
            sortList: sortList || [],
        };

        const mapData = (field, value) => {
            bodyRequest.searchList.push({
                field: field,
                value: value,
            });
        };

        if (supplierName !== '') {
            mapData('supplierName', supplierName);
        }
        if (tab == "2") {
            if (status !== '') {
                mapData('statusCode', status);
            }
        }
        if (context.buyerDetailId !== '') {
            mapData('buyerCode', context.buyerDetailId);
        }

        const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/partnership', bodyRequest, {
            method: "post", authorized: true,
        })
        setIsLoadingTable(false);

        // console.log(dataApi.data)

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
    }

    const initialDataWaiting = async ({ current, pageSize, searchList, sortList }) => {
        // console.log(current);
        setIsLoadingTableWaiting(true);

        const bodyRequest = {
            page: current,
            pageSize,
            searchList: searchList ||
                [{
                    field: 'buyerCode',
                    value: context.buyerDetailId,
                }],
            sortList: sortList || [],
        };

        const mapData = (field, value) => {
            bodyRequest.searchList.push({
                field: field,
                value: value,
            });
        };

        if (supplierName !== '') {
            mapData('supplierName', supplierName);
        }
        if (tab == "2") {
            if (status !== '') {
                mapData('statusCode', status);
            }
        }
        if (context.buyerDetailId !== '') {
            mapData('buyerCode', context.buyerDetailId);
        }

        const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/partnership/waitingApproval', bodyRequest, {
            method: "post", authorized: true,
        })
        setIsLoadingTableWaiting(false);

        // console.log(dataApi.data)

        if (dataApi.status == 200) {
            setTotalItemWaiting(_.get(dataApi, 'data.totalItem', 0))
            setTotalRecordWaiting(_.get(dataApi, 'data.totalRecord', 0))
            setDataTableWaiting(_.get(dataApi, 'data.items', []))
        } else {
            showAlertDialog({
                text: dataApi.data.message,
                icon: "warning",
                showCloseButton: true,
                showConfirmButton: true,
            })
        }
    }

    const Columns = [

        {
            id: "1",
            title: "No.",
            dataIndex: 'no',
            defaultSortOrder: 'ascend',
            editable: true,
            width: '10%',
            align: "center",
            sorter: true,
        },
        {
            id: "2",
            title: 'Supplier Name (TH)',
            dataIndex: 'supplierNameTH',
            defaultSortOrder: 'ascend',
            width: 350,
            editable: true,
            // align: "center",
            sorter: true,
            render: (text, record, index) => (
                <a
                    className="btn-text blue"
                    onClick={async () => {
                        await context.setSupplierNameDetailId(record.supplierCode)
                        showLoading("Loading")
                        Router.push({
                            pathname: "/profile/partnershipDetail",
                        });
                    }}
                    style={{
                        width: "350px"
                    }}
                >
                    {text || "-"}
                </a>
            ),
        },
        {
            id: "3",
            title: 'Supplier Name (EN)',
            dataIndex: 'supplierNameEN',
            defaultSortOrder: 'ascend',
            width: 350,
            // align: "center",
            editable: true,
            sorter: true,
            render: (text, record, index) => (
                <div style={{
                    width: "350px"
                }}>
                    {text || "-"}
                </div>
            ),
        },
        {
            id: "4",
            title: 'Create Date',
            dataIndex: 'createdDate',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: true,
            render: (text, record, index) => (
                <div>
                    {<span dangerouslySetInnerHTML={{ __html: record.createDateStr }} /> || "-"}
                </div>
            )
        },
        {
            id: "5",
            title: 'Active',
            dataIndex: 'isActive',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: true,
            render: (text, record, index) => (
                <div>
                    {text == true ?
                        <CheckCircleOutlined style={{ color: "#1BAA6E" }} />
                        :
                        <CloseCircleOutlined style={{ color: "#C12C20" }} />
                    }
                </div>
            )
        },
        // {
        //     id: "9",
        //     title: "Status",
        //     dataIndex: 'isActive',
        //     defaultSortOrder: 'ascend',
        //     // width: '20%',
        //     editable: true,
        //     align: "center",
        //     sorter: true,
        //     render: (text, record, index) => (
        //         <div>
        //             {text == true ?
        //                 "Approved"
        //                 :
        //                 "Waiting for Buyer Approve"
        //             }
        //         </div>
        //     )
        // },
    ]

    const columnsWaiting = [
        {
            id: "1",
            title: "No.",
            dataIndex: 'no',
            defaultSortOrder: 'ascend',
            editable: true,
            width: '10%',
            align: "center",
            sorter: true,
        },
        {
            id: "2",
            title: 'Supplier Name (TH)',
            dataIndex: 'supplierNameTH',
            defaultSortOrder: 'ascend',
            width: 350,
            editable: true,
            // align: "center",
            sorter: true,
            render: (text, record, index) => (
                <div
                    style={{
                        width: "350px"
                    }}
                >
                    {text}
                </div>
            ),
        },
        {
            id: "3",
            title: 'Supplier Name (EN)',
            dataIndex: 'supplierNameEN',
            defaultSortOrder: 'ascend',
            width: 350,
            // align: "center",
            editable: true,
            sorter: true,
            render: (text, record, index) => (
                <div style={{
                    width: "350px"
                }}>
                    {text || "-"}
                </div>
            ),
        },
        {
            id: "4",
            title: 'Create Date',
            hidden: true,
            dataIndex: 'createDate',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: true,
        },
        {
            id: "5",
            title: "Status",
            dataIndex: 'statusCode',
            defaultSortOrder: 'ascend',
            // width: '20%',
            editable: true,
            align: "center",
            sorter: true,
            render: (text, record, index) => (
                <div>
                    {<span dangerouslySetInnerHTML={{ __html: record.statusDesc }} /> || "-"}
                </div>
            )
        },
        {
            id: "6",
            title: 'Action',
            dataIndex: 'action',
            defaultSortOrder: 'ascend',
            // width: '10%',
            align: "center",
            editable: true,
            sorter: false,
            render: (text, record, index) => (
                <a
                    className="btn-text blue"
                    onClick={async () => {
                        await context.setSupplierNameApprovalDetailId(record.id)
                        showLoading("Loading")
                        Router.push({
                            pathname: "/profile/partnershipWaitingApproval",
                        });
                    }}
                // style={{
                // width: "350px"
                // }}
                >
                    View
                </a>
            ),
            // render: (text, record, index) => (
            //     <div>
            //         {text == true ?
            //             <CheckCircleOutlined style={{ color: "#1BAA6E" }} />
            //             :
            //             <CloseCircleOutlined style={{ color: "#C12C20" }} />
            //         }
            //     </div>
            // )
        },
    ]

    // const showTotal = () => `${current * pageSize - pageSize + 1} -
    //  ${totalRecord < current * pageSize ? totalRecord : current * pageSize} of ${totalRecord} items`;

    // const showTotalWaiting = () => `${currentWaiting * pageSizeWaiting - pageSizeWaiting + 1} -
    //  ${totalRecordWaiting < currentWaiting * pageSizeWaiting ? totalRecordWaiting
    //         :
    //         currentWaiting * pageSizeWaiting} of ${totalRecordWaiting} items`;

    const pageChanger = async (pagination, filters, sorter, extra) => {
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

    const pageChangerWaiting = async (pagination, filters, sorter, extra) => {
        let inquiry = {};

        if (pagination.current) {
            setCurrentWaiting(pagination.current);
        }
        if (pagination.pageSize) {
            setPageSizeWaiting(pagination.pageSize);
        }
        if (extra.action == 'sort') {
            // setCurrentWaiting(1)
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

        await initialDataWaiting(inquiry)
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

        // if (supplierName !== '') {
        //     mapData('supplierName', supplierName);
        // }
        // if (tab == "2") {
        //     if (status !== '') {
        //         mapData('statusCode', status);
        //     }
        // }
        // if (context.buyerDetailId !== '') {
        //     mapData('buyerCode', context.buyerDetailId);
        // }

        const inquiry = {
            current: 1,
            pageSize: pageSize,
            searchList: searchList,
        };

        if (tab == "1") {
            await initialData(inquiry);
        } else {
            await initialDataWaiting(inquiry);
        }
    };

    const [form] = Form.useForm();

    // const onFinish = () => {
    //     onSearch()
    // };

    const onClearSearch = () => {
        setSupplierName("")
        setStatus("")
        form.resetFields();
    };

    const tabChange = (key) => {
        setTab(key)
        // console.log(key);
    }

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
                                Partnership Lists
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
                                errorMessage
                                // <p>
                                // </p>
                            }
                        />
                    </Modal> */}


                    <div className="row justify-content-md-center">
                        <Tabs
                            activeKey={tab}
                            onChange={tabChange}
                            moreIcon={false}
                        >
                            <TabPane tab="Partnership Lists" key="1" />
                            <TabPane tab="Partnership Approval Lists" key="2" />
                        </Tabs>
                    </div>


                    <Form
                        className="form"
                        layout="vertical"
                        name="basic"
                        form={form}
                    // initialValues={{
                    //     companyType: "all",
                    //     active: "all"
                    // }}
                    // onFinish={onFinish}
                    >
                        <div className="row">
                            <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                                <label className="control-label">Supplier Name</label>
                                <div className="controls">
                                    <Form.Item
                                        // label="Supplier Name"
                                        name="supplierName"
                                    >
                                        <Input
                                            id="supplierName"
                                            variant="outlined"
                                            value={supplierName}
                                            onChange={(e) => {
                                                setSupplierName(e.target.value)
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


                            {tab == "2" ?
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
                                            >
                                                <Option value="">All</Option>
                                                <Option value="PFK01">Waiting Create Approval</Option>
                                                <Option value="PFK06">Waiting Modify Approval</Option>
                                                <Option value="PFK11">Rejected Creating</Option>
                                                <Option value="PFK09">Rejected Modifying</Option>
                                            </Select>
                                        </Form.Item>
                                    </div>
                                </div>
                                :
                                ""
                            }

                            <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                                <Button
                                    className="btn btn-blue"
                                    htmlType="button"
                                    name="btnSearch"
                                    id="btnSearch"
                                    onClick={() => { onSearch() }}
                                >
                                    Search
                                </Button>
                                <Button
                                    className="btn btn-blue-transparent ml-2"
                                    htmlType="reset"
                                    name="btnClear"
                                    id="btnClear"
                                    onClick={() => { onClearSearch() }}
                                >
                                    Clear
                                </Button>
                            </div>

                        </div>
                    </Form>

                </div>
            </section>

            <div className="line-gap"></div >


            {tab === "2" ?
                <div className="text-right">
                    {context.isAllow("P6102", ["PARTNERSHIP_CREATE_EDIT"]) && (
                        <Button
                            className="btn btn-blue mt-5 mr-10"
                            shape="round"
                            onClick={() => {
                                Router.push({
                                    pathname: "/profile/addEditpartnership",
                                });
                            }}
                        >
                            Create
                        </Button>
                    )}
                </div>
                :
                ""
            }

            <section id="page-content" className="mt-5">
                <div className="ml-10 mr-10">
                    <BBLTableList
                        columns={tab == "1" ? Columns : columnsWaiting}
                        dataSource={tab == "1" ? dataTable : dataTableWaiting}
                        // pagination={tab == "1" ? showTotal : showTotalWaiting}
                        total={tab == "1" ? totalRecord : totalRecordWaiting}
                        current={tab == "1" ? current : currentWaiting}
                        pageSize={tab == "1" ? pageSize : pageSizeWaiting}
                        loading={tab == "1" ? isLoadingTable : isLoadingTableWaiting}
                        onChange={tab == "1" ? pageChanger : pageChangerWaiting}
                    />
                </div>
            </section>

        </div >

    )
}

partnershipLists.Layout = Layout;
export async function getStaticProps({ locale }) {
    const apiUrl = process.env.API_ENDPOINT;
    return {
        props: {
            ...(await serverSideTranslations(locale, ["common"])),
        },
    };
}