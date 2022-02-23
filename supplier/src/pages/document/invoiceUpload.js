import { useEffect, useContext, useState } from "react";
import Head from "next/head";
import { useRouter, withRouter } from "next/router";
import { Breadcrumb, Steps } from "antd";
import { filter, find, get, isEmpty, map, size, last, split } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "@/context/store";
import { B2PAPI } from "@/context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";

import Step1 from "@/component/invoiceUpload/Step1";
import Layout from "@/component/layout";
import Link from "next/link";

const UploadInvoice = () => {
  const { locale, locales, defaultLocale } = useRouter();
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const context = useContext(StoreContext);
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);

  const [uploadFileList, setUploadFileList] = useState([]);
  const [invoiceFileDetailResponse, setInvoiceFileDetailResponse] = useState({});

  const apiConfig = {
    uploadInvoice: "/p2p/api/v1/upload/inv",
    uploadFileDetail: "/p2p/api/v1/view/inv/uploadfile/detail",
  };

  const performGetData = async (path, body, header = { method: "post", authorized: true }, catchCase) => {
    try {
      const response = await AppApi.getApi(path, body, header);
      console.log("response", get(response, "data"));
      if (get(response, "status", 500) == 200) {
        return get(response, "data");
      } else {
        hideLoading();
        showAlertDialog({
          title: get(response, "data.error", "Error !"),
          text: get(response, "data.message"),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      hideLoading();
      ErrorHandle(err);
      catchCase;
    }
  };

  const getUploadFileDetail = async (uploadRes) => {
    showLoading("Preparing Upload Invoice Validation Result");
    const response = await performGetData(get(apiConfig, "uploadFileDetail", ""), { ...uploadRes }, undefined, setInvoiceFileDetailResponse([]));

    if (response) {
      const invoiceFileDetailResponse = get(response, "invoiceFileDetailResponse", {});
      setInvoiceFileDetailResponse(invoiceFileDetailResponse);
      hideLoading();
    }
    // return false;
  };

  const uploadFile = async () => {
    showLoading("Uploading Invoice");
    const files = filter(uploadFileList, (f) => last(split(get(f, "name"), '.')) === 'csv');
    const attachments = filter(uploadFileList, (f) => last(split(get(f, "name"), '.')) !== 'csv');

    const response = await performGetData(
      get(apiConfig, "uploadInvoice", ""),
      { files, attachments },
      {
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        authorized: true,
      },
      setInvoiceFileDetailResponse([])
    );
    hideLoading();
    if (response && get(response, ['baseResponse', 'statusCode']) === '00') {
      return {
        fileName: get(response, "fileName"),
        supplierCode: get(response, 'supplierCode'),
        supplierBranchCode: get(response, 'supplierBranchCode')
      };
    } else if (get(response, ['baseResponse', 'statusCode']) === '10') {
      showAlertDialog({
        title: "Error !",
        text: get(response, ['baseResponse', 'errorDesc']),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: true,
      });
      return false
    }

  };

  const onSubmit = async () => {
    const uploadRes = await uploadFile();
    if (uploadRes) {
      getUploadFileDetail(uploadRes);
    }
  };

  return (
    <>
      <Head>
        <title>Upload Invoice - BBL PROCURE TO PAY</title>
        <link href="/assets/css/pages/create_invoice/create_invoice.css" rel="stylesheet" type="text/css" />
      </Head>
      <div className="content d-flex flex-column flex-column-fluid" id="bbl_content">
        <div className="d-flex flex-column-fluid">
          <div className="container">
            <div className="row">
              <div className="col-12">
                <Breadcrumb separator=">">
                  <Breadcrumb.Item>Document</Breadcrumb.Item>
                  <Breadcrumb.Item><Link href="/document/invoice">Invoice</Link></Breadcrumb.Item>
                  <Breadcrumb.Item>Upload Invoice</Breadcrumb.Item>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column-fluid">
          <div className="container mt-5">
            <Step1 uploadFileList={uploadFileList} setUploadFileList={setUploadFileList} />
          </div>
        </div>
        <div className="d-flex flex-column-fluid">
          <div className="container">
            <hr className="line-blue mt-10" />
            <div className="ant-row ant-form-item mt-10">
              <div className="ant-col ant-form-item-control">
                <div className="ant-form-item-control-input">
                  <div className="ant-form-item-control-input-content">
                    <div className="row justify-content-md-center">
                      <>
                        <button type="button" className="btn btn-blue btn-auto-width" disabled={size(find(uploadFileList, (f) => last(split(get(f, "name"), '.')) === "csv")) == 0} onClick={onSubmit}>
                          <span>Submit</span>
                        </button>
                        <button type="button" className="btn btn-blue-transparent btn-auto-width" onClick={() => router.push("/document/invoice")}>
                          <span>Back</span>
                        </button>
                      </>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

UploadInvoice.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "po"])),
    },
  };
}

export default UploadInvoice;
