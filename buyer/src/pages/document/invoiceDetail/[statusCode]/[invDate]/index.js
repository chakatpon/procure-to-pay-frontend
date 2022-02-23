import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogConfirm from "@/shared/components/DialogConfirm";
import DialogReason from "@/shared/components/DialogReason";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, has } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";

const invoiceDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog, getStorage } = useContext(StoreContext);
  const [init, setInit] = useState(false);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [dialogReasonCodeLists, setDialogReasonCodeLists] = useState([{ option: "Other", value: "OTHER" }]);
  const [cancelReason, setCancelReason] = useState([]);
  const [cancelModalShow, setCancelModalShow] = useState(false);
  const handleCancelModalClose = () => setCancelModalShow(false);
  const handleCancelModalShow = () => {
    setCancelModalShow(true);
  };

  const [submitConfirmModalShow, setSubmitConfirmModalShow] = useState(false);
  const handleSubmitConfirmModalClose = () => setSubmitConfirmModalShow(false);
  const handleSubmitConfirmModalShow = () => {
    setSubmitConfirmModalShow(true);
  };

  const [groupConfirmModalShow, setGroupConfirmModalShow] = useState(false);
  const handleGroupConfirmModalClose = () => setGroupConfirmModalShow(false);
  const handleGroupConfirmModalShow = () => {
    setGroupConfirmModalShow(true);
  };

  const [submitDataSource, setSubmitDataSource] = useState([]);
  const [submitDataSourceColumn, setSubmitDataSourceColumn] = useState([]);

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => {
    setApproveConfirmModalShow(true);
  };

  const apiConfig = {
    dataSource: "/p2p/api/v1/view/inv/detail",
    viewModel: "/p2p/api/v1/template/inv/detailView",
  };

  useEffect(() => {
    if (router.isReady) {
      loadCancelReason();
      getData();
    }
  }, [router]);

  const getData = async () => {
    try {
      setDataDetail(false);
      showLoading(t("Getting Invoice Details"));

      let {invNo, statusCode, invDate, itemCode, buyerCode, buyerBranchCode, supplierCode, supplierBranchCode} = router.query

      invNo =  invNo == "-" ? "" : invNo;
      statusCode = statusCode == "-" ? "" : statusCode;
      invDate = invDate == "-" ? "" : invDate;
      itemCode = itemCode == "-" ? "" : itemCode;
      buyerCode = buyerCode == "-" ? "" : buyerCode;
      buyerBranchCode = buyerBranchCode == "-" ? "" : buyerBranchCode;
      supplierCode = supplierCode == "-" ? "" : supplierCode;
      supplierBranchCode = supplierBranchCode == "-" ? "" : supplierBranchCode;

      const payload = {
        invNo,
        status: statusCode,
        invDate,
        itemCode,
        buyerCode,
        buyerBranchCode,
        supplierCode,
        supplierBranchCode
      }

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

      let res = await AppApi.getApi(apiConfig.dataSource, payload, { method: "post", authorized: true });

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
    } catch (err) {
      showAlertDialog({
        text: get(err, "response.data.message", get(err, "message"), "Something went wrong."),
        icon: "error",
        showCloseButton: true,
      });
    }
  };

  const linkAction = async (action, text, data, config) => {
    if (action == "action.cancel") {
      handleCancelModalShow();
    }
  };
  const cancelOnFinish = async (formValue) => {
    try {
      showLoading("Cancel Invoice No." + get(dataDetail, "invoiceDetail.invNo"));
      handleCancelModalClose();

      const cancelList = [{
        invNo: get(dataDetail, "invoiceDetail.invNo"),
        supplierCode: get(dataDetail, "supplierDetail.supplierBcCode"),
        buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
        supplierVatBranchCode: get(dataDetail, "supplierDetail.supplierMainVatBranchCode"),
        supplierTaxId: get(dataDetail, "supplierDetail.supplierTaxId"),
        supplierBranchCode: get(dataDetail, "supplierDetail.supplierBcBranchCode"),
        buyerTaxId: get(dataDetail, "buyerDetail.buyerTaxId"),
        buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
      }]

      let appr = await AppApi.getApi(
        "/p2p/api/v1/cancel/inv",
        {
          cancelList,
          code: get(formValue, "code"),
          note: get(formValue, "note")
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      console.log(appr);
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          routerLink: "/document/invoice"
        });
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Cancel Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };

  const submitConfirmOnFinish = async (action, config) => {
    try {
      showLoading("Submitting Invoice.");
      handleSubmitConfirmModalClose()

      const submitList = [{
        invNo: get(dataDetail, "invoiceDetail.invNo"),
        supplierCode: get(dataDetail, "supplierDetail.supplierBcCode"),
        buyerCode: get(dataDetail, "buyerDetail.buyerCode"),
        supplierVatBranchCode: get(dataDetail, "supplierDetail.supplierMainVatBranchCode"),
        supplierTaxId: get(dataDetail, "supplierDetail.supplierTaxId"),
        supplierBranchCode: get(dataDetail, "supplierDetail.supplierBcBranchCode"),
        buyerTaxId: get(dataDetail, "buyerDetail.buyerTaxId"),
        buyerBranchCode: get(dataDetail, "buyerDetail.buyerBranchCode"),
      }]

      let appr = await AppApi.getApi(
        "/p2p/api/v1/submit/inv",
        {
          submitList,
        },
        { method: "post", authorized: true }
      );
      hideLoading();
      if (appr.status == 200) {
        showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          routerLink: "/document/invoice"
        });
        return;
      }
      showAlertDialog({
        title: get(appr, "data.error", "Submit Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
      });
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      prepareData(searchList);
    }
  };

  const footerAction = (button) => {
    if (get(button, "action") == "action.back") {
      if (has(get(router,"query"), "threeWay")) {
        return router.push({
          pathname:"/matching/3wayDetail/[matchId]/[INVNo]",
          query: {matchId: get(router, ["query", "threeWay", 0]),INVNo: get(router, ["query", "threeWay", 1])}
        });
      }
      return router.push("/document/invoice");
    }
    if (get(button, "action") == "action.submit") {
      return handleSubmitConfirmModalShow()
    }
    if (get(button, "action") == "action.cancel") {
      return handleCancelModalShow()
    }
  };

  const loadCancelReason = async () => {
    const response = await AppApi.getApi(
      "/p2p/api/v1/cancel/inv/reasonCode",
      {},
      {
        method: "post",
        authorized: true,
      }
    );
    if (response.status == 200) {
      // console.log(reasonApi);
      // setReason(get(reasonApi, 'data.reasonList', []))
      setCancelReason(
        response.data.reasonList.map((r) => {
          return { option: r.name, value: r.code };
        })
      );
    }
  };

  return (
    <>
      <Head>
        <title>{get(dataDetail, "invoiceDetail.invNo")} - BBL PROCURE TO PAY</title>
        <link rel="stylesheet" href="/assets/css/pages/invoice_details/invoice_details.css"></link>
      </Head>
      <div className="container">
      <DialogReason
          mode="Cancel"
          title={<>Cancel Invoice No. {get(dataDetail, "invoiceDetail.invNo")}</>}
          onFinish={cancelOnFinish}
          visible={cancelModalShow}
          codeLists={cancelReason}
          closable={false}
          onClose={() => {
            handleCancelModalClose();
          }}
        />
        {/* <DialogConfirm
          visible={cancelModalShow}
          closable={false}
          onFinish={() => {
            cancelOnFinish();
          }}
          onClose={() => {
            handleCancelModalClose();
          }}
        >
          Please confirm to cancel this Invoice No. {get(dataDetail, ["invoiceDetail", "invNo"])}
        </DialogConfirm> */}
        <DialogConfirm
          visible={submitConfirmModalShow}
          closable={false}
          onFinish={() => {
            submitConfirmOnFinish();
          }}
          onClose={() => {
            handleSubmitConfirmModalClose();
          }}
        >
          Please confirm to submit this Invoice No. {get(dataDetail, ["invoiceDetail", "invNo"])}
        </DialogConfirm>
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
invoiceDetail.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}

export default invoiceDetail;
/*
.btnExport .dropdown-item:hover {
  background-color: #3269CD;
  color: #fff;
}
 */
