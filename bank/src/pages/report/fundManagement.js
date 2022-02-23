import Head from "next/head";
import { connect } from "react-redux";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import ErrorHandle from "@/shared/components/ErrorHandle";
import Columns from "@/shared/components/Columns";

import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, set, isEmpty, forEach, filter, unionBy, isNull, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import moment from "moment";

//  =================== View list template ===================
import DynamicListReport from "@/shared/components/DynamicListReport";

const fundManagement = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getSetting, setSetting, tabReport } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);

  // ------- Search Data ------
  const [searchList, setSearchList] = useState([]);

  // ----------------- Table Summary -----------------
  const [columnsSummary, setColumnsSummary] = useState([]);
  const [dataSourceSummary, setDataSourceSummary] = useState([]);
  const [flagShowTotalAmountSummary, setFlagShowTotalAmountSummary] = useState(false);
  const [sortListSummary, setSortListSummary] = useState([]);

  //-------------- Table Details --------------
  const [columnsDetail, setColumnsDetail] = useState([]);
  const [dataSourceDetail, setDataSourceDetail] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50],
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    },
  });
  const [flagShowTotalAmountDetails, setFlagShowTotalAmountDetails] = useState(false);
  // const [indexTotalAmtDetail, setIndexTotalAmtDetail] = useState(0);
  const [totalAmtDetails, setTotalAmtDetails] = useState([]);
  const [sortDetailList, setSortDetailList] = useState([]);

  // ----------------- Table Common -----------------
  const [rowSelection, setRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{ option: "Other", value: "OTHER" }]);

  const tableHeaderAction = (action, config) => {};

  const onSearchReset = async () => {
    // console.log("onSearchReset");
    setSearchList([]);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortListSummary([]);
    setSortDetailList([]);
    router.push(
      {
        pathname: "/report/fundManagement",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };

  const onSearchSubmit = async (values) => {
    setSortListSummary([]);
    setSortDetailList([]);
    let searchListQuery = {};
    values.forEach((r) => {
      searchListQuery = { ...searchListQuery, [r.field]: r.value };
    });

    // console.log("searchListQuery : ", searchListQuery);
    router.push(
      {
        pathname: "/report/fundManagement",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Fund Management Report List");
  };

  const handleTableSummaryChange = async (pagination, filters, sorter) => {
    // console.log("sorter : ", sorter);
    let tmpsortList = [];
    if (sorter) {
      if (get(sorter, "field") && get(sorter, "order")) {
        tmpsortList = [
          {
            field: sorter.field,
            order: sorter.order === "descend" ? "DESC" : "ASC",
          },
        ];
      }
    }

    setSortListSummary(tmpsortList);
    await getData(1, pageSize, tmpsortList, searchList);
    // await setPage(pagination.current);
    // await setPageSize(pagination.pageSize);
    // setSetting("pageSize", pagination.pageSize);
  };

  const handleTableDetailChange = async (pagination, filters, sorter) => {
    let tmpsortList = [];
    if (sorter) {
      if (get(sorter, "field") && get(sorter, "order")) {
        tmpsortList = [
          {
            field: sorter.field,
            order: sorter.order === "descend" ? "DESC" : "ASC",
          },
        ];
      }
    }

    setSortDetailList(tmpsortList);
    await setPage(pagination.current);
    await setPageSize(pagination.pageSize);
    setSetting("pageSize", pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  useEffect(() => {
    try {
      if (router.isReady) {
        let searchLists;
        if (!isEmpty(router.query)) {
          let s = Object.keys(router.query).map((k) => {
            return { field: k, value: router.query[k] };
          });
          searchLists = s;
          hideLoading();
        } else {
          // ------------ default payment Date to current date ---------------
          const defaultPaymentDate = {
            field: "paymentDate",
            value: `${moment().format("YYYY-MM-DD")},${moment().format("YYYY-MM-DD")}`,
          };
          searchLists = unionBy(searchLists, [defaultPaymentDate]);
        }
        setSearchList(searchLists);
        // onDevMode()
        prepareData(searchLists);
      }
    } catch (e) {
      hideLoading();
      console.error(e);
    }
  }, [router]);

  useEffect(() => {
    // -------- Process for set Search box property when change tab ----------
    const viewModelTemp = { ...viewModel };
    const viewSearch = get(viewModelTemp, "search", []).map((list) => {
      if (get(list, "searchKey", "") == "additionalReference1") {
        if (tabReport == "summaryTable") {
          list.searchDisable = true;
        } else {
          list.searchDisable = false;
        }
      }
      return list;
    });

    if (viewSearch.length > 0) {
      // ----------- set new viewSearch in viewModel -----------
      set(viewModelTemp, "search", viewSearch);
    }

    if (!isEmpty(viewModelTemp) && !isNull(viewModelTemp)) {
      setViewModel(viewModelTemp);
    }
  }, [tabReport]);

  const onDevMode = async () => {
    let onDev = await showAlertDialog({
      text: "อยู่ระหว่างการพัฒนา",
      icon: "warning",
    });
    console.log(onDev);
    if (onDev.isConfirmed) {
      router.push("/dashboard");
    }
  };
  const getData = async (page, pageSize, sortList, searchList, limitOptions, flagShowTotalSum) => {
    showLoading("Loading Fund Management Report List");
    const flagShowTotalAmtForcastSummary = flagShowTotalSum || flagShowTotalAmountSummary;
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/report/fundManagement",
      {
        tabScreen: tabReport || "summaryTable",
        page: page,
        pageSize: pageSize,
        searchList,
        sortList,
      },
      { method: "post", authorized: true }
    );
    if (list.status == 200) {
      if (!isEmpty(sortList)) {
        const colSummarys = columnsSummary.map(({ sortOrder, ...keepAttrs }) => keepAttrs);
        setColumnsSummary(colSummarys);
        const colDetails = columnsDetail.map(({ sortOrder, ...keepAttrs }) => keepAttrs);
        setColumnsDetail(colDetails);
      }

      let dataDetail = get(list.data, "detail.detailTable.items", []).map((r) => {
        return { ...r, key: r.no };
      });

      setTotalAmtDetails(get(list.data, "detail.totalAmount", []));

      const dataSummary = get(list.data, "summary", []);
      const dataSourceSummary = dataSummary.map((sum) => {
        if (flagShowTotalAmtForcastSummary) {
          const totalAmount = { sumAmount: <b>Total Amount &nbsp;&nbsp;&nbsp; {get(sum, "totalAmount", "0.00")}</b>, currencyCode: <b>{get(sum, "currencyCodeGroup", "THB")}</b> };
          const summaryTotal = get(sum, "summaryTable", []).length > 0 ? unionBy(get(sum, "summaryTable", []), [totalAmount]) : [];
          sum.summaryTable = summaryTotal;
        }
        return sum;
      });

      // console.log("dataSourceSummary : ", dataSourceSummary);
      // console.log("dataDetail : ", dataDetail);
      setDataSourceSummary(dataSourceSummary);
      setDataSourceDetail(dataDetail);
      if (dataDetail.length == 0) {
        setFlagShowTotalAmountDetails(false);
      }
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: get(list.data, "detail.detailTable.totalRecord", 0),
        pageSizeOptions: limitOptions || pagination.pageSizeOptions,
      });

      hideLoading();
      return true;
    } else {
      hideLoading();
      showAlertDialog({
        title: get(list, "data.error", "Error !"),
        text: get(list, "data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
      return false;
    }
  };
  const prepareData = async (searchList) => {
    try {
      let colSummary = [];
      let colDetail = [];
      let listView = {};
      let listTableSummary = {};
      let listTableDetail = {};
      let defaultLimit = 100;
      let limitOptions = [];
      let flagShowTotalAmountSum = false;
      let flagShowTotalAmountDetail = false;
      showLoading("Preparing Fund Management Report");
      listView = await AppApi.getApi("/p2p/api/v1/template/report/fundManagement", {}, { method: "post", authorized: true });

      if (listView.status != 200) {
        return false;
      }

      const viewSearch = get(listView.data, "search", []).map((list) => {
        if (get(list, "searchKey", "") == "additionalReference1") {
          if (tabReport == "summaryTable") {
            list.searchDisable = true;
          } else {
            list.searchDisable = false;
          }
        }
        return list;
      });

      if (viewSearch.length > 0) {
        // ----------- set new viewSearch in listView -----------
        set(listView.data, "search", viewSearch);
      }

      setViewModel(listView.data);

      // ------- process for separate template table of summary and detail -------------
      get(listView.data, "table", []).forEach((table) => {
        if (table.tableClass == "summaryTable") {
          listTableSummary = { table: { ...table } };

          // ---------- Process for flag to show total amount of forecast amount ----------------
          const colFilterForecastSum = get(table, "columns").filter((colSum) => colSum.columnFieldName == "sumAmount");
          if (colFilterForecastSum.length > 0) {
            flagShowTotalAmountSum = true;
          }
        }

        if (table.tableClass == "detailTable") {
          listTableDetail = { table: { ...table } };
          defaultLimit = get(table, "defaultLimit", 100);
          limitOptions = get(table, "limitOptions", []);

          // ---------- Process for flag to show total amount of forecast amount ----------------
          const colFilterForecastDetails = get(table, "columns").filter((colDetail) => colDetail.columnFieldName == "additionalReference1");
          // .map((col) => {
          //   setIndexTotalAmtDetail(col.columnSeq);
          //   return col;
          // });

          if (colFilterForecastDetails.length > 0) {
            flagShowTotalAmountDetail = true;
          }
        }
      });

      // ------------ End of process --------------

      colSummary = await Columns(listTableSummary, context, AppApi);
      colDetail = await Columns(listTableDetail, context, AppApi);

      // if (size(colSummary) > 0 && isEmpty(sortListSummary)) {
      colSummary = map(colSummary, (c) => ({ ...c, sortOrder: false }));
      // }
      // if (size(colDetail) > 0 && isEmpty(sortDetailList)) {
      colDetail = map(colDetail, (c) => ({ ...c, sortOrder: false }));
      // }

      defaultLimit = getSetting("pageSize", defaultLimit);
      setPageSize(defaultLimit);
      setFlagShowTotalAmountSummary(flagShowTotalAmountSum);
      setFlagShowTotalAmountDetails(flagShowTotalAmountDetail);
      await getData(1, defaultLimit, [], searchList, limitOptions, flagShowTotalAmountSum);
      setColumnsSummary(colSummary);
      setColumnsDetail(colDetail);

      hideLoading();
      return;
    } catch (err) {
      hideLoading();
      setDataSourceSummary([]);
      setDataSourceDetail([]);
      ErrorHandle(err);
    }
  };

  const OnTableColumnSummaryDisplayChange = (columns) => {
    setSortListSummary([]);
    setSearchList(searchList);
    prepareData(searchList);
  };

  const OnTableColumnDetailDisplayChange = (columns) => {
    setSortDetailList([]);
    setSearchList(searchList);
    prepareData(searchList);
  };

  const OnTableColumnSummaryDisplayReset = (columns) => {
    setSortListSummary([]);
    setSearchList(searchList);
    prepareData(searchList);
  };

  const OnTableColumnDetailDisplayReset = (columns) => {
    setSortDetailList([]);
    setSearchList(searchList);
    prepareData(searchList);
  };

  return viewModel == false ? (
    <></>
  ) : (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/funds_management_report/funds_management_report.css" rel="stylesheet" />
      </Head>

      <div className="container-fluid px-0">
        <DynamicListReport
          viewModel={viewModel}
          columnsSummary={columnsSummary}
          columnsDetail={columnsDetail}
          dataSourceSummary={dataSourceSummary}
          dataSourceDetail={dataSourceDetail}
          searchList={searchList}
          sortListSummary={sortListSummary}
          sortListDetail={sortDetailList}
          pagination={pagination}
          flagShowTotalAmountDetail={flagShowTotalAmountDetails}
          totalAmtDetail={totalAmtDetails}
          disabledDate={90}
          tableHeaderAction={tableHeaderAction}
          onSearchReset={onSearchReset}
          onSearchSubmit={onSearchSubmit}
          OnTableColumnSummaryDisplayChange={OnTableColumnSummaryDisplayChange}
          OnTableColumnDetailDisplayChange={OnTableColumnDetailDisplayChange}
          onHeaderAction={tableHeaderAction}
          handleTableSummaryChange={handleTableSummaryChange}
          handleTableDetailChange={handleTableDetailChange}
          columnDisplaySummary={{
            onChange: OnTableColumnSummaryDisplayChange,
            onReset: OnTableColumnSummaryDisplayReset,
            get: "/p2p/api/v1/template/report/fundManagement/summary/column/get",
            set: "/p2p/api/v1/template/report/fundManagement/summary/column/set",
            default: "/p2p/api/v1/template/report/fundManagement/summary/column/default",
          }}
          columnDisplayDetail={{
            onChange: OnTableColumnDetailDisplayChange,
            onReset: OnTableColumnDetailDisplayReset,
            get: "/p2p/api/v1/template/report/fundManagement/detail/column/get",
            set: "/p2p/api/v1/template/report/fundManagement/detail/column/set",
            default: "/p2p/api/v1/template/report/fundManagement/detail/column/default",
          }}
        />
      </div>
    </>
  );
};

fundManagement.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default fundManagement;
