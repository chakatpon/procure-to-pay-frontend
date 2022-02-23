import Head from "next/head";
import { connect } from "react-redux";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicView from "@/shared/components/DynamicView";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";

import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, has } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import { Row, Col, Breadcrumb, Descriptions,Table } from "antd";
import { Button, Image } from "react-bootstrap";
// import viewJson from "../../../../models/poDetail.json";
// import demoJson from "../../../../models/poDetailDemo.json";
const purchaseOrderDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

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
      // resView = {
      //   status : 200,
      //   data : viewJson
      // }
      if (resView.status == "200") {
        setViewModel(resView.data);
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
  }

  return (
    <>
      <Head>
        <title>{get(dataDetail, "poDetail.quoteNo")} - BBL PROCURE TO PAY</title>
      </Head>
      <link rel="stylesheet" href="/assets/css/pages/purchaseorderdetails_logo/purchaseorderdetails_logo.css" />
      <div className="container">
        <DynamicView footerAction={footerAction} dataDetail={dataDetail} viewModel={viewModel} linkAction={linkAction} />
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
