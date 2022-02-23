import Head from "next/head";
import { connect } from "react-redux";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import SearchBox from "@/shared/components/SearchBox";
import ErrorHandle from "@/shared/components/ErrorHandle";
import Columns from "@/shared/components/Columns";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import { Table, Tooltip, Button,Breadcrumb } from "antd";
import Link from "next/link";
import TableColumnDisplay from "@/shared/components/TableColumnDisplay";
import DynamicListView from "@/shared/components/DynamicListView"
// import listViewJson from "../../models/poList.json";
const goodsReceipt = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin,setAppMenuActive,showAlertDialog ,getSetting,setSetting} = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [currPageSize, setCurrPageSize] = useState(25);
  const [currPage, setPage] = useState(1);
  const [pagination, setPagination] = useState({

    showSizeChanger : true,
    // onChange : onPaginationChange,
    // pageSizeOptions : [10,20,30],
    showTotal : (total,range)  => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    }
  });


  const [searchList, setSearchList] = useState([]);

  const [sortList, setSortList] = useState([]);
  const [rowSelection, setRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const rowSelectionOption = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
      setSelectedRowKeys(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled:get(record,'multiSelectable',true) === false,
      name: record.poNo,
    })
  };
  const tableHeaderAction = (action) => {
    alert(action);
  };
  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    // setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortList([])
    router.push(
      {
        pathname: "/document/goodsReceipt",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };
  const onSearchSubmit = async (values) => {
    try{
      console.log(values)
      setSortList([])
    let searchListQuery = {};
    values.forEach(r => {
      searchListQuery = { ...searchListQuery, [r.field] : r.value };
    })
    router.push(
      {
        pathname: "/document/goodsReceipt",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
      setSearchList(values);
      showLoading("Searching Goods Receipt List");
    } catch (err) {
      hideLoading();
      setDataSource([]);

      ErrorHandle(err);
    }
  };


  const handleTableChange = async (pagination, filters, sorter) => {
    let tmpsortList = [];
    if (sorter) {
      if(get(sorter,'field') && get(sorter, 'order')){
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
    await setCurrPageSize(pagination.pageSize);
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
        setAppMenuActive("document/goodsReceipt");
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {

    showLoading("Loading Goods Receipt List");
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/gr/list",
      {
        page: page,
        pageSize: pageSize,
        searchList,
        sortList,
      },
      { method: "post", authorized: true }
    );
    if (list.status == 200) {
      if(!isEmpty(sortList)){
        const cols = columns.map(({sortOrder, ...keepAttrs}) => keepAttrs)
        setColumns(cols)
      }
      setListData(list.data);
      setDataSource([]);
      setDataSource(
        get(list, "data.items", []).map((r) => {
          return { ...r, key: r.poNo };
        })
      );
      setPagination({
        ...pagination,
        current: page,
        pageSize: pageSize,
        total: get(list, "data.totalRecord", 0),
        pageSizeOptions: limitOptions || pagination.pageSizeOptions
      });
      hideLoading();
      return true;
    }  else {
      hideLoading();
      showAlertDialog({
        title : get(list,"data.error","Error !"),
        text : get(list,"data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      })
      return false;
    }
    // } catch (err) {
    //   hideLoading();
    //   ErrorHandle(err)
    // }
  };
  const prepareData = async (searchList) => {
    try {
      let col = [];
      let listView = {};
      showLoading("Preparing Goods Receipt List");
      // if (typeof listViewJson != undefined) {
      //   listView = {
      //     status: 200,
      //     data: listViewJson,
      //   };
      // } else {
        listView = await AppApi.getApi(
          "/p2p/api/v1/template/gr/listView",
          {},
          { method: "post", authorized: true }
        );
      // }

      if (listView.status != 200) {
        return false;
      }

      col = await Columns(listView.data);
      // if(size(col) > 0 && isEmpty(sortList)){
        col = map(col, (c) => ({...c, sortOrder: false}))
      // }

      let displaycolumn = await AppApi.getApi(
        "/p2p/api/v1/template/gr/displaycolumn/get",
        {},
        { method: "post", authorized: true }
      );
      if (displaycolumn.status != 200) {
        return false;
      }

      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      defaultLimit = getSetting('pageSize',defaultLimit);
      setCurrPageSize(defaultLimit);
      let limitOptions = get(listView.data, "table.limitOptions", []);

      await getData(1, defaultLimit, [], searchList, limitOptions);
      setColumns(col);
      setViewModel(listView.data);

        if( get(listView.data, "table.multipleSelect", false)){
          setRowSelection({
                    ...rowSelectionOption,
                    type: 'checkbox',
                    columnWidth : 100,
                  })
        }

      return;
    } catch (err) {
      hideLoading();
      setDataSource([]);

      ErrorHandle(err);
    }
  };
  const OnTableColumnDisplayChange = async (columns) => {
    try{
      setSortList([])
      await prepareData(searchList);
    } catch (err) {
      hideLoading();
      setDataSource([]);
      ErrorHandle(err);
    }
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
          "onChange" : OnTableColumnDisplayChange,
          // "onReset" : OnTableColumnDisplayReset,
          "get":"/p2p/api/v1/template/gr/displaycolumn/get",
          "set":"/p2p/api/v1/template/gr/displaycolumn/set",
          "default":"/p2p/api/v1/template/gr/displaycolumn/default"
        }}
        selectedRowKeys={selectedRowKeys}
        setSelectedRowKeys={setSelectedRowKeys}
        tableHeaderAction={tableHeaderAction}
        onSearchReset={onSearchReset}
        onSearchSubmit={onSearchSubmit}
        OnTableColumnDisplayChange={OnTableColumnDisplayChange}
        // OnTableColumnDisplayReset={OnTableColumnDisplayReset}
        handleTableChange={handleTableChange}
        />

      </div>
    </>
  );
};

goodsReceipt.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default goodsReceipt;
