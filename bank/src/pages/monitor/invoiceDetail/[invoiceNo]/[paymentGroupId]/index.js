import Head                         from "next/head";
import ErrorHandle                  from "@/shared/components/ErrorHandle";
import DynamicViewEditMonitor              from "@/shared/components/DynamicViewEditMonitor";
import Layout                       from "@/component/layout";
import { useTranslation }           from "next-i18next";
import { serverSideTranslations }   from "next-i18next/serverSideTranslations";
import { B2PAPI }                   from "@/context/api";
import { StoreContext }             from "@/context/store";
import { useRouter,
         withRouter }               from "next/router";
import { useEffect,
         useContext,
         useState }                 from "react";
import _,
       { get,
         isEmpty,
         forEach,
         filter }                   from "lodash";
const invoiceDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog,getStorage  } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{option : "Other" , value : "OTHER"}]);
  const context = useContext(StoreContext);

  const apiConfig = {
    "dataSource" : "/p2p/api/v1/view/invoice-to-pay/detail",
    "viewModel" : "/p2p/api/v1/template/payment/monitoring/invoice/detailView"
  };

  useEffect( async () => {
    if (router.isReady) {
      const query = {
        invoiceNo: router.query.invoiceNo,
        paymentGroupId: router.query.paymentGroupId,
        buyerCode: router.query.buyerCode,
        buyerBranchCode: router.query.buyerBranchCode,
        supplierCode: router.query.supplierCode,
        supplierBranchCode: router.query.supplierBranchCode,
        buyerTaxId: router.query.buyerTaxId,
        supplierTaxId: router.query.supplierTaxId,
        supplierVatBranchCode: router.query.supplierVatBranchCode,
      };
      await getData(query);
    }
  }, [router]);

  const getData = async (queryRouter) => {
    try{
      await setDataDetail(false);
      await showLoading(t("Getting Invoice Details"));

       // ---------- check data that equal "-" ---------------
       let request = {};
       for (const [key, value] of Object.entries(queryRouter)) {
         let val = ""
         if (value !== "-") {
           val = value
         }
         request = {...request,[key]: val}
       }
 

      // invoiceNo = invoiceNo == "-" ? "" : invoiceNo;
      // paymentGroupId = paymentGroupId == "-" ? "" : paymentGroupId;


      let codeLists = await AppApi.getApi(
        "/p2p/api/v1/cancel/invoice-to-pay/reasonCode",
        {},
        { method: "post", authorized: true }
      );

      if (codeLists.status == 200) {
        console.log(codeLists);
        setDialogReasonCodeLists(codeLists.data.reasonList.map(r=>{ return { option :r.name , value :r.code }}));

      }

      let resView = { };
        // mocking ViewModel
        // setViewModel(viewModelMock)

        resView = await AppApi.getApi(apiConfig.viewModel, { }, { method: "post", authorized: true });

        if (resView.status == "200") {
          setViewModel(resView.data);

          console.log("Get Data Finished");
        } else {
          showAlertDialog({
            text : get(resView,"data.message"),
            icon: "error",
            showCloseButton: true,
            showConfirmButton: true,
          });
          console.log("No Data");
          return false;
        }
      let res = await AppApi.getApi(apiConfig.dataSource, request, { method: "post", authorized: true });

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
          showConfirmButton: true,
        });
        console.log("No Data");
        return false;
      }
    }catch(err){
      showAlertDialog({
        text : get(err,"response.data.message",get(err,"message"),'Something went wrong.'),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
    }

  };
  const footerAction = (button) => {
    if(get(button,"action")=="action.back"){
      return router.push("/monitor/paymentMonitor")
    }

  };
  return (
    <>
    {console.log('MONITOR dataDetail : ', dataDetail)}
      <Head>
        <title>{get(dataDetail,"invoiceDetails.invoiceNo")} - BBL PROCURE TO PAY</title>
        <link rel="stylesheet"
    href="/assets/css/pages/waitinginvoicetopayapprovaldetail/waitinginvoicetopayapprovaldetail.css"></link>
      </Head>
      <div className="container">

        {dataDetail?
        <DynamicViewEditMonitor footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} />:<></>}
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
