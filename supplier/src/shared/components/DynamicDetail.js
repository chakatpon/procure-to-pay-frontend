import _, { get, isEmpty, forEach, filter, set } from "lodash";
import { B2PAPI } from "@/context/api";
import { useContext, useEffect,useState } from "react";
import { StoreContext } from "@/context/store";
import { Row, Col, Breadcrumb, Form, Button, Table, Divider, Select, Input} from "antd";
import Link from "next/link";
import DownArrow from "@/shared/svg/DownArrow.svg";
import UpArrow from "@/shared/svg/UpArrow.svg";
const DynamicDetail = (props) => {
  const model = get(props,"model",[]);
  const data = get(props,"data",[]);
  const setData = get(props,"setData",()=>{});
  // const [data, setData ] = useState(get(props,"data",[]));
  const linkAction = get(props,"linkAction",() => {});
  const linearId = get(props,"linearId","");
  const id = get(props,"id","");
  const AppApi = B2PAPI(StoreContext);
  const [form] = Form.useForm();
  const {showLoading, hideLoading, showAlertDialog, isAllow} = useContext(StoreContext);

  const footerActionClick = (s) => {
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

  return <>
    <Form
      layout="horizontal"
      form={form}
      onFinish={( allValues) => {
        console.log(allValues)
      }}
    >

          {get(model, "breadcrumb")?<Row className="mb-10"><Col><Breadcrumb separator=">">
            {get(model, "breadcrumb", []).map((a) => {
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
          </Breadcrumb></Col> </Row>:<></>}


          {get(model, "contents")?
          <>
          {get(model, "contents",[]).map(mod => {
              let isAllowRole = get(mod,"roles") ? Object.keys(get(mod,"roles",{})).filter(mcode => isAllow(mcode,get(mod,"roles."+mcode,[]))):false;
              if(isAllowRole){
                return <></>
              }
              return <Row gutter={[8, 8]} justify={get(mod,"justify","left")} className={get(mod,"class")}>
                {get(mod,"items") ? get(mod,"items").map(config => <Col span={get(config,"size")}>
                <BoxTitle model={config}>
                <div className={get(config,"blockClass","d-flex "+get(config,"align","align-items-center"))}>
                  <Thumbnail config={config} data={data} />
                  {get(config,"items") ? <div className={get(config,"itemClass")}>
                    {get(config,"items").map(itm => <Form.Item
                      label={get(itm,"label")}
                      name={get(itm,"name")}
                      className={"m-0 p-0 "+get(itm,"class","")}
                      labelCol={get(itm,"labelCol")}
                      labelAlign={get(itm,"labelAlign")}
                      >
                      {get(itm, "component")=="textcol"?<>{get(itm,"items") ? get(itm,"items").map(r=>{
                        return <>{get(r,"label")} {valueFormat(get(data, get(r, "dataKey")),get(r, "format"),r,data)}{` `}</>
                      }):<></>}</>:<></>}
                      {get(itm, "component")=="text"?<>
                      {valueFormat(get(data, get(itm, "dataKey")),get(itm, "format"),itm,data)}
                      {get(itm,"items") ? get(itm,"items").map(r=>{
                        return <>{get(r,"label")} {valueFormat(get(data, get(r, "dataKey")),get(r, "format"),r,data)}{` `}</>
                      }):<></>}
                      </>:<></>}
                      {get(itm, "component")=="table"?<TableComponent config={itm} data={data} />:<></>}
                      {get(itm, "component")=="link"?<LinkComponent config={itm} data={data} onClick={linkActionOnClick} />:<></>}
                      {get(itm, "component")=="line"?<Divider className={get(itm,"class","")} />:<></>}
                      {get(itm, "component")=="description"?<DescriptionComponent config={itm} data={data} setData={setData} form={form} api={AppApi} />:<></>}

                    </Form.Item>)}
                  </div>:<></>}
              </div>
                </BoxTitle>
                </Col>) : <></>}
              </Row>;
            })}
          </>:<></>}


          {get(model, "footerAction")?
          <Row justify="center" className="mt-10">

            {get(model, "footerAction",[]).map(act => {
              let isAllowRole = get(act,"roles") ? Object.keys(get(act,"roles",{})).filter(mcode => isAllow(mcode,get(act,"roles."+mcode,[]))):false;
              if(isAllowRole){
                return <></>
              }
              return <Col>
                <Button
                onClick={()=>{
                  if(get(act,"action")){
                    footerActionClick(act);
                  }
                }}
                htmlType={get(act,"type","button")}
                disabled={get(act,"disabled",false)}
                className={get(act,"class")}
                >{get(act,"label")}</Button>
              </Col>;
            })}
          </Row>:<></>}

    </Form>
  </>
}
const valueFormat = (text,format,config,data) => {
  if(text=="" || text == null || text == undefined){
    return "";
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
const BoxTitle = (props) => {
  const [toggleShow, setToggleShow] = useState(get(props, "model.toggleDefault","show")=="show");
  if(get(props, "model.title")){
    if(get(props, "model.toggleShow",false)){
      return <>
      <button onClick={()=>{ setToggleShow(!toggleShow); get(props,"onToggleShow",(toggleShow)=>{})(toggleShow); }} type="button" class="ant-btn btn-back my-5"><span>{get(props, "model.title")}</span><span role="img" aria-label="down" class="anticon anticon-down"><span class="svg-icon svg-icon-primary svg-icon-1x">{toggleShow ?<DownArrow />:<UpArrow /> }</span></span></button>
      {toggleShow ? props.children : <></>}
      </>
    }else{
      return  <><h2 className="header-bbl">{get(props, "model.title")} </h2>{props.children}</>
    }

  }
  return <>{props.children}</>
}
const Thumbnail = ({config,data}) => {
  return <>{(get(config, "thumbnail")) ? (<>
    {get(data, get(config, "thumbnail.dataKey")) ? (
    <div className="symbol symbol-60 symbol-xxl-100 mr-5 align-self-start align-self-xxl-center border">
      <div
        className="symbol-label"
        style={{
          backgroundImage: "url(" + get(data, get(config, "thumbnail.dataKey")) + ")",
        }}
      ></div>
    </div>
  ) : (
    <></>
  )}
  </>) : ( <></> )}</>
}
const TableComponent = ({config,data}) => {
  return <Table {...get(config,"tableOptions",{})} className={get(config,"tableClass")} columns={get(config,"columns")} dataSource={ get(data, get(config, "dataSource"),[]) }></Table>
}
const LinkComponent = (props) => {
  const linkActionOnClick = get(props,"onClick",()=>{});
  const config = get(props,"config",[]);
  const data = get(props,"data",[]);

  if(get(config, "dataSource")){
    return <div className={get(config,"class")}>
    {get(data, get(config, "dataSource"),[]).map(l => {
      if(typeof(l)=="string"){
        return <a  className={get(config,"linkClass","included-bbl pr-2")} onClick={() => { linkActionOnClick(get(config,"onClick","GotoLink"),l,data,config) }}>{l}</a>
      }
    })}
    </div>
  }
  return <></>
}
const DescriptionComponent = (props) => {
  const AppApi = props.api;
  const config = get(props,"config",[]);
  var data = get(props,"data",[]);
  const setData = get(props,"setData",() => {});
  const form = get(props,"form");
  const [selectOption,setSelectOption] = useState(false);
  const [textVal,setTextVal] = useState({});
  const actionOnNull = (r) => {
    if(get(r,"onNull.component")=="select"){
      !selectOption ? getOption(r) : false;
      return <Select placeholder={"Please select "+get(r,"label")}>
        {selectOption ? selectOption.map(s => <Select.Option value={get(s,"value")}>{get(s,"option")}</Select.Option>):<></>}
      </Select>
    }
    return <></>
  }
  const getOption = async(r) => {
    let resp = await AppApi.getApi(get(r,"onNull.dataSource"),{}, { method: "post", authorized: true });

    if(resp.status==200){
      let opts = get(resp,"data."+get(r,"onNull.dataSourceKey"),[]).map(s => {
        return {
          option : get(s,get(r,"onNull.optionKey")),
          value : get(s,get(r,"onNull.valueKey")),
          attr : s
        }
      });
      setSelectOption(opts);
      // console.log('getOption',"data."+get(r,"onNull.dataSourceKey"),opts)

    }
  }

  return <Row>{get(config,"items") ? get(config,"items").map(r => {
    let text = valueFormat(get(data, get(r, "dataKey")),get(r, "format"),r,data);


    actionOnNull(r);
    return <Col span={get(r,"size",24)}>
      <Form.Item
      form={props.form}
      label={get(r,"label")}
      name={get(r,"name")}
      labelCol={get(r,"labelCol",{span : 12})}
      labelAlign={get(r,"labelAlign","left")}
      >
        {text?<span class="ant-form-text">{text}</span>:<>
        {get(r,"onNull.component")=="select"?<Select onChange={(v) => {
          form.setFieldsValue({ [get(r,"name")] : v })
          // set(data,get(r,"dataKey"),v);
          if(get(r,"onNull.relationChange")){
            get(r,"onNull.relationChange").map(c => {
              let sVal = get(selectOption.filter(k=>k.value==v),"0",[])
              // form.setFieldsValue({ [get(c,"name")] : get(sVal,"attr."+get(c,"value")) });
              set(data,get(c,"dataKey"),get(sVal,"attr."+get(c,"value")));

            });
          }
          setData(data);
        }}>
        <Select.Option value="">Not Set</Select.Option>
        {selectOption ? selectOption.map(s => <Select.Option value={get(s,"value")}>{get(s,"option")}</Select.Option>):<></>}
        </Select>:<></>}
        </>}
      </Form.Item>
      </Col>
  }):<></>}</Row>
}
export default DynamicDetail
