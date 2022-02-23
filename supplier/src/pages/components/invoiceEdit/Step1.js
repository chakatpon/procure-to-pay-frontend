import ErrorHandle from "@/shared/components/ErrorHandle";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import {
  Row,
  Col,
  Breadcrumb,
  Form,
  Button,
  Table,
  Divider,
  Select,
  Input,
  Steps,
  Space,
} from "antd";
import router from "next/router";
const InvoiceFormStep1 = ({ form , api , selectedData , setSelectedData, setStep, setFileLists }) => {

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
  return (
    <>
    <div className="d-flex flex-column-fluid">
      <div className="container ant-descriptions-item-content">
        <div className="ant-row">
          <div className="ant-col-24">
            <div>
              <h4 className="my-10">
                <b>Please Select</b>
              </h4>
            </div>
            <div className="row mt-2">
              <div className="col-8">
                {console.log("DDD",get(selectedData, 'customerName'))}
                <Form.Item label="Customer Name" name="listCustomerName" form={form}>
                  <Input disabled value={get(selectedData, 'customerName')}/>
                </Form.Item>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-8">
                <Form.Item label="VIN No." name="listVinNo" form={form}>
                <Input disabled/>
                </Form.Item>
              </div>
            </div>
            <div className="row mt-4">
              <div className="col-8">
                <Form.Item label="Quote No." name="listQuoteNo" form={form}>
                <Input disabled/>
                </Form.Item>
              </div>
            </div>
          </div>
          <div className="ant-col-8"></div>
        </div>
      </div>
    </div>
    <div className="d-flex flex-column-fluid">
          <div className="container ant-col-24 ant-descriptions-item-content mt-10">
            <section className="code-box-demo">
              <div className="ant-card ant-card-bordered" style={{width : "100%"}}>
                <div className="ant-card-body">
                  <h5><b>Informations</b></h5>
                  <div className="ant-row mt-7">
                    <div className="ant-col-10">
                      <table className="ant-descriptions-item-content">
                        <tbody>
                          <tr>
                            <th className="header-bbl">Customer Details</th>
                          </tr>
                          <tr>
                            <td>Customer Name</td>
                            <td width="20">:</td>
                            <td width="200">{ get(selectedData , "customerName")}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="ant-col-2"></div>
                    <div className="ant-col-10">
                      <table className="ant-descriptions-item-content">
                        <tbody>
                          <tr>
                            <td className=""><br /></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div className="ant-row mt-5">
                    <div className="ant-col-10">
                      <table className="ant-descriptions-item-content">
                        <tbody>
                          <tr>
                            <th className="header-bbl" width="160">Loan Details</th>
                          </tr>
                          <tr>
                            <td>วันนัดหมาย</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180" style={{paddingLeft : "10px" }}>{ get(selectedData , "loanInformation.itemDeliveryDate")}</td>
                          </tr>
                          <tr>
                            <td>รุ่นรถยนต์</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180" style={{paddingLeft : "10px" }}>{ get(selectedData , "loanInformation.itemDescription")}</td>
                          </tr>
                          <tr>
                            <td>รหัสรุ่นรถยนต์</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180" style={{paddingLeft : "10px" }}>{ get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="modelCode"),"0.value")}</td>
                          </tr>
                          <tr>
                            <td>เลขตัวถังรถยนต์</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180" style={{paddingLeft : "10px" }}>{ get(selectedData , "loanInformation.itemCode")}</td>
                          </tr>
                          <tr>
                            <td>เลขเครื่องยนต์</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180"  style={{paddingLeft : "10px" }}>{ get(selectedData , "loanInformation.itemAddReference1")}</td>
                          </tr>
                          <tr>
                            <td>เสนอเปิดสัญญาณ CAL</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="180" style={{paddingLeft : "10px" }}>{ get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="calCredit"),"0.value")}</td>
                          </tr>
                          <tr>
                            <td>ราคารถ</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-left" width="160"  style={{paddingLeft : "10px" }}>{ valueFormat(get(selectedData , "loanInformation.itemUnitPrice"),"currency") } &nbsp;&nbsp;&nbsp; บาท</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="ant-col-2"></div>
                    <div className="ant-col-10 mt-2">
                      <table className="ant-descriptions-item-content">
                        <tbody>
                          <tr>
                            <th><br />
                            </th>
                          </tr>
                          <tr>
                            <td>ยอดเงินดาวน์</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{ valueFormat(get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="downPayment"),"0.value"),"currency")}</td>
                            <td className="text-right" width="40">บาท</td>
                          </tr>
                          <tr>
                            <td>ค่าธรรมเนียม</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{ valueFormat(get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="contractHandlingFee"),"0.value"),"currency")}</td>
                            <td className="text-right" width="40">บาท</td>
                          </tr>
                          <tr>
                            <td>ยอดจัดสินเชื่อ</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{ valueFormat(get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="financingAmount"),"0.value"),"currency")}</td>
                            <td className="text-right" width="40">บาท</td>
                          </tr>
                          <tr>
                            <td>อัตราดอกเบี้ย</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="interestRate"),"0.value")}</td>
                            <td className="text-right" width="40">% &nbsp;&nbsp;</td>
                          </tr>
                          <tr>
                            <td>จำนวนงวด</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{ get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="installmentPeriod"),"0.value")}</td>
                            <td className="text-right" width="40">งวด</td>
                          </tr>
                          <tr>
                            <td>ค่าเช่าซื้องวดละ</td>
                            <td className="text-right" width="20">:</td>
                            <td className="text-right" width="100">{ valueFormat(get(filter(get(selectedData , "loanInformation.additionalDetail"),(k)=>k.key=="installmentAmount"),"0.value"),"currency")}</td>
                            <td className="text-right" width="40">บาท</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            </div>
          </div>
          <hr className="line-blue mt-10" />
          <div className="ant-row ant-form-item mt-10">
            <div className="ant-col ant-form-item-control">
              <div className="ant-form-item-control-input">
                <div className="ant-form-item-control-input-content">
                  <div className="row justify-content-md-center">
                    <button disabled={selectedData == false} type="button" className="btn btn-blue btn-auto-width"
                    onClick={()=>{ setStep(2) }}
                    ><span>Next</span></button>
                    <button type="button" className="btn btn-orange btn-auto-width" onClick={()=>{
                      router.push("/document/invoice")
                    }}><span>Close</span></button>
                  </div>
                </div>
              </div>
            </div>
          </div>
    </>
  );
};
export default InvoiceFormStep1;
