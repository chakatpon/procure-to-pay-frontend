import {Form , Modal , Select , Input, Button} from "antd";
const { Option } = Select;
import { get} from "lodash";
import { useEffect } from "react";
const DialogConfirm = (props) => {
  const codeLists = get(props,"codeLists",[]);
  const onFinish = get(props,"onFinish",()=>{});
  const onClose = get(props,"onClose",()=>{});
  const [form] = Form.useForm();
  useEffect(()=>{
    form.resetFields();
  });

  return <><Modal
  title={` `}
  visible={get(props,'visible',false)}
  closable={get(props,'closable',false)}
  bodyStyle={{marginTop : "0px"}}
  footer={[
    <Button key="confirm" className="btn-blue" onClick={()=>{ form.submit() }}>Confirm</Button>,
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
    {get(props,'title',false)?<h5 className="mb-10"><b>{get(props,'title',"")}</b></h5>:<></>}
    {props.children}
    </Form>
  </Modal></>
}

export default DialogConfirm;
