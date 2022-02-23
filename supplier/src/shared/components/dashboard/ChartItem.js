import {get, map} from "lodash"
import DoughnutChart from "@/shared/components/dashboard/DoughnutChart"
import SeparateNumberByComma from "@/shared/helper/separateNumberByComma"
import { Tooltip } from "antd"
import Link from "next/link"

const ChartItem = ({
  chartData = {}
}) => {
  const renderTooltip = (item) => {
    return <>
      <p className="grey mb-0 mt-0 bold"><span style={{color:"#3269CD"}}>{SeparateNumberByComma(get(item, "totalTransaction"), 0)}</span> {get(item, "legend")}</p>
      <p className="grey mb-0 mt-0 bold"><span style={{color:"#3269CD"}}>{SeparateNumberByComma(get(item, "totalAmount"), 2)}</span> {get(item, "unitAmount")}</p>
      <p className="grey mb-0 mt-0 bold"><span style={{color:"#3269CD"}}>{get(item, "totalAmountPercent")}</span></p>
    </>
  }
  return (
    <div className="graph-blog col-4 my-3">
      <div className="graph-wrapper p-5 h-100">
        <h5 className="bold">{get(chartData, "title")}</h5>
        <h6 className="text-center pt-5 mb-0 grey ">Total <span className="bold px-3" style={{color: "#3269CD"}}>{SeparateNumberByComma(get(chartData, "totalTransaction"), 0)}</span> {get(chartData, "title")}</h6>

        {/* CHART */}
        <div className="px-20">
          <DoughnutChart data={chartData}/>
        </div>

        {/* LEGEND */}
        <div className="text-center d-flex flex-wrap">
          {map(get(chartData, "dataForLegend", []), (item) =>
            <>
              <Link href={`${get(item, ["redirectParam", "url"])}?statusCode=${get(item, ["redirectParam", "statusCode"])}`}>
                <Tooltip color="white" title={renderTooltip(item)} className="col px-1">
                  <a className="pr-3 grey" style={{whiteSpace: "nowrap"}}><span className="dot mr-2" style={{backgroundColor: get(item, "legendColor")}}/>{get(item, "legend")}</a>
                </Tooltip>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ChartItem
