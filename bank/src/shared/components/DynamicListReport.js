import SearchBox from "@/shared/components/SearchBox";
import TableColumnDisplay from "@/shared/components/TableColumnDisplay";
import { Table, Tooltip, Breadcrumb, Tabs, Descriptions, Collapse } from "antd";
import { Button, DropdownButton, Dropdown, Tab, TabPane } from "react-bootstrap";
import { get, isEmpty } from "lodash";
import { StoreContext } from "@/context/store";
import { useRouter } from "next/router";
import { B2PAPI } from "@/context/api";
import { useEffect, useContext, useState } from "react";
import Link from "next/link";

const DynamicListReport = (props) => {
  const { viewModel, columnsSummary, columnsDetail, indexCurrency, indexsumBaseAmount, indexSumNetAmount, indexSumVatAmount, indexSumWhtAmountIn, indexSumWhtAmountOut } = props;
  // const {columns , dataSource} = props;
  const { TabPane } = Tabs;
  const { Panel } = Collapse;
  const [tabActive, setTabActive] = useState("summaryTable");

  const tableHeaderAction = get(props, "onHeaderAction", () => { });
  const onSearchReset = get(props, "onSearchReset", () => { });
  const onSearchSubmit = get(props, "onSearchSubmit", () => { });
  const searchList = get(props, "searchList", []);
  const disabledDate = get(props, "disabledDate", "3653");
  // console.log("disabledDate", disabledDate);
  const sortListSummary = get(props, "sortListSummary", []);
  const sortListDetail = get(props, "sortListDetail", []);
  const rowSelection = get(props, "rowSelection", false);
  const pagination = get(props, "pagination", false);
  const OnTableColumnSummaryDisplayChange = get(props, "OnTableColumnSummaryDisplayChange", () => { });
  const OnTableColumnDetailDisplayChange = get(props, "OnTableColumnDetailDisplayChange", () => { });
  const handleTableSummaryChange = get(props, "handleTableSummaryChange", () => { });
  const handleTableDetailChange = get(props, "handleTableDetailChange", () => { });

  const columnDisplaySummary = get(props, "columnDisplaySummary", false);
  const columnDisplayDetail = get(props, "columnDisplayDetail", false);
  const flagShowTotalAmountDetail = get(props, "flagShowTotalAmountDetail", false);
  const totalAmtDetail = get(props, "totalAmtDetail", []);

  const isPaymentReportPage = get(props, "isPaymentReportPage", false);

  const totalAmountDetailListModel = get(props, "totalAmountDetailListModel", []);

  const currency = get(props, "currency", []);
  const sumBaseAmount = get(props, "sumBaseAmount", []);
  const sumNetAmount = get(props, "sumNetAmount", []);
  const sumVatAmount = get(props, "sumVatAmount", []);
  const sumWhtAmountIn = get(props, "sumWhtAmountIn", []);
  const sumWhtAmountOut = get(props, "sumWhtAmountOut", []);

  const selectedRowKeys = get(props, "selectedRowKeys", () => { });

  const dataSourceSummary = get(props, "dataSourceSummary", []);
  const dataSourceDetail = get(props, "dataSourceDetail", []);

  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow, setTabReport } = useContext(StoreContext);

  if (isPaymentReportPage) {
    dataSourceSummary.forEach((items, index) => {
      const summaryTablebyIndex = dataSourceSummary[index].summaryTable;
      if (!(summaryTablebyIndex[summaryTablebyIndex.length - 1].netAmount.type == "b")) {
        dataSourceSummary[index].summaryTable.push({
          supplierReferenceCode: <b>Total Transaction(s) &nbsp;&nbsp;&nbsp; {items.totalTransaction}</b>,
          netAmount: <b>Total Amount &nbsp;&nbsp;&nbsp; {items.totalAmount}</b>,
          currencyCode: <b>{items.currencyCodeGroup}</b>,
        });
      }
    });
  }

  const doExportData = async (config) => {
    try {
      if (!get(config, "exportApi")) {
        return showAlertDialog({
          title: "Setting is not valid.",
          text: "Please contact system engineer.",
        });
      }
      showLoading("Exporting " + get(config, "label"));
      console.log(pagination);

      let params = {
        page: pagination.current,
        pageSize: pagination.pageSize,
        searchList,
        sortList: tabActive == "summaryTable" ? sortListSummary : sortListDetail,
      };
      let download = await AppApi.getApi(get(config, "exportApi"), params, {
        method: "post",
        responseType: "blob",
        authorized: true,
        ...get(config, "actionHeaders", {}),
        onDownloadProgress: (progressEvent) => {
          let percentCompleted = parseFloat((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
          //console.log(progressEvent)
          showLoading("Downloading " + get(config, "label") + " " + percentCompleted + "%");
          if (percentCompleted == "100.00") {
            showLoading("Downloading "+get(config,"label") + " " + "100.00%");
            showLoading("Requesting " + get(config, "label"));
          }
        },
        onUploadProgress: (progressEvent) => {
          let percentCompleted = parseFloat((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
          showLoading("Exporting " + get(config, "label"))
        },
      });
      if (download.status == 200) {
        const headerLine = download.headers["content-disposition"];
        let filename;
        if (headerLine) {
          filename = headerLine.split(";")[1].split("=")[1].replace('"', "").replace('"', "");
        } else {
          filename = moment().format("YYYYMMDD") + "-export." + get(config, "label").toLowerCase();
        }
        const type = download.headers["content-type"];
        const url = window.URL.createObjectURL(
          // new Blob([get(download,"data")]),
          new File([get(download, "data")], filename, { type })
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        showAlertDialog({
          title: get(download, "data.error", "Download Failed"),
          text: get(download, "data.message", "") + " Please Contact Administrator.",
          icon: "error",
        });
      }
      hideLoading();
    } catch (err) {
      hideLoading();
      console.log(err);
    }
  };

  const onChangeTab = (key) => {
    setTabActive(key);
    setTabReport(key); // ---- variable context -----
  };

  const arrayIndex = [];
  if (indexsumBaseAmount != 0) {
    arrayIndex.push(indexsumBaseAmount);
  }
  if (indexSumVatAmount != 0) {
    arrayIndex.push(indexSumVatAmount);
  }
  if (indexSumWhtAmountOut != 0) {
    arrayIndex.push(indexSumWhtAmountOut);
  }
  if (indexSumWhtAmountIn != 0) {
    arrayIndex.push(indexSumWhtAmountIn);
  }
  if (indexSumNetAmount != 0) {
    arrayIndex.push(indexSumNetAmount);
  }
  if (indexCurrency != 0) {
    arrayIndex.push(indexCurrency);
  }

  const firstIndex = Math.min(...arrayIndex);

  const totalRow = Math.max(currency.length, sumBaseAmount.length, sumNetAmount.length,
    sumVatAmount.length, sumWhtAmountIn.length, sumWhtAmountOut.length)

  return (
    <>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 my-3">
            <Breadcrumb separator=">">
              {get(viewModel, "breadcrumb", false) ? (
                get(viewModel, "breadcrumb", []).map((a,i) => {
                  if (get(a, "href", "")) {
                    return (
                      <Breadcrumb.Item key={i}>
                        <Link href={get(a, "href", "")}>
                          <a>{get(a, "label", "")}</a>
                        </Link>
                      </Breadcrumb.Item>
                    );
                  } else {
                    return <Breadcrumb.Item key={i}>{get(a, "label", "")}</Breadcrumb.Item>;
                  }
                })
              ) : (
                <>
                  <Breadcrumb.Item>
                    <a>{get(viewModel, "title", "")}</a>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb>
          </div>
        </div>
      </div>

      {get(viewModel, "search", []).length > 0 ? (
        <SearchBox {...viewModel} onReset={onSearchReset} onFinish={onSearchSubmit} defaultValues={searchList} disabledDate={disabledDate}></SearchBox>
      ) : (
        <></>
      )}
      <section id="page-content" className="mt-5 px-10">
        <div id="controls" className="d-flex align-items-center mb-4">
          {get(viewModel, "table.tableHeaderAction", []) ? (
            get(viewModel, "table.tableHeaderAction", [])
              .filter((r) => r.position != "R")
              .sort((a, b) => get(a, "seq", 1) - get(b, "seq", 1))
              .map((r) => {
                if (get(r, "visible", true) == false) {
                  return <></>;
                }
                let isNotAllow = get(r, "roles") ? Object.keys(get(r, "roles", {})).filter((mcode) => isAllow(mcode, get(r, "roles." + mcode, []))) : false;
                if (!isNotAllow) {
                  return (
                    <Button
                      onClick={() => {
                        tableHeaderAction(get(r, "action", ""), r);
                      }}
                      htmlType={get(r, "type", "button")}
                      disabled={selectedRowKeys.length == 0}
                      className={"btn mr-3 " + get(r, "btnClass", "btn-blue")}
                    >
                      {get(r, "label", "Button")}
                    </Button>
                  );
                } else {
                  return <></>;
                }
              })
          ) : (
            <></>
          )}

          {get(viewModel, "table.tableHeaderAction", []) ? (
            get(viewModel, "table.tableHeaderAction", [])
              .filter((r) => r.position == "R")
              .sort((a, b) => get(a, "seq", 1) - get(b, "seq", 1))
              .map((r) => {
                if (get(r, "visible", true) == false) {
                  return <></>;
                }
                let isNotAllow = get(r, "roles") ? Object.keys(get(r, "roles", {})).filter((mcode) => isAllow(mcode, get(r, "roles." + mcode, []))) : false;
                if (!isNotAllow) {
                  return (
                    <Button
                      onClick={() => {
                        tableHeaderAction(get(r, "action", ""), r);
                      }}
                      htmlType={get(r, "type", "button")}
                      disabled={selectedRowKeys.length == 0}
                      className={"btn mx-3 ml-auto " + get(r, "btnClass", "btn-blue")}
                    >
                      {get(r, "label", "Button")}
                    </Button>
                  );
                } else {
                  return <></>;
                }
              })
          ) : (
            <></>
          )}
          {columnDisplaySummary && tabActive == "summaryTable" ? (
            <TableColumnDisplay
              get={get(columnDisplaySummary, "get")}
              set={get(columnDisplaySummary, "set")}
              default={get(columnDisplaySummary, "default")}
              current={columnsSummary}
              onChange={get(columnDisplaySummary, "onChange")}
              onReset={get(columnDisplaySummary, "onReset")}
              hasRightButton={get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter((r) => r.position == "R" && r.visible == true).length != 0 : false}
            />
          ) : columnDisplayDetail && tabActive == "detailTable" ? (
            <TableColumnDisplay
              get={get(columnDisplayDetail, "get")}
              set={get(columnDisplayDetail, "set")}
              default={get(columnDisplayDetail, "default")}
              current={columnsDetail}
              onChange={get(columnDisplayDetail, "onChange")}
              onReset={get(columnDisplayDetail, "onReset")}
              hasRightButton={get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter((r) => r.position == "R" && r.visible == true).length != 0 : false}
            />
          ) : (
            <>
              <span
                className={
                  (get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter((r) => r.position == "R" && r.visible == true).length != 0 : false)
                    ? "d-inline"
                    : "mx-3 ml-auto"
                }
              ></span>
            </>
          )}

          {get(viewModel, "export") ? (
            <div className="btnExport d-flex">
              <div className="controls col-12 px-0">
                {get(viewModel, "export").length > 0 &&
                  get(viewModel, "export").map((exportBtn, index) => {
                    if (get(exportBtn, "tableKey", "summaryTable") == tabActive) {
                      return (
                        <Button
                          variant={get(get(viewModel, "export")[index], "buttonColor", "default")}
                          shape="round"
                          size={get(get(viewModel, "export")[index], "buttonSize", "md")}
                          className={"mx-2 btn-blue-transparent" + get(get(viewModel, "export")[index], "class", "")}
                          onClick={() => doExportData(get(viewModel, "export")[index])}
                          dangerouslySetInnerHTML={{ __html: get(get(viewModel, "export")[index], "icon", "") + " Export to " + get(get(viewModel, "export")[index], "label", "") }}
                        />
                      );
                    }
                  })}
              </div>
            </div>
          ) : (
            <></>
          )}
        </div>

        <Tabs defaultActiveKey="summaryTable" type="card" onChange={onChangeTab}>
          {/*  ------------------------ Tab Summary ------------------- */}
          <TabPane tab="Summary" key="summaryTable">
            {dataSourceSummary.length > 0 ? (
              dataSourceSummary.map((data, index) => (
                <div className="mt-5 my-5 ml-3 mr-3">
                  <Collapse
                    key={index}
                    // defaultActiveKey={['1']}
                    expandIconPosition="right"
                    ghost
                    expandIcon={({ isActive }) =>
                      isActive ? (
                        <span className="collapsePayment">
                          <i className="fas fa-chevron-up blue"></i>
                        </span>
                      ) : (
                        <span className="collapsePayment">
                          <i className="fas fa-chevron-down blue"></i>
                        </span>
                      )
                    }
                  >
                    {/*  ------------------------ Descriptions paymentMethod & accountNo ------------------- */}
                    <Panel
                      header={
                        <div className="row col-13" style={{ alignItems: "center", marginTop: "1.5%" }}>
                          <div className="col-9">
                            <Descriptions colon={true} labelStyle={{ fontWeight: "bold", marginRight: "1%" }}>
                              {get(data, "paymentMethod", "") !== "" && <Descriptions.Item label="Payment Method">{get(data, "paymentMethod", "-")}</Descriptions.Item>}
                              {get(data, "accountNo", "") !== "" && <Descriptions.Item label="TLT Account No.">{get(data, "accountNo", "-")}</Descriptions.Item>}
                            </Descriptions>
                          </div>

                          <div className="col ml-auto">
                            <Descriptions colon={true} labelStyle={{ marginRight: "1%" }}>
                              {get(data, "totalAmount", "") != "" && get(data, "totalAmount", "") != [] ? (
                                <Descriptions.Item label="Total Amount" style={{ fontWeight: "bold" }}>
                                  {get(data, "totalAmount", "-")}{" "}{get(data, "currencyCodeGroup", "THB")}
                                </Descriptions.Item>
                              ) : (
                                <Descriptions.Item label="Total Amount" style={{ fontWeight: "bold" }}>
                                  -
                                </Descriptions.Item>
                              )}
                            </Descriptions>
                          </div>
                        </div>
                      }
                      key={index}
                      style={{
                        boxShadow: "0px 1px 10px 0px #cccccc",
                        WebkitBorderRadius: "20px",
                      }}
                    >
                      {/*  ------------------------ end ------------------- */}
                      <Table
                        // rowSelection={rowSelection ? { ...rowSelection, selectedRowKeys } : false}
                        onChange={handleTableSummaryChange}
                        columns={columnsSummary}
                        dataSource={get(data, "summaryTable", [])}
                        className="table-x mb-10"
                        scroll={{ x: 500 }}
                        pagination={false}
                      ></Table>
                    </Panel>
                  </Collapse>
                </div>
              ))
            ) : (
              <div className="mt-5 my-5 ml-3 mr-3">
                <Collapse
                  // defaultActiveKey={['1']}
                  expandIconPosition="right"
                  ghost
                  expandIcon={({ isActive }) =>
                    isActive ? (
                      <span className="collapsePayment">
                        <i className="fas fa-chevron-up blue"></i>
                      </span>
                    ) : (
                      <span className="collapsePayment">
                        <i className="fas fa-chevron-down blue"></i>
                      </span>
                    )
                  }
                >
                  <Panel
                    header={
                      <Descriptions colon={true} labelStyle={{ fontWeight: "bold", marginRight: "1%" }}>
                        {isPaymentReportPage && <Descriptions.Item label="Payment Method"> - </Descriptions.Item>}
                        <Descriptions.Item label="TLT Account No."> - </Descriptions.Item>
                      </Descriptions>
                    }
                    style={{
                      boxShadow: "0px 1px 10px 0px #cccccc",
                      WebkitBorderRadius: "20px",
                    }}
                  >
                    <Table columns={columnsSummary} dataSource={[]} className="table-x mb-10" scroll={{ x: 500 }} pagination={false} />
                  </Panel>
                </Collapse>
              </div>
            )}
          </TabPane>

          {/*  ------------------------ Tab Detail ------------------- */}
          <TabPane tab="Details" key="detailTable">
            <Table
              // rowSelection={rowSelection ? { ...rowSelection, selectedRowKeys } : false}
              onChange={handleTableDetailChange}
              columns={columnsDetail}
              dataSource={dataSourceDetail}
              pagination={pagination}
              className="table-x"
              scroll={{ x: 500 }}
              summary={(pageData) =>
                flagShowTotalAmountDetail && (!isEmpty(totalAmtDetail) || !isEmpty(sumNetAmount)) ? (
                  <Table.Summary fixed="bottom">
                    {totalAmtDetail.length > 0 &&
                      totalAmtDetail.map((total) => (
                        <Table.Summary.Row>
                          {columnsDetail.length > 0 &&
                            columnsDetail.map((col, index) => {
                              if (get(col, "dataIndex", "") == "currencyCode") {
                                return (
                                  <Table.Summary.Cell>
                                    <div><b>{get(total, "currencyCode", "THB")}</b></div>
                                  </Table.Summary.Cell>
                                );
                              }

                              if (get(col, "dataIndex", "") == "additionalReference1") {
                                return (
                                  <Table.Summary.Cell className="text-right">
                                    <b>Total Amount &nbsp;&nbsp;&nbsp; {get(total, "amount", null)}</b>
                                  </Table.Summary.Cell>
                                );
                              }

                              return <Table.Summary.Cell key={index} />;
                            })}
                        </Table.Summary.Row>
                      ))}

                    {isPaymentReportPage ? (
                      totalAmountDetailListModel.map((item, indexTotal) => {
                        return (
                          <Table.Summary.Row style={{ textAlign: "right" }}>
                            <Table.Summary.Cell colSpan={firstIndex - 1}>
                              <b>Total Amount</b>
                            </Table.Summary.Cell>

                            {
                              columnsDetail.map((items, index) => {
                                if (indexsumBaseAmount - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell>
                                      <b>{sumBaseAmount[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else if (indexSumVatAmount - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell>
                                      <b>{sumVatAmount[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else if (indexSumWhtAmountOut - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell>
                                      <b>{sumWhtAmountOut[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else if (indexSumWhtAmountIn - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell>
                                      <b>{sumWhtAmountIn[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else if (indexSumNetAmount - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell>
                                      <b>{sumNetAmount[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else if (indexCurrency - firstIndex == index) {
                                  return (
                                    <Table.Summary.Cell className="text-left">
                                      <b>{currency[indexTotal]}</b>
                                    </Table.Summary.Cell>
                                  );
                                } else {
                                  return <Table.Summary.Cell />;
                                }
                              })
                            }
                          </Table.Summary.Row>
                        )
                      })
                    )
                      : ""}
                  </Table.Summary>

                )
                  : (
                    <></>
                  )
              }
            ></Table>
          </TabPane>
        </Tabs>
      </section>
    </>
  );
};

const ExportItem = ({ r }) => {
  return (
    <div>
      {get(r, "icon") ? (
        <>
          <span dangerouslySetInnerHTML={{ __html: get(r, "icon", "").replace(/\\/g, "") }}></span> {` `}
        </>
      ) : (
        <></>
      )}
      {get(r, "label")}
    </div>
  );
};
export default DynamicListReport;
