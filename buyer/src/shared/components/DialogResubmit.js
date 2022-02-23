import {Form , Modal , Select , Input, Button} from "antd";
import { Button as BSButton } from "react-bootstrap"
const { Option } = Select;
import { get} from "lodash";
import { useEffect } from "react";
const DialogResubmit = (props) => {
  const codeLists = get(props,"codeLists",[]);
  const onFinish = get(props,"onFinish",()=>{});
  const onClose = get(props,"onClose",()=>{});
  const confirmDisabled = get(props,"confirmDisabled",true);
  const [form] = Form.useForm();
  useEffect(()=>{
    form.resetFields();
  });

  return <><Modal
  title={` `}
  content={` `}
  centered={get(props,'center',false)}
  visible={get(props,'visible',false)}
  closable={get(props,'closable',false)}
  bodyStyle={{marginTop : "0px"}}
  width={get(props,'width',570)}
  footer={[
    <Button key="confirm" disabled={confirmDisabled} className="btn-blue mr-2" onClick={()=>{ form.submit() }}>Confirm</Button>,
    <Button key="close" className="btn-orange" onClick={onClose}>Close</Button>
  ]}
  >
    <Form
    layout="vertical"
    className={get(props,'className',"")}
    onFinish={onFinish}
    form={form}
    initialValues={{code : "" , note : ""}}
    >
    {get(props,'title',false)?<h5 className="mb-10 text-left" style={{color : "#003399"}}><b>{get(props,'title',"")}</b></h5>:<></>}
    {get(props,'content',false)?<h6 className="mb-7 ml-10 text-left" style={{color : "#333333"}}>{get(props,'content',"")}<span class="red"> *</span></h6>:<></>}
    {props.children}
    </Form>
  </Modal></>
}

export default DialogResubmit;
