import { useEffect , useContext, useState} from 'react'
import Head from "next/head";
import {useRouter} from "next/router";
import {get, sortBy, isEmpty, debounce, isEqual, forEach, filter, has} from "lodash";
import {StoreContext} from "@/context/store";
import Layout from "@/component/layout";
import { useTranslation } from 'next-i18next';
import { B2PAPI } from "@/context/api";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { Breadcrumb, Popover, Button, Select, Form, DatePicker } from "antd";
const { RangePicker } = DatePicker;
import FilterIcon from "@/shared/svg/icon_filter.svg"
import ErrorHandle from "@/shared/components/ErrorHandle";
import moment from "moment";
import BadgeItem from '@/shared/components/dashboard/BadgeItem';
import ChartItem from '@/shared/components/dashboard/ChartItem';
import SeparateNumberByComma from '@/shared/helper/separateNumberByComma';


export default function Dashboard(props) {
  const {setAppMenuActive, hideLoading, showLoading} = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);

  const { locale, locales, defaultLocale } = useRouter();
  const { t, i18n } = useTranslation();

  const [filterValue, setFilterValue] = useState({
    supplierCode: undefined,
    supplierBranchCode: undefined,
    startDate: undefined,
    endDate: moment().format("YYYY-MM-DD")
  })
  const [dashboardData, setDashboardData] = useState({})
  const [portalDetail, setPortalDetail] = useState({})
  const [supplierFilter, setSupplierFilter] = useState([])
  const [isPopoverSupplierVisible, setIsPopoverSupplierVisible] = useState(false)
  const [isPopoverDateVisible, setIsPopoverDateVisible] = useState(false)
  const [dateFilterValue, setDateFilterValue] = useState("Daily")
  const [dateFilter, setDateFilter] = useState()

  const apiRoute = {
    dashboard: "/p2p/api/v1/inquiry/dashboard",
    supplierFilter: "/p2p/api/v1/get/supplierFilter/dashboard"
  }

  useEffect( () => {
    onLoad();
  },[]);

  const onLoad = () => {
    setAppMenuActive("/dashboard");
    getSupplierFilter();
    getData();
  }

  const getSupplierFilter = async() => {
    try {
      // get API
      const response = await AppApi.getApi(get(apiRoute, "supplierFilter"), {}, { method: "get", authorized: true })

      if(get(response, "status") === 200){
        let list = get(response, "data", [])
        list = get(list, [0, "branchList"])
        list = [{supplierBranchCode: "", supplierBranchName: "All"}, ...list]
        setSupplierFilter(list)
      }
    } catch (error) {
      ErrorHandle(error)
    }
  }

  const getData = async() => {
    try {
      showLoading()
      // get API
      const response = await AppApi.getApi(get(apiRoute, "dashboard"), filterValue, { method: "post", authorized: true })

      if(get(response, "status") === 200){

        // prepare data for compatible with chart
        const finalData = await prepareData(get(response, ["data", "components"]))
        setDashboardData(finalData)

        setPortalDetail(get(response, ["data", "portalDetail"], {}))
      }
      hideLoading()
    } catch (error) {
      ErrorHandle(error)
      hideLoading()
    }
  }

  const prepareData = (data) => {
    const donutChartData = filter(data, (item) => get(item, "chartType") === "chart.donut")
    const badgeData = filter(data, (item) => get(item, "chartType") === "chart.badge")

    let finalData = []

    forEach(donutChartData, (item, i) => {
      // data list loop
      let datasetForChart = []
      let labelForChart = []
      let bgForChart = []
      let dataForLegend = []

      forEach(get(item, "values"), (it) => {
        // prepare data loop
        labelForChart = [...labelForChart, get(it, "legend", "-")]
        datasetForChart = [...datasetForChart, get(it, "totalTransaction", 0)]
        bgForChart = [...bgForChart, get(it, "fillColor", "#000")]
        dataForLegend = [...dataForLegend, {
          legend: get(it, "legend", "-"),
          totalTransaction: get(it, "totalTransaction", 0),
          totalAmount: get(it, "totalAmount", 0),
          legendColor: get(it, "fillColor", "#000"),
          unitAmount: get(it, "unitAmount", "THB"),
          totalAmountPercent: get(it, "totalAmountPercent", "-"),
          redirectParam: get(it, "redirectParam"),
        }]
      })
      // set data and chart options
      finalData[i] = {
        chartData: {
          title: get(item, ["values", 0, "unitTransaction"]),
          chartType: get(item, "chartType"),
          totalTransaction: get(item, "totalTransaction"),
          unitAmount: get(item, "unitAmount"),
          labels: labelForChart,
          dataForLegend,
          options:{
            layout:{
              padding: 30
            },
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                enabled: false
              }
            }
          },
          datasets: [{
            label: get(item, "title"),
            totalAmount: get(item, "totalAmount"),
            totalTransaction: get(item, "totalTransaction"),
            data: datasetForChart,
            backgroundColor: bgForChart,
            cutout: 60,
          }]
        }


      }
    })
    return {badges: badgeData ,charts: finalData}
  }

  const PopoverSupplier = () => (
    <div style={{width: "300px"}}>
      <p className="bold">Showroom Filter</p>
      <div id="bbl_content" style={{backgroundColor: "#fff"}}>
        <div className="form">
          <div className="control-group">
            <label className="control-label">Showroom</label>
            <div className="controls">
              <Select placeholder="Showroom" style={{ width: '100%' }} onChange={(value) => setFilterValue({...filterValue, supplierBranchCode: value})} defaultValue={""} value={get(filterValue, "supplierBranchCode")}>
                {map(supplierFilter, (item, i) => (
                  <Select.Option key={i} value={get(item, "supplierBranchCode")}>
                    {get(item, "supplierBranchName")}
                  </Select.Option>
                ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="text-center pt-5">
          <Button className="btn btn-blue" onClick={handleSupplierSearch}>Submit</Button>
        </div>
      </div>
    </div>
  )

  const PopoverDate = () => {
    const dropdownList = [
      "Daily",
      "Weekly",
      "Monthly",
      "Specific Date"
    ];

    const resolveDateFilter = (value) => {
      setDateFilterValue(value)
      switch (value) {
        case "Daily":
          setFilterValue({...filterValue,
            startDate: moment().format("YYYY-MM-DD"),
            endDate:moment().format("YYYY-MM-DD"),
          })
          break;
        case "Weekly":
          setFilterValue({...filterValue,
            startDate: moment().subtract(7, 'days').format("YYYY-MM-DD"),
            endDate:moment().format("YYYY-MM-DD"),
          })
          break;
        case "Monthly":
          setFilterValue({...filterValue,
            startDate: moment().subtract(1, 'months').format("YYYY-MM-DD"),
            endDate:moment().format("YYYY-MM-DD"),
          })
          break;
        // case "Specific Date":

        // break;

        default:
          break;
      }
    }

    return (
      <div style={{width: "300px"}}>
        <p className="bold">Date Filter</p>
        <div id="bbl_content" style={{backgroundColor: "#fff"}}>
          <div className="form">
            <div className="control-group">
              <label className="control-label">Options</label>
              <div className="controls">
                <Select placeholder="Showroom" style={{ width: '100%' }} onChange={(value) => resolveDateFilter(value)} defaultValue={dateFilterValue} value={dateFilterValue}>
                  {map(dropdownList, (item, i) => (
                    <Select.Option key={i} value={item}>
                      {item}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </div>
            {dateFilterValue === "Specific Date" ?
              <div className="pt-1">
                <div className="control-group">
                  <label className="control-label">Date</label>
                  <div className="controls">
                    <RangePicker
                      dateRender={(current) => (
                        <div className="ant-picker-cell-inner" title={moment(current, "YYYY-MM-DD").format("DD-MM-YYYY")}>
                          {current.date()}
                        </div>
                      )}
                      value={dateFilter}
                      allowClear={true}
                      format="DD-MM-YYYY"
                      onChange={val => {
                        setDateFilter(val)
                        setFilterValue({...filterValue,
                        startDate: val[0].format("YYYY-MM-DD"),
                        endDate: val[1].format("YYYY-MM-DD"),
                        })
                      }}
                      disabledDate={
                        (current) => {
                          return moment() < current
                        }
                      }
                    />
                  </div>
                </div>
              </div>
             : <></>}
          </div>
          <div className="text-center pt-5">
            <Button className="btn btn-blue" onClick={handleSupplierSearch}>Submit</Button>
          </div>
        </div>
      </div>
    )
  }

  const handlePopoverSupplierVisible = (visible) => {
    setIsPopoverSupplierVisible(visible)
  }
  const handlePopoverDateVisible = (visible) => {
    setIsPopoverDateVisible(visible)
  }

  const handleSupplierSearch = () => {
    setIsPopoverSupplierVisible(false)
    setIsPopoverDateVisible(false)
    getData()
  }

  return (
    <>
      <Head>
        <title>Dashboard - BBL PROCURE TO PAY</title>
        <link rel="stylesheet" href="/assets/css/pages/dashboard/dashboard.css"></link>
      </Head>
      <div className="container">
        <Breadcrumb>
          <Breadcrumb.Item>
            Dashboard
          </Breadcrumb.Item>
        </Breadcrumb>
        <div id="dashboard-page">
          <div id="logo" className="d-flex flex-wrap align-items-center">
            <div className="col-2 px-0 py-3">
              <img src={`data:image/png;base64, ${get(portalDetail, "portalLogo")}`} alt="" width="100" className="img-fullwidth" />
            </div>
            <div className="col-6 px-0 pb-3 ml-auto text-right">
              <h6 className="blue bold mb-3">{get(portalDetail, "portalNameTH")}</h6>
              <Popover
                content={<PopoverSupplier/>}
                placement="bottomRight"
                trigger="click"
                visible={isPopoverSupplierVisible}
                onVisibleChange={handlePopoverSupplierVisible}
              >
                <Button className="btn btn-blue ml-2" name="btn_filter_supplier">Supplier <FilterIcon className="ml-2"/></Button>
              </Popover>
              <Popover
                content={<PopoverDate/>}
                placement="bottomRight"
                trigger="click"
                visible={isPopoverDateVisible}
                onVisibleChange={handlePopoverDateVisible}
              >
                <Button className="btn btn-blue ml-2" name="btn_filter_daily">{dateFilterValue} <FilterIcon className="ml-2"/></Button>
              </Popover>
            </div>
          </div>
          {/* start badge */}
          <div id="summary" className="d-flex flex-wrap">
            {/* <div className=""> */}
              {has(dashboardData, "badges") && map(get(dashboardData, "badges"), (item) =>
                <BadgeItem
                  title={get(item, "title")}
                  totalAmount={get(item, "totalAmount")}
                  totalTransaction={get(item, "totalTransaction")}
                  icon={get(item, "icon")}
                  unitAmount={get(item, "unitAmount")}
                  redirectParam={get(item, "redirectParam")}
                />
              )}
            {/* </div> */}
          </div>
          {/* end badge */}

          <div id="graphs" class="d-flex flex-wrap">
            <div className="row">
              {has(dashboardData, "charts") && map(get(dashboardData, "charts"), (item) =>
                <ChartItem
                  chartData={get(item, "chartData")}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
Dashboard.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
