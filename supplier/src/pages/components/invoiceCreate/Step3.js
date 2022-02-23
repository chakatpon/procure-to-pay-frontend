import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import Head from "next/head";
import ErrorHandle from "@/shared/components/ErrorHandle";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input, Steps, Space } from "antd";
import router from "next/router";
import TablePurchaseInvoice from "../../../shared/custom/tlt/TablePurchaseInvoice";
import TableLoanInformation from "../../../shared/custom/tlt/TableLoanInformation";
import TableDetail from "../../../shared/custom/tlt/TableDetail";
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
const InvoiceFormStep3 = ({ form, api, selectedData, setSelectedData, setStep, showLoading, hideLoading, forceLogin, showAlertDialog, fileLists }) => {
  const [invoiceInfo, setInvoiceInfo] = useState({});
  const [canNextStep, setCanNextStep] = useState(true);
  const [approveSubmitModalShow, setApproveSubmitModalShow] = useState(false);
  const handleApproveSubmitModalClose = () => setApproveSubmitModalShow(false);
  const handleApproveSubmitModalShow = () => {
    setApproveSubmitModalShow(true);
  };

  const [handleBackModal, setHandleBackModalShow] = useState(false);
  const handleBackModalClose = () => setHandleBackModalShow(false);
  const handleBackModalShow = () => {
    setHandleBackModalShow(true);
  };

  const [handleCloseModal, setHandleCloseModalShow] = useState(false);
  const handleCloseModalClose = () => setHandleCloseModalShow(false);
  const handleCloseModalShow = () => {
    setHandleCloseModalShow(true);
  };

  const paymentModel = {
    multiDatasource: "paymentList",
    tableClass: "has-summary",
    grayTableWhen: {
      selectFlag: false,
    },
    dataSource: "paymentItemDetailList",
    tableOptions: {
      pagination: false,
    },
    columns: [
      {
        columnName: "Asset Custom Flow",
        columnType: "text",
        columnClass: "text-dark",
        columnFieldName: "paymentDetailTypeDescription",
        columnDefault: true,
        columnSeq: 1,
      },
      {
        columnName: "Amount (Including VAT)",
        columnFieldName: "amountInclVAT",
        columnType: "amountformat",
        columnClass: "text-dark",
        columnDefault: true,
        columnSeq: 2,
      },
      {
        columnName: "Amount (Excluding VAT)",
        columnFieldName: "amountExclVAT",
        columnType: "amountformat",
        columnClass: "text-dark",
        columnDefault: true,
        columnSeq: 3,
      },
      {
        columnName: "VAT",
        columnFieldName: "vatAmount",
        columnType: "amountformat",
        columnClass: "text-dark",
        columnDefault: true,
        columnSeq: 4,
      },
      {
        columnName: "WHT",
        columnFieldName: "whtAmount",
        columnType: "amountformat",
        columnClass: "text-dark",
        columnDefault: true,
        columnSeq: 5,
      },
      {
        columnName: "Net Amount",
        columnFieldName: "netAmount",
        columnType: "amountformat",
        columnClass: "text-dark",
        columnDefault: true,
        columnSeq: 6,
      },
    ],
  };
  var timer;
  useEffect(() => {
    setInvoiceInfo(get(selectedData, "invoiceInfo"));
    const selectedSupName = filter(get(get(selectedData, "invoiceInfo"), ["supplierDetail", "listSupplier"]), (ls) => ls.selectDefault)
    console.log("selectedSupName",selectedSupName)
    form.setFieldsValue({
      supplierCodeName: get(selectedSupName, [0, "value"]),
    });
  }, []);
  const getToNextStep = () => {};
  const getToPrevStep = () => {
    setSelectedData({ ...selectedData, invoiceInfo: false });
    setStep(2);
  };

  const valueFormat = (text, format) => {
    if (text == "" || text == null || text == undefined) {
      text == "";
    }
    if (format == "currency") {
      if (text == "") {
        return "";
      }
      text = parseFloat(text);
      if (Number.isNaN(text)) {
        return "";
      }
      text = text.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
      return text ? text : "";
    }
    return text;
  };
  const submitOnFinish = async () => {
    try {
      handleApproveSubmitModalClose();
      showLoading("Submitting Invoice");
      let submitVal = {
        invNo: get(selectedData, "step2.invNo"),
        invDate: get(selectedData, "step2.invoiceDate", moment()).format("YYYY-MM-DD"),
        invDueDate: get(selectedData, "step2.invoiceDueDate", moment()).format("YYYY-MM-DD"),
        invItemCode: get(selectedData, "step2.itemCode"),
        attachments: fileLists,
        supplierCodeName: form.getFieldValue("supplierCodeName"),
        message: get(selectedData, "step2.note"),
        actionType: "create"
      };
      let res = await api.getApi("/p2p/api/v1/submit/inv", submitVal, {
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        authorized: true,
      });
      hideLoading();
      if (res.status == 200 && get(res, ['data', 'status']) == 200) {
        console.log(res.data);
        let a = await showAlertDialog({
          text: get(res, "data.message"),
          icon: "success",
          showCloseButton: true,
        });
        if (a.isConfirmed == true) {
          router.push("/document/invoice");
        }
      } else {
        showAlertDialog({
          title: get(res, "data.error", "Submit Invoice Failed !"),
          text: get(res, "data.message", "Please contact administrator."),
          icon: "error",
          showCloseButton: true,
        });
      }
    } catch (err) {
      ErrorHandle(err);
      hideLoading();
    }
  };
  return (
    <>
      <DialogConfirm
        visible={handleCloseModal}
        closable={false}
        onFinish={() => {
          handleCloseModalClose();
          router.push("/document/invoice");
        }}
        onClose={() => {
          handleCloseModalClose();
        }}
      >
        Please confirm to close Create Invoice.
        <br />
        If you close, all data will be cleared.
      </DialogConfirm>
      <DialogConfirm
        visible={handleBackModal}
        closable={false}
        onFinish={() => {
          handleBackModalClose();
          getToPrevStep();
        }}
        onClose={() => {
          handleBackModalClose();
        }}
      >
        Please confirm to go back.
        <br />
        If you go back all data will be cleared.
      </DialogConfirm>
      <DialogConfirm
        visible={approveSubmitModalShow}
        closable={false}
        onFinish={() => {
          submitOnFinish();
        }}
        onClose={() => {
          handleApproveSubmitModalClose();
        }}
      >
        Please confirm to submit this Invoice No.{get(invoiceInfo, "invoice.invNo")}
      </DialogConfirm>
      <Form
        form={form}
        labelCol={24}
        wrapperCol={24}
        onValuesChange={(changedValues, allValues) => {
          setSelectedData({ ...selectedData, step3: allValues });
          console.log(allValues);
          if (get(allValues, "supplierCodeName")) {
            setCanNextStep(false);
          } else {
            setCanNextStep(true);
          }
        }}
        layout="horizontal"
      >
        <Head>
          <link rel="stylesheet" href="/assets/css/pages/invoice_details/invoice_details.css" />
        </Head>
        <div className="d-flex flex-column-fluid">
          <div className="container">
            <div className="ant-row">
              <div className="ant-col-10">
                <p className="header-bbl mt-10">
                  <b>Dealer</b>
                </p>
                <p className="ant-descriptions-item-content">
                  {get(invoiceInfo, "supplierDetail.supplierCompNameTH")} <br />
                  {get(invoiceInfo, "supplierDetail.supplierAddress")}
                  <br />
                  เลขประจำตัวผู้เสียภาษี {get(invoiceInfo, "supplierDetail.supplierTaxId")}
                </p>
              </div>
              <div className="ant-col-2 mt-21 text-right">Showroom : &nbsp;&nbsp;</div>
              <div className="ant-col-4 mt-19 ant-form-item-control">
                <Form.Item name="supplierCodeName">
                  <Select>
                    {get(invoiceInfo, "supplierDetail.listSupplier", []).map((r) => (
                      <Select.Option value={r.value}>{r.option}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </div>
              <div className="ant-col-8 text-right">
                {" "}
                <span>
                  <p className="header-quote mt-10">
                    <b>Invoice No. : {get(invoiceInfo, "invoice.invNo", '-')}</b>
                  </p>
                  <p className="header-quote">
                    <b>Quote No. : {get(invoiceInfo, "poNo", '-') || '-'}</b>
                  </p>
                </span>{" "}
                <span>
                  <p className="ant-descriptions-item-content">Invoice Entry Date : {get(invoiceInfo, "invoice.entryDate", '') || ""}</p>
                </span>{" "}
                <br/>
                <span>
                  <p className="ant-descriptions-item-content">Credit Approval Date : {get(invoiceInfo, "creditApprovalDate", '') || ""}</p>
                </span>
              </div>
              <div className="ant-col-10">
                <p className="header-bbl mt-10">
                  <b>Buyer</b>
                </p>
                <p className="ant-descriptions-item-content">
                  {get(invoiceInfo, "buyerDetail.buyerCompNameTH")}
                  <br />
                  {get(invoiceInfo, "buyerDetail.buyerAddress")}
                  <br />
                  เลขประจำตัวผู้เสียภาษี {get(invoiceInfo, "buyerDetail.buyerTaxId")}
                </p>
              </div>
              <div className="ant-col-md-4"></div>
              <div className="ant-col-md-5"></div>
            </div>
          </div>
        </div>
        <div className="d-flex flex-column-fluid mt-10 my-10">
          <div className="container-fluid">
            <div>
              <hr className="line" />
            </div>
          </div>
        </div>
        <div className="d-flex flex-column-fluid">
          <div className="container">
            <div className="ant-row">
              <div className="ant-col-10">
                <p className="header-bbl">
                  <b>Customer Details</b>
                </p>
                <table className="ant-descriptions-item-content">
                  <tbody>
                    <tr>
                      <td>Customer Name</td>
                      <td width="20">:</td>
                      <td width="200">{get(invoiceInfo, "customerName")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="ant-col-2"></div>
              <div className="ant-col-10">
                <table className="ant-descriptions-item-content">
                  <tbody>
                    <tr>
                      <td className="">
                        <br />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="ant-row">
              <div className="ant-col-24">
                <p className="header-bbl mt-10">
                  <b>Loan Details</b>
                </p>
                <TableLoanInformation model={{}} data={invoiceInfo} />
              </div>
            </div>

            <div className="ant-row">
              <div className="ant-col ant-col-24">
                <h2 className="header-bbl mt-10">Invoice </h2>
                <div className="d-flex align-items-center">
                  <div className="container-fluid mt-2 p-0">
                    <div>
                      <div className="ant-row rcorners mt-5">
                        <div className="ant-col-10">
                          <table className="ant-descriptions-item-content">
                            <tbody>
                              <tr>
                                <td width="100"></td>
                                <td className="text-left" width="100">
                                  เลขที่ใบสั่งซื้อ
                                </td>
                                <td className="text-right" style={{ paddingRight: "10px" }} width="10">
                                  :
                                </td>
                                <td className="text-left">{get(invoiceInfo, "invoiceDetail.invNo")}</td>
                              </tr>
                              <tr>
                                <td width="10"></td>
                                <td className="text-left" width="100">
                                  เลขตัวถังรถยนต์
                                </td>
                                <td className="text-right" style={{ paddingRight: "10px" }} width="10">
                                  :
                                </td>
                                <td className="text-left">{get(invoiceInfo, "invoiceDetail.itemCode")}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="ant-col-2"></div>
                        <div className="ant-col-10">
                          <table className="ant-descriptions-item-content">
                            <tbody>
                              <tr>
                                <td className="text-left" width="83">
                                  วันที่สั่งซื้อ
                                </td>
                                <td className="text-right" width="20">
                                  :
                                </td>
                                <td className="text-right" width="100">
                                  {get(invoiceInfo, "invoiceDetail.invDate")}
                                </td>
                                <td className="text-right" width="40"></td>
                              </tr>
                              <tr>
                                <td>ยอดสั่งซื้อ</td>
                                <td className="text-right" width="20">
                                  :
                                </td>
                                <td className="text-right" width="100">
                                  {valueFormat(get(invoiceInfo, "loanInformation.itemUnitPrice"), "currency")}
                                </td>
                                <td className="text-right" width="40">
                                  บาท
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="ant-row">
              <div className="ant-col-24">
                <p className="header-bbl mt-10"></p>
                <TableDetail itm={paymentModel} data={invoiceInfo} />
              </div>
            </div>

            <div className="ant-row">
              <div className="ant-col-24">
                <p className="header-bbl mt-10"></p>
                <TablePurchaseInvoice model={{}} data={invoiceInfo} />
              </div>
            </div>
          </div>
        </div>
      </Form>

      <hr className="line-blue mt-10" />
      <div className="ant-row ant-form-item mt-10">
        <div className="ant-col ant-form-item-control">
          <div className="ant-form-item-control-input">
            <div className="ant-form-item-control-input-content">
              <div className="row justify-content-md-center">
                <button
                  type="button"
                  // disabled={canNextStep}
                  className="btn btn-blue btn-auto-width"
                  onClick={() => {
                    handleApproveSubmitModalShow();
                  }}
                >
                  <span>Submit</span>
                </button>
                <button
                  type="button"
                  className="btn btn-orange btn-auto-width"
                  onClick={() => {
                    handleCloseModalShow();
                  }}
                >
                  <span>Close</span>
                </button>
                <button
                  type="button"
                  className="btn btn-blue-transparent btn-auto-width"
                  onClick={() => {
                    handleBackModalShow();
                  }}
                >
                  <span>Back</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default InvoiceFormStep3;
