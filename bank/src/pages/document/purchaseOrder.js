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
import listViewJson from "../../models/poList.json";
import DynamicListView from "@/shared/components/DynamicListView"

const purchaseOrder = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading,
          hideLoading,
          forceLogin ,
          showAlertDialog,
          getSetting,
          setSetting,
          getStorage,
          setStorage } = useContext(StoreContext);
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

    showSizeChanger : true,
    // pageSizeOptions : [10, 20, 50],
    showTotal : (total,range)  => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    }
  });



  const [searchList, setSearchList] = useState([]);

  const [sortList, setSortList] = useState([]);
  const [rowSelection, setRowSelection] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const rowSelectionOption = {
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, "selectedRows: ", selectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
    getCheckboxProps: (record) => ({
      disabled:get(record,'multiSelectable',true) === false,
      name: record.invoiceNo,
    })
  };
  const [rejectModalShow, setRejectModalShow] = useState(false);
  const handleRejectModalClose = () => setRejectModalShow(false);
  const handleRejectModalShow = () => { setRejectModalShow(true); }

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }
  const tableHeaderAction = (action,config) => {
    console.log(config)
    if(action=="action.reject"){
      return rejectPO(action,config);
    }
    if(action=="action.approve"){
      return approvePO(action,config);
    }

  };
  const rejectPO = async(action,config) => {
    handleRejectModalShow()
  }
  const approvePO = async(action,config) => {
    handleApproveConfirmModalShow()
  }
  const dialogRejectOnFinish = async(values) => {
    try{
      showLoading("Rejecting Invoice")
      handleRejectModalClose();

      let rejectList = selectedRows.map(r=>{
        return get(r,"poNo")
      });
      let appr = await AppApi.getApi("/p2p/api/v1/reject/po",{
        reasonCode : values.code,
        actionReason : values.note,
        rejectList
      },{ method: "post", authorized: true });
      hideLoading();
      console.log(appr)
      if(appr.status==200){
        showAlertDialog({
          text : get(appr,"data.message"),
          icon: "success",
          showCloseButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        return;
      }
      showAlertDialog({
        title : get(appr,"data.error","Reject Failed !"),
        text : get(appr,"data.message","Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  }
  const approveConfirmOnFinish = async(values) => {
    try{
      showLoading("Approving Purchase Order")
      handleApproveConfirmModalClose();

      let approveList = selectedRows.map(r=>{
        return get(r,"poNo")
      });
      let appr = await AppApi.getApi("/p2p/api/v1/approve/po",{
        approveList
      },{ method: "post", authorized: true });
      hideLoading();
      if(appr.status==200){
        showAlertDialog({
          text : get(appr,"data.message"),
          icon: "success",
          showCloseButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        return;
      }
      showAlertDialog({
        title : get(appr,"data.error","Approve Failed !"),
        text : get(appr,"data.message","Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  }
  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortList([])
    router.push(
      {
        pathname: "/document/purchaseOrder",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };
  const onShowSizeChange = () => {

  }
  const onSearchSubmit = async (values) => {
    console.log(values)
    setSortList([])
    let searchListQuery = {};
    values.forEach(r => {
      searchListQuery = { ...searchListQuery, [r.field] : r.value };
    })
    router.push(
      {
        pathname: "/document/purchaseOrder",
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Purchase Order List");
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
    await setSortList(tmpsortList);
    await setPage(pagination.current);
    await setPageSize(pagination.pageSize);
    await setSetting('pageSize',pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  var delayTick;
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

  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading Purchase Order List");
    let list = await AppApi.getApi(
      "/p2p/api/v1/inquiry/po/list",
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
          return { ...r, key: r.no };
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
        title : get(list,"data.error","Error !"),
        text : get(list,"data.message"),
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
      showLoading("Preparing Purchase Order List");

        listView = await AppApi.getApi(
          "/p2p/api/v1/template/po/listView",
          {},
          { method: "post", authorized: true }
        );

        if (listView.status != 200) {
          return false;
        }
        setViewModel(listView.data);


      col = await Columns(listView.data,context,AppApi);
      // if(size(col) > 0 && isEmpty(sortList)){
        col = map(col, (c) => ({...c, sortOrder: false}))
      // }

      console.log("set default paginationStorage")
      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      let limitOptions = get(listView.data, "table.limitOptions", []);
      defaultLimit = getSetting('pageSize',defaultLimit);
      setPageSize(defaultLimit);

      await getData(1, defaultLimit, [], searchList, limitOptions);
      setColumns(col);

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
      <DialogReason
        mode="Reject"
        title={<>Reject Quote No. {selectedRows.length} list(s)</>}
        onFinish={dialogRejectOnFinish}
        visible={rejectModalShow}
        codeLists={[{option : "Other" , value : "OTHER"}]}
        closable={false}
        onClose={()=>{ handleRejectModalClose() }}
        />
      <DialogConfirm
        visible={approveConfirmModalShow}
        closable={false}
        onFinish={()=>{ approveConfirmOnFinish() }}
        onClose={()=>{ handleApproveConfirmModalClose() }}
        >Please confirm to approve all {selectedRows.length} list(s)</DialogConfirm>

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
          "onChange" : OnTableColumnDisplayChange,
          "onReset" : OnTableColumnDisplayReset,
          "get" : "/p2p/api/v1/template/po/displaycolumn/get",
          "set" : "/p2p/api/v1/template/po/displaycolumn/set",
          "default" : "/p2p/api/v1/template/po/displaycolumn/default"
        }}
        />
      </div>
    </>
  );
};

purchaseOrder.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default purchaseOrder;
