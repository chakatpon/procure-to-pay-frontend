import React, { useState, useEffect, useRef, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { connect } from 'react-redux';
import { Form, Button, Modal, Result, AutoComplete, Breadcrumb, Input, Radio, Select } from 'antd';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';
import DialogConfirm from "@/shared/components/DialogConfirm";

import { B2PAPI } from "../../context/api";



export default function addEditpartnership(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const router = useRouter();
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select;
  const [form] = Form.useForm();

  const [id, setId] = useState("")
  const [buyerCode, setBuyerCode] = useState("")

  const [mode, setMode] = useState("Create")
  const [editPerposal, setEditPerposal] = useState(false)

  const [initialDataForm, setInitialDataForm] = useState({
    isActive: "1",
    isFinancing: "1"
  });

  const [supplierCode, setSupplierCode] = useState("")

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

  const [dataSupplierLists, setDataSupplierLists] = useState([])
  const [optionSupplierNameTH, setOptionSupplierNameTH] = useState([])
  const [optionSupplierNameEN, setOptionSupplierNameEN] = useState([])

  const [status, setStatus] = useState("")

  const [supplierNameErr, setSupplierNameErr] = useState("")

  useEffect(async () => {
    showLoading("Loading")
    context.setTab("2")

    if (context.buyerDetailId == "") {
      showLoading("Loading")
      Router.push({
        pathname: "/profile/buyerLists",
      });
    }

    const buyerCodeId = context.buyerDetailId
    setBuyerCode(buyerCodeId)

    await initialForm()

    if (context.supplierNameApprovalDetailId !== "" && context.partnershipStatus == "PFK11") {
      showLoading("Loading")
      // console.log(context.supplierNameApprovalDetailId);
      setEditPerposal(true)
      setMode("Edit")
      context.setTab("2")
      setId(context.supplierNameApprovalDetailId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/partnership/waitingApproval', {
        "id": context.supplierNameApprovalDetailId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        // console.log(dataDetail);
        await initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    } else if (context.supplierNameApprovalDetailId !== "" &&
      (context.partnershipStatus == "PFK08" || context.partnershipStatus == "PFK09")) {
      showLoading("Loading")
      // console.log(context.supplierNameApprovalDetailId);
      setMode("Edit")
      context.setTab("2")
      // setId(context.supplierNameApprovalDetailId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/partnership/waitingApproval', {
        "id": context.supplierNameApprovalDetailId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        // console.log(dataDetail);
        await initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    } else if (context.supplierNameDetailId !== "") {
      showLoading("Loading")
      // console.log(context.supplierNameDetailId);
      setMode("Edit")
      context.setTab("2")
      // setId(context.buyerDetailId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/partnership', {
        "buyerCode": context.buyerDetailId,
        "supplierCode": context.supplierNameDetailId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        await initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
    else {
      hideLoading()
    }
  }, []);

  const initialForm = async () => {
    showLoading("Loading")
    const supplierLists = await AppApi.getApi('p2p/api/v1/profile/supplierLists', {}, {
      method: "get", authorized: true,
    })

    if (supplierLists.status == 200) {
      setDataSupplierLists(supplierLists.data)

      const data = _.get(supplierLists, `data.items`, "")

      const valueSupplierNameTH = []
      data.map((items) => {
        valueSupplierNameTH.push({ value: items.supplierNameTH })
      })
      setOptionSupplierNameTH(valueSupplierNameTH)

      const valueSupplierNameEN = []
      data.map((items) => {
        valueSupplierNameEN.push({ value: items.supplierNameEN })
      })
      setOptionSupplierNameEN(valueSupplierNameEN)

      hideLoading()
    } else {
      hideLoading()
      showAlertDialog({
        text: supplierLists.data.message,
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: true,
      })
    }
  }


  const initialData = async (dataApi) => {

    setStatus(_.get(dataApi, 'statusCode', ""))

    const buyerDetail = {

      supplierNameTH: _.get(dataApi, 'supplierNameTH', ''),
      supplierNameEN: _.get(dataApi, 'supplierNameEN', ''),
      // extSupplierCode: _.get(dataApi, 'extSupplierCode', ''),
      paymentTerm: _.get(dataApi, 'paymentTerm', ''),

      isFinancing: _.get(dataApi, 'isFinancing', "") == true ? "1" : "2",
      isActive: _.get(dataApi, 'isActive', "") == true ? "1" : "2",

    }

    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    setSupplierCode(_.get(dataApi, 'supplierCode', ''))

    hideLoading()
  }

  const onFinish = async () => {

    showLoading("Loading")

    const data = {
      supplierNameTH: _.get(initialDataForm, 'supplierNameTH', ''),
      supplierNameEN: _.get(initialDataForm, 'supplierNameEN', ''),
      // extSupplierCode: _.get(initialDataForm, 'extSupplierCode', ''),
      paymentTerm: _.get(initialDataForm, 'paymentTerm', ''),
      isFinancing: _.get(initialDataForm, 'isFinancing', '') == "2" ? false : true,
      isActive: _.get(initialDataForm, 'isActive', '') == "2" ? false : true,
      supplierCode,
    }

    if (mode === "Create" && buyerCode !== "") {
      _.set(data, 'buyerCode', buyerCode);
    }

    if (mode === "Edit" && id !== "" && editPerposal) {
      _.set(data, 'id', id);
    }

    if (mode === "Edit" && buyerCode !== "") {
      _.set(data, 'buyerCode', buyerCode);
    }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (mode === "Create") {
      const addApi = await AppApi.getApi('/p2p/api/v1/create/partnership', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (addApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: addApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/partnershipLists'
        })

        // setMessageApi(addApi.data.message)
        // setShowSuccessCard(true);
        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/partnershipLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
      else if (addApi.data.message == "Partnership is already in use. ") {
        hideLoading()
        setSupplierNameErr("Supplier Name is already exist.")
        onFinishFailed()
      } else {
        hideLoading()

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
    else if (editPerposal) {
      const editApi = await AppApi.getApi('/p2p/api/v1/edit/partnership/proposal', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (editApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/partnershipLists'
        })

        // setMessageApi(editApi.data.message)
        // setShowSuccessCard(true);
        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/partnershipLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
      else if (editApi.data.message == "Partnership is already in use. ") {
        hideLoading()
        setSupplierNameErr("Supplier Name is already exist.")
        onFinishFailed()
      }
      else {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setMessageApi(editApi.data.message)
        // setShowErrorCard(true)
      }
    } else {
      const editApi = await AppApi.getApi('/p2p/api/v1/edit/partnership', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (editApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/partnershipLists'
        })

        // setMessageApi(editApi.data.message)
        // setShowSuccessCard(true);
        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/partnershipLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
      else if (editApi.data.message == "Partnership is already in use. ") {
        hideLoading()
        setSupplierNameErr("Supplier Name is already exist.")
        onFinishFailed()
      }
      else {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // setMessageApi(editApi.data.message)
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
  }

  const supplierNameTHChange = (e) => {
    const supplier = dataSupplierLists.items.filter((items) => items.supplierNameTH == e)
    form.setFieldsValue({
      supplierNameEN: _.get(supplier[0], 'supplierNameEN', ''),
    });
    setInitialDataForm({
      ...form.getFieldsValue(),
      supplierNameEN: _.get(supplier[0], 'supplierNameEN', ''),
    })
    setSupplierCode(supplier[0].supplierCode)
  }

  const supplierNameENChange = (e) => {
    const supplier = dataSupplierLists.items.filter((items) => items.supplierNameEN == e)
    form.setFieldsValue({
      supplierNameTH: _.get(supplier[0], 'supplierNameTH', ''),
    });
    setInitialDataForm({
      ...form.getFieldsValue(),
      supplierNameTH: _.get(supplier[0], 'supplierNameTH', ''),
    })
    setSupplierCode(supplier[0].supplierCode)
  }

  return (
    <div className="row justify-content-md-center" style={{ width: "100%" }}>
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
              <a
                onClick={() => {
                  showLoading("Loading")
                  Router.push({
                    pathname: "/profile/partnershipLists",
                  });
                }}
              // href="/profile/partnershipLists/"
              >
                Partnership Lists
              </a>
            </Breadcrumb.Item>
            {/* {mode === 'Edit' ? ( */}
            <Breadcrumb.Item className="breadcrumb-item active">
              {mode} Partnership
            </Breadcrumb.Item>
            {/* )
              :
              (
                <Breadcrumb.Item className="bbl-font-bold">
                  Create New Partnership
                </Breadcrumb.Item>
              )
            } */}
          </Breadcrumb>
        </div>

        {/* <Modal
          title=" "
          footer={[]}
          visible={showSuccessCard}
          closable={false}
          onOk={() => {
            // console.log('ok success');
            setShowSuccessCard(false);
          }}
        // onCancel={() => {
        //   setShowSuccessCard(false);
        // }}
        >
          <Result
            status="success"
            title={
              messageApi
              // mode === "Edit" ?
              //   <p>Edit Partnership Successfully.</p>
              //   :
              //   <p>Create New Partnership Successfully.</p>
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
              //   {mode} this Partnership Something went wrong.
              // </p>
            }
          />
        </Modal>

        <Modal
          title=" "
          visible={showConfirmCard}
          // onOk={() => {
          //     console.log("ok Confirm " + id)
          //     setShowConfirmCard(false)
          //     setShowSuccessCard(true)
          // }}
          onCancel={() => {
            setShowConfirmCard(false);
          }}
          footer={[]}
          closable={false}
        >
          <div className="mt-1">
            {mode === 'Edit' ? (
              <p className="text-center" style={{ fontSize: "17px", fontWeight: "500" }}>
                Please confirm to Edit this Partnership ?
              </p>
            )
              :
              (
                <p className="text-center" style={{ fontSize: "17px", fontWeight: "500" }}>
                  Please confirm to Create this Partnership ?
                </p>
              )
            }
            <div className="row justify-content-md-center mt-5">
              <Button
                className="btn btn-blue mr-3"
                shape="round"
                onClick={() => {
                  // console.log(`ok Confirm ${id}`);
                  onFinish();
                  setShowConfirmCard(false);
                  // setShowSuccessCard(true);
                }}
              >
                Confirm
              </Button>
              <Button
                className="btn btn-orange"
                shape="round"
                onClick={() => {
                  setShowConfirmCard(false);
                }}
              >
                Close
              </Button>
            </div>
          </div>
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
          Please confirm to {mode} this Partnership ?
        </DialogConfirm>

        <Form
          className="form"
          form={form}
          name="basic"
          layout="vertical"
          initialValues={initialDataForm}
          onFinish={() => handleApproveConfirmModalShow()}
          onFinishFailed={onFinishFailed}
        // scrollToFirstError={{behavior:"smooth", inline:"center", block:"center"}}
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
                  Partnership
                </div>
              </div>
            </div>


            <Form.Item
              label="Supplier Name(TH)"
              name="supplierNameTH"
              rules={[
                {
                  required: true,
                  message: 'Please fill in Supplier Name(TH)',
                },
                {
                  validator: (rule, value) => {
                    const optionDropdownTH = []
                    optionSupplierNameTH.map((option) => {
                      if (option.value.toUpperCase().indexOf(value.toUpperCase()) !== -1) {
                        optionDropdownTH.push(option.value)
                      }
                    })
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== '' && value !== undefined
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[ก-ฮะ-์0-9-().\\s]+$').test(value) && value !== '' && value !== undefined) {
                      return Promise.reject('Please fill in Thai Language');
                    } else if (optionDropdownTH.length == 0) {
                      return Promise.reject('Supplier Name(TH) is Not Found');
                    }
                    else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
              {...(supplierNameErr == "Supplier Name is already exist." && {
                // hasFeedback: true,
                help:
                  "Supplier Name is already exist.",
                validateStatus: "error",
              })}
              style={{ width: "100%" }}
            >
              <AutoComplete
                className="mb-3"
                id="supplierNameTH"
                options={_.get(initialDataForm, 'supplierNameTH', '').length > "0" ? optionSupplierNameTH : ""}
                disabled={mode === "Edit" && !editPerposal}
                variant="outlined"
                filterOption={(inputValue, option) =>
                  option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, supplierNameTH: e });
                  setSupplierNameErr("")
                }}
                onSelect={(e) => {
                  supplierNameTHChange(e)
                  setSupplierNameErr("")
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Supplier Name(EN)"
              name="supplierNameEN"
              rules={[
                {
                  required: true,
                  message: 'Please fill in Supplier Name(EN)',
                },
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    const optionDropdownEN = []
                    optionSupplierNameEN.map((option) => {
                      if (option.value.toUpperCase().indexOf(value.toUpperCase()) !== -1) {
                        optionDropdownEN.push(option.value)
                      }
                    })
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[A-Za-z-0-9().\\s]+$').test(value) && value !== '') {
                      return Promise.reject('Please fill in English Language');
                    } else if (supplierNameErr == "Supplier Name is already exist." && value !== '' && value !== undefined) {
                      return Promise.reject('Supplier Name is already exist.');
                    } else if (optionDropdownEN.length == 0) {
                      return Promise.reject('Supplier Name(EN) is Not Found');
                    }
                    else {
                      return Promise.resolve();
                    }
                  },
                },
              ]}
              {...(supplierNameErr == "Supplier Name is already exist." && {
                // hasFeedback: true,
                help:
                  "Supplier Name is already exist.",
                validateStatus: "error",
              })}
              style={{ width: "100%" }}
            >
              <AutoComplete
                className="mb-3"
                id="supplierNameEN"
                options={_.get(initialDataForm, 'supplierNameEN', '').length > "0" ? optionSupplierNameEN : ""}
                disabled={mode === "Edit" && !editPerposal}
                variant="outlined"
                filterOption={(inputValue, option) =>
                  option.value.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, supplierNameEN: e });
                  setSupplierNameErr("")
                }}
                onSelect={(e) => {
                  supplierNameENChange(e)
                  setSupplierNameErr("")
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* <Form.Item
                label="Supplier Code"
                name="extSupplierCode"
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Supplier Code',
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
                  id="extSupplierCode"
                  // disabled={mode === "Edit" && !editPerposal}
                  variant="outlined"
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, extSupplierCode: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item> */}

            <Form.Item
              label="Payment Term"
              name="paymentTerm"
              rules={[
                {
                  required: true,
                  message: 'Please fill in Payment Term',
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                id="paymentTerm"
                maxLength="3"
                // disabled={mode === "Edit" && !editPerposal}
                variant="outlined"
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
                  setInitialDataForm({ ...initialDataForm, paymentTerm: e.target.value });
                  // if (e.target.value.length == "1") {
                  //   setInitialDataForm({ ...initialDataForm, paymentTerm: `00${e.target.value}` });
                  // }
                  // else if (e.target.value.length == "2") {
                  //   setInitialDataForm({ ...initialDataForm, paymentTerm: `0${e.target.value}` });
                  // }
                  // else {
                  //   setInitialDataForm({ ...initialDataForm, paymentTerm: `${e.target.value}` });
                  // }
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>


            <Form.Item
              label="Financing"
              // defaultValue={isFinancing}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Financing',
                },
              ]}
              name="isFinancing"
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={isFinancing}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, isFinancing: e.target.value });
                  // setFinancing(e.target.value)
                  // setFinancingErr(true)
                }}
              >
                <Radio value="1">Yes</Radio>
                <Radio value="2">No</Radio>
              </Radio.Group>
            </Form.Item>



            <Form.Item
              label="Status"
              name="isActive"
              // defaultValue={isActive}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Status'
                }
              ]}
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={isActive}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, isActive: e.target.value });
                  // setCompanyStatus(e.target.value)
                  // setCompanyStatusErr(true)
                }}
              >
                <Radio value="1">Active</Radio>
                <Radio value="2">Inactive</Radio>
              </Radio.Group>
            </Form.Item>


          </div>

          <div className="row justify-content-md-center mt-3 mb-3">
            <Button
              className="btn btn-blue"
              shape="round"
              htmlType="submit"
              onClick={() => { }}
            >
              Submit
            </Button>

            <Button
              className="btn btn-blue-transparent ml-5"
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
  );
}

addEditpartnership.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}