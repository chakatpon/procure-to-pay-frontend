import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router'
import { connect } from 'react-redux';
import { Descriptions, Button, Select, Input, Modal, Result, Table, Breadcrumb, Form } from 'antd';
import Icon, { DownOutlined } from '@ant-design/icons';
import _ from 'lodash';

import TableBlue from "../components/TableBlue";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";

import { B2PAPI } from "../../context/api";



export default function branchDetail(props) {
  const { showLoading, hideLoading, showAlertDialog, getStorage } = useContext(StoreContext);
  const context = useContext(StoreContext)
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select
  const userData = getStorage("userData");

  const [status, setStatus] = useState("")

  const [actionHistory, setActionHistory] = useState([])
  const [onActionHistory, setOnActionHistory] = useState(false)
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);

  const [data, setData] = useState([])


  useEffect(async () => {
    const branchId = context.branchDetailId
    const buyerId = context.buyerDetailId
    // console.log(buyerId);
    // console.log(branchId);
    if (!branchId || !buyerId) {
      showLoading("Loading")
      window.history.back()
    } else {
      showLoading("Loading")
      const dataDetail = await AppApi.getApi('/p2p/api/v1/view/buyer/branch/profile', {
        "buyerCode": buyerId,
        "buyerBranchCode": branchId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        // console.log(dataDetail.data);
        intiialData(dataDetail.data)
      } else {
        hideLoading()

        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setErrorCrad(true)
        // setErrorMessage(_.get(dataDetail, 'data.message',
        //   'Something went wrong, Please contact administrator to resolve the issue.'))
        // const timeOut = setTimeout(() => {
        //   showLoading("Loading")
        //   Router.push({
        //     pathname: '/profile/buyerDetail',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
    }
  }, [])


  const intiialData = (dataApi) => {
    setStatus(_.get(dataApi, 'statusCode', ""))

    const actionHis = _.get(dataApi, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
    setActionHistory(_.get(dataApi, 'historyList', ""))
    setTotalRecordAction(actionHis.length);

    setData(dataApi)

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
                Buyer Branch Detail
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* <Modal
            title=" "
            footer={[]}
            visible={errorCard}
            closable={false}
            onOk={() => {
              setErrorCrad(false)
              // showLoading("Loading")
              // Router.push({
              //   pathname: '/profile/buyerDetail',
              // });
            }}
          // onCancel={() => {
          //   setErrorCrad(false)
          //   showLoading("Loading")
          //   Router.push({
          //     pathname: '/profile/buyerDetail',
          //   });
          // }}
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

          <div className="row ml-3 mt-5">
            <div>
              {/* <img
                                src='/assets/image/toyota-logo.png' className="border-img mr-3"
                                style={{ width: "180px", height: "auto" }}
                            /> */}
            </div>

            <div className="row col-9">
              <div className="col-7">
                <h5 style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                  Buyer Branch Detail
                </h5>

                <Descriptions colon={false} labelStyle={{ width: "50%" }}>
                  <Descriptions.Item label="Buyer Code">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'buyerCompCode', "-") ?
                      _.get(data, 'buyerCompCode', "-") : "-"}
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
                  <Descriptions.Item label="Financing">
                    <div style={{ marginRight: "12%" }}> : </div>
                    {_.get(data, 'isFinancing', "-") !== true ? "Yes" : "No"}
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
                    {_.get(data, 'isActive', "-") == true ? "Active" : "Inactive"}
                  </Descriptions.Item>
                </Descriptions>

              </div>

              <div className="col-1" />

              <div className="col-4">
                <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
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


          <hr className="line" />


          <div className="mb-10">
            <Button
              shape="round btn btn-blue-transparent"
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

branchDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
