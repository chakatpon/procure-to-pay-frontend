import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import DynamicViewEdit from "@/shared/components/DynamicViewEdit";
import DialogResubmit from "../../../shared/components/DialogResubmit";
import DialogReason from "@/shared/components/DialogReason";
import { useRouter, withRouter } from "next/router";
import Layout from "@/component/layout";
import { useEffect, useContext, useState } from "react";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { B2PAPI } from "@/context/api";
import { Row, Col, Breadcrumb } from "antd";
import Link from "next/link";
import { DatePicker } from 'rsuite';

const paymentMonitoringDetail = (props) => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const [dataDetail, setDataDetail] = useState(false);
  const [viewModel, setViewModel] = useState(false);
  const [init, setInit] = useState(false);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

  const [resubmitModalShow, setResubmitModalShow] = useState(false);
  const handleResubmitModalClose                  = () => setResubmitModalShow(false);
  const handleResubmitModalShow                   = () => setResubmitModalShow(true);

  const [rejectModalShow, setRejectModalShow] = useState(false);
  const handleRejectModalClose = () => setRejectModalShow(false);
  const handleRejectModalShow = () => { setRejectModalShow(true); }

  const [rejectReason, setRejectReason] = useState([]);

  // For Resubmit API
  const [oldPaymentRef, setOldPaymentRef]                   = useState('');
  const [newPaymentRef, setNewPaymentRef]                   = useState('');
  const [paymentMethod, setPaymentMethod]                   = useState('');
  const [newPaymentMethod, setNewPaymentMethod]             = useState('');
  const [newPaymentMethodCode, setNewPaymentMethodCode]     = useState('');
  const [newPaymentMethodDesc, setNewPaymentMethodDesc]     = useState('');
  const [paymentVoucherId, setPaymentVoucherId]             = useState('');
  const [enableDate, setEnableDate]                         = useState([]);
  const [invalidClass, setInvalidClass]                     = useState('');
  const [paymentErrorMsg, setPaymentErrorMsg]               = useState('');
  const [paymentDate, setPaymentDate]                       = useState('');
  const [newPaymentDate, setNewPaymentDate]                 = useState('');
  const [preGroupId, setPreGroupId]                         = useState('');
  const [confirmDisabled, setConfirmDisabled]               = useState(true);

  const apiConfig = {
    viewModel: "/p2p/api/v1/template/payment/detailView",
    dataDetail: "/p2p/api/v1/view/payment"
  }
  const DatePickerLocale = {
    sunday: 'Su',
    monday: 'Mo',
    tuesday: 'Tu',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
    ok: 'Confirm',
    today: 'Today',
    yesterday: 'Yesterday',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    formattedMonthPattern: "MM-YYYY",
    formattedDayPattern: "DD-MM-YYYY"
  };

  // useEffect(() => {
  //   try {
  //     if (router.isReady == true) {
  //       if(!init){
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
  },[router]);
  
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

    loadRejectReason();
    const response = await performGetData(get(apiConfig, "dataDetail", ""), {  paymentRef })
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
    if(get(button,"action")=="action.back"){
      return router.push("/monitor/paymentMonitor")
      // return resubmitInvoice(get(button,"action"),button);
    }
    if(get(button,"action")=="action.resubmit"){
      return resubmitInvoice(get(button,"action"),button);
    }
    if(get(button,"action")=="action.reject"){
      return rejectInvoice(get(button,"action"),button);
    }
  }

  const rejectInvoice = async (action, config) => {
    handleRejectModalShow()
  }

  const resubmitInvoice = async (action, config) => {
    try {
      // Resubmit API
      showLoading('Prepare Resubmit Data.')
      const path      = "/p2p/api/v1/resubmit/payment"
      const body      = {
                          "paymentRef": dataDetail.paymentRef
                        }
      const response  = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        handleResubmitModalShow()
        setOldPaymentRef(response.data.oldPaymentRef)
        setNewPaymentRef(response.data.newPaymentRef)
        await setPaymentDate(response.data.paymentDate)
        setPaymentMethod(response.data.paymentMethod)
        setPaymentVoucherId(response.data.paymentVoucherId)
        setEnableDate(response.data.enableDate)
        setPreGroupId(response.data.preGroupId)
        hideLoading();
      } else {
        hideLoading();
        await showAlertDialog({
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

  const revisePaymentDate = async (data) => {
    try {
      // Resubmit API
      showLoading('Revise Payment Date.')
      const path      = "/p2p/api/v1/revise/payment/payment-date"
      const body      = {
        paymentRef: dataDetail.paymentRef,
        newPaymentRef: dataDetail.paymentRef,
        paymentMethod: paymentMethod,
        newPaymentDate: await moment(data).format("DD-MM-YYYY"),
        linearId: dataDetail.paymentVoucherId,
        preGroupId: preGroupId
    }
      const response  = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        setNewPaymentDate(response.data.newPaymentDate)
        setNewPaymentMethodCode(response.data.newPaymentMethodCode)
        setNewPaymentMethodDesc(response.data.newPaymentMethodDesc)
        setConfirmDisabled(false)
        setInvalidClass('')
        setPaymentErrorMsg('')
        hideLoading();
      } else {
        hideLoading();
        setPaymentErrorMsg(response.data.message)
        setConfirmDisabled(true)
        setInvalidClass('invalid')
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err)
      setPaymentErrorMsg(response.data.message)
    }
  }

  const resubmitOnFinish = async (data) => {
    try {
      // Resubmit API
      handleResubmitModalClose()
      showLoading('Confirm Payment Date.')
      const path      = "/p2p/api/v1/confirm/payment"
      const body      = {
        newPaymentRef:    newPaymentRef,
        oldPaymentRef:    oldPaymentRef,
        paymentMethod:    newPaymentMethodCode,
        paymentDate:      newPaymentDate,
        paymentVoucherId: dataDetail.paymentVoucherId,
        preGroupId: preGroupId
    }
      const response  = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        hideLoading();
        await showAlertDialog({
          title: "Resubmit Success",
          text: response.data.message,
          icon: "success",
        })
        router.push("/monitor/paymentMonitor")
      } else {
        hideLoading();
        await showAlertDialog({
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

  const resubmitOnCancle = async (data) => {
    try {
      // Cancle API
      showLoading('Cancle Resubmit Date.')
      const path      = "/p2p/api/v1/update/payment/status"
      const body      = {
        preGroupId: preGroupId
    }
      const response  = await AppApi.getApi(path, body, { authorized: true, method: "post" })
      if (get(response, "status", 500) == 200) {
        hideLoading();

      } else {
        hideLoading();
        await showAlertDialog({
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
    handleResubmitModalClose()
  }

  const dialogRejectOnFinish = async (values) => {
    try {
      showLoading("Rejecting Payment")
      handleRejectModalClose();
      console.log('Reject Dailog values : ',values)
      let rejectData =
        {
          paymentRef: newPaymentRef || dataDetail.paymentRef
        }
      ;
      console.log('Reject Dailog rejectData : ',rejectData)
      let appr = await AppApi.getApi("/p2p/api/v1/reject/payment-voucher", {
        ...values,
        ...rejectData
      }, { method: "post", authorized: true });
      hideLoading();
      console.log(appr)
      if (appr.status == 200) {
        await showAlertDialog({
          text: get(appr, "data.message"),
          icon: "success",
          showCloseButton: true,
          showConfirmButton: true,
        });
        router.push("/monitor/paymentMonitor")
        return;
      }
      await showAlertDialog({
        title: get(appr, "data.error", "Reject Failed !"),
        text: get(appr, "data.message", "Please contact administrator."),
        icon: "error",
        showCloseButton: true,
        showConfirmButton: true,

      });
      router.push("/monitor/paymentMonitor")
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      router.push("/monitor/paymentMonitor")
    }
  }
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

  return (
    <>
      <Head>
        <title>{get(viewModel, "title")} - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/monitoring/payment/payment_detail.css" rel="stylesheet" type="text/css"/>
      </Head>
      {console.log("DATE DETAIL : ",dataDetail)}
        <DialogResubmit
          visible={resubmitModalShow}
          // visible={true}
          title={'Resubmit Payment'}
          closable={false}
          onFinish={() => { resubmitOnFinish() }}
          onClose={() => { resubmitOnCancle() }}
          confirmDisabled={confirmDisabled}
        >
        <div className="mt-2">
          <table className="ant-descriptions-item-content text-dark">
            <tbody>
              <tr className=""  style={{ height: "55px"}}>
                <td className="text-left">Payment Reference</td>
                <td className='px-5'>:</td>
                <td className="text-left">
                  <Row>
                    <Col>
                        <Breadcrumb className={''}>
                            <div>{oldPaymentRef}</div>
                        </Breadcrumb >
                    </Col>
                  </Row>
                </td>
              </tr>
              <tr className=""  style={{ height: "55px"}}>
                <td className="text-left">Payment Date</td>
                <td className='px-5'>:</td>
                <td className="text-left">
                  {console.log("PAYMENT DATE : ", paymentDate.toString())}
                  {(enableDate.length&&paymentDate)&& <DatePicker
                    // key={ get(row,"no")}
                    // onChange={(val)=>{

                    //  }}
                    className={invalidClass}
                    style={{ width: 150 }}
                    locale={DatePickerLocale}
                    ranges={[]}
                    disabledDate={date => {

                      return ! enableDate.includes(moment(date).format("YYYY-MM-DD"))
                    }}
                    cleanable={false}
                    onOk={(date,event)=>{
                      revisePaymentDate(date)
                      // reviseDate(r,date,row,event)

                    }}
                    // value={(value) => {moment(value).format("DD-MM-YYYY")}}
                    defaultValue={new Date(parseInt(paymentDate.substring(6,10)), parseInt(paymentDate.substring(3,5)-1), parseInt(paymentDate.substring(0,2)) )}
                    format={"DD-MM-YYYY"}
                  />}
                </td>
              </tr>
              {paymentErrorMsg ? <tr>
              <td className="text-left"></td>
                <td className='px-5'></td>
                <td className="text-left">
                <p className="text-danger">{paymentErrorMsg}</p>
                </td>
              </tr> : null}
              <tr className="" style={{ height: "55px"}}>
                <td className="text-left">Payment Method</td>
                <td className='px-5'>:</td>
                <td className="text-left">
                  {newPaymentMethodDesc || paymentMethod}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        </DialogResubmit>

<DialogReason
  mode="Reject"
  title={<>Reject Invoice to Pay </>}
  onFinish={dialogRejectOnFinish}
  visible={rejectModalShow}
  codeLists={rejectReason}
  closable={false}
  onClose={() => { handleRejectModalClose() }}
/>

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
