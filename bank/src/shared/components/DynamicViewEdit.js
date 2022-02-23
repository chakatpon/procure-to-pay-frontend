import _, { get,set, isEmpty, forEach, filter, map } from "lodash";
import { B2PAPI } from "@/context/api";
import Link from "next/link";
import { Row, Col, Breadcrumb, Descriptions,Table,Radio,Form,Select, } from "antd";
import { Button, Image } from "react-bootstrap";
import { useContext, useEffect,useState } from "react";
import { StoreContext } from "@/context/store";
import DownArrow from "@/shared/svg/DownArrow.svg";
import UpArrow from "@/shared/svg/UpArrow.svg";
import * as CustomModule from  "@/shared/custom/index"
import Columns from "@/shared/components/Columns";

const DynamicViewEdit = (props) => {
  const [viewModel,setViewModel] = useState([]);
  const [form] = Form.useForm();
  const [submitBtn,setSubmitBtn] = useState(false);
  const [showSubmitBtn,setShowSubmitBtn] = useState(false);
  const {dataDetail,setDataDetail} = props;
  const [editOption,setEditOption] = useState([]);
  const linkAction = get(props,"linkAction",() => {});
  const {showLoading, hideLoading, forceLogin, showAlertDialog , isAllow,editValue, setEditValue,assignParams} = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  let optionsValue = {}
  useEffect(()=>{
    setDataDetail(get(props,"dataDetail",[]))
    setViewModel(get(props,"viewModel",[]))
    console.log('useEffect-DynamicViewEdit',get(props,"dataDetail",[]))
  },[props])
  const footerActionClick = (s) => {
    console.log(s);
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
        responseType: 'blob'
      }
    );
    if (download.status == 200) {
      console.log(download.headers)
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
      if(text==0){
        return "0.00"
      }
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

  const submitForm = async(config) => {
    try{
      showLoading("Saving data.")
      let params = assignParams(dataDetail,config,"");
      let resp = await AppApi.getApi(
        get(config,"actionApi"),params,
        {
          method: get(config,"actionMethod","post"),
          authorized: true , ...get(config,"actionHeaders",{})
        }
      );
      hideLoading();
      if(resp.status==200){
        setShowSubmitBtn(false)
        showAlertDialog({
          text : get(resp,"data.message"),
          icon: "success",
          showCloseButton: true,
          routerLink: get(config, 'callback', false)
        });
      }else{
        showAlertDialog({
          title : get(resp,"data.error","Saved Failed !"),
            text : get(resp,"data.message","Please contact administrator."),
            icon: "error",
            showCloseButton: true
        });
      }
    }catch(err){
      showAlertDialog({
        title : get(err,"error","Saved Failed !"),
          text : get(err,"message","Please contact administrator."),
          icon: "error",
          showCloseButton: true
      });
      hideLoading();
    }


  }
  const getCustomModule = (itm,data) => {
    let com = get(itm,"component");
    const Component = CustomModule[com];
    return <Component model={itm} data={data} />
  }
  return DynamicViewEdit?<><Form
  form={form}
  onFinish={( allValues) => {
    console.log(allValues)
  }}
  ><Row className={get(viewModel, "breadcrumbClass")}>
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
    {get(viewModel, "topAction", []).map((a) => {
      let disabledAll = get(a,"roles") ? Object.keys(get(a,"roles",{})).filter(mcode => isAllow(mcode,get(a,"roles."+mcode,[]))).length == 0:false;
      if(!disabledAll){
        disabledAll = get(a,"showOn",false) ? Object.keys(get(a,"showOn",{})).filter(key => {
          return get(a,"showOn")[key].includes(get(dataDetail,key));
        }).length==0:disabledAll;
      }
      if(!disabledAll){
        disabledAll = get(a,"hideOn",false) ? Object.keys(get(a,"hideOn",{})).filter(key => {
          return get(a,"hideOn")[key].includes(get(dataDetail,key));
        }).length!=0:disabledAll;
      }
      console.log('disabledAll',disabledAll);
      if(disabledAll){
        return <></>
      }
      return <Button
        variant={get(a, "buttonColor", "default")}
        shape="round"
        size={get(a, "buttonSize", "md")}
        className={"mx-2 align-items-center d-flex ml-auto justify-content-center "+get(a, "class", "")}
        onClick={() => { linkActionOnClick(get(a,"onClick","GotoLink") ,get(a, "label", "") , dataDetail , a) }}
        dangerouslySetInnerHTML={{ __html: get(a, "icon", "") + get(a, "label", "") }}
      ></Button>
    })}
  </Col>
</Row>

  {get(viewModel, "contents", []).map((content) => {
    return <Row className={get(content, "class")} justify={get(content, "justify")}>
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

                    if(get(itm,"custom")==true){
                      return getCustomModule(itm,dataDetail);
                    }
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
                              let tt = get(dataDetail, get(r, "dataKey")) ? get(dataDetail, get(r, "dataKey"),[]).filter(k => get(k,get(r, "remark.dataFilterKey","key"))==get(r, "remark.dataFilter","")) : "";

                              if(tt.length == 1){
                                textRemark=valueFormat(get(tt,"0."+get(r, "remark.dataFilterValue","value")),get(r, "remark.format"));
                              }
                            }else if(get(r, "remark.dataKey","")){
                              textRemark=valueFormat(get(dataDetail, get(r, "remark.dataKey"),""),get(r, "remark.format"));
                            }else{
                              textRemark=valueFormat(get(r, "remark"),get(r, "remark.format"));
                            }
                          }



                          return <><Col span={(24/row.length) === 24 ? 12 : (24/row.length)}>
                          <div className="container-fluid pl-0">
                            <div className={"row py-2 "+get(r,"class")}>
                              {console.log("RRRR",r)}
                              <div className={"col-" + get(itm,"labelCol",3)}>{get(r,"label")}</div>
                              {get(r,"unit")?<>
                              <div className={"col-" + get(itm,"dataCol",4)+" "+(get(r,"label")?"hasLabel ":" ")+get(r,"dataClass")}>
                                { textVal }
                              </div>
                              <div className={"col-1 "+get(r,"unitClass")}>{ textUnit }</div>
                              {textRemark?<><div className="col-3">{textRemark}</div></>:<></>}
                              </>:<>
                              <div className={"col-4 "+(get(r,"label")?"hasLabel ":" ")+get(r,"dataClass")}>
                              { (get(r,"onNull"))?<>
                                {(get(r,"onNull.action")=="edit"  && (!textVal))?<>
                                <Form.Item>
                                {get(r,"onNull.inputType")=="select"?<>
                                <SetOption onLoad={()=>{ setShowSubmitBtn(true) }} config={r} onChange={(value, option)=>{
                                  console.log(option)
                                  let data = dataDetail;

                                  for (const [key, value] of Object.entries(get(r,"onNull.onChange"))) {
                                    data=set(data,key,get(option,"attr."+value));
                                  }

                                  if(value){
                                    setSubmitBtn(true);
                                  }else{
                                    setSubmitBtn(false)
                                  }
                                  setDataDetail(data);
                                  setViewModel({...viewModel , t : new Date() });
                                  console.log('dataDetail',dataDetail)
                                }}/>
                                </>:<></>}
                                </Form.Item>
                                </>:<>{textVal}</>}
                                </>:<>{textVal}</> }
                              </div>
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

                    if (get(itm,"component") == "link") {
                      if (get(itm, "dataSource")){
                        return <div className={get(itm,"class")}>
                          {Array.isArray(get(dataDetail, get(itm, "dataSource"),[])) ?
                            get(dataDetail, get(itm, "dataSource"),[]).map(l => {

                            if (typeof(l)=="string") {

                              return <a className={get(itm,"linkClass","included-bbl pr-2")} onClick={() => { linkActionOnClick(get(itm,"onClick","GotoLink"),l,dataDetail,itm) }}>{l}</a>
                            }
                          }) : <div><span>{get(itm,"label")}</span><span className="ml-3 mr-3">:</span><a className={get(itm,"linkClass","included-bbl pr-2")} onClick={() => { linkActionOnClick(get(itm,"onClick","GotoLink"),get(dataDetail, get(itm, "dataSource")), dataDetail, itm) }}>{get(dataDetail, get(itm, "dataSource"))}</a></div>
                        }
                        </div>
                      }

                    }

                    if (get(itm, "component") == "checkMatch") {
                      return <div className={get(itm, "class")}>
                        {get(itm, "icon", false) ? (get(dataDetail, get(itm, "dataKey")) == "Matched") ? <i class="fa fa-check-circle mr-3" aria-hidden="true"/> : <i class="fa fa-times-circle mr-3" aria-hidden="true"/>: <></>}
                        <span>{get(itm, "label")}</span>
                        <span className={get(dataDetail, get(itm, "dataKey")) == "Matched" ? "header-grass-18 pl-0" : "header-red-18 pl-0"}>{get(dataDetail, get(itm, "dataKey"))}</span></div>
                    }

                    if (get(itm, "component") == "tableThreeWay") {
                      return <CustomModule.TableThreeWay itm={itm} columnNo={get(dataDetail, get(itm, "columnNo"))} data={get(dataDetail, get(itm, "dataSource"))}/>
                    }

                    if (get(itm, "component") == "paymentExpan") {
                      return <CustomModule.PaymentExpan model={itm} data={get(dataDetail, get(itm, "dataSource"))}/>
                    }

                    if(get(itm,"component")=="table"){
                      let cols = get(itm, "columns")
                      if(get(itm, "dataSource") === "actionHistory"){
                        // <br> case
                        cols = map(cols, (col) => get(col, 'dataIndex') === 'note' ? {...col, render: dt => <span dangerouslySetInnerHTML={{__html:dt}} />} : col)
                      }
                      return  <Table {...get(itm,"tableOptions",{})} className={get(itm,"class")} columns={cols} dataSource={ get(dataDetail, get(itm, "dataSource"),[]) }></Table>
                    }

                    if(get(itm,"component")=="tableAdv"){

                      return <TableDetail itm={itm} data={dataDetail}  />
                    }

                    if (get(itm, "component") == "dataCurrency") {
                      return <div className={"mt-2 "+get(itm, "class")}><span className={" "+get(itm,"labelClass")}>{get(itm, "label")}</span><span className={get(itm, "itemClass")}>{valueFormat(get(dataDetail, get(itm, "dataKey")), "currency")} THB</span></div>
                    }

                    if(get(itm, "items",[]).length > 0){
                      return <div className={get(itm,"class")}>
                      <Row>{get(itm, "items",[]).map(ch => <Col span={get(ch, "size")} className={get(ch, "class","pr-2")}>

                        { get(dataDetail, get(ch, "dataKey"))?<><span className={get(ch,"labelClass")}>{ get(ch, "label") }</span> {valueFormat(get(dataDetail, get(ch, "dataKey")),get(itm, "format"))}</>:<></> }
                        </Col>) }</Row>
                      </div>
                    }
                    return <div className={get(itm,"class")} >
                        { get(dataDetail, get(itm, "dataKey"))
                        ? <><span className={get(itm ,"labelClass")}>{get(itm,"label")}</span> {((get(itm, "dataKey") == 'status'
                        || get(itm, "dataKey") == 'invoice.status'
                        || get(itm, "dataKey") == 'invoiceStatus')
                        && (get(dataDetail, 'status') == ('Cancelled')
                        || get(dataDetail, 'invoice.status') == ('Waiting for Payment Resubmit')
                        || get(dataDetail, 'invoiceStatus') == ('Waiting for Payment Resubmit')))
                        ? <span className="text-danger">{valueFormat(get(dataDetail, get(itm, "dataKey")),get(itm, "format"))}</span>
                        : valueFormat(get(dataDetail, get(itm, "dataKey")),get(itm, "format"))}</>
                        : <span className="">{get(itm,"label")}{get(dataDetail, get(itm, "dataKey")) == 0 && get(dataDetail, get(itm, "dataKey")) !== ""
                        ? "0" : null}</span> }
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

{get(viewModel, "footerAction")?<Row className={get(viewModel, "footerClass")} justify="center" className="mt-10">
{get(viewModel, "footerAction",[]).map(act => {
  if(get(act,"type")=="button"){
    let disabled = get(act,"roles") ? Object.keys(get(act,"roles",{})).filter(mcode => isAllow(mcode,get(act,"roles."+mcode,[]))).length == 0:false;
    if(!disabled){
      disabled = get(act,"showOn",false) ? Object.keys(get(act,"showOn",{})).filter(key => {
        return get(act,"showOn")[key].includes(get(dataDetail,key));
      }).length==0:disabled;
    }
    if(!disabled){
      disabled = get(act,"hideOn",false) ? Object.keys(get(act,"hideOn",{})).filter(key => {
        return get(act,"hideOn")[key].includes(get(dataDetail,key));
      }).length!=0:disabled;
    }
    console.log('disabled',disabled);
    if(disabled){
      return <></>
    }
    return <Col><Button onClick={()=>{footerActionClick(act);}} disabled={disabled} className={get(act,"class")}>{get(act,"label")}</Button></Col>;
  }
  if(get(act,"type")=="submit"){

    let disabled = get(act,"roles") ? Object.keys(get(act,"roles",{})).filter(mcode => isAllow(mcode,get(act,"roles."+mcode,[]))).length == 0:false;
    if(!disabled){
      disabled = get(act,"showOn",false) ? Object.keys(get(act,"showOn",{})).filter(key => {
        return get(act,"showOn")[key].includes(get(dataDetail,key));
      }).length==0:disabled;
    }
    if(!disabled){
      disabled = get(act,"hideOn",false) ? Object.keys(get(act,"hideOn",{})).filter(key => {
        return get(act,"hideOn")[key].includes(get(dataDetail,key));
      }).length!=0:disabled;
    }
    console.log('disabled',disabled);


    if(disabled){
      return <></>
    }
    return <>{showSubmitBtn ?<Col>
    <Form.Item>
    <Button onClick={()=>{ submitForm(act) }}
    disabled={!submitBtn}
    className={get(act,"class")}
    >{get(act,"label")}</Button></Form.Item></Col>:<></>}</>;
  }

})}
  </Row>:<></>}
  </Form>
  </>:<></>
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
      return  <><h2 className={get(props, "col.titleClass")+" header-bbl mt-10"}>{get(props, "col.title")} </h2>{props.children}</>
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
  return <><div className="d-flex flex-wrap align-items-center"><Row>{dataSource.map(r => {
    let labelText = get(r, get(model, "labelKey"));
    let dataText = get(r, get(model, "dataKey"));
    let pmdtDetailType = get(r, 'pmdtDetailType')
    return <Col className="col-12 px-0">

    <div className="container-fluid pl-0">
    {pmdtDetailType === "totalReceiveAmount" || pmdtDetailType === "totalPaidAmount" ?
      <div className={`row py-2 ${get(model,"rowClass", "")}`} style={{color: "#003399", fontWeight: "bold"}}>
        <div className={`dynamic-label col-${get(model,"labelCol",4)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",4)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div> : pmdtDetailType === "totalPaymentAmountObj" ?
      <div className={`row py-2 ${get(model,"rowClass", "")}`} style={{color: "#FF6E00", fontWeight: "bold"}}>
        <div className={`dynamic-label col-${get(model,"labelCol",4)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",4)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div> :
      <div className={`row py-2 ${get(model,"rowClass", "")}`}>
        <div className={`dynamic-label col-${get(model,"labelCol",4)}`}>{labelText}</div>
        <div className={`col-${get(model,"dataCol",4)} ${labelText?"hasLabel ":" "}${get(model,"dataClass")} px-0"`}>{ dataText }</div>
        <div className="col-1">บาท</div>
      </div>
      }
    </div>
  </Col>
  })}</Row></div></>;
}

const SetOption =  ({config, onChange , onLoad}) => {

  const AppApi = B2PAPI(StoreContext);
  const [optionLists, setOptionLists] = useState([]);
  useEffect(async()=>{
    let resp = await AppApi.getApi(get(config,"onNull.optionApi"),{},{
      method: "post", authorized: true
    });
    if(resp.status==200){
      onLoad(resp);
      let optionDataSource = get(resp.data,get(config,"onNull.optionDataSource"));

      let opts = optionDataSource.map(s=>{
        return {
          "option" : get(s,get(config,"onNull.optionTextKey")),
          "value" : get(s,get(config,"onNull.optionValueKey")),
          "attr" : s
        }
      });
      console.log('optionDataSource',opts);
      setOptionLists(opts);
    }
  },[config])
  return <><Select
  style={{ width: 350 }}
  placeholder={get(config,"onNull.inputPlaceHolder")}
  onChange={onChange}
  >
    {optionLists.map((s,i)=><Select.Option key={i} attr={get(s,"attr")} value={get(s,"value")}>{get(s,"option")}</Select.Option>)}
    </Select></>
  // return "sssss"
}

const TableDetail = ({itm,data}) => {
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const [columns, setColumns] = useState([]);
  useEffect(()=>{
    initData()
  },[data]);
  const initData = async() => {
    let col = await Columns({ table : {columns : get(itm, "columns", [])} }, context, AppApi);
    setColumns(col);
  }
  if(get(itm,"multiDatasource",false)==false){
    return <div className={get(itm,"class")}>
    <Table {...get(itm,"tableOptions",{})} className={get(itm,"tableClass","")} columns={columns} dataSource={ get(data, get(itm, "dataSource"),[]) }></Table>
    </div>
  }else{

    //Object(get(itm,"grayTableWhen",{})).ke
    return get(data,get(itm,"multiDatasource",[]),[]).map(dt => {
      let grayTable = Object.entries(get(itm,"grayTableWhen",{})).filter(([k,v]) =>  get(dt,k) == v).length!=0;
      let customClass = get(itm,"tableClass","");
      if(grayTable){
        customClass = customClass + " gray-table";
      }
      console.log('table',customClass,dt)
    return <div className={get(itm,"class")}>
      <Table {...get(itm,"tableOptions",{})} className={customClass} columns={columns} dataSource={ get(dt, get(itm, "dataSource"),[]) }></Table>
      </div>;
  });
  }

}
export default DynamicViewEdit;
