import _, { get, set, isEmpty, forEach, filter } from "lodash";
const TableLoanInformation = ({ model, data }) => {
  console.log("tableload dara : ", data);
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
      text = text.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
      return text ? text : "";
    }
    return text;
  };

  return (
    <>
      <div className="ant-row" style={{ rowGap: 0 }}>
        <div className="ant-col-10">
          <table className="ant-descriptions-item-content text-dark">
            <tbody>
              {/* <tr>
                        <th className="header-bbl" width="160">Loan Informations</th>
                      </tr> */}
              <tr>
                <td>วันนัดหมาย</td>
                <td width="30">:</td>
                <td className="text-left">{get(data, "loanInformation.itemDeliveryDate")}</td>
              </tr>
              <tr>
                <td>รุ่นรถยนต์</td>
                <td>:</td>
                <td className="text-left">{get(data, "loanInformation.itemDescription")}</td>
              </tr>
              <tr>
                <td>รหัสรุ่นรถยนต์</td>
                <td>:</td>
                <td className="text-left">
                  {get(
                    get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "modelCode"),
                    "0.value"
                  )}
                </td>
              </tr>
              <tr>
                <td>เลขตัวถังรถยนต์</td>
                <td>:</td>
                <td className="text-left">{get(data, "loanInformation.itemCode")}</td>
              </tr>
              <tr>
                <td>เลขเครื่องยนต์</td>
                <td>:</td>
                <td className="text-left">{get(data, "loanInformation.itemAddReference1")}</td>
              </tr>
              <tr>
                <td>ค่าเสนอเปิดสัญญาณ CAL</td>
                <td>:</td>
                <td className="text-left">
                  {get(
                    get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "calCredit"),
                    "0.value"
                  )}
                </td>
                <td className="text-right"></td>
              </tr>
              <tr>
                <td>ราคารถ</td>
                <td>:</td>
                <td className="text-left" width="200">{valueFormat(get(data, "loanInformation.itemUnitPrice"), "currency")} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; บาท</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="ant-col-2"></div>
        <div className="ant-col-10 mt-2">
          <table className="ant-descriptions-item-content text-dark">
            <tbody>
              <tr>
                <th>
                  <br />
                </th>
              </tr>
              <tr>
                <td width="100">ยอดเงินดาวน์</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {valueFormat(
                    get(
                      get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "downPayment"),
                      "0.value"
                    ),
                    "currency"
                  )}
                </td>
                <td className="text-right" width="40">
                  บาท
                </td>
              </tr>
              <tr>
                <td width="100">ค่าธรรมเนียม</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {valueFormat(
                    get(
                      get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "contractHandlingFee"),
                      "0.value"
                    ),
                    "currency"
                  )}
                </td>
                <td className="text-right" width="40">
                  บาท
                </td>
              </tr>
              <tr>
                <td width="100">ยอดจัดสินเชื่อ</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {valueFormat(
                    get(
                      get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "financingAmount"),
                      "0.value"
                    ),
                    "currency"
                  )}
                </td>
                <td className="text-right" width="40">
                  บาท
                </td>
              </tr>
              <tr>
                <td width="100">อัตราดอกเบี้ย</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {valueFormat(
                    get(
                      get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "interestRate"),
                      "0.value"
                    ),
                    "currency"
                  )}
                </td>
                <td className="text-right" width="40">
                  % &nbsp;&nbsp;
                </td>
              </tr>
              <tr>
                <td width="100">จำนวนงวด</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {get(
                    get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "installmentPeriod"),
                    "0.value"
                  )}
                </td>
                <td className="text-right" width="50">
                  งวด
                </td>
              </tr>
              <tr>
                <td width="100">ค่าเช่าซื้องวดละ</td>
                <td width="30">:</td>
                <td className="text-right" width="120">
                  {valueFormat(
                    get(
                      get(data, "loanInformation.additionalDetail",[]).filter((k) => k.key == "installmentAmount"),
                      "0.value"
                    ),
                    "currency"
                  )}
                </td>
                <td className="text-right" width="40">
                  บาท
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};
export default TableLoanInformation;
