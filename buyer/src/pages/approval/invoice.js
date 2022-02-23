import Head from "next/head";
import { connect } from "react-redux";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import SearchBox from "@/shared/components/SearchBox";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import Columns from "@/shared/components/Columns";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import { Table, Tooltip, Button, Breadcrumb } from "antd";
import Link from "next/link";
import TableColumnDisplay from "@/shared/components/TableColumnDisplay";
// import listViewJson from "../../models/poList.json";
import PaymentDynamicListView from "@/shared/components/PaymentDynamicListView";
// import { Modal } from "react-bootstrap";
import { Form, Modal } from "antd";

const invoiceApproval = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, setAppMenuActive, getStorage, showAlertDialog, isAllow, getSetting, setSetting } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const [viewModel, setViewModel] = useState(false);
  const [listData, setListData] = useState(false);
  const [columns, setColumns] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [submitDataSource, setSubmitDataSource] = useState([]);
  const [submitDataSourceColumn, setSubmitDataSourceColumn] = useState([]);

  const [columnDisplay, setColumnDisplay] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const userData = getStorage("userData");
  const [pagination, setPagination] = useState({
    showSizeChanger: true,
    showTotal: (total, range) => {
      return `${range[0].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}-${range[1].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} of ${total
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")} item(s)`;
    },
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
      disabled: get(record, "multiSelectable", true) === false,
      name: record.invoiceNo,
    }),
  };
  const [cancelModalShow, setCancelModalShow] = useState(false);
  const handleCancelModalClose = () => setCancelModalShow(false);
  const handleCancelModalShow = () => {
    setCancelModalShow(true);
  };
  const [reason, setReason] = useState([]);
  const [rejectReason, setRejectReason] = useState([]);

  const [rejectModalShow, setRejectModalShow] = useState(false);
  const handleRejectModalClose = () => setRejectModalShow(false);
  const handleRejectModalShow = () => {
    setRejectModalShow(true);
  };

  const [groupConfirmModalShow, setGroupConfirmModalShow] = useState(false);
  const handleGroupConfirmModalClose = () => setGroupConfirmModalShow(false);
  const handleGroupConfirmModalShow = () => {
    setGroupConfirmModalShow(true);
  };

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => {
    setApproveConfirmModalShow(true);
  };

  const tableHeaderAction = (action, config) => {
    console.log(config);
    if (get(config, "actionType") == "multiSelectAction") {
      if (action == "action.cancel") {
        return cancelInvoice();
      }
      if (action == "action.submit") {
        return submitInvoice(action, config);
      }
      if (action == "action.reject") {
        return rejectInvoice(action, config);
      }
      if (action == "action.approve") {
        return approveInvoice(action, config);
      }
    }
  };
  const rejectInvoice = async (action, config) => {
    handleRejectModalShow();
  };
  const dialogRejectOnFinish = async (values) => {
    try {
      showLoading("Rejecting Invoice");
      handleRejectModalClose();

      let rejectList = selectedRows.map((r) => {
        return {
          invoiceNo: get(r, "invoiceNo"),
          poNo: get(r, "poNo"),
          grNo: get(r, "grNo"),
          buyerCode: get(r, "buyerCode"),
          buyerBranchCode: get(r, "buyerBranchCode"),
          buyerTaxId: get(r, "buyerTaxId"),
          supplierCode: get(r, "supplierCode"),
          supplierBranchCode: get(r, "supplierBranchCode"),
          supplierTaxId: get(r, "supplierTaxId"),
          supplierVatBranchCode: get(r, "supplierVatBranchCode"),
          supplierName: get(r, "supplierName"),
        };
      });
      let appr = await AppApi.getApi(
        "/p2p/api/v1/reject/invoice-to-pay",
        {
          ...values,
          rejectList,
        },
        { method: "post", authorized: true }
      );
      
      console.log(appr);
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        hideLoading();
        reloadList();
        prepareData(searchList);
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Reject Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      hideLoading();
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };
  const cancelInvoice = async (action, config) => {
    handleCancelModalShow();
  };
  const approveInvoice = async (action, config) => {
    handleApproveConfirmModalShow();
  };
  const approveConfirmOnFinish = async (values) => {
    try {
      showLoading("Approving Invoice");
      handleApproveConfirmModalClose();

      let approveList = selectedRows.map((r) => {
        return {
          invoiceNo: get(r, "invoiceNo"),
          paymentGroupId: get(r, "paymentGroupId"),
          buyerCode: get(r, "buyerCode"),
          buyerBranchCode: get(r, "buyerBranchCode"),
          buyerTaxId: get(r, "buyerTaxId"),
          supplierCode: get(r, "supplierCode"),
          supplierBranchCode: get(r, "supplierBranchCode"),
          supplierTaxId: get(r, "supplierTaxId"),
          supplierVatBranchCode: get(r, "supplierVatBranchCode"),
        };
      });
      let appr = await AppApi.getApi(
        "/p2p/api/v1/approve/invoice-to-pay",
        {
          ...values,
          approveList,
        },
        { method: "post", authorized: true }
      );
      
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message", "Something went wrong (HTTP" + appr.status + ")"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        hideLoading();
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Approve Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      hideLoading();
      reloadList();
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };
  const dialogReasonOnFinish = async (values) => {
    try {
      showLoading("Canceling Invoice");
      handleCancelModalClose();

      let cancelList = selectedRows.map((r) => {
        return {
          invoiceNo: get(r, "invoiceNo"),
          paymentGroupId: get(r, "paymentGroupId"),
          buyerCode: get(r, "buyerCode"),
          buyerBranchCode: get(r, "buyerBranchCode"),
          buyerTaxId: get(r, "buyerTaxId"),
          supplierCode: get(r, "supplierCode"),
          supplierBranchCode: get(r, "supplierBranchCode"),
          supplierTaxId: get(r, "supplierTaxId"),
          supplierVatBranchCode: get(r, "supplierVatBranchCode"),
        };
      });
      let appr = await AppApi.getApi(
        "/p2p/api/v1/cancel/invoice-to-pay",
        {
          ...values,
          cancelList,
        },
        { method: "post", authorized: true }
      );
      
      console.log(appr);
      if (appr.status == 200) {
        showAlertDialog({
          title: get(appr, "data.error", "Cancel completed !"),
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        hideLoading();
        reloadList();
        prepareData(searchList);
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Cancel Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      hideLoading();
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };
  const submitInvoice = async (action, config) => {
    try {
      showLoading("Submitting Invoice.");
      console.log("selectedRows : ", selectedRows);
      let submitList = selectedRows.map((r) => {
        return {
          invoiceNo: get(r, "invoiceNo"),
          paymentGroupId: get(r, "paymentGroupId"),
          buyerCode: get(r, "buyerCode"),
          buyerBranchCode: get(r, "buyerBranchCode"),
          buyerTaxId: get(r, "buyerTaxId"),
          supplierCode: get(r, "supplierCode"),
          supplierBranchCode: get(r, "supplierBranchCode"),
          supplierTaxId: get(r, "supplierTaxId"),
          supplierVatBranchCode: get(r, "supplierVatBranchCode"),
        };
      });
      let appr = await AppApi.getApi(
        "/p2p/api/v1/submit/invoice-to-pay",
        {
          submitList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      console.log(appr);
      if (appr.status == 200) {
        let col = await Columns({ table: { columns: get(appr, "data.columns", []) } }, context, AppApi);
        let data = get(appr, "data.groupPayment", []).map((r) => {
          return { ...r, key: r.no };
        });
        console.log("cc", col, get(appr, "data.columns", []), data);
        setSubmitDataSourceColumn(col);
        setSubmitDataSource(data);
        handleGroupConfirmModalShow();
        setSelectedRowKeys([]);
        setSelectedRows([]);
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Submit Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      setSelectedRowKeys([]);
      setSelectedRows([]);
      prepareData(searchList);
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };
  const handleGroupConfirmModalSubmit = async () => {
    handleGroupConfirmModalClose();
    try {
      showLoading("Submitting Payment.");
      let paymentList = submitDataSource.map((r) => r.paymentRef);
      let resp = await AppApi.getApi(
        "/p2p/api/v1/confirm/group-payment",
        {
          paymentList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      if (resp.status != 200) {
        showAlertDialog({
          title: get(resp, "data.error", "Submit error !"),
          text: get(resp, "data.message", "Something went wrong (HTTP" + resp.status + ")"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        prepareData(searchList);
        return false;
      } else {
        showAlertDialog({
          text: get(resp, "data.message", "Something went wrong (HTTP" + resp.status + ")"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        setSelectedRowKeys([]);
        setSelectedRows([]);
        reloadList();
        prepareData(searchList);
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      setSelectedRowKeys([]);
      setSelectedRows([]);
      prepareData(searchList);
    }
  };
  const onSearchReset = async () => {
    console.log("onSearchReset");
    setSearchList([]);
    setSelectedRows([]);
    setSelectedRowKeys([]);
    setSortList([]);
    router.push(
      {
        pathname: "/approval/invoice",
        query: [],
      },
      undefined,
      { shallow: true }
    );
  };

  const onSearchSubmit = async (values) => {
    try {
      console.log(values);
      setSortList([]);
      let searchListQuery = {};
      values.forEach((r) => {
        searchListQuery = { ...searchListQuery, [r.field]: r.value };
      });
      router.push(
        {
          pathname: "/approval/invoice",
          query: searchListQuery,
        },
        undefined,
        { shallow: true }
      );
      setSearchList(values);
      showLoading("Searching Invoice List");
    } catch (err) {
      hideLoading();
      setDataSource([]);
      ErrorHandle(err);
    }
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
    console.log(get(userData, "role"));
    try {
      console.log("useEffect");
      if (router.isReady) {
        let s = Object.keys(router.query).map((k) => {
          return { field: k, value: router.query[k] };
        });
        hideLoading();
        loadReason();
        setSearchList(s);
        prepareData(s);
        setAppMenuActive("approval/invoice");

        // ----- clear selected row when reload page ------
        setSelectedRowKeys([]);
        setSelectedRows([]);
      }
    } catch (e) {
      console.error(e);
    }
  }, [router]);

  const loadReason = async () => {
    const reasonApi = await AppApi.getApi(
      "/p2p/api/v1/cancel/invoice-to-pay/reasonCode",
      {},
      {
        method: "post",
        authorized: true,
      }
    );
    if (reasonApi.status == 200) {
      // console.log(reasonApi);
      // setReason(get(reasonApi, 'data.reasonList', []))
      setReason(
        reasonApi.data.reasonList.map((r) => {
          return { option: r.name, value: r.code };
        })
      );
    }
    const rejectReasonApi = await AppApi.getApi(
      "/p2p/api/v1/cancel/invoice-to-pay/reasonCode",
      {},
      {
        method: "post",
        authorized: true,
      }
    );
    if (rejectReasonApi.status == 200) {
      // console.log(reasonApi);
      // setReason(get(reasonApi, 'data.reasonList', []))
      setRejectReason(
        rejectReasonApi.data.reasonList.map((r) => {
          return { option: r.name, value: r.code };
        })
      );
    }

    setRejectReason;
  };
  const getData = async (page, pageSize, sortList, searchList, limitOptions) => {
    //try {
    showLoading("Loading Invoice List");
    let listViewApi = "";
    if (["Buyer_Audit_Approver"].includes(get(userData, "role"))) {
      listViewApi = "/p2p/api/v1/inquiry/invoice-to-pay/waitingApproval";
      setColumnDisplay({
        onChange: OnTableColumnDisplayChange,
        // "onReset" : OnTableColumnDisplayReset,
        get: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/get",
        set: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/set",
        default: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/default",
      });
    } else if (["Buyer_Finance_Maker_Approver", "Buyer_Finance_Maker"].includes(get(userData, "role"))) {
      listViewApi = "/p2p/api/v1/inquiry/invoice-to-pay/finance/waitingApproval";
      setColumnDisplay({
        onChange: OnTableColumnDisplayChange,
        // "onReset" : OnTableColumnDisplayReset,
        get: "/p2p/api/v1/template/finance/invoice-to-pay/displaycolumn/get",
        set: "/p2p/api/v1/template/finance/invoice-to-pay/displaycolumn/set",
        default: "/p2p/api/v1/template/finance/invoice-to-pay/displaycolumn/default",
      });
    } else if (["MFEC Dev"].includes(get(userData, "role"))) {
      /**------------------ Role MFEC Dev -------------------------- */
      hideLoading();
      showAlertDialog({
        title: "Error!",
        text: "You don't have permission to access requested page.",
        icon: "warning",
      });

      listViewApi = "/p2p/api/v1/inquiry/invoice-to-pay/waitingApproval";
      setColumnDisplay({
        onChange: OnTableColumnDisplayChange,
        // "onReset" : OnTableColumnDisplayReset,
        get: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/get",
        set: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/set",
        default: "/p2p/api/v1/template/invoice-to-pay/displaycolumn/default",
      });
      /**------------------ End -------------------------- */
    } else {
      hideLoading();
      showAlertDialog({
        title: "Error!",
        text: "You don't have permission to access requested page.",
        icon: "warning",
      });
      return;
    }
    let list = await AppApi.getApi(
      listViewApi,
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
      setDataSource(
        get(list, "data.items", []).map((r) => {
          return { ...r, key: r.no };
        })
      );
      let defaultLimit = pageSize || get(viewModel, "table.defaultLimit", 100);
      defaultLimit = await getSetting("pageSize", defaultLimit);
      // setPageSize(defaultLimit);
      setPagination({
        ...pagination,
        current: page,
        pageSize: defaultLimit,
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
        showConfirmButton: true,
      });
      return false;
    }
    // } catch (err) {
    //   hideLoading();
    //   ErrorHandle(err)
    // }
  };
  const reloadList = async () => {
    console.log("reloadList", pagination);
    try {
      setDataSource([]);
      await setSelectedRows([]);
      await setSelectedRowKeys([]);
      await getData(page, pageSize, sortList, searchList);
      await prepareData(searchList);
    } catch (err) {
      console.log(err);
    }
  };
  const prepareData = async (searchList) => {
    try {
      let col = [];
      let listView = {};
      showLoading("Preparing Invoice List");

      let listViewApi = "";
      if (["Buyer_Audit_Approver"].includes(get(userData, "role"))) {
        listViewApi = "/p2p/api/v1/template/invoice-to-pay/listView";
      } else if (["Buyer_Finance_Maker_Approver", "Buyer_Finance_Maker"].includes(get(userData, "role"))) {
        listViewApi = "/p2p/api/v1/template/finance/invoice-to-pay/listView";
      } else if (["MFEC Dev"].includes(get(userData, "role"))) {
        /**------------------ Role MFEC Dev -------------------------- */
        hideLoading();
        showAlertDialog({
          title: "Error!",
          text: "You don't have permission to access requested page.",
          icon: "warning",
        });

        listViewApi = "/p2p/api/v1/template/invoice-to-pay/listView";
      } else {
        /**------------------ End -------------------------- */
        hideLoading();
        showAlertDialog({
          title: "Error!",
          text: "You don't have permission to access requested page.",
          icon: "warning",
        });
        return;
      }
      // if (typeof listViewJson != undefined) {
      //   listView = {
      //     status: 200,
      //     data: listViewJson,
      //   };
      // } else {
      listView = await AppApi.getApi(listViewApi, {}, { method: "post", authorized: true });
      // }

      if (listView.status != 200) {
        return false;
      }

      col = await Columns(listView.data, context, AppApi, reloadList);
      // if(size(col) > 0 && isEmpty(sortList)){
      col = map(col, (c) => ({ ...c, sortOrder: false }));
      // }

      let defaultLimit = get(listView.data, "table.defaultLimit", 100);
      defaultLimit = getSetting("pageSize", defaultLimit);
      setPageSize(defaultLimit);
      let limitOptions = get(listView.data, "table.limitOptions", []);

      await getData(1, defaultLimit, [], searchList, limitOptions);
      setColumns(col);
      setViewModel(listView.data);

      if (get(listView.data, "table.multipleSelect", false)) {
        setRowSelection({
          ...rowSelectionOption,
          type: "checkbox",
          columnWidth: 100,
        });
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
    setSortList([]);
  };
  const OnTableColumnDisplayReset = (columns) => {
    setSearchList([]);
    prepareData([]);
    setSortList([]);
  };

  return viewModel == false ? (
    <></>
  ) : (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
      </Head>

      <div className="container-fluid px-0">
        <DialogReason
          mode="Cancel"
          title={<>Cancel Invoice to Pay {selectedRows.length} list(s)</>}
          onFinish={dialogReasonOnFinish}
          visible={cancelModalShow}
          codeLists={reason}
          closable={false}
          onClose={() => {
            handleCancelModalClose();
          }}
        />
        <DialogReason
          mode="Reject"
          title={<>Reject Invoice to Pay {selectedRows.length} list(s)</>}
          onFinish={dialogRejectOnFinish}
          visible={rejectModalShow}
          codeLists={rejectReason}
          closable={false}
          onClose={() => {
            handleRejectModalClose();
          }}
        />
        <DialogConfirm
          title="Preview Group Payment"
          width={"90%"}
          visible={groupConfirmModalShow}
          closable={false}
          onFinish={() => {
            handleGroupConfirmModalSubmit();
          }}
          onClose={() => {
            handleGroupConfirmModalClose();
          }}
        >
          {submitDataSource ? <Table columns={submitDataSourceColumn} dataSource={submitDataSource} pagination={false} className="table-x table-detail" scroll={{ x: 500 }}></Table> : <></>}
          <p className="pt-10">Please confirm to submit all {submitDataSource.length} list(s)</p>
        </DialogConfirm>

        <DialogConfirm
          visible={approveConfirmModalShow}
          closable={false}
          onFinish={() => {
            approveConfirmOnFinish();
          }}
          onClose={() => {
            handleApproveConfirmModalClose();
          }}
        >
          Please confirm to approve Invoice to Pay {selectedRows.length} list(s)
        </DialogConfirm>

        <PaymentDynamicListView
          viewModel={viewModel}
          columns={columns}
          dataSource={dataSource}
          searchList={searchList}
          sortList={sortList}
          rowSelection={rowSelection}
          pagination={pagination}
          columnDisplay={columnDisplay}
          selectedRowKeys={selectedRowKeys}
          setSelectedRowKeys={setSelectedRowKeys}
          tableHeaderAction={tableHeaderAction}
          onSearchReset={onSearchReset}
          onSearchSubmit={onSearchSubmit}
          OnTableColumnDisplayChange={OnTableColumnDisplayChange}
          onHeaderAction={tableHeaderAction}
          handleTableChange={handleTableChange}
        />
      </div>
    </>
  );
};

invoiceApproval.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "approval-invoice"])),
    },
  };
}
export default invoiceApproval;
