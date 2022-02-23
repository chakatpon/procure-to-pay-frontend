import _, { get,set, isEmpty, forEach, filter } from "lodash";
const TablePurchaseInvoiceApproval = ({ model, data }) => {
  const valueFormat = (text,format) => {
    if(text=="" || text == null || text == undefined){
      text=="";
    }
    if(format=="currency"){
      if(text==""){
        return "";
      }
      text = parseFloat(text);
      if(Number.isNaN(text)){
        return "";
      }
      text = text.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
      return text ? text : "";

    }
    return text;

  }

  return (
    <>
      {typeof get(data,get(model,"dataTable","purchaseInvoiceList")) == "object" ? get(data,get(model,"dataTable","purchaseInvoiceList")).map(row => {
        return <div className="ant-table-wrapper mb-10">
        <div className="ant-spin-nested-loading">
          <div className="ant-spin-container">
            <div className="ant-table">
              <div className="ant-table-container">
                <div className="ant-table-content">
                <table className="text-dark" style={{tableLayout : "auto"}}>
              <colgroup>
              </colgroup>
              <thead className="ant-table-thead">
                <tr>
                  <th className="ant-table-cell text-left" id={get(row,"selectFlag") ? "" : "table-grey"} colspan="4">Purchase Invoice</th>
                </tr>
              </thead>
              <tbody className="ant-table-tbody">
                <tr data-row-key="1" className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell" width="230px">Settlement Party</td>
                  <td className="ant-table-cell text-right" width="250px">{get(row,"supplierName")}</td>
                  <td className="ant-table-cell" style={{paddingLeft: "200px !important"}}>Condition : {get(row,"paymentCondition")}</td>
                  <td className="ant-table-cell text-left">Channel : {get(row,"channel")}</td>
                </tr>
                <tr data-row-key="2" className="ant-table-row ant-table-row-level-0">
                  <td  id={get(row,"selectFlag") ? "" : "table-grey"} className="ant-table-cell" width="230px">Account Number</td>
                  <td  id={get(row,"selectFlag") ? "" : "table-grey"} className="ant-table-cell text-right" width="250px">{get(row,"receivingBankAccountNo")}</td>
                  <td  id={get(row,"selectFlag") ? "" : "table-grey"} className="ant-table-cell" style={{paddingLeft: "200px !important"}}>Bank Name : {get(row,"receivingBankName")}</td>
                  <td  id={get(row,"selectFlag") ? "" : "table-grey"} className="ant-table-cell text-center"></td>
                </tr>
                <tr data-row-key="3" className="ant-table-row ant-table-row-level-0">
                  <td className="ant-table-cell" width="230px">Net Amount to Pay</td>
                  <td className="ant-table-cell text-right">{valueFormat(get(row,"amount"),"currency")}</td>
                  <td className="ant-table-cell" style={{paddingLeft: "200px !important"}}>Payment Method : {get(row,"paymentMethod")}</td>
                  <td className="ant-table-cell text-right text-red"></td>
                </tr>
              </tbody>
            </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      }) : ""}
    </>
  );
};
export default TablePurchaseInvoiceApproval
