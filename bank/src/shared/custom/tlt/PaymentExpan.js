import { get } from "lodash";
import { useState } from "react";
import TableWaitingApproval from "./TableWaitingApproval";

const PaymentExpan = ({ model, data}) => {
  const currencyFormat = (value) => value.toFixed(2).replace(/\d(?=(\d{3})+\.)/g , '$&,')
  return (
    <>
      {data.map((value, index) => {
        const [expand, setExpand] = useState(false);
        let color = "text-dark"
        if (get(model, "dataRight.currency", true) && get(model, "dataRight.dynamicColor", true)) {
          if (get(value, "amount") > 0) {
            color = "text-green"
          } else if (get(value, "amount") < 0) {
            color = "text-red"
          }
        }
        return (
          <div className="mt-10 blog-item border-radius p-2 my-5">
            <a href={"#payment-list-"+index} onClick={() => setExpand(!expand)} data-toggle="collapse" role="button" aria-expanded={expand} aria-controls={"payment-list-"+index} className="d-flex flex-wrap collapse-item align-items-center p-3">
              <h4 className={"text-dark col-6 mb-0 "+get(model, "dataLeft.class")}>{get(model, "dataLeft.label")}{get(value, get(model, "dataLeft.dataKey"))}</h4>
              <h4 className={"text-dark col ml-auto mb-0 text-right "+get(model, "dataRight.class")}>{get(model, "dataRight.label")}{get(model, "dataRight.currency", true) ? <span className={color}>{currencyFormat(get(value, get(model, "dataRight.dataKey")))} THB</span> : <span>{get(value, get(model, "dataRight.dataKey"))}</span>}</h4>
              <span className="icon box-shadow d-flex ml-auto align-items-center justify-content-center">
                <i className="fas fa-chevron-up blue"/>
                <i className="fas fa-chevron-down blue"/>
              </span>
            </a>
            <div id={"payment-list-"+index} className={"collapse multi-collapse"}>
              {get(model, "item") ? <TableWaitingApproval model={get(model, "item")}  data={get(value, get(model, "item.dataSource"))} /> : <></>}
            </div>
          </div>
        )
      })}
    </>
  );
};

export default PaymentExpan;
