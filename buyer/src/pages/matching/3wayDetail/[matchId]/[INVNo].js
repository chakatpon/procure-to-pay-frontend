import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogConfirm from "@/shared/components/DialogConfirm";
import DialogReason from "@/shared/components/DialogReason";
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
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getStorage } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

  const apiConfig = {
    viewModel: "/p2p/api/v1/template/threeWayMatch/detailView",
    dataSource: "/p2p/api/v1/view/threeWayMatch/detail"
  };

  useEffect(() => {
    if (router.isReady) {
      getData(router.query.matchId, router.query.INVNo);
    }
  }, [router]);

  const getData = async (matchId, invNo) => {
    showLoading(t("Getting 3 Way Matching Details"));

    matchId = matchId == "-" ? "" : matchId;
    invNo = invNo == "-" ? "" : invNo;

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

    let res = await AppApi.getApi(apiConfig.dataSource, { matchId, INVNo : invNo }, { method: "post", authorized: true });

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
  };



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
threeWayDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}

export default threeWayDetail;
