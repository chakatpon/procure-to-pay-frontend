import {Form , Modal , Select , Input, Button} from "antd";
import { Button as BSButton } from "react-bootstrap"
const { Option } = Select;
import { get, initial, isEmpty} from "lodash";
import { useEffect,useState } from "react";
const DialogReason = (props) => {
  const codeLists = get(props,"codeLists",[]);
  const onVisible = get(props,'visible',false);
  const onFinish = get(props,"onFinish",()=>{});
  const onClose = get(props,"onClose",()=>{});
  const [form] = Form.useForm();
  const [submitDisable,setSubmitDisable] = useState(true);
  const [setValue,setSetValue] = useState([]);

  useEffect(()=>{
    form.resetFields();
  },[onVisible]);

  return <><Modal
  title={` `}
  visible={get(props,'visible',false)}
  closable={get(props,'closable',false)}
  bodyStyle={{marginTop : "0px"}}
  footer={[
    <Button key="back" className="btn-blue mr-2" disabled={submitDisable} onClick={()=>{ form.submit() }}>Confirm</Button>,
    <Button className="btn-orange" onClick={function(){
      form.resetFields();
      setSubmitDisable(true)
      onClose();
    }}>Close</Button>
  ]}
  >
    <Form
    layout="vertical"
    className="text-left"
    onFinish={(values)=>{
      onFinish(values);
      setSubmitDisable(true);
      // form.resetFields();

    }}
    onValuesChange={(changedValues, allValues)=>{
      if(Object.keys(allValues).filter(k=>isEmpty(allValues[k])).length==0){
        setSubmitDisable(false);
      }else{
        setSubmitDisable(true)
      }
    }}
    form={form}
    initialValues={setValue}
    >
    {get(props,'title',false)?<h5 className="mb-10"><b>{get(props,'title',"")}</b></h5>:<></>}
        <Form.Item name="code" required={false}  placeholder={`Select Reason`} rules={[{required : true, message: "'Reason' is required" }]} label={<>{`${get(props, 'mode', '')} Reason`} <span class="red">*</span></>}>
          <Select placeholder="-- Please Select --" className="ant-input-border-grey">
            {codeLists.map(r=><Select.Option value={get(r,"value")}>{get(r,"option")}</Select.Option>)}
          </Select>
        </Form.Item>
        <Form.Item rules={[{required : true, message: "'Note' is required" }]} required={false} name="note" label={<>Note <span class="red">*</span></>}>
          <Input />
        </Form.Item>
    </Form>
  </Modal></>
}

export default DialogReason;
2
