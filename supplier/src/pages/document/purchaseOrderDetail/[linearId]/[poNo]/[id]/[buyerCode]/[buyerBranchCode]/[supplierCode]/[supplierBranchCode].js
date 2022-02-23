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
import _, { get, isEmpty, forEach, filter, has } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import { Row, Col, Breadcrumb, Descriptions, Table } from "antd";
import { Button, Image } from "react-bootstrap";
// import viewJson from "../../../../../../../../../models/poDetail.json";
// import demoJson from "../../../../../../../../../models/poDetailDemo.json";
const purchaseOrderDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{ option: "Other", value: "OTHER" }]);
  const [rejectModalShow, setRejectModalShow] = useState(false);
  const handleRejectModalClose = () => setRejectModalShow(false);
  const handleRejectModalShow = () => { setRejectModalShow(true); }

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

  useEffect(() => {
    const query = {
      linearId: router.query.linearId,
      poNo: router.query.poNo,
      buyerCode: router.query.buyerCode,
      buyerBranchCode: router.query.buyerBranchCode,
      supplierCode: router.query.supplierCode,
      supplierBranchCode: router.query.supplierBranchCode,
    };
    getData(query);
  }, [router]);

  const getData = async (queryRouter) => {
    setDataDetail(false);
    showLoading(t("Getting Purchase Order Details"));

    // ---------- check query that equal "-" ---------------
    let request = {};
    for (const [key, value] of Object.entries(queryRouter)) {
      let val = ""
      if (value !== "-") {
        val = value
      }
      request = {...request,[key]: val}
    }

    // linearId = linearId == "-" ? "" : linearId;
    // poNo = poNo == "-" ? "" : poNo;


    let codeLists = await AppApi.getApi(
      "/p2p/api/v1/reject/po/reasonCode",
      {},
      { method: "post", authorized: true }
    );

    if (codeLists.status == 200) {
      console.log(codeLists);
      setDialogReasonCodeLists(codeLists.data.reasonList.map(r => { return { option: r.name, value: r.code } }));

    }

    let resView = {};

    resView = await AppApi.getApi("/p2p/api/v1/template/po/detailView", {}, { method: "post", authorized: true });

    if (resView.status == "200") {
      setViewModel(resView.data);
      // setViewModel(viewJson);
      console.log("Get Data Finished");
    } else {
      console.log("No Data");
      return false;
    }




    let res = await AppApi.getApi("/p2p/api/v1/view/po/detail", request, { method: "post", authorized: true });

    hideLoading();
    if (res.status == "200") {

      setDataDetail(res.data);
      console.log("Get Data Finished");
    } else {
      console.log("No Data");
      return false;
    }
  };

  const linkAction = async (action, text, data, config) => {



  }


  const footerAction = (button) => {
    if (get(button, "action") == "action.back") {
      if (has(get(router, "query"), "threeWay")) {
        return router.push({
          pathname: "/matching/3wayDetail/[matchId]/[INVNo]",
          query: { matchId: get(router, ["query", "threeWay", 0]), INVNo: get(router, ["query", "threeWay", 1]) }
        });
      }
      return router.push("/document/purchaseOrder")
    }
    if (get(button, "action") == "action.reject") {
      return rejectPO(get(button, "action"), button);
    }
    if (get(button, "action") == "action.approve") {
      return approvePO(get(button, "action"), button);
    }

  };
  const rejectPO = async (action, config) => {
    handleRejectModalShow()
  }
  const approvePO = async (action, config) => {
    handleApproveConfirmModalShow()
  }
  const resolveCallback = (action) => {
    return get(filter(get(viewModel, 'footerAction'), (btn) => get(btn, 'action') === action), [0, 'callback'], false)
  }
  const dialogRejectOnFinish = async (values) => {
    try {
      showLoading("Rejecting Purchase Order")
      handleRejectModalClose();

      const routerLink = resolveCallback('action.reject')

      let rejectList = [
        {
          poNo: get(dataDetail, "poDetail.quoteNo"),
          buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
          buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
          supplierCode: get(dataDetail, "supplierDetail.supplierCode"),
          supplierBranchCode: get(dataDetail, "supplierDetail.supplierBranchCode"),
        }
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/reject/po", {
        code: values.code,
        note: values.note,
        rejectList
      }, { method: "post", authorized: true });
      await getData(router.query.linearId, router.query.poNo);
      hideLoading();
      if (appr.status == 200 && get(appr, "data.status",200) == 200) {
        showAlertDialog({
          html: get(appr, "data.message"),
          icon: "success",
          showCloseButton: false,
          routerLink: has(get(router, "query"), "threeWay") ? router.push({
            pathname: "/matching/3wayDetail/[matchId]/[INVNo]",
            query: { matchId: get(router, ["query", "threeWay", 0]), INVNo: get(router, ["query", "threeWay", 1]) }
          }) : '/document/purchaseOrder'
        });
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Reject Failed !"),
        html: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
    }
  }
  const approveConfirmOnFinish = async (values) => {
    try {
      showLoading("Approving Purchase Order")
      handleApproveConfirmModalClose();

      const routerLink = resolveCallback('action.approve')

      let approveList = [
        {
          poNo: get(dataDetail, "poDetail.quoteNo"),
          buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
          buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
          supplierCode: get(dataDetail, "supplierDetail.supplierCode"),
          supplierBranchCode: get(dataDetail, "supplierDetail.supplierBranchCode"),
        }
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/approve/po", {
        approveList
      }, { method: "post", authorized: true });
      await getData(router.query.linearId, router.query.poNo);
      hideLoading();

      if (appr.status == 200 && get(appr, "data.status",200) == 200) {
        showAlertDialog({
          html: get(appr, "data.message"),
          icon: "success",
          showCloseButton: false,
          routerLink: has(get(router, "query"), "threeWay") ? router.push({
            pathname: "/matching/3wayDetail/[matchId]/[INVNo]",
            query: { matchId: get(router, ["query", "threeWay", 0]), INVNo: get(router, ["query", "threeWay", 1]) }
          }) : '/document/purchaseOrder'
        });
        return;
      }

      showAlertDialog({
        title: get(appr, "data.error", "Approve Failed !"),
        html: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
    }
  }

  return (
    <>
      <Head>
        <title>{get(dataDetail, "poDetail.quoteNo")} - BBL PROCURE TO PAY</title>
      </Head>
      <link rel="stylesheet" href="/assets/css/pages/purchaseorderdetails_logo/purchaseorderdetails_logo.css" />
      <div className="container">
        <DialogReason
          mode="Reject"
          title={<>Reject Quote No. {get(dataDetail, "poDetail.quoteNo")}</>}
          onFinish={dialogRejectOnFinish}
          visible={rejectModalShow}
          codeLists={dialogReasonCodeLists}
          closable={false}
          onClose={() => { handleRejectModalClose() }}
        />
        <DialogConfirm
          visible={approveConfirmModalShow}
          closable={false}
          onFinish={() => { approveConfirmOnFinish() }}
          onClose={() => { handleApproveConfirmModalClose() }}
        >Please confirm to approve Quote No. {get(dataDetail, "poDetail.quoteNo")}</DialogConfirm>

        {dataDetail ? <DynamicViewEdit
          addKey={true}
          dataIncomplete={
            {
              poNo: get(dataDetail, "poDetail.quoteNo"),
              buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
              buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
              supplierCode: get(dataDetail, "supplierDetail.supplierCode"),
              supplierBranchCode: get(dataDetail, "supplierDetail.supplierBranchCode"),
            }
          }
          footerAction={footerAction}
          dataDetail={dataDetail}
          setDataDetail={(d) => { setDataDetail(d) }}
          viewModel={viewModel}
          linkAction={linkAction}
        /> : <></>}
      </div>
    </>
  );
};
purchaseOrderDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}

export default purchaseOrderDetail;
