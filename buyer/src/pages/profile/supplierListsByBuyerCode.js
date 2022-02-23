import React, { useState, useEffect, useContext } from 'react';
import { connect } from 'react-redux';
import Link from "next/link";
import Router, { useRouter } from "next/router";
import { Button, Breadcrumb, Input, Form, Modal, Result, Select } from 'antd';
import _ from "lodash";
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';

import { B2PAPI } from "../../context/api";

export default function supplierListsByBuyerCode(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const router = useRouter();
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select;

  const [totalItem, setTotalItem] = useState("");
  const [totalRecord, setTotalRecord] = useState("");

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

  // const [supplierCode, setSupplierCode] = useState('');
  const [supplierName, setSupplierName] = useState('');
  const [active, setActive] = useState("");

  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [dataTable, setDataTable] = useState([]);
  const [isLoadingTable, setIsLoadingTable] = useState(false);


  useEffect(async () => {
    if (!context.buyerDetailId) {
      showLoading("Loading")
      window.history.back()
    } else {
      await initialData({ current, pageSize })
    }

  }, [])

  const initialData = async ({ current, pageSize, searchList, sortList }) => {
    // console.log(current);
    setIsLoadingTable(true);

    const bodyRequest = {
      page: current,
      pageSize,
      searchList: searchList || [],
      sortList: sortList || [],
      buyerCode: context.buyerDetailId
    };

    const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/supplier/profile/buyerCode', bodyRequest, {
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
  }


  const SupplierColumns = [
    {
      id: '1',
      key: 'no',
      title: 'No.',
      dataIndex: 'no',
      width: '10%',
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
    },
    {
      id: '3',
      key: 'supplierNameTH',
      title: 'Supplier Name (TH)',
      dataIndex: 'supplierNameTH',
      align: 'center',
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierNameTH' && sortedInfo.order,
      render: (text, record, index) => (
        <a
          className="btn-text blue"
          onClick={async () => {
            await context.setSupplierNameDetailId(record.supplierCode)
            showLoading("Loading")
            Router.push({
              pathname: "/profile/supplierDetail",
            });
          }}
        >
          {text}
        </a>
      ),
    },
    {
      id: '4',
      key: 'supplierNameEN',
      title: 'Supplier Name (EN)',
      dataIndex: 'supplierNameEN',
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierNameEN' && sortedInfo.order,
    },
    {
      id: '5',
      key: 'createDateStr',
      title: 'Create Date',
      dataIndex: 'createdDate',
      align: 'center',
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'createDateStr' && sortedInfo.order,
      render: (text, record, index) => (
        <div>
          {<span dangerouslySetInnerHTML={{ __html: record.createDateStr }} /> || "-"}
        </div>
      )
    },
    {
      id: '6',
      key: 'isActive',
      title: 'Active',
      dataIndex: 'isActive',
      align: 'center',
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'isActive' && sortedInfo.order,
      render: (text) =>
        text === true ? (
          <CheckCircleOutlined style={{ fontSize: '18px', color: '#1BAA6E' }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: '18px', color: '#C12C20' }} />
        ),
    },
  ];

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
    const mapData = (field, value) => {
      searchList.push({
        field: field,
        value: value,
      });
    };

    // if (supplierCode !== '') {
    //   mapData('supplierCode', supplierCode);
    // }
    if (supplierName !== '') {
      mapData('supplierName', supplierName);
    }
    if (active !== "") {
      mapData("isActive", active);
    }

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
    // setSupplierCode("")
    setSupplierName("")
    setActive("")
    form.resetFields();

    setSortedInfo({ columnKey: null, order: null })

    setIsLoadingTable(true);

    const bodyRequest = {
      page: 1,
      pageSize,
      searchList: [],
      sortList: [],
      buyerCode: context.buyerDetailId
    };

    const dataApi = await AppApi.getApi('p2p/api/v1/inquiry/supplier/profile/buyerCode', bodyRequest, {
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
                Supplier Profile
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">
                Supplier Profile Lists
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
            layout="vertical"
            className="form"
            name="basic"
            form={form}
          // onFinish={onFinish}
          >
            <div className="row">
              {/* <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Supplier Code</label>
                <div className="controls">
                  <Form.Item
                    // label="Supplier Code"
                    name="supplierCode"
                  >
                    <Input
                      id="supplierCode"
                      label="Supplier Code"
                      variant="outlined"
                      value={supplierCode}
                      onChange={(e) => {
                        setSupplierCode(e.target.value)
                      }}
                    />
                  </Form.Item>
                </div>
              </div> */}

              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Supplier Name</label>
                <div className="controls">
                  <Form.Item
                    // label="Supplier Name"
                    name="supplierName"
                  >
                    <Input
                      id="supplierName"
                      label="Supplier Name"
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

              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Active</label>
                <div className="controls">
                  <Form.Item
                  // label="Active"
                  >
                    <Select style={{ width: "100%" }} value={active} onChange={(value) => setActive(value)}>
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

            </div>
          </Form>

        </div>
      </section>


      <div className="line-gap"></div>

      <section id="page-content" className="mt-5">
        <div className="ml-10 mr-10">

          <BBLTableList
            columns={SupplierColumns}
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

supplierListsByBuyerCode.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}