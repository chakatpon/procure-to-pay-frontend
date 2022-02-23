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
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const router = useRouter();

  //=============== Detail ============
  const [id, setId] = useState("");
  const [supplierDetail, setSupplierDetail] = useState({});

  // =============== Table ==============
  const [dataActionHis, setDataActionHis] = useState([]);
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [loadingAction, setLoadingAction] = useState(false);

  // -------------- Modal -------------------
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showErrorCard, setShowErrorCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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
    const { id } = router.query;
    setId(id);
    initialData(id);
  }, [router]);

  const initialData = async (id) => {
    showLoading();
    try {
      if (id !== null && id !== undefined) {
        setLoadingAction(true);
        // ================== view supplier profile detail =====================
        const resViewSupplier = await AppApi.getApi("p2p/api/v1/view/supplier/profile", { supplierCode: id }, { method: "post", authorized: true });
        if (resViewSupplier && resViewSupplier.status == 200) {
          setSupplierDetail(_.get(resViewSupplier, "data", {}));
          const actionHis = _.get(resViewSupplier.data, "historyList", []).map((actHis, index) => ({ no: index + 1, ...actHis }));
          setDataActionHis(actionHis);
          setTotalRecordAction(actionHis.length);
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
          // setErrorMessage(_.get(resViewSupplier.data, "message", "Something went wrong."));
          // setShowErrorCard(true);
        }
      } else {
        Router.push("/profile/supplierLists");
      }
    } catch (err) {
      hideLoading();
      setLoadingAction(false);
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
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Supplier Profile</Breadcrumb.Item>
              <Breadcrumb.Item href="/profile/supplierLists">Supplier Profile Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Supplier Detail</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/** --------- Modal for show Response type Success and Error -------------- */}
          <Modal
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
          </Modal>

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
              <h5 style={{ color: "#003399", marginBottom: "20px", fontWeight: "bold" }}>Supplier Profile</h5>

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
            {(_.get(supplierDetail, "statusCode", "") == "PFK08" || _.get(supplierDetail, "statusCode", "") == "PFS08") && isAllow("P6202", ["EDIT"]) && (
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  Router.push(
                    {
                      pathname: `/profile/addEditSupplierApproval`,
                      query: { id: id, flagPath: true, flagSupplierOn: true },
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
                Router.push({
                  pathname: "/profile/supplierLists",
                });
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
