import { useState, useContext } from "react";
import { Upload, List, Progress } from "antd";
import { get, size, filter, difference, last, split, isEmpty, differenceBy } from "lodash";
import { StoreContext } from "@/context/store";
import DialogConfirm from "@/shared/components/DialogConfirm";

const { Dragger } = Upload;

const Step1 = ({ uploadFileList, setUploadFileList }) => {
  const { showAlertDialog } = useContext(StoreContext);
  const [isShowConfirmRemoveFile, setIsShowConfirmRemoveFile] = useState(false)
  const [removeFileObj, setRemoveFileObj] = useState({})

  const isCSVFile = (file) => {
    const fileArr = split(get(file, "name"), '.');
    return last(fileArr) === "csv" || last(fileArr) === "CSV";
  };

  const onRemoveFile = () => {
    const position = get(removeFileObj, 'position');
    const index = get(removeFileObj, 'index');

    let newFileList;
    let csvFileList = uploadFileList.filter((f, i) => isCSVFile(f));
    let otherFileList = uploadFileList.filter((f, i) => !isCSVFile(f));

    if (position === "csv") {
      csvFileList = csvFileList.filter((f, i) => i !== index);
    } else {
      otherFileList = otherFileList.filter((f, i) => i !== index);
    }

    newFileList = [...csvFileList, ...otherFileList];
    setUploadFileList(newFileList);
  };

  const onFileChange = (fileList) => {
    let newFileList = [];
    let availableFile = [];
    let newDropFile = differenceBy(fileList, uploadFileList, 'name');
    let diff = difference(fileList, uploadFileList)

    if(size(diff) !== size(newDropFile)){
      showAlertDialog({
        text : "Attachment exceeded duplicate file."
      });
    }

    if (size(newDropFile) > 0) {
      // check csv is exist in list
      const isCSV = filter(uploadFileList, (f) => isCSVFile(f));

      // check scv is dupplicate
      let csvFile = filter(newDropFile, (f) => isCSVFile(f));
      let otherFile = filter(newDropFile, (f) => !isCSVFile(f));
      let otherExistFile = filter(uploadFileList, (f) => !isCSVFile(f));
      if (size(otherExistFile) <= 5){
        if (size([...otherFile, ...otherExistFile]) > 5) {
          showAlertDialog({
            text : "Attachment exceeded maximum number limit of file (5)."
          });
        }
        let avb = 5 - size(otherExistFile)
        otherFile = filter(otherFile, (f,i) => i+1 <= avb)

      } else {
        otherFile = []
      }

      if (size(csvFile) > 1) {
        // select only one csv file
        csvFile = [csvFile[0]];
        showAlertDialog({
          text : "Tax Invoice File exceeded maximum number limit of file (1)."
        });
        newDropFile = [...otherFile, ...csvFile];
      }

      if (size(isCSV) > 0) {
        // has CSV file

        if(size(csvFile) > 0) {
          showAlertDialog({
            text : "Tax Invoice File exceeded maximum number limit of file (1)."
          });
        }

        // remove CSV in new selected file list
        newFileList = otherFile;
      } else {
        newFileList = [...otherFile, ...csvFile];
      }
    }

    newFileList = [...uploadFileList, ...newFileList];

    const allowFileType = ["pdf", "PDF", "jpeg", "JPEG", "JPG", "jpg", "csv", "CSV"];
    if (size(fileList) > 0) {
      const supportFileType = filter(newFileList, (f) => allowFileType.includes(last(split(get(f, "name"), '.'))));
      const unSupportFileType = filter(newFileList, (f) => !allowFileType.includes(last(split(get(f, "name"), '.'))));
      const fitFileSize = filter(supportFileType, (f) => get(f, "size") <= 1024 * 1024);
      const overFileSize = filter(supportFileType, (f) => get(f, "size") > 1024 * 1024);

      if(size(unSupportFileType) > 0){
        showAlertDialog({
          text : "Only Support file type CSV, PDF and JPG."
        });
      }

      if(size(overFileSize) > 0){
        if(!isEmpty(filter(overFileSize, (f) => isCSVFile(f)))){
          showAlertDialog({
            text : "Tax Invoice File exceeded maximum size limit of 1 MB."
          });
        } else {
          showAlertDialog({
            text : "Attachment exceeded maximum size limit of 1 MB."
          });
        }
      }

      availableFile = fitFileSize
    }

    setUploadFileList(availableFile);
  }

  const draggerProps = {
    multiple: true,
    showUploadList: false,
    // maxCount: 6,
    // accept: ".pdf,.jpg,.jpeg,.csv",
    onChange: ({ fileList }) => {
      onFileChange(fileList)
    },
    beforeUpload: () => {
      return false;
    },
    fileList: uploadFileList,
  };

  const fileIcon = (name) => {
    switch(last(split(name, '.'))){
      case "pdf":
      case "PDF":
        return <><i className="fad fa-file-pdf fa-2x my-2 text-danger"></i></>
        break;
      case "csv":
      case "CSV":
        return <><i className="fad fa-file-csv fa-2x my-2 text-success"></i></>
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
      <div className="ant-col-24">
        <h5>
          <b>Upload Files</b>
        </h5>
      </div>
      <section className="code-box-demo">
        <div className="ant-card ant-card-bordered mt-5" style={{ width: " 100%" }}>
          <div className="ant-card-body">
            <div className="ant-row justify-content-center" style={{ marginLeft: "-8px", marginRight: "-8px", rowGap: "0px" }}>
              <div className="ant-col ant-col-8" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                <div className="ant-card mt-8">
                  <div className="ant-card-body">
                    <p>Invoice Upload File and Attachment</p>
                    {/* <div className="ant-card ant-card-bordered-1"> */}
                      <div className="my-5">
                        <Dragger {...draggerProps}>
                          <p className="ant-upload-drag-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="76" viewBox="0 0 60 76">
                              <g id="surface1" transform="translate(-0.5)">
                                <path id="Path_8591" data-name="Path 8591" d="M41.311.587A1.829,1.829,0,0,0,39.994,0H10.451A10.011,10.011,0,0,0,.5,9.968V66.031A10.011,10.011,0,0,0,10.451,76h40.1A10.011,10.011,0,0,0,60.5,66.031V21.515a1.979,1.979,0,0,0-.53-1.285Zm.53,5.893L54.336,19.642H46.214a4.364,4.364,0,0,1-4.372-4.369Zm8.707,65.848h-40.1a6.347,6.347,0,0,1-6.293-6.3V9.968a6.347,6.347,0,0,1,6.293-6.3H38.183v11.6a8.017,8.017,0,0,0,8.031,8.041H56.841V66.031A6.335,6.335,0,0,1,50.549,72.328Zm0,0" transform="translate(0 0)" fill="#84a5e1"/>
                                <path id="Path_8592" data-name="Path 8592" d="M123.446,401.934H91.135a1.681,1.681,0,1,0,0,3.314h32.331a1.682,1.682,0,1,0-.02-3.314Zm0,0" transform="translate(-76.792 -341.976)" fill="#84a5e1"/>
                                <path id="Path_8593" data-name="Path 8593" d="M121.278,183.5l6.826-7.34v18.093a1.657,1.657,0,1,0,3.314,0V176.162l6.826,7.34a1.653,1.653,0,0,0,2.419-2.253l-9.709-10.422a1.645,1.645,0,0,0-2.419,0l-9.709,10.422a1.651,1.651,0,0,0,.083,2.336A1.691,1.691,0,0,0,121.278,183.5Zm0,0" transform="translate(-99.264 -143.55)" fill="#84a5e1"/>
                              </g>
                            </svg>
                          </p>
                          <p className="ant-upload-text">Drag &amp; Drop to Upload File</p>
                          <p className="ant-upload-text">or</p>
                          <p className="ant-upload-hint">
                            <a className="btn btn-blue-transparent btn-auto-width">Browse File</a>
                          </p>
                        </Dragger>
                      </div>
                    {/* </div> */}
                    <div className="font-size-10 mt-1">Maximum file upload size 1 MB per file</div>
                  </div>
                </div>
              </div>
              <div className="ant-col ant-col-10" style={{ paddingLeft: "8px", paddingRight: "8px" }}>
                <div className="ant-card mt-8">
                  <div className="ant-card-body">
                    <p>Select File</p>
                    <div className="ant-card ant-card-bordered">
                      <div className="ant-card-body">
                        <p>Tax Invoice File</p>
                        <p className="font-size-10" style={{ marginTop: "-15px" }}>
                        Only Support file type CSV
                      </p>
                        <List>
                        {size(uploadFileList) > 0 &&
                          uploadFileList
                            .filter((f) => isCSVFile(f))
                            .map((r, i) => {
                              return (
                                <List.Item key={i}>
                                  <div>
                                    {fileIcon(r.name)}
                                  </div>
                                  <div className="ant-list-item-meta" style={{ overflow : "hidden", textOverflow : "ellipsis", paddingRight : "10px", lineBreak : "anywhere" }}>

                                    <div style={{ padding: "15px" }}>{get(r, "name")}</div>
                                  </div>
                                  <div style={{ paddingRight: "10px" }}>{(get(r, "size") / 1024).toFixed(2)}K</div>
                                  <div>
                                  <a
                                      onClick={() => {
                                        setIsShowConfirmRemoveFile(true)
                                        setRemoveFileObj({position: "csv", index: i});
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                        <defs>
                                          <filter id="Rectangle_1521" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood floodColor="#ccc"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="Component_12_384" data-name="Component 12 – 384" transform="translate(9 6)">
                                          <g transform="matrix(1, 0, 0, 1, -9, -6)" filter="url(#Rectangle_1521)">
                                            <g id="Rectangle_1521-2" data-name="Rectangle 1521" transform="translate(9 6)" fill="#fff" stroke="#fff" strokeWidth="1">
                                              <rect width="30" height="30" rx="15" stroke="none"/>
                                              <rect x="0.5" y="0.5" width="29" height="29" rx="14.5" fill="none"/>
                                            </g>
                                          </g>
                                          <g id="Group_6745" data-name="Group 6745" transform="translate(11 11)">
                                            <path id="Path_655" data-name="Path 655" d="M25.137,27.364l8,8" transform="translate(-25.137 -27.364)" fill="none" stroke="#c12c20" strokeLinecap="round" strokeWidth="3"/>
                                            <path id="Path_656" data-name="Path 656" d="M0,0,8,8" transform="translate(0 8) rotate(-90)" fill="none" stroke="#c12c20" strokeLinecap="round" strokeWidth="3"/>
                                          </g>
                                        </g>
                                      </svg>
                                    </a>
                                  </div>
                                </List.Item>
                              );
                            })}
                      </List>
                        <p>Attachment</p>
                        <p className="font-size-10" style={{ marginTop: "-15px" }}>
                        Maximum file upload 5 files,Support file type PDF, JPG
                      </p>
                        <List>
                        {size(uploadFileList) > 0 &&
                          uploadFileList
                            .filter((f) => !isCSVFile(f))
                            .map((r, i) => {
                              return (
                                <List.Item key={i}>
                                  <div>
                                    {fileIcon(r.name)}
                                  </div>
                                  <div className="ant-list-item-meta" style={{ overflow : "hidden", textOverflow : "ellipsis", paddingRight : "10px", lineBreak : "anywhere" }}>
                                    {/* <Progress type="circle" percent={0} width={40} className="my-2" /> */}
                                    <div style={{ padding: "15px" }}>{get(r, "name")}</div>
                                  </div>
                                  <div style={{ paddingRight: "10px" }}>{(get(r, "size") / 1024).toFixed(2)}K</div>
                                  <div>
                                    <a
                                      onClick={() => {
                                        setIsShowConfirmRemoveFile(true)
                                        setRemoveFileObj({position: "oth", index: i});
                                      }}
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
                                        <defs>
                                          <filter id="Rectangle_1521" x="0" y="0" width="48" height="48" filterUnits="userSpaceOnUse">
                                            <feOffset dy="3" input="SourceAlpha"/>
                                            <feGaussianBlur stdDeviation="3" result="blur"/>
                                            <feFlood floodColor="#ccc"/>
                                            <feComposite operator="in" in2="blur"/>
                                            <feComposite in="SourceGraphic"/>
                                          </filter>
                                        </defs>
                                        <g id="Component_12_384" data-name="Component 12 – 384" transform="translate(9 6)">
                                          <g transform="matrix(1, 0, 0, 1, -9, -6)" filter="url(#Rectangle_1521)">
                                            <g id="Rectangle_1521-2" data-name="Rectangle 1521" transform="translate(9 6)" fill="#fff" stroke="#fff" strokeWidth="1">
                                              <rect width="30" height="30" rx="15" stroke="none"/>
                                              <rect x="0.5" y="0.5" width="29" height="29" rx="14.5" fill="none"/>
                                            </g>
                                          </g>
                                          <g id="Group_6745" data-name="Group 6745" transform="translate(11 11)">
                                            <path id="Path_655" data-name="Path 655" d="M25.137,27.364l8,8" transform="translate(-25.137 -27.364)" fill="none" stroke="#c12c20" strokeLinecap="round" strokeWidth="3"/>
                                            <path id="Path_656" data-name="Path 656" d="M0,0,8,8" transform="translate(0 8) rotate(-90)" fill="none" stroke="#c12c20" strokeLinecap="round" strokeWidth="3"/>
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
            </div>
          </div>
        </div>
      </section>
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
    </>
  );
};

export default Step1;
