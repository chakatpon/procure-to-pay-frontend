import Head from "next/head";
import { connect } from "react-redux";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import { useRouter } from "next/router";
import Layout from "@/component/layout";

import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import { Row, Col, Breadcrumb, Descriptions,Table } from "antd";
import viewModelMock from "../../../models/mockDetail.json"
const  Detail = () => {
  const pageCode = "";
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog,getStorage  } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const userData = getStorage("userData");
  let apiConfig = {
    "dataSource" : "/p2p/api/v1/view/po/detail",
    "viewModel" : "/p2p/api/v1/template/inv/detailView"
  };
  useEffect(() => {
    try {
      // console.log(props,router.query);
      // showLoading(t("getting invoice details"))
      setViewModel(viewModelMock);
      if (router.isReady == true) {
        if(!init){
          setInit(true);
          // const {linearId,docNo} = router.query;
          getInitial()
          //Load Initial API Data
        }

      }
    } catch (error) {
      ErrorHandle(error);
      console.log(error);
    }
  });

  const getInitial = async() => {
    try{
      setDataDetail(false);
      showLoading(t("Getting Information"));
      const {linearId,docNo} = router.query;
      //Call API Get View Model
      // let resView = await AppApi.getApi(apiConfig.viewModel);
      // if (resView.status == "200") {
      //   setViewModel(resView.data);
      //   console.log("Get Data Finished");
      // } else {
      //   showAlertDialog({
      //     text : get(resView,"data.message"),
      //     icon: "error",
      //     showCloseButton: true,
      //   });
      //   console.log("No Data");
      //   return false;
      // }

      //OR Set View Model with Static Model

      let res = await AppApi.getApi(apiConfig.dataSource, {"poNo":"20210824-808","linearId":"7a1eeebb-febb-4aed-a12d-3c015c7be75a"}, { method: "post", authorized: true });

    hideLoading();
    if (res.status == "200") {

      setDataDetail(res.data);
      console.log("Get Data Finished");
    } else {
      showAlertDialog({
        title : get(res,"data.error"),
        text : get(res,"data.message"),
        icon: "error",
        showCloseButton: true,
      });
      console.log("No Data");
      return false;
    }

    }catch(err){
      ErrorHandle(error);
      console.log(error);
    }


  }
  const linkAction = async(action, text,data,config) => {

  }
  const footerAction = (button) => {
    console.log(button)
    if(get(button,"action")=="action.back"){
      return router.push("/dashboard")
    }
    if(get(button,"action")=="action.alerttest"){
      alert("TEST")
    }


  };

  return <>
      <Head>
        <title>{ get(viewModel, "title")} BBL PROCURE TO PAY</title>
        <link rel="stylesheet" href="/assets/css/pages/3way_detail/3way_detail.css" />
      </Head>
      <div className="container-fluid">
        {dataDetail?<DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
      </div>
  </>

}
Detail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "languageForThisPage"])),
    },
  };
}
export default Detail;
