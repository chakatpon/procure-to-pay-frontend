import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from "next/router";
import Link from "next/link";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

//----------------- UI -------------------
import Layout from "../components/layout";
import { Descriptions, Button, Breadcrumb, Table, Pagination, Modal, Result, Select, Input } from "antd";
import { UpOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import TableBlue from "../components/TableBlue";

//------------------ API -----------------
import { B2PAPI } from "../../context/api";
import _, { get } from "lodash";

export default function supplierDetail() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow, getStorage } = useContext(StoreContext);
  const router = useRouter();

  //=============== Detail ============
  const [supplierCode, setSupplierCode] = useState("");
  const [mainBranchId, setMainBranchId] = useState("");
  const [supplierDetail, setSupplierDetail] = useState({});
  const [branchCode, setBranchCode] = useState("");
  const [companyCode, setCompanyCode] = useState("");

  // =============== Table ==============
  const [dataActionHis, setDataActionHis] = useState([]);
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [loadingAction, setLoadingAction] = useState(false);

  const [suppBranchData, setSuppBranchData] = useState([]);
  

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

  const supplierBranchCol = [
    {
      key: "no",
      title: "No",
      dataIndex: "no",
      align: "center",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      key: "supplierBranchCode",
      title: "Branch Code",
      align: "center",
      dataIndex: "supplierBranchCode",
      render: (text, record, index) =>
        text == _.get(supplierDetail, "supplierBranchCode", "") ? (
          <span>{text}</span>
        ) : (
          // <Link
          //   href={{
          //     pathname: '/profile/supplierDetail',
          //   }}
          //   as="/profile/supplierBranch"
          // >
          <a
            className="btn-text blue"
            onClick={() => {
              showLoading();
              const supplierCompCode = _.get(record, "supplierCompCode", "");
              const supplierBranchCode = _.get(record, "supplierBranchCode", "");
              setBranchCode(supplierBranchCode);
              setSupplierCode(supplierCompCode);
              initialData(supplierCompCode, supplierBranchCode);
            }}
            style={{ textDecoration: "underline" }}
            key={index}
          >
            {text}
          </a>
          // </Link>
        ),
    },
    {
      key: "supplierBranchName",
      title: "Branch Name",
      dataIndex: "supplierBranchName",
    },
    {
      key: "supplierTaxId",
      title: "Tax ID",
      dataIndex: "supplierTaxId",
    },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      render: (text) => (text === true ? <CheckCircleOutlined style={{ fontSize: "18px", color: "#1BAA6E" }} /> : <CloseCircleOutlined style={{ fontSize: "18px", color: "#C12C20" }} />),
    },
  ];

  useEffect(async () => {
    const supplierCode = _.get(router.query,"supplierCode",null);

    // ----- when redirect from notification will have supplierBranchCode in query ----
    const supplierBranchCode = _.get(router.query,"supplierBranchCode",""); 
    setBranchCode(supplierBranchCode)
    // ****** --------------------------- *******
    
    setSupplierCode(supplierCode);
    setMainBranchId(supplierCode);
    initialData(supplierCode,supplierBranchCode);
  }, [router]);

  const initialData = async (supplierCode, supplierBranchCode = "") => {
    showLoading();
    if (supplierCode !== null && supplierCode !== undefined) {
      setLoadingAction(true);

      // --------- process to get companyCode from userData on localstorage --------
      const userData = getStorage("userData");
      const companyCode = _.get(userData, "companyCode", "");
      setCompanyCode(companyCode);
      // ---------------------- end of process ---------------

      try {
        if (supplierBranchCode !== "") {
          // ================== view supplier branch profile detail =====================

          const resViewSupplierBranch = await AppApi.getApi(
            "p2p/api/v1/view/supplier/branch/profile",
            { supplierCode: supplierCode, supplierBranchCode: supplierBranchCode },
            { method: "post", authorized: true }
          );
          if (resViewSupplierBranch && resViewSupplierBranch.status == 200) {
            setSupplierDetail(_.get(resViewSupplierBranch, "data", {}));
            const actionHis = _.get(resViewSupplierBranch.data, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
            setDataActionHis(actionHis);
            setTotalRecordAction(actionHis.length);
            hideLoading();
            setLoadingAction(false);
          } else {
            hideLoading();
            setLoadingAction(false);
            showAlertDialog({
              title: _.get(resViewSupplierBranch, "data.error", "Error !"),
              text: _.get(resViewSupplierBranch, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        } else {
          // ================== view supplier profile detail =====================

          const resViewSupplier = await AppApi.getApi("p2p/api/v1/view/supplier/profile", { supplierCode: supplierCode }, { method: "post", authorized: true });
          if (resViewSupplier && resViewSupplier.status == 200) {
            setSupplierDetail(_.get(resViewSupplier, "data", {}));
            const actionHis = _.get(resViewSupplier.data, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
            setDataActionHis(actionHis);
            setTotalRecordAction(actionHis.length);
            setSuppBranchData(_.get(resViewSupplier.data, "branchList", []));
            hideLoading();
            setLoadingAction(false);
          } else {
            hideLoading();
            setLoadingAction(false);
            showAlertDialog({
              title: _.get(resViewSupplier, "data.error", "Error !"),
              text: _.get(resViewSupplier, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
          }
        }
      } catch (err) {
        hideLoading();
        setLoadingAction(false);
        ErrorHandle(err);
      }
    } else {
      hideLoading();
      Router.push("/profile/supplierLists");
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
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Supplier Profile</Breadcrumb.Item>
              <Breadcrumb.Item href="/profile/supplierLists">Supplier Profile Lists</Breadcrumb.Item>
              {branchCode !== "" ? (
                <Breadcrumb.Item
                  href="#"
                  onClick={() => {
                    showLoading();
                    setBranchCode("");
                    setSupplierCode(mainBranchId);
                    initialData(mainBranchId);
                  }}
                >
                  Supplier Detail
                </Breadcrumb.Item>
              ) : (
                <Breadcrumb.Item className="breadcrumb-item active">Supplier Detail</Breadcrumb.Item>
              )}
              {branchCode !== "" && <Breadcrumb.Item className="breadcrumb-item active">Supplier Branch Profile</Breadcrumb.Item>}
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
              <h5 style={{ color: "#003399", marginBottom: "20px", fontWeight: "bold" }}>{branchCode !== "" ? "Supplier Branch Detail" : "Supplier Detail"}</h5>

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
          {branchCode == "" && (
            <>
              <div className="row justify-content-between mt-8 mb-5">
                <p
                  style={{
                    fontSize: "15px",
                    color: "#003399",
                    marginBottom: "20px",
                    fontWeight: "bold",
                  }}
                >
                  Supplier Branch
                </p>

                {isAllow("P6201", ["BRANCH_CREATE_EDIT", "CREATE"]) && _.get(supplierDetail, "supplierCompCode", "") == companyCode && (
                  <Button
                    className="btn btn-blue mr-2"
                    shape="round"
                    onClick={() => {
                      showLoading();
                      router.push(
                        {
                          pathname: "/profile/addEditSupplierBranchProfile",
                          query: {
                            supplierNameTH: _.get(supplierDetail, "supplierCompNameTH", ""),
                            supplierNameEN: _.get(supplierDetail, "supplierCompNameEN", ""),
                            supplierCompCode: supplierCode,
                          },
                        },
                        "/profile/addEditSupplierBranchProfile"
                      );
                    }}
                  >
                    Create
                  </Button>
                )}
              </div>
              <TableBlue dataSource={suppBranchData} columns={supplierBranchCol} />
              <br />
              <hr />
            </>
          )}

          <Button
            className="btn btn-blue-transparent mb-10"
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
            {branchCode !== "" &&
              (_.get(supplierDetail, "statusCode", "") == "PFS08" || _.get(supplierDetail, "statusCode", "") == "PFS11") &&
              isAllow("P6201", ["EDIT", "BRANCH_CREATE_EDIT"]) &&
              _.get(supplierDetail, "supplierCompCode", "") == companyCode && (
                <Button
                  className="btn btn-blue mr-2"
                  shape="round"
                  onClick={() => {
                    showLoading();
                    Router.push(
                      {
                        pathname: `/profile/addEditSupplierBranchProfile`,
                        query: { id: supplierCode, supplierBranchCode: branchCode, branch: true },
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
                if (branchCode !== "") {
                  setBranchCode("");
                  setSupplierCode(mainBranchId);
                  initialData(mainBranchId);
                } else {
                  window.history.back();
                }
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

supplierDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
