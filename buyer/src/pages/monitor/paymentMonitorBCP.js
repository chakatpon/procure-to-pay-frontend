import Head from "next/head";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import ErrorHandle from "@/shared/components/ErrorHandle";
import Columns from "@/shared/components/Columns";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import DynamicListView from "@/shared/components/DynamicListView"

const paymentMonitorBCP = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog , getSetting, setSetting } = useContext(StoreContext);
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
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    }
  });


  const [searchList, setSearchList] = useState([]);

  const [sortList, setSortList] = useState([]);
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
      disabled: get(record, 'multiSelectable', true) === false,
      name: record.invoiceNo,
    })
  };

  const tableHeaderAction = (action) => {
    console.log(action);

    showAlertDialog({
      title: "Header Action",
      text: action,
      icon: "success",
    })
  };

  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortList([])
    router.push(
      {
        pathname: "/monitor/paymentMonitor",
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
      searchListQuery = { ...searchListQuery, [r.field]: r.value };
    })
    router.push(
      {
        pathname: "/monitor/paymentMonitor",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Preparing Payment Monitoring(BCP) List");
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
    setSetting('pageSize',pagination.pageSize)
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
      icon: "warning"
    });
    console.log(onDev)
    if (onDev.isConfirmed) {
      router.push("/dashboard");
    }
  }
  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading Payment Monitoring(BCP) List");
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/bcp-payment",
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
    } else {
      hideLoading();
      showAlertDialog({
        title: get(list, "data.error", "Error !"),
        text: get(list, "data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      })
      return false;
    }
  };
  const prepareData = async (searchList) => {
    try {
      let col = [];
      let listView = {};
      showLoading("Preparing Payment Monitoring(BCP) List");
      listView = await AppApi.getApi(
        "/p2p/api/v1/template/payment/monitoring-bcp/listView",
        {},
        { method: "post", authorized: true }
      );

      if (listView.status != 200) {
        showAlertDialog({
          title: get(listView, "data.error", "Error !"),
          text: get(listView, "data.message"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        })
        // showAlertDialog({
        //   text: get(listView, "data.status", "listView Error")
        // })
        return false;
      }
      console.log(listView.data);
      setViewModel(listView.data);
      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      let limitOptions = get(listView.data, "table.limitOptions", []);
      defaultLimit = getSetting('pageSize',defaultLimit);
      setPageSize(defaultLimit);


      col = await Columns(listView.data, context, AppApi);
      // if(size(col) > 0 && isEmpty(sortList)){
        col = map(col, (c) => ({...c, sortOrder: false}))
      // }


      // await getData(1, defaultLimit, [], searchList, limitOptions);
      setColumns(col);

      if (get(listView.data, "table.multipleSelect", false)) {
        setRowSelection({
          ...rowSelectionOption,
          type: 'checkbox',
          columnWidth: 100,
        })
      }
      return;
    } catch (err) {
      hideLoading();
      setDataSource([]);
      ErrorHandle(err);
    }
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

          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          tableHeaderAction={tableHeaderAction}
          onSearchReset={onSearchReset}
          onSearchSubmit={onSearchSubmit}
          OnTableColumnDisplayChange={OnTableColumnDisplayChange}
          onHeaderAction={tableHeaderAction}
          handleTableChange={handleTableChange}
          columnDisplay={{
            "onChange": OnTableColumnDisplayChange,
            "onReset": OnTableColumnDisplayReset,
            "get": "/p2p/api/v1/template/payment/monitoring-bcp/displaycolumn/get",
            "set": "/p2p/api/v1/template/payment/monitoring-bcp/displaycolumn/set",
            "default": "/p2p/api/v1/template/payment/monitoring-bcp/displaycolumn/default"
          }}
        />
      </div>
    </>
  );
};

paymentMonitorBCP.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default paymentMonitorBCP;
