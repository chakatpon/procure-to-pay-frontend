import _, { get,isEmpty} from "lodash";
import Link from 'next/link'
import {Tooltip} from "antd";
import { DatePicker } from 'rsuite';

import moment from "moment-timezone"
import { useContext, useEffect,useState } from "react";
import { StoreContext } from "@/context/store";
import Swal from "sweetalert2";
const Columns = (listView,context,AppApi,reloadList) => {
  const showAlertDialog = get(context,'showAlertDialog',(opts) => {
    Swal.fire({
      heightAuto: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      ...opts,
    });
  });
  const assignParams = get(context,'assignParams',()=>{ alert("Column Context is not defined.")});
  const showLoading = get(context,'showLoading',()=>{ alert("Column Context is not defined.")});
  const hideLoading = get(context,'hideLoading',()=>{ alert("Column Context is not defined.")});
  const reviseDate = async (config,date,row,event) => {
    try{
      if(!get(config,"actionApi")){
        return showAlertDialog({
          title : "Setting is not valid.",
          text : "Please contact system engineer."
        })
      }
      showLoading("Saving")
      let params = assignParams(row,config,moment(date).format("YYYY-MM-DD"));
      let resp = await AppApi.getApi(
        get(config,"actionApi"),params,
        {
          method: get(config,"actionMethod","post"),
          authorized: true , ...get(config,"actionHeaders",{})
        }
      );
      hideLoading();
      if(resp.status==200){
        showAlertDialog({
          text : get(resp,"data.message"),
          icon: "success",
          showCloseButton: true,
        });
      }else{
        showAlertDialog({
          title : get(resp,"data.error","Saved Failed !"),
            text : get(resp,"data.message","Please contact administrator."),
            icon: "error",
            showCloseButton: true
        });
      }
      if(typeof reloadList == "function"){
        reloadList();
      }
    }catch(err){
      showAlertDialog({
        title : get(err,"error","Saved Failed !"),
          text : get(err,"message","Please contact administrator."),
          icon: "error",
          showCloseButton: true
      });
      hideLoading();
      if(typeof reloadList == "function"){
        reloadList();
      }
    }

  }
  const DatePickerLocale = {
    sunday: 'Su',
    monday: 'Mo',
    tuesday: 'Tu',
    wednesday: 'We',
    thursday: 'Th',
    friday: 'Fr',
    saturday: 'Sa',
    ok: 'Confirm',
    today: 'Today',
    yesterday: 'Yesterday',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds'
  };
  let columnsList = get(listView,'table.columns',[]);
  // console.log(columnsList)
  columnsList = columnsList.sort(function(a,b) {
      return a.columnSeq - b.columnSeq;
  });
  let col = columnsList.map(r=>{
    if(r.columnDisplay==false){
      return false;
    }
    let res = {
        title: get(r,'columnName','Untitled'),
        dataIndex: get(r,'columnFieldName'),
        className: get(r,'columnClass'),
        key: get(r,'columnFieldName'),
        sorter: get(r,'columnSorting',false),
        ellipsis: {
          showTitle: false,
        },
        textWrap: 'word-break',
        width: 200,
        render: text => (
          <div style={{whiteSpace: "pre-line"}}>
            {text}
          </div>
        )
    }
    if(get(r,'columnWidth',get(r,'width',0)) > 0){
      res = {...res,
       width : get(r,'columnWidth',get(r,'width',0)),
       ellipsis: {
          showTitle: false,
        },
        render: address => (
          <span style={{width : get(r,'columnWidth',get(r,'width',0)), whiteSpace: "pre-line"}}>
            {address}
          </span>
        )}

    }
    if(get(r,'columnType',"text")=="datepicker"){

      res = {...res,
        className : get(res,"className","text-right"),
        render: (text,row) => (
          <><DatePicker
          onChange={()=>{ return false; }}
          // style={{ width: 250 }}
          locale={DatePickerLocale}
          ranges={[]}
          disabledDate={date => {
            let enableDate = get(row,"enableDate")
            if(enableDate && typeof enableDate == "object"){
              return ! enableDate.includes(moment(date).format("YYYY-MM-DD"))
            }
            return false
          }}
          cleanable={false}
          onOk={(date,event)=>{
            reviseDate(r,date,row,event)

          }}
          defaultValue={moment(text, get(res,"dateFormat","YYYY-MM-DD"))}
          format={get(res,"dateFormat","YYYY-MM-DD")} /></>
        )
   }
    }

    if(get(r,'columnType',"text")=="multi-link"){
      res = {...res,
            ellipsis: false,
            render: (link,row) => {

              return link.map((text,i) => {
                console.log('multi-link',typeof text,text)
                let query = {};
                if(typeof text == "string"){
                  get(r,'columnLink.query',[]).map(k => {
                      query = { ...query , [k] : isEmpty(get(row,k)) ?  "-" : get(row,k,"-")}
                    });
                    if(query.length == 0){
                      query = { text }
                    }
                    return (
                    <>{i ? <>,</> : <></>}<Link
                      href={{
                        pathname : get(r,'columnLink.href',""),
                        query : query
                      }} >

                      <a className={i > 0 ? "btn-text blue underline m-1" : "btn-text blue underline m-1"}>{text}</a>

                    </Link></>
                  );
                }else{
                  get(r,'columnLink.query',[]).map(k => {
                    query = { ...query , [k] : isEmpty(get(text,k)) ?  "-" : get(text,k,"-")}
                  });
                  if(query.length == 0){
                    query = {  }
                  }
                  return <><Link href={{
                    pathname : get(r,'columnLink.href',""),
                    query : query
                  }}><a className={i > 0 ? "btn-text blue underline m-1" : "btn-text blue underline m-1"}>{get(text,get(r,"columnObjectKey"))}</a></Link></>
                }

              });
              }
       }
    }
    if(get(r,'columnType',"text")=="link"){
      console.log('r link : ', r)
      res = {...res,
            ellipsis: false,
            render: (text,row) => {
              let query = {};
              get(r,'columnLink.query',[]).map(k => {
                query = { ...query , [k] : isEmpty(get(row,k)) ?  "-" : get(row,k,"-")}
              });
              if(query.length == 0){
                query = { text }
              }
              return (
              <Link
                href={{
                  pathname : get(r,'columnLink.href',"/linkAction/[text]"),
                  query : query
                }} >
                <a className="btn-text blue underline">{text}</a>
              </Link>
            )}
       }
    }
    if(get(r,'columnType',"text")=="number"){
      res = {...res,
            className : get(r,"columnClassName",get(res,"className","")),
            align : "center",
            render: text => (
              <>{typeof text != "string" ? (text || text == 0) ? text.toFixed(get(r,"columnDecimalLength",0)).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'): text != null ? text.toFixed(2) : text : text}</>
            )
       }
    }
    if(get(r,'columnType',"text")=="amount"){
      res = {...res,
            className : get(r,"columnClassName",get(res,"className","")),
            align : "right",
            render: text => {
              return <span>{parseFloat(text) ? text.toFixed(get(r,"columnDecimalLength",2)).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,'): text != null ? text.toFixed(2) : text}</span>
            }
       }
    }
    if(get(r,'columnType',"text")=="amountformat"){
      res = {...res,
            className : get(r,"columnClassName",get(res,"className","")),
            align : "right",
            render: text => {
              return text || text === 0 ? <span className={parseFloat(text) >=0 ? "text-dark" : "text-danger"}>{text.toFixed(get(r,"columnDecimalLength",2)).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')}</span> : text
            }
       }
    }
    return res;
  }).filter(r => r !== false);

  return col;
}
export default Columns;
