import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";

import _, { map, get } from "lodash";
import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

// ---------------------- UI -----------------------
import Layout from "../components/layout";
import { Button, Table, Form, Input, Select, Breadcrumb, Modal, Result } from "antd";
import BBLTableList from "../components/BBLTableList";

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function referenceInfoApprovalLists() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const { Option } = Select;
  const router = useRouter();
  const [form] = Form.useForm();

  // ------------  Search -----------
  const [supplierName, setSupplierName] = useState("");
  const [status, setStatus] = useState("");
  const [searchList, setSearchList] = useState({});

  // ----------------- Table -------------------
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [sortValue, setSortValue] = useState({});
  const [refInfoApprvData, setRefInfoApprvData] = useState([]); // ------ variable for temporary storage data reference info approval -----

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

  // ----------------- Modal -----------------------
  const [showErrorCard, setShowErrorCard] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const statusOptions = [
    {
      value: "",
      label: "All",
    },
    {
      value: "PFB01",
      label: "Waiting Create Approval",
    },
    {
      value: "PFB06",
      label: "Waiting Modify Approval",
    },
    {
      value: "PFB11",
      label: "Rejected Creating",
    },
    {
      value: "PFB09",
      label: "Rejected Modifying",
    },
  ];

  const RefInfoColumns = [
    {
      key: "no",
      title: "No.",
      dataIndex: "no",
      sorter: true,
      align: "center",
      sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
    },
    {
      key: "supplierNameTH",
      title: "Supplier Name(TH)",
      dataIndex: "supplierNameTH",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierNameTH' && sortedInfo.order,
      render: (text, record, index) => (
        <Link
          onClick={() => showLoading()}
          href={{
            pathname: "/profile/referenceInfoDetail",
            query: {
              supplierCode: record.supplierCode,
              flagApproval: true,
            },
          }}
          as="/profile/referenceInfoDetail"
        >
          <a className="btn-text blue" style={{ textDecoration: "underline" }} key={index}>
            {text}
          </a>
        </Link>
      ),
    },
    {
      key: "supplierNameEN",
      title: "Supplier Name(EN)",
      dataIndex: "supplierNameEN",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierNameEN' && sortedInfo.order,
    },
    {
      key: "extSupplierCode",
      title: "External Supplier Code",
      dataIndex: "extSupplierCode",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'extSupplierCode' && sortedInfo.order,
    },
    {
      key: "createDateStr",
      title: "Create Date",
      dataIndex: "createDateStr",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'createDateStr' && sortedInfo.order,
    },
    {
      key: "statusCode",
      title: "Status",
      dataIndex: "statusCode",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'statusCode' && sortedInfo.order,
      render: (text, record, index) => <span dangerouslySetInnerHTML={{ __html: record.statusDesc }}></span>,
    },
  ];

  useEffect(async () => {
    hideLoading();
    await initialData();
  }, []);

  const initialData = async () => {
    setIsLoadingTable(true);
    try {
      const resInquiryRefInfoAppv = await AppApi.getApi("p2p/api/v1/get/mappingReferenceApprovalList", {}, { method: "get", authorized: true });
      if (resInquiryRefInfoAppv && resInquiryRefInfoAppv.status == 200) {
        const referenceInfo = _.get(resInquiryRefInfoAppv.data, "items", []).map((refInfo, index) => ({ no: index + 1, ...refInfo }));

        setRefInfoApprvData(_.get(resInquiryRefInfoAppv.data, "items", []));
        setDataSource(referenceInfo);
        setCurrent(current);
        setTotalRecord(_.get(resInquiryRefInfoAppv.data, "totalRecord", 0));
        setIsLoadingTable(false);
      } else {
        setIsLoadingTable(false);
        // alert
        showAlertDialog({
          title: _.get(resInquiryRefInfoAppv, "data.error", "Error !"),
          text: _.get(resInquiryRefInfoAppv, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      setIsLoadingTable(false);
      ErrorHandle(err);
    }
  };

  // const showTotal = () => `${current * pageSize - pageSize + 1} - ${totalRecord < current * pageSize ? totalRecord : current * pageSize} of ${totalRecord} items`;

  const pageChanger = async (pagination, filters, sorter, extra) => {
    setSortedInfo(sorter)
    const refInfoApprvDataList = dataSource; // ----- reference info approval current data -----
    let refInfoApprvList = refInfoApprvDataList.map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    let currentPage = pagination.current;
    const pageSizeOld = pageSize; //---- pageSize old for check when change page size -------
    if (pageSizeOld !== pagination.pageSize) {
      currentPage = 1;
    }

    if (_.get(searchList, "supplierName", "") == supplierName && _.get(searchList, "status", "") == status) {
      refInfoApprvList = onFilterRefInfoApprv();
    }

    if (extra.action == "sort") {
      currentPage = 1;
      refInfoApprvList = _.orderBy(refInfoApprvDataList, sorter.field, sorter.order === "descend" ? "desc" : "asc").map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    }

    setDataSource(refInfoApprvList);
    setTotalRecord(refInfoApprvList.length);
    setCurrent(currentPage);
    setPageSize(pagination.pageSize);
  };

  const onSearchList = async () => {
    setIsLoadingTable(true);
    const refInfoApprovalList = onFilterRefInfoApprv();
    setSearchList({
      supplierName: supplierName,
      status: status,
    });
    setDataSource(refInfoApprovalList);
    setTotalRecord(refInfoApprovalList.length);
    setCurrent(1);
    setIsLoadingTable(false);
  };

  const onFilterRefInfoApprv = () => {
    const refInfoApprovalList = _.filter(
      refInfoApprvData,
      (data) =>
        (_.toLower(data.supplierNameTH).search(_.toLower(supplierName)) !== -1 || _.toLower(data.supplierNameEN).search(_.toLower(supplierName)) !== -1) &&
        _.toLower(data.statusCode).includes(_.toLower(status))
    ).map((refInfofilter, index) => ({ no: index + 1, ...refInfofilter }));

    return refInfoApprovalList;
  };

  const onClearSearch = async () => {
    setCurrent(1)
    setSupplierName("");
    setStatus("");
    setSearchList({});

    setSortedInfo({ columnKey: null, order: null })

    setIsLoadingTable(true);
    const referenceInfo = refInfoApprvData.map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    setDataSource(referenceInfo);
    setTotalRecord(refInfoApprvData.length);
    setCurrent(1);
    setIsLoadingTable(false);
  };

  return (
    <div className="container-fluid px-0">
      {/*  Search Bar */}
      <section className="mb-8">
        <div className="container">
          {/* <!-- #searchForm - Start --> */}
          <div id="box-header" className="col-12 mb-10">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>Reference Info</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Reference Info Approval Lists</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/*  / ------------- Modal for Show Error --------- */}
          <Modal
            title=" "
            footer={null}
            visible={showErrorCard}
            closable={false}
            onCancel={() => {
              setShowErrorCard(false);
              setShowSuccessCard(false);
            }}
          >
            <Result status="error" title={showErrorCard && <p>{errorMessage}</p>} />
          </Modal>
          <form id="searchForm" name="searchForm" action="" className="form">
            <div className="row">
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Supplier Name</label>
                <div className="controls">
                  <input
                    type="text"
                    name="supplierName"
                    id="supplierName"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        onSearchList()
                      }
                    }}
                  />
                </div>
              </div>

              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Status</label>
                <div className="controls">
                  <Select
                    style={{ width: "100%" }}
                    id="status"
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                    }}
                  >
                    {statusOptions.length > 0 &&
                      statusOptions.map((status) => (
                        <Option value={status.value} key={status.value}>
                          {status.label}
                        </Option>
                      ))}
                  </Select>
                </div>
              </div>

              <div className="col-sm-12 col-md-3 col-lg-3 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center text-xl-right">
                <Button type="button" name="btnSearch" id="btnSearch" className="btn btn-blue" onClick={onSearchList}>
                  Search
                </Button>
                <Button type="reset" name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onClearSearch}>
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </div>
      </section>

      <div className="line-gap"></div>
      <section id="page-content" className="mt-5">
        <div className="ml-10 mr-10">
          {isAllow("P6403", ["CREATE"]) && (
            <div className="text-right">
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  showLoading();
                  Router.push(
                    {
                      pathname: "/profile/addEditReferenceInfo",
                      query: { flagPath: true }, // flag path for manage breadcrumb
                    },
                    "/profile/addEditReferenceInfo"
                  );
                }}
              >
                ADD
              </Button>
            </div>
          )}

          <div className="mt-8">
            <BBLTableList columns={RefInfoColumns} dataSource={dataSource} total={totalRecord} current={current} pageSize={pageSize} loading={isLoadingTable} onChange={pageChanger} />
          </div>
        </div>
      </section>
    </div>
  );
}

referenceInfoApprovalLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
