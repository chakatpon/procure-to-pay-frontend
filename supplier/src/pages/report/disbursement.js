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
import _, { get, set, isEmpty, isNull, forEach, filter, size, map, unionBy } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";

import Link from "next/link";
import moment from "moment";
import DynamicListView from "@/shared/components/DynamicListView";
const disbursement = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getSetting, setSetting } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    showSizeChanger: true,
    pageSizeOptions: [10, 20, 50],
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    },
  });

  const [searchList, setSearchList] = useState([]);
  const [sortList, setSortList] = useState([]);

  const [firstLoad, setFirstLoad] = useState(true);

  const onSearchReset = async () => {
    // console.log("onSearchReset");
    setSearchList([]);
    setSortList([]);
    setFirstLoad(true);
    setDataSource([]);
    setPagination({
      ...pagination,
      current: page,
      pageSize: pageSize,
      total: 0,
    });
    router.push(
      {
        pathname: "/report/disbursement",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };
  const onShowSizeChange = () => {};
  const onSearchSubmit = async (values) => {
    // console.log(values);
    setSortList([]);
    setFirstLoad(false);
    let searchListQuery = {};
    values.forEach((r) => {
      searchListQuery = { ...searchListQuery, [r.field]: r.value };
    });
    router.push(
      {
        pathname: "/report/disbursement",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Disbursement Report List");
  };

  const handleTableChange = async (pagination, filters, sorter) => {
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

    setSortList(tmpsortList);
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
          // ------------- default disbursement date -----------
          const defaultDisbursementDate = {
            field: "disbursementDate",
            value: `${moment().format("YYYY-MM-DD")},${moment().format("YYYY-MM-DD")}`,
          };
          searchLists = unionBy(searchLists, [defaultDisbursementDate]);
        }

        setSearchList(searchLists);
        prepareData(searchLists);
        // onDevMode()
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
  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading Disbursement Report List");
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/report/disbursement",
      {
        page: page,
        pageSize: pageSize,
        searchList,
        sortList,
      },
      { method: "post", authorized: true }
    );
    if (list.status == 200) {
      if (!isEmpty(sortList)) {
        const cols = columns.map(({ sortOrder, ...keepAttrs }) => keepAttrs);
        setColumns(cols);
      }
      setListData(list.data);
      setDataSource([]);
      setDataSource(
        get(list, "data.items", []).map((r) => {
          return { ...r, key: r.no };
        })
      );
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: get(list, "data.totalRecord", 0),
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
      let col = [];
      let listView = {};
      showLoading("Preparing Disbursement Report List");

      listView = await AppApi.getApi(
        "/p2p/api/v1/template/report/disbursement/",
        {},
        { method: "post", authorized: true }
      );

      if (listView.status != 200) {
        return false;
      }

      // listView = disbursementTemplate;
      setViewModel(listView.data);

      // console.log("listView : ",listView.data);

      col = await Columns(listView.data, context, AppApi);
      // if(size(col) > 0 && isEmpty(sortList)){
      col = map(col, (c) => ({ ...c, sortOrder: false }));
      // }

      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      let limitOptions = get(listView.data, "table.limitOptions", []);
      defaultLimit = getSetting("pageSize", defaultLimit);
      setPageSize(defaultLimit);

      if (!firstLoad) {
        // ------ inquiry data when it's not the first page load. ---------
        await getData(1, defaultLimit, [], searchList, limitOptions);
      } else {
        get(listView.data,"search",[]).map((s) => {
          if (s.searchChild !== null && s.searchChild !== undefined) {
            if (get(s.searchChild,"searchInputDefaultValueOption",null) !== null) {
              const defaultValueOption = {
                field: get(s.searchChild,"searchKey","untitle"),
                value: get(s.searchChild,"searchInputDefaultValueOption",[])
              }

              searchList = unionBy(searchList,[defaultValueOption]);
              // searchListsDefaultValue.push(defaultValueOption);
            }
          }
        });

        setSearchList(searchList);
        // console.log("searchList New : ", searchList);
      }

      setColumns(col);
      hideLoading();
      return;
    } catch (err) {
      hideLoading();
      setDataSource([]);
      ErrorHandle(err);
    }
  };

  const OnTableColumnDisplayChange = (columns) => {
    setSearchList(searchList);
    setFirstLoad(false);
    prepareData(searchList);
    setSortList([]);
  };
  const OnTableColumnDisplayReset = (columns) => {
    setSearchList(searchList);
    setFirstLoad(false);
    prepareData(searchList);
    setSortList([]);
  };

  return viewModel == false ? (
    <></>
  ) : (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/disbursement_report/disbursement_report.css" rel="stylesheet" />
      </Head>

      <div className="container-fluid px-0">
        <DynamicListView
          viewModel={viewModel}
          columns={columns}
          dataSource={dataSource}
          searchList={searchList}
          sortList={sortList}
          pagination={pagination}
          disabledDate={90}
          onSearchReset={onSearchReset}
          onSearchSubmit={onSearchSubmit}
          OnTableColumnDisplayChange={OnTableColumnDisplayChange}
          handleTableChange={handleTableChange}
          columnDisplay={{
            onChange: OnTableColumnDisplayChange,
            onReset: OnTableColumnDisplayReset,
            get: "/p2p/api/v1/template/report/disbursement/column/get",
            set: "/p2p/api/v1/template/report/disbursement/column/set",
            default: "/p2p/api/v1/template/report/disbursement/column/default",
          }}
        />
      </div>
    </>
  );
};

disbursement.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default disbursement;
