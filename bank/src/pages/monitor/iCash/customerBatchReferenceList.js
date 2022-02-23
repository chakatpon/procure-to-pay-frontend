import Head from "next/head";
import { connect } from "react-redux";
import Router, { useRouter, withRouter } from "next/router";
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

import DynamicListView from "@/shared/components/DynamicListView"
const customerBatchReferenceList = (props) => {
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
    // pageSizeOptions : [10, 20, 50],
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    }
  });


  const [searchList, setSearchList] = useState([]);

  const [sortList, setSortList] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const tableHeaderAction = (action, config) => {
    console.log(config)
  };

  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSelectedRowKeys([]);
    setSortList([])
    router.push(
      {
        pathname: "/monitor/iCash/customerBatchReferenceList",
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
        pathname: "/monitor/iCash/customerBatchReferenceList",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Customer Batch Reference List");
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
    setSetting('pageSize', pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  useEffect(async () => {
    context.setPaymentReferenceView(false)
    context.setBuyerCodePayment('')
    context.setCustomerBatchReference('')
    try {
      if (router.isReady) {
        let s = Object.keys(router.query).map((k) => {
          return { field: k, value: router.query[k] };
        });
        await hideLoading();
        setSearchList(s);
        await prepareData(s);
      }
    } catch (e) {
      hideLoading();
      console.error(e);
    }
  }, [router]);

  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading Customer Batch Reference List");
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/icashMonitoring/customerBatchReference",
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
        const cols = columns.map(({ sortOrder, ...keepAttrs }) => keepAttrs)
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
      showLoading("Preparing Customer Batch Reference List");


      listView = await AppApi.getApi(
        "/p2p/api/v1/template/icashMonitoring/customerBatchReference/listView",
        {},
        { method: "post", authorized: true }
      );

      if (listView.status != 200) {
        return false;
      }
      setViewModel(listView.data);

      /**  --------- push col Payment Reference Lists --------------*/
      const columnsOld = _.get(listView, 'data.table.columns', [])
      columnsOld.push({
        "columnName": "Payment Reference Lists",
        "columnObjectKey": null,
        "columnWidth": null,
        "columnType": "render",
        "columnClass": "text-center",
        "columnFieldName": "paymentReferenceLists",
        "columnSorting": false,
        "columnIcon": "icon",
        "columnDefault": true,
        "columnSeq": _.get(listView, 'data.table.columns', []).length + 1,
        "columnLink": null,
        "columnDisplay": true,
        "render": (text, record, index) => (
          <a
            className="btn-text blue"
            onClick={async () => {
              await context.setPaymentReferenceView(true)
              await context.setBuyerCodePayment(record.buyerCode)
              await context.setCustomerBatchReference(record.customerBatchReference)
              showLoading("Loading")
              Router.push({
                pathname: "/monitor/iCash/paymentReferenceList",
              });
            }}
            style={{ width: "150px" }}
          >
            View
          </a>
        )
      })
      /**  -------------- end -------------*/

      col = await Columns(listView.data, context, AppApi);
      // if(size(col) > 0 && isEmpty(sortList)){
      col = map(col, (c) => ({ ...c, sortOrder: false }))
      // }

      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      let limitOptions = get(listView.data, "table.limitOptions", []);
      defaultLimit = getSetting('pageSize', defaultLimit);
      setPageSize(defaultLimit);

      await getData(1, defaultLimit, [], searchList, limitOptions);
      setColumns(col);

      return;
    } catch (err) {
      console.log("ERROR", error)
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
            "get": "/p2p/api/v1/template/icashMonitoring/customerBatchReference/displaycolumn/get",
            "set": "/p2p/api/v1/template/icashMonitoring/customerBatchReference/displaycolumn/set",
            "default": "/p2p/api/v1/template/icashMonitoring/customerBatchReference/displaycolumn/default"
          }}
        />
      </div>
    </>
  );
};

customerBatchReferenceList.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default customerBatchReferenceList;
