import _, { get,set, isEmpty, forEach, filter } from "lodash";
import { useState,useEffect } from "react";
import Columns from "@/shared/components/Columns";
import {Table} from "antd"
const TableDetail = ({itm,data}) => {
  const [columns, setColumns] = useState([]);
  useEffect(()=>{
    console.log('TableDetail',get(itm,"multiDatasource",false),itm)
    initData()
  },[data,itm]);
  const initData = async() => {
    let col = await Columns({ table : {columns : get(itm, "columns", [])} });

    setColumns(col);
  }
  if(get(itm,"multiDatasource",false)==false){
    return <div className={get(itm,"class")}>
    <Table {...get(itm,"tableOptions",{})} className={get(itm,"tableClass","")} columns={columns} dataSource={ get(data, get(itm, "dataSource"),[]) }></Table>
    </div>
  }else{

    //Object(get(itm,"grayTableWhen",{})).ke
    console.log('multiDatasource',get(data,get(itm,"multiDatasource",[]),[]))
    if(get(data,get(itm,"multiDatasource",[]),[])==null){
      return <></>
    }
    return get(data,get(itm,"multiDatasource",[]),[]).map(dt => {
      let grayTable = Object.entries(get(itm,"grayTableWhen",{})).filter(([k,v]) =>  get(dt,k) == v).length!=0;
      let customClass = get(itm,"tableClass","");
      if(grayTable){
        customClass = customClass + " gray-table";
      }
      console.log('table',get(itm, "dataSource"),get(dt, get(itm, "dataSource"),[]))
    return <div className={get(itm,"class")}>
      <Table {...get(itm,"tableOptions",{})} className={customClass} columns={columns} dataSource={ get(dt, get(itm, "dataSource"),[]) }></Table>
      </div>;
  });
  }

}
export default TableDetail
