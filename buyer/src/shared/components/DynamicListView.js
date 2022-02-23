import SearchBox from "@/shared/components/SearchBox";
import TableColumnDisplay from "@/shared/components/TableColumnDisplay";
import { Table, Tooltip,Breadcrumb } from "antd";
import {Button , DropdownButton , Dropdown} from "react-bootstrap"
import { get } from "lodash";
import { StoreContext } from "@/context/store";
import { useRouter } from "next/router";
import { B2PAPI } from "@/context/api";
import { useEffect, useContext, useState } from "react";
import Link from "next/link";

const DynamicListView = (props) => {
  const {viewModel,columns , dataSource} = props;
  // const {columns , dataSource} = props;

  const tableHeaderAction = get(props,"onHeaderAction",()=>{})
  const onSearchReset = get(props,"onSearchReset",()=>{})
  const onSearchSubmit = get(props,"onSearchSubmit",()=>{})
  const searchList = get(props,"searchList",[])
  const sortList = get(props,"sortList",[])
  const disabledDate = get(props, "disabledDate", "3653");
  const rowSelection = get(props,"rowSelection",false)
  const pagination = get(props,"pagination",false)
  const OnTableColumnDisplayChange = get(props,"OnTableColumnDisplayChange",()=>{})
  const OnTableColumnDisplayReset = get(props,"OnTableColumnDisplayReset",()=>{})
  const handleTableChange = get(props,"handleTableChange",()=>{})
  const columnDisplay = get(props,"columnDisplay",false)

  const selectedRowKeys=get(props,"selectedRowKeys",()=>{})
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading , showAlertDialog , isAllow} = useContext(StoreContext);
  const doExportData = async(config) => {
    try{
    if(!get(config,"exportApi")){
      return showAlertDialog({
        title : "Setting is not valid.",
        text : "Please contact system engineer."
      });
    }
    showLoading("Exporting "+get(config,"label"))
    console.log(pagination);
    let params = {
      page: pagination.current,
      pageSize: pagination.pageSize,
      searchList,
      sortList,
    }
    let download = await AppApi.getApi(
      get(config,"exportApi"),params,
      {
        method: "post",
        responseType: 'blob',
        authorized: true , ...get(config,"actionHeaders",{}) ,
        onDownloadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          //console.log(progressEvent)
          showLoading("Downloading "+get(config,"label") + " "+percentCompleted+"%");
          if (percentCompleted == "100.00") {
            showLoading("Downloading "+get(config,"label") + " " + "100.00%");
            showLoading("Requesting "+get(config,"label"));
          }
        },
        onUploadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          showLoading("Exporting "+get(config,"label"))
        },

      }
    );
    if (download.status == 200) {

      const headerLine = download.headers['content-disposition'];
      let filename;
      if(headerLine){
        filename = headerLine.split(';')[1].split('=')[1].replace('"', '').replace('"', '');

      }else{
        filename = moment().format("YYYYMMDD") +"-export."+get(config,"label").toLowerCase();
      }
      const type = download.headers['content-type']
      const url = window.URL.createObjectURL(
        // new Blob([get(download,"data")]),
        new File([get(download,"data")],filename,{ type }),
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
    }else{
      showAlertDialog({
        title : get(download,"data.error","Download Failed"),
        text : get(download,"data.message","") + " Please Contact Administrator.",
        icon: 'error',
      })
    }
    hideLoading();
  }catch(err){
    hideLoading();
    console.log(err)
  }

  }
  return (<>
  <div className="container-fluid">
          <div className="row">
            <div className="col-12 my-3">
              <Breadcrumb separator=">">
                {get(viewModel, "breadcrumb", false) ? get(viewModel, "breadcrumb", []).map((a) => {
                  if (get(a, "href", "")) {
                    return (
                      <Breadcrumb.Item>
                        <Link href={get(a, "href", "")}>
                          <a>{get(a, "label", "")}</a>
                        </Link>
                      </Breadcrumb.Item>
                    );
                  } else {
                    return <Breadcrumb.Item>{get(a, "label", "")}</Breadcrumb.Item>;
                  }
                }):<><Breadcrumb.Item>

                  <a>{get(viewModel, "title", "")}</a>
                </Breadcrumb.Item></>}
              </Breadcrumb>
            </div>
          </div>
        </div>

        {get(viewModel, "search", []).length > 0 ? (
          <SearchBox
            {...viewModel}
            onReset={onSearchReset}
            onFinish={onSearchSubmit}
            defaultValues={searchList}
            disabledDate={disabledDate}
          ></SearchBox>
        ) : (
          <></>
        )}
        <section id="page-content" className="mt-5 px-10">
          <div id="controls" className="d-flex align-items-center mb-4">
          {get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter(r=>r.position != "R").sort((a, b) => get(a, "seq", 1) - get(b, "seq", 1)).map((r) => {
            if(get(r,'visible',true)== false){ return <></>; }
            let isNotAllow = get(r,"roles") ? Object.keys(get(r,"roles",{})).filter(mcode => isAllow(mcode,get(r,"roles."+mcode,[]))):false;
              if(!isNotAllow){
                return (
                  <Button
                    onClick={() => {
                      tableHeaderAction(get(r, "action", ""),r);
                    }}
                    htmlType={get(r, "type", "button")}

                    disabled={selectedRowKeys.length == 0 }
                    className={"btn mr-3 " + get(r, "btnClass", "btn-blue")}
                  >
                   {get(r, "label", "Button")}
                  </Button>
                );
              }else{
                return <></>;
              }

            }):<></>}

            {get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter(r=>r.position == "R").sort((a, b) => get(a, "seq", 1) - get(b, "seq", 1)).map((r) => {
            if(get(r,'visible',true)== false){ return <></>; }
            let isNotAllow = get(r,"roles") ? Object.keys(get(r,"roles",{})).filter(mcode => isAllow(mcode,get(r,"roles."+mcode,[]))):false;
              if(!isNotAllow){
                return (
                  <Button
                    onClick={() => {
                      tableHeaderAction(get(r, "action", ""),r);
                    }}
                    htmlType={get(r, "type", "button")}

                    disabled={selectedRowKeys.length == 0 }
                    className={"btn mx-3 ml-auto " + get(r, "btnClass", "btn-blue")}
                  >
                   {get(r, "label", "Button")}
                  </Button>
                );
              }else{
                return <></>;
              }

            }):<></>}
            {columnDisplay ? <TableColumnDisplay
              get={get(columnDisplay,"get")}
              set={get(columnDisplay,"set")}
              default={get(columnDisplay,"default")}
              current={columns}
              onChange={get(columnDisplay,"onChange")}
              onReset={get(columnDisplay,"onReset")}
              hasRightButton={get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter(r=>r.position == "R" && r.visible==true).length!=0:false}
            />:<><span className={(get(viewModel, "table.tableHeaderAction", []) ? get(viewModel, "table.tableHeaderAction", []).filter(r=>r.position == "R" && r.visible==true).length!=0:false)?"d-inline":"mx-3 ml-auto"}></span></>}

            {get(viewModel,"export") ? <div className="btnExport d-flex">
              <div className="controls col-12 px-0">
                {get(viewModel,"export").length == 1 ?
                   <Button
                   variant={get(get(viewModel,"export")[0], "buttonColor", "default")}
                   shape="round"
                   size={get(get(viewModel,"export")[0], "buttonSize", "md")}
                   className={"mx-2 "+get(get(viewModel,"export")[0], "class", "")}
                   onClick={() => doExportData(get(viewModel,"export")[0])}
                   dangerouslySetInnerHTML={{ __html: get(get(viewModel,"export")[0], "icon", "") + get(get(viewModel,"export")[0], "label", "") }}/>

                  : <DropdownButton title="Export to" size="large" variant="blue-transparent">
                    {get(viewModel,"export").map((r,i) => <Dropdown.Item eventKey={i} onClick={()=>{ doExportData(r) }}>
                      <ExportItem r={r}></ExportItem>
                      </Dropdown.Item>)}
                    </DropdownButton>
                }

              </div>
            </div>:<></>}
          </div>
                {console.log('DynamicListView dataSource : ', dataSource)}
                {console.log('DynamicListView columns : ', dataSource)}
          <Table
              rowSelection={rowSelection ? {...rowSelection,selectedRowKeys} : false }
              rowClassName={(record, index) => {
                if(record.status == "Cancelled") {
                  return 'text-danger'
                }
                return ''
              }}
              onChange={handleTableChange}
              columns={columns}
              dataSource={dataSource}
              pagination={pagination}
              className="table-x"
              scroll={ { x : 500 }}
            ></Table>
        </section>
  </>)
}
const ExportItem = ({r}) =>{
  return <div>
  {get(r,"icon") ?<><span dangerouslySetInnerHTML={{__html : get(r,"icon","").replace(/\\/g,'') }}></span> {` `}</>:<></>}
  {get(r,"label")}
  </div>;
}
export default DynamicListView;
