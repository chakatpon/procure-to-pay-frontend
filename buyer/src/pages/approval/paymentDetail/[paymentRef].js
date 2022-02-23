import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { B2PAPI } from "@/context/api";

const paymentApprovalDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, showStandardDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [dialogConfirmShow, setDialogConfirmShow] = useState(false);
  const [dialogReasonShow, setDialogReasonShow] = useState(false)
  const [viewModel, setViewModel] = useState(false);
  const [init, setInit] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [reasonCodeList, setReasonCodeList] = useState([]);
  const apiConfig = {
    viewModel: "/p2p/api/v1/template/payment/waitingApproval/detailView",
    dataDetail: "/p2p/api/v1/view/payment/waitingApproval",
    approve: "/p2p/api/v1/approve/payment",
    reject: "/p2p/api/v1/reject/payment",
    getReasonCode: "/p2p/api/v1/reject/payment/reasonCode"
  }

  // useEffect(() => {
  //   try {
  //     if (router.isReady == true) {
  //       if (!init) {
  //         setInit(true);
  //         getData(router.query.paymentRef);
  //       }
  //     }
  //   } catch (error) {
  //     ErrorHandle(error);
  //     console.log(error);
  //   }
  // });

  useEffect(() => {
    try {
      if (router.isReady == true) {
          setInit(true);
          getData(router.query.paymentRef);
      }
    } catch (error) {
      ErrorHandle(error);
      console.log(error);
    }
  }, [router]);

  const getData = async (paymentRef) => {
    showLoading(t("Getting Payment Approval Details"));
    paymentRef = paymentRef == "-" ? "" : paymentRef;
    if (!viewModel) {
      const respone = await performGetData(get(apiConfig, "viewModel"), [], "/approval/payment")
      if (respone) {
        setViewModel(respone)
        console.log("Get Template Data Finished");
      } else {
        console.log("No Template Data");
        return false
      }
    }

    const response = await performGetData(get(apiConfig, "dataDetail"), { paymentRef }, "/approval/payment")
    if (response) {
      setDataDetail(response)
      hideLoading();
      console.log("Get Data Finished");
    } else {
      console.log("No Data");
      return false;
    }
  };

  const performGetData = async (path, body, error) => {
    try {
      const response = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        return get(response, "data")
      } else {
        hideLoading();
        showStandardDialog(get(response, "data.error", "Error !"), get(response, "data.message"), "error", () => error)
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err)
    }
  }

  const linkAction = async(action, text, item) => {

  }

  const footerAction = async (button) => {
    switch (get(button, "action")) {
      case "action.approve":
        setDialogConfirmShow(true)
        break
      case "action.reject":
        showLoading("Loading Reason Code")
        const response = await performGetData(get(apiConfig, "getReasonCode"))
        if (response) {
          setReasonCodeList(get(response, "reasonList").map((data) => { return {option: get(data, "name"), value: get(data, "code") }}))
          hideLoading();
          setDialogReasonShow(true)
        }
        break
      case "action.back":
        return router.push("/approval/payment")
    }
  }

  const onComfirmFooter = async (typeApprove, data) => {
    let path;
    let body;
    let successs;
    const paymentRef = router.query.paymentRef
    if (typeApprove) {
      setDialogConfirmShow(false)
      path = get(apiConfig, "approve");
      body = {approveList: [paymentRef]};
      successs = `Payment Reference ${paymentRef} is approved.`
    } else {
      setDialogReasonShow(false)
      path = get(apiConfig, "reject")
      body = {
        rejectList: [paymentRef],
        code: get(data, "code"),
        note: get(data, "note"),
      }
      successs = `Payment Reference ${paymentRef} is rejected.`
    }
    if (await performPostData(path, body)) {
      showStandardDialog(null, successs, "success", "/approval/payment")
      // await showStandardDialog(null, successs, "success", () => router.replace({pathname: "/approval/payment", query: {detailBack: Math.floor(Math.random() * 100000000)}}))
      // router.push("/approval/payment")
    }
  }

  const performPostData = async (path, body) => {
    try {
      showLoading()
      const response = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200 && get(response, "data.status", -1) == 0 || get(response, "data.status", -1) == 200) {
        hideLoading();
        return true
      } else {
        hideLoading();
        await showStandardDialog(get(response, "data.error", "Error !"), get(response, "data.message"), "error", "/approval/payment")
        return false
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
    }
  }

  return (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/waitingpaymentapprovaldetail/waitingpaymentapprovaldetail.css" rel="stylesheet" type="text/css"/>
      </Head>

      <div className="container">
        <DialogConfirm
          visible={dialogConfirmShow}
          center={true}
          onFinish={() => {onComfirmFooter(true)}}
          onClose={() => setDialogConfirmShow(false)}>
            Please confirm to approve this Payment Reference {router.query.paymentRef}.
        </DialogConfirm>

        <DialogReason
          mode="Reject"
          title={"Reject Payment"}
          visible={dialogReasonShow}
          center={true}
          firstStarOn={false}
          onFinish={(data) => onComfirmFooter(false, data)}
          codeLists={reasonCodeList}
          onClose={() => setDialogReasonShow(false)}/>

        {dataDetail? <DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
      </div>
    </>
  );
}

paymentApprovalDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}

export default paymentApprovalDetail;
