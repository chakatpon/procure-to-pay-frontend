import {Radio, Space } from "antd";
import { get } from "lodash";

const RadioList = (props) =>{
  return (<Radio.Group value={get(props, "currentSeleted")} onChange={(event) => get(props, "onChangeSeleted")(event.target.value)}>
  <Space size={15} direction="vertical">
    {get(props, "data").map((value, index) => {
    return <Radio value={index}>{get(value, "accountNo")}<span className="ml-8">{get(value, "defualtFlag") == "Y" ? "(Default)" : ''}</span></Radio>
  })}
  </Space>
  </Radio.Group>)
}

export default RadioList;
