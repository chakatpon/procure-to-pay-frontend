import { get } from "lodash";

const tableWaitingApproval = ({ model, data }) => {
  const currencyFormat = (value) => value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g , '$&,')
  return (
    <div className="table-responsive">
      <table className="table border-radius">
        <thead>
          <tr>
            {get(model, "columns").map((value) => <th id="thin_table" className={"pl-15 bg-lightblue white "+get(value, "class")}>{get(value, "label","")}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((dataSource, index) => {
            return (
              <tr data-row-key={index}>
                {get(model, "data").map((value) => {
                  let color = "text-dark";
                  if (data.length - 1 == index && get(value, "type") == "currency" && get(model, "lastIndexDynamicColor", true)) {
                    if (get(dataSource, get(value, "dataKey")) >= 0) {
                      color = "text-green"
                    } else {
                      color = "text-red"
                    }
                  } else if(get(value, "type") == "currency" && get(model, "lastIndexDynamicColor", true)) {
                    if (get(dataSource, get(value, "dataKey")) < 0) {
                      color = "text-red"
                    }
                  }
                  return <td className={color+" "+get(value, "class")}>{get(value, "type") == "currency" ? currencyFormat(get(dataSource, get(value, "dataKey"))) : get(dataSource, get(value, "dataKey"))}</td>
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
};

export default tableWaitingApproval;
