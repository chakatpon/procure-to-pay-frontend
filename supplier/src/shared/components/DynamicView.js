import _, { get, isEmpty, forEach, filter } from "lodash";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import { Row, Col, Breadcrumb, Descriptions,Table,Radio } from "antd";
import { Button, Image } from "react-bootstrap";
import { useContext, useEffect,useState } from "react";
import { StoreContext } from "@/context/store";
import DownArrow from "@/shared/svg/DownArrow.svg";
import UpArrow from "@/shared/svg/UpArrow.svg";
const DynamicView = (props) => {
  const viewModel = get(props,"viewModel",[]);
  const dataDetail = get(props,"dataDetail",[]);
  const linkAction = get(props,"linkAction",() => {});
  const {showLoading, hideLoading, forceLogin, showAlertDialog , isAllow,editValue, setEditValue} = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  let optionsValue = {}
  const footerActionClick = (s) => {
    //console.log(s);
    get(props,"footerAction",(s)=>{ alert(s.action) })(s);
  }
  const linkActionOnClick = (action, text,data,config) => {

    if(action=="downloadAttachment"){
      return downloadAttachment(text,data,config);
    }
    if(action=="exportFile"){
      return exportFile(text,data,config);
    }

    linkAction(action, text,data,config)
  }
  const exportFile =  async(text,data,config) => {

    if(!get(config,"actionApi")){
      showAlertDialog({
        title : "Setting is not valid.",
        text : "Please contact system engineer."
      })
    }
    let params = {};

    for (const [key, value] of Object.entries(get(config,"actionParams",{}))) {
      let v = "";
      if(value==":value"){
        v = text;
      }else{
        v=get(data,value);
      }
      params = {...params ,  [key] : v}
    }

    let download = await AppApi.getApi(
      get(config,"actionApi"),params,
      {
        method: get(config,"actionMethod","post"),
        authorized: true , ...get(config,"actionHeaders",{}) ,
        onDownloadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          //console.log(progressEvent)
          showLoading("Downloading "+percentCompleted+"%");
        },
        onUploadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          showLoading("Exporting");
        },

      }
    );
    if (download.status == 200) {
      const url = window.URL.createObjectURL(
        new Blob([get(download,"data")]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        text,
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    }else{
      showAlertDialog({
        title : get(download,"data.error","Export Failed"),
        text : get(download,"data.message","") + " Please Contact Administrator.",
        icon: 'error',
      })
    }
    hideLoading();
  }
  const downloadAttachment =  async(text,data,config) => {

    if(!get(config,"actionApi")){
      showAlertDialog({
        title : "Setting is not valid.",
        text : "Please contact system engineer."
      })
    }
    let params = {};

    for (const [key, value] of Object.entries(get(config,"actionParams",{}))) {
      let v = "";
      if(value==":value"){
        v = text;
      }else{
        v=get(data,value);
      }
      params = {...params ,  [key] : v}
    }

    let download = await AppApi.getApi(
      get(config,"actionApi"),params,
      {
        responseType: "blob",
        method: get(config,"actionMethod","post"),
        authorized: true , ...get(config,"actionHeaders",{}) ,
        onDownloadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          //console.log(progressEvent)
          showLoading("Downloading "+text + " "+percentCompleted+"%");
        },
        onUploadProgress:  (progressEvent) => {
          let percentCompleted = parseFloat( (progressEvent.loaded * 100) / progressEvent.total ).toFixed(2);
          showLoading("Requesting "+text);
        },

      }
    );
    if (download.status == 200) {
      const url = window.URL.createObjectURL(
        new Blob([get(download,"data")]),
      );
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        text,
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
  }
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
  return <><Row>
  <Col span={16}>
    <Breadcrumb separator=">">
      {get(viewModel, "breadcrumb", []).map((a) => {
        if (get(a, "href", "")) {
          return (
            <Breadcrumb.Item className={get(a, "class", "")}>
              <Link href={get(a, "href", "")}>
                <a>{get(a, "label", "")} </a>
              </Link>
            </Breadcrumb.Item>
          );
        } else {
          return <Breadcrumb.Item className={get(a, "class", "")}>{get(a, "label", "")}</Breadcrumb.Item>;
        }
      })}
    </Breadcrumb>
  </Col>
  <Col span={8} className="text-right d-flex">
    {get(viewModel, "topAction", []).map((a) => (
      <Button
        variant={get(a, "buttonColor", "default")}
        shape="round"
        size={get(a, "buttonSize", "md")}
        className={"mx-2 align-items-center d-flex ml-auto justify-content-center "+get(a, "class", "")}
        onClick={() => { linkActionOnClick(get(a,"onClick","GotoLink") ,get(a, "label", "") , dataDetail , a) }}
        dangerouslySetInnerHTML={{ __html: get(a, "icon", "") + get(a, "label", "") }}
      ></Button>
    ))}
  </Col>
</Row>

  {get(viewModel, "contents", []).map((content) => {
    return <Row justify={get(content, "justify")}>
      {get(content,"items",[]).map(col => {
      return (
        <>
          <Col span={get(col, "size", 24)} className={get(col, "class")}>
            <BoxTitle col={col}>
            <div className={get(col,"blockClass","d-flex "+get(col,"align","align-items-center"))}>
              {get(col, "thumbnail") && get(col, "thumbnail.dataKey") ? (
                <>
                  {get(dataDetail, get(col, "thumbnail.dataKey")) ? (
                    <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center border">
                      <div
                        className="symbol-label"
                        style={{
                          backgroundImage: "url(" + get(dataDetail, get(col, "thumbnail.dataKey")) + ")",
                        }}
                      ></div>
                    </div>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <></>
              )}
              <div className={get(col,"itemClass")}>

                {get(col, "items",[]).map(itm => {
                    if(get(itm,"component")=="line"){
                      return <hr className={"line " + get(itm,"class")} />
                    }
                    if(get(itm,"component")=="dynamic-text"){
                      return <Col span={get(itm,"size",24)}><DynamicTextList model={itm} data={dataDetail}></DynamicTextList></Col>
                    }
                    if(get(itm,"component")=="description"){
                      let res = [];

                      // for(let i=0; i< get(itm,"column",3);i++){
                      //   res.push(<><Row span={12}>AAAA</Row></>)
                      // }
                      return <div className={get(itm,"class")}>{get(itm,"items",[]).map(row => {
                        return <Row>{row.map(r => {
                          let textVal = "";
                          let textUnit = "";
                          let textRemark = "";

                          if(get(r, "dataFilter","")){
                            let t = get(dataDetail, get(r, "dataKey")) ? get(dataDetail, get(r, "dataKey"),[]).filter(k => get(k,get(r, "dataFilterKey","key"))==get(r, "dataFilter","")) : [];
                            if(t.length == 1){
                              textVal=valueFormat(get(t,"0."+get(r, "dataFilterValue","value")),get(r, "format"));
                            }
                          }else{
                            textVal=valueFormat(get(dataDetail, get(r, "dataKey"),""),get(r, "format"));
                          }
                          if(get(r, "unit")){
                            if(get(r, "unit.dataFilter","")){
                              let ttt = get(dataDetail, get(r, "dataKey"),[]).filter(k => get(k,get(r, "unit.dataFilterKey","key"))==get(r, "unit.dataFilter",""));

                              if(ttt.length == 1){
                                textUnit=valueFormat(get(ttt,"0."+get(r, "unit.dataFilterValue","value")),get(r, "unit.format"));
                              }
                            }else if(get(r, "unit.dataKey","")){
                              textUnit=valueFormat(get(dataDetail, get(r, "unit.dataKey"),""),get(r, "unit.format"));
                            }else{
                              textUnit=valueFormat(get(r, "unit"),get(r, "unit.format"));
                            }
                          }
                          if(get(r, "remark")){
                            if(get(r, "remark.dataFilter","")){
                              let tt = get(dataDetail, get(r, "dataKey"),[]).filter(k => get(k,get(r, "remark.dataFilterKey","key"))==get(r, "remark.dataFilter",""));

                              if(tt.length == 1){
                                textRemark=valueFormat(get(tt,"0."+get(r, "remark.dataFilterValue","value")),get(r, "remark.format"));
                              }
                            }else if(get(r, "remark.dataKey","")){
                              textRemark=valueFormat(get(dataDetail, get(r, "remark.dataKey"),""),get(r, "remark.format"));
                            }else{
                              textRemark=valueFormat(get(r, "remark"),get(r, "remark.format"));
                            }
                          }
                          return <><Col span={(24/row.length)}>
                          <div className="container-fluid pl-0">
                            <div className={"row py-2 "+get(r,"class")}>
                              <div className={"col-" + get(itm,"labelCol",3)}>{get(r,"label")}</div>
                              {get(r,"unit")?<>
                              <div className={"col-" + get(itm,"dataCol",4)+" "+(get(r,"label")?"hasLabel ":" ")+get(r,"dataClass")}>{ textVal }</div>
                              <div className={"col-1 "+get(r,"unitClass")}>{ textUnit }</div>
                              {textRemark?<><div className="col-3">{textRemark}</div></>:<></>}
                              </>:<>
                              <div className={"col-4 "+(get(r,"label")?"hasLabel ":" ")+get(r,"dataClass")}>{ textVal }</div>
                              </>}

                            </div>
                          </div>

                          { get(r,"options")?<div className="container-fluid pl-0">
                            <div className={"row py-2 "+get(r,"class")}>
                              <div className={"col-" + get(itm,"labelCol",3)}></div>
                              <div className={"col-" + get(itm,"dataCol",9)}>
                              <EditableRadio onChange={(e,act) => {
                                get(props,'onEdit',(e,act)=>{})(e,act)
                              }} model={r} data={dataDetail}></EditableRadio>
                              </div>
                            </div>
                          </div>:<></>}
                          </Col>
                          </>
                        })}</Row>
                      })}</div>
                    }

                    if(get(itm,"component")=="link"){
                      if(get(itm, "dataSource")){
                        return <div className={get(itm,"class")}>
                        {get(dataDetail, get(itm, "dataSource"),[]).map(l => {
                          if(typeof(l)=="string"){
                            return <a  className={get(itm,"linkClass","included-bbl pr-2")} onClick={() => { linkActionOnClick(get(itm,"onClick","GotoLink"),l,dataDetail,itm) }}>{l}</a>
                          }
                        })}
                        </div>
                      }

                    }

                    if(get(itm,"component")=="table"){
                      return <div className={get(itm,"class")}>
                        <Table {...get(itm,"tableOptions",{})} className={get(itm,"tableClass")} columns={get(itm,"columns")} dataSource={ get(dataDetail, get(itm, "dataSource"),[]) }></Table>
                        </div>
                    }

                    if(get(itm, "items",[]).length > 0){
                      return <div className={get(itm,"class")}>
                      <Row>{get(itm, "items",[]).map(ch => <Col span={get(ch, "size")} className={get(ch, "class","pr-2")}>

                        { get(dataDetail, get(ch, "dataKey"))?<><span className={"ml-2"+get(ch,"labelClass")}>{ get(ch, "label") }</span> {valueFormat(get(dataDetail, get(ch, "dataKey")),get(itm, "format"))}</>:<></> }
                        </Col>) }</Row>
                      </div>
                    }
                    return <div className={get(itm,"class")} >

                      { get(dataDetail, get(itm, "dataKey")) ? <><span className={"ml-2"+get(itm,"labelClass")}>{get(itm,"label")}</span> {valueFormat(get(dataDetail, get(itm, "dataKey")),get(itm, "format"))}</>:<></> }
                      </div>


                })}
              </div>
            </div>
            </BoxTitle>
          </Col>
        </>
      );
    })}
    </Row>
  }) }

{get(viewModel, "footerAction")?<Row justify="center" className="mt-10">
{get(viewModel, "footerAction",[]).map(act => {
  let disabled = get(act,"roles") ? Object.keys(get(act,"roles",{})).filter(mcode => isAllow(mcode,get(act,"roles."+mcode,[]))):false;
  if(disabled){
    return <></>
  }
  return <Col><Button onClick={()=>{footerActionClick(act);}} disabled={disabled} className={get(act,"class")}>{get(act,"label")}</Button></Col>;
})}
  </Row>:<></>}
  </>
}
const BoxTitle = (props) => {
  const [toggleShow, setToggleShow] = useState(get(props, "col.toggleDefault","show")=="show");
  if(get(props, "col.title")){
    if(get(props, "col.toggleShow",false)){
      return <>
      <button onClick={()=>{ setToggleShow(!toggleShow); get(props,"onToggleShow",(toggleShow)=>{})(toggleShow); }} type="button" class="ant-btn btn-back my-5"><span>{get(props, "col.title")}</span><span role="img" aria-label="down" class="anticon anticon-down"><span class="svg-icon svg-icon-primary svg-icon-1x">{toggleShow ?<DownArrow />:<UpArrow /> }</span></span></button>
      {toggleShow ? props.children : <></>}
      </>
    }else{
      return  <><h2 className="header-bbl mt-10">{get(props, "col.title")} </h2>{props.children}</>
    }

  }
  return <>{props.children}</>
}
const EditableRadio = (props) => {
  const {isAllow} = useContext(StoreContext);
  const [editValue, setEditValue] = useState();
  let r = get(props,"model",[]);
  let data = get(props,"data",[]);
  useEffect(()=>{
    let optVal = get(data, get(r, "options.dataKey")) ? get(data, get(r, "options.dataKey"),[]).filter(k => get(k,get(r, "options.dataFilterKey","key"))==get(r, "options.dataFilter","")) : [];

    if(optVal.length==1){
      optVal = get(optVal,"0."+get(r, "options.dataFilterValue","value"))
      setEditValue(optVal)

    }
    //console.log(r,get(editValue,get(r,"options.dataFilter")))
  },[props])
  const onChange = (e) => {
    setEditValue(e.target.value);
    get(props,'onChange',()=>{})(e,r);
  }
  return <Radio.Group
    name={get(r,"options.dataFilter")}
    onChange={onChange}
    value={editValue}>
    {get(r, "options.optionLists",[]).map(x =>
    <Radio variant="primary" value={get(x,"value")}>{get(x,"label")}</Radio>
    )}
  </Radio.Group>
}
const DynamicTextList = (props) => {
  const {isAllow} = useContext(StoreContext);
  let model = get(props,"model",[]);
  let data = get(props,"data",[]);
  let dataSource = get(data,get(model,"dataSource"));
  console.log(dataSource)
  if(!dataSource){
    return <></>;
  }
  return <><div className="d-flex align-items-center"><Row className="d-block">{dataSource.map(r => {
    let labelText = get(r, get(model, "labelKey"));
    let dataText = get(r, get(model, "dataKey"));
    let pmdtDetailType = get(r, 'pmdtDetailType')
    return <Col >

    <div className="container-fluid pl-0">
    {pmdtDetailType === "totalReceiveAmount" || pmdtDetailType === "totalPaidAmount" ?
      <div className={`row py-2 ${get(model,"rowClass", "")}`} style={{color: "#003399", fontWeight: "bold"}}>
        <div className={`dynamic-label col-${get(model,"labelCol",6)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",6)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div> : pmdtDetailType === "totalPaymentAmountObj" ?
      <div className={`row py-2 ${get(model,"rowClass", "")}`} style={{color: "#FF6E00", fontWeight: "bold"}}>
        <div className={`dynamic-label col-${get(model,"labelCol",6)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",6)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div> :
      <div className={`row py-2 ${get(model,"rowClass", "")}`}>
        <div className={`dynamic-label col-${get(model,"labelCol",6)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",6)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div>
      }
    </div>
  </Col>
  })}</Row></div></>;
}
export default DynamicView;
