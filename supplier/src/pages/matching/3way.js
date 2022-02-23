import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import Columns from "@/shared/components/Columns";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import DynamicListView from "@/shared/components/DynamicListView"

const threeWay = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin , showAlertDialog, getSetting, setSetting } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 25,
    total: 0,
    showSizeChanger : true,
    pageSizeOptions : [10, 20, 50],
    showTotal : (total,range)  => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    }
  });
  const [searchList, setSearchList] = useState([]);
  const [sortList, setSortList] = useState([]);
  const [rowSelection, setRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const apiConfig = {
    dataSource: "/p2p/api/v1/inquiry/threeWayMatch/list",
    viewModel: "/p2p/api/v1/template/threeWayMatch/listView"
  }

  const rowSelectionOption = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: get(record,'multiSelectable',true) === false,
      name: record.poNo,
    })
  };

  const tableHeaderAction = (action) => {
    showAlertDialog({
      title: "Header Action",
      text: action,
      icon: "success",
    })
  };

  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSortList([])
    router.push(
      {
        pathname: "/matching/3way",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };

  const onSearchSubmit = async (values) => {
    console.log(values)
    setSortList([])
    let searchListQuery = {};
    values.forEach(r => {
      searchListQuery = { ...searchListQuery, [r.field] : r.value };
    })
    router.push(
      {
        pathname: "/matching/3way",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching 3 Way Matching List");
  };

  const handleTableChange = async (pagination, filters, sorter) => {
    let tmpsortList = [];
    if (sorter) {
      if (get(sorter, 'field') && get(sorter, 'order')) {
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
    setSetting('pageSize',pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  useEffect(() => {
    try {
      if (router.isReady) {
        let s = Object.keys(router.query).map((k) => {
          return { field: k, value: router.query[k] };
        });
        hideLoading();
        setSearchList(s);
        prepareData(s);
      }
    } catch (e) {
      hideLoading();
      console.error(e);
    }
  }, [router]);

  const performGetData = async (path, body, catchCase) => {
    try {
      const response =  await AppApi.getApi(path, body, { method: "post", authorized: true });
      if (get(response, "status", 500) == 200) {
        return get(response, "data")
      } else {
        hideLoading();
        showAlertDialog({
          title: get(response, "data.error", "Error !"),
          text: get(response, "data.message"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        })
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err)
      catchCase
    }
  }

  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading 3 Way Matching List");
    const response = await performGetData(get(apiConfig, "dataSource", ""), {page, pageSize, searchList, sortList})
    if (response) {
      if(!isEmpty(sortList)){
        const cols = columns.map(({sortOrder, ...keepAttrs}) => keepAttrs)
        setColumns(cols)
      }
      setListData(response);
      setDataSource([]);
      setDataSource(
        get(response, "items", []).map((r) => {
          return { ...r, key: r.poNo };
        })
      );
      setPagination({...pagination, current: page, pageSize, total: get(response, "totalRecord", 0),
      pageSizeOptions: limitOptions || pagination.pageSizeOptions});
      hideLoading();
      return true;
    }
    return false;
  }

  const prepareData = async (searchList) => {
    showLoading("Preparing 3 Way Matching List");
    const response = await performGetData(get(apiConfig, "viewModel", ""), [], setDataSource([]))
    if (response) {
      setViewModel(response);
      let defaultLimit = get(response, "table.defaultLimit", 100);
      let limitOptions = get(response, "table.limitOptions", []);
      defaultLimit = getSetting('pageSize',defaultLimit);
      setPageSize(defaultLimit)

      await getData(1, defaultLimit, [], searchList, limitOptions)
      let col = await Columns(response)
      // if(size(col) > 0 && isEmpty(sortList)){
        col = map(col, (c) => ({...c, sortOrder: false}))
      // }
      setColumns(col)

      if (get(response, "table.multipleSelect", false)) {
        setRowSelection({...rowSelectionOption, type: 'checkbox', columnWidth: 100})
      }
      return;
    }
    return false
  };

  const OnTableColumnDisplayChange = (columns) => {
    setSearchList([]);
    prepareData([]);
    setSortList([])
  }

  const OnTableColumnDisplayReset = (columns) => {
    setSearchList([]);
    prepareData([]);
    setSortList([])
  }

  return viewModel == false ? (
    <></>
  ) : (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
      </Head>

      <div className="container-fluid px-0">
        <DynamicListView
        viewModel={viewModel}
        columns={columns}
        dataSource={dataSource}
        searchList={searchList}
        sortList={sortList}
        rowSelection={rowSelection}
        pagination={pagination}
        columnDisplay={{
          "onChange": OnTableColumnDisplayChange,
          "onReset": OnTableColumnDisplayReset,
          "get": "/p2p/api/v1/template/threeWayMatch/displaycolumn/get",
          "set": "/p2p/api/v1/template/threeWayMatch/displaycolumn/set",
          "default": "/p2p/api/v1/template/threeWayMatch/displaycolumn/default"
        }}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        tableHeaderAction={tableHeaderAction}
        onSearchReset={onSearchReset}
        onSearchSubmit={onSearchSubmit}
        OnTableColumnDisplayChange={OnTableColumnDisplayChange}
        OnTableColumnDisplayReset={OnTableColumnDisplayReset}
        handleTableChange={handleTableChange}
        />
      </div>
    </>
  );
};

threeWay.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}

export default threeWay;
