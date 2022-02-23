import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, has } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";

const goodsReceiptDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [init, setInit] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

  useEffect(() => {
    if (router.isReady) {
      const query = {
        linearId: router.query.linearId,
        grNo: router.query.grNo,
        buyerCode: router.query.buyerCode,
        buyerBranchCode: router.query.buyerBranchCode,
        supplierCode: router.query.supplierCode,
        supplierBranchCode: router.query.supplierBranchCode,
      };
      getData(query);
    }
  }, [router]);

  const getData = async (queryRouter) => {
    showLoading(t("Getting Goods Receipt Details"));

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
    // grNo = grNo == "-" ? "" : grNo;
    if(!viewModel){
      let resView = await AppApi.getApi("/p2p/api/v1/template/gr/detailView", { }, { method: "post", authorized: true });
      if (resView.status == "200") {
        setViewModel(resView.data);
        console.log("Get Data Finished");
      } else {
        console.log("No Data");
        return false;
      }
    }
    let res = await AppApi.getApi("/p2p/api/v1/view/gr/detail", request, { method: "post", authorized: true });

    hideLoading();
    if (res.status == "200") {
      setDataDetail(res.data);
      console.log("Get Data Finished");
    } else {
      console.log("No Data");
      return false;
    }
  };

  const linkAction = async(action, text,item) => {

    if(action="downloadAttachment"){
      return downloadAttachment(text,item);
    }

  }
  const downloadAttachment =  async(text,item) => {
    showLoading("Downloading "+text)
    return true;
  }
  const footerAction = (button) => {
    if (get(button,"action") == "action.back") {
      if (has(get(router,"query"), "threeWay")) {
        return router.push({
          pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
          query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
        });
      }
      return router.push("/document/goodsReceipt")
    }
  }
  const onEdit = (e,action) => {
    console.log(action)
    showAlertDialog({
      title: "แก้ไข "+action.label,
      text: e.target.value,
      icon: "success",
      confirmButtonText: 'OK',
    })
  }

  return (
    <>
      <Head>
        <title>{get(dataDetail, "grDetail.quoteNo")} - BBL PROCURE TO PAY</title>
        <link rel="stylesheet" href="/assets/css/pages/purchaseorderdetails_logo/purchaseorderdetails_logo.css" />
      </Head>
      <div className="container">
      {dataDetail?<DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
      </div>
    </>
  );
};
goodsReceiptDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "gr"])),
    },
  };
}

export default goodsReceiptDetail;
