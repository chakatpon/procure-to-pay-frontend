import React, { useEffect, useState, useRef, useContext } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import router from "next/router";
import _, { get } from "lodash";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// ===================== UI =======================
import Layout from "../components/layout";
import ReferenceInfo from "../components/ReferenceInfo";
import { Button, Table, Form, Input, Breadcrumb, Modal, Result, AutoComplete, Select } from "antd";
import DialogConfirm from "@/shared/components/DialogConfirm";

// ======================= API ========================
import { B2PAPI } from "../../context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";

export default function addEditReferenceInfo() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);

  const [form] = Form.useForm();
  const [formBranch] = Form.useForm();
  const extSupplierCodeRef = useRef(null);

  const { Option } = AutoComplete;

  const [mode, setMode] = useState("add");
  const [flagApproval, setFlagApproval] = useState(false);
  const [status, setStatus] = useState("");
  const [supplierCode, setSupplierCode] = useState("");
  const [flagPath, setFlagPath] = useState(false);

  // ============== Search =============
  const [supplierName, setSupplierName] = useState("");
  const [option, setOption] = useState([]);

  // =============== Table ==============
  const [dataSourceRef, setDataSourceRef] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [flagLoading, setFlagLoading] = useState(false);
  const [flagShowTable, setFlagShowTable] = useState(false);

  // ==================== Detail ==================
  const [extSupplierCode, setExtSupplierCode] = useState("");
  const [supplierDetail, setSupplierDetail] = useState({});
  const [isNewSupplier, setIsNewSupplier] = useState(true);
  const [flagIsNewSupplier, setFlagIsNewSupplier] = useState(true); // ----- flag to show input of external supplier code ----

  // ================== Dropdown list =============
  const [optionsList, setOptionsList] = useState([]);
  const [customerTypeList, setCustomerTypeList] = useState([]);

  // ======================== Modal ==================
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const handleConfirmModalClose = () => setShowConfirmCard(false);
  const handleConfirmModalShow = () => setShowConfirmCard(true);

  const ReferenceCols = [
    {
      key: "no",
      title: "No.",
      dataIndex: "no",
      align: "center",
    },
    {
      key: "supplierBranchCode",
      title: "Branch Code BC",
      dataIndex: "supplierBranchCode",
    },
    {
      key: "supplierBranchName",
      title: "Branch Name",
      dataIndex: "supplierBranchName",
    },
    {
      key: "referenceCode",
      title: "Reference Code",
      dataIndex: "referenceCode",
      width: 250,
      render: (text, record, index) => inputRefMap(record.no - 1, "referenceCode", "text"),
    },
    {
      key: "extSupplierBranchCode",
      title: "External Branch Code",
      dataIndex: "extSupplierBranchCode",
      width: 250,
      render: (text, record, index) => inputRefMap(record.no - 1, "extSupplierBranchCode", "text"),
    },
    {
      key: "customerType",
      title: "Customer Type",
      dataIndex: "customerType",
      width: 250,
      render: (text, record, index) => inputRefMap(record.no - 1, "customerType", "select"),
    },
  ];

  // const footerConfirm = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       shape="round"
  //       onClick={() => {
  //         onSaveMapping();
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

  useEffect(async () => {
    const flagPath = _.get(router.query, "flagPath", false) == "true" ? true : false;
    setFlagPath(flagPath);
    initDropdown();
    await initialData();
  }, []);

  const initialData = async () => {
    showLoading();
    const supplierCode = _.get(router.query, "supplierCode", "");
    const status = _.get(router.query, "status", "");
    setStatus(status);
    setSupplierCode(supplierCode);

    if (supplierCode !== null && supplierCode !== "") {
      // ------------------- Edit mode ----------------------
      setMode("edit");
      if (_.get(router.query, "flagApproval", "false") == "true") {
        // ---------------- Edit mapping reference approval info -------
        setFlagApproval(true);
        setFlagShowTable(true);
        try {
          const mappingRefApprvDetail = await AppApi.getApi("p2p/api/v1/view/mappingReferenceApprovalDetail", { supplierCode: supplierCode }, { method: "post", authorized: true });

          if (mappingRefApprvDetail && mappingRefApprvDetail.status == 200) {
            const mappingRefApprvList = _.get(mappingRefApprvDetail.data, "mappingList", []).map((mapApprv, index) => ({ no: index + 1, ...mapApprv }));
            const supplierDetails = {
              supplierNameTH: _.get(mappingRefApprvDetail.data, "supplierNameTH", ""),
              supplierNameEN: _.get(mappingRefApprvDetail.data, "supplierNameEN", ""),
              supplierTaxId: _.get(mappingRefApprvDetail.data, "supplierTaxId", ""),
              extSupplierCode: _.get(mappingRefApprvDetail.data, "extSupplierCode", ""),
            };

            setSupplierDetail(supplierDetails);
            setExtSupplierCode(_.get(mappingRefApprvDetail.data, "extSupplierCode", ""));
            setDataSourceRef(mappingRefApprvList);
            setTotalRecord(mappingRefApprvList.length);
            formBranch.setFieldsValue({ dataSourceRef: mappingRefApprvList });
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(mappingRefApprvDetail, "data.error", "Error !"),
              text: _.get(mappingRefApprvDetail, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } catch (err) {
          hideLoading();
          ErrorHandle(err);
        }
      } else {
        // ---------------- Edit mapping reference info -------
        setFlagShowTable(true);
        setFlagApproval(false);
        try {
          const mappingRefDetail = await AppApi.getApi("p2p/api/v1/view/mappingReferenceDetail", { supplierCode: supplierCode }, { method: "post", authorized: true });

          if (mappingRefDetail && mappingRefDetail.status == 200) {
            const mappingRefApprvList = _.get(mappingRefDetail.data, "mappingList", []).map((mapApprv, index) => ({ no: index + 1, ...mapApprv }));
            const supplierDetails = {
              supplierNameTH: _.get(mappingRefDetail.data, "supplierNameTH", ""),
              supplierNameEN: _.get(mappingRefDetail.data, "supplierNameEN", ""),
              supplierTaxId: _.get(mappingRefDetail.data, "supplierTaxId", ""),
              extSupplierCode: _.get(mappingRefDetail.data, "extSupplierCode", ""),
            };

            setSupplierDetail(supplierDetails);
            setExtSupplierCode(_.get(mappingRefDetail.data, "extSupplierCode", ""));
            setDataSourceRef(mappingRefApprvList);
            setTotalRecord(mappingRefApprvList.length);
            formBranch.setFieldsValue({ dataSourceRef: mappingRefApprvList });
            hideLoading();
          } else {
            hideLoading();
            showAlertDialog({
              title: _.get(mappingRefDetail, "data.error", "Error !"),
              text: _.get(mappingRefDetail, "data.message", ""),
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
    } else {
      // ------------------ Add mode -----------------------
      setFlagApproval(true);
      await getNewSupplier();
    }
  };

  const initDropdown = async () => {
    //----------- dropdown customer type -------------
    try {
      const customerTypeRes = await AppApi.getApi("p2p/api/v1/get/customerType", {}, { method: "get", authorized: true });

      if (_.get(customerTypeRes, "status", 500) == 200) {
        setCustomerTypeList(_.get(customerTypeRes, "data", []));
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(customerTypeRes, "data.error", "Error !"),
          text: _.get(customerTypeRes, "data.message", ""),
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

  const getNewSupplier = async () => {
    try {
      const supplierMappingRes = await AppApi.getApi("p2p/api/v1/get/newSupplierMappingReference", {}, { method: "get", authorized: true });

      if (supplierMappingRes && supplierMappingRes.status == 200) {
        let supplierMapList = _.get(supplierMappingRes.data, "items", []);
        const supplierMapNameTH = supplierMapList.map((supplier) => ({
          label: supplier.supplierNameTH,
          code: supplier.supplierCode,
          flag: supplier.isNewSupplier.toString(),
        }));
        const supplierMapNameEN = supplierMapList.map((supplier) => ({
          label: supplier.supplierNameEN,
          code: supplier.supplierCode,
          flag: supplier.isNewSupplier.toString(),
        }));

        supplierMapList = _.concat(supplierMapNameTH, ...supplierMapNameEN);
        setOptionsList(supplierMapList);
        hideLoading();
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(supplierMappingRes, "data.error", "Error !"),
          text: _.get(supplierMappingRes, "data.message", ""),
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

  const inputRefMap = (indexField, nameField, typeInput = "text") => {
    let messageValidate = "";
    if (nameField == "referenceCode") {
      messageValidate = "Please fill in Reference Code";
    } else if (nameField == "extSupplierBranchCode") {
      messageValidate = "Please fill in External Branch Code";
    } else if (nameField == "customerType") {
      messageValidate = "Please select Customer Type";
    }

    return (
      <Form form={formBranch}>
        {typeInput == "select" ? (
          <Form.Item name={["dataSourceRef", indexField, nameField]} rules={[{ required: true, message: messageValidate }]}>
            <Select placeholder="-- Please Select --" value={dataSourceRef[indexField].nameField} onChange={(value) => onChangeValMappingList(nameField, value, indexField)}>
              <Select.Option hidden value="">
                -- Please Select --
              </Select.Option>
              {customerTypeList.length > 0 &&
                customerTypeList.map((customerType) => (
                  <Select.Option value={customerType.valueType} key={customerType.valueType}>
                    {customerType.value}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        ) : (
          <Form.Item name={["dataSourceRef", indexField, nameField]} rules={[{ required: true, message: messageValidate }]}>
            <Input style={{ width: "90%" }} value={dataSourceRef[indexField].nameField} onChange={(e) => onChangeValMappingList(nameField, e.target.value, indexField)} />
          </Form.Item>
        )}
      </Form>
    );
  };

  const onSelectAutoComplete = (value, option) => {
    const isNewSupplier = option.flag == "true" ? true : false;
    setSupplierName(option.code);
    setIsNewSupplier(isNewSupplier);
  };

  const onSearchAutoComplete = (valueSearch) => {
    let filterOptions = [];
    if (valueSearch !== "") {
      filterOptions = _.filter(optionsList, (option) => option.label.toLowerCase().indexOf(valueSearch.toLowerCase()) !== -1);
    }
    setOption(filterOptions);
  };

  const validateBeforeSearch = () => {
    if (supplierName == "") {
      showAlertDialog({
        title: "Not Found.",
        text: "Supplier Name not found. Please check on Supplier Profile and Partnership.",
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
      // setShowErrorCard(true);
      // setErrorMessage("Supplier Name not found. Please check on Supplier Profile and Partnership.");
    } else {
      onSearch();
    }
  };

  const onSearch = async () => {
    showLoading();
    setFlagLoading(true);
    setFlagIsNewSupplier(isNewSupplier); // ----- set flag to show or not of external supplier code when search ---

    // ---- process to reset form when new search -------
    if (flagShowTable) {
      formBranch.resetFields();
      if (isNewSupplier) {
        extSupplierCodeRef.current.resetFields();
      }
    }

    try {
      const newBranchMapRes = await AppApi.getApi("p2p/api/v1/view/newBranchMappingReference", { supplierCode: supplierName }, { method: "post", authorized: true });

      if (newBranchMapRes && newBranchMapRes.status == 200) {
        const newBranchMapList = _.get(newBranchMapRes.data, "branchList", []).map((newBranch, index) => ({ no: index + 1, ...newBranch }));
        const supplierDetails = {
          supplierCode: _.get(newBranchMapRes.data, "supplierCode", ""),
          supplierNameTH: _.get(newBranchMapRes.data, "supplierNameTH", ""),
          supplierNameEN: _.get(newBranchMapRes.data, "supplierNameEN", ""),
          supplierTaxId: _.get(newBranchMapRes.data, "supplierTaxId", ""),
          extSupplierCode: _.get(newBranchMapRes.data, "extSupplierCode", ""),
        };
        setSupplierDetail(supplierDetails);
        setExtSupplierCode(_.get(newBranchMapRes.data, "extSupplierCode", ""));
        setDataSourceRef(newBranchMapList);
        setTotalRecord(newBranchMapList.length);
        setFlagShowTable(true);
        formBranch.setFieldsValue({ dataSourceRef: newBranchMapList });
        hideLoading();
        setFlagLoading(false);
      } else {
        hideLoading();
        setFlagLoading(false);
        setFlagShowTable(false);
        showAlertDialog({
          title: _.get(newBranchMapRes, "data.error", "Error !"),
          text: _.get(newBranchMapRes, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      setFlagLoading(false);
      setFlagShowTable(false);
      ErrorHandle(err);
    }
  };

  const onPageChange = (pagination, filters, sorter, extra) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const onChangeExSupplierCode = (event) => {
    setExtSupplierCode(_.get(event.target, "value", ""));
  };

  const onChangeValMappingList = (nameField, value, index) => {
    const mappingRefList = dataSourceRef.map((data, dataIndex) => {
      let mappingData = { ...data };
      if (dataIndex == index) {
        mappingData = {
          ...data,
          [nameField]: value,
        };
      }
      return mappingData;
    });

    setDataSourceRef(mappingRefList);
  };

  const onValidateBeforeSave = () => {
    if (extSupplierCode == "") {
      extSupplierCodeRef.current
        .validateFields()
        .then()
        .catch(({ errorFields }) => {
          extSupplierCodeRef.current.scrollToField(errorFields[0].name, { behavior: "smooth", block: "center", inline: "center" });
        });
    }

    formBranch
      .validateFields()
      .then((values) => {
        if (mode == "add") {
          handleConfirmModalShow();
          // setShowConfirmCard(true);
          setConfirmMessage("Please confirm this Reference Information.");
        } else {
          handleConfirmModalShow();
          // setShowConfirmCard(true);
          setConfirmMessage("Please confirm to edit this Mapping Reference Information.");
        }
      })
      .catch(({ errorFields }) => {
        formBranch.scrollToField(errorFields[0].name, {
          behavior: "smooth",
          block: "center",
          inline: "center",
        });
      });
  };

  const onSaveMapping = async () => {
    showLoading();
    const data = {
      supplierCode: mode == "add" ? supplierName : supplierCode,
      extSupplierCode: extSupplierCode,
      mappingList: dataSourceRef,
    };

    if (supplierCode !== "" && supplierCode !== null) {
      // ------------------ Edit mode ----------------------
      try {
        const editMappingRef = await AppApi.getApi("p2p/api/v1/edit/mappingReferenceInfo", data, { method: "post", authorized: true });

        if (editMappingRef && editMappingRef.status == 200) {
          showAlertDialog({
            text: editMappingRef.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: flagApproval ? "/profile/referenceInfoApprovalLists" : "/profile/referenceInfoLists",
          });

          // setShowSuccessCard(true);
          // setSuccessMessage(_.get(editMappingRef.data, "message", ""));
          // const timeOut = setTimeout(() => {
          //   Router.push({
          //     pathname: flagApproval ? "/profile/referenceInfoApprovalLists" : "/profile/referenceInfoLists",
          //   });
          //   clearTimeout(timeOut);
          // }, 4000);
          hideLoading();
        } else {
          hideLoading();
          showAlertDialog({
            title: _.get(editMappingRef, "data.error", "Error !"),
            text: _.get(editMappingRef, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    } else {
      // --------------------- Add mode --------------------
      try {
        const createMappingRef = await AppApi.getApi("p2p/api/v1/create/mappingReferenceInfo", data, { method: "post", authorized: true });

        if (createMappingRef && createMappingRef.status == 200) {
          showAlertDialog({
            text: createMappingRef.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: "/profile/referenceInfoApprovalLists",
          });

          // setShowSuccessCard(true);
          // setSuccessMessage(_.get(createMappingRef.data, "message", ""));
          // const timeOut = setTimeout(() => {
          //   Router.push({
          //     pathname: "/profile/referenceInfoApprovalLists",
          //   });
          //   clearTimeout(timeOut);
          // }, 4000);
          hideLoading();
        } else {
          hideLoading();
          showAlertDialog({
            title: _.get(createMappingRef, "data.error", "Error !"),
            text: _.get(createMappingRef, "data.message", ""),
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

  return (
    <div className="container">
      <div className="row justify-content-md-center mb-10">
        <div className={mode == "add" ? "col-6" : "col-12"}>
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">" style={{ marginLeft: "15px" }}>
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Reference Info</Breadcrumb.Item>
              {flagPath ? (
                flagApproval ? (
                  <Breadcrumb.Item href="/profile/referenceInfoApprovalLists">Reference Info Approval Lists</Breadcrumb.Item>
                ) : (
                  <Breadcrumb.Item href="/profile/referenceInfoLists">Reference Info Lists</Breadcrumb.Item>
                )
              ) : null}

              <Breadcrumb.Item className="breadcrumb-item active">{mode == "add" ? "Add Reference Info" : "Edit Reference Info"}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/** --------- Modal for alert -------------- */}
          {/* <Modal
            title=" "
            footer={null}
            visible={showSuccessCard || showErrorCard}
            closable={false}
            onCancel={() => {
              setShowErrorCard(false);
              setShowSuccessCard(false);
            }}
          >
            <Result status={showSuccessCard ? "success" : "error"} title={<p>{showSuccessCard ? successMessage : errorMessage}</p>} />
          </Modal> */}

          {/** --------- Modal for confirm -------------- */}
          <DialogConfirm
            visible={showConfirmCard}
            closable={false}
            onFinish={() => {
              onSaveMapping();
              handleConfirmModalClose();
            }}
            onClose={() => {
              handleConfirmModalClose();
            }}
          >
            {confirmMessage}
          </DialogConfirm>
          {/* <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
            <div className="text-center">
              <span style={{ fontWeight: "500", fontSize: "17px" }}>{confirmMessage}</span>
            </div>
          </Modal> */}

          {mode == "add" && (
            <>
              <div
                style={{
                  width: "100%",
                  height: "auto",
                  border: "2px solid #f7f7f7",
                  background: "#f7f7f7",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: "#585858",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    marginLeft: "1%",
                    display: "table-cell",
                    height: "40px",
                  }}
                >
                  <div className="ml-3">Add Reference Info</div>
                </div>
              </div>
              <br />
              <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }} onFinish={validateBeforeSearch}>
                <Form.Item name="supplierName" label="Supplier Name" rules={[{ required: true, message: "Please fill in Supplier Name" }]} labelAlign="left">
                  <AutoComplete value={supplierName} onSelect={onSelectAutoComplete} onSearch={onSearchAutoComplete}>
                    {option.length > 0 &&
                      option.map((supOption, index) => (
                        <Option value={supOption.label} key={supOption.code + index} code={supOption.code} flag={supOption.flag}>
                          {supOption.label}
                        </Option>
                      ))}
                  </AutoComplete>
                </Form.Item>
                <div className="row justify-content-md-center mt-8">
                  <Button className="btn btn-blue mr-2" shape="round" htmlType="submit">
                    Search
                  </Button>

                  <Button
                    className="btn btn-blue-transparent"
                    shape="round"
                    onClick={() => {
                      setSupplierName("");
                      form.setFieldsValue({
                        supplierName: "",
                      });
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </Form>
            </>
          )}
        </div>
      </div>
      {flagShowTable && (
        <>
          {mode == "add" && <div className="line"></div>}
          <ReferenceInfo
            ref={extSupplierCodeRef}
            columns={ReferenceCols}
            dataSource={dataSourceRef}
            current={currentPage}
            pageSize={pageSize}
            total={totalRecord}
            loading={flagLoading}
            onChange={onPageChange}
            onChangeExSupplierCode={onChangeExSupplierCode}
            supplierDetail={supplierDetail}
            flagEdit={flagIsNewSupplier}
            showPagination={true}
          />

          <div className="row justify-content-md-center mt-5">
            {(isAllow("P6401", ["CREATE"]) || isAllow("P6402", ["EDIT"]) || isAllow("P6403", ["EDIT"])) && (
              <Button className="btn btn-blue mr-2" shape="round" htmlType="submit" onClick={onValidateBeforeSave}>
                Submit
              </Button>
            )}

            <Button
              className="btn btn-blue-transparent"
              shape="round"
              onClick={() => {
                showLoading();
                Router.push({
                  pathname: flagApproval ? "/profile/referenceInfoApprovalLists" : "/profile/referenceInfoLists",
                });
              }}
            >
              Back
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

addEditReferenceInfo.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
