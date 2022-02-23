import { get } from "lodash";

const TableThreeWay = ({ model, data, columnNo }) => {
  return (
    <div className="container-fluid mt-2 p-0">
      <div className="ant-table-wrapper">
        <div className="ant-spin-nested-loading">
          <div className="ant-spin-container">
            <div className="ant-table">
              <div className="ant-table-container">
                <div className="ant-table-content">
                  <table>
                    <thead className="ant-table-thead">
                      <tr>
                        <th className="ant-table-cell">Status</th>
                        <th className="ant-table-cell">Detail Matching</th>
                        <th className="ant-table-cell">PO No.<br/>{get(columnNo, "poNo")}</th>
                        <th className="ant-table-cell">GR No.<br/>{get(columnNo, "grNo")}</th>
                        <th className="ant-table-cell">INV No.<br/>{get(columnNo, "invNo")}</th>
                      </tr>
                    </thead>
                    <tbody className="ant-table-tbody">
                      {data.map((value, index) => {
                        let iconClass = "fa fa-check-circle mr-3"
                        let textColorClass = "text-dark"
                        if (!get(value, "result")) {
                          iconClass = "fa fa-times-circle mr-3"
                          textColorClass="red"
                        }
                        return (<tr data-row-key={index} className="ant-table-row ant-table-row-level-0">
                        <td className="ant-table-cell"><i className={iconClass} aria-hidden="true"/></td>
                        <td className="ant-table-cell">{get(value, "matchDetail")}</td>
                        <td className={"ant-table-cell "+textColorClass}>{get(value, "povalue")}</td>
                        <td className={"ant-table-cell "+textColorClass}>{get(value, "grvalue")}</td>
                        <td className={"ant-table-cell "+textColorClass}>{get(value, "invvalue")}</td>
                      </tr>)
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
};

export default TableThreeWay;
