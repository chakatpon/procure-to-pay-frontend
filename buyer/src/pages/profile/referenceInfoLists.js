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
import { Button, Table, Form, Input, Select, Breadcrumb } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import BBLTableList from "../components/BBLTableList";

// -------------------- API -----------------------
import { B2PAPI } from "../../context/api";

export default function referenceInfoLists() {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const [form] = Form.useForm();

  // ------------  Search -----------
  const [supplierName, setSupplierName] = useState("");
  const [searchValue, setSearchValue] = useState("");

  // ----------------- Table -------------------
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [refInfoData, setRefInfoData] = useState([]); // ------ variable for temporary storage data reference info -----

  const [sortedInfo, setSortedInfo] = useState({ columnKey: null, order: null });

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
            query: { supplierCode: record.supplierCode },
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
    // {
    //   key: "isActive",
    //   title: "Active",
    //   dataIndex: "isActive",
    //   align: "center",
    //   sorter: true,
    //   sortOrder: sortedInfo.columnKey == 'no' && sortedInfo.order,
    //   render: (text) => (text === "Y" ? <CheckCircleOutlined style={{ fontSize: "18px", color: "#1BAA6E" }} /> : <CloseCircleOutlined style={{ fontSize: "18px", color: "#C12C20" }} />),
    // },
  ];

  useEffect(async () => {
    hideLoading();
    await initialData();
  }, []);

  const initialData = async () => {
    setIsLoadingTable(true);
    try {
      const resInquiryRefInfo = await AppApi.getApi("p2p/api/v1/get/mappingReferenceList", {}, { method: "get", authorized: true });
      if (resInquiryRefInfo && resInquiryRefInfo.status == 200) {
        const referenceInfo = _.get(resInquiryRefInfo.data, "items", []).map((refInfo, index) => ({
          no: index + 1,
          ...refInfo,
        }));

        setRefInfoData(_.get(resInquiryRefInfo.data, "items", []));
        setDataSource(referenceInfo);
        setCurrent(current);
        setTotalRecord(_.get(resInquiryRefInfo.data, "totalRecord", 0));
        setIsLoadingTable(false);
      } else {
        setIsLoadingTable(false);
        // alert
        showAlertDialog({
          title: _.get(resInquiryRefInfo, "data.error", "Error !"),
          text: _.get(resInquiryRefInfo, "data.message", ""),
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
    const refInfoDataList = dataSource; // ------ reference info current data -----
    let refInfoList = refInfoDataList.map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    let currentPage = pagination.current;
    const pageSizeOld = pageSize; //---- pageSize old for check when change page size -------
    if (pageSizeOld !== pagination.pageSize) {
      currentPage = 1;
    }

    if (searchValue == supplierName) {
      refInfoList = onFilterRefInfo();
    }

    if (extra.action == "sort") {
      currentPage = 1;
      refInfoList = _.orderBy(refInfoDataList, sorter.field, sorter.order === "descend" ? "desc" : "asc").map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    }

    setDataSource(refInfoList);
    setTotalRecord(refInfoList.length);
    setCurrent(currentPage);
    setPageSize(pagination.pageSize);
  };

  const onSearchList = async () => {
    setIsLoadingTable(true);
    const refInfoList = onFilterRefInfo();
    setSearchValue(supplierName);
    setDataSource(refInfoList);
    setTotalRecord(refInfoList.length);
    setCurrent(1);
    setIsLoadingTable(false);
  };

  const onFilterRefInfo = () => {
    const refInfoList = _.filter(
      refInfoData,
      (data) => _.toLower(data.supplierNameTH).search(_.toLower(supplierName)) !== -1 || _.toLower(data.supplierNameEN).search(_.toLower(supplierName)) !== -1
    ).map((refInfofilter, index) => ({ no: index + 1, ...refInfofilter }));

    return refInfoList;
  };

  const onClearSearch = async () => {
    setCurrent(1)
    setSupplierName("");
    setSearchValue("");

    setSortedInfo({ columnKey: null, order: null })

    setIsLoadingTable(true);
    const refInfoList = refInfoData.map((refInfo, index) => ({ no: index + 1, ...refInfo }));
    setDataSource(refInfoList);
    setTotalRecord(refInfoData.length);
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
              <Breadcrumb.Item className="breadcrumb-item active">Reference Info Lists</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Form
            layout="vertical"
            className="form"
            name="basic"
            form={form}
          >
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

              <div className="col-sm-12 col-md-3 col-lg-3 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-xl-right">
                <Button type="button" name="btnSearch" id="btnSearch" className="btn btn-blue" onClick={onSearchList}>
                  Search
                </Button>
                <Button type="reset" name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onClearSearch}>
                  Clear
                </Button>
              </div>
            </div>
          </Form>
        </div>
      </section>

      <div className="line-gap"></div>

      <section id="page-content" className="mt-5">
        <div className="ml-10 mr-10 mt-12">
          <BBLTableList columns={RefInfoColumns} dataSource={dataSource} total={totalRecord} current={current} pageSize={pageSize} loading={isLoadingTable} onChange={pageChanger} />
        </div>
      </section>
    </div>
  );
}

referenceInfoLists.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
