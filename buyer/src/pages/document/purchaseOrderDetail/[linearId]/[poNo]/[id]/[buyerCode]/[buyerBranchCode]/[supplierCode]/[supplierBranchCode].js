import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
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

const purchaseOrderDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

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

    let resView = { };

      resView = await AppApi.getApi("/p2p/api/v1/template/po/detailView", { }, { method: "post", authorized: true });

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

  const linkAction = async(action, text,data,config) => {

  }


  const footerAction = (button) => {
    if(get(button,"action")=="action.back") {
      if (has(get(router,"query"), "threeWay")) {
        return router.push({
          pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
          query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
        });
      }
      return router.push("/document/purchaseOrder")
    }

    if(get(button,"action")=="action.approve") {
      return approvePO(get(button,"action"),button);
    }

  };

  const approvePO = async(action,config) => {
    handleApproveConfirmModalShow()
  }
  const resolveCallback = (action) => {
    return get(filter(get(viewModel, 'footerAction'), (btn) => get(btn, 'action') === action), [0, 'callback'], false)
  }

  // const dialogRejectOnFinish = async(values) => {
  //   try{
  //     showLoading("Rejecting Purchase Order")
  //     handleRejectModalClose();

  //     const routerLink = resolveCallback('action.reject')

  //     let rejectList = [
  //       get(dataDetail,"poDetail.quoteNo")
  //     ];
  //     let appr = await AppApi.getApi("/p2p/api/v1/reject/po",{
  //       code : values.code,
  //       note : values.note,
  //       rejectList
  //     },{ method: "post", authorized: true });
  //     await getData(router.query.linearId,router.query.poNo);
  //     hideLoading();
  //     if(appr.status==200){
  //       showAlertDialog({
  //         text : get(appr,"data.message"),
  //         icon: "success",
  //         showCloseButton: true,
  //         routerLink: has(get(router,"query"), "threeWay") ? router.push({
  //             pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
  //             query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
  //           }) : '/document/purchaseOrder'
  //         });
  //       return;
  //     }
  //     showAlertDialog({
  //       title : get(appr,"data.error","Reject Failed !"),
  //       text : get(appr,"data.message","Please contact administrator."),
  //       icon: "error",
  //       showCloseButton: true,
  //     });
  //   } catch (err) {
  //     hideLoading();
  //   }
  // }
  
  const approveConfirmOnFinish = async(values) => {
    try{
      showLoading("Approving Purchase Order")
      handleApproveConfirmModalClose();

      const routerLink = resolveCallback('action.approve')

      let approveList = [
        get(dataDetail,"poDetail.quoteNo")
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/approve/po",{
        approveList
      },{ method: "post", authorized: true });
      await getData(router.query.linearId,router.query.poNo);
      hideLoading();
      if(appr.status==200){
        showAlertDialog({
          text : get(appr,"data.message"),
          icon: "success",
          showCloseButton: true,
          routerLink,
          routerLink: has(get(router,"query"), "threeWay") ? router.push({
            pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
            query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
          }) : '/document/purchaseOrder'
        });
        return;
      }
      showAlertDialog({
        title : get(appr,"data.error","Approve Failed !"),
        text : get(appr,"data.message","Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
    }
  }
  console.log('d',dataDetail)

  return (
    <>
      <Head>
        <title>{get(dataDetail, "poDetail.quoteNo")} - BBL PROCURE TO PAY</title>
      </Head>
      <link rel="stylesheet" href="/assets/css/pages/purchaseorderdetails_logo/purchaseorderdetails_logo.css" />
      <div className="container">
      <DialogConfirm
        visible={approveConfirmModalShow}
        closable={false}
        onFinish={()=>{ approveConfirmOnFinish() }}
        onClose={()=>{ handleApproveConfirmModalClose() }}
        >Please confirm to approve {get(dataDetail, "poDetail.quoteNo")}</DialogConfirm>

        {dataDetail?<DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
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
