import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router'
import { connect } from 'react-redux';
import { Form, Button, Modal, Radio, Result, Breadcrumb, Input, Select, Table, Steps, message } from 'antd';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";

import { B2PAPI } from "../../context/api";


export default function addEditInvoice(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const context = useContext(StoreContext)
  const router = useRouter()
  const AppApi = B2PAPI(StoreContext);
  const { TextArea } = Input;
  const { Option } = Select
  const [form] = Form.useForm();

  const [mode, setMode] = useState("Create")
  const [editPerposal, setEditPerposal] = useState(false)
  const [id, setId] = useState("")
  const [initialDataForm, setInitialDataForm] = useState({
    companyStatus: "1",
  });

  const [showConfirmCard, setShowConfirmCard] = useState(false)
  const [showSuccessCard, setShowSuccessCard] = useState(false)
  const [showErrorCard, setShowErrorCard] = useState(false)

  const [branchCodeErr, setBranchCodeErr] = useState("")

  const [current, setCurrent] = useState(0)

  useEffect(async () => {

    // const dataDetail = await AppApi.getApi('/p2p/api/v1/view/buyer/profile', {
    //   "buyerCode": buyerId
    // }, {
    //   method: "post", authorized: true,
    // })
    // if (dataDetail.status == 200) {
    //   setId(buyerId)
    //   initialDataCreate(dataDetail.data)
    // }

  }, [])

  const { Step } = Steps;

  const next = () => {
    setCurrent(current + 1);
  };

  const back = () => {
    setCurrent(current - 1);
  };

  const steps = [
    {
      title: 'Please Select',
      content:
        <div className="container ant-descriptions-item-content">
          <h4 className="my-10">
            <b>Please Select</b>
          </h4>

          <div className="row">
            <b className="mt-2">Customer Name</b>
            <Select
              className="ant-select ant-select-single ant-select-show-arrow ant-popover-message-title"
              placeholder="-- Please Select --"
            >
              <Select.Option
                key={"1"}
                value={"2"}
              >
                Test
              </Select.Option>
            </Select>
          </div>

          <div className="row mt-5">
            <b className="mt-2">VIN No.</b>
            <Select
              className="ant-select ant-select-single ant-select-show-arrow ant-popover-message-title"
              placeholder="-- Please Select --"
            >
              <Select.Option
                key={"1"}
                value={"2"}
              >
                Test
              </Select.Option>
            </Select>
          </div>

          <div className="row mt-5">
            <b className="mt-2">Quote No.</b>
            <Select
              className="ant-select ant-select-single ant-select-show-arrow ant-popover-message-title"
              placeholder="-- Please Select --"
            >
              <Select.Option
                key={"1"}
                value={"2"}
              >
                Test
              </Select.Option>
            </Select>
          </div>


        </div>
    },
    {
      title: 'Insert Invoice Details',
      content:
        <div>
          Hello 2
        </div>
    },
    {
      title: 'Summary',
      content:
        <div>
          Hello 3
        </div>
    },
  ];

  const initialDataCreate = (data) => {


    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    hideLoading();
  }

  const initialData = async (data) => {

    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    hideLoading();
  }

  const onFinish = async () => {
    showLoading("Loading")

    const data = {
      buyerCompCode: _.get(initialDataForm, 'buyerCode', ''),
      buyerTaxId: _.get(initialDataForm, 'taxID', '') || "",
      buyerBranchCode: _.get(initialDataForm, 'branchCode', '') || "",
      buyerBranchName: _.get(initialDataForm, 'branchName', '') || "",
      addressDetail: _.get(initialDataForm, 'addressDetail', '') || "",
      province: _.get(initialDataForm, 'province', '') || "",
      district: _.get(initialDataForm, 'district', '') || "",
      subDistrict: _.get(initialDataForm, 'subdistrict', '') || "",
      postcode: _.get(initialDataForm, 'postcode', '') || "",
      isActive: _.get(initialDataForm, 'companyStatus', '') == "1",

    }

    if (_.get(initialDataForm, 'vatBranchCode', '')) {
      _.set(data, 'vatBranchCode', _.get(initialDataForm, 'vatBranchCode', ''));
    }
    if (_.get(initialDataForm, 'vatBranchName', '')) {
      _.set(data, 'vatBranchName', _.get(initialDataForm, 'vatBranchName', ''));
    }

    if (mode === "Edit" && id !== "" && editPerposal) {
      _.set(data, 'id', id);
    }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (mode === "Create") {
      const addApi = await AppApi.getApi('/p2p/api/v1/create/buyer/branch/profile', formData, {
        'Content-Type': 'multipart/form-data',
      }, {
        method: "post", authorized: true,
      })

      if (addApi.status == 200) {
        hideLoading()
        setShowSuccessCard(true);
        const timeOut = setTimeout(() => {
          Router.push({
            pathname: '/profile/branchApprovalLists',
          });
          clearTimeout(timeOut);
        }, 4000);
      }
      else if (addApi.data.message == "Company code is already in use. ") {
        hideLoading()
        setBranchCodeErr("Branch Code is already exist.")
        onFinishFailed()
      }
      else {
        hideLoading();
        setShowErrorCard(true)
      }
    } else if (mode === "Edit" && editPerposal) {
      const addApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/branch/profile/proposal', formData, {
        'Content-Type': 'multipart/form-data',
      }, {
        method: "post", authorized: true,
      })

      if (addApi.status == 200) {
        hideLoading();
        setShowSuccessCard(true);
        const timeOut = setTimeout(() => {
          Router.push({
            pathname: '/profile/branchApprovalLists',
          });
          clearTimeout(timeOut);
        }, 4000);
      }
      else if (addApi.data.message == "Company code is already in use. ") {
        hideLoading();
        setBranchCodeErr("Branch Code is already exist.")
        onFinishFailed()
      }
      else {
        hideLoading();
        setShowErrorCard(true)
      }
    } else if (mode === "Edit" && !editPerposal) {
      const addApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/branch/profile', formData, {
        'Content-Type': 'multipart/form-data',
      }, {
        method: "post", authorized: true,
      })

      if (addApi.status == 200) {
        hideLoading();
        setShowSuccessCard(true);
        const timeOut = setTimeout(() => {
          Router.push({
            pathname: '/profile/branchApprovalLists',
          });
          clearTimeout(timeOut);
        }, 4000);
      }
      else if (addApi.data.message == "Company code is already in use. ") {
        hideLoading();
        setBranchCodeErr("Branch Code is already exist.")
        onFinishFailed()
      }
      else {
        hideLoading();
        setShowErrorCard(true)
      }
    }
  };

  const onFinishFailed = (errorInfo) => {
    const firstErrorField = document.querySelector(".ant-form-item-has-error");
    if (firstErrorField !== null) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  };

  return (
    <div className="container-fluid px-0">

      <section className="mb-8">
        <div className="container">

          <div className="row justify-content-md-center">
            <div className="col-10">

              <div id="box-header" className="col-12 mb-10">

                <Breadcrumb separator=">">
                  <Breadcrumb.Item className="breadcrumb-item">
                    Document
                  </Breadcrumb.Item>
                  <Breadcrumb.Item className="breadcrumb-item active">
                    {mode} Invoice
                  </Breadcrumb.Item>
                </Breadcrumb>

              </div>

              <Modal
                title=" "
                visible={showConfirmCard}
                onCancel={() => {
                  setShowConfirmCard(false)
                }}
                footer={[]}
                closable={false}
              >
                <div className="mt-1">
                  <p className="text-center" style={{ fontSize: "17px" }}>
                    Please comfirm to {mode} Invoice
                  </p>
                  <div className="row justify-content-md-center mt-4">
                    <Button
                      className="bbl-btn-blue mr-3"
                      shape="round"
                      onClick={() => {
                        onFinish()
                        setShowConfirmCard(false)
                      }}
                    >
                      Comfirm
                    </Button>
                    <Button
                      className="bbl-btn-orange px-4"
                      shape="round"
                      onClick={() => {
                        setShowConfirmCard(false)
                      }}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </Modal>

              <Modal
                title=" "
                footer={[]}
                visible={showSuccessCard}
                closable={false}
                onOk={() => {
                  setShowSuccessCard(false)
                }}
              >
                <Result
                  status="success"
                  title={
                    <p>
                      {mode} new Invoice Successfully.
                    </p>
                  }
                />
              </Modal>

              <Modal
                title=" "
                footer={[]}
                visible={showErrorCard}
                closable={false}
                onOk={() => {
                  // console.log("ok Error")
                  setShowErrorCard(false)
                }}
                onCancel={() => {
                  setShowErrorCard(false)
                }}
              >
                <Result
                  status="error"
                  title={
                    <p>
                      {mode} this Invoice Something went wrong.
                    </p>
                  }
                />
              </Modal>

              {/* ---------- step --------------- */}

              <div className="d-flex flex-column-fluid container col-8">
                <Steps
                  className="ant-steps ant-steps-horizontal ant-steps-label-vertical"
                  current={current}
                >
                  {steps.map((item, index) => (
                    <Step
                      className={
                        current > index ?
                          "ant-steps-item ant-steps-item-process ant-steps-item-active ant-steps-item-finish"
                          :
                          "ant-steps-item ant-steps-item-wait"
                      }
                      key={item.title} title={item.title}
                    />
                  ))}
                </Steps>
              </div>

              <div>
                {steps[current].content}
              </div>

              <div className="row justify-content-md-center mt-5">
                {current < steps.length - 1 && (
                  <div>
                    <Button className="btn btn-blue" type="primary"
                      onClick={() => next()}
                    >
                      Next
                    </Button>
                    <Button className="btn btn-orange ml-2" type="primary"
                      onClick={() => {

                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
                {current === steps.length - 1 && (
                  <div>
                    <Button className="btn btn-blue" type="primary"
                      onClick={() => message.success('Processing complete!')}
                    >
                      Submit
                    </Button>
                    <Button className="btn btn-orange ml-2" type="primary"
                      onClick={() => {

                      }}
                    >
                      Close
                    </Button>
                  </div>
                )}
                {current > 0 && (
                  <Button className="btn btn-blue-transparent ml-2"
                    onClick={() => back()}
                  >
                    Back
                  </Button>
                )}
              </div>

              {/* ---------- end --------------- */}

            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

addEditInvoice.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
