import Head                       from "next/head";
import ErrorHandle                from "@/shared/components/ErrorHandle";
import DynamicView                from "@/shared/components/DynamicView";
import DynamicViewEdit            from "@/shared/components/DynamicViewEdit";
import DialogReason               from "@/shared/components/DialogReason";
import DialogConfirm              from "@/shared/components/DialogConfirm";
// import viewModelMock              from "../../../../../models/invoiceDetail.json"
import Layout                     from "@/component/layout";
import Columns                    from "@/shared/components/Columns";
import { StoreContext }           from "@/context/store";
import _, { get }                 from "lodash";
import { useTranslation }         from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI }                 from "@/context/api";
import { Table }                  from "antd";
import { useRouter }              from "next/router";
import { useEffect,
         useContext,
         useState }               from "react";

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
  const [cancelModalShow, setCancelModalShow] = useState(false);
  const handleCancelModalClose = () => setCancelModalShow(false);
  const handleCancelModalShow = () => { setCancelModalShow(true); }
  const context = useContext(StoreContext);
  const [reason, setReason] = useState([]);
  const [rejectReason, setRejectReason] = useState([]);

  const [submitConfirmModalShow, setSubmitConfirmModalShow] = useState(false);
  const handleSubmitConfirmModalClose = () => setSubmitConfirmModalShow(false);
  const handleSubmitConfirmModalShow = () => { setSubmitConfirmModalShow(true); }

  const [rejectModalShow, setRejectModalShow] = useState(false);
  const handleRejectModalClose = () => setRejectModalShow(false);
  const handleRejectModalShow = () => { setRejectModalShow(true); }

  const [groupConfirmModalShow, setGroupConfirmModalShow] = useState(false);
  const handleGroupConfirmModalClose = () => setGroupConfirmModalShow(false);
  const handleGroupConfirmModalShow = () => { setGroupConfirmModalShow(true); }

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

  const [submitDataSource, setSubmitDataSource] = useState([]);
  const [submitDataSourceColumn, setSubmitDataSourceColumn] = useState([]);

  const apiConfig = {
    "dataSource" : "/p2p/api/v1/view/invoice-to-pay/detail",
    "viewModel" : "/p2p/api/v1/template/payment/waitingApproval/invoice/detailView"
  };

  useEffect(() => {
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
      console.log(75,router.query);
      getData(query);
    }
  }, [router]);

  const loadRejectReason = async () => {
    const rejectReasonApi = await AppApi.getApi('/p2p/api/v1/reject/invoice-to-pay/reasonCode',
      {}, {
      method: "post", authorized: true,
    })
    if (rejectReasonApi.status == 200) {
      // console.log(reasonApi);
      // setReason(get(reasonApi, 'data.reasonList', []))
      setRejectReason(rejectReasonApi.data.reasonList.map(r=>{ return { option :r.name , value :r.code }}));
    }
  }

  const resolveCallback = (action) => {
    return get(filter(get(viewModel, 'footerAction'), (btn) => get(btn, 'action') === action), [0, 'callback'], false)
  }

  const approveConfirmOnFinish = async (values) => {
    try {
      showLoading("Approving Invoice")
      handleApproveConfirmModalClose();

      const routerLink = resolveCallback('action.approve')

      let approveList = [
        {
          invoiceNo: get(dataDetail,"invoiceDetails.invoiceNo"),
          paymentGroupId: get(dataDetail,"invoiceDetails.paymentGroupId")
        }
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/approve/invoice-to-pay", {
        ...values,
        approveList
      }, { method: "post", authorized: true });
      hideLoading();
      if (appr.status == 200) {
        await showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
          routerLink: "/approval/payment"
        });
        return;
      }
      await showAlertDialog({
        title: get(appr, "data.error", "Approve Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      router.push("/approval/payment")
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/approval/payment")
    }
  }

  const getData = async (queryRouter) => {
    try{
      setDataDetail(false);
      showLoading(t("Getting Invoice Details"));

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

  const linkAction = async(action, text,data,config) => {



  }


  const footerAction = (button) => {
    if(get(button,"action")=="action.back"){
      return router.push("/approval/payment")
    }
    if(get(button,"action")=="action.cancel"){
      return cancelInvoice(get(button,"action"),button);
    }
    if(get(button,"action")=="action.submit"){
      return submitInvoice(get(button,"action"),button);
    }
    if (get(button,"action") == "action.reject") {
      return rejectInvoice(get(button,"action"), button);
    }
    if (get(button,"action") == "action.approve") {
      return approveInvoice(get(button,"action"), button);
    }

  };

  const cancelInvoice = async (action, config) => {
    handleCancelModalShow()
  }
  const rejectInvoice = async (action, config) => {
    handleRejectModalShow()
  }
  const approveInvoice = async (action, config) => {
    handleApproveConfirmModalShow()
  }

  const submitInvoice = async (action, config) => {
    try {
      showLoading("Submitting Invoice.");
      let submitList = [
        {
          invoiceNo: get(dataDetail,"invoiceDetails.invoiceNo"),
          paymentGroupId: get(dataDetail,"invoiceDetails.paymentGroupId"),
          buyerCode: get(dataDetail,"buyerDetails.buyerCode"),
          buyerBranchCode : get(dataDetail,"buyerDetails.buyerBranchCode"),
          buyerTaxId: get(dataDetail,"buyerDetails.buyerTaxId"),
          supplierCode: get(dataDetail,"supplierDetails.supplierCode"),
          supplierBranchCode: get(dataDetail,"supplierDetails.supplierBranchCode"),
          supplierTaxId: get(dataDetail,"supplierDetails.supplierTaxId"),
          supplierVatBranchCode: get(dataDetail,"supplierDetails.supplierVatBranchCode"),
        }
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/submit/invoice-to-pay", {
        submitList
      }, { method: "post", authorized: true });
      hideLoading();
      console.log(appr)
      if (appr.status == 200) {
        let col = await Columns({ table : {columns : get(appr, "data.columns", [])} }, context, AppApi);
        let data = get(appr, "data.groupPayment", []).map((r) => {
          return { ...r, key: r.no };
        });
        console.log('cc',col,get(appr, "data.columns", []),data)
        setSubmitDataSourceColumn(col);
        setSubmitDataSource(data);
        handleGroupConfirmModalShow();
        return;
      }
      await showAlertDialog({
        title: get(appr, "data.error", "Submit Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      router.push("/approval/payment")
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/approval/payment")
    }
  }

  const dialogCancelOnFinish = async(values) => {
    try{
      showLoading("Cancel Invoice to Pay")
      handleCancelModalClose();

      let cancelList = [
        {
          invoiceNo : get(dataDetail,"invoiceDetails.invoiceNo"),
          paymentGroupId : get(dataDetail,"invoiceDetails.paymentGroupId"),
          buyerCode: get(dataDetail,"buyerDetails.buyerCode"),
          buyerBranchCode : get(dataDetail,"buyerDetails.buyerBranchCode"),
          buyerTaxId: get(dataDetail,"buyerDetails.buyerTaxId"),
          supplierCode: get(dataDetail,"supplierDetails.supplierCode"),
          supplierBranchCode: get(dataDetail,"supplierDetails.supplierBranchCode"),
          supplierTaxId: get(dataDetail,"supplierDetails.supplierTaxId"),
          supplierVatBranchCode: get(dataDetail,"supplierDetails.supplierVatBranchCode"),
        }
      ];
      let appr = await AppApi.getApi("/p2p/api/v1/cancel/invoice-to-pay",{
        code : values.code,
        note : values.note,
        cancelList
      },{ method: "post", authorized: true });
      hideLoading();
      if(appr.status==200){
        let dig = await showAlertDialog({
          text : get(appr,"data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        router.push("/approval/payment");
        return
        if (dig.isConfirmed) {
          // router.push("/approval/payment");
        }
        return;
      }
      let dig = await showAlertDialog({
        title : get(appr,"data.error","Cancel Failed !"),
        text : get(appr,"data.message","Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,
      });
      router.push("/approval/payment");
      return
      if (dig.isConfirmed) {
        // router.push("/approval/payment");
      }
    } catch (err) {
      hideLoading();
    }
  }

  const dialogRejectOnFinish = async (values) => {
    try {
      showLoading("Rejecting Invoice")
      handleRejectModalClose();

      const routerLink = resolveCallback('action.reject')

      let rejectList = [
        {
          invoiceNo: get(dataDetail,"invoiceDetails.invoiceNo"),
          poNo: get(dataDetail,"invoiceDetails.poNo"),
          grNo: get(dataDetail,"invoiceDetails.grNo"),
          buyerCode: get(dataDetail,"buyerDetails.buyerCode"),
          buyerBranchCode : get(dataDetail,"buyerDetails.buyerBranchCode"),
          buyerTaxId: get(dataDetail,"buyerDetails.buyerTaxId"),
          supplierCode: get(dataDetail,"supplierDetails.supplierCode"),
          supplierBranchCode: get(dataDetail,"supplierDetails.supplierBranchCode"),
          supplierTaxId: get(dataDetail,"supplierDetails.supplierTaxId"),
          supplierVatBranchCode: get(dataDetail,"supplierDetails.supplierVatBranchCode"),
          supplierName: get(dataDetail,"supplierDetails.supplierName"),
        }
      ];

      let appr = await AppApi.getApi("/p2p/api/v1/reject/invoice-to-pay", {
        ...values,
        rejectList
      }, { method: "post", authorized: true });
      hideLoading();
      console.log(appr)
      if (appr.status == 200) {
        await showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
          routerLink: "/approval/payment"
        });
        return;
      }
      await showAlertDialog({
        title: get(appr, "data.error", "Reject Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,

      });
      await router.push("/approval/payment")
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      await router.push("/approval/payment")
    }
  }
  const handleGroupConfirmModalSubmit = async() => {
    handleGroupConfirmModalClose();
    try{
      showLoading("Submitting Payment.")
      let paymentList = submitDataSource.map(r => r.paymentRef );
      let resp =  await AppApi.getApi("/p2p/api/v1/confirm/group-payment",{
        paymentList
      }, { method: "post", authorized: true });
      hideLoading();
      if (resp.status != 200) {
        await showAlertDialog({
          title: get(resp, "data.error", "Submit error !"),
          text: get(resp, "data.message", "Something went wrong (HTTP"+resp.status+")"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
        return false;
      }else{
        await showAlertDialog({
          text: "Create Payment successfully "+ submitDataSource.length + " lists.",
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        })
        router.push("/approval/payment")
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/approval/payment")
    }
  }

  return (
    <>
      <Head>
        <title>{get(dataDetail,"invoiceDetails.invoiceNo")} - BBL PROCURE TO PAY</title>
        <link rel="stylesheet"
    href="/assets/css/pages/waitinginvoicetopayapprovaldetail/waitinginvoicetopayapprovaldetail.css"></link>
      </Head>
      <div className="container">
        <DialogReason
        mode="Cancel"
        title={<>Cancel Invoice to Pay</>}
        onFinish={dialogCancelOnFinish}
        visible={cancelModalShow}
        codeLists={dialogReasonCodeLists}
        closable={false}
        onClose={()=>{ handleCancelModalClose() }}
        />

        <DialogReason
          mode="Reject"
          title={<>Reject Invoice to Pay </>}
          onFinish={dialogRejectOnFinish}
          visible={rejectModalShow}
          codeLists={rejectReason}
          closable={false}
          onClose={() => { handleRejectModalClose() }}
        />
        <DialogConfirm
          visible={approveConfirmModalShow}
          closable={false}
          onFinish={() => { approveConfirmOnFinish() }}
          onClose={() => { handleApproveConfirmModalClose() }}
        >Please confirm to approve Invoice to Pay </DialogConfirm>
       <DialogConfirm
          title="Preview Group Payment"
          width={"90%"}
          visible={groupConfirmModalShow}
          closable={false}
          onFinish={() => { handleGroupConfirmModalSubmit() }}
          onClose={() => { handleGroupConfirmModalClose() }}
        >
          {submitDataSource ? <Table
              columns={submitDataSourceColumn}
              dataSource={submitDataSource}
              pagination={false}
              className="table-x table-detail"
              scroll={{ x : 500 }}
            ></Table>: <></>}
            <p className="pt-10">Please confirm to submit all {submitDataSource.length} list(s)</p>
        </DialogConfirm>

        {dataDetail?
        <DynamicViewEdit footerAction={footerAction} dataDetail={dataDetail} setDataDetail={(d) => { setDataDetail(d) }} viewModel={viewModel} linkAction={linkAction} />:<></>}
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
