import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { B2PAPI } from "@/context/api";

const paymentMonitoringDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [init, setInit] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

  const apiConfig = {
    viewModel: "/p2p/api/v1/template/payment/detailView",
    dataDetail: "/p2p/api/v1/view/payment"
  }

  useEffect( async () => {
    try {
      if (router.isReady == true) {
        if(!init){
         await setInit(true);
         await getData(router.query.paymentNo);

        }
      }
    } catch (error) {
      ErrorHandle(error);
      console.log(error);
    }
  });

  const getData = async (paymentRef) => {
    showLoading(t("Getting Payment Monitoring Details"));
    paymentRef = paymentRef == "-" ? "" : paymentRef;
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

    const response = await performGetData(get(apiConfig, "dataDetail", ""), { paymentRef })
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

  }

  const footerAction = async (button) => {
    switch (get(button, "action")) {
      case "action.back":
        return router.push("/monitor/paymentMonitor")
    }
  }

  return (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/monitoring/payment/payment_detail.css" rel="stylesheet" type="text/css"/>
      </Head>

      <div className="container">
        {dataDetail? <DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
      </div>
    </>
  );
}

paymentMonitoringDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}

export default paymentMonitoringDetail;
