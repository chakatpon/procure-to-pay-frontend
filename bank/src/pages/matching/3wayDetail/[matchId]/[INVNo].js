import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";

const threeWayDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [init, setInit] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const apiConfig = {
    viewModel: "/p2p/api/v1/template/threeWayMatch/detailView",
    dataDetail: "/p2p/api/v1/view/threeWayMatch/detail"
  }

  useEffect(() => {
    try {
      if (router.isReady == true) {
        if (!init) {
          setInit(true);
          getData(router.query.matchId, router.query.INVNo);
        }
      }
    } catch (error) {
      ErrorHandle(error);
      console.log(error);
    }
  });

  const getData = async (matchId, invNo) => {
    showLoading(t("Getting 3 Way Matching Details"));
    matchId = matchId == "-" ? "" : matchId;
    invNo = invNo == "-" ? "" : invNo;
    if (!viewModel) {
      const respone = await performGetData(get(apiConfig, "viewModel", ""))
      if (respone) {
        setViewModel(respone)
        console.log("Get Template Data Finished");
      } else {
        console.log("No Template Data");
        return false
      }
    }

    const response = await performGetData(get(apiConfig, "dataDetail", ""), { INVNo : invNo, matchId })
    if (response) {
      setDataDetail(response)
      hideLoading();
      console.log("Get Data Finished");
    } else {
      console.log("No Data");
      return false;
    }
  };

  const performGetData = async (path, body) => {
    try {
      const response = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        return get(response, "data")
      } else {
        hideLoading();
        showAlertDialog({
          title: get(response, "data.error", "Error !"),
          text: get(response, "data.message"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        })
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err)
    }
  }

  const linkAction = async(action, text, item) => {
    const matchId = router.query.matchId;
    const invNo = router.query.INVNo;
    switch (action) {
      case "poDetail":
        return router.push({pathname: `/document/purchaseOrderDetail/${get(dataDetail, "threeWayMatchItem.poLink")}`, query: {threeWay: [matchId, invNo]}});
      case "grDetail":
        return router.push({pathname: `/document/goodsReceiptDetail/${get(dataDetail, "threeWayMatchItem.grLink")}`, query: {threeWay: [matchId, invNo]}});
      case "invDetail":
        return router.push({pathname: `/document/invoiceDetail/${get(dataDetail, "threeWayMatchItem.invLink")}`, query: {threeWay: [matchId, invNo]}});
    }
  }

  const footerAction = (button) => {
    if (get(button,"action") == "action.back") {
      return router.push("/matching/3way")
    }
  }

  return (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/3way_detail/3way_detail.css" rel="stylesheet" type="text/css"/>
      </Head>

      <div className="container">
        {dataDetail ? <DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
      </div>
    </>
  );
};

threeWayDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invNo"])),
    },
  };
}

export default threeWayDetail;
