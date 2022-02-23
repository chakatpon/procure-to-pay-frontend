import Head from "next/head";
import { connect } from "react-redux";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicView from "@/shared/components/DynamicView";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";

import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, has, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import { Row, Col, Breadcrumb, Descriptions, Table } from "antd";
import { Button, Image } from "react-bootstrap";
// import mockView from "../../../../../models/invoiceDetail.json"
const invoiceDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getStorage } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{ option: "Other", value: "OTHER" }]);
  const [cancelModalShow, setCancelModalShow] = useState(false);
  const handleCancelModalClose = () => setCancelModalShow(false);
  const handleCancelModalShow = () => {
    setCancelModalShow(true);
  };
  const [rejectReason, setRejectReason] = useState([]);

  const [submitConfirmModalShow, setSubmitConfirmModalShow] = useState(false);
  const handleSubmitConfirmModalClose = () => setSubmitConfirmModalShow(false);
  const handleSubmitConfirmModalShow = () => {
    setSubmitConfirmModalShow(true);
  };

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

  const [submitDataSource, setSubmitDataSource] = useState([]);
  const [submitDataSourceColumn, setSubmitDataSourceColumn] = useState([]);

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => {
    setApproveConfirmModalShow(true);
  };

  const apiConfig = {
    dataSource: "/p2p/api/v1/view/inv/detail",
    viewModel: "/p2p/api/v1/template/inv/detailView",
  };

  useEffect(() => {
    if (router.isReady) {
      loadRejectReason();
      getData();
    }
  }, [router]);
  const getData = async () => {
    try {
      setDataDetail(false);
      showLoading(t("Getting Invoice Details"));

      let {invNo, statusCode, invDate, itemCode, buyerCode, buyerBranchCode, supplierCode, supplierBranchCode} = router.query

      invNo =  invNo == "-" ? "" : invNo;
      statusCode = statusCode == "-" ? "" : statusCode;
      invDate = invDate == "-" ? "" : invDate;
      itemCode = itemCode == "-" ? "" : itemCode;
      buyerCode = buyerCode == "-" ? "" : buyerCode;
      buyerBranchCode = buyerBranchCode == "-" ? "" : buyerBranchCode;
      supplierCode = supplierCode == "-" ? "" : supplierCode;
      supplierBranchCode = supplierBranchCode == "-" ? "" : supplierBranchCode;

      const payload = {
        invNo,
        status: statusCode,
        invDate,
        itemCode,
        buyerCode,
        buyerBranchCode,
        supplierCode,
        supplierBranchCode
      }

      let resView = {};
      resView = await AppApi.getApi(apiConfig.viewModel, {}, { method: "post", authorized: true });

      if (resView.status == "200") {
        setViewModel(resView.data);

        console.log("Get Data Finished");
      } else {
        showAlertDialog({
          text: get(resView, "data.message"),
          icon: "error",
          showCloseButton: true,
        });
        console.log("No Data");
        return false;
      }

      let res = await AppApi.getApi(apiConfig.dataSource, payload, { method: "post", authorized: true });

      hideLoading();
      if (res.status == "200") {
        setDataDetail(res.data);
        console.log("Get Data Finished");
      } else {
        showAlertDialog({
          title: get(res, "data.error"),
          text: get(res, "data.message"),
          icon: "error",
          showCloseButton: true,
        });
        console.log("No Data");
        return false;
      }
    } catch (err) {
      showAlertDialog({
        text: get(err, "response.data.message", get(err, "message"), "Something went wrong."),
        icon: "error",
        showCloseButton: true,
      });
    }
  };

  const loadRejectReason = async () => {
    const rejectReasonApi = await AppApi.getApi(
      "/p2p/api/v1/reject/inv/reasonCode",
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
  };

  const linkAction = async (action, text, data, config) => {
    if (action == "action.cancel") {
      handleCancelModalShow();
    }
    if(has(config, 'link')) {
      let query = {}
      forEach(get(config, ['link', 'query']), (q) => query[q] = get(get(dataDetail, 'invoiceDetail') , q)|| get(get(dataDetail, 'supplierDetail') , q) || get(get(dataDetail, 'buyerDetail') , q))
      return router.push({
        pathname : get(config, ['link', 'href']),
        query : query
      })
    }
  };
  const cancelOnFinish = async () => {
    try {
      showLoading("Cancel Invoice No." + get(dataDetail, "invoiceDetail.invNo"));
      handleCancelModalClose();
      const cancelList = [{
        invNo: get(dataDetail, "invoiceDetail.invNo"),
        supplierCode: get(dataDetail, "supplierDetail.supplierBcCode"),
        buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
        supplierVatBranchCode: get(dataDetail, "supplierDetail.supplierMainVatBranchCode"),
        supplierTaxId: get(dataDetail, "supplierDetail.supplierTaxId"),
        buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
        buyerTaxId: get(dataDetail, "buyerDetail.buyerTaxId"),
      }]
      let appr = await AppApi.getApi(
        "/p2p/api/v1/cancel/inv",
        {
          cancelList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      console.log(appr);
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: false,
          routerLink: "/document/invoice"
        });
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Cancel Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };
  const dialogRejectOnFinish = async (values) => {
    try {
      showLoading("Rejecting Invoice");
      handleRejectModalClose();

      const routerLink = resolveCallback('action.reject')

      let rejectList = [{
          invNo: get(dataDetail, "invoiceDetail.invNo"),
          supplierCode: get(dataDetail, "supplierDetail.supplierBcCode"),
          buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
          supplierVatBranchCode: get(dataDetail, "supplierDetail.supplierMainVatBranchCode"),
          supplierTaxId: get(dataDetail, "supplierDetail.supplierTaxId"),
          buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
          buyerTaxId: get(dataDetail, "buyerDetail.buyerTaxId"),
      }]

      let appr = await AppApi.getApi(
        "/p2p/api/v1/reject/inv",
        {
          ...values,
          rejectList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      console.log(appr);
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: false,
          routerLink: '/document/invoice'
        });
        return;
        // router.push("/document/invoice");
        // return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Reject Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        routerLink: "/document/invoice"
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/document/invoice");
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
          showConfirmButton: false,
        });
        return false;
      } else {
        showAlertDialog({
          text: "Create Payment successfully " + submitDataSource.length + " lists.",
          icon: "success",
          showCloseButton: false,
          showConfirmButton: false,
          routerLink: "/document/invoice"
        });
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/document/invoice");
    }
  };

  const footerAction = (button) => {
    if (get(button, "action") == "action.back") {
      if (has(get(router,"query"), "threeWay")) {
        return router.push({
          pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
          query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
        });
      }
      return router.push("/document/invoice");
    }
    if (get(button, "action") == "action.submit") {
      return submitInvoice(get(button, "action"), button);
    }
    if (get(button, "action") == "action.reject") {
      return rejectInvoice(get(button, "action"), button);
    }
    if (get(button, "action") == "action.approve") {
      return approveInvoice(get(button, "action"), button);
    }
  };
  const cancelInvoice = async (action, config) => {
    handleCancelModalShow();
  };
  const rejectInvoice = async (action, config) => {
    handleRejectModalShow();
  };
  const approveInvoice = async (action, config) => {
    handleApproveConfirmModalShow();
  };
  const resolveCallback = (action) => {
    return get(filter(get(viewModel, 'footerAction'), (btn) => get(btn, 'action') === action), [0, 'callback'], false)
  }

  const submitInvoice = async (action, config) => {
    try {
      showLoading("Submitting Invoice.");
      console.log("dataDetail on submit : ", dataDetail);
      let submitList = [];
      await submitList.push(get(dataDetail, "invoiceDetail.invoiceNo"));
      let appr = await AppApi.getApi(
        "/p2p/api/v1/submit/inv",
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
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Submit Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        routerLink: "/document/invoice"
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/document/invoice");
    }
  };

  const approveConfirmOnFinish = async (values) => {
    try {
      showLoading("Approving Invoice");
      handleApproveConfirmModalClose();

      const routerLink = resolveCallback('action.approve')

      let approveList = [{
        invNo: get(dataDetail, "invoiceDetail.invNo"),
        supplierCode: get(dataDetail, "supplierDetail.supplierBcCode"),
        buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
        supplierVatBranchCode: get(dataDetail, "supplierDetail.supplierMainVatBranchCode"),
        supplierTaxId: get(dataDetail, "supplierDetail.supplierTaxId"),
        buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
        buyerTaxId: get(dataDetail, "buyerDetail.buyerTaxId"),
      }];
      // await approveList.push(get(dataDetail, "invoiceDetail.invNo"));
      let appr = await AppApi.getApi(
        "/p2p/api/v1/approve/inv",
        {
          ...values,
          approveList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: false,
          routerLink: "/document/invoice"
        });
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Approve Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
      router.push("/document/invoice");
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/document/invoice");
    }
  };

  return (
    <>
      <Head>
        <title>{get(dataDetail, "invoiceDetail.invNo")} - BBL PROCURE TO PAY</title>
        <link rel="stylesheet" href="/assets/css/pages/invoice_details/invoice_details.css"></link>
      </Head>
      <div className="container">
        <DialogReason
          mode="Reject"
          title={<>Reject Invoice No. {get(dataDetail, "invoiceDetail.invNo")}</>}
          onFinish={dialogRejectOnFinish}
          visible={rejectModalShow}
          codeLists={rejectReason}
          closable={false}
          onClose={() => {
            handleRejectModalClose();
          }}
        />
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
          Please confirm to approve this Invoice No. {get(dataDetail, "invoiceDetail.invNo")}
        </DialogConfirm>
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
          visible={cancelModalShow}
          closable={false}
          onFinish={() => {
            cancelOnFinish();
          }}
          onClose={() => {
            handleCancelModalClose();
          }}
        >
          Please confirm to cancel this Invoice No. {get(dataDetail, "invoiceDetail.invNo")}
        </DialogConfirm>
        {dataDetail ? (
          <DynamicViewEdit
            footerAction={footerAction}
            dataDetail={dataDetail}
            setDataDetail={(d) => {
              setDataDetail(d);
            }}
            viewModel={viewModel}
            linkAction={linkAction}
          />
        ) : (
          <></>
        )}
      </div>
    </>
  );
};
invoiceDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}

export default invoiceDetail;
/*
.btnExport .dropdown-item:hover {
  background-color: #3269CD;
  color: #fff;
}
 */
