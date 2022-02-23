import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { Button, Breadcrumb, Input, Form, Modal, Result, Select } from 'antd';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';

import { B2PAPI } from "../../context/api";


export default function branchLists(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const router = useRouter();
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select

  const [totalItem, setTotalItem] = useState("");
  const [totalRecord, setTotalRecord] = useState("");

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

  const [buyercode, setBuyercode] = useState("");
  const [buyername, setBuyername] = useState("");
  const [companyType, setCompanyType] = useState("")
  const [status, setStatus] = useState("")

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);


  useEffect(async () => {
    context.setBuyerApprovalDetailId("")
    context.setBuyerDetailId("")
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

    const mapData = async (field, value) => {
      await bodyRequest.searchList.push({
        field: field,
        value: value,
      });
    };
    if (buyercode !== '') {
      mapData('buyerCompCode', buyercode);
    }
    if (buyername !== '') {
      mapData('buyerCompName', buyername);
    }
    if (companyType !== '') {
      mapData('companyType', companyType);
    }
    if (status !== '') {
      mapData('statusCode', status);
    }

    const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/buyer/profile/waitingApproval', bodyRequest, {
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
      title: 'Buyer Code',
      dataIndex: 'buyerCompCode',
      sortOrder: sortedInfo.columnKey == '2' && sortedInfo.order,
      width: 200,
      editable: true,
      align: "center",
      sorter: true,
      render: (text, record, index) => (
        // <div
        //     onClick={() => { console.log(buyerApprovalLists.id) }}
        // >
        //     {text}
        // </div>
        <a
          className="btn-text blue"
          onClick={async () => {
            await context.setBuyerApprovalDetailId(record.id)
            showLoading("Loading")
            Router.push({
              pathname: "/profile/buyerWaitingApproval",
            });
          }}
          // href="/profile/buyerWaitingApproval"
          // as="/profile/buyerWaitingApproval"
          style={{
            width: "200px"
          }}
        >
          {text}
        </a>
      ),
    },
    {
      id: "3",
      key: "3",
      title: 'Buyer Name(TH)',
      dataIndex: 'buyerCompNameTH',
      sortOrder: sortedInfo.columnKey == '3' && sortedInfo.order,
      width: 300,
      // align: "center",
      editable: true,
      sorter: true,
      render: (text, record, index) => (
        <div
          style={{ width: "300px" }}
        >
          {text}
        </div>
      )
    },
    {
      id: "4",
      key: "4",
      title: 'Buyer Name(EN)',
      dataIndex: 'buyerCompNameEN',
      sortOrder: sortedInfo.columnKey == '4' && sortedInfo.order,
      width: 300,
      // align: "center",
      editable: true,
      sorter: true,
      render: (text, record, index) => (
        <div
          style={{ width: "300px" }}
        >
          {text}
        </div>
      )

    },
    {
      id: "5",
      key: "5",
      title: 'Company Type',
      dataIndex: 'isMainCompany',
      sortOrder: sortedInfo.columnKey == '5' && sortedInfo.order,
      width: 140,
      // align: "center",
      editable: true,
      sorter: false,
      render: (text, record, index) => (
        <div
          style={{ width: "140px" }}
        >
          {text == true ?
            "Main Company"
            :
            "Sub Company"
          }
        </div>
      )
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
      title: "Status",
      dataIndex: 'statusCode',
      sortOrder: sortedInfo.columnKey == '7' && sortedInfo.order,
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
  //    ${totalRecord < current * pageSize ? totalRecord : current * pageSize} of ${totalRecord} items`;

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
    //   searchList.push({
    //     field: field,
    //     value: value,
    //   });
    // };

    // if (buyercode !== '') {
    //   mapData('buyerCompCode', buyercode);
    // }
    // if (buyername !== '') {
    //   mapData('buyerCompName', buyername);
    // }
    // if (status !== '') {
    //   mapData('statusCode', status);
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
  //   onSearch()
  // };

  const onClearSearch = async () => {
    setCurrent(1)
    setBuyercode("")
    setBuyername("")
    setCompanyType("")
    setStatus("")
    form.resetFields();

    setIsLoadingTable(true);

    setSortedInfo({ columnKey: null, order: null })

    const bodyRequest = {
      page: 1,
      pageSize,
      searchList: [],
      sortList: [],
    };

    const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/buyer/profile/waitingApproval', bodyRequest, {
      method: "post", authorized: true,
    })
    setIsLoadingTable(false);

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
                Buyer Profile Approval Lists
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



          {/** ***  Search Bar **** */}
          <Form
            className="form"
            layout="vertical"
            name="basic"
            form={form}
            initialValues={{
              companyType: ""
            }}
          // onFinish={onFinish}
          >
            <div className="row">
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Buyer Code</label>
                <div className="controls">
                  <Form.Item
                    // label="Buyer Code"
                    name="buyercode"
                  >
                    <Input
                      id="buyercode"
                      label="Buyer Code"
                      variant="outlined"
                      value={buyercode}
                      onChange={(e) => {
                        setBuyercode(e.target.value)
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
                      label="Buyer Name"
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
                <label className="control-label">Company Type</label>
                <div className="controls">
                  <Form.Item
                    // label="Company Type"
                    name="companyType"
                  >
                    <Select
                      // initialValues="all"
                      value={companyType}
                      onChange={(e) => {
                        setCompanyType(e)
                      }}
                    >
                      <Option value="">All</Option>
                      <Option value="Y">Main Company</Option>
                      <Option value="N">Sub Company</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Status</label>
                <div className="controls">
                  <Form.Item
                    // className="ml-5"
                    // label="Status"
                    name="status"
                  // style={{ width: "15%" }}
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
                      <Option value="PFK01">Waiting Create Approval</Option>
                      <Option value="PFK06">Waiting Modify Approval</Option>
                      <Option value="PFK03">Rejected by Bank</Option>
                      <Option value="PFB04">Rejected by Buyer</Option>
                      <Option value="PFK09">Rejected Modifying</Option>
                    </Select>
                  </Form.Item>
                </div>
              </div>

              <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                <Button
                  className="btn btn-blue"
                  size="middle"
                  type="submit"
                  name="btnSearch"
                  id="btnSearch"
                  htmlType="submit"
                  onClick={() => { onSearch() }}
                >
                  Search
                </Button>

                <Button
                  className="btn btn-blue-transparent ml-2"
                  size="middle"
                  type="reset"
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

      <div className="line-gap"></div>


      <div className="text-right">
        {context.isAllow("P6103", ["CREATE"]) && (
          <Button
            className="btn btn-blue mt-5 mr-10"
            shape="round"
            onClick={() => {
              Router.push({
                pathname: "/profile/addEditBuyer",
              });
            }}
          // href="/profile/addEditBuyer"
          >
            Create Profile
          </Button>
        )}
      </div>

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

branchLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}