import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";
import _, { get } from "lodash";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

// ===================== UI =======================
import Layout from "../components/layout";
import ReferenceInfo from "../components/ReferenceInfo";
import { Button, Table, Pagination, Input, Select, Breadcrumb, Modal, Result, Form } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TableBlue from "../components/TableBlue";
import DialogConfirm from "@/shared/components/DialogConfirm";
import DialogReason from "@/shared/components/DialogReason";

// ======================== API ====================
import { B2PAPI } from "../../context/api";

const columns = [
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
    render: (text, record, index) => <span>{text != null && text != "" ? text : "-"}</span>,
  },
  {
    key: "extSupplierBranchCode",
    title: "External Branch Code",
    dataIndex: "extSupplierBranchCode",
    render: (text, record, index) => <span>{text != null && text != "" ? text : "-"}</span>,
  },
  {
    key: "customerTypeDesc",
    title: "Customer Type",
    dataIndex: "customerTypeDesc",
    render: (text, record, index) => <span>{text != null && text != "" ? text : "-"}</span>,
  },
];
export default function referenceInfoDetail() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);

  const router = useRouter();
  const { Option } = Select;

  const [flagApproval, setFlagApproval] = useState(false);
  const [status, setStatus] = useState("");
  const [supplierCode, setSupplierCode] = useState("");

  // =============== Table ==============
  const [dataSourceRef, setDataSourceRef] = useState([]);
  const [totalRecord, setTotalRecord] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [flagLoading, setFlagLoading] = useState(false);
  const [referenceCols, setReferenceCols] = useState(columns);

  // ================ action history ============
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [dataActionHis, setDataActionHis] = useState([]);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [totalRecordAction, setTotalRecordAction] = useState(0);

  // =================== Detail =================
  const [supplierDetail, setSupplierDetail] = useState({});

  // ================== Modal ===================
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [showRejectCard, setShowRejectCard] = useState(false);

  const handleRejectModalClose = () => setShowRejectCard(false);
  const handleRejectModalShow = () => setShowRejectCard(true);

  const handleApproveConfirmModalClose = () => setShowConfirmCard(false);
  const handleApproveConfirmModalShow = () => setShowConfirmCard(true);

  // ============== Approve & Reject =============
  const [reasonList, setReasonList] = useState([]);

  const columnsActionHistory = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Date Time",
      dataIndex: "dateTime",
      align: "center",
      key: "dateTime",
      align: "center",
    },
    {
      title: "By User",
      dataIndex: "by",
      key: "by",
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      render: (text) => <span>{text != null && text != "" ? text : "-"}</span>,
    },
  ];

  // const footerConfirm = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       onClick={() => {
  //         approveMapping();
  //         setShowConfirmCard(false);
  //       }}
  //     >
  //       Confirm
  //     </Button>
  //     <Button
  //       className="btn btn-orange"
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
  //       onClick={() => {
  //         rejectMapping();
  //         setShowRejectCard(false);
  //       }}
  //     >
  //       Confirm
  //     </Button>
  //     <Button
  //       className="btn btn-orange"
  //       onClick={() => {
  //         setShowRejectCard(false);
  //       }}
  //     >
  //       Close
  //     </Button>
  //   </div>
  // );

  useEffect(() => {
    initialData();
  }, [router]);

  const initialData = async () => {
    showLoading();
    const supplierCode = _.get(router.query, "supplierCode", "");
    if (supplierCode !== null && supplierCode !== "") {
      setSupplierCode(supplierCode);

      if (_.get(router.query, "flagApproval", "") == "true") {
        setFlagLoading(true);
        // --------------- get mapping reference approval detail ------------------
        setFlagApproval(true);
        const statusCol = {
          key: "statusDesc",
          title: "Status",
          dataIndex: "statusDesc",
        };
        setReferenceCols([...referenceCols, statusCol]);
        try {
          const mappingRefApprvDetailRes = await AppApi.getApi(
            "p2p/api/v1/view/mappingReferenceApprovalDetail",
            {
              supplierCode: supplierCode,
            },
            { method: "post", authorized: true }
          );
          if (mappingRefApprvDetailRes && mappingRefApprvDetailRes.status == 200) {
            const status = _.get(mappingRefApprvDetailRes.data, "statusCode", "");
            setStatus(status);

            if (status == "PFB01" || status == "PFB06") {
              // ----- get reason code when user can reject -------
              getReasonCode();
            }
            setSupplierDetail(_.get(mappingRefApprvDetailRes, "data", {}));
            const mappingRefApprvList = _.get(mappingRefApprvDetailRes.data, "mappingList", []).map((dataMapping, index) => ({ no: index + 1, ...dataMapping }));
            setDataSourceRef(mappingRefApprvList);
            setTotalRecord(mappingRefApprvList.length);
            setCurrentPage(1);

            const actionHistoryList = _.get(mappingRefApprvDetailRes.data, "historyList", []).map((action, index) => ({ no: index + 1, ...action }));
            setDataActionHis(actionHistoryList);
            setTotalRecordAction(actionHistoryList.length);
            setPageActionHis(1);
            setFlagLoading(false);
            hideLoading();
          } else {
            hideLoading();
            setFlagLoading(false);
            showAlertDialog({
              title: _.get(mappingRefApprvDetailRes, "data.error", "Error !"),
              text: _.get(mappingRefApprvDetailRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } catch (err) {
          hideLoading();
          setFlagLoading(false);
          ErrorHandle(err);
        }
      } else {
        setFlagLoading(true);
        // --------------- get mapping reference info detail ------------------
        setFlagApproval(false);
        try {
          const mappingRefDetailRes = await AppApi.getApi("p2p/api/v1/view/mappingReferenceDetail", { supplierCode: supplierCode }, { method: "post", authorized: true });
          if (mappingRefDetailRes && mappingRefDetailRes.status == 200) {
            setSupplierDetail(_.get(mappingRefDetailRes, "data", {}));
            const statusCode = _.get(mappingRefDetailRes.data, "statusCode", {}); // use this status
            setStatus(statusCode);
            const mappingRefList = _.get(mappingRefDetailRes.data, "mappingList", []).map((dataMapping, index) => ({ no: index + 1, ...dataMapping }));
            setDataSourceRef(mappingRefList);
            setTotalRecord(mappingRefList.length);
            setCurrentPage(1);

            const actionHistoryList = _.get(mappingRefDetailRes.data, "historyList", []).map((action, index) => ({ no: index + 1, ...action }));
            setDataActionHis(actionHistoryList);
            setTotalRecordAction(actionHistoryList.length);
            setPageActionHis(1);
            setFlagLoading(false);
            hideLoading();
          } else {
            hideLoading();
            setFlagLoading(false);
            showAlertDialog({
              title: _.get(mappingRefDetailRes, "data.error", "Error !"),
              text: _.get(mappingRefDetailRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } catch (err) {
          hideLoading();
          setFlagLoading(false);
          ErrorHandle(err);
        }
      }
    } else {
      window.history.back();
    }
  };

  const getReasonCode = async () => {
    try {
      const typeName = "PF"; // -- [PF = profile] ----
      const getReason = await AppApi.getApi(`p2p/api/v1/get/reasonCode/type/${typeName}`, {}, { method: "get", authorized: true });
      if (getReason && getReason.status == 200) {
        const reasonListItems = getReason.data.map((items) => {
          return { option: items.name, value: items.code };
        });
        setReasonList(reasonListItems);
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(getReason, "data.error", "Error !"),
          text: _.get(getReason, "data.message", ""),
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

  const approveMapping = async () => {
    showLoading();
    try {
      const approveMappingRes = await AppApi.getApi("p2p/api/v1/approve/mappingReferenceInfo", { supplierCode: supplierCode }, { method: "post", authorized: true });
      if (approveMappingRes && approveMappingRes.status == 200) {
        hideLoading();
        showAlertDialog({
          text: approveMappingRes.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/referenceInfoApprovalLists",
        });
      } else {
        hideLoading();
        //alert
        showAlertDialog({
          title: _.get(approveMappingRes, "data.error", "Error !"),
          text: _.get(approveMappingRes, "data.message", ""),
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

  const rejectMapping = async (values) => {
    showLoading();
    const requestBody = {
      supplierCode: supplierCode,
      code: values.code,
      note: values.note,
    };

    try {
      const rejectMappingRes = await AppApi.getApi("p2p/api/v1/reject/mappingReferenceInfo", requestBody, { method: "post", authorized: true });
      if (rejectMappingRes && rejectMappingRes.status == 200) {
        hideLoading();
        showAlertDialog({
          text: rejectMappingRes.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/referenceInfoApprovalLists",
        });

        // setShowSuccessCard(true);
        // setSuccessMessage(rejectMappingRes.data.message);
        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: "/profile/referenceInfoApprovalLists",
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(rejectMappingRes, "data.error", "Error !"),
          text: _.get(rejectMappingRes, "data.message", ""),
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

  // const showTotal = () => `${currentPage * pageSize - pageSize + 1} - ${totalRecord < currentPage * pageSize ? totalRecord : currentPage * pageSize} of ${totalRecord} items`;

  // const filterActionHistory = (currentPage, pageSize, dataAction) => {
  //   const allDataActionHis = dataAction || actionHis;
  //   const actionHisFilter = allDataActionHis
  //     .filter((data, index) => index + 1 >= currentPage * pageSize - pageSize + 1 && index + 1 <= currentPage * pageSize)
  //     .map((actHis, index) => ({ no: index + 1, ...actHis }));
  //   setDataActionHis(actionHisFilter);
  // };

  const onPageChange = (pagination, filters, sorter, extra) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const onChangePageActionHis = (pagination, filters, sorter, extra) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };

  return (
    <div className="container">
      <div className="bbl-font mb-3">
        <Breadcrumb separator=">">
          <Breadcrumb.Item>Profile</Breadcrumb.Item>
          <Breadcrumb.Item>Reference Info</Breadcrumb.Item>
          {flagApproval ? (
            <>
              <Breadcrumb.Item href="/profile/referenceInfoApprovalLists">Reference Info Approval Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Reference Info Approval</Breadcrumb.Item>
            </>
          ) : (
            <>
              <Breadcrumb.Item href="/profile/referenceInfoLists">Reference Info Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Reference Info Detail</Breadcrumb.Item>
            </>
          )}
        </Breadcrumb>
      </div>

      <div>
        {/** --------- Modal for show Response type Success -------------- */}
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
            approveMapping();
            handleApproveConfirmModalClose();
          }}
          onClose={() => {
            handleApproveConfirmModalClose();
          }}
        >
          Please confirm to approve this Reference Info.
        </DialogConfirm>

        {/* <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
          <div className="text-center">
            <span style={{ fontWeight: "500", fontSize: "17px" }}>Please confirm to approve this Reference Info.</span>
          </div>
        </Modal> */}

        {/** --------- Modal for select refect reason -------------- */}
        <DialogReason
          mode="Reject"
          title={<>Reject Reference Info</>}
          onFinish={rejectMapping}
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
              <h5 style={{ fontSize: "17px", fontWeight: "500" }}>Reject Reference Info</h5>
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
      </div>

      <ReferenceInfo
        columns={referenceCols}
        dataSource={dataSourceRef}
        current={currentPage}
        pageSize={pageSize}
        total={totalRecord}
        loading={flagLoading}
        onChange={onPageChange}
        supplierDetail={supplierDetail}
        flagEdit={false}
        showPagination={true}
      />
      <hr style={{ borderColor: "#456fb6", borderWidth: "2px" }} />

      <Button
        className="btn btn-blue-transparent"
        onClick={() => {
          setFlagActionHis(!flagActionHis);
        }}
      >
        Action History
        <DownOutlined rotate={!flagActionHis ? 180 : ""} style={{ fontSize: "12px", marginLeft: "10px" }} />
      </Button>

      {flagActionHis && (
        <div className="mt-3 mb-3">
          <TableBlue
            dataSource={dataActionHis}
            columns={columnsActionHistory}
            total={totalRecordAction}
            onChange={onChangePageActionHis}
            current={pageActionHis}
            pageSize={pageActionHisSize}
            showPagination={true}
          />
        </div>
      )}

      <div className="row justify-content-md-center mt-5">
        {flagApproval && (status == "PFB01" || status == "PFB06") && (
          <>
            {isAllow("P6403", ["APPROVE"]) && (
              <Button
                className="btn btn-blue mr-2"
                onClick={() => {
                  handleApproveConfirmModalShow();
                }}
              >
                Approve
              </Button>
            )}
            {isAllow("P6403", ["REJECT"]) && (
              <Button
                className="btn btn-orange mr-2"
                onClick={() => {
                  handleRejectModalShow();
                }}
              >
                Reject
              </Button>
            )}
          </>
        )}

        {((status == "PFB08" && !flagApproval) || (flagApproval && (status == "PFB09" || status == "PFB11"))) && (isAllow("P6403", ["EDIT"]) || isAllow("P6402", ["EDIT"])) && (
          <Button
            className="btn btn-blue mr-2"
            onClick={() => {
              showLoading();
              router.push(
                {
                  pathname: `/profile/addEditReferenceInfo`,
                  query: {
                    supplierCode: supplierCode,
                    status: status,
                    flagApproval: flagApproval,
                    flagPath: true,
                  },
                },
                `/profile/addEditReferenceInfo`
              );
            }}
          >
            Edit
          </Button>
        )}

        <Button
          type="button"
          className="btn btn-blue-transparent"
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
    </div>
  );
}

referenceInfoDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
