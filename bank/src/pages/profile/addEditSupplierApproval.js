import React, { useState, useEffect, useRef, useContext } from "react";
import Router, { useRouter } from "next/router";
import _, { get } from "lodash";

import { StoreContext } from "../../context/store";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

// ======================= UI ===========================
import Layout from "../components/layout";
import { Form, Button, Modal, Result, Switch, Breadcrumb, Input, Radio, Upload, Select, Table } from "antd";
import DialogConfirm from "@/shared/components/DialogConfirm";

// ===================== API ===========================
import { B2PAPI } from "../../context/api";

export default function addEditSupplierApproval() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const { Option } = Select;
  const { TextArea } = Input;

  const router = useRouter();
  const [mode, setMode] = useState("add");
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [flagPath, setFlagPath] = useState(false); // ----- variable for flag to show path of breadcrumb ----
  const [flagSupplierOn, setFlagSupplierOn] = useState(false); // ----- variable for flag to identify supplier On Chain ----

  // ====================== Modal =========================
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const handleConfirmModalClose = () => setShowConfirmCard(false);
  const handleConfirmModalShow = () => setShowConfirmCard(true);

  // =================== Form ===================
  const [form] = Form.useForm();
  const [supplierForm, setSupplierForm] = useState({
    isActive: true,
    supplierWHTType: "Juristic",
  });
  const [validateCont2, setValidateCont2] = useState(false);

  // =============== Dropdown ===============
  const [legalNameList, setLegalNameList] = useState([]);

  useEffect(async () => {
    const id = _.get(router, "query.id", "");
    setId(id);
    const flagPath = _.get(router, "query.flagPath", false) == "true" ? true : false;
    setFlagPath(flagPath);
    const flagSupplierOnChain = _.get(router, "query.flagSupplierOn", false) == "true" ? true : false;
    setFlagSupplierOn(flagSupplierOnChain);

    initialForm();
    await initialData(id);
  }, []);

  const initialForm = async () => {
    try {
      const resLegalName = await AppApi.getApi("p2p/api/v1/legalName", {}, { method: "get", authorized: true });
      if (resLegalName && resLegalName.status == 200) {
        setLegalNameList(_.get(resLegalName, "data", []));
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(resLegalName, "data.error", "Error !"),
          text: _.get(resLegalName, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
    }
  };

  const initialData = async (id) => {
    showLoading();
    let mode = "add";
    setMode(mode);

    let status = "";
    if (_.get(router.query, "status", "")) {
      status = _.get(router.query, "status", ""); // ----- have status when is supplier approval -----
      setStatus(status);
    }

    if (id !== "" && id !== undefined) {
      mode = "edit";
      setMode(mode);

      try {
        if (status !== "") {
          // --------------- process view supplier profile approval -----------
          const supplierApprvDetailRes = await AppApi.getApi("p2p/api/v1/view/supplier/profile/waitingApproval", { id: id }, { method: "post", authorized: true });
          if (supplierApprvDetailRes && supplierApprvDetailRes.status == 200) {
            setSupplierForm(supplierApprvDetailRes.data);
            form.setFieldsValue(supplierApprvDetailRes.data);
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(supplierApprvDetailRes, "data.error", "Error !"),
              text: _.get(supplierApprvDetailRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } else {
          // --------------- process view supplier profile [On Chain] -----------
          const supplierDetailRes = await AppApi.getApi("p2p/api/v1/view/supplier/profile", { supplierCode: id }, { method: "post", authorized: true });
          if (supplierDetailRes && supplierDetailRes.status == 200) {
            setSupplierForm(supplierDetailRes.data);
            form.setFieldsValue(supplierDetailRes.data);
            setStatus(_.get(supplierDetailRes.data, "statusCode", ""));
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(supplierDetailRes, "data.error", "Error !"),
              text: _.get(supplierDetailRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    } else {
      hideLoading();
    }
  };

  const validateBeforeSave = () => {
    if (_.get(supplierForm, "contactInfo", []).length > 1) {
      // -------- this process for validate contact info of person 2 -----------
      if (
        _.get(supplierForm, "contactInfo.1.name", "") == "" ||
        _.get(supplierForm, "contactInfo.1.email", "") == "" ||
        _.get(supplierForm, "contactInfo.1.mobileTelNo", "") == "" ||
        _.get(supplierForm, "contactInfo.1.officeTelNo", "") == ""
      ) {
        setValidateCont2(true);
        return;
      }
    }
    setValidateCont2(false);
    if (mode == "add") {
      setConfirmMessage("Please confirm to Create this Supplier Profile.");
    } else {
      setConfirmMessage("Please confirm to Edit this Supplier Profile.");
    }

    handleConfirmModalShow();
    // setShowConfirmCard(true);
  };

  const onFinish = async () => {
    showLoading();
    const contactList = [];
    _.forEach(_.get(supplierForm, "contactInfo", []), (value) => {
      contactList.push(JSON.stringify(value));
    });

    const data = {
      supplierLegalName: _.get(supplierForm, "supplierLegalName", ""),
      supplierCompNameTH: _.get(supplierForm, "supplierCompNameTH", ""),
      supplierCompNameEN: _.get(supplierForm, "supplierCompNameEN", ""),
      supplierTaxId: _.get(supplierForm, "supplierTaxId", ""),
      // supplierBranchCode: _.get(supplierForm, 'supplierBranchCode', ''),
      supplierBranchName: _.get(supplierForm, "supplierBranchName", ""),
      supplierWHTType: _.get(supplierForm, "supplierWHTType", "Juristic"),
      supplierEmail1: _.get(supplierForm, "supplierEmail1", ""),
      addressDetail: _.get(supplierForm, "addressDetail", ""),
      province: _.get(supplierForm, "province", ""),
      district: _.get(supplierForm, "district", ""),
      subDistrict: _.get(supplierForm, "subDistrict", ""),
      postcode: _.get(supplierForm, "postcode", ""),
      isActive: _.get(supplierForm, "isActive", true),
      contactInfo: _.join(contactList, ","),
    };

    if (_.get(supplierForm, "supplierVatBranchCode", "")) {
      _.set(data, "supplierVatBranchCode", _.get(supplierForm, "supplierVatBranchCode"));
    }
    if (_.get(supplierForm, "supplierVatBranchName", "")) {
      _.set(data, "supplierVatBranchName", _.get(supplierForm, "supplierVatBranchName"));
    }
    if (_.get(supplierForm, "supplierEmail2", "")) {
      _.set(data, "supplierEmail2", _.get(supplierForm, "supplierEmail2"));
    }
    if (_.get(supplierForm, "supplierEmail3", "")) {
      _.set(data, "supplierEmail3", _.get(supplierForm, "supplierEmail3"));
    }

    if (id !== "" && mode == "edit") {
      status == "PFK08" || status == "PFS08" || status == "PFK09" ? _.set(data, "supplierCompCode", _.get(supplierForm, "supplierCompCode", "")) : _.set(data, "id", Number(id));
    }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (id !== null && mode == "edit") {
      try {
        if (status == "PFK03" || status == "PFS05") {
          // ----------------- Edit Supplier Approval Profile proposal ------------------- \\
          const editSupplierPropoRes = await AppApi.getApi("p2p/api/v1/edit/supplier/profile/proposal", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });

          if (editSupplierPropoRes && editSupplierPropoRes.status == 200) {
            hideLoading();
            showAlertDialog({
              text: editSupplierPropoRes.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
              routerLink: "/profile/supplierApprovalLists",
            });
            // setShowSuccessCard(true);
            // setSuccessMessage(_.get(editSupplierPropoRes.data, "message"));
            // const timeOut = setTimeout(() => {
            //   showLoading();
            //   Router.push({
            //     pathname: "/profile/supplierApprovalLists",
            //   });
            //   clearTimeout(timeOut);
            // }, 4000);
          } else {
            showAlertDialog({
              title: _.get(editSupplierPropoRes, "data.error", "Error !"),
              text: _.get(editSupplierPropoRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
            hideLoading();
          }
        } else {
          // ----------------- Edit Supplier Profile [On Chain]------------------- \\
          const editSupplierRes = await AppApi.getApi("p2p/api/v1/edit/supplier/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
          if (editSupplierRes && editSupplierRes.status == 200) {
            hideLoading();
            showAlertDialog({
              text: editSupplierRes.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
              routerLink: flagSupplierOn ? "/profile/supplierLists" : "/profile/supplierApprovalLists",
            });
          } else {
            showAlertDialog({
              title: _.get(editSupplierRes, "data.error", "Error !"),
              text: _.get(editSupplierRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
            hideLoading();
          }
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    } else {
      try {
        // ------------------ Create Supplier Approval Profile ------------------ \\
        const createSupplierRes = await AppApi.getApi("p2p/api/v1/create/supplier/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
        if (createSupplierRes && createSupplierRes.status == 200) {
          hideLoading();
          showAlertDialog({
            text: createSupplierRes.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: "/profile/supplierApprovalLists",
          });
          
        } else {
          showAlertDialog({
            title: _.get(createSupplierRes, "data.error", "Error !"),
            text: _.get(createSupplierRes, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
          hideLoading();
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    }
  };

  // const footerConfirm = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       shape="round"
  //       onClick={() => {
  //         onFinish();
  //         setShowConfirmCard(false);
  //       }}
  //     >
  //       Confirm
  //     </Button>
  //     <Button
  //       className="btn btn-orange"
  //       shape="round"
  //       onClick={() => {
  //         setShowConfirmCard(false);
  //       }}
  //     >
  //       Close
  //     </Button>
  //   </div>
  // );

  const onChangeContactInfo = (index, name, value) => {
    let contactInfoList = [..._.get(supplierForm, "contactInfo", [])];
    if (value == "") {
      // ------- this process for delete object that value equal "" ----------------
      contactInfoList[index] = _.omit(contactInfoList[index], name);
      if (_.isEmpty(contactInfoList[index])) {
        contactInfoList.splice(index, 1);
      }
    } else {
      contactInfoList[index] = { ...contactInfoList[index], [name]: value };
    }
    // console.log(contactInfoList);
    setSupplierForm({ ...supplierForm, contactInfo: contactInfoList });
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-7">
        <div>
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Supplier Profile</Breadcrumb.Item>
              {flagPath && (
                <Breadcrumb.Item>
                  {flagSupplierOn && mode == "edit" ? (
                    <a href="/profile/supplierLists/">Supplier Lists</a> // ----------- Breadcrumb of supplier profile -----------
                  ) : (
                    <a href="/profile/supplierApprovalLists/">Supplier Profile Approval Lists</a>
                  )}
                </Breadcrumb.Item>
              )}

              {mode === "edit" ? (
                <Breadcrumb.Item className="breadcrumb-item active">Edit Supplier Profile</Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item className="breadcrumb-item active">Create Supplier Profile</Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>

          {/* -------------------- Confirm Dialog -------------- */}

          {/* <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
            <div className="mt-1">
              <p className="text-center" style={{ fontWeight: "500", fontSize: "17px" }}>
                {confirmMessage}
              </p>
            </div>
          </Modal> */}

          <DialogConfirm
            visible={showConfirmCard}
            closable={false}
            onFinish={() => {
              onFinish();
              handleConfirmModalClose();
            }}
            onClose={() => {
              handleConfirmModalClose();
            }}
          >
            {confirmMessage}
          </DialogConfirm>

          <Form form={form} layout="vertical" initialValues={supplierForm} onFinish={validateBeforeSave} scrollToFirstError={{ behavior: "smooth", block: "center", inline: "center" }}>
            <div className="row justify-content-between">
              <div
                className="mb-4"
                style={{
                  width: "100%",
                  height: "auto",
                  background: "#f7f7f7",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: "#333333",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    marginLeft: "1%",
                    display: "table-cell",
                    height: "40px",
                  }}
                >
                  <div className="ml-3">Supplier Profile</div>
                </div>
              </div>

              <Form.Item
                label="Supplier Legal Name"
                name="supplierLegalName"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Supplier Legal Name",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Select
                  className="mb-3"
                  disabled={mode == "edit" && flagSupplierOn}
                  value={_.get(supplierForm, "supplierLegalName", "")}
                  onChange={(value) => {
                    setSupplierForm({ ...supplierForm, supplierLegalName: value });
                  }}
                  placeholder="-- Please Select --"
                >
                  <Option hidden key="" value="">
                    -- Please Select --
                  </Option>
                  {legalNameList.map((item) => (
                    <Option key={item.id} value={item.legalName}>
                      {item.legalName}
                    </Option>
                  ))}
                </Select>

                {/* <Input
                  className="mb-3"
                  // error={buyerCodeErr ? !buyerCode : false}
                  // required
                  id="buyerLegalName"
                  // disabled
                  // label={<div>Buyer Code </div>}
                  variant="outlined"
                  defaultValue={buyerLegalName}
                  value={buyerLegalName}
                  onChange={(e) => {
                    setBuyerLegalName(e.target.value)
                    // setBuyerCodeErr(true)
                  }}
                  style={{ width: "100%" }}
                /> */}
              </Form.Item>

              <Form.Item
                label="Supplier Name (TH)"
                name="supplierCompNameTH"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Supplier Name (TH)",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
                      } else if (!new RegExp("^[\u0E00-\u0E7F0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in Thai Language");
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
                  value={_.get(supplierForm, "supplierCompNameTH", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierCompNameTH: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Supplier Name (EN)"
                name="supplierCompNameEN"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Supplier Name (EN)",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
                      } else if (!new RegExp("^[A-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
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
                  value={_.get(supplierForm, "supplierCompNameEN", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierCompNameEN: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Tax ID"
                name="supplierTaxId"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Tax ID",
                  },
                  {
                    len: 13,
                    message: "Please enter a valid number 13 digit",
                  },
                  {
                    pattern: new RegExp("^[0-9]+$"),
                    message: "Please enter a valid number",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  maxLength="13"
                  value={_.get(supplierForm, "supplierTaxId", "")}
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierTaxId: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              {/* <Form.Item
                label="Branch Code"
                name="supplierBranchCode"
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Branch Code',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <Input
                  className="mb-3"
                  disabled={mode == 'edit' && status == ''}
                  value={_.get(supplierForm, 'supplierBranchCode', '')}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierBranchCode: e.target.value });
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item> */}

              <Form.Item
                label="Branch Name"
                name="supplierBranchName"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Branch Name",
                  },
                  {
                    validator: (rule, value) => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
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
                  value={_.get(supplierForm, "supplierBranchName", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierBranchName: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Vat Branch Code"
                name="supplierVatBranchCode"
                style={{ width: "100%" }}
                rules={[
                  {
                    len: 5,
                    message: "Please enter a valid number 5 digit",
                  },
                  {
                    pattern: new RegExp("^[0-9]+$"),
                    message: "Please enter a valid number",
                  },
                ]}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "supplierVatBranchCode", "")}
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierVatBranchCode: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Vat Branch Name"
                name="supplierVatBranchName"
                style={{ width: "100%" }}
                rules={[
                  {
                    validator: (rule, value) => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "supplierVatBranchName", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierVatBranchName: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="WHT Type"
                rules={[
                  {
                    required: true,
                    message: "Please fill in WHT Type",
                  },
                ]}
                name="supplierWHTType"
                style={{ width: "100%" }}
              >
                <Radio.Group
                  value={_.get(supplierForm, "supplierWHTType", "Juristic")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierWHTType: e.target.value });
                  }}
                >
                  <Radio value="Juristic">Juristic</Radio>
                  <Radio value="Individual">Individual</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Address Detail"
                name="addressDetail"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Address Detail",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <TextArea
                  className="mb-3"
                  rows={3}
                  value={_.get(supplierForm, "addressDetail", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, addressDetail: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Province"
                name="province"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Province",
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "province", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, province: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="District"
                name="district"
                rules={[
                  {
                    required: true,
                    message: "Please fill in District",
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "district", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, district: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Sub district"
                name="subDistrict"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Sub district",
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "subdistrict", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, subDistrict: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Post code"
                name="postcode"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Post code",
                  },
                  {
                    pattern: new RegExp("^[0-9]+$"),
                    message: "Please enter a valid number",
                  },
                  {
                    min: 5,
                    message: "Pleas enter a valid number 5 digit",
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  maxLength={5}
                  value={_.get(supplierForm, "postcode", "")}
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, postcode: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Supplier Email 1"
                name="supplierEmail1"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Supplier Email 1",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else if (!new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("Invalid email format");
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
                  value={_.get(supplierForm, "supplierEmail1", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierEmail1: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Supplier Email 2"
                rules={[
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else if (!new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("Invalid email format");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                name="supplierEmail2"
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "supplierEmail2", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierEmail2: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Supplier Email 3"
                rules={[
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else if (!new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("Invalid email format");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                name="supplierEmail3"
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "supplierEmail3", "")}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, supplierEmail3: e.target.value });
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Company Status"
                name="isActive"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Company Status",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Radio.Group
                  value={_.get(supplierForm, "isActive", true)}
                  onChange={(e) => {
                    setSupplierForm({ ...supplierForm, isActive: e.target.value });
                  }}
                >
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>Inactive</Radio>
                </Radio.Group>
              </Form.Item>

              <div
                className="mt-3 mb-3"
                style={{
                  width: "100%",
                  height: "auto",
                  background: "#f7f7f7",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: "#333333",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    marginLeft: "1%",
                    display: "table-cell",
                    height: "40px",
                  }}
                >
                  <div className="ml-3">Contact Person</div>
                </div>
              </div>

              <div
                style={{
                  border: "2px solid #a7a5a5",
                  padding: "2%",
                  borderRadius: "25px",
                  width: "100%",
                  marginTop: "2%",
                  marginBottom: "2%",
                }}
              >
                <div
                  style={{
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
                      textAlign: "center",
                    }}
                  >
                    Person 1
                  </div>
                </div>

                <Form.Item
                  label="Name"
                  name={["contactInfo", 0, "name"]}
                  rules={[
                    {
                      required: true,
                      message: "Please fill in Name",
                    },
                    {
                      validator: (rule, value) => {
                        if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "") {
                          return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
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
                    value={_.get(supplierForm, "contactInfo.0.name", "")}
                    onChange={(e) => {
                      onChangeContactInfo(0, "name", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name={["contactInfo", 0, "email"]}
                  rules={[
                    {
                      required: true,
                      message: "Please fill in Email",
                    },
                    {
                      validator: (rule, value = "") => {
                        if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "") {
                          return Promise.reject("Please fill in English Language");
                        } else if (!new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(value) && value !== "") {
                          return Promise.reject("Invalid email format");
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
                    value={_.get(supplierForm, "contactInfo.0.email", "")}
                    onChange={(e) => {
                      onChangeContactInfo(0, "email", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile No."
                  name={["contactInfo", 0, "mobileTelNo"]}
                  rules={[
                    {
                      required: true,
                      message: "Please fill in Mobile No.",
                    },
                    {
                      pattern: new RegExp("^[0-9]+$"),
                      message: "Please enter a valid number",
                    },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    onKeyDown={(e) => {
                      if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                        return e.preventDefault();
                      }
                    }}
                    // label={<div>Mobile No. <span className="text-danger">*</span></div>}
                    value={_.get(supplierForm, "contactInfo.0.mobileTelNo", "")}
                    onChange={(e) => {
                      onChangeContactInfo(0, "mobileTelNo", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Office Tel No."
                  name={["contactInfo", 0, "officeTelNo"]}
                  rules={[
                    {
                      required: true,
                      message: "Please fill in Office Tel No.",
                    },
                    // {
                    //   pattern: new RegExp("^[0-9]+$"),
                    //   message: "Please enter a valid number",
                    // },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    // onKeyDown={(e) => {
                    //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    //     return e.preventDefault();
                    //   }
                    // }}
                    value={_.get(supplierForm, "contactInfo.0.officeTelNo", "")}
                    onChange={(e) => {
                      onChangeContactInfo(0, "officeTelNo", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Fax No."
                  name={["contactInfo", 0, "fax"]}
                  // rules={[
                  //   {
                  //     pattern: new RegExp("^[0-9]+$"),
                  //     message: "Please enter a valid number",
                  //   },
                  // ]}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    // onKeyDown={(e) => {
                    //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    //     return e.preventDefault();
                    //   }
                    // }}
                    // label={<div>Fax No. <span className="text-danger">*</span></div>}
                    value={_.get(supplierForm, "contactInfo.0.fax", "")}
                    onChange={(e) => {
                      onChangeContactInfo(0, "fax", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>

              <div
                style={{
                  border: "2px solid #a7a5a5",
                  padding: "2%",
                  borderRadius: "25px",
                  width: "100%",
                  marginTop: "2%",
                  marginBottom: "2%",
                }}
              >
                <div
                  style={{
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
                      textAlign: "center",
                    }}
                  >
                    Person 2
                  </div>
                </div>

                <Form.Item
                  label="Name"
                  name={["contactInfo", 1, "name"]}
                  help={
                    validateCont2 && _.get(supplierForm, "contactInfo.1.name", "") == ""
                      ? "Please fill in Name"
                      : !new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(_.get(supplierForm, "contactInfo.1.name")) &&
                        "The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space"
                  }
                  validateStatus={
                    (validateCont2 && _.get(supplierForm, "contactInfo.1.name", "") == "") ||
                    (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(_.get(supplierForm, "contactInfo.1.name")) && "error")
                  }
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    label="Name"
                    value={_.get(supplierForm, "contactInfo.1.name", "")}
                    onChange={(e) => {
                      onChangeContactInfo(1, "name", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Email"
                  name={["contactInfo", 1, "email"]}
                  style={{ width: "100%" }}
                  rules={[
                    {
                      type: "email",
                      message: "Invalid email format",
                    },
                  ]}
                  help={
                    validateCont2 && _.get(supplierForm, "contactInfo.1.email", "") == ""
                      ? "Please fill in Email"
                      : !new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(_.get(supplierForm, "contactInfo.1.email")) && _.get(supplierForm, "contactInfo.1.email", "") !== ""
                      ? "Please fill in English Language"
                      : !new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(_.get(supplierForm, "contactInfo.1.email")) &&
                        _.get(supplierForm, "contactInfo.1.email", "") !== ""
                      ? "Invalid email format"
                      : null
                  }
                  validateStatus={
                    ((validateCont2 && _.get(supplierForm, "contactInfo.1.email", "") == "") ||
                      (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(_.get(supplierForm, "contactInfo.1.email")) && _.get(supplierForm, "contactInfo.1.email", "") !== "") ||
                      (!new RegExp("^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$").test(_.get(supplierForm, "contactInfo.1.email")) &&
                        _.get(supplierForm, "contactInfo.1.email", "") !== "")) &&
                    "error"
                  }
                >
                  <Input
                    className="mb-3"
                    label="Email"
                    value={_.get(supplierForm, "contactInfo.1.email", "")}
                    onChange={(e) => {
                      onChangeContactInfo(1, "email", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Mobile No."
                  name={["contactInfo", 1, "mobileTelNo"]}
                  help={
                    validateCont2 && _.get(supplierForm, "contactInfo.1.mobileTelNo", "") == ""
                      ? "Please fill in Mobile No."
                      : !new RegExp("^[0-9]+$").test(_.get(supplierForm, "contactInfo.1.mobileTelNo", "")) &&
                        _.get(supplierForm, "contactInfo.1.mobileTelNo", "") !== "" &&
                        "Please enter a valid number"
                  }
                  validateStatus={
                    ((validateCont2 && _.get(supplierForm, "contactInfo.1.mobileTelNo", "") == "") ||
                      (!new RegExp("^[0-9]+$").test(_.get(supplierForm, "contactInfo.1.mobileTelNo", "")) && _.get(supplierForm, "contactInfo.1.mobileTelNo", "") !== "")) &&
                    "error"
                  }
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    onKeyDown={(e) => {
                      if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                        return e.preventDefault();
                      }
                    }}
                    label="Mobile No."
                    value={_.get(supplierForm, "contactInfo.1.mobileTelNo", "")}
                    onChange={(e) => {
                      onChangeContactInfo(1, "mobileTelNo", e.target.value);
                      // setMobileNo2(e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Office Tel No."
                  name={["contactInfo", 1, "officeTelNo"]}
                  help={
                    validateCont2 && _.get(supplierForm, "contactInfo.1.officeTelNo", "") == "" && "Please fill in Office Tel No."
                    // : !new RegExp("^[0-9]+$").test(_.get(supplierForm, "contactInfo.1.officeTelNo", "")) &&
                    //   _.get(supplierForm, "contactInfo.1.officeTelNo", "") !== "" &&
                    //   "Please enter a valid number"
                  }
                  validateStatus={validateCont2 && _.get(supplierForm, "contactInfo.1.officeTelNo", "") == "" && "error"}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    // onKeyDown={(e) => {
                    //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    //     return e.preventDefault();
                    //   }
                    // }}
                    value={_.get(supplierForm, "contactInfo.1.officeTelNo", "")}
                    onChange={(e) => {
                      onChangeContactInfo(1, "officeTelNo", e.target.value);
                      // setOfficeTelNo2(e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  label="Fax No."
                  name={["contactInfo", 1, "fax"]}
                  style={{ width: "100%" }}
                  // rules={[
                  //   {
                  //     pattern: new RegExp("^[0-9]+$"),
                  //     message: "Please enter a valid number",
                  //   },
                  // ]}
                >
                  <Input
                    // onKeyDown={(e) => {
                    //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    //     return e.preventDefault();
                    //   }
                    // }}
                    className="mb-3"
                    value={_.get(supplierForm, "contactInfo.1.fax", "")}
                    onChange={(e) => {
                      onChangeContactInfo(1, "fax", e.target.value);
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              </div>
            </div>

            <div className="row justify-content-md-center mt-3 mb-3">
              {(mode == "add" ? isAllow("P6203", ["CREATE"]) || isAllow("P6201", ["CREATE"]) : isAllow("P6203", ["EDIT"])) && (
                <Button className="btn btn-blue mr-2" shape="round" htmlType="submit">
                  Submit
                </Button>
              )}
              <Button
                className="btn btn-blue-transparent mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  Router.push({
                    pathname: flagSupplierOn && mode == "edit" ? "/profile/supplierLists" : "/profile/supplierApprovalLists",
                  });
                }}
              >
                Back
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

addEditSupplierApproval.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
