import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/component/layout";
import ErrorHandle from "@/shared/components/ErrorHandle";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, map } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import InvoiceFormStep1 from "../../../../../components/invoiceEdit/Step1";
import InvoiceFormStep2 from "../../../../../components/invoiceEdit/Step2";
import InvoiceFormStep3 from "../../../../../components/invoiceEdit/Step3";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input, Steps } from "antd";
import Link from "next/link";
const InvoiceEditPage = () => {
  const { locale, locales, defaultLocale } = useRouter();
  const [selectedData, setSelectedData] = useState(false);
  const [step, setStep] = useState(1);
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const [form] = Form.useForm();
  const [fileLists, setFileLists] = useState([]);
  const [attachmentsDel, setAttachmentDel] = useState([])
  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
    formLayout: "horizontal",
    size: "small",
  };
  const apiConfig = {
    dataSource: "/p2p/api/v1/view/inv/detail"
  }

  const {
    invNo,
    statusCode,
    invDate,
    itemCode,
    buyerCode,
    buyerBranchCode,
    supplierBcCode,
    supplierBcBranchCode
  } = get(router, "query")

  useEffect(() => {
    getData()
  }, [])

  const getData = async() => {
    showLoading(t("Getting Invoice Details"));
    let res = await AppApi.getApi(apiConfig.dataSource, { invNo, status: statusCode, invDate, itemCode, buyerCode, buyerBranchCode, supplierCode: supplierBcCode, supplierBranchCode: supplierBcBranchCode }, { method: "post", authorized: true });
    if(res) {
      setSelectedData(get(res, 'data'))
      setFileLists(get(res, ['data', 'attachmentList']))
      form.setFieldsValue({
        listCustomerName:get(res, ['data', 'customerName']),
        listVinNo: get(res, ['data', 'invoiceDetail', 'itemCode']),
        listQuoteNo: get(res, ['data','poNo']),
        invNo: get(res, ['data', 'invoiceDetail', 'invNo']),
        invoiceDate: get(res, ['data', 'invoiceDetail', 'invDate']),
        itemCode: get(res, ['data', 'invoiceDetail', 'itemCode']),
        invoiceDueDate: get(res, ['data', 'invoiceDetail', 'invDueDate']),
        note: get(res, ['data', 'invoiceDetail', 'remark']),
        paymentTerms: get(res, ['data', 'invoiceDetail', 'paymentTerm']),
        supplierCodeName: get(filter(get(res, ['data', 'supplierDetail', 'listSupplier']), (ls) => ls.selectDefault), ['0','value'])
      })
    }
    hideLoading()
  }

  return (
    <>
      <Head>
        <link rel="stylesheet" href="/assets/css/pages/create_invoice/create_invoice.css" />
        <title>{get(selectedData, ["invoiceDetail","invNo"], "-")} - BBL PROCURE TO PAY</title>
      </Head>
      <div className="container">
        <Form
          form={form}
          {...layout}
        >
          <Row className="mb-10">
            <Col>
              <Breadcrumb separator=">">
                <Breadcrumb.Item>Document</Breadcrumb.Item>
                <Breadcrumb.Item><Link href="/document/invoice">Invoice</Link></Breadcrumb.Item>
                <Breadcrumb.Item>Edit Invoice</Breadcrumb.Item>
              </Breadcrumb>
            </Col>
          </Row>

          <div class="d-flex flex-column-fluid">
            <div class="container ant-col-9 mt-10">
              <Steps current={step - 1} labelPlacement="vertical">
                <Steps.Step key={1} title="Please Select" />
                <Steps.Step key={2} title="Insert Invoice Details" />
                <Steps.Step key={3} title="Summary" />
              </Steps>
            </div>
          </div>
          {step == 1 ? (
            <InvoiceFormStep1
              form={form}
              api={AppApi}
              step={step}
              setStep={setStep}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              fileLists={fileLists}
              setFileLists={setFileLists}
              showLoading={showLoading}
              hideLoading={hideLoading}
              forceLogin={forceLogin}
              showAlertDialog={showAlertDialog}
            />
          ) : (
            <></>
          )}
          {step == 2 ? (
            <InvoiceFormStep2
              form={form}
              api={AppApi}
              step={step}
              setStep={setStep}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              fileLists={fileLists}
              setFileLists={setFileLists}
              attachmentsDel={attachmentsDel}
              setAttachmentDel={setAttachmentDel}
              showLoading={showLoading}
              hideLoading={hideLoading}
              forceLogin={forceLogin}
              showAlertDialog={showAlertDialog}
            />
          ) : (
            <></>
          )}
          {step == 3 ? (
            <InvoiceFormStep3
              form={form}
              api={AppApi}
              step={step}
              setStep={setStep}
              selectedData={selectedData}
              setSelectedData={setSelectedData}
              fileLists={fileLists}
              setFileLists={setFileLists}
              attachmentsDel={attachmentsDel}
              setAttachmentDel={setAttachmentDel}
              showLoading={showLoading}
              hideLoading={hideLoading}
              forceLogin={forceLogin}
              showAlertDialog={showAlertDialog}
            />
          ) : (
            <></>
          )}
        </Form>
      </div>
    </>
  );
};

InvoiceEditPage.Layout = Layout;
export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "invoice"])),
    },
  };
}
export default InvoiceEditPage;
