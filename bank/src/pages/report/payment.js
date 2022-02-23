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
import _, { get, isEmpty, forEach, filter, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import moment from "moment";

//  =================== View list template ===================
import DynamicListView from "@/shared/components/DynamicListView";
import DynamicListReport from "@/shared/components/DynamicListReport";

const payment = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getSetting, setSetting, getStorage, tabReport } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);

  // ----------------- Table sumary -----------------
  const [columnsSummary, setColumnsSummary] = useState([]);
  const [dataSourceSummary, setDataSourceSummary] = useState([]);
  const [flagShowTotalAmountSummary, setFlagShowTotalAmountSummary] = useState(false);
  const [sortSummaryList, setSortSummaryList] = useState([]);

  // ----------------- Table detail -----------------
  const [columnsDetail, setColumnsDetail] = useState([]);
  const [dataSourceDetail, setDataSourceDetail] = useState([]);
  const [flagShowTotalAmountDetails, setFlagShowTotalAmountDetails] = useState(false);
  const [sortDetailList, setSortDetailList] = useState([]);
  // ----------------- Table detail Sum -----------------
  const [totalAmountDetailListModel, setTotalAmountDetailListModel] = useState([]);

  const [indexCurrency, setIndexCurrency] = useState(0);
  const [currency, setCurrency] = useState([]);

  const [indexsumBaseAmount, setIndexSumBaseAmount] = useState(0);
  const [sumBaseAmount, setSumBaseAmount] = useState([]);

  const [indexSumNetAmount, setIndexSumNetAmount] = useState(0);
  const [sumNetAmount, setSumNetAmount] = useState([]);

  const [indexSumVatAmount, setIndexSumVatAmount] = useState(0);
  const [sumVatAmount, setSumVatAmount] = useState([]);

  const [indexSumWhtAmountIn, setIndexSumWhtAmountIn] = useState(0);
  const [sumWhtAmountIn, setSumWhtAmountIn] = useState([]);

  const [indexSumWhtAmountOut, setIndexSumWhtAmountOut] = useState(0);
  const [sumWhtAmountOut, setsumWhtAmountOut] = useState([]);
  // ----------------- end -----------------

  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50],
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    },
  });
  // ------- Search Data ------
  const [searchList, setSearchList] = useState([]);

  // ----------------- Table common -----------------
  const [rowSelection, setRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);

  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{ option: "Other", value: "OTHER" }]);

  const rowSelectionOption = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled: get(record, "multiSelectable", true) === false,
      name: record.invoiceNo,
    }),
  };
  const tableHeaderAction = (action, config) => { };

  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortSummaryList([])
    setSortDetailList([])
    router.push(
      {
        pathname: "/report/payment",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };
  const onSearchSubmit = async (values) => {
    setSortSummaryList([])
    setSortDetailList([])
    let searchListQuery = {};
    values.forEach((r) => {
      searchListQuery = { ...searchListQuery, [r.field]: r.value };
    });
    router.push(
      {
        pathname: "/report/payment",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Payment Report List");
  };

  const handleTableSummaryChange = async (pagination, filters, sorter) => {
    let tmpsortList = [];
    if (sorter) {
      if (get(sorter, "field") && get(sorter, 'order')) {
        tmpsortList = [
          {
            field: sorter.field,
            order: sorter.order === "descend" ? "DESC" : "ASC",
          },
        ];
      }
    }

    setSortSummaryList(tmpsortList);
    await setPage(pagination.current);
    await setPageSize(pagination.pageSize);
    setSetting("pageSize", pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  const handleTableDetailChange = async (pagination, filters, sorter) => {
    let tmpsortList = [];
    if (sorter) {
      if (get(sorter, "field") && get(sorter, 'order')) {
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

        let searchLists = searchList;
        if (!isEmpty(router.query)) {
          let s = Object.keys(router.query).map((k) => {
            return { field: k, value: router.query[k] };
          });
          hideLoading();
          searchLists = s;
        } else {
          // ------------ default payment Date to current date ---------------
          const defaultPaymentDate = {
            field: "paymentDate",
            value: `${moment().format("YYYY-MM-DD")},${moment().format("YYYY-MM-DD")}`,
          };
          searchLists = _.unionBy(searchLists, [defaultPaymentDate]);
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
    showLoading("Loading Payment Report List");
    const flagShowTotalAmtForcastSummary = flagShowTotalSum || flagShowTotalAmountSummary;
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/report/payment",
      {
        tabScreen: tabReport || "summaryTable",
        page: page ? page : 1,
        pageSize: pageSize ? pageSize : 100,
        searchList,
        sortList,
      },
      { method: "post", authorized: true }
    );
    if (list.status == 200) {
      if (!isEmpty(sortList)) {
        const colSummarys = columnsSummary.map(({ sortOrder, ...keepAttrs }) => keepAttrs)
        setColumnsSummary(colSummarys)
      }
      if (!isEmpty(sortList)) {
        const colDetails = columnsDetail.map(({ sortOrder, ...keepAttrs }) => keepAttrs)
        setColumnsDetail(colDetails)
      }
      // setListData(list.data);
      // const detailData = get(list, "data.detail", [])
      // const detailTableData = detailData.items
      // await detailTableData.push({
      //   "supplierReferenceCode": <b>Total Transaction &nbsp;&nbsp;&nbsp; {detailData.totalRecord}</b>,
      //   "netAmount": <b>Total Amount &nbsp;&nbsp;&nbsp; {detailData.totalItem}</b>,
      // })

      const currencyArray = []
      const sumBaseAmountArray = []
      const sumNetAmountArray = []
      const sumVatAmountArray = []
      const sumWhtAmountInArray = []
      const sumWhtAmountOutArray = []

      setTotalAmountDetailListModel(get(list.data, "totalAmountDetailListModel", []))

      await get(list.data, "totalAmountDetailListModel", []).map((item) => {
        currencyArray.push(item.currency)
        sumBaseAmountArray.push(item.sumBaseAmount)
        sumNetAmountArray.push(item.sumNetAmount)
        sumVatAmountArray.push(item.sumVatAmount)
        sumWhtAmountInArray.push(item.sumWhtAmountIn)
        sumWhtAmountOutArray.push(item.sumWhtAmountOut)
      })
      setCurrency(currencyArray)
      setSumBaseAmount(sumBaseAmountArray)
      setSumNetAmount(sumNetAmountArray)
      setSumVatAmount(sumVatAmountArray)
      setSumWhtAmountIn(sumWhtAmountInArray)
      setsumWhtAmountOut(sumWhtAmountOutArray)


      const summaryData = get(list, "data.summary", [])
      // const summaryTableData = summaryData[0].summaryTable
      // await summaryTableData.push({
      //   "supplierReferenceCode": <b>Total Transaction &nbsp;&nbsp;&nbsp; {summaryData[0].totalTransaction}</b>,
      //   "netAmount": <b>Total Amount &nbsp;&nbsp;&nbsp; {summaryData[0].totalAmount}</b>,
      // })

      setDataSourceSummary(
        await summaryData.map((r, index) => {
          return { ...r, key: index + 1 };
        })
      );

      setDataSourceDetail(
        get(list, "data.detail.items", []).map((r) => {
          return { ...r, key: r.no };
        })
      );

      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: get(list, "data.detail.totalRecord", 0),
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
      let flagShowTotalAmountSum = false;
      let flagShowTotalAmountDetail = false;
      showLoading("Preparing Payment Report List");
      listView = await AppApi.getApi("/p2p/api/v1/template/report/payment", {}, { method: "post", authorized: true });

      if (listView.status != 200) {
        return false;
      }
      setViewModel(listView.data);

      // ------- process for separate template table of summary and detail -------------
      get(listView.data, "table", []).forEach((table) => {
        if (table.tableClass == "summaryTable") {
          listTableSummary = { table: { ...table } };
        }

        if (table.tableClass == "detailTable") {
          listTableDetail = { table: { ...table } }

          const colFilterForecastcurrencyCode = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "currencyCode")
          setIndexCurrency(colFilterForecastcurrencyCode + 1);

          const colFilterForecastDetailsbaseAmount = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "baseAmount")
          setIndexSumBaseAmount(colFilterForecastDetailsbaseAmount + 1);

          const colFilterForecastDetailsnetAmount = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "netAmount")
          setIndexSumNetAmount(colFilterForecastDetailsnetAmount + 1);

          const colFilterForecastDetailsvatAmount = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "vatAmount")
          setIndexSumVatAmount(colFilterForecastDetailsvatAmount + 1);

          const colFilterForecastDetailswthAmountIn = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "wthAmountIn")
          setIndexSumWhtAmountIn(colFilterForecastDetailswthAmountIn + 1);

          const colFilterForecastDetailswthAmountOut = get(table, "columns")
            .findIndex((colDetail) => colDetail.columnFieldName == "wthAmountOut")
          setIndexSumWhtAmountOut(colFilterForecastDetailswthAmountOut + 1);

          // ---------- Process for flag to show total amount of forecast amount ----------------
          if (colFilterForecastDetailsbaseAmount > 0 || colFilterForecastDetailsnetAmount > 0 || colFilterForecastDetailsvatAmount > 0 ||
            colFilterForecastDetailswthAmountIn > 0 || colFilterForecastDetailswthAmountOut > 0 || colFilterForecastcurrencyCode > 0) {
            flagShowTotalAmountDetail = true;
          }
        }
      });

      const newListTableSummaryColumns = (listTableSummary.table.columns).map((item) => {
        if (item.columnType == "link") {
          return { ...item, columnType: "render" }
        } else {
          return item
        }
      })

      const newListTableSummary = { table: { ...listTableSummary.table, columns: newListTableSummaryColumns } }

      colSummary = await Columns(listTableSummary, context, AppApi);
      colDetail = await Columns(listTableDetail, context, AppApi);
      // if (size(colSummary) > 0 && isEmpty(sortSummaryList)) {
      colSummary = await map(colSummary, (c) => ({ ...c, sortOrder: false }))
      // }
      // if (size(colDetail) > 0 && isEmpty(sortDetailList)) {
      colDetail = await map(colDetail, (c) => ({ ...c, sortOrder: false }))
      // }

      let defaultLimit = get(listTableDetail, "table.defaultLimit", 100);
      let limitOptions = get(listTableDetail, "table.limitOptions", []);

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
    setSearchList(searchList);
    prepareData(searchList);
    setSortSummaryList([])
  };

  const OnTableColumnDetailDisplayChange = (columns) => {
    setSearchList(searchList);
    prepareData(searchList);
    setSortDetailList([])
  };

  const OnTableColumnSummaryDisplayReset = (columns) => {
    setSearchList(searchList);
    prepareData(searchList);
    setSortSummaryList([])
  };

  const OnTableColumnDetailDisplayReset = (columns) => {
    setSearchList(searchList);
    prepareData(searchList);
    setSortDetailList([])
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
          disabledDate={90}
          sortListSummary={sortSummaryList}
          sortListDetail={sortDetailList}
          rowSelection={rowSelection}
          pagination={pagination}

          flagShowTotalAmountDetail={flagShowTotalAmountDetails}

          totalAmountDetailListModel={totalAmountDetailListModel}

          isPaymentReportPage={true}
          // ***** Total Amount Details *****
          // indexCurrency={indexCurrency}
          // currency={currency}
          // indexsumBaseAmount={indexsumBaseAmount}
          // sumBaseAmount={sumBaseAmount}
          // indexSumNetAmount={indexSumNetAmount}
          // sumNetAmount={sumNetAmount}
          // indexSumVatAmount={indexSumVatAmount}
          // sumVatAmount={sumVatAmount}
          // indexSumWhtAmountIn={indexSumWhtAmountIn}
          // sumWhtAmountIn={sumWhtAmountIn}
          // indexSumWhtAmountOut={indexSumWhtAmountOut}
          // sumWhtAmountOut={sumWhtAmountOut}

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
            get: "/p2p/api/v1/template/report/payment/summary/column/get",
            set: "/p2p/api/v1/template/report/payment/summary/column/set",
            default: "/p2p/api/v1/template/report/payment/summary/column/default",
          }}
          columnDisplayDetail={{
            onChange: OnTableColumnDetailDisplayChange,
            onReset: OnTableColumnDetailDisplayReset,
            get: "/p2p/api/v1/template/report/payment/detail/column/get",
            set: "/p2p/api/v1/template/report/payment/detail/column/set",
            default: "/p2p/api/v1/template/report/payment/detail/column/default",
          }}
        />
      </div>
    </>
  );
};

payment.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default payment;
