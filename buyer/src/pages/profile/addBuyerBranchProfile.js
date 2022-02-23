import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router'
import { connect } from 'react-redux';
import { Form, Button, Modal, Radio, Result, Breadcrumb, Input, Select, Table } from 'antd';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import DialogConfirm from "@/shared/components/DialogConfirm";

import { B2PAPI } from "../../context/api";


export default function addBuyerBranchProfile(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const context = useContext(StoreContext)
  const router = useRouter()
  const AppApi = B2PAPI(StoreContext);
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const [mode, setMode] = useState("Create")
  const [editPerposal, setEditPerposal] = useState(false)
  const [id, setId] = useState("")
  const [status, setStatus] = useState("")
  const [initialDataForm, setInitialDataForm] = useState({
    companyStatus: "1",
  });

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

  const [branchCodeErr, setBranchCodeErr] = useState("")

  useEffect(async () => {
    const branchId = context.branchDetailId
    const buyerId = context.buyerDetailId

    if (!branchId && !buyerId) {
      window.location.replace('/profile/buyerLists/');
    }
    // console.log(branchId);
    // console.log(buyerId);

    if (branchId && buyerId) {
      setMode("Edit")
      const dataDetail = await AppApi.getApi('/p2p/api/v1/view/buyer/branch/profile', {
        "buyerCode": buyerId,
        "buyerBranchCode": branchId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        // console.log(dataDetail.data);
        initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
    else if (buyerId) {
      const dataDetail = await AppApi.getApi('/p2p/api/v1/view/buyer/profile', {
        "buyerCode": buyerId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        setId(buyerId)
        // console.log(dataDetail.data)
        initialDataCreate(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
    else if (branchId) {
      const dataDetail = await AppApi.getApi('/p2p/api/v1/view/buyer/branch/profile/waitingApproval', {
        "id": branchId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        setId(branchId)
        // console.log(dataDetail.data);
        setMode("Edit")

        initialData(dataDetail.data)
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

  const initialDataCreate = (data) => {
    const buyerDetail = {
      buyerCode: _.get(data, 'buyerCompCode', ''),
      compCodeforiCash: _.get(data, 'buyerCompCodeiCash', ""),
      buyerCompCodeiSupply: _.get(data, 'buyerCompCodeiSupply', ""),
      buyerNameTH: _.get(data, 'buyerCompNameTH', ""),
      buyerNameEN: _.get(data, 'buyerCompNameEN', ""),

    }

    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    hideLoading();
  }

  const initialData = async (data) => { // data is dataBuyer

    // if (_.get(data, 'status', '') === "PFB03" ||
    //     _.get(data, 'status', '') === "PFB04") {

    setStatus(_.get(data, 'statusCode', ""))

    if (_.get(data, 'statusCode', "") == "PFB11") {
      setEditPerposal(true)
    }

    const buyerDetail = {
      buyerCode: _.get(data, 'buyerCompCode', ''),
      compCodeforiCash: _.get(data, 'buyerCompCodeiCash', ""),
      buyerCompCodeiSupply: _.get(data, 'buyerCompCodeiSupply', ""),
      buyerNameTH: _.get(data, 'buyerCompNameTH', ""),
      buyerNameEN: _.get(data, 'buyerCompNameEN', ""),

      taxID: _.get(data, 'buyerTaxId', ""),
      branchCode: _.get(data, 'buyerBranchCode', ""),
      branchName: _.get(data, 'buyerBranchName', ""),
      vatBranchCode: _.get(data, 'vatBranchCode', ""),
      vatBranchName: _.get(data, 'vatBranchName', ""),
      financing: _.get(data, 'isFinancing', "") == true ? "1" : "2",
      addressDetail: _.get(data, 'addressDetail', ""),
      subdistrict: _.get(data, 'subDistrict', ""),
      district: _.get(data, 'district', ""),
      province: _.get(data, 'province', ""),
      postcode: _.get(data, 'postcode', ""),
      companyStatus: _.get(data, 'isActive', "") == true ? "1" : "2",
      name1: _.get(data, 'contactInfo[0].name', ""),
      email1: _.get(data, 'contactInfo[0].email', ""),
      mobileNo1: _.get(data, 'contactInfo[0].mobileTelNo', ""),
      officeTelNo1: _.get(data, 'contactInfo[0].officeTelNo', ""),
      faxNo1: _.get(data, 'contactInfo[0].fax', ""),
      name2: _.get(data, 'contactInfo[1].name', ""),
      email2: _.get(data, 'contactInfo[1].email', ""),
      mobileNo2: _.get(data, 'contactInfo[1].mobileTelNo', ""),
      officeTelNo2: _.get(data, 'contactInfo[1].officeTelNo', ""),
      faxNo2: _.get(data, 'contactInfo[1].fax', "")
    }

    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    // } else {
    //     const buyerDetail = {
    //         buyerCode: _.get(data, 'buyerCompCode', ''),
    //         compCodeforiCash: _.get(data, 'buyerCompCodeiCash', ""),
    //         buyerCompCodeiSupply: _.get(data, 'buyerCompCodeiSupply', ""),
    //         buyerNameTH: _.get(data, 'buyerCompNameTH', ""),
    //         buyerNameEN: _.get(data, 'buyerCompNameEN', ""),

    //     }

    //     setInitialDataForm(buyerDetail)
    //     form.setFieldsValue(buyerDetail);

    // }

    hideLoading();
  }

  const onFinish = async () => {
    showLoading("Loading")

    const contactInfo = []
    if (_.get(initialDataForm, 'name2', '') !== "" &&
      _.get(initialDataForm, 'email2', '') !== "" &&
      _.get(initialDataForm, 'mobileNo2', '') !== "" &&
      _.get(initialDataForm, 'officeTelNo2', '') !== "") {
      contactInfo.push({
        name: _.get(initialDataForm, 'name1', ''),
        email: _.get(initialDataForm, 'email1', ''),
        mobileTelNo: _.get(initialDataForm, 'mobileNo1', ''),
        officeTelNo: _.get(initialDataForm, 'officeTelNo1', ''),
        fax: _.get(initialDataForm, 'faxNo1', ''),
      },
        {
          name: _.get(initialDataForm, 'name2', ''),
          email: _.get(initialDataForm, 'email2', ''),
          mobileTelNo: _.get(initialDataForm, 'mobileNo2', ''),
          officeTelNo: _.get(initialDataForm, 'officeTelNo2', ''),
          fax: _.get(initialDataForm, 'faxNo2', '')
        })
    } else {
      contactInfo.push({
        name: _.get(initialDataForm, 'name1', ''),
        email: _.get(initialDataForm, 'email1', ''),
        mobileTelNo: _.get(initialDataForm, 'mobileNo1', ''),
        officeTelNo: _.get(initialDataForm, 'officeTelNo1', ''),
        fax: _.get(initialDataForm, 'faxNo1', ''),
      }
      )
    }

    const contactList = []
    _.forEach(contactInfo, (value) => {
      // console.log(value);
      contactList.push(JSON.stringify(value));
    });

    // const test = JSON.stringify(contactInfo);

    const data = {
      buyerCompCode: _.get(initialDataForm, 'buyerCode', ''),
      // buyerCompCodeiCash: _.get(initialDataForm, 'compCodeforiCash', '') ,
      // buyerCompCodeiSupply: _.get(initialDataForm, 'buyerCompCodeiSupply', '') ,
      // buyerCompNameTH: _.get(initialDataForm, 'buyerNameTH', '') ,
      // buyerCompNameEN: _.get(initialDataForm, 'buyerNameEN', '') ,
      buyerTaxId: _.get(initialDataForm, 'taxID', ''),
      buyerBranchCode: _.get(initialDataForm, 'branchCode', ''),
      buyerBranchName: _.get(initialDataForm, 'branchName', ''),
      // paymentCondition:  _.get(initialDataForm, 'paymentCondition', '') ,
      addressDetail: _.get(initialDataForm, 'addressDetail', ''),
      province: _.get(initialDataForm, 'province', ''),
      district: _.get(initialDataForm, 'district', ''),
      subDistrict: _.get(initialDataForm, 'subdistrict', ''),
      postcode: _.get(initialDataForm, 'postcode', ''),
      isActive: _.get(initialDataForm, 'companyStatus', '') == "2" ? false : true,

      contactInfo: _.join(contactList, ','),

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
      // console.log("create");
      const addApi = await AppApi.getApi('/p2p/api/v1/create/buyer/branch/profile', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (addApi) {
        if (addApi.status == 200) {
          hideLoading()

          showAlertDialog({
            text: addApi.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: '/profile/branchApprovalLists'
          })

          // setMessageApi(addApi.data.message)
          // setShowSuccessCard(true);
          // const timeOut = setTimeout(() => {
          //   Router.push({
          //     pathname: '/profile/branchApprovalLists',
          //   });
          //   clearTimeout(timeOut);
          // }, 4000);
        }
        else if (addApi.data.message == "Company code is already in use. ") {
          hideLoading()
          setBranchCodeErr("Branch Code is already exist.")
          onFinishFailed()
        }
        else {
          hideLoading();

          showAlertDialog({
            text: addApi.data.message,
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: true,
          })

          // setMessageApi(addApi.data.message)
          // setShowErrorCard(true)
        }
      } else {
        hideLoading();

        showAlertDialog({
          text: addApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setMessageApi(addApi.data.message)
        // setShowErrorCard(true)
      }
    } else if (mode === "Edit" && status == "PFB11") {
      const addApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/branch/profile/proposal', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (addApi) {
        if (addApi.status == 200) {
          hideLoading();

          showAlertDialog({
            text: addApi.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: '/profile/branchApprovalLists'
          })

          // setMessageApi(addApi.data.message)
          // setShowSuccessCard(true);
          // const timeOut = setTimeout(() => {
          //   Router.push({
          //     pathname: '/profile/branchApprovalLists',
          //   });
          //   clearTimeout(timeOut);
          // }, 4000)
        }
        else if (addApi.data.message == "Company code is already in use. ") {
          hideLoading();
          setBranchCodeErr("Branch Code is already exist.")
          onFinishFailed()
        }
        else {
          hideLoading();

          showAlertDialog({
            text: addApi.data.message,
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: true,
          })

          // setMessageApi(addApi.data.message)
          // setShowErrorCard(true)
        }
      } else {
        hideLoading();

        showAlertDialog({
          text: addApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setMessageApi(addApi.data.message)
        // setShowErrorCard(true)
      }
    } else if (mode === "Edit" && (status == "PFB09" || status == "PFB08")) {
      // console.log("edit");
      const addApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/branch/profile', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (addApi) {
        if (addApi.status == 200) {
          hideLoading();

          showAlertDialog({
            text: addApi.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: '/profile/branchApprovalLists'
          })

          // setMessageApi(addApi.data.message)
          // setShowSuccessCard(true);
          // const timeOut = setTimeout(() => {
          //   Router.push({
          //     pathname: '/profile/branchApprovalLists',
          //   });
          //   clearTimeout(timeOut);
          // }, 4000);
        }
        else if (addApi.data.message == "Company code is already in use. ") {
          hideLoading();
          setBranchCodeErr("Branch Code is already exist.")
          onFinishFailed()
        }
        else {
          hideLoading();

          showAlertDialog({
            text: addApi.data.message,
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: true,
          })

          // setMessageApi(addApi.data.message)
          // setShowErrorCard(true)
        }
      } else {
        hideLoading();

        showAlertDialog({
          text: addApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setMessageApi(addApi.data.message)
        // setShowErrorCard(true)
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
    <div className="row justify-content-md-center">
      <div className="col-7">

        <div className="row bbl-font mt-3 mb-3">
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="breadcrumb-item">
              Profile
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item">
              Buyer Profile
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item">
              <a href='/profile/buyerLists/' >
                Buyer Profile Lists &nbsp;
              </a>
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item active">
              {mode} New Buyer Branch Profile
            </Breadcrumb.Item>
          </Breadcrumb>

        </div>

        {/* <Modal
          title=" "
          visible={showConfirmCard}
          // onOk={() => {
          //     console.log("ok Confirm " + id)
          //     setShowConfirmCard(false)
          //     setShowSuccessCard(true)
          // }}
          onCancel={() => {
            setShowConfirmCard(false)
          }}
          footer={[]}
          closable={false}
        >
          <div className="mt-1">
            <p className="text-center" style={{ fontSize: "17px", fontWeight: "500" }}>
              Please confirm to {mode} Branch Profile
            </p>
            <div className="row justify-content-md-center mt-5">
              <Button
                className="btn btn-blue mr-3"
                shape="round"
                onClick={() => {
                  // console.log(`ok Confirm ${id}`)
                  onFinish()
                  showLoading("Loading")
                  setShowConfirmCard(false)
                }}
              >
                Confirm
              </Button>
              <Button
                className="btn btn-orange"
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
            // console.log("ok success")
            setShowSuccessCard(false)
          }}
        // onCancel={() => {
        //     setShowSuccessCard(false)
        // }}
        >
          <Result
            status="success"
            title={
              messageApi
              // <p>
              //   {mode} new Branch Profile Successfully.
              // </p>
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
              messageApi
              // <p>
              //   {mode} this Buyer Branch Profile Something went wrong.
              // </p>
            }
          />
        </Modal> */}

        <DialogConfirm
          visible={approveConfirmModalShow}
          closable={false}
          onFinish={() => {
            onFinish();
            handleApproveConfirmModalClose(false);
          }}
          onClose={() => { handleApproveConfirmModalClose() }}
        >
          Please confirm to {mode} Branch Profile
        </DialogConfirm>

        <Form
          form={form}
          name="basic"
          layout="vertical"
          initialValues={initialDataForm}
          onFinish={() => handleApproveConfirmModalShow()}
          onFinishFailed={onFinishFailed}
        >

          <div className="row justify-content-between">

            <div
              className="mb-4"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Buyer Profile
                </div>
              </div>
            </div>


            <Form.Item
              // label="Company Legal Name"
              label="Buyer Code"
              name="buyerCode"
              // defaultValue={buyerCode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Buyer Code',
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerCodeErr ? !buyerCode : false}
                // required
                id="buyerCode"
                disabled
                // label={<div>Buyer Code </div>}
                variant="outlined"
                // value={buyerCode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerCode: e.target.value });
                  // setBuyerCode(e.target.value)
                  // setBuyerCodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="CompCode for iCash"
              name="compCodeforiCash"
              // defaultValue={compCodeforiCash}
              rules={[
                {
                  required: true,
                  message: 'Please fill in CompCode for iCash',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={compCodeforiCashErr ? !compCodeforiCash : false}
                // required
                id="compCodeforiCash"
                disabled
                // label={<div>CompCode for iCash </div>}
                variant="outlined"
                // value={compCodeforiCash}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, compCodeforiCash: e.target.value });
                  // setCompCodeforiCash(e.target.value)
                  // setCompCodeforiCashErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="CompCode for iSupply"
              name="buyerCompCodeiSupply"
              // defaultValue={buyerCompCodeiSupply}
              // rules={[
              //     {
              //         required: true,
              //         message: 'Please fill in CompCode for iSupply',
              //     },
              // ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={buyerCompCodeiSupplyErr ? !buyerCompCodeiSupply : false}
                // required
                id="buyerCompCodeiSupply"
                maxLength="6"
                disabled
                // label={<div>CompCode for iSupply </div>}
                variant="outlined"
                // value={buyerCompCodeiSupply}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerCompCodeiSupply: e.target.value });
                  // setbuyerCompCodeiSupply(e.target.value)
                  // setbuyerCompCodeiSupplyErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="BuyerName (TH)"
              name="buyerNameTH"
              // defaultValue={buyerNameTH}
              rules={[
                {
                  required: true,
                  message: 'Please fill in BuyerName (TH)',
                },
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== '' && value !== undefined
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[\u0E00-\u0E7F0-9-().\\s]+$').test(value) && value !== '' && value !== undefined) {
                      return Promise.reject('Please fill in Thai Language');
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                // {
                //   pattern: new RegExp("^[ก-ฮะ-์]+$"),
                //   message: "Please Fill in Thai Langauge"
                // }
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerNameTHErr ? !buyerNameTH : false}
                // required
                id="buyerNameTH"
                disabled
                // label={<div>Buyer Name (TH)</div>}
                variant="outlined"
                // value={buyerNameTH}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerNameTH: e.target.value });
                  // setBuyerNameTH(e.target.value)
                  // setBuyerNameTHErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="BuyerName (EN)"
              name="buyerNameEN"
              // defaultValue={buyerNameEN}
              rules={[
                {
                  required: true,
                  message: 'Please fill in BuyerName (EN)',
                },
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[A-Za-z0-9-().\\s]+$').test(value) && value !== '') {
                      return Promise.reject('Please fill in English Language');
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerNameENErr ? !buyerNameEN : false}
                // required
                id="buyerNameEN"
                disabled
                // label={<div>Buyer Name (EN)</div>}
                variant="outlined"
                // value={buyerNameEN}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerNameEN: e.target.value });
                  // setBuyerNameEN(e.target.value)
                  // setBuyerNameENErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Tax ID"
              name="taxID"
              // defaultValue={taxID}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Tax ID',
                },
                {
                  min: 13,
                  message: 'Please enter a valid number 13 digit',
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={taxIDErr ? !taxID : false}
                // required
                id="taxID"
                maxLength="13"
                // label={<div>Tax ID <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={taxID}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, taxID: e.target.value });
                  // setTaxID(e.target.value)
                  // setTaxIDErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Branch Code"
              name="branchCode"
              // defaultValue={branchCode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Branch Code',
                },
                {
                  validator: (rule, value) => {
                    if (branchCodeErr == "Branch Code is already exist." && value !== '' && value !== undefined) {
                      return Promise.reject('Branch Code is already exist.');
                    } else {
                      return Promise.resolve();
                    }
                  }
                }
              ]}
              {...(branchCodeErr == "Branch Code is already exist." && {
                // hasFeedback: true,
                help:
                  "Branch Code is already exist.",
                validateStatus: "error",
              })}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={branchCodeErr ? !branchCode : false}
                // required
                disabled={mode === "Edit" && !editPerposal}
                id="branchCode"
                // label={<div>Branch Code <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={branchCode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, branchCode: e.target.value });
                  setBranchCodeErr("")
                  // setBranchCode(e.target.value)
                  // setBranchCodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Branch Name"
              name="branchName"
              // defaultValue={branchName}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Branch Name',
                },
                {
                  validator: (rule, value) => {
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } return Promise.resolve();
                  },
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={branchNameErr ? !branchName : false}
                // required
                // disabled={mode === "Edit" && !editPerposal}
                id="branchName"
                // label={<div>Branch Name <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={branchName}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, branchName: e.target.value });
                  // setBranchName(e.target.value)
                  // setBranchNameErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>


            <Form.Item
              label="Vat Branch Code"
              name="vatBranchCode"
              // defaultValue={vatBranchCode}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // required
                id="vatBranchCode"
                // label="Vat Branch Code"
                variant="outlined"
                // value={vatBranchCode}
                onKeyDown={(e) => {
                  if (!["0", "1", "2", "3",
                    "4", "5", "6", "7", "8",
                    "9", "Backspace", "Tab",
                    "Shift", "ArrowLeft", "ArrowRight", "Control"
                  ].includes(e.key)) {
                    return e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, vatBranchCode: e.target.value });
                  // setVatBranchCode(e.target.value)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Vat Branch Name"
              // defaultValue={vatBranchName}
              name="vatBranchName"
              style={{ width: "100%" }}
              rules={[
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                className="mb-3"
                // required
                id="vatBranchName"
                // label="Vat Branch Name"
                variant="outlined"
                // value={vatBranchName}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, vatBranchName: e.target.value });
                  // setVatBranchName(e.target.value)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>


            <Form.Item
              label="Address Detail"
              name="addressDetail"
              // defaultValue={addressDetail}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Address Detail',
                },
              ]}
              style={{ width: "100%" }}
            >
              <TextArea
                className="mb-3"
                rows={3}
                // error={addressDetailErr ? !addressDetail : false}
                // required
                id="addressDetail"
                // label={<div>Address Detail <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={addressDetail}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, addressDetail: e.target.value });
                  // setAddressDetail(e.target.value)
                  // setAddressDetailErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Province"
              name="province"
              // defaultValue={province}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Province',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={provinceErr ? !province : false}
                // required
                id="province"
                // label={<div>Province <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={province}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, province: e.target.value });
                  // setProvince(e.target.value)
                  // setProvinceErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="District"
              name="district"
              // defaultValue={district}
              rules={[
                {
                  required: true,
                  message: 'Please fill in District',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={districtErr ? !district : false}
                // required
                id="district"
                // label={<div>District <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={district}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, district: e.target.value });
                  // setDistrict(e.target.value)
                  // setDistrictErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Sub district"
              name="subdistrict"
              // defaultValue={subdistrict}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Sub district',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={subdistrictErr ? !subdistrict : false}
                // required
                id="subdistrict"
                // label={<div>Sub district <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={subdistrict}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, subdistrict: e.target.value });
                  // setSubdistrict(e.target.value)
                  // setSubdistrictErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Post code"
              name="postcode"
              // defaultValue={postcode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Post code',
                },
                {
                  min: 5,
                  message: 'Pleas enter a valid number 5 digit',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={postcodeErr ? !postcode : false}
                // required
                id="postcode"
                // label={<div>Post code <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={postcode}
                maxLength="5"
                onKeyDown={(e) => {
                  if (!["0", "1", "2", "3",
                    "4", "5", "6", "7", "8",
                    "9", "Backspace", "Tab",
                    "Shift", "ArrowLeft", "ArrowRight", "Control"
                  ].includes(e.key)) {
                    return e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, postcode: e.target.value });
                  // setPostcode(e.target.value)
                  // setPostcodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Company Status"
              name="companyStatus"
              // defaultValue={companyStatus}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Company Status'
                }
              ]}
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={companyStatus}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, companyStatus: e.target.value });
                  // console.log(e.target.value);
                  // setCompanyStatus(e.target.value)
                  // setCompanyStatusErr(true)
                }}
              >
                <Radio value="1">Active</Radio>
                <Radio value="2">Inactive</Radio>
              </Radio.Group>
            </Form.Item>


            {/* <Form.Item
                label="Buyer Logo"
                className="mb-3"
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Buyer Logo',
                  },
                ]}
                style={{ width: '100%' }}
              > */}

            <div
              className="mt-3 mb-3"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Contact Person
                </div>
              </div>
            </div>

            <div style={{
              border: "2px solid #a7a5a5",
              padding: "2%",
              borderRadius: "25px",
              width: "100%",
              marginTop: "2%",
              marginBottom: "2%",
            }}>
              <div style={{
                width: "13%",
                borderRadius: "8px",
                border: "2px solid #a7a5a5",
                background: "#a7a5a5",
                marginTop: "-4%",
                marginBottom: "2%",
              }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>
                  Person 1
                </div>
              </div>

              <Form.Item
                label="Name"
                name="name1"
                // defaultValue={name1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Name',
                  },
                  {
                    validator: (rule, value) => {
                      // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                      if (
                        !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                        value !== ''
                      ) {
                        return Promise.reject(
                          'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                        );
                      } return Promise.resolve();
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={name1Err ? !name1 : false}
                  // required
                  id="name1"
                  variant="outlined"
                  // value={name1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, name1: e.target.value });
                    // setName1(e.target.value)
                    // setName1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>


              <Form.Item
                label="Email"
                name="email1"
                // defaultValue={email1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Email',
                  },
                  {
                    validator: (rule, value = '') => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                        && value !== '') {
                        return Promise.reject('Please fill in English Language');
                      } else if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                        return Promise.reject('Invalid email format');
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="email1"
                  // label={<div>Email <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={email1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, email1: e.target.value });
                    // setEmail1(e.target.value)
                    // setEmail1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Mobile No."
                name="mobileNo1"
                // defaultValue={mobileNo1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Mobile No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={mobileNo1Err ? !mobileNo1 : false}
                  // required
                  id="mobileNo1"
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3",
                      "4", "5", "6", "7", "8",
                      "9", "Backspace", "Tab",
                      "Shift", "ArrowLeft", "ArrowRight", "Control"
                    ].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  // label={<div>Mobile No. <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={mobileNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, mobileNo1: e.target.value });
                    // setMobileNo1(e.target.value)
                    // setMobileNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Office Tel No."
                name="officeTelNo1"
                // defaultValue={officeTelNo1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Office Tel No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={officeTelNo1Err ? !officeTelNo1 : false}
                  // required
                  id="officeTelNo1"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  // label={<div>Office Tel No. <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={officeTelNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, officeTelNo1: e.target.value });
                    // setOfficeTelNo1(e.target.value)
                    // setOfficeTelNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Fax No."
                name="faxNo1"
                // defaultValue={faxNo1}
                // rules={[
                //   {
                //     required: true,
                //     message: 'Please fill in Fax No.',
                //   },
                // ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={faxNo1Err ? !faxNo1 : false}
                  // required
                  id="faxNo1"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  // label={<div>Fax No. <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={faxNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, faxNo1: e.target.value });
                    // setFaxNo1(e.target.value)
                    // setFaxNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>



            <div style={{
              border: "2px solid #a7a5a5",
              padding: "2%",
              borderRadius: "25px",
              width: "100%",
              marginTop: "2%",
              marginBottom: "2%",
            }}>
              <div style={{
                width: "13%",
                borderRadius: "8px",
                border: "2px solid #a7a5a5",
                background: "#a7a5a5",
                marginTop: "-4%",
                marginBottom: "2%",
              }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>
                  Person 2
                </div>
              </div>

              <Form.Item
                label="Name"
                name="name2"
                // defaultValue={name2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Name',
                  },
                  {
                    validator: (rule, value) => {
                      // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                      if (
                        !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                        value !== ''
                      ) {
                        return Promise.reject(
                          'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                        );
                      } return Promise.resolve();
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="name2"
                  label="Name"
                  variant="outlined"
                  // value={name2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, name2: e.target.value });
                    // setName2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>


              <Form.Item
                label="Email"
                name="email2"
                // defaultValue={email2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Email',
                  },
                  {
                    validator: (rule, value = '') => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                        && value !== '') {
                        return Promise.reject('Please fill in English Language');
                      } else if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                        return Promise.reject('Invalid email format');
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="email2"
                  label="Email"
                  variant="outlined"
                  // value={email2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, email2: e.target.value });
                    // setEmail2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Mobile No."
                name="mobileNo2"
                // defaultValue={mobileNo2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Mobile No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="mobileNo2"
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3",
                      "4", "5", "6", "7", "8",
                      "9", "Backspace", "Tab",
                      "Shift", "ArrowLeft", "ArrowRight", "Control"
                    ].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  label="Mobile No."
                  variant="outlined"
                  // value={mobileNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, mobileNo2: e.target.value });
                    // setMobileNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Office Tel No."
                name="officeTelNo2"
                // defaultValue={officeTelNo2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Office Tel No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="officeTelNo2"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  label="Office Tel No."
                  variant="outlined"
                  // value={officeTelNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, officeTelNo2: e.target.value });
                    // setOfficeTelNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Fax No."
                name="faxNo2"
                // defaultValue={faxNo2}
                style={{ width: "100%" }}
              >
                <Input
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  className="mb-3"
                  // required
                  id="faxNo2"
                  label="Fax No."
                  variant="outlined"
                  // value={faxNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, faxNo2: e.target.value });
                    // setFaxNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>

          </div>

          <div className="row justify-content-md-center mt-3 mb-3">
            <Button
              className="btn btn-blue"
              shape="round"
              htmlType="submit"
            // onClick={() => { checkEmailFormat() }}
            >
              Submit
            </Button>

            <Button
              className="btn btn-blue-transparent ml-2"
              shape="round"
              onClick={() => {
                showLoading("Loading")
                window.history.back()
              }}
            >
              Back
            </Button>
          </div>

        </Form>

      </div>
    </div>
  )
}

addBuyerBranchProfile.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
