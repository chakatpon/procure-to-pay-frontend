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

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function addEditSupplierBranchProfile() {
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const { TextArea } = Input;
  const { Option } = Select;

  const [mode, setMode] = useState("add");
  const [id, setId] = useState("");
  const [flagPath, setFlagPath] = useState(false); // ---- flag path for show branch approval path ---

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
  const [flagDisableField, setFlagDisableField] = useState(false);
  const [supplierCompCode, setSupplierCompCode] = useState("");
  const [flagBranch, setFlagBranch] = useState(false); //---- flag for disable branch Code -----

  useEffect(async () => {
    const { id } = router.query;
    setId(id);
    setFlagBranch(_.get(router.query, "branch", false) == "true" ? true : false);
    setFlagPath(_.get(router.query, "flagPath", false) == "true" ? true : false);
    await initialData(id);
  }, []);

  const initialData = async (id) => {
    showLoading();
    let mode = "add";
    setMode(mode);

    if (id !== "" && id !== undefined) {
      // ----------- Edit supplier branch mode ------------
      mode = "edit";
      setMode(mode);

      if (_.get(router.query, "branch", false) == "true") {
        // ----- when edit supplier branch ID = supplierCompCode ------
        setSupplierCompCode(id);
      }

      const supplierBranchCode = _.get(router.query, "supplierBranchCode", "");

      try {
        if (supplierBranchCode !== "") {
          // -------------- View supplier Branch ------------------
          const supplierBranchDetail = await AppApi.getApi(
            "p2p/api/v1/view/supplier/branch/profile",
            { supplierCode: id, supplierBranchCode: supplierBranchCode },
            { method: "post", authorized: true }
          );
          if (supplierBranchDetail && supplierBranchDetail.status == 200) {
            // console.log(supplierBranchDetail.data);
            setSupplierForm(supplierBranchDetail.data);
            form.setFieldsValue(supplierBranchDetail.data);
            setFlagDisableField(true);
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(supplierBranchDetail, "data.error", "Error !"),
              text: _.get(supplierBranchDetail, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } else {
          // -------------- View supplier Branch waiting approval ------------------
          const branchApprovalDetail = await AppApi.getApi("p2p/api/v1/view/supplier/branch/profile/waitingApproval", { id: id }, { method: "post", authorized: true });
          if (branchApprovalDetail && branchApprovalDetail.status == 200) {
            // console.log(branchApprovalDetail.data);
            setSupplierForm(branchApprovalDetail.data);
            form.setFieldsValue(branchApprovalDetail.data);
            setFlagDisableField(true);
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(branchApprovalDetail, "data.error", "Error !"),
              text: _.get(branchApprovalDetail, "data.message", ""),
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
      const supplierNameTH = _.get(router.query, "supplierNameTH", "");
      const supplierNameEN = _.get(router.query, "supplierNameEN", "");
      const supplierCompCode = _.get(router.query, "supplierCompCode", "");
      setSupplierCompCode(supplierCompCode);
      // ----------- Create supplier branch mode ------------
      if (supplierCompCode !== "" && supplierNameTH !== "") {
        setSupplierForm({
          ...supplierForm,
          supplierCompNameTH: supplierNameTH,
          supplierCompNameEN: supplierNameEN,
        });
        form.setFieldsValue({
          ...form.getFieldValue(),
          supplierCompNameTH: supplierNameTH,
          supplierCompNameEN: supplierNameEN,
        });
        setFlagDisableField(true);
      } else {
        window.history.back();
      }
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
      setConfirmMessage("Please confirm to Create Branch Profile.");
    } else {
      setConfirmMessage("Please confirm to Edit Supplier Branch Profile.");
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

    if (supplierCompCode !== "" && supplierCompCode !== undefined) {
      _.set(data, "supplierCompCode", supplierCompCode);
    } else {
      _.set(data, "supplierCompCode", _.get(supplierForm, "supplierCompCode", ""));
    }

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

    if (id !== "" && mode == "edit" && _.get(supplierForm, "statusCode", "") != "PFS11" && _.get(supplierForm, "supplierBranchCode", "")) {
      _.set(data, "supplierBranchCode", _.get(supplierForm, "supplierBranchCode"));
    }

    if (id !== "" && mode == "edit" && _.get(supplierForm, "statusCode", "") == "PFS11") {
      //------- add ID to form data when edit supplier branch profile proposal ----------
      _.set(data, "id", Number(id));
    }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (id !== null && mode == "edit") {
      try {
        if (_.get(supplierForm, "statusCode", "") == "PFS11") {
          // ----------------- Edit Supplier branch Profile proposal ------------------- \\
          const editSupplierBranchPropo = await AppApi.getApi("p2p/api/v1/edit/supplier/branch/profile/proposal", formData, {
            "Content-Type": "multipart/form-data",
            method: "post",
            authorized: true,
          });
          if (editSupplierBranchPropo && editSupplierBranchPropo.status == 200) {
            hideLoading();
            showAlertDialog({
              text: editSupplierBranchPropo.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
              routerLink: "/profile/branchApprovalLists",
            });
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(editSupplierBranchPropo, "data.error", "Error !"),
              text: _.get(editSupplierBranchPropo, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } else {
          // ----------------- Edit Supplier branch Profile ------------------- \\
          const editSupplierBranch = await AppApi.getApi("p2p/api/v1/edit/supplier/branch/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
          if (editSupplierBranch && editSupplierBranch.status == 200) {
            hideLoading();
            let editBranch = await showAlertDialog({
              text: editSupplierBranch.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
            });

            if (editBranch.isConfirmed) {
              if (_.get(supplierForm, "statusCode", "") == "PFS09") {
                Router.push({ pathname: "/profile/branchApprovalLists" });
              } else {
                window.history.back();
              }
            }
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(editSupplierBranch, "data.error", "Error !"),
              text: _.get(editSupplierBranch, "data.message", ""),
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
      try {
        // ------------------ Create Supplier branch Profile ------------------ \\
        const createSupplierBranch = await AppApi.getApi("p2p/api/v1/create/supplier/branch/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
        if (createSupplierBranch && createSupplierBranch.status == 200) {
          hideLoading();
          let createBranch = await showAlertDialog({
            text: createSupplierBranch.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
          });

          if (createBranch.isConfirmed) {
            window.history.back();
          }
        } else {
          hideLoading();
          showAlertDialog({
            title: _.get(createSupplierBranch, "data.error", "Error !"),
            text: _.get(createSupplierBranch, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    }
  };

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
              {flagPath ? (
                <>
                  <Breadcrumb.Item href="/profile/branchApprovalLists">Branch Profile Approval Lists</Breadcrumb.Item>
                  <Breadcrumb.Item href="#" onClick={() => window.history.back()}>
                    Supplier Branch Profile Approval
                  </Breadcrumb.Item>
                </>
              ) : (
                <>
                  <Breadcrumb.Item href="/profile/supplierLists">Supplier Lists</Breadcrumb.Item>
                  <Breadcrumb.Item href="#" onClick={() => window.history.back()}>
                    Supplier Profile
                  </Breadcrumb.Item>
                </>
              )}

              {mode === "edit" ? (
                <Breadcrumb.Item className="breadcrumb-item active">Edit Supplier Branch Profile</Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item className="breadcrumb-item active">Create New Supplier Branch Profile</Breadcrumb.Item>
              )}
            </Breadcrumb>
          </div>

          {/* ------------- Confirm Dialog ---------- */}
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

          <Form form={form} layout="vertical" initialValues={supplierForm} onFinish={validateBeforeSave} scrollToFirstError={{ behavior: "smooth", inline: "center", block: "center" }}>
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
                label="Supplier Name (TH)"
                name="supplierCompNameTH"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Supplier Name (TH)",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
                      } else if (!new RegExp("^[\u0E00-\u0E7F0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
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
                  disabled={(mode == "add" && flagDisableField) || (mode == "edit" && flagDisableField)}
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
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("The only special characters allowed are: Dash (-), Full stop (.), Brackets (), Space");
                      } else if (!new RegExp("^[A-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
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
                  disabled={(mode == "add" && flagDisableField) || (mode == "edit" && flagDisableField)}
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
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[0-9]+$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("Please enter a valid number");
                      } else if ((value.length < 13 || value.length > 13) && value !== "" && value !== null) {
                        return Promise.reject("Please enter a valid number 13 digit");
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

              {id !== "" && mode == "edit" && _.get(supplierForm, "statusCode", "") != "PFS11" ? (
                <Form.Item
                  label="Branch Code"
                  name="supplierBranchCode"
                  rules={[
                    {
                      required: true,
                      message: "Please fill in Branch Code",
                    },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    disabled={mode == "edit" || flagBranch}
                    value={_.get(supplierForm, "supplierBranchCode", "")}
                    onChange={(e) => {
                      setSupplierForm({ ...supplierForm, supplierBranchCode: e.target.value });
                    }}
                    style={{ width: "100%" }}
                  />
                </Form.Item>
              ) : (
                ""
              )}

              <Form.Item
                label="Branch Name"
                name="supplierBranchName"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Branch Name",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
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
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[0-9]+$").test(value) && value !== "" && value !== null) {
                        return Promise.reject("Please enter a valid number");
                      } else if ((value.length < 5 || value.length > 5) && value !== "" && value !== null) {
                        return Promise.reject("Please enter a valid number 5 digit");
                      } else {
                        return Promise.resolve();
                      }
                    },
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
                rules={[
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
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
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  value={_.get(supplierForm, "postcode", "")}
                  maxLength={5}
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
                  // {
                  //   type: 'email',
                  //   message: 'Invalid email format',

                  // },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "" && value !== null) {
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
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "" && value !== null) {
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
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "" && value !== null) {
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
                      validator: (rule, value = "") => {
                        if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(value) && value !== "" && value !== null) {
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
                        if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "" && value !== null) {
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
                  style={{ width: "100%" }}
                  // rules={[
                  //   {
                  //     pattern: new RegExp("^[0-9]+$"),
                  //     message: "Please enter a valid number",
                  //   },
                  // ]}
                >
                  <Input
                    className="mb-3"
                    // onKeyDown={(e) => {
                    //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                    //     return e.preventDefault();
                    //   }
                    // }}
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
                    ((validateCont2 && _.get(supplierForm, "contactInfo.1.name", "") == "") || !new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$").test(_.get(supplierForm, "contactInfo.1.name"))) &&
                    "error"
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
              {(isAllow("P6201", ["CREATE", "EDIT", "BRANCH_CREATE_EDIT"]) || isAllow("P6203", ["CREATE", "EDIT", "BRANCH_CREATE_EDIT"])) && (
                <Button className="btn btn-blue mr-2" shape="round" htmlType="submit">
                  Submit
                </Button>
              )}
              <Button
                className="btn btn-blue-transparent mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  window.history.back();
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

addEditSupplierBranchProfile.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
