import Head from "next/head";
import { useRouter } from "next/router";
import Layout from "@/component/layout";
import ErrorHandle from "@/shared/components/ErrorHandle";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { B2PAPI } from "@/context/api";
import InvoiceFormStep1 from "../components/invoiceCreate/Step1";
import InvoiceFormStep2 from "../components/invoiceCreate/Step2";
import InvoiceFormStep3 from "../components/invoiceCreate/Step3";
import Link from "next/link";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input, Steps } from "antd";
const InvoiceCreatePage = () => {
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
  const layout = {
    labelCol: { span: 10 },
    wrapperCol: { span: 14 },
    formLayout: "horizontal",
    size: "small",
  };
  return (
    <>
      <Head>
        <link rel="stylesheet" href="/assets/css/pages/create_invoice/create_invoice.css" />
        <title>Create Invoice - BBL PROCURE TO PAY</title>
      </Head>
      <div className="container">
        <Form
          form={form}
          {...layout}
          initialValues={{
            listCustomerName: "",
            listVinNo: "",
            listQuoteNo: "",
          }}
          onValuesChange={(changedValues, allValues) => {
            console.log(allValues);
          }}
        >
          <Row className="mb-10">
            <Col>
              <Breadcrumb separator=">">
                <Breadcrumb.Item>Document</Breadcrumb.Item>
                <Breadcrumb.Item><Link href="/document/invoice">Invoice</Link></Breadcrumb.Item>
                <Breadcrumb.Item>Create Invoice</Breadcrumb.Item>
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

InvoiceCreatePage.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}
export default InvoiceCreatePage;
