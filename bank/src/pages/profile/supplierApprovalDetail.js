import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";

import _, { get } from "lodash";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

// ---------------------- UI -----------------------
import Layout from "../components/layout";
import { Button, Table, Pagination, Form, Input, Select, Breadcrumb, Descriptions, Modal, Result } from "antd";
import { DownOutlined, UpOutlined } from "@ant-design/icons";
import TableBlue from "../components/TableBlue";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function supplierApprovalDetail() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const router = useRouter();
  const { Option } = Select;

  //=============== Detail ============
  const [id, setId] = useState("");
  const [status, setStatus] = useState("");
  const [supApvDetail, setSupApvDetail] = useState({});

  // ============= Table ============
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [dataActionHis, setDataActionHis] = useState([]);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [loadingAction, setLoadingAction] = useState(false);

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
      render: (text) => <span>{text != null && text != "" ? text : "-"}</span>,
    },
  ];

  // const footerConfirm = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       shape="round"
  //       onClick={() => {
  //         approveSupplier();
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

  // const footerReject = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       disabled={rejectReason == "" || note == ""}
  //       shape="round"
  //       onClick={() => {
  //         rejectSupplier();
  //         setShowRejectCard(false);
  //       }}
  //     >
  //       Confirm
  //     </Button>
  //     <Button
  //       className="btn btn-orange"
  //       shape="round"
  //       onClick={() => {
  //         setShowRejectCard(false);
  //       }}
  //     >
  //       Close
  //     </Button>
  //   </div>
  // );

  useEffect(async () => {
    const { id } = router.query;
    setId(id);
    getReasonReject("PF");
    getHistoryAction(id);
    await initialData(id);
  }, [router]);

  const initialData = async (id) => {
    showLoading();
    try {
      if (id !== null && id !== undefined) {
        setLoadingAction(true);
        const resViewSupplierAppr = await AppApi.getApi("p2p/api/v1/view/supplier/profile/waitingApproval", { id: id }, { method: "post", authorized: true });
        if (resViewSupplierAppr && resViewSupplierAppr.status == 200) {
          const status = _.get(resViewSupplierAppr, "data.statusCode", "");
          setStatus(status);
          setSupApvDetail(_.get(resViewSupplierAppr, "data", {}));
          hideLoading();
          setLoadingAction(false);
        } else {
          hideLoading();
          setLoadingAction(false);
          showAlertDialog({
            title: _.get(resViewSupplierAppr, "data.error", "Error !"),
            text: _.get(resViewSupplierAppr, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
        }
      } else {
        showLoading();
        Router.push("/profile/supplierApprovalLists");
      }
    } catch (err) {
      hideLoading();
      setLoadingAction(false);
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

  const getHistoryAction = async (id) => {
    try {
      const hisActionRes = await AppApi.getApi("p2p/api/v1/view/history/supplier/profile", { id: id }, { method: "post", authorized: true });
      if (hisActionRes && hisActionRes.status == 200) {
        const actionHis = _.get(hisActionRes.data, "items", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
        setDataActionHis(actionHis);
        setTotalRecordAction(_.get(hisActionRes.data, "totalItem", 0));
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(hisActionRes, "data.error", "Error !"),
          text: _.get(hisActionRes, "data.message", ""),
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
      const apprvSupplierResp = await AppApi.getApi("p2p/api/v1/approve/supplier/profile", { id: id }, { method: "post", authorized: true });
      if (apprvSupplierResp && apprvSupplierResp.status == 200) {
        showAlertDialog({
          text: apprvSupplierResp.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/supplierApprovalLists",
        });
        hideLoading();

        // setSuccessMessage(_.get(apprvSupplierResp.data, "message", ""));
        // setShowSuccessCard(true);
        // const timeOut = setTimeout(() => {
        //   showLoading();
        //   Router.push({
        //     pathname: "/profile/supplierApprovalLists",
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
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
      const rejectSupplierResp = await AppApi.getApi("p2p/api/v1/reject/supplier/profile", requestBody, { method: "post", authorized: true });
      if (rejectSupplierResp && rejectSupplierResp.status == 200) {
        showAlertDialog({
          text: rejectSupplierResp.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/supplierApprovalLists",
        });
        hideLoading();

        // setSuccessMessage(_.get(rejectSupplierResp.data, "message", ""));
        // setShowSuccessCard(true);
        // const timeOut = setTimeout(() => {
        //   showLoading();
        //   Router.push({
        //     pathname: "/profile/supplierApprovalLists",
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
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

  const onChangePageActionHis = (pagination, filters, sorter, extra) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-11">
        <div>
          {/** --------- Modal for show Response type Success and Error -------------- */}
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
              approveSupplier();
              handleApproveConfirmModalClose();
            }}
            onClose={() => {
              handleApproveConfirmModalClose();
            }}
          >
            Please confirm to approve this Supplier Profile.
          </DialogConfirm>

          {/** --------- Modal for select refect reason -------------- */}
          <DialogReason
            mode="Reject"
            title={<>Reject Supplier Profile</>}
            onFinish={rejectSupplier}
            visible={showRejectCard}
            codeLists={reasonList}
            closable={false}
            onClose={() => {
              handleRejectModalClose();
            }}
          />
          {/* <Modal title=" " visible={showRejectCard} closable={false} footer={footerReject}>
            <div style={{ margin: "10px 30px 0px 30px" }}>
              <div className="text-left">
                <h5 style={{ fontSize: "17px", fontWeight: "500" }}>Reject Supplier Profile</h5>
              </div>
              <Form className="mt-3" layout="vertical" name="basic">
                <Form.Item label="Reject reason" name="rejectReason" rules={[{ required: true, message: "Please fill in Reject Reason!" }]}>
                  <Select
                    className="text-left"
                    value={rejectReason}
                    placeholder="Please select"
                    onChange={(value) => {
                      setRejectReason(value);
                    }}
                    style={{ width: "100%" }}
                  >
                    <Option hidden key="" value="">
                      -- Please Select --
                    </Option>
                    {reasonList.map((item) => (
                      <Option value={item.code}>{item.name}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Note" name="note" rules={[{ required: true, message: "Please fill in Note!" }]}>
                  <Input
                    placeholder="Please remark"
                    value={note}
                    onChange={(e) => {
                      setNote(e.target.value);
                    }}
                  />
                </Form.Item>
              </Form>
            </div>
          </Modal> */}

          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Supplier Profile</Breadcrumb.Item>
              <Breadcrumb.Item href="/profile/supplierApprovalLists">Supplier Profile Approval Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Supplier Profile Approval</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="row ml-3 mt-7">
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
                  {_.get(supApvDetail, "supplierCompNameTH", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Name (EN)">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierCompNameEN", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Tax ID">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierTaxId", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Branch Code">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierBranchCode", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Branch Name">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierBranchName", "-")}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="VAT Branch Code">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierVatBranchCode", "-") !== null && _.get(supApvDetail, "supplierVatBranchCode", "-") !== "" ? (
                    _.get(supApvDetail, "supplierVatBranchCode", "-")
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="VAT Branch Name">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierVatBranchName", "-") !== null && _.get(supApvDetail, "supplierVatBranchName", "-") !== "" ? (
                    _.get(supApvDetail, "supplierVatBranchName", "-")
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="WHT Type">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierWHTType", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Address Detail">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "addressDetail", "-")}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Province">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "province", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="District">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "district", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Sub District">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "subDistrict", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Postcode">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "postcode", "-")}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 1">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierEmail1", "-") !== "" && _.get(supApvDetail, "supplierEmail1", "-") !== null ? _.get(supApvDetail, "supplierEmail1", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 2">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierEmail2", "-") !== "" && _.get(supApvDetail, "supplierEmail2", "-") !== null ? _.get(supApvDetail, "supplierEmail2", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Supplier Email 3">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "supplierEmail3", "-") !== "" && _.get(supApvDetail, "supplierEmail3", "-") !== null ? _.get(supApvDetail, "supplierEmail3", "-") : <span> - </span>}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: "30%" }}>
                <Descriptions.Item label="Company Status">
                  <div style={{ marginRight: "12%" }}> : </div>
                  {_.get(supApvDetail, "isActive", "-") == true ? <span>Active</span> : <span>Inactive</span>}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="col-1" />

            <div className="col-5">
              <h5 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>Contact Person</h5>

              {_.get(supApvDetail, "contactInfo", []) &&
                _.get(supApvDetail, "contactInfo", []).map((contact, index) => (
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
                loading={loadingAction}
              />
            </>
          )}

          <hr style={{ borderColor: "#456fb6", borderWidth: "2px" }} />

          <div className="row justify-content-md-center">
            {(status == "PFK01" || status == "PFK06") && (
              <>
                {isAllow("P6203", ["APPROVE"]) && (
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

                {isAllow("P6203", ["REJECT"]) && (
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

            {(status == "PFK03" || status == "PFS05" || status == "PFK08" || status == "PFK09") && isAllow("P6203", ["EDIT"]) && (
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  router.push(
                    {
                      pathname: `/profile/addEditSupplierApproval`,
                      query: { id: id, status: status, flagPath: true },
                    },
                    `/profile/addEditSupplierApproval`
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

supplierApprovalDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
