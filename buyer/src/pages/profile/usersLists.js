import { useState, useEffect, useContext } from "react";
import Layout from "../components/layout";
import Head from "next/head";
import { connect } from "react-redux";
import Router from "next/router";
import Link from "next/link";
import { useRouter } from "next/router";
import { get, sortBy, isEmpty, debounce, isEqual } from "lodash";

import { StoreContext } from "../../context/store";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

// ============== UI =================
import { Form, Input, Breadcrumb, Button, Select } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import BBLTableList from "../components/BBLTableList";

// ============== API ================
import { B2PAPI } from "../../context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";
export default function userLists() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const { Option } = Select;

  // ================ Search ================
  const [userName, setUserName] = useState("");
  const [companyCode, setCompanyCode] = useState("");
  const [branchCode, setBranchCode] = useState("");
  const [status, setStatus] = useState("");
  const [searchList, setSearchList] = useState([]);

  // =================== Table =====================
  const [dataSource, setDataSource] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [sortValue, setSortValue] = useState({});

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

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
    {
      value: "PFB08",
      label: "Approved",
    },
  ];

  const BuyerColumns = [
    {
      title: "No.",
      key: "no",
      dataIndex: "no",
      sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
      width: 50,
      align: "center",
      sorter: true,
    },
    {
      title: "Username",
      key: "username",
      dataIndex: "username",
      sortOrder: sortedInfo.columnKey == 'username' && sortedInfo.order,
      // width: '15%',
      align: "center",
      sorter: true,
      render: (text, record, index) => (
        <Link
          onClick={() => blockUI()}
          href={{
            pathname: "/profile/userDetail",
            query: { id: record.id },
          }}
          as="/profile/userDetail"
        >
          <a className="btn-text blue" style={{ textDecoration: "underline" }} key={index}>
            {text}
          </a>
        </Link>
      ),
    },
    {
      title: "Company Code",
      key: "companyCode",
      dataIndex: "companyCode",
      sortOrder: sortedInfo.columnKey == 'companyCode' && sortedInfo.order,
      // width: '10%',
      align: "left",
      sorter: true,
    },
    {
      title: "Branch Code",
      key: "branchCode",
      dataIndex: "branchCode",
      sortOrder: sortedInfo.columnKey == 'branchCode' && sortedInfo.order,
      // width: '20%',
      align: "left",
      sorter: true,
    },
    {
      title: "Create Date",
      key: "createDate",
      dataIndex: "createDate",
      sortOrder: sortedInfo.columnKey == 'createDate' && sortedInfo.order,
      // width: '20%',
      align: "center",
      sorter: true,
    },
    {
      title: "Active",
      key: "isActive",
      dataIndex: "isActive",
      sortOrder: sortedInfo.columnKey == 'isActive' && sortedInfo.order,
      // width: '20%',
      align: "center",
      sorter: true,
      render: (text) => (text === true ? <CheckCircleOutlined style={{ fontSize: "18px", color: "#1BAA6E" }} /> : <CloseCircleOutlined style={{ fontSize: "18px", color: "#C12C20" }} />),
    },
    {
      title: "Status",
      key: "statusCode",
      dataIndex: "statusCode",
      sortOrder: sortedInfo.columnKey == 'statusCode' && sortedInfo.order,
      // width: '20%',
      align: "left",
      sorter: true,
      render: (text, record, index) => <span dangerouslySetInnerHTML={{ __html: record.statusDesc }}></span>,
    },
  ];

  useEffect(() => {
    initialData();
  }, []);

  const initialData = async () => {
    await getUserProfile({
      current,
      pageSize,
    });
  };

  const getUserProfile = async ({ current, pageSize, searchList, sortList }) => {
    setIsLoadingTable(true);
    const bodyRequest = {
      page: current,
      pageSize: pageSize,
      searchList: searchList ? searchList : [],
      sortList: sortList ? sortList : [],
    };
    try {
      const userProfileList = await AppApi.getApi("p2p/api/v1/inquiry/user/profile", bodyRequest, {
        method: "post",
        authorized: true,
      });
      if (userProfileList && userProfileList.status == 200) {
        setDataSource(get(userProfileList.data, "items", []));
        setIsLoadingTable(false);
        setCurrent(current);
        setTotalItem(get(userProfileList.data, "totalItem", []));
        setTotalRecord(get(userProfileList.data, "totalRecord", []));
        hideLoading();
      } else {
        setIsLoadingTable(false);
        hideLoading();
        showAlertDialog({
          title: get(userProfileList, "data.error", "Error !"),
          text: get(userProfileList, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      setIsLoadingTable(false);
      ErrorHandle(err);
    }
  };

  // const showTotal = () => `${current * pageSize - pageSize + 1} - ${totalRecord < current * pageSize ? totalRecord : current * pageSize} of ${totalRecord} items`;

  const onChangeTable = async (pagination, filters, sorter, extra) => {
    setSortedInfo(sorter)
    let inquiryUser = {};
    let mapSortValue = sortValue;
    let pageCurrent = pagination.current;
    const pageSizeOld = pageSize; //---- pageSize old for check when change page size -------
    if (pageSizeOld !== pagination.pageSize) {
      // ---- when user change pageSize current page will show page 1 -----
      pageCurrent = 1;
    }

    if (extra.action == "sort") {
      pageCurrent = 1;
      if (get(sorter, 'field') && get(sorter, 'order')) {
        mapSortValue = {
          field: sorter.field,
          order: sorter.order === "descend" ? "DESC" : "ASC",
        };
      }
      setSortValue(mapSortValue);
    }

    inquiryUser = {
      ...inquiryUser,
      current: pageCurrent,
      pageSize: pagination.pageSize,
      searchList: searchList,
      sortList: _.isEmpty(mapSortValue) ? [] : [mapSortValue],
    };

    setCurrent(pageCurrent);
    setPageSize(pagination.pageSize);
    await getUserProfile(inquiryUser);
  };

  const mapData = (field, value) => {
    return {
      field: field,
      value: value,
    };
  };

  const onSearch = () => {
    const searchListMap = [];
    if (userName !== "") {
      searchListMap.push(mapData("username", userName));
    }
    if (companyCode !== "") {
      searchListMap.push(mapData("companyCode", companyCode));
    }
    if (branchCode !== "") {
      searchListMap.push(mapData("branchCode", branchCode));
    }
    if (status !== "") {
      searchListMap.push(mapData("statusCode", status));
    }

    setSearchList(searchListMap);
    const inquiryUser = {
      current: 1,
      pageSize: pageSize,
      searchList: searchListMap,
    };

    setCurrent(1);
    getUserProfile(inquiryUser);
  };

  const onClearInput = async () => {
    setCurrent(1)
    setUserName("");
    setCompanyCode("");
    setBranchCode("");
    setStatus("");
    setSearchList([]);

    setSortedInfo({ columnKey: null, order: null })

    setIsLoadingTable(true);
    const bodyRequest = {
      page: 1,
      pageSize: pageSize,
      searchList: [],
      sortList: [],
    };
    try {
      const userProfileList = await AppApi.getApi("p2p/api/v1/inquiry/user/profile", bodyRequest, {
        method: "post",
        authorized: true,
      });
      if (userProfileList && userProfileList.status == 200) {
        setDataSource(get(userProfileList.data, "items", []));
        setIsLoadingTable(false);
        setCurrent(current);
        setTotalItem(get(userProfileList.data, "totalItem", []));
        setTotalRecord(get(userProfileList.data, "totalRecord", []));
        hideLoading();
      } else {
        setIsLoadingTable(false);
        hideLoading();
        showAlertDialog({
          title: get(userProfileList, "data.error", "Error !"),
          text: get(userProfileList, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      setIsLoadingTable(false);
      ErrorHandle(err);
    }
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
              <Breadcrumb.Item>User Profile</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">User Profile Lists</Breadcrumb.Item>
            </Breadcrumb>
          </div>
          <form id="searchForm" name="searchForm" action="" className="form">
            <div className="row">
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Username</label>
                <div className="controls">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={userName}
                    onChange={(e) => {
                      setUserName(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        onSearch()
                      }
                    }}
                  />
                </div>
              </div>
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Company Code</label>
                <div className="controls">
                  <input
                    type="text"
                    name="companyCode"
                    id="companyCode"
                    value={companyCode}
                    onChange={(e) => {
                      setCompanyCode(e.target.value);
                    }}
                    onKeyDown={(e) => {
                      if (e.key == "Enter") {
                        onSearch()
                      }
                    }}
                  />
                </div>
              </div>
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
                        onSearch()
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
              <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                <Button htmlType="button" name="btnSearch" id="btnSearch" className="btn btn-blue" onClick={onSearch}>
                  Search
                </Button>
                <Button htmlType="reset" name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onClearInput}>
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
          {isAllow("P6302", ["CREATE"]) && (
            <div className="text-right">
              <Button
                className="btn btn-blue"
                onClick={() => {
                  Router.push(
                    {
                      pathname: "/profile/addEditUserProfile",
                      query: { flagPath: true },
                    },
                    "/profile/addEditUserProfile"
                  );
                }}
              >
                Create User
              </Button>
            </div>
          )}

          <div className="mt-8">
            <BBLTableList columns={BuyerColumns} current={current} dataSource={dataSource} total={totalRecord} pageSize={pageSize} onChange={onChangeTable} loading={isLoadingTable} />
          </div>
        </div>
      </section>
    </div>
  );
}
userLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
