import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router'
import { connect } from 'react-redux';
import Link from "next/link";
import { Descriptions, Switch, Button, Checkbox, Breadcrumb } from 'antd';
import {
  CheckCircleOutlined, DownOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import _ from "lodash";

import TableBlue from "../components/TableBlue";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";

import { B2PAPI } from "../../context/api";


export default function buyerDetail(props) {
  const { showLoading, hideLoading, showAlertDialog, getStorage } = useContext(StoreContext);
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const router = useRouter()
  const userData = getStorage("userData");

  const [swicthDefault, setSwicthDefault] = useState("")

  const [id, setId] = useState("")

  const [actionHistory, setActionHistory] = useState([])
  const [onActionHistory, setOnActionHistory] = useState(false)
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);

  const [branchProfileList, setBranchProfileList] = useState([])
  const [totalRecordBranch, setTotalRecordBranch] = useState(0);
  const [pageBranch, setPageBranch] = useState(1);
  const [pageBranchSize, setPageBranchSize] = useState(10);

  const [note, setNote] = useState("")

  const [paymentInfo, setPaymentInfo] = useState([])
  const [status, setStatus] = useState("")

  const [dataPaymentMethod, setdataPaymentMethod] = useState([])
  const [dataPOGR, setDataPOGR] = useState([])
  const [dataMatching, setDataMatching] = useState([])

  const [userPicture, setUserPicture] = useState(null);

  const [data, setData] = useState([])

  useEffect(async () => {
    await context.setBranchDetailId("")
    const buyerId = context.buyerDetailId
    if (!buyerId) {
      showLoading("Loading")
      window.history.back()
    } else {
      showLoading("Loading")
      setId(buyerId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/buyer/profile', {
        "buyerCode": buyerId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        intiialData(dataDetail.data)
        // console.log(dataDetail);
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
  }, [])

  const intiialData = (dataApi) => {
    setData(dataApi)

    setStatus(_.get(dataApi, 'statusCode', ""))
    setPaymentInfo(_.get(dataApi, 'paymentInfo', ""))

    const branch = _.get(dataApi, "branchList", []).map((bran, index) => ({ no: index + 1, ...bran }));
    setBranchProfileList(branch)
    setTotalRecordBranch(branch.length);


    const actionHis = _.get(dataApi, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
    setActionHistory(actionHis)
    setTotalRecordAction(actionHis.length);

    setUserPicture(_.get(dataApi, 'buyerLogo', ""))

    setdataPaymentMethod([
      { key: 'directCredit', paymentService: 'Direct Credit', select: _.get(dataApi, 'directCredit', '') },
      { key: 'smartSameDay', paymentService: 'SMART Same Day', select: _.get(dataApi, 'smartSameDay', '') },
      { key: 'smartNextDay', paymentService: 'SMART Next Day', select: _.get(dataApi, 'smartNextDay', '') },
      { key: 'promtpaySameDay', paymentService: 'Promtpay Same Day', select: _.get(dataApi, 'promtpaySameDay', '') },
      { key: 'promtpayNextDay', paymentService: 'Promtpay Next Day', select: _.get(dataApi, 'promtpayNextDay', '') },
      { key: 'bathnet', paymentService: 'BAHTNET', select: _.get(dataApi, 'bathnet', '') },
    ])

    setDataPOGR([
      { key: 'poSupplierRequiredFlag', process: 'Require Supplier Approve PO', check: _.get(dataApi, 'poSupplierRequiredFlag', "") },
      { key: 'grSupplierRequiredFlag', process: 'Require Supplier Approve GR', check: _.get(dataApi, 'grSupplierRequiredFlag', "") },
      { key: 'autoGrantGRFlag', process: 'Allow Supplier Match PO with GR', check: _.get(dataApi, 'autoGrantGRFlag', "") },
    ])

    setDataMatching([
      { key: 'actionTwoWayFlag', matching: 'Require 2 Way Matching', check: _.get(dataApi, 'actionTwoWayFlag', "") },
      { key: 'forceMatchedTwoWayFlag', matching: 'Require 2 Way Force Match', check: _.get(dataApi, 'forceMatchedTwoWayFlag', "") },
      { key: 'forceMatchedThreeWayFlag', matching: 'Require 3 Way Force Match', check: _.get(dataApi, 'forceMatchedThreeWayFlag', "") },
      { key: 'approveMatchedThreeWayFlag', matching: 'Require Approve 3 Way Matching', check: _.get(dataApi, 'approveMatchedThreeWayFlag', "") },
    ])


    hideLoading()
  }

  const onChangePageBranch = (pagination, filters, sorter, extra) => {
    setPageBranch(pagination.current);
    setPageBranchSize(pagination.pageSize);
  };

  const onChangePageActionHis = (pagination, filters, sorter, extra) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };


  const dataSource = paymentInfo;

  const columnsPaymentMethod = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: '20%',
      align: 'center',
      render: (text, record, index) => (
        <p> {index + 1} </p>
      ),
    },
    {
      title: 'Payment Service',
      dataIndex: 'paymentService',
      key: 'paymentService',
      width: '60%',
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      // align: 'center',
      render: (text, record, index) => (
        _.get(dataPaymentMethod[index], 'select', '') || 'Not Registered'
      )
    }
  ];

  const columnsPOGR = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: '20%',
      align: 'center',
      render: (text, record, index) => (
        <p> {index + 1} </p>
      ),
    },
    {
      title: 'PO and GR Process',
      dataIndex: 'process',
      key: 'process',
      width: '50%',
      // align: 'center',
    },
    {
      title: 'Setup On-chain',
      dataIndex: 'setupOnChain',
      key: 'setupOnChain',
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          defaultChecked={_.get(dataPOGR[index], 'check', false)}
          disabled={true}
          onChange={(e) => {
            _.set(dataPOGR[index], 'check', e.target.checked)
          }}
        />
      )
    }
  ];

  const columnsMatching = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      width: '20%',
      align: 'center',
      render: (text, record, index) => (
        <p> {index + 1} </p>
      ),
    },
    {
      title: 'Matching Process',
      dataIndex: 'matching',
      key: 'matching',
      width: '50%',
      // align: 'center',
    },
    {
      title: 'Setup On-chain',
      dataIndex: 'setupOnChain',
      key: 'setupOnChain',
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          defaultChecked={_.get(dataMatching[index], 'check', false)}
          disabled={true}
          onChange={(e) => {
            _.set(dataMatching[index], 'check', e.target.checked)
          }}
        />
      )
    }
  ];

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: '10%',
      align: 'center',
      className: "header-table-blue",
      render: (text, record, index) => (
        <div >
          {index + 1}
        </div>
      ),
    },
    {
      title: 'Account No.',
      dataIndex: 'accountNo',
      key: 'AccountNo',
      // align: 'center',
      className: "header-table-blue"
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'AccountName',
      className: "header-table-blue"
    },
    {
      title: 'Default',
      dataIndex: 'default',
      key: 'default',
      className: "header-table-blue",
      render: (text, record, index) => (
        <Switch
          key={index}
          switchKey={index}
          disabled
          defaultChecked={_.get(paymentInfo[index], 'isDefault', "")}
        />
      ),
    }
  ];

  const columnsBranchProfile = [
    {
      title: 'No.',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      width: '10%',
      className: "header-table-blue",
    },
    {
      title: 'Branch Code',
      dataIndex: 'buyerBranchCode',
      key: 'buyerBranchCode',
      align: 'center',
      className: "header-table-blue",
      render: (text, record, index) => (
        text == _.get(data, 'buyerBranchCode', "-") ?
          <span>{text}</span>
          :
          <a
            className="btn-text blue"
            onClick={async () => {
              // console.log(record);
              showLoading("Loading")
              await context.setBranchDetailId(record.buyerBranchCode)
              await context.setBuyerDetailId(record.buyerCompCode)
              Router.push({
                pathname: "/profile/branchDetail",
              });
            }}
          // href="/profile/branchDetail"
          >
            {text}
          </a >
      ),
    },
    {
      title: 'Branch Name',
      dataIndex: 'buyerBranchName',
      key: 'buyerBranchName',
      className: "header-table-blue"
    },
    {
      title: 'VAT Branch Code',
      dataIndex: 'vatBranchCode',
      key: 'vatBranchCode',
      className: "header-table-blue",
      render: (text, record, index) => (
        <div >
          {text === "" ? ("-") : (text)}
        </div>
      ),
    },
    {
      title: 'Create Date',
      dataIndex: 'createDate',
      key: 'createDate',
      align: 'center',
      className: "header-table-blue"
    },
    {
      title: 'Active',
      dataIndex: 'isActive',
      key: 'isActive',
      align: 'center',
      className: "header-table-blue",
      render: (text, record, index) => (
        <div>
          {text == true ?
            <CheckCircleOutlined style={{ fontSize: '18px', color: '#1BAA6E' }} />
            :
            <CloseCircleOutlined style={{ fontSize: '18px', color: '#C12C20' }} />
          }
        </div>
      )
    }
  ];

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
      align: 'center',
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
                <a href='/profile/buyerLists/'>
                  Buyer Lists
                </a>
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">
                Buyer Profile Detail
              </Breadcrumb.Item>
            </Breadcrumb>

          </div>

          <div className="row ml-3 mt-3">
            <div>
              {userPicture ?
                // <div id="logo" className="col-2 px-0">
                <img
                  src={`data:image/png;base64,${userPicture}`}
                  // className="border-img mr-3"
                  style={{
                    width: "180px",
                    height: "auto"
                  }}
                />
                // </div>
                :
                ""
              }
            </div>

            <div className="row col-9">
              <div className="col-7">
                <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                  Buyer Detail
                </h5>

                {/* {_.get(data, 'buyerLegalName', "") ?
                  <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                    <Descriptions.Item label="Buyer Legal Name">
                      <div style={{ marginRight: "12%" }}> : </div>
                      {_.get(data, 'buyerLegalName', "-")}
                    </Descriptions.Item>
                  </Descriptions>
                  : ""} */}

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Buyer Code">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompCode', "-") ?
                      _.get(data, 'buyerCompCode', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Company Type">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'isMainCompany', "-") == true ? "Main Company" : "Sub Company"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Financing">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'isFinancing', "-") == true ? "Yes" : "No"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="CompCode for iCash">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompCodeiCash', "-") ?
                      _.get(data, 'buyerCompCodeiCash', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="CompCode for iSupply">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompCodeiSupply', "-") ?
                      _.get(data, 'buyerCompCodeiSupply', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                {/* --------- Setup Payment Method --------------- */}
                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="iCash Customer Type">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'isPreAuthorize', "-") == true ? "Pre-Authorize" : "Non-Authorize"}
                  </Descriptions.Item>
                </Descriptions>
                {/*   --------- End ---------------- */}

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Payment Validation Type">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'prePaymentValidationTypeDesc', "-") ?
                      _.get(data, 'prePaymentValidationTypeDesc', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Buyer Name (TH)">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompNameTH', "-") ?
                      _.get(data, 'buyerCompNameTH', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Buyer Name (EN)">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompNameEN', "-") ?
                      _.get(data, 'buyerCompNameEN', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Tax ID">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerTaxId', "-") ?
                      _.get(data, 'buyerTaxId', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Branch Code">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerBranchCode', "-") ?
                      _.get(data, 'buyerBranchCode', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Branch Name">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerBranchName', "-") ?
                      _.get(data, 'buyerBranchName', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="VAT Branch Code">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'vatBranchCode', "-") ?
                      _.get(data, 'vatBranchCode', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="VAT Branch Name">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'vatBranchName', "-") ?
                      _.get(data, 'vatBranchName', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Address Detail">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'addressDetail', "-") ?
                      _.get(data, 'addressDetail', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Province">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'province', "-") ?
                      _.get(data, 'province', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="District">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'district', '-') ?
                      _.get(data, 'district', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Sub District">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'subDistrict', '-') ?
                      _.get(data, 'subDistrict', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Postcode">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'postcode', '-') ?
                      _.get(data, 'postcode', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Company Status">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'isActive', '-') == true ?
                      "Active" : "Inactive"}
                  </Descriptions.Item>
                </Descriptions>

              </div>

              <div className="col-1" />

              <div className="col-4">
                <h5 style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                  Contact Person
                </h5>

                <Descriptions colon={false} labelStyle={{ width: "100%" }}>
                  <Descriptions.Item style={{ fontWeight: "bolder" }}>
                    {_.get(data, 'contactInfo[0].name', "-") ?
                      _.get(data, 'contactInfo[0].name', "-") : "-"}
                  </Descriptions.Item >
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                  <Descriptions.Item label="Email">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'contactInfo[0].email', "-") ?
                      _.get(data, 'contactInfo[0].email', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                  <Descriptions.Item label="Mobile no.">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'contactInfo[0].mobileTelNo', "-") ?
                      _.get(data, 'contactInfo[0].mobileTelNo', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                  <Descriptions.Item label="Office Tel no.">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'contactInfo[0].officeTelNo', "-") ?
                      _.get(data, 'contactInfo[0].officeTelNo', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                  <Descriptions.Item label="Fax no.">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'contactInfo[0].fax', "-") ?
                      _.get(data, 'contactInfo[0].fax', "-") : "-"}
                  </Descriptions.Item>
                </Descriptions>


                {_.get(data, 'contactInfo[1].name', "")
                  || _.get(data, 'contactInfo[1].email', "")
                  || _.get(data, 'contactInfo[1].mobileTelNo', "")
                  || _.get(data, 'contactInfo[1].officeTelNo', "") ?

                  <div>
                    <Descriptions className="mt-3" colon={false} labelStyle={{ width: "100%" }}>
                      <Descriptions.Item style={{ fontWeight: "bolder" }}>
                        {_.get(data, 'contactInfo[1].name', "-") ?
                          _.get(data, 'contactInfo[1].name', "-") : "-"}
                      </Descriptions.Item >
                    </Descriptions>

                    <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                      <Descriptions.Item label="Email">
                        <div style={{ marginRight: "12%" }}> : </div>
                        {_.get(data, 'contactInfo[1].email', "-") ?
                          _.get(data, 'contactInfo[1].email', "-") : "-"}
                      </Descriptions.Item>
                    </Descriptions>

                    <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                      <Descriptions.Item label="Mobile no.">
                        <div style={{ marginRight: "12%" }}> : </div>
                        {_.get(data, 'contactInfo[1].mobileTelNo', "-") ?
                          _.get(data, 'contactInfo[1].mobileTelNo', "-") : "-"}
                      </Descriptions.Item>
                    </Descriptions>

                    <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                      <Descriptions.Item label="Office Tel no.">
                        <div style={{ marginRight: "12%" }}> : </div>
                        {_.get(data, 'contactInfo[1].officeTelNo', "-") ?
                          _.get(data, 'contactInfo[1].officeTelNo', "-") : "-"}
                      </Descriptions.Item>
                    </Descriptions>


                    <Descriptions colon={false} labelStyle={{ width: "40%" }}>
                      <Descriptions.Item label="Fax no.">
                        <div style={{ marginRight: "12%" }}> : </div>
                        {_.get(data, 'contactInfo[1].fax', "-") ?
                          _.get(data, 'contactInfo[1].fax', "-") : "-"}
                      </Descriptions.Item>
                    </Descriptions>

                  </div>
                  :
                  ""
                }

              </div>
            </div>
          </div>

          {/* --------- Setup Payment Method --------------- */}
          <hr className="line" />

          <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
            Setup Payment Method
          </h5>

          <div className="mb-5">
            <TableBlue
              pagination={false}
              showPagination={false}
              scroll={{ y: 200 }}
              columns={columnsPaymentMethod}
              dataSource={dataPaymentMethod}
            />
          </div>
          {/*   --------- End ---------------- */}

          <hr className="line" />

          <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
            Setup Document Process
          </h5>

          <div className="mb-5">
            <TableBlue
              pagination={false}
              showPagination={false}
              scroll={{ y: 200 }}
              columns={columnsPOGR}
              dataSource={dataPOGR}
            />
          </div>
          <div className="mb-10">
            <TableBlue
              pagination={false}
              showPagination={false}
              scroll={{ y: 200 }}
              columns={columnsMatching}
              dataSource={dataMatching}
            />
          </div>


          <hr className="line" />


          <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
            Buyer Payment Information
          </h5>

          <div className="mb-10">
            <TableBlue
              pagination={false}
              showPagination={false}
              scroll={{ y: 200 }}
              dataSource={dataSource}
              columns={columns}
            />
          </div>

          <div className="row justify-content-between mt-5">

            <h5 className="ml-3" style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
              Buyer Branch Lists
            </h5>

            {(context.isAllow("P6101", ["BRANCH_CREATE_EDIT"]) &&
              (_.get(userData, 'companyCode', '') == _.get(data, 'buyerCompCode', ''))) &&
              <Button
                className="btn btn-blue mr-4"
                shape="round"
                onClick={() => {
                  showLoading("Loading")
                  Router.push({
                    pathname: `/profile/addBuyerBranchProfile`,
                  })
                }}
              >
                Create
              </Button>
            }

          </div>

          <div className="mt-3 mb-10">
            <TableBlue
              scroll={{ y: 200 }}
              dataSource={branchProfileList}
              columns={columnsBranchProfile}
              total={totalRecordBranch}
              onChange={onChangePageBranch}
              current={pageBranch}
              pageSize={pageBranchSize}
              showPagination={true}
            />
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
          {/* <hr className="line-blue mt-10" /> */}


          <div className="row justify-content-md-center">
            <Button
              className="btn btn-blue-transparent"
              shape="round"
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

buyerDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}