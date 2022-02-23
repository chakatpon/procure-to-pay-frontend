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
import { Button, Form, Input, Breadcrumb, Modal, Result } from "antd";
import BBLTableList from "../components/BBLTableList";

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function supplierApprovalLists() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const router = useRouter();
  const [form] = Form.useForm();

  // ------------  Search -----------
  const [supplierName, setSupplierName] = useState("");
  const [searchList, setSearchList] = useState([]);

  // ----------------- Table -------------------
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [sortValue, setSortValue] = useState({});

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

  const SupplierApprovalColumns = [
    {
      key: "no",
      title: "No.",
      dataIndex: "no",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
      width: "50",
    },
    {
      key: "supplierNameTH",
      title: "Supplier Name (TH)",
      dataIndex: "supplierNameTH",
      sorter: true,
      align: "center",
      sortOrder: sortedInfo.columnKey == 'supplierNameTH' && sortedInfo.order,
      render: (text, record, index) => (
        <Link
          onClick={() => showLoading()}
          href={{
            pathname: "/profile/supplierApprovalDetail",
            query: { supplierCode: record.supplierCode },
          }}
          as="/profile/supplierApprovalDetail"
        >
          <a className="btn-text blue" style={{ textDecoration: "underline" }} key={index}>
            {text}
          </a>
        </Link>
      ),
    },
    {
      key: "supplierNameEN",
      title: "Supplier Name (EN)",
      dataIndex: "supplierNameEN",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'supplierNameEN' && sortedInfo.order,
    },
    {
      key: "createdDate",
      title: "Create Date",
      dataIndex: "createdDate",
      align: "center",
      sorter: true,
      sortOrder: sortedInfo.columnKey == 'createdDate' && sortedInfo.order,
      render: (text, record, index) => <span dangerouslySetInnerHTML={{ __html: record.createDateStr }}></span>,
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
      const resInquirySupp = await AppApi.getApi("p2p/api/v1/inquiry/supplier/profile/waitingApproval", inquiryData, { method: "post", authorized: true });
      if (resInquirySupp && resInquirySupp.status == 200) {
        setDataSource(_.get(resInquirySupp.data, "items", []));
        setCurrent(current);
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
    if (supplierName !== "") {
      searchListMap.push(mapData("supplierName", supplierName));
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
    setSupplierName("");
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
      const resInquirySupp = await AppApi.getApi("p2p/api/v1/inquiry/supplier/profile/waitingApproval", inquiryData, { method: "post", authorized: true });
      if (resInquirySupp && resInquirySupp.status == 200) {
        setDataSource(_.get(resInquirySupp.data, "items", []));
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
              <Breadcrumb.Item>Supplier Profile</Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">Supplier Profile Approval Lists</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Form id="searchForm" name="searchForm" action="" className="form">
            <div className="row">
              <div className="control-group  col-sm-4 col-md-3 col-lg-2">
                <label className="control-label">Supplier Name</label>
                <div className="controls">
                  <Input
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

              <div className="col-sm-12 col-md-3 col-lg-3 col-xl-4 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center">
                <Button htmlType="button" name="btnSearch" id="btnSearch" className="btn btn-blue" onClick={onSearchList}>
                  Search
                </Button>
                <Button htmlType="reset" name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onClearSearch}>
                  Clear
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </section>

      <div className="line-gap"></div>
      <section id="page-content" className="mt-10">
        <div className="ml-10 mr-10">
          <BBLTableList columns={SupplierApprovalColumns} dataSource={dataSource} total={totalRecord} current={current} pageSize={pageSize} loading={isLoadingTable} onChange={pageChanger} />
        </div>
      </section>
    </div>
  );
}

supplierApprovalLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
