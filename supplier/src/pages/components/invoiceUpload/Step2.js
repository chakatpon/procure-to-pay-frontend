import { useState, useContext } from "react";
import { filter, get, map, size, join } from "lodash";
import moment from "moment";
import {Button} from 'antd'

import { StoreContext } from "@/context/store";
import { B2PAPI } from "@/context/api";

const formatDate = "DD-MM-YYYY"

const Step2 = ({ invoiceFileDetailResponse }) => {
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, forceLogin, showAlertDialog } = useContext(StoreContext);

  const [searchValue, setSearchValue] = useState("");

  const apiConfig = {
    exportFileFailedCSV: "/p2p/api/v1/export/filefail/csv"
  }

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
  };

  const handleExportFileFailedCSV = async() => {
    console.log("handleExportFileFailedCSV")

    showLoading("Exporting File Failed CSV");
    try {
      const download = await AppApi.getApi(get(apiConfig, "exportFileFailedCSV"), {fileName: get(invoiceFileDetailResponse, "fileName"), supplierCode: get(invoiceFileDetailResponse, "supplierCode"), supplierBranchCode: get(invoiceFileDetailResponse, "supplierBranchCode")}, { method: "post", authorized: true });
      if (get(download, "status", 500) == 200) {
        const headerLine = download.headers['content-disposition'];
        let filename;
        if(headerLine){
          filename = headerLine.split(';')[1].split('=')[1].replace('"', '').replace('"', '');

        }else{
          filename = moment().format("YYYYMMDD") +"-export."+get(config,"label").toLowerCase();
        }
        const type = download.headers['content-type']
        const url = window.URL.createObjectURL(
          new Blob([get(download,"data")]),
        );
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
          'download',
          filename,
        );
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        hideLoading()
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
    }
  }

  const resolveExportDisabled = () => {
    return size(filter(get(invoiceFileDetailResponse, "invoiceUploadFileDetailList"), inv => get(inv, 'ivudStatus') !== 'Success')) === 0
  }

  return (
    <>
      <div className="ant-row">
        <div className="ant-col-12">
          <h5>
            <b>Validation Result</b>
          </h5>
        </div>
        <div className="ant-col-12 text-right">
          Upload Date : <span> {moment().format(formatDate)} </span>
        </div>
      </div>
      <section className="code-box-demo">
        <div className="ant-card ant-card-bordered mt-5" style={{ width: "100%" }}>
          <div className="ant-card-body">
            <div className="ant-row rcorners bg-lightgrey mt-5" style={{rowGap: "0px;"}}>
              <div className="ant-col-8">
                <table className="ant-descriptions-item-content">
                  <tbody>
                    <tr>
                      <td width="50"></td>
                      <td className="text-left" width="100">Supplier Name</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "supplierName")}</td>
                    </tr>
                    <tr>
                      <td width="50"></td>
                      <td className="text-left" width="100">Buyer Name</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "buyerName", "-")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="ant-col-10">
                <table className="ant-descriptions-item-content">
                  <tbody>
                    <tr>
                      <td className="text-left" width="100">File Name</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "fileName", "-")}</td>
                    </tr>
                    <tr>
                      <td className="text-left" width="83">Attachment</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "attachmentList", "-")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="ant-col-6">
                <table className="ant-descriptions-item-content">
                  <tbody>
                    <tr>
                      <td className="text-left" width="200">Total Invoice Record Success</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "successRecord", "-")}</td>
                    </tr>
                    <tr>
                      <td className="text-left" width="200">Total Invoice Record Failed</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "errorRecord", "-")}</td>
                    </tr>
                    <tr>
                      <td className="text-left" width="200">Total Invoice Record</td>
                      <td className="text-right" style={{paddingRight: "10px"}} width="10">:</td>
                      <td className="text-left">{get(invoiceFileDetailResponse, "totalRecord", "-")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div className="d-flex mt-5 justify-content-end">
              <div className="search d-flex pl-5 mr-5">
                <input placeholder="Invoice No." className="input-search" type="text" onChange={handleSearch} />
                <div className="d-block align-self-center"><img src="/assets/media/svg/icons/General/Search.svg" alt="Search Icon"/></div>
              </div>
              <Button onClick={handleExportFileFailedCSV} id="btnColumnDisplay" className="btn btn-blue-transparent" disabled={resolveExportDisabled()} >
                {" "}
                Export File Failed
              </Button>
            </div>
            <div className="ant-table mt-5">
              <div className="ant-table-container">
                <div className="ant-table-content">
                  <table style={{ tableLayout: "auto" }}>
                    <thead className="ant-table-thead">
                      <tr>
                        <th className="ant-table-cell">No.</th>
                        <th className="ant-table-cell">Invoice No.</th>
                        <th className="ant-table-cell">Invoice Date</th>
                        <th className="ant-table-cell">VIN No.</th>
                        <th className="ant-table-cell">Status</th>
                        <th className="ant-table-cell">Message</th>
                      </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                      {size(get(invoiceFileDetailResponse, "invoiceUploadFileDetailList")) > 0 &&
                        map(
                          filter(
                            get(invoiceFileDetailResponse, "invoiceUploadFileDetailList"),
                            (ls) =>
                              get(ls, "ivudInoiveNo").indexOf(searchValue) > -1 ||
                              get(ls, "ivudInoiveDate").indexOf(searchValue) > -1 ||
                              get(ls, "ivudItemCode").indexOf(searchValue) > -1 ||
                              get(ls, "ivudStatus").indexOf(searchValue) > -1 ||
                              get(ls, "ivudMessage").indexOf(searchValue) > -1
                          ),
                          (rec, i) => (
                            <tr className="ant-table-row ant-table-row-level-0" key={i}>
                              <td className="ant-table-cell">{i + 1}</td>
                              <td className="ant-table-cell">{get(rec, "ivudInoiveNo") || "-"}</td>
                              <td className="ant-table-cell">{get(rec, "ivudInoiveDate") || "-"}</td>
                              <td className="ant-table-cell">{get(rec, "ivudItemCode") || "-"}</td>
                              <td className="ant-table-cell">{get(rec, "ivudStatus") || "-"}</td>
                              <td className="ant-table-cell">{get(rec, "ivudMessage") || "-"}</td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Step2;
