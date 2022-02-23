import { get, filter, size } from "lodash";
import { Button } from "react-bootstrap";
import { useContext, useState } from "react";
import { B2PAPI } from "@/context/api";
import { StoreContext } from "@/context/store";
import ErrorHandle from "@/shared/components/ErrorHandle";

const tableCSV = ({ model, data }) => {
  const [search, setSearch] = useState("")
  const [dataTable, setDataTable] = useState(get(data, get(model, "dataTable"), data))
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);

  const onSearch = (text) => {
    setSearch(text)
    setDataTable(get(data, get(model, "dataTable"), data).filter((value) => {
      if ( get(value, "ivudInoiveNo").includes(text.trim())) {
        return true;
      }
      return false;
    }))
  }

  const performExportGetData = async(dataModel) => {
    try {
      if (!get(dataModel, "exportApi")) {
        return showAlertDialog({
          title : "Setting is not valid.",
          text : "Please contact system engineer."
        });
      }
      const body = {}
      get(dataModel, "bodyKey").forEach((value, index) => {
        body[value] = get(data, get(dataModel, "bodyData")[index])
      })
      showLoading("Exporting "+get(dataModel,"label"))
      let response = await AppApi.getApi(get(dataModel, "exportApi"), body, {
        method : "post",
        responseType : 'blob',
        authorized : true,
        onDownloadProgress : (progressEvent) => {
          let percentCompleted = parseFloat((progressEvent.loaded * 100) / progressEvent.total).toFixed(2);
          showLoading("Downloading "+get(dataModel,"label") + " "+percentCompleted+"%");
        }
      });
      if (get(response, "status", 500) == 200) {
        const headerLine = response.headers['content-disposition'];
        let filename;
        if (headerLine) {
          filename = headerLine.split(';')[1].split('=')[1].replace('"', '').replace('"', '');
        } else {
          filename = moment().format("YYYYMMDD") +"-export."+get(dataModel,"label").toLowerCase();
        }
        const url = window.URL.createObjectURL(new Blob([get(response, "data")]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download',get(dataModel, "filename", filename));
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
      } else {
        showAlertDialog({
          title: get(response,"data.error","Download Failed"),
          text: get(response,"data.message","") + " Please Contact Administrator.",
          icon: 'error',
        })
      }
      hideLoading();
    } catch(err) {
      hideLoading();
      ErrorHandle(err)
    }
  }

  const resolveExportDisabled = () => {
    console.log("resolveExportDisabled")
    return size(filter(dataTable, inv => get(inv, 'ivudStatus') !== 'Success')) === 0
  }

  return (
    <>
    <div className="d-flex mt-5 justify-content-end">
      {get(model, "showSearch", true) ?
      <div className="search d-flex pl-5">
        <input className="input-search" value={search} onChange={(event) => onSearch(event.target.value)} placeholder={get(model, "placeholder")} type="text"/>
        <div className="d-block align-self-center"><img src="/assets/media/svg/icons/General/Search.svg" alt="Search Icon"/></div>
      </div>
      : null}
      {get(model, "export", []).map((value) => <Button onClick={()=>{performExportGetData(value)}} className={"ml-5 d-flex align-items-center justify-content-center "+get(value,"class")} disabled={resolveExportDisabled()} >{get(value, "icon") ? <span dangerouslySetInnerHTML={{__html : get(value, "icon",).replace(/\\/g,'') }}/> : null}{get(value,"label")}</Button>)}
    </div>
    <div className="ant-table mt-5">
      <div className="ant-table-container">
          <div className="ant-table-content">
            <table className="table-layout: auto;">
                <thead className="ant-table-thead">
                  <tr>
                      {get(model, "showNumberRecord", true) ?
                      <th className="ant-table-cell">No.</th> : null}
                      {get(model, "columns").map((value) => <th className="ant-table-cell">{value}</th>)}
                  </tr>
                </thead>
                <tbody className="ant-table-tbody">
                  {dataTable.map((value, index) => {
                  return (
                  <tr data-row-key={index} className="ant-table-row ant-table-row-level-0">
                    {get(model, "showNumberRecord", true) ?
                    <td className="ant-table-cell">{++index}</td> : null}
                    {get(model, "dataKey").map((dataKey) => <td className="ant-table-cell">{get(value, dataKey) ? get(value, dataKey) : "-"}</td>)}
                  </tr>
                  )})}
                </tbody>
            </table>
          </div>
      </div>
    </div>
    </>
  )
};

export default tableCSV;
