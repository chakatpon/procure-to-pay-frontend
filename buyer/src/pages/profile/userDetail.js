import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";
import _ from "lodash";
import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// ----------------- UI --------------------
import Layout from "../components/layout";
import { Descriptions, Modal, Button, Table, Result, Input, Select, Breadcrumb, Pagination, Form } from "antd";
import { DownOutlined } from "@ant-design/icons";
import TableBlue from "../components/TableBlue";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";

// --------------------- API ----------------------
import { B2PAPI } from "../../context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";
export default function userDetail() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const router = useRouter();
  const { Option } = Select;

  // -------------- Modal -------------------
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [showRejectCard, setShowRejectCard] = useState(false);

  const handleRejectModalClose = () => setShowRejectCard(false);
  const handleRejectModalShow = () => setShowRejectCard(true);

  const handleApproveConfirmModalClose = () => setShowConfirmCard(false);
  const handleApproveConfirmModalShow = () => setShowConfirmCard(true);

  // ---------- data detail ---------
  const [id, setId] = useState(0);
  const [userDetail, setUserDetail] = useState({});
  const [status, setStatus] = useState("");

  // ---------- company access --------
  const [dataCompany, setDataCompany] = useState([]);
  const [pageCompany, setPageCompany] = useState(1);
  const [pageCompanySize, setPageCompanySize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [loadingComp, setLoadingComp] = useState(false);

  // ---------- action history --------
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [dataActionHis, setDataActionHis] = useState([]);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [loadingActionHis, setLoadingActionHis] = useState(false);

  // ----------- Approve & Reject ---------
  const [reasonList, setReasonList] = useState([]);

  const columnsCompanyAccess = [
    {
      title: "No",
      dataIndex: "no",
      key: "no",
      width: "10%",
      align: "center",
    },
    {
      title: "Company Code",
      dataIndex: "companyCode",
      key: "companyCode",
    },
    {
      title: "Company Name",
      dataIndex: "companyName",
      key: "companyName",
    },
    {
      title: "Branch Name",
      dataIndex: "branchName",
      key: "branchName",
    },
    {
      title: "Branch Code",
      dataIndex: "branchCode",
      key: "branchCode",
    },
  ];

  const columnsActionHistory = [
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
    },
    {
      title: "Date Time",
      dataIndex: "dateTime",
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
  //         approveUser();
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
  //         rejectUser();
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

  useEffect(async () => {
    hideLoading();
    await getInitialData();
  }, [router]);

  const getInitialData = async () => {
    const id = _.get(router.query, "id", "");
    setId(id);
    showLoading();
    setLoadingActionHis(true);
    setLoadingComp(true);
    const idRequest = {
      id: id,
    };
    await getUserDetail(idRequest);
    getActionHistory(idRequest);
    hideLoading();
  };

  const getUserDetail = async (id) => {
    try {
      if (id.id !== "" && id.id !== null) {
        const getUserDetail = await AppApi.getApi("p2p/api/v1/view/user/profile", id, {
          method: "post",
          authorized: true,
        });
        if (getUserDetail && getUserDetail.status === 200) {
          const statusCode = _.get(getUserDetail.data,"statusCode");
          if (statusCode == "PFB01" || statusCode == "PFB06") {
            getReasonCode();
          }
          setStatus(statusCode);
          setUserDetail(getUserDetail.data);
          const companyAccess = _.get(getUserDetail.data, "companyAccessList", []).map((company, index) => ({ no: index + 1, ...company }));
          setDataCompany(companyAccess);
          setTotalRecord(companyAccess.length);
          setLoadingComp(false);
        } else {
          hideLoading();
          setLoadingComp(false);
          // ---- alert
          showAlertDialog({
            title: _.get(getUserDetail, "data.error", "Error !"),
            text: _.get(getUserDetail, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
        }
      } else {
        Router.push({
          pathname: "/profile/usersLists",
        });
      }
    } catch (err) {
      hideLoading();
      setLoadingComp(false);
      ErrorHandle(err);
    }
  };

  const getActionHistory = async (id) => {
    try {
      const getActionHistory = await AppApi.getApi("p2p/api/v1/view/history/user/profile", id, { method: "post", authorized: true });
      if (getActionHistory && getActionHistory.status === 200) {
        const actionHis = _.get(getActionHistory.data, "items", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
        setDataActionHis(actionHis);
        setTotalRecordAction(actionHis.length);
        setLoadingActionHis(false);
      } else {
        // ---- alert
        setLoadingActionHis(false);
        showAlertDialog({
          title: _.get(getActionHistory, "data.error", "Error !"),
          text: _.get(getActionHistory, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      setLoadingActionHis(false);
      ErrorHandle(err);
    }
  };

  const getReasonCode = async () => {
    try {
      const typeName = "PF"; // -- [PF = profile] ----
      const getReason = await AppApi.getApi(
        `p2p/api/v1/get/reasonCode/type/${typeName}`,
        {},
        {
          method: "get",
          authorized: true,
        }
      );
      if (getReason && getReason.status == 200) {
        const reasonListItems = getReason.data.map((items) => {
          return { option: items.name, value: items.code };
        });
        setReasonList(reasonListItems);
      } else {
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

  // const onCheckPermission = (namePermiss) => {
  //   const permission = permissionOfPage || [];
  //   return _.some(permission, (permiss) => permiss == namePermiss);
  // };

  const approveUser = async () => {
    showLoading();
    const requestBody = {
      id: id,
    };

    try {
      const approveUserRes = await AppApi.getApi("p2p/api/v1/approve/user/profile", requestBody, { method: "post", authorized: true });
      if (approveUserRes && approveUserRes.status == 200) {
        showAlertDialog({
          text: approveUserRes.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/usersLists",
        });

        hideLoading();

        /*setShowSuccessCard(true);
        setSuccessMessage(approveUserRes.data.message);
        const timeOut = setTimeout(() => {
          Router.push({
            pathname: "/profile/usersLists",
          });
          clearTimeout(timeOut);
        }, 4000);*/
      } else {
        hideLoading();
        //alert
        showAlertDialog({
          title: _.get(approveUserRes, "data.error", "Error !"),
          text: _.get(approveUserRes, "data.message", ""),
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

  const rejectUser = async (values) => {
    // console.log("values : ", values);
    showLoading();
    const requestBody = {
      id: id,
      code: values.code,
      note: values.note,
    };

    try {
      const rejectUserRes = await AppApi.getApi("p2p/api/v1/reject/user/profile", requestBody, { method: "post", authorized: true });
      if (rejectUserRes && rejectUserRes.status == 200) {
        showAlertDialog({
          text: rejectUserRes.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: "/profile/usersLists",
        });
        hideLoading();

        /*setShowSuccessCard(true);
        setSuccessMessage(rejectUserRes.data.message);

        const timeOut = setTimeout(() => {
          Router.push({
            pathname: "/profile/usersLists",
          });
          clearTimeout(timeOut);
        }, 4000);*/
      } else {
        hideLoading();
        showAlertDialog({
          title: _.get(rejectUserRes, "data.error", "Error !"),
          text: _.get(rejectUserRes, "data.message", ""),
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

  const onChange = (pagination, filters, sorter, extra) => {
    setPageCompany(pagination.current);
    setPageCompanySize(pagination.pageSize);
  };

  const onChangePageActionHis = (pagination, filters, sorter, extra) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };

  return (
    // <div className="row justify-content-md-center">
    //   <div className="col-11">
    <div className="container">
      <div className="row bbl-font mt-3 mb-3">
        <Breadcrumb separator=">">
          <Breadcrumb.Item>Profile</Breadcrumb.Item>
          <Breadcrumb.Item>User Profile</Breadcrumb.Item>
          <Breadcrumb.Item href={"/profile/usersLists"}>User Profile Lists</Breadcrumb.Item>
          <Breadcrumb.Item className="breadcrumb-item active"> {status == "PFB01" || status == "PFB06" ? "User Profile Approval" : "User Profile"}</Breadcrumb.Item>
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
            setShowSuccessCard(false);
            setShowErrorCard(false);
          }}
        >
          <Result status={showSuccessCard ? "success" : "error"} title={<p>{showSuccessCard ? successMessage : errorMessage}</p>} />
        </Modal> */}

        {/** --------- Modal for confirm -------------- */}
        {/* <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
          <div className="text-center">
            <span style={{ fontWeight: "500", fontSize: "17px" }}>Please confirm to approve this User.</span>
          </div>
        </Modal> */}

        <DialogConfirm
          visible={showConfirmCard}
          closable={false}
          onFinish={() => {
            approveUser();
            handleApproveConfirmModalClose();
          }}
          onClose={() => {
            handleApproveConfirmModalClose();
          }}
        >
          Please confirm to approve this User.
        </DialogConfirm>

        {/** --------- Modal for select refect reason -------------- */}

        <DialogReason
          mode="Reject"
          title={<>Reject User</>}
          onFinish={rejectUser}
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
              <h5 style={{ fontSize: "17px", fontWeight: "500" }}>Reject User</h5>
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

      <div className="row ml-3 mt-8">
        {userDetail.picture && (
          <div>
            <img src={"data:image/png;base64," + `${userDetail.picture}`} className="border-img mr-3" style={{ width: "180px", height: "180px", objectFit: "contain" }} />
          </div>
        )}

        <div className="row col-9">
          <div className="col-9">
            <h4 style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>User Details</h4>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Username">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "username", "-")}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="User Role">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "role", "-") !== null ? _.get(userDetail, "role", "-") : <span>-</span>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="First Name">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "firstName", "-")}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Last Name">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "lastName", "-")}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Email">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "email", "-")}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Mobile No.">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "mobileNo", "-") !== null ? _.get(userDetail, "mobileNo", "-") : <span>-</span>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Office No.">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "officeTelNo", "-") !== null ? _.get(userDetail, "officeTelNo", "-") : <span>-</span>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Buyer Code">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "companyCode", "-") !== null ? _.get(userDetail, "companyCode", "-") + ": " + _.get(userDetail, "companyName", "-") : <span>-</span>}
              </Descriptions.Item>
            </Descriptions>

            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="Branch Code">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "branchCode", "-") !== null ? _.get(userDetail, "branchCode", "-") + ": " + _.get(userDetail, "branchName", "-") : <span>-</span>}
              </Descriptions.Item>
            </Descriptions>
            <Descriptions colon={false} labelStyle={{ width: "30%" }}>
              <Descriptions.Item label="User Status">
                <div style={{ marginRight: "12%" }}> : </div>
                {_.get(userDetail, "isActive", "-") == true ? <span>Active</span> : <span>Inactive</span>}
              </Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </div>

      <hr />

      <p style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>Company Access</p>
      <TableBlue
        dataSource={dataCompany}
        columns={columnsCompanyAccess}
        total={totalRecord}
        onChange={onChange}
        current={pageCompany}
        pageSize={pageCompanySize}
        loading={loadingComp}
        showPagination={true}
      />
      {/* <Table rowKey="no" pagination={false} dataSource={dataCompany} columns={columnsCompanyAccess} />
      <Pagination
        className="justify-content-end pagination"
        total={totalRecord}
        onChange={onChangePagination}
        showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
        current={pageCompany}
        showSizeChanger
        pageSize={pageCompanySize}
        defaultCurrent={1}
        defaultPageSize={10}
      /> */}

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
            loading={loadingActionHis}
            showPagination={true}
          />
          {/* <Table className="table-header-blue" rowKey={(record) => record.no} pagination={false} dataSource={dataActionHis} columns={columnsActionHistory} />
          <Pagination
            className="pagination justify-content-end"
            total={totalRecordAction}
            onChange={onChangePageActionHis}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
            current={pageActionHis}
            showSizeChanger
            pageSize={pageActionHisSize}
            defaultCurrent={1}
            defaultPageSize={10}
          /> */}
        </div>
      )}

      <div className="row justify-content-md-center">
        {(status == "PFB01" || status == "PFB06") && (
          <>
            {isAllow("P6302", ["APPROVE"]) && (
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  // setShowConfirmCard(true);
                  handleApproveConfirmModalShow();
                }}
              >
                Approve
              </Button>
            )}

            {isAllow("P6302", ["REJECT"]) && (
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
        {(status == "PFB08" || status == "PFB09" || status == "PFB11") && isAllow("P6302", ["EDIT"]) && (
          <Button
            className="btn btn-blue mr-2"
            shape="round"
            onClick={() => {
              showLoading();
              router.push(
                {
                  pathname: `/profile/addEditUserProfile`,
                  query: { id: id, status: status, flagPath: true },
                },
                `/profile/addEditUserProfile`
              );
            }}
          >
            Edit
          </Button>
        )}
        <Button
          className="btn btn-blue-transparent mr-2"
          onClick={() => {
            showLoading();
            window.history.back();
          }}
        >
          Back
        </Button>
      </div>
    </div>
    //   </div>
    // </div>
  );
}

userDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
