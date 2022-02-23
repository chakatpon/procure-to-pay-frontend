import Head from "next/head";
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
import DynamicListView from "@/shared/components/DynamicListView";
import RadioList from "@/shared/components/RadioList";

const payment = (props) => {
  const urlIndexView = "/approval/payment";
  const apiConfig = {
    dataSource : "/p2p/api/v1/inquiry/payment/waitingApproval",
    viewModel : "/p2p/api/v1/template/payment/waitingApproval/listView",
    approve: "/p2p/api/v1/approve/payment",
    reject: "/p2p/api/v1/reject/payment",
    regroup: "/p2p/api/v1/delete/group-payment",
    changeAccount: "/p2p/api/v1/change/payment/debit-account",
    getReasonCode: "/p2p/api/v1/reject/payment/reasonCode",
    getDebitAccount: "/p2p/api/v1/inquiry/payment/debit-account",
    columnDisplay : {
      get : "/p2p/api/v1/template/payment/waitingApproval/displaycolumn/get",
      set : "p2p/api/v1/template/payment/waitingApproval/displaycolumn/set",
      default : "/p2p/api/v1/template/payment/waitingApproval/displaycolumn/default"
    }
  }
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, showStandardDialog, showAlertDialog, getSetting, setSetting } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
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
  const [selectedRows, setSelectedRows] = useState([]);
  const [dialogConfirmShow, setDialogConfirmShow] = useState(false)
  const [actionData, setActionData] = useState({})
  const [dialogReasonShow, setDialogReasonShow] = useState(false)
  const [debitAccountSelected, setDebitAccountSelected] = useState(0)

  useEffect(() => {
    try {
      if (router.query.detailBack) {
        router.back()
      }
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

  const actionList = (data, action, body) => {
    const dataLists =  {
      "action.approve": {
        type: "approve",
        body: data>1 ? `Please confirm to approve all ${data} lists.` : `Please confirm to approve all ${data} list.`,
        success: data>1 ? `${data} lists are approved.` : `${data} list is approved.`,
      },
      "action.reject": {
        type: "reject",
        title: "Reject Payment",
        body,
        success: data>1 ? `${data} lists  are rejected.` : `${data} list is rejected.`
      },
      "action.regroup": {
        type: "regroup",
        body: data>1 ? `Please confirm to Re-Group all ${data} lists.` : `Please confirm to Re-Group all ${data} list.`,
        success: "Re-Group Payment Successfully.",
      },
      "action.change-account": {
        type: "changeAccount",
        title: "Change Debit Account",
        content: "Debit Account",
        body,
        success: "Change Debit Account Data Successfully.",
      }
    }
    return dataLists[action]
  }

  const prepareData = async (searchList) => {
    let col = [];
    showLoading("Preparing Payment List");
    const response = await performGetData(get(apiConfig,"viewModel"), [])
    if (response) {
      setViewModel(response);
      let defaultLimit = get(response, "table.defaultLimit", 100);
      let limitOptions = get(response, "table.limitOptions", []);
      defaultLimit = getSetting('pageSize',defaultLimit);
      setPageSize(defaultLimit);
      console.log("Template Data")
      col = await Columns(response, context, AppApi);
      await getData(1, defaultLimit, [], searchList, limitOptions);
      // if(size(col) > 0 && isEmpty(sortList)){
        col = await map(col, (c) => ({...c, sortOrder: false}))
      // }
      setColumns(col);
      if (get(response, "table.multipleSelect", false)) {
        setRowSelection({...rowSelectionOption, type: 'checkbox', columnWidth: 100, })
      }
      hideLoading();
      return;
    }
    return false
  };

  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    showLoading("Loading Payment List");
    const response = await performGetData(get(apiConfig, "dataSource"), {page, pageSize, searchList, sortList})
    console.log("RESPONSE : ",response)
    if (response) {
      if(!isEmpty(sortList)){
        const cols = columns.map(({sortOrder, ...keepAttrs}) => keepAttrs)
        setColumns(cols)
      }
      setDataSource(get(response, "items", []).map((r) => {
          return { ...r, key: r.no };
        })
      );
      setPagination({...pagination, current: page, pageSize, total: get(response, "totalRecord", 0),
      pageSizeOptions: limitOptions || pagination.pageSizeOptions});
      hideLoading();
      return true;
    }
    return false;
  };


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

  const tableHeaderAction = async (action, config) => {
    if (action == "action.approve") {
      context.setMessageLoading("Approving Payment")
    }
    if (action == "action.regroup") {
      context.setMessageLoading("Re-Groupping Payment")
    }
    switch (action) {
      case "action.reject":
        showLoading("Loading Reject Reason Codes")
        const response1 = get(await performGetData(get(apiConfig, "getReasonCode"), []), "reasonList")
        if (response1) {
          setActionData(actionList(selectedRows.length, action, response1))
          hideLoading();
          setDialogReasonShow(true)
        }
        break
      case "action.change-account":
        showLoading("Loading Debit Accounts List")
        const response = get(await performGetData(get(apiConfig, "getDebitAccount"), []), "debitAccount", "")
        if (response) {
          setActionData(actionList(null, action, response))
          setDebitAccountSelected(response.findIndex((element) => element.defualtFlag == "Y"))
          hideLoading();
          setDialogConfirmShow(true)
        }
        break
      default:
        setActionData(actionList(selectedRows.length, action))
        setDialogConfirmShow(true)
        break
    }
  };

  const performGetData = async (path, body) => {
    try {
      const response = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        return get(response, "data")
      } else {
        hideLoading();
        showStandardDialog(get(response, "data.error", "Error !"), get(response, "data.message"), "error")
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err)
    }
  }

  const onComfirmHeader = async (data) => {
    const type = get(actionData, "type")
    type == "reject" ? setDialogReasonShow(false) : setDialogConfirmShow(false)
    const paymentRefList = selectedRows.map((value) => get(value, "paymentRef"))
    let body
    switch (type) {
      case "approve":
        body = {
          approveList: paymentRefList
        }
        break
      case "reject":
        body = {
          rejectList: paymentRefList,
          code: get(data, "code"),
          note: get(data, "note"),
        }
        break
      case "regroup":
        body = {
          paymentList: paymentRefList
        }
        break
      case "changeAccount":
        body = {
          changeList: paymentRefList,
          accountNo: get(actionData, `body[${debitAccountSelected}].accountNo`),
          totalRecord: get(actionData, "body").length
        }
        break
    }
    setSelectedRowKeys([])
    setSelectedRows([])
    if (await performPostData(get(apiConfig, type), body)) {
      showStandardDialog(null, type == "changeAccount" ? get(actionData, "success").replace("Data", get(actionData, `body[${debitAccountSelected}].accountNo`)) : get(actionData, "success"), "success", async () => await getData(page, pageSize, sortList, searchList), true, "Loading Payment Monitoring List")
    }
    setTimeout(() => {
      context.setMessageLoading("")
    }, 100);
  }

  const performPostData = async (path, body) => {
    try {
      showLoading()
      const response = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200 && get(response, "data.status", -1) == 0 || get(response, "data.status", -1) == 200) {
        // hideLoading();
        showAlertDialog({
          text: get(response, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        hideLoading();
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        return
      }else if(response.status != 200){
        showAlertDialog({
          title: get(response, "data.error", "Submit error !"),
          text: get(response, "data.message", "Something went wrong (HTTP"+response.status+")"),
          icon: "error",
          showCloseButton: true,
          showConfirmButton: true,
        })
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        hideLoading();
        return
      }
       else {
        hideLoading();
        console.log(response)
        showStandardDialog(get(response,"data.error", "Error !"), get(response, "data.message"), "error", async () => await getData(page, pageSize, sortList, searchList), true, "Loading Payment Monitoring List")
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        return false
      }
    } catch (err) {
      hideLoading();
      setSelectedRowKeys([]);
      setSelectedRows([]);
      prepareData(searchList);
      ErrorHandle(err);
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
        pathname: urlIndexView,
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };

  const onSearchSubmit = async (values) => {
    showLoading("Searching Payment List");
    console.log(values)
    setSortList([])
    let searchListQuery = {};
    values.forEach(r => {
      searchListQuery = { ...searchListQuery, [r.field] : r.value };
    })
    router.push(
      {
        pathname: urlIndexView,
        query: searchListQuery,
      },
      undefined,
      { shallow: true }
    );
    setSearchList(values);
    showLoading("Searching Payment List");
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
    await setPageSize(pagination.pageSize);
    setSetting('pageSize',pagination.pageSize);
    await getData(pagination.current, pagination.pageSize, tmpsortList, searchList);
  };

  const onDevMode = async() => {
    let onDev = await showAlertDialog({
      text : "อยู่ระหว่างการพัฒนา",
      icon : "warning"
    });
    console.log(onDev)
    if (onDev.isConfirmed) {
      router.push("/dashboard");
    }
  }

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
        <link href="/assets/css/pages/waitingpaymentapproval/waitingpaymentapproval.css" rel="stylesheet" type="text/css"/>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
      </Head>

      <div className="container-fluid px-0">
        <DialogConfirm
          title={get(actionData, "title")}
          content={get(actionData, "content")}
          visible={dialogConfirmShow}
          onFinish={onComfirmHeader}
          center={true}
          onClose={() => setDialogConfirmShow(false)}>

          {(get(actionData, "type") == "changeAccount") ?
          <div className="ml-24 mb-8 text-left">
          <RadioList currentSeleted={debitAccountSelected}
          onChangeSeleted={(index) => setDebitAccountSelected(index)}
          data={get(actionData, "body")}/>
          </div> : get(actionData, "body")}
        </DialogConfirm>

        <DialogReason
          mode="Reject"
          title={`${get(actionData, "title")} ${selectedRows.length} List(s)`}
          visible={dialogReasonShow}
          center={true}
          firstStarOn={false}
          onFinish={onComfirmHeader}
          codeLists={get(actionData, "type") == "reject" ? get(actionData, "body", []).map((data) => {
            return {option: get(data, "name"), value: get(data, "code")}
          }) : undefined}
          onClose={() => setDialogReasonShow(false)}/>

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
        columnDisplay={get(apiConfig,"columnDisplay") ? {
          "onChange" : OnTableColumnDisplayChange,
          "onReset" : OnTableColumnDisplayReset,
          ...get(apiConfig,"columnDisplay",{})
        } : false }
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
      ...(await serverSideTranslations(locale, ["common", "apprival-payment"])),
    },
  };
}
export default payment;
