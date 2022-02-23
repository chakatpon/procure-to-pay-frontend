import ColumnDisplay from "@/shared/svg/ColumnDisplay.svg";
import { useEffect, useContext, useState } from "react";
import { StoreContext } from "@/context/store";
import _, { get, isEmpty, forEach, filter } from "lodash";
import { useTranslation } from "next-i18next";
import { Modal,Button } from "react-bootstrap";
import { Transfer } from 'antd';
import { B2PAPI } from "@/context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";
import BlockUi from "react-block-ui";
import Swal from "sweetalert2";
const mockData = [];
for (let i = 0; i < 20; i++) {
  mockData.push({
    key: i.toString(),
    title: `content${i + 1}`,
    description: `description of content${i + 1}`,
  });
}

const TableColumnDisplay = (props) => {
  const AppApi = B2PAPI(StoreContext);
  const { t, i18n } = useTranslation();
  const [currentColumns, setCurrentColumns] = useState([]);
  const [allColumns, setAllColumns] = useState([]);
  const [targetKeys, setTargetKeys] = useState([]);
  const [selectedKeys, setSelectedKeys] = useState([]);
  const { showAlertDialog } = useContext(StoreContext);

  const [saveLoading, setSaveLoading] = useState(false);
  const [saveLoadingText, setSaveLoadingText] = useState("Processing");

  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => { setShow(true); prepareData(); }

  const showLoading = (message) => {
    setSaveLoading(true);
    if (message) {
      setSaveLoadingText(message);
    } else {
      setSaveLoadingText("Processing");
    }
  };
  const hideLoading = () => {
    setSaveLoading(false);
    setSaveLoadingText("Processing");
  };

  const onChange = (nextTargetKeys, direction, moveKeys) => {
    console.log('targetKeys:', nextTargetKeys);
    console.log('direction:', direction);
    console.log('moveKeys:', moveKeys);
    setTargetKeys(nextTargetKeys);
  };

  const onSelectChange = (sourceSelectedKeys, targetSelectedKeys) => {
    console.log('sourceSelectedKeys:', sourceSelectedKeys);
    console.log('targetSelectedKeys:', targetSelectedKeys);
    setSelectedKeys([...sourceSelectedKeys, ...targetSelectedKeys]);
  };

  const onScroll = (direction, e) => {
    console.log('direction:', direction);
    console.log('target:', e.target);
  };

  useEffect(() => {
    // console.log('TableColumnDisplay','useEffect');

  },[props]);

  const prepareData = async() => {
    showLoading("Getting Columns Setting")
    setAllColumns([]);
    setTargetKeys([]);
    let displaycolumn = await AppApi.getApi(
      get(props,['get'],""),
      {},
      { method: "post", authorized: true }
    );
    if (displaycolumn.status != 200) {
      return false;
    }
    let allColumnList = get(displaycolumn,['data'],[]);
    allColumnList = allColumnList.sort(function(a,b) {
        return a.dvcColumnSeq - b.dvcColumnSeq;
    });

  allColumnList = allColumnList.map(r => {
      return {
        key : get(r,'columnFieldName',''),
        title :  get(r,'columnName',''),
        description : get(r,'columnName',''),
        attributes : r,
        disabled : get(r,'columnDefault',false),
      }
    });
    let currentColumnList = get(props,['current'],[]).map(r=>{
      if(allColumnList.map(l => l.key).includes(r.dataIndex)){

        return r.dataIndex;
      }
      return false
    })
    // console.log(allColumnList)
    setAllColumns(allColumnList);
    setTargetKeys(currentColumnList);
    hideLoading();
    return true;
  }
  const handleResetDefault = async() => {
    try{
      showLoading("Resetting Columns Setting");

      let displaycolumnReset = await AppApi.getApi(
        get(props,['default'],""),
        {},
        { method: "post", authorized: true }
      );
      if (displaycolumnReset.status != 200) {
        return false;
      }

      let allColumnList = get(displaycolumnReset,['data'],[]);
      allColumnList = allColumnList.sort(function(a,b) {
          return a.dvcColumnSeq - b.dvcColumnSeq;
      });

    allColumnList = allColumnList.map(r => {
        return {
          key : get(r,'columnFieldName',''),
          title :  get(r,'columnName',''),
          description : get(r,'columnName',''),
          attributes : r,
          disabled : get(r,'columnDefault',false),
        }
      });
      let currentColumnList = allColumnList.map(r=>{
        if(get(r,"attributes.columnDisplay")){
          return get(r,"attributes.columnFieldName");
        }
        return false
      }).filter(r=>r !== false)
      console.log(currentColumnList)
      setAllColumns(allColumnList);
      setTargetKeys(currentColumnList);
      hideLoading();
      return true;



      // get(props,['onReset'],() => {})();
    }catch(err){
      hideLoading();
      ErrorHandle(err)
    }
  }
  const handleSave = async() => {
    try{
      showLoading("Saving Columns Setting");
      let saveBody = targetKeys.map((r,i)=>{
        let s = allColumns.filter(c=> c.key==r);
        if(s.length){
          // console.log(s[0])
          return {
            "columnSeq": (i+1),
            "columnName": get(s,"0.attributes.columnName"),
            "columnFieldName": get(s,"0.attributes.columnFieldName"),
            "columnDisplay":  true,
            "columnDefault":  get(s,"0.attributes.columnDefault"),
          }
        }
        return false;
    }).filter(k => k !== false);
      let displaycolumnSave = await AppApi.getApi(
        get(props,['set'],""),
        { columnDisplayList : saveBody},
        { method: "post", authorized: true }
      );
      if (displaycolumnSave.status != 200) {
        return false;
      }
      handleClose();
      hideLoading();
      get(props,['onChange'],() => {})(targetKeys);
    }catch(err){
      hideLoading();
      ErrorHandle(err)
    }



  }

  return (
    <>
      <a onClick={handleShow} id="btnColumnDisplay" className="btn btn-blue-transparent mx-3 ml-auto">
        <ColumnDisplay /> {t("Column Display")}
      </a>
      <Modal show={show} onHide={handleClose} closeButton={props,['closeButton',false]} size="lg">
        <BlockUi
          tag="div"
          blocking={saveLoading}
          message={t(saveLoadingText)}
        >
        <Modal.Header closeButton></Modal.Header>
        <Modal.Body>
        <h4 className="text-left"><b>Column Display</b></h4>
        <Transfer
          dataSource={allColumns}
          showSearch
          listStyle={{
            width: 350,
            height: 400
          }}
          titles={['Avaliable Columns', 'Selected Columns']}
          targetKeys={targetKeys}
          selectedKeys={selectedKeys}
          onChange={onChange}
          onSelectChange={onSelectChange}
          onScroll={onScroll}
          render={item => item.title}
        />
        </Modal.Body>
        <Modal.Footer>

          <Button variant="outline-primary" onClick={handleResetDefault}>
            Reset Defaults
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
          <Button variant="warning" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
        </BlockUi>
      </Modal>
    </>
  );
};
export default TableColumnDisplay;
