import React, { useEffect, useState, useContext } from "react";
import Link from "next/link";
import Router, { useRouter } from "next/router";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

import _, { get } from "lodash";

// ---------------------- UI -----------------------
import Layout from "../components/layout";
import { Button, Form, Input, Breadcrumb, Select, Modal, Result } from "antd";
import BBLTableList from "../components/BBLTableList";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function branchApprovalLists() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const branch = "Supplier";
  const { Option } = Select;

  // ------------  Search -----------
  const [branchCode, setBranchCode] = useState("");
  const [branchName, setBranchName] = useState("");
  const [supplierName, setSupplierName] = useState("");
  const [active, setActive] = useState("");
  const [status, setStatus] = useState("");
  const [searchList, setSearchList] = useState([]);

  // ----------------- Table -------------------
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [totalItem, setTotalItem] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [sortValue, setSortValue] = useState({});

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

  const statusOptions = [
    {
      value: "",
      label: "All",
    },
    {
      value: "PFS01",
      label: "Waiting Create Approval",
    },
    {
      value: "PFS06",
      label: "Waiting Modify Approval",
    },
    {
      value: "PFS11",
      label: "Rejected Creating",
    },
    {
      value: "PFS09",
      label: "Rejected Modifying",
    },
  ];

  const BranchApprovalColumns = [
    {
      key: "no",
      title: "No.",
      dataIndex: "no",
      sorter: true,
      align: "center",
      sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
    },
    {
      key: "supplierBranchCode",
      title: "Branch Code",
      dataIndex: "supplierBranchCode",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierBranchCode' && sortedInfo.order,
      render: (text, record, index) => (
        <Link
          onClick={() => showLoading()}
          href={{
            pathname: "/profile/branchApprovalDetail",
            query: { id: record.id, status: record.statusCode },
          }}
          as="/profile/branchApprovalDetail"
        >
          <a className="btn-text blue" style={{ textDecoration: "underline" }} key={index}>
            {text}
          </a>
        </Link>
      ),
    },
    {
      key: "supplierBranchName",
      title: "Branch Name",
      dataIndex: "supplierBranchName",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierBranchName' && sortedInfo.order,
    },
    {
      key: "supplierCompNameTH",
      title: "Supplier Name (TH)",
      dataIndex: "supplierCompNameTH",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierCompNameTH' && sortedInfo.order,
    },
    {
      key: "supplierCompNameEN",
      title: "Supplier Name (EN)",
      dataIndex: "supplierCompNameEN",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierCompNameEN' && sortedInfo.order,
    },
    {
      key: "createDate",
      title: "Create Date",
      dataIndex: "createDate",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'createDate' && sortedInfo.order,
    },
    {
      key: "isActive",
      title: "Active",
      dataIndex: "isActive",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'isActive' && sortedInfo.order,
      render: (text) => (text === true ? <CheckCircleOutlined style={{ fontSize: "18px", color: "#1BAA6E" }} /> : <CloseCircleOutlined style={{ fontSize: "18px", color: "#C12C20" }} />),
    },
    {
      key: "statusCode",
      title: "Status",
      dataIndex: "statusCode",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'statusCode' && sortedInfo.order,
      render: (text, record, index) => <span dangerouslySetInnerHTML={{ __html: record.statusDesc }}></span>,
    },
  ];

  useEffect(async () => {
    hideLoading();
    await initialData({ current, pageSize });
  }, []);

  const initialData = async ({ current, pageSize, searchList, sortList }) => {
    setIsLoadingTable(true);

    const inquiryData = {
      page: current,
      pageSize: pageSize,
      searchList: searchList || [],
      sortList: sortList || [],
    };

    try {
      const resInquirySupp = await AppApi.getApi("p2p/api/v1/inquiry/supplier/branch/profile/waitingApproval", inquiryData, { method: "post", authorized: true });
      if (resInquirySupp && resInquirySupp.status == 200) {
        setDataSource(_.get(resInquirySupp.data, "items", []));
        setCurrent(current);
        setTotalItem(_.get(resInquirySupp.data, "totalItem", 0));
        setTotalRecord(_.get(resInquirySupp.data, "totalRecord", 0));
        setIsLoadingTable(false);
      } else {
        setIsLoadingTable(false);
        // alert
        showAlertDialog({
          title: get(resInquirySupp, "data.error", "Error !"),
          text: get(resInquirySupp, "data.message", ""),
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

  const mapData = (field, value) => {
    return {
      field: field,
      value: value,
    };
  };

  const onSearchList = async () => {
    const searchListMap = [];

    if (branchCode !== "") {
      searchListMap.push(mapData("supplierBranchCode", branchCode));
    }
    if (branchName !== "") {
      searchListMap.push(mapData("supplierBranchName", branchName));
    }
    if (supplierName !== "") {
      searchListMap.push(mapData("supplierCompName", supplierName));
    }
    if (active !== "") {
      searchListMap.push(mapData("isActive", active));
    }
    if (status !== "") {
      searchListMap.push(mapData("statusCode", status));
    }

    setSearchList(searchListMap);
    const inquiry = {
      current: 1,
      pageSize: pageSize,
      searchList: searchListMap,
    };
    setCurrent(1);
    await initialData(inquiry);
  };

  const pageChanger = async (pagination, filters, sorter, extra) => {
    setSortedInfo(sorter)
    let inquiry = {};
    let mapSortValue = sortValue;
    let currentPage = pagination.current;
    const pageSizeOld = pageSize; //---- pageSize old for check when change page size -------
    if (pageSizeOld !== pagination.pageSize) {
      currentPage = 1;
    }

    if (extra.action == "sort") {
      currentPage = 1;
      if (get(sorter, "field") && get(sorter, "order")) {
        mapSortValue = {
          field: sorter.field,
          order: sorter.order === "descend" ? "DESC" : "ASC",
        };
      }

      setSortValue(mapSortValue);
    }

    inquiry = {
      ...inquiry,
      current: currentPage,
      pageSize: pagination.pageSize,
      searchList: searchList,
      sortList: _.isEmpty(mapSortValue) ? [] : [mapSortValue],
    };

    setCurrent(currentPage);
    setPageSize(pagination.pageSize);
    await initialData(inquiry);
  };

  const onClearSearch = async () => {
    setCurrent(1)
    setBranchCode("");
    setBranchName("");
    setSupplierName("");
    setActive("");
    setStatus("");
    setSearchList([]);

    setSortedInfo({ columnKey: null, order: null })

    setIsLoadingTable(true);

    const inquiryData = {
      page: 1,
      pageSize: pageSize,
      searchList: [],
      sortList: [],
    };

    try {
      const resInquirySupp = await AppApi.getApi("p2p/api/v1/inquiry/supplier/branch/profile/waitingApproval", inquiryData, { method: "post", authorized: true });
      if (resInquirySupp && resInquirySupp.status == 200) {
        setDataSource(_.get(resInquirySupp.data, "items", []));
        setTotalItem(_.get(resInquirySupp.data, "totalItem", 0));
        setTotalRecord(_.get(resInquirySupp.data, "totalRecord", 0));
        setIsLoadingTable(false);
      } else {
        setIsLoadingTable(false);
        // alert
        showAlertDialog({
          title: get(resInquirySupp, "data.error", "Error !"),
          text: get(resInquirySupp, "data.message", ""),
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

  return (
    <div className="container-fluid px-0">
      {/*  Search Bar */}
      <section className="mb-8">
        <div className="container">
          {/* <!-- #searchForm - Start --> */}
          <div id="box-header" className="col-12 mb-10">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>{branch} Profile</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Branch Profile Approval Lists</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <form id="searchForm" name="searchForm" action="" className="form">
            <div className="row">
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Branch Code</label>
                <div className="controls">
                  <input
                    type="text"
                    name="branchCode"
                    id="branchCode"
                    value={branchCode}
                    onChange={(e) => {
                      setBranchCode(e.target.value);
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
                <label className="control-label">Branch Name</label>
                <div className="controls">
                  <input
                    type="text"
                    name="branchName"
                    id="branchName"
                    value={branchName}
                    onChange={(e) => {
                      setBranchName(e.target.value);
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
                <label className="control-label">Active</label>
                <div className="controls">
                  <Select
                    value={active}
                    onChange={(value) => {
                      setActive(value);
                    }}
                    style={{ width: "100%" }}
                  >
                    <Option value="">All</Option>
                    <Option value="Y">Active</Option>
                    <Option value="N">Inactive</Option>
                  </Select>
                </div>
              </div>

              <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                <Button htmlType="button" name="btnSearch" id="btnSearch" className="btn btn-blue" onClick={onSearchList}>
                  Search
                </Button>
                <Button htmlType="reset" name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onClearSearch}>
                  Clear
                </Button>
              </div>

              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Status</label>
                <div className="controls">
                  <Select
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                    }}
                    style={{ width: "100%" }}
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
            </div>
          </form>
        </div>
      </section>

      <div className="line-gap"></div>
      <section id="page-content" className="mt-10">
        <div className="ml-10 mr-10">
          <BBLTableList columns={BranchApprovalColumns} dataSource={dataSource} total={totalRecord} current={current} pageSize={pageSize} loading={isLoadingTable} onChange={pageChanger} />
        </div>
      </section>
    </div>
  );
}

branchApprovalLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
