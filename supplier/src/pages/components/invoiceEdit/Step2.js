import ErrorHandle from "@/shared/components/ErrorHandle";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter, size, difference, last, split, differenceBy, has } from "lodash";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input, Steps, Space, Upload, message, List, Progress, DatePicker } from "antd";

import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
import DialogReason from "@/shared/components/DialogReason";
import DialogConfirm from "@/shared/components/DialogConfirm";
import router from "next/router";
const InvoiceFormStep2 = ({ form, api, selectedData, setSelectedData, setStep, fileLists, setFileLists, showLoading, hideLoading, forceLogin, showAlertDialog, attachmentsDel, setAttachmentDel }) => {

  const [handleBackModal, setHandleBackModalShow] = useState(false);
  const handleBackModalClose = () => setHandleBackModalShow(false);
  const handleBackModalShow = () => {
    setHandleBackModalShow(true);
  };

  const [isShowConfirmRemoveFile, setIsShowConfirmRemoveFile] = useState(false)
  const [removeFileIndex, setRemoveFileIndex] = useState(undefined)

  const [handleCloseModal, setHandleCloseModalShow] = useState(false);
  const handleCloseModalClose = () => setHandleCloseModalShow(false);
  const handleCloseModalShow = () => {
    setHandleCloseModalShow(true);
  };

  const fileIcon = (name) => {
    console.log("name", name)
    switch(last(split(name, '.'))){
      case "pdf":
        return <><i className="fad fa-file-pdf fa-2x my-2 text-danger"></i></>
        break;
      case "csv":
        return <><i className="fad fa-file-csv fa-2x my-2 text-success"></i></>
        break;
      case "png":
      case "jpg":
      case "jpeg":
        return <><i className="fad fa-file-image fa-2x my-2 text-primary"></i></>
        break;
    }
    return <><i className="fad fa-file fa-2x my-2"></i></>
  }

  const onRemoveFile = () => {
    const index = removeFileIndex
    if(!has(get(fileLists, index), 'name')){
      console.log("[...attachmentsDel, get(fileLists, index)]",[...attachmentsDel, get(fileLists, index)])
      setAttachmentDel([...attachmentsDel, get(fileLists, index)])
    }
    const newFileList = fileLists.filter((f, i) => i !== index);
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
        Please confirm to close Edit Invoice.
        <br />
        If you close, all data will be cleared.
      </DialogConfirm>
      <DialogConfirm
        visible={handleBackModal}
        closable={false}
        onFinish={() => {
          handleBackModalClose();
          setStep(1)
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
                            <Input disabled />
                          </Form.Item>
                        </div>
                        <div className="ant-col">
                          <Form.Item name="paymentTerms" label={<>Payment Term (Days)</>}>
                            <Input className="text-center" disabled={true} />
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
                            <Input disabled />
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
                            <Input disabled />
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
                          <i class="fal fa-file-upload fa-4x text-primary"></i>
                        </p>
                        <p className="ant-upload-text">Drag &amp; Drop to Upload File</p>
                        <p className="ant-upload-text">OR</p>
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
                                  {fileIcon(has(r,'name') ? r.name : r)}
                                </div>
                                <div class="ant-list-item-meta" style={{ overflow : "hidden", textOverflow : "ellipsis", paddingRight : "10px", lineBreak : "anywhere" }}>
                                  <div style={{ padding: "15px" }}>{r.name || r}</div>
                                </div>
                                {has(r,'size') ? <div style={{ paddingRight: "10px" }}>{(r.size / 1024).toFixed(2)}K</div> : <></>}
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
                  type="button"
                  className="btn btn-blue btn-auto-width"
                  onClick={() => {
                    setStep(3)
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
