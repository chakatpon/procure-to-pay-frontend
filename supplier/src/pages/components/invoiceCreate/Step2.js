import ErrorHandle from "@/shared/components/ErrorHandle";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, difference, last, split, differenceBy, has} from "lodash";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input, Steps, Space, Upload, message, List, Progress, DatePicker } from "antd";

import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import router from "next/router";
import moment from "moment";
const InvoiceFormStep2 = ({ form, api, selectedData, setSelectedData, setStep, fileLists, setFileLists, showLoading, hideLoading, forceLogin, showAlertDialog }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [canNextStep, setCanNextStep] = useState(true);
  const [isShowConfirmRemoveFile, setIsShowConfirmRemoveFile] = useState(false)
  const [removeFileIndex, setRemoveFileIndex] = useState(undefined)

  const [listQuoteNo, setListQuoteNo] = useState([]);
  const [listCustomerName, setListCustomerName] = useState([]);
  const [listVinNo, setListVinNo] = useState([]);

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

  useEffect(() => {
    setIsLoading(false);
    form.setFieldsValue({
      itemCode: get(selectedData, "loanInformation.itemCode"),
      paymentTerms: get(selectedData, "paymentTerm"),
    });
    console.log(selectedData);
    if (get(selectedData, "step2")) {
      setCanNextStep(false);
    } else {
      form.setFieldsValue({
        invNo: "",
        invoiceDate: "",
        invoiceDueDate: "",
        note: "",
      });
    }
  }, []);

  const onRemoveFile = () => {
    const index = removeFileIndex
    const newFileList = fileLists.filter((f, i) => i !== index);
    // const index = fileLists.indexOf(file);
    // const newFileList = fileLists.slice();
    // newFileList.splice(index, 1)
    setFileLists(newFileList);
  };

  const props = {
    multiple: true,
    showUploadList: false,
    // maxCount: 5,
    // accept: ".pdf,.jpg,.jpeg",
    onRemove: (file) => {
      const index = fileLists.indexOf(file);
      const newFileList = fileLists.slice();
      newFileList.splice(index, 1);
      setFileLists(newFileList);
    },
    beforeUpload: (file) => {
      return false;
    },
    onChange: ({ fileList }) => {
      onFileChange(fileList)
    },
    fileList: fileLists,
  };

  const onFileChange = (fileList) => {
    let availableFile = [];

    let newDropFile = differenceBy(fileList, fileLists, 'name');
    let diff = difference(fileList, fileLists)

    if(size(diff) !== size(newDropFile)){
      showAlertDialog({
        text : "Attachment exceeded duplicate file."
      });
    }

    if(size(fileLists) <= 5){
      if (size([...newDropFile, ...fileLists]) > 5) {
        showAlertDialog({
          text : "Attachment exceeded maximum number limit of file (5)."
        });
      }
      let avb = 5 - size(fileLists)
      newDropFile = filter(newDropFile, (f,i) => i+1 <= avb)
    } else {
      newDropFile = []
      showAlertDialog({
        text : "Attachment exceeded maximum number limit of file (5)."
      });
    }



    const allowFileType = ["pdf", "PDF", "jpeg", "JPEG", "jpg", "JPG"];
    if (size(newDropFile) > 0) {
      const supportFileType = filter(newDropFile, (f) => allowFileType.includes(last(split(get(f, "name"), '.'))));
      const unSupportFileType = filter(newDropFile, (f) => !allowFileType.includes(last(split(get(f, "name"), '.'))));
      const fitFileSize = filter(supportFileType, (f) => get(f, "size") <= 1024 * 1024);
      const overFileSize = filter(supportFileType, (f) => get(f, "size") > 1024 * 1024);
      if(size(unSupportFileType) > 0){
        showAlertDialog({
          text : "Only Support file type PDF and JPG."
        });
      }

      if(size(overFileSize) > 0){
        showAlertDialog({
          text : "Attachment exceeded maximum size limit of 1 MB."
        });
      }

      availableFile = [...fileLists,...fitFileSize]
    } else {
      availableFile = fileLists
    }

    setFileLists(availableFile);
  }

  const getToNextStep = async () => {
    console.log(selectedData);
    try {
      showLoading("Preparing Invoice Data");
      let searchVal = {
        invNo: get(selectedData, "step2.invNo"),
        invDate: get(selectedData, "step2.invoiceDate", moment()).format("DD-MM-YYYY"),
        invDueDate: get(selectedData, "step2.invoiceDueDate", moment()).format("YYYY-MM-DD"),
        itemCode: get(selectedData, "step2.itemCode"),
        attachments: fileLists,
      };
      let res = await api.getApi("/p2p/api/v1/view/create/inv/detail", searchVal, {
        method: "post",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        authorized: true,
      });
      if (res.status == 200) {
        console.log(res.data);
        setSelectedData({ ...selectedData, invoiceInfo: res.data });
        setStep(3);
      } else {
        showAlertDialog({
          title: get(res, "data.error", "Loading Invoice Failed !"),
          text: get(res, "data.message", "Please contact administrator."),
          icon: "error",
          showCloseButton: true,
        });
      }

      hideLoading();
    } catch (err) {
      hideLoading();
    }
  };
  const getToPrevStep = () => {
    setSelectedData({ ...selectedData, step2: false });
    setFileLists([]);
    setStep(1);
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
  const fileIcon = (name) => {
    switch(last(split(name, '.'))){
      case "pdf":
      case "PDF":
        return <><i className="fad fa-file-pdf fa-2x my-2 text-danger"></i></>
        break;
      case "csv":
      case "CSV":
        return <><i className="fad fa-file-csv fa-2x my-2"></i></>
        break;
      case "png":
      case "jpg":
      case "jpeg":
      case "PNG":
      case "JPG":
      case "JPEG":
        return <><i className="fad fa-file-image fa-2x my-2 text-primary"></i></>
        break;
    }
    return <><i className="fad fa-file fa-2x my-2"></i></>
  }

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
        visible={isShowConfirmRemoveFile}
        closable={false}
        onFinish={() => {
          setIsShowConfirmRemoveFile(false)
          onRemoveFile()
        }}
        onClose={() => setIsShowConfirmRemoveFile(false)}
      >
        Please confirm to remove this file.
      </DialogConfirm>
      <section className="code-box-demo mt-10">
        <h5>
          <b>Please Insert Invoice Details and Attachment</b>
        </h5>
        <div
          className="ant-card ant-card-bordered mt-5"
          style={{
            width: "100%",
          }}
        >
          <div className="ant-card-body">
            <Form
              form={form}
              labelCol={24}
              wrapperCol={24}
              onValuesChange={(changedValues, allValues) => {
                let obj = allValues
                if(has(changedValues, 'invoiceDate')){
                  let paymentTerms = get(allValues, "paymentTerms");
                  let newDate = moment(get(allValues, 'invoiceDate'));
                  newDate = newDate.add(parseInt(paymentTerms), "days");
                  obj = {...obj, invoiceDueDate: newDate}
                }
                setSelectedData({ ...selectedData, step2: obj });
                if (get(allValues, "invNo") && get(allValues, "invoiceDate")) {
                  setCanNextStep(false);
                } else {
                  setCanNextStep(true);
                }
              }}
              layout="vertical"
            >
              <div className="ant-row" style={{ marginLeft: "-8px", marginRight: "-8px", rowGap: "0px" }}>
                <div className="ant-col ant-col-8" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                  <div className="ant-card">
                    <div className="ant-card-head">
                      <div className="ant-row-col-6" style={{ rowGap: "0px" }}>
                        <div className="ant-col">
                          <Form.Item
                            name="invNo"
                            label={
                              <>
                                Invoice No. <a style={{ color: "red" }}>*</a>
                              </>
                            }
                          >
                            <Input
                              onKeyDown={(e) => {
                                if (["Space", " "].includes(e.key)) {
                                  return e.preventDefault();
                                }
                              }}
                              maxLength={20}
                            />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item name="paymentTerms" label={<>Payment Term (Days)</>}>
                            <Input disabled={true} />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item
                            name="invoiceDate"
                            label={
                              <>
                                Invoice Date <a style={{ color: "red" }}>*</a>
                              </>
                            }
                          >
                            <DatePicker
                              format="DD-MM-YYYY"
                              dateRender={(current) => (
                                <div className="ant-picker-cell-inner" title={moment(current, "YYYY-MM-DD").format("DD-MM-YYYY")}>
                                  {current.date()}
                                </div>
                              )}
                              disabledDate={(current) => moment().subtract(0, 'days') < current }
                              onChange={(val) => {
                                if (val == null) {
                                  form.setFieldsValue({ invoiceDueDate: null, invoiceDate: null });
                                  return;
                                }

                                let paymentTerms = form.getFieldValue("paymentTerms");
                                let newDate = moment(val);
                                newDate.add(parseInt(paymentTerms), "days");
                                form.setFieldsValue({ invoiceDate: val, invoiceDueDate: newDate });
                              }}
                            />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item
                            name="invoiceDueDate"
                            label={
                              <>
                                Invoice Due Date <a style={{ color: "red" }}>*</a>
                              </>
                            }
                          >
                            <DatePicker disabled={true}
                              format="DD-MM-YYYY" />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item name="itemCode" label={<>VIN No</>}>
                            <Input disabled={true} />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item name="note" label={<>Note</>}>
                            <Input />
                          </Form.Item>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="ant-col ant-col-8" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                  <div className="ant-card mt-8">
                    <div className="ant-card-body">
                      <p style={{ margin: "-35px 0 7px" }}>Invoice Upload File and Attachment</p>
                      <Dragger {...props}>
                        <p className="ant-upload-drag-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="60" height="76" viewBox="0 0 60 76">
                            <g id="surface1" transform="translate(-0.5)">
                              <path id="Path_8591" data-name="Path 8591" d="M41.311.587A1.829,1.829,0,0,0,39.994,0H10.451A10.011,10.011,0,0,0,.5,9.968V66.031A10.011,10.011,0,0,0,10.451,76h40.1A10.011,10.011,0,0,0,60.5,66.031V21.515a1.979,1.979,0,0,0-.53-1.285Zm.53,5.893L54.336,19.642H46.214a4.364,4.364,0,0,1-4.372-4.369Zm8.707,65.848h-40.1a6.347,6.347,0,0,1-6.293-6.3V9.968a6.347,6.347,0,0,1,6.293-6.3H38.183v11.6a8.017,8.017,0,0,0,8.031,8.041H56.841V66.031A6.335,6.335,0,0,1,50.549,72.328Zm0,0" transform="translate(0 0)" fill="#84a5e1"/>
                              <path id="Path_8592" data-name="Path 8592" d="M123.446,401.934H91.135a1.681,1.681,0,1,0,0,3.314h32.331a1.682,1.682,0,1,0-.02-3.314Zm0,0" transform="translate(-76.792 -341.976)" fill="#84a5e1"/>
                              <path id="Path_8593" data-name="Path 8593" d="M121.278,183.5l6.826-7.34v18.093a1.657,1.657,0,1,0,3.314,0V176.162l6.826,7.34a1.653,1.653,0,0,0,2.419-2.253l-9.709-10.422a1.645,1.645,0,0,0-2.419,0l-9.709,10.422a1.651,1.651,0,0,0,.083,2.336A1.691,1.691,0,0,0,121.278,183.5Zm0,0" transform="translate(-99.264 -143.55)" fill="#84a5e1"/>
                            </g>
                          </svg>
                        </p>
                        <p className="ant-upload-text bold grey">Drag &amp; Drop to Upload File</p>
                        <p className="ant-upload-text bold grey">or</p>
                        <p className="ant-upload-hint">
                          <a className="btn btn-blue-transparent btn-auto-width">Browse File</a>
                        </p>
                      </Dragger>
                      <div class="font-size-10 mt-1">Maximum file upload size 1 MB per file,Support file type PDF, JPG</div>
                    </div>
                  </div>
                </div>
                <div className="ant-col ant-col-8" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                  <div className="ant-card mt-8">
                    <div className="ant-card-body">
                      <p style={{ margin: "-35px 0 7px" }}>Select File</p>
                      <div className="ant-card ant-card-bordered p-5">
                        <p>Attachment</p>
                        <p class="font-size-10" style={{ marginTop: "-15px" }}>
                          Maximum file upload 5 files,Support file type PDF, JPG
                        </p>

                        <List>
                          {fileLists.map((r, i) => {
                            return (
                              <List.Item key={i}>
                                <div>
                                  {fileIcon(r.name)}
                                </div>
                                <div class="ant-list-item-meta" style={{ overflow : "hidden", textOverflow : "ellipsis", paddingRight : "10px", lineBreak : "anywhere" }}>
                                  <div style={{ padding: "15px" }}>{r.name}</div>
                                </div>
                                <div style={{ paddingRight: "10px" }}>{(r.size / 1024).toFixed(2)}K</div>
                                <div>
                                  <a
                                    onClick={() => {
                                      setIsShowConfirmRemoveFile(true)
                                      setRemoveFileIndex(i)
                                    }}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                      <defs>
                                        <filter id="Rectangle_1521" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
                                          <feOffset dy="3" input="SourceAlpha"/>
                                          <feGaussianBlur stdDeviation="3" result="blur"/>
                                          <feFlood flood-color="#ccc"/>
                                          <feComposite operator="in" in2="blur"/>
                                          <feComposite in="SourceGraphic"/>
                                        </filter>
                                      </defs>
                                      <g id="Component_12_384" data-name="Component 12 – 384" transform="translate(9 6)">
                                        <g transform="matrix(1, 0, 0, 1, -9, -6)" filter="url(#Rectangle_1521)">
                                          <g id="Rectangle_1521-2" data-name="Rectangle 1521" transform="translate(9 6)" fill="#fff" stroke="#fff" stroke-width="1">
                                            <rect width="30" height="30" rx="15" stroke="none"/>
                                            <rect x="0.5" y="0.5" width="29" height="29" rx="14.5" fill="none"/>
                                          </g>
                                        </g>
                                        <g id="Group_6745" data-name="Group 6745" transform="translate(11 11)">
                                          <path id="Path_655" data-name="Path 655" d="M25.137,27.364l8,8" transform="translate(-25.137 -27.364)" fill="none" stroke="#c12c20" stroke-linecap="round" stroke-width="3"/>
                                          <path id="Path_656" data-name="Path 656" d="M0,0,8,8" transform="translate(0 8) rotate(-90)" fill="none" stroke="#c12c20" stroke-linecap="round" stroke-width="3"/>
                                        </g>
                                      </g>
                                    </svg>
                                  </a>
                                </div>
                              </List.Item>
                            );
                          })}
                        </List>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Form>
          </div>
        </div>
      </section>
      <hr className="line-blue mt-10" />
      <div className="ant-row ant-form-item mt-10">
        <div className="ant-col ant-form-item-control">
          <div className="ant-form-item-control-input">
            <div className="ant-form-item-control-input-content">
              <div className="row justify-content-md-center">
                <button
                  disabled={canNextStep}
                  type="button"
                  className="btn btn-blue btn-auto-width"
                  onClick={() => {
                    getToNextStep();
                  }}
                >
                  <span>Next</span>
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
export default InvoiceFormStep2;
