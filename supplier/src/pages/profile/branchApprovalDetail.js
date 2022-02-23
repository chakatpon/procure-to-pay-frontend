import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from "next/router";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

//----------------- UI -------------------
import Layout from "../components/layout";
import { Descriptions, Button, Breadcrumb, Table, Pagination, Modal, Result, Select, Input, Form } from "antd";
import { UpOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import TableBlue from "../components/TableBlue";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";

//------------------ API -----------------
import { B2PAPI } from "../../context/api";
import _, { get } from "lodash";

export default function branchApprovalDetail() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow, getStorage } = useContext(StoreContext);
  const router = useRouter();
  const { Option } = Select;
  const branch = "Supplier";

  //=============== Detail ============
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [supplierDetail, setSupplierDetail] = useState({});
  const [companyCode, setCompanyCode] = useState("");

  // =============== Table ==============
  const [dataActionHis, setDataActionHis] = useState([]);
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);

  // =============== Modal ==================
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [showRejectCard, setShowRejectCard] = useState(false);

  const handleRejectModalClose = () => setShowRejectCard(false);
  const handleRejectModalShow = () => setShowRejectCard(true);

  const handleApproveConfirmModalClose = () => setShowConfirmCard(false);
  const handleApproveConfirmModalShow = () => setShowConfirmCard(true);

  // ============= Approve & Reject ================
  const [reasonList, setReasonList] = useState([]);

  const actionHisCol = [
    {
      key: "action",
      title: "Action",
      dataIndex: "action",
    },
    {
      key: "dateTime",
      title: "Date Time",
      align: "center",
      dataIndex: "dateTime",
    },
    {
      key: "by",
      title: "By User",
      dataIndex: "by",
    },
    {
      key: "reason",
      title: "Reason",
      dataIndex: "reason",
      render: (text, record, index) => <span>{text != null && text != "" ? text : "-"}</span>,
    },
  ];

  useEffect(async () => {
    const id = _.get(router.query,"id",null);
    setId(id);
    getActionHis(id);
    getReasonReject("PF");
    await initialData(id);
  }, [router]);

  const initialData = async (id) => {
    showLoading();
    if (id !== null && id !== undefined) {
      // --------- process to get companyCode from userData on localstorage --------
      const userData = getStorage("userData");
      const companyCode = _.get(userData, "companyCode", "");
      setCompanyCode(companyCode);
      // ---------------------- end of process ---------------

      try {
        const resViewSupplier = await AppApi.getApi("p2p/api/v1/view/supplier/branch/profile/waitingApproval", { id: id }, { method: "post", authorized: true });
        if (resViewSupplier && resViewSupplier.status == 200) {
          setStatus(_.get(resViewSupplier, "data.statusCode", ""));
          setSupplierDetail(_.get(resViewSupplier, "data", {}));
          hideLoading();
        } else {
          hideLoading();
          showAlertDialog({
            title: _.get(resViewSupplier, "data.error", "Error !"),
            text: _.get(resViewSupplier, "data.message", ""),
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
      Router.push("/profile/branchApprovalLists");
    }
  };

  const getActionHis = async (id) => {
    try {
      const actionHis = await AppApi.getApi("p2p/api/v1/view/history/supplier/branch/profile", { id: id }, { method: "post", authorized: true });
      if (actionHis && actionHis.status == 200) {
        const actionHisData = _.get(actionHis.data, "items", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
        setDataActionHis(actionHisData);
        setTotalRecordAction(_.get(actionHis.data, "totalItem", 0));
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(actionHis, "data.error", "Error !"),
          text: _.get(actionHis, "data.message", ""),
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

  const getReasonReject = async (nameParam) => {
    try {
      const reasonRes = await AppApi.getApi(`p2p/api/v1/get/reasonCode/type/${nameParam}`, {}, { method: "get", authorized: true });
      if (reasonRes && reasonRes.status == 200) {
        const reasonListItems = reasonRes.data.map((items) => {
          return { option: items.name, value: items.code };
        });
        setReasonList(reasonListItems);
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(reasonRes, "data.error", "Error !"),
          text: _.get(reasonRes, "data.message", ""),
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

  const approveSupplier = async () => {
    showLoading();
    try {
      const apprvSupplierResp = await AppApi.getApi("p2p/api/v1/approve/supplier/branch/profile", { id: id }, { method: "post", authorized: true });
      if (apprvSupplierResp && apprvSupplierResp.status == 200) {
        hideLoading();
        showAlertDialog({
          text: apprvSupplierResp.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/branchApprovalLists",
        });
      } else {
        hideLoading();
        //alert
        showAlertDialog({
          title: _.get(apprvSupplierResp, "data.error", "Error !"),
          text: _.get(apprvSupplierResp, "data.message", ""),
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

  const rejectSupplier = async (values) => {
    const requestBody = {
      id: id,
      code: values.code,
      note: values.note,
    };
    showLoading();
    try {
      const rejectSupplierResp = await AppApi.getApi("p2p/api/v1/reject/supplier/branch/profile", requestBody, { method: "post", authorized: true });
      if (rejectSupplierResp && rejectSupplierResp.status == 200) {
        hideLoading();
        showAlertDialog({
          text: rejectSupplierResp.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/branchApprovalLists",
        });
      } else {
        hideLoading();
        //alert
        showAlertDialog({
          title: _.get(rejectSupplierResp, "data.error", "Error !"),
          text: _.get(rejectSupplierResp, "data.message", ""),
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

  // const onCheckPermission = (namePermiss) => {
  //   const permission = permissionOfPage || [];
  //   return _.some(permission, (permiss) => permiss == namePermiss);
  // };

  const onChangePageActionHis = (pagination, filters, sorter, extra) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-11">
        <div>
          {/** --------- Modal for confirm -------------- */}
          <DialogConfirm
            visible={showConfirmCard}
            closable={false}
            onFinish={() => {
              approveSupplier();
              handleApproveConfirmModalClose();
            }}
            onClose={() => {
              handleApproveConfirmModalClose();
            }}
          >
            Please confirm to approve this Supplier Branch Profile.
          </DialogConfirm>

          {/** --------- Modal for select refect reason -------------- */}
          <DialogReason
            mode="Reject"
            title={<>Reject Supplier Branch Profile</>}
            onFinish={rejectSupplier}
            visible={showRejectCard}
            codeLists={reasonList}
            closable={false}
            onClose={() => {
              handleRejectModalClose();
            }}
          />

          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>{branch} Profile</Breadcrumb.Item>
              <Breadcrumb.Item href="/profile/branchApprovalLists">Branch Profile Approval Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">{branch} Branch Profile Approval</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <div className="row ml-3 mt-7 mb-12">
            {/* <div>
              <img
                src="/assets/image/toyota-logo.png"
                className="border-img mr-3"
                style={{ width: '180px', height: 'auto' }}
              />
            </div> */}

            {/* <div className="row col-10"> */}
            <div className="col-6">
              <h5 style={{ color: "#003399", marginBottom: "20px", fontWeight: "bold" }}>Supplier Detail</h5>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Name (TH)">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierCompNameTH", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Name (EN)">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierCompNameEN", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Tax ID">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierTaxId", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Branch Code">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierBranchCode", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Branch Name">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierBranchName", "-")}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="VAT Branch Code">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierVatBranchCode", "-") !== null && _.get(supplierDetail, "supplierVatBranchCode", "-") !== "" ? (
                    _.get(supplierDetail, "supplierVatBranchCode", "-")
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="VAT Branch Name">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierVatBranchName", "-") !== null && _.get(supplierDetail, "supplierVatBranchName", "-") !== "" ? (
                    _.get(supplierDetail, "supplierVatBranchName", "-")
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="WHT Type">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierWHTType", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Address Detail">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "addressDetail", "-")}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Province">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "province", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="District">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "district", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Sub District">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "subDistrict", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Postcode">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "postcode", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 1">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierEmail1", "-") !== null ? _.get(supplierDetail, "supplierEmail1", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 2">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierEmail2", "-") !== null && _.get(supplierDetail, "supplierEmail2", "-") !== "" ? _.get(supplierDetail, "supplierEmail2", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 3">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "supplierEmail3", "-") !== null && _.get(supplierDetail, "supplierEmail3", "-") !== "" ? _.get(supplierDetail, "supplierEmail3", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Company Status">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supplierDetail, "isActive", "-") == true ? <span>Active</span> : <span>Inactive</span>}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="col-1" />

            <div className="col-5">
              <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>Contact Person</h5>

              {_.get(supplierDetail, "contactInfo", []).map((contact, index) => (
                <div key={index}>
                  <p style={{ fontWeight: "bold", fontSize: "15px" }}>{_.get(contact, "name", "")}</p>
                  <Descriptions colon={false} labelStyle={{ width: "20%" }}>
                    <Descriptions.Item label="Email">
                      <div style={{ marginRight: "12%" }}> : </div>
                      {_.get(contact, "email", "-")}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: "20%" }}>
                    <Descriptions.Item label="Mobile no.">
                      <div style={{ marginRight: "12%" }}> : </div>
                      {_.get(contact, "mobileTelNo", "-")}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: "20%" }}>
                    <Descriptions.Item label="Office Tel no.">
                      <div style={{ marginRight: "12%" }}> : </div>
                      {_.get(contact, "officeTelNo", "-")}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: "20%" }}>
                    <Descriptions.Item label="Fax no.">
                      <div style={{ marginRight: "12%" }}> : </div>
                      {_.get(contact, "fax", "-") !== null && _.get(contact, "fax", "-") !== "" ? _.get(contact, "fax", "-") : <span>-</span>}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ))}
            </div>
            {/* </div> */}
          </div>
          <hr />
          <Button
            className="mb-10 btn btn-blue-transparent"
            shape="round"
            onClick={() => {
              setFlagActionHis(!flagActionHis);
            }}
          >
            Action History
            {flagActionHis ? <DownOutlined style={{ fontSize: "12px", marginLeft: "10px" }} /> : <UpOutlined style={{ fontSize: "12px", marginLeft: "10px" }} />}
          </Button>
          {flagActionHis && (
            <>
              <TableBlue
                dataSource={dataActionHis}
                columns={actionHisCol}
                total={totalRecordAction}
                onChange={onChangePageActionHis}
                current={pageActionHis}
                pageSize={pageActionHisSize}
                showPagination={true}
              />
            </>
          )}
          <hr style={{ borderColor: "#456fb6", borderWidth: "2px" }} />
          <div className="row justify-content-md-center">
            <>
              {status !== "" && (status == "PFS01" || status == "PFS06") && (
                <>
                  {isAllow("P6203", ["APPROVE"]) && _.get(supplierDetail, "supplierCompCode", "") == companyCode && (
                    <Button
                      className="btn btn-blue mr-2"
                      shape="round"
                      onClick={() => {
                        handleApproveConfirmModalShow();
                        // setShowConfirmCard(true);
                      }}
                    >
                      Approve
                    </Button>
                  )}

                  {isAllow("P6203", ["REJECT"]) && _.get(supplierDetail, "supplierCompCode", "") == companyCode && (
                    <Button
                      className="btn btn-orange mr-2"
                      shape="round"
                      onClick={() => {
                        handleRejectModalShow();
                        // setShowRejectCard(true);
                      }}
                    >
                      Reject
                    </Button>
                  )}
                </>
              )}
            </>

            {(status == "PFS08" || status == "PFS09" || status == "PFS11") && isAllow("P6203", ["EDIT"]) && _.get(supplierDetail, "supplierCompCode", "") == companyCode && (
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  Router.push(
                    {
                      pathname: `/profile/addEditSupplierBranchProfile`,
                      query: { id: id, flagPath: true },
                    },
                    `/profile/addEditSupplierBranchProfile`
                  );
                }}
              >
                Edit
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
        </div>
      </div>
    </div>
  );
}

branchApprovalDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
