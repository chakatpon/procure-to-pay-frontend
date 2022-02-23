import React, { useState, useEffect, useRef, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import { connect } from 'react-redux';
import {
  Form, Button, Modal, Result, Switch, Checkbox,
  Breadcrumb, Input, Radio, Upload, Select, Table, InputNumber
} from 'antd';
import ImgCrop from 'antd-img-crop';
import _ from "lodash";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";
import BBLTableList from '../components/BBLTableList';
import DialogConfirm from "@/shared/components/DialogConfirm";

import { B2PAPI } from "../../context/api";


export default function addEditBuyer(props) {
  const router = useRouter();
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select;
  const { TextArea } = Input;
  const [form] = Form.useForm();

  const [id, setId] = useState("")
  const [mode, setMode] = useState("Create")
  const [editPerposal, setEditPerposal] = useState(false)

  const [data, setData] = useState([])

  const [initialDataForm, setInitialDataForm] = useState({
    buyerCode: '',
    companyType: "1",
    companyStatus: "1",
    financing: "1",
    iCashCustomerType: "1"
  });

  const [dataSource, setDataSource] = useState([])
  const [selectKeys, setSelectKeys] = useState([])

  const [dataPOGR, setDataPOGR] = useState([])
  const [dataMatching, setDataMatching] = useState([])
  const [dataPaymentMethod, setdataPaymentMethod] = useState([])

  const [formPaymentMethod, setFormPaymentMethod] = useState([
    { key: 'directCredit', value: "0" },
    { key: 'smartSameDay', value: "0" },
    { key: 'smartNextDay', value: "0" },
    { key: 'promtpaySameDay', value: "0" },
    { key: 'promtpayNextDay', value: "0" },
    { key: 'bathnet', value: "0" },
  ])

  const [approveConfirmModalShow, setApproveConfirmModalShow] = useState(false);
  const handleApproveConfirmModalClose = () => setApproveConfirmModalShow(false);
  const handleApproveConfirmModalShow = () => { setApproveConfirmModalShow(true); }

  const [onSubmit, setOnSubmit] = useState(false)
  const [paymentisNull, setPaymentisNull] = useState(false)

  const [buyerCodeErr, setBuyerCodeErr] = useState("")

  const [status, setStatus] = useState("")

  const [legalName, setLegalName] = useState([]);
  const [prepaymentValidationType, setPrepaymentValidationType] = useState([]);

  const [userPicture, setUserPicture] = useState(null);
  const [fileList, setFileList] = useState([]);

  const [alertPaymentInfo, setAlertPaymentInfo] = useState(false)
  const [alertPaymentInfoMessage, setAlertPaymentInfoMessage] = useState("")

  const [swicthDefault, setSwicthDefault] = useState("")

  const [uploadErr, setUploadErr] = useState(true);
  const [uploadErrMessage, setuploadErrMessage] = useState('');

  const [messageApi, setMessageApi] = useState('');


  useEffect(async () => {
    await initialForm()
    if (context.buyerApprovalDetailId !== "") {
      setMode("Edit")
      setId(context.buyerApprovalDetailId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/buyer/profile/waitingApproval', {
        "id": context.buyerApprovalDetailId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        await initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    } else if (context.buyerDetailId !== "") {
      setMode("Edit")
      setId(context.buyerDetailId)
      const dataDetail = await AppApi.getApi('p2p/api/v1/view/buyer/profile', {
        "buyerCode": context.buyerDetailId
      }, {
        method: "post", authorized: true,
      })
      if (dataDetail.status == 200) {
        await initialData(dataDetail.data)
      } else {
        showAlertDialog({
          text: dataDetail.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
    else {
      setDataPOGR([
        { key: 'poSupplierRequiredFlag', process: 'Require Supplier Approve PO', check: false },
        { key: 'grSupplierRequiredFlag', process: 'Require Supplier Approve GR', check: false },
        { key: 'autoGrantGRFlag', process: 'Allow Supplier Match PO with GR', check: false },
      ])
      setDataMatching([
        { key: 'actionTwoWayFlag', matching: 'Require 2 Way Matching', check: false },
        { key: 'forceMatchedTwoWayFlag', matching: 'Require 2 Way Force Match', check: false },
        { key: 'forceMatchedThreeWayFlag', matching: 'Require 3 Way Force Match', check: false },
        { key: 'approveMatchedThreeWayFlag', matching: 'Require Approve 3 Way Matching', check: false },
      ])
    }
    hideLoading()
  }, []);

  const initialForm = async () => {
    showLoading("Loading")

    const legalNameData = await AppApi.getApi('p2p/api/v1/legalName', {}, {
      method: "get", authorized: true,
    })
    setLegalName(legalNameData.data)
    if (context.buyerApprovalDetailId === "" && context.buyerDetailId === "") {
    }

    const prepaymentValidationTypeData = await AppApi.getApi('p2p/api/v1/get/prePaymentValidationType', {}, {
      method: "get", authorized: true,
    })
    setPrepaymentValidationType(prepaymentValidationTypeData.data)

    const productCodeData = await AppApi.getApi('p2p/api/v1/get/productCodeByPaymentCode', {}, {
      method: "get", authorized: true,
    })

    setdataPaymentMethod([
      { key: 'directCredit', paymentService: 'Direct Credit', select: _.get(productCodeData, 'data.directCredit', '') },
      { key: 'smartSameDay', paymentService: 'SMART Same Day', select: _.get(productCodeData, 'data.smartSameDay', '') },
      { key: 'smartNextDay', paymentService: 'SMART Next Day', select: _.get(productCodeData, 'data.smartNextDay', '') },
      { key: 'promtpaySameDay', paymentService: 'Promtpay Same Day', select: _.get(productCodeData, 'data.promtpaySameDay', '') },
      { key: 'promtpayNextDay', paymentService: 'Promtpay Next Day', select: _.get(productCodeData, 'data.promtpayNextDay', '') },
      { key: 'bathnet', paymentService: 'BAHTNET', select: _.get(productCodeData, 'data.bathnet', '') },
    ])
  }

  const initialData = async (data) => {

    setData(data)

    setFormPaymentMethod([
      { key: 'directCredit', value: data.directCredit != null ? data.directCredit : "0" },
      { key: 'smartSameDay', value: data.smartSameDay != null ? data.smartSameDay : "0" },
      { key: 'smartNextDay', value: data.smartNextDay != null ? data.smartNextDay : "0" },
      { key: 'promtpaySameDay', value: data.promtpaySameDay != null ? data.promtpaySameDay : "0" },
      { key: 'promtpayNextDay', value: data.promtpayNextDay != null ? data.promtpayNextDay : "0" },
      { key: 'bathnet', value: data.bathnet != null ? data.bathnet : "0" },
    ])


    setDataPOGR([
      { key: 'poSupplierRequiredFlag', process: 'Require Supplier Approve PO', check: _.get(data, 'poSupplierRequiredFlag', false) },
      { key: 'grSupplierRequiredFlag', process: 'Require Supplier Approve GR', check: _.get(data, 'grSupplierRequiredFlag', false) },
      { key: 'autoGrantGRFlag', process: 'Allow Supplier Match PO with GR', check: _.get(data, 'autoGrantGRFlag', false) },
    ])

    setDataMatching([
      { key: 'actionTwoWayFlag', matching: 'Require 2 Way Matching', check: _.get(data, 'actionTwoWayFlag', false) },
      { key: 'forceMatchedTwoWayFlag', matching: 'Require 2 Way Force Match', check: _.get(data, 'forceMatchedTwoWayFlag', false) },
      { key: 'forceMatchedThreeWayFlag', matching: 'Require 3 Way Force Match', check: _.get(data, 'forceMatchedThreeWayFlag', false) },
      { key: 'approveMatchedThreeWayFlag', matching: 'Require Approve 3 Way Matching', check: _.get(data, 'approveMatchedThreeWayFlag', false) },
    ])

    setStatus(_.get(data, 'statusCode', ""))

    if (_.get(data, 'statusCode', "") == "PFK03" || _.get(data, 'statusCode', "") == "PFB04") {
      setEditPerposal(true)
    }

    const buyerDetail = {
      buyerLegalName: _.get(data, 'buyerLegalName', ""),
      buyerCode: _.get(data, 'buyerCompCode', ''),
      compCodeforiCash: _.get(data, 'buyerCompCodeiCash', ""),
      buyerCompCodeiSupply: _.get(data, 'buyerCompCodeiSupply', ""),
      buyerNameTH: _.get(data, 'buyerCompNameTH', ""),
      buyerNameEN: _.get(data, 'buyerCompNameEN', ""),
      taxID: _.get(data, 'buyerTaxId', ""),
      branchCode: _.get(data, 'buyerBranchCode', ""),
      branchName: _.get(data, 'buyerBranchName', ""),
      vatBranchCode: _.get(data, 'vatBranchCode', ""),
      vatBranchName: _.get(data, 'vatBranchName', ""),
      financing: _.get(data, 'isFinancing', "") == true ? "1" : "2",
      iCashCustomerType: _.get(data, 'isPreAuthorize', "") == true ? "1" : "2",
      prePaymentValidationType: _.get(data, 'prePaymentValidationType', ""),
      addressDetail: _.get(data, 'addressDetail', ""),
      subdistrict: _.get(data, 'subDistrict', ""),
      district: _.get(data, 'district', ""),
      province: _.get(data, 'province', ""),
      postcode: _.get(data, 'postcode', ""),
      companyType: _.get(data, 'isMainCompany', "") == true ? "1" : "2",
      companyStatus: _.get(data, 'isActive', "") == true ? "1" : "2",
      name1: _.get(data, 'contactInfo[0].name', ""),
      email1: _.get(data, 'contactInfo[0].email', ""),
      mobileNo1: _.get(data, 'contactInfo[0].mobileTelNo', ""),
      officeTelNo1: _.get(data, 'contactInfo[0].officeTelNo', ""),
      faxNo1: _.get(data, 'contactInfo[0].fax', ""),
      name2: _.get(data, 'contactInfo[1].name', ""),
      email2: _.get(data, 'contactInfo[1].email', ""),
      mobileNo2: _.get(data, 'contactInfo[1].mobileTelNo', ""),
      officeTelNo2: _.get(data, 'contactInfo[1].officeTelNo', ""),
      faxNo2: _.get(data, 'contactInfo[1].fax', "")
    }

    if (_.get(data, 'directCredit', "") != null && _.get(data, 'directCredit', "") != '') {
      const directCredit = { directCredit: _.get(data, 'directCredit', "") }
      Object.assign(buyerDetail, directCredit)
    }
    if (_.get(data, 'smartSameDay', "") != null && _.get(data, 'smartSameDay', "") != '') {
      const smartSameDay = { smartSameDay: _.get(data, 'smartSameDay', "") }
      Object.assign(buyerDetail, smartSameDay)
    }
    if (_.get(data, 'smartNextDay', "") != null && _.get(data, 'smartNextDay', "") != '') {
      const smartNextDay = { smartNextDay: _.get(data, 'smartNextDay', "") }
      Object.assign(buyerDetail, smartNextDay)
    }
    if (_.get(data, 'promtpaySameDay', "" && _.get(data, 'promtpaySameDay', "") != '') != null) {
      const promtpaySameDay = { promtpaySameDay: _.get(data, 'promtpaySameDay', "") }
      Object.assign(buyerDetail, promtpaySameDay)
    }
    if (_.get(data, 'promtpayNextDay', "") != null && _.get(data, 'promtpayNextDay', "") != '') {
      const promtpayNextDay = { promtpayNextDay: _.get(data, 'promtpayNextDay', "") }
      Object.assign(buyerDetail, promtpayNextDay)
    }
    if (_.get(data, 'bathnet', "") != null && _.get(data, 'bathnet', "") != '') {
      const bathnet = { bathnet: _.get(data, 'bathnet', "") }
      Object.assign(buyerDetail, bathnet)
    }


    if (_.get(data, 'paymentInfo', "")) {
      const key = _.get(data, 'paymentInfo', "").map((item, index) => _.set(item, 'key', index + 1))
      const no = key.map((item, index) => _.set(item, 'no', index + 1))
      // const accountNo = no.map((item, index) =>
      // _.set(item, 'accoun tNo', _.get(data, 'paymentInfo.accountNo', "")))
      const dataSort = no
      setDataSource(dataSort)

      _.get(data, 'paymentInfo', "").filter((member, index) => {
        if (member.isDefault == true) {
          // console.log(index);
          setSwicthDefault(index)
        }
      })
    } else {
      setSwicthDefault("")
    }

    setInitialDataForm(buyerDetail)
    form.setFieldsValue(buyerDetail);

    if (_.get(data, 'buyerLogo', '')) {
      const buyerPictureDetail = _.get(data, 'buyerLogo', '');

      // ------ process for show user piceture in FileList ------------
      const fileObject = [
        {
          uid: '-1',
          name: _.get(data, 'buyerLogoName', ''),
          status: 'done',
          url: `data:image/png;base64,${buyerPictureDetail}`,
          thumbUrl: `data:image/png;base64,${buyerPictureDetail}`,
        },
      ];
      // ---- variable for show file list on Upload ---
      // console.log(fileObject);
      setFileList(fileObject);
      /* --------------- end of process ---------------*/

      // --------------- process for convert Base64 to File ------------
      let arr = `data:image/png;base64,${buyerPictureDetail}`.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);

      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }

      const fileOldPicture = new File([u8arr], _.get(data, 'buyerLogoName', ''), {
        type: mime,
      });
      setUserPicture(fileOldPicture);
      /* --------------- end of process ---------------*/
    }

  }

  const columnsPaymentMethod = [
    {
      title: 'Payment Service',
      dataIndex: 'paymentService',
      key: 'paymentService',
      width: '60%',
    },
    {
      title: 'Product Code',
      dataIndex: 'productCode',
      key: 'productCode',
      align: 'center',
      render: (text, record, index) => (
        <Form.Item
          name={record.key}
          style={{ width: "100%" }}
        >
          <Select
            className="ant-select ant-select-single ant-select-show-arrow ant-select-open"
            defaultValue={mode == "Edit" ? _.get(data, record.key, '') != null ? _.get(data, record.key, '') : "" : ""}
            onChange={(e) => {
              setFormPaymentMethod(formPaymentMethod => (
                formPaymentMethod.map(
                  oldData => (oldData.key == dataPaymentMethod[index].key ? Object.assign(oldData, { value: e }) : oldData)
                )
              ));
            }}
            style={{ width: "60%" }}
          >
            <Option className="ant-select-selection-item" key="" value="">
              Not Registered
            </Option>
            {
              (dataPaymentMethod[index].select).map((items) => {
                return (
                  <Option
                    value={items}
                  >
                    {items}
                  </Option>
                )
              })
            }
          </Select>
        </Form.Item>
      )
    }
  ];

  const columnsPOGR = [
    // {
    //   title: 'No.',
    //   dataIndex: 'no',
    //   key: 'no',
    //   width: '20%',
    //   // align: 'center',
    //   render: (text, record, index) => (
    //     <p> {index + 1} </p>
    //   ),
    // },
    {
      title: 'PO and GR Process',
      dataIndex: 'process',
      key: 'process',
      width: '60%',
      // align: 'center',
    },
    {
      title: 'Setup On-chain',
      dataIndex: 'setupOnChain',
      key: 'setupOnChain',
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          defaultChecked={dataPOGR[index].check}
          // disabled={true}
          onChange={(e) => {
            _.set(dataPOGR[index], 'check', e.target.checked)
          }}
        />
      )
    }
  ];

  const columnsMatching = [
    // {
    //   title: 'No.',
    //   dataIndex: 'no',
    //   key: 'no',
    //   width: '20%',
    //   // align: 'center',
    //   render: (text, record, index) => (
    //     <p> {index + 1} </p>
    //   ),
    // },
    {
      title: 'Matching Process',
      dataIndex: 'matching',
      key: 'matching',
      width: '60%',
      // align: 'center',
    },
    {
      title: 'Setup On-chain',
      dataIndex: 'setupOnChain',
      key: 'setupOnChain',
      align: 'center',
      render: (text, record, index) => (
        <Checkbox
          defaultChecked={dataMatching[index].check}
          // disabled={true}
          onChange={(e) => {
            _.set(dataMatching[index], 'check', e.target.checked)
          }}
        />
      )
    }
  ];

  const columnsPaymentInfo = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Account No.',
      dataIndex: 'accountNo',
      key: 'accountNo',
      editable: true,
      align: 'center',
    },
    {
      title: 'Account Name',
      dataIndex: 'accountName',
      key: 'accountName',
      editable: true,
      width: '40%',
      align: 'center',
    },
    {
      title: 'Default',
      dataIndex: 'default',
      key: 'isDefault',
      render: ((text, record, index) =>
        <Switch
          switchKey={index}
          checked={swicthDefault !== "" ? index === swicthDefault : false}
          disabled={swicthDefault !== "" ? index !== swicthDefault : false}
          onChange={(e) => {
            if (e) {
              setSwicthDefault(index)
              if ((index + 1) == _.get(record, 'key')) {
                _.set(record, 'isDefault', true)
              }
            } else {
              if ((index + 1) == _.get(record, 'key')) {
                _.set(record, 'isDefault', false)
              }
              setSwicthDefault("")
            }

            if (dataSource.length == "0") {
              setAlertPaymentInfo(true)
              setAlertPaymentInfoMessage("Please fill in Buyer Payment Info")
            }
            else if (e == false) {
              setAlertPaymentInfo(true)
              setAlertPaymentInfoMessage("Please fill in Default")
            }
            else {
              setAlertPaymentInfo(false)
              setAlertPaymentInfoMessage("")
            }
          }}
        />
      )
    }
  ];

  const checkPaymentInfoAndPhoto = async () => {
    setOnSubmit(true)

    // console.log(dataSource)
    // console.log(swicthDefault)
    // console.log(paymentisNull)
    // console.log(swicthDefault == "")

    if (dataSource.length == "0") {
      // console.log("dataSource")
      setAlertPaymentInfo(true)
      setAlertPaymentInfoMessage("Please fill in Buyer Payment Info")
    } else if (swicthDefault.length == "0") {
      // console.log(swicthDefault)
      setAlertPaymentInfo(true)
      setAlertPaymentInfoMessage("Please fill in Default")
    }
    else {
      setAlertPaymentInfo(false)
      setAlertPaymentInfoMessage("")
    }

    if (dataSource) {
      // console.log(dataSource);
      dataSource.map((item) => {
        if (item.accountName == "") {
          // console.log("accountName", item.accountName);
          setPaymentisNull(true)
        }
        if (item.accountNo == "") {
          // console.log("accountNo", item.accountNo);
          setPaymentisNull(true)
        }
      })
    } else {
      console.log("dataSource is required");
    }

    if (!userPicture) {
      setUploadErr(true);
      setuploadErrMessage('Please upload in Buyer Picture');
    } else {
      setUploadErr(false);
    }

  }

  const onFinish = async () => {
    showLoading("Loading")

    const contactInfo = []
    if (_.get(initialDataForm, 'name2', '') !== "" &&
      _.get(initialDataForm, 'email2', '') !== "" &&
      _.get(initialDataForm, 'mobileNo2', '') !== "" &&
      _.get(initialDataForm, 'officeTelNo2', '') !== "") {
      contactInfo.push({
        name: _.get(initialDataForm, 'name1', ''),
        email: _.get(initialDataForm, 'email1', ''),
        mobileTelNo: _.get(initialDataForm, 'mobileNo1', ''),
        officeTelNo: _.get(initialDataForm, 'officeTelNo1', ''),
        fax: _.get(initialDataForm, 'faxNo1', ''),
      },
        {
          name: _.get(initialDataForm, 'name2', ''),
          email: _.get(initialDataForm, 'email2', ''),
          mobileTelNo: _.get(initialDataForm, 'mobileNo2', ''),
          officeTelNo: _.get(initialDataForm, 'officeTelNo2', ''),
          fax: _.get(initialDataForm, 'faxNo2', '')
        })
    } else {
      contactInfo.push({
        name: _.get(initialDataForm, 'name1', ''),
        email: _.get(initialDataForm, 'email1', ''),
        mobileTelNo: _.get(initialDataForm, 'mobileNo1', ''),
        officeTelNo: _.get(initialDataForm, 'officeTelNo1', ''),
        fax: _.get(initialDataForm, 'faxNo1', ''),
      }
      )
    }

    const contactList = []
    _.forEach(contactInfo, (value) => {
      // console.log(value);
      contactList.push(JSON.stringify(value));
    });


    const paymentList = []
    _.forEach(dataSource, (value) => {
      // console.log(value);
      paymentList.push(JSON.stringify(value));
    });
    // console.log(paymentList);

    // const test = JSON.stringify(contactInfo);

    const data = {
      buyerLegalName: _.get(initialDataForm, 'buyerLegalName', ''),
      buyerCompCode: _.get(initialDataForm, 'buyerCode', ''),
      buyerCompCodeiCash: _.get(initialDataForm, 'compCodeforiCash', ''),
      // buyerCompCodeiSupply: _.get(initialDataForm, 'buyerCompCodeiSupply', '') ,
      buyerCompNameTH: _.get(initialDataForm, 'buyerNameTH', ''),
      buyerCompNameEN: _.get(initialDataForm, 'buyerNameEN', ''),
      buyerTaxId: _.get(initialDataForm, 'taxID', ''),
      buyerBranchCode: _.get(initialDataForm, 'branchCode', ''),
      buyerBranchName: _.get(initialDataForm, 'branchName', ''),
      isFinancing: _.get(initialDataForm, 'financing', '') == "2" ? false : true,
      isPreAuthorize: _.get(initialDataForm, 'iCashCustomerType', '') == "2" ? false : true,
      prePaymentValidationType: _.get(initialDataForm, 'prePaymentValidationType', ''),
      // paymentCondition:  _.get(initialDataForm, 'paymentCondition', '') ,
      addressDetail: _.get(initialDataForm, 'addressDetail', ''),
      province: _.get(initialDataForm, 'province', ''),
      district: _.get(initialDataForm, 'district', ''),
      subDistrict: _.get(initialDataForm, 'subdistrict', ''),
      postcode: _.get(initialDataForm, 'postcode', ''),
      isMainCompany: _.get(initialDataForm, 'companyType', '') == "2" ? false : true,
      isActive: _.get(initialDataForm, 'companyStatus', '') == "2" ? false : true,

      contactInfo: _.join(contactList, ','),

      paymentInfo: _.join(paymentList, ','),
    }

    for (let i = 0; i < formPaymentMethod.length; i++) {
      if (formPaymentMethod[i].value != "0" && formPaymentMethod[i].value != "") {
        _.set(data, formPaymentMethod[i].key, formPaymentMethod[i].value);
      }
    }

    for (let i = 0; i < dataPOGR.length; i++) {
      _.set(data, dataPOGR[i].key, dataPOGR[i].check);
    }

    for (let i = 0; i < dataMatching.length; i++) {
      _.set(data, dataMatching[i].key, dataMatching[i].check);
    }

    if (_.get(initialDataForm, 'buyerCompCodeiSupply', '')) {
      _.set(data, 'buyerCompCodeiSupply', _.get(initialDataForm, 'buyerCompCodeiSupply', ''));
    }
    if (_.get(initialDataForm, 'vatBranchCode', '')) {
      _.set(data, 'vatBranchCode', _.get(initialDataForm, 'vatBranchCode', ''));
    }
    if (_.get(initialDataForm, 'vatBranchName', '')) {
      _.set(data, 'vatBranchName', _.get(initialDataForm, 'vatBranchName', ''));
    }

    // if (paymentList) {
    //   _.set(data, 'paymentInfo', _.join(paymentList, ','));
    // }
    // if (paymentCondition) {
    //   _.set(data, 'paymentCondition', paymentCondition);
    // }
    if (userPicture) {
      _.set(data, 'buyerLogo', userPicture);
    }

    if (mode === "Edit" && id !== "" && editPerposal) {
      _.set(data, 'id', id);
    }

    const formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (mode === "Create") {
      const addApi = await AppApi.getApi('/p2p/api/v1/create/buyer/profile', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })
      if (addApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: addApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/buyerApprovalLists'
        })

        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/buyerApprovalLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
      else if (addApi.data.message == "Company code is already in use. ") {
        hideLoading()
        setBuyerCodeErr("Buyer Code is already exist.")
        onFinishFailed()
      } else {
        hideLoading()

        showAlertDialog({
          text: addApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })

        // console.log(addApi.message);
      }
    }
    else if (mode === "Edit" && (status == "PFK03" || status == "PFB04")) {
      const editApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/profile/proposal', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })
      if (editApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/buyerApprovalLists'
        })

        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/buyerApprovalLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      } else {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    } else if (mode === "Edit" && (status == "PFK09" || status == "PFK08" || status == "PFB08")) {
      const editApi = await AppApi.getApi('/p2p/api/v1/edit/buyer/profile', formData, {
        'Content-Type': 'multipart/form-data',
        method: "post",
        authorized: true,
      })

      if (editApi.status == 200) {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "success",
          showCloseButton: false,
          showConfirmButton: true,
          routerLink: '/profile/buyerLists'
        })

        // const timeOut = setTimeout(() => {
        //   Router.push({
        //     pathname: '/profile/buyerLists',
        //   });
        //   clearTimeout(timeOut);
        // }, 4000);
      }
      else {
        hideLoading()

        showAlertDialog({
          text: editApi.data.message,
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: true,
        })
      }
    }
  };

  const onFinishFailed = () => {
    const firstErrorField = document.querySelector(".ant-form-item-has-error");
    if (firstErrorField !== null) {
      firstErrorField.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });
    }
  }

  const propsUpload = {
    listType: 'picture',
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file) => {
      if (file.type !== 'image/png' && file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
        setUploadErr(true);
        setuploadErrMessage('Invalid file type.');
        return Upload.LIST_IGNORE;
      }

      if (file.size / 1024 > 200) {
        setUploadErr(true);
        setuploadErrMessage('Picture must smaller than 200KB.');
        return Upload.LIST_IGNORE;
      }
      setUploadErr(false);
      setuploadErrMessage('');
      return true;
    },
    onChange: ({ file, fileList }) => {
      // console.log(fileList);
      setFileList(fileList);
      if (fileList.length > 0) {
        setUserPicture(fileList[0].originFileObj);
      } else {
        setUserPicture(null);
      }

      // if (file.status === 'done') {
      //   setFileList(fileList);
      //   setUserPicture(fileList[0].originFileObj);
      // }
    },
  };

  const handleAdd = () => {
    // console.log(dataSource.length + 1);
    if (dataSource.length + 1 <= 10) {
      if (onSubmit) {
        if (swicthDefault.length == "0") {
          // console.log("swicthDefault")
          setAlertPaymentInfo(true)
          setAlertPaymentInfoMessage("Please fill in Default")
        }
        else {
          setAlertPaymentInfo(false)
          setAlertPaymentInfoMessage("")
        }
      } else {
        setAlertPaymentInfo(false)
        setAlertPaymentInfoMessage("")
      }

      const newData = {
        key: "",
        no: "",
        accountNo: '',
        accountName: '',
        isDefault: false
      };

      const newKey = [...dataSource, newData].map((item, index) => _.set(item, 'key', index + 1))
      const newNo = newKey.map((item, index) => _.set(item, 'no', index + 1))
      // const newAccountNo = newNo.map((item, index) => _.set(item, 'accountNo', ''))
      const newDataSort = newNo

      // console.log(newAccountNo);
      setDataSource(newDataSort)
      // setCount(count + 1)
    }
  };

  const handleSave = (row) => {
    // setAlertPaymentInfo(false)
    // setAlertPaymentInfoMessage("")

    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });
    setDataSource(newData)
  };

  const handleDelete = async () => {
    // console.log(dataSource.length + 1);

    if (dataSource.length == "0") {
      setAlertPaymentInfo(true)
      setAlertPaymentInfoMessage("Please fill in Buyer Payment Info")
    } else {
      setAlertPaymentInfo(false)
      setAlertPaymentInfoMessage("")
    }
    // console.log(selectKeys); // [2,4]
    setSelectKeys([])

    const results = dataSource.filter(data => !selectKeys.some(data2 => data.key === data2));

    const newKey = results.map((item, index) => _.set(item, 'key', index + 1))
    const newNo = newKey.map((item, index) => _.set(item, 'no', index + 1))
    // const newAccountNo = newNo.map((item, index) => _.set(item, 'accountNo', index !== 9 ?
    // `0000${index + 1}` : "00010"))
    const newDataSort = newNo

    setDataSource(newDataSort)

    // console.log(selectKeys.filter((item) => item == swicthDefault + 1));
    if (selectKeys.filter((item) => item == swicthDefault + 1).length !== 0) {
      setSwicthDefault("")
    }

  };

  const EditableCell = ({
    title,
    editable,
    children,
    dataIndex,
    record,
    handleSave,
    error,
    ...restProps
  }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);
    const form = useContext(EditableContext);
    useEffect(() => {
      if (editing) {
        inputRef.current.focus();
      }
    }, [editing]);

    const toggleEdit = () => {
      setPaymentisNull(false)
      setEditing(!editing);
      form.setFieldsValue({
        [dataIndex]: record[dataIndex] === "-- กรุณากรอก --" || record[dataIndex] === "00000" ?
          record[""] : record[dataIndex],
      });
    };

    const save = async () => {
      try {
        const values = await form.validateFields();
        toggleEdit();
        handleSave({ ...record, ...values });
      } catch (errInfo) {
        // console.log('Save failed:', errInfo);
      }
    };

    let childNode = children;

    if (editable) {
      childNode = editing ? (
        <Form.Item
          style={{
            margin: 0,
          }}
          name={dataIndex}
          rules={[
            {
              required: true,
              message: `Please fill in ${title}`,
            },
          ]}
        >
          <Input ref={inputRef}
            onKeyDown={(e) => {
              if (title == "Account No.") {
                if (!["0", "1", "2", "3",
                  "4", "5", "6", "7", "8",
                  "9", "Backspace", "Tab",
                  "Shift", "ArrowLeft", "ArrowRight", "Control"
                ].includes(e.key)) {
                  return e.preventDefault();
                }
              }
            }}
            maxLength={title == "Account No." ? "10" : ""}
            onPressEnter={save}
            onBlur={save} />
        </Form.Item>
      )
        :
        (
          // children[1] !== '' ?
          <div
            className="editable-cell-value-wrap"
            style={{
              height: 24,
              paddingRight: 24,
              // backgroundColor: children[1] ? "" : "red",
            }}
            onClick={toggleEdit}
          >
            {children[1] ?
              children
              :
              <div>
                <Input
                  onKeyDown={(e) => {
                    if (title == "Account No.") {
                      if (!["0", "1", "2", "3",
                        "4", "5", "6", "7", "8",
                        "9", "Backspace", "Tab",
                        "Shift", "ArrowLeft", "ArrowRight", "Control"
                      ].includes(e.key)) {
                        return e.preventDefault();
                      }
                    }
                  }}
                  style={onSubmit ? { borderColor: "#ff4d4f" } : {}}
                />
                {onSubmit ?
                  <p className="ant-form-item-explain ant-form-item-explain-error">
                    Please fill in {title}
                  </p>
                  :
                  ""
                }
              </div>
            }
          </div>
        );
    }
    return <td {...restProps}>{childNode}</td>;
  };

  const EditableContext = React.createContext(null);
  const EditableRow = ({ index, ...props }) => {
    const [formPeyment] = Form.useForm();
    return (
      <Form
        // form={form}
        form={formPeyment}
        name="basic"
        component={false}
      >
        <EditableContext.Provider
          // value={form}
          value={formPeyment}
        >
          <tr {...props} />
        </EditableContext.Provider>
      </Form>
    );
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const editColumns = columnsPaymentInfo.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectKeys(selectedRowKeys)
    },
    // getCheckboxProps: (record) => ({
    //   disabled: record.name === 'Disabled User',
    //   name: record.name,
    // }),
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-7">

        <div className="row bbl-font mt-3 mb-3">
          <Breadcrumb separator=">">
            <Breadcrumb.Item className="breadcrumb-item">
              Profile
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item">
              Buyer Profile
            </Breadcrumb.Item>
            <Breadcrumb.Item className="breadcrumb-item">
              {mode === 'Edit' && editPerposal ? (
                <a
                  onClick={() => {
                    showLoading("Loading")
                    Router.push({
                      pathname: "/profile/buyerApprovalLists",
                    });
                  }}
                // href="/profile/buyerApprovalLists/"
                >
                  Buyer Profile Approval Lists
                </a>
              )
                :
                (
                  <a
                    onClick={() => {
                      showLoading("Loading")
                      Router.push({
                        pathname: "/profile/buyerLists",
                      });
                    }}
                  // href="/profile/buyerLists/"
                  >
                    Buyer Profile Lists
                  </a>
                )
              }
            </Breadcrumb.Item>
            {/* {mode === 'Edit' ? ( */}
            <Breadcrumb.Item className="breadcrumb-item active">
              {mode} Buyer Profile
            </Breadcrumb.Item>
            {/* )
              :
              (
                <Breadcrumb.Item className="breadcrumb-item active">
                  Create Buyer Profile
                </Breadcrumb.Item>
              )
            } */}
          </Breadcrumb>
        </div>

        <DialogConfirm
          visible={approveConfirmModalShow}
          closable={false}
          onFinish={() => {
            onFinish();
            handleApproveConfirmModalClose(false);
          }}
          onClose={() => { handleApproveConfirmModalClose() }}
        >
          {mode === 'Edit' ?
            "Please confirm to Edit this Buyer Profile ?"
            :
            "Please confirm to Submit this Buyer Profile ?"
          }
        </DialogConfirm>


        <Form
          form={form}
          name="basic"
          layout="vertical"
          initialValues={initialDataForm}
          onFinish={() => uploadErr || paymentisNull || alertPaymentInfo ?
            "" : handleApproveConfirmModalShow()
          }
          // scrollToFirstError={{ behavior: "smooth", inline: "center", block: "center" }}
          onFinishFailed={onFinishFailed}
        >

          <div className="row justify-content-between">

            <div
              className="mb-4"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Buyer Profile
                </div>
              </div>
            </div>


            <Form.Item
              label="Buyer Legal Name"
              name="buyerLegalName"
              defaultValue=""
              rules={[
                {
                  required: true,
                  message: 'Please select Buyer Legal Name',
                },
              ]}
              style={{ width: "100%" }}
            >

              <Select
                // value={buyerLegalName}
                // disabled={mode === "Edit" && !editPerposal}
                defaultValue=""
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerLegalName: e });
                  // setBuyerLegalName(e)
                }}
                disabled={mode === "Edit" && !editPerposal}
              >
                <Option hidden key="" value="">
                  -- Please Select --
                </Option>
                {legalName.map((item) => (
                  <Option key={item.id} value={item.legalName}>
                    {item.legalName}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              // label="Company Legal Name"
              label="Buyer Code"
              name="buyerCode"
              // defaultValue={buyerCode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Buyer Code',
                },
                {
                  validator: (rule, value) => {
                    if (buyerCodeErr == "Buyer Code is already exist." && value !== '' && value !== undefined) {
                      return Promise.reject('Buyer Code is already exist.');
                    } else {
                      return Promise.resolve();
                    }
                  }
                }
              ]}
              {...(buyerCodeErr == "Buyer Code is already exist." && {
                // hasFeedback: true,
                help:
                  "Buyer Code is already exist.",
                validateStatus: "error",
              })}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerCodeErr ? !buyerCode : false}
                // required
                error
                id="buyerCode"
                disabled={mode === "Edit" && !editPerposal}
                // label={<div>Buyer Code </div>}
                variant="outlined"
                // value={buyerCode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerCode: e.target.value });
                  setBuyerCodeErr("")
                  // setBuyerCode(e.target.value)
                  // setBuyerCodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Company Type"
              name="companyType"
              // defaultValue={companyType}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Company Type'
                }
              ]}
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={companyType}
                disabled={mode === "Edit" && !editPerposal}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, companyType: e.target.value });
                  // setCompanyType(e.target.value)
                  // setCompanyTypeErr(true)
                }}
              >
                <Radio value="1">Main Company</Radio>
                <Radio value="2">Sub Company</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="Financing"
              // defaultValue={financing}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Financing',
                },
              ]}
              name="financing"
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={financing}
                onChange={(e) => {
                  setInitialDataForm({
                    ...initialDataForm,
                    financing: e.target.value,
                  });

                  form.resetFields(["buyerCompCodeiSupply"]);
                  // setFinancing(e.target.value)
                  // setFinancingErr(true)
                }}
              >
                <Radio value="1">Yes</Radio>
                <Radio value="2">No</Radio>
              </Radio.Group>
            </Form.Item>

            <Form.Item
              label="CompCode for iCash"
              name="compCodeforiCash"
              // defaultValue={compCodeforiCash}
              rules={[
                {
                  required: true,
                  message: 'Please fill in CompCode for iCash',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={compCodeforiCashErr ? !compCodeforiCash : false}
                // required
                id="compCodeforiCash"
                // disabled
                // label={<div>CompCode for iCash </div>}
                variant="outlined"
                // value={compCodeforiCash}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, compCodeforiCash: e.target.value });
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="CompCode for iSupply"
              name="buyerCompCodeiSupply"
              rules={[
                {
                  required: _.get(initialDataForm, 'financing', '') == "1",
                  message: 'Please fill in CompCode for iSupply',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                id="buyerCompCodeiSupply"
                maxLength="6"
                variant="outlined"
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerCompCodeiSupply: e.target.value });
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            {/* --------- Setup Payment Method --------------- */}
            <Form.Item
              label="iCash Customer Type"
              // defaultValue={iCashCustomerType}
              rules={[
                {
                  required: true,
                  message: 'Please fill in iCash Customer Type',
                },
              ]}
              name="iCashCustomerType"
              style={{ width: "100%" }}
            >
              <Radio.Group
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, iCashCustomerType: e.target.value });
                }}
              >
                <Radio value="1">Pre-Authorize</Radio>
                <Radio value="2">Non-Authorize</Radio>
              </Radio.Group>
            </Form.Item>
            {/*   --------- End ---------------- */}

            <Form.Item
              label="Payment Validation Type"
              name="prePaymentValidationType"
              defaultValue=""
              rules={[
                {
                  required: true,
                  message: 'Please select Payment Validation Type',
                },
              ]}
              style={{ width: "100%" }}
            >

              <Select
                // value={prePaymentValidationType}
                defaultValue=""
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, prePaymentValidationType: e });
                }}
              // disabled={mode === "Edit" && !editPerposal}
              >
                <Option hidden key="" value="">
                  -- Please Select --
                </Option>
                {prepaymentValidationType.map((item) => (
                  <Option key={item.value} value={item.value}>
                    {item.description}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="BuyerName (TH)"
              name="buyerNameTH"
              // defaultValue={buyerNameTH}
              rules={[
                {
                  required: true,
                  message: 'Please fill in BuyerName (TH)',
                },
                {
                  validator: (rule, value) => {
                    // console.log(value);
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== '' && value !== undefined
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[\u0E00-\u0E7F0-9-().\\s]+$').test(value) && value !== '' && value !== undefined) {
                      return Promise.reject('Please fill in Thai Language');
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                // {
                //   pattern: new RegExp("^[ก-ฮะ-์]+$"),
                //   message: "Please Fill in Thai Langauge"
                // }
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerNameTHErr ? !buyerNameTH : false}
                // required
                id="buyerNameTH"
                // disabled
                // label={<div>Buyer Name (TH)</div>}
                variant="outlined"
                // value={buyerNameTH}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerNameTH: e.target.value });
                  // setBuyerNameTH(e.target.value)
                  // setBuyerNameTHErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="BuyerName (EN)"
              name="buyerNameEN"
              // defaultValue={buyerNameEN}
              rules={[
                {
                  required: true,
                  message: 'Please fill in BuyerName (EN)',
                },
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } else if (!new RegExp('^[A-Za-z0-9-().\\s]+$').test(value) && value !== '') {
                      return Promise.reject('Please fill in English Language');
                    } else {
                      return Promise.resolve();
                    }
                  },
                },
                // {
                //   pattern: new RegExp("^[a-zA-Z]+$"),
                //   message: "Please Fill in English Langauge"
                // }
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={buyerNameENErr ? !buyerNameEN : false}
                // required
                id="buyerNameEN"
                // disabled
                // label={<div>Buyer Name (EN)</div>}
                variant="outlined"
                // value={buyerNameEN}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, buyerNameEN: e.target.value });
                  // setBuyerNameEN(e.target.value)
                  // setBuyerNameENErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Tax ID"
              name="taxID"
              // defaultValue={taxID}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Tax ID',
                },
                {
                  min: 13,
                  message: 'Please enter a valid number 13 digit',
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={taxIDErr ? !taxID : false}
                // required
                maxLength="13"
                id="taxID"
                // label={<div>Tax ID <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={taxID}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, taxID: e.target.value });
                  // setTaxID(e.target.value)
                  // setTaxIDErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Branch Code"
              name="branchCode"
              // defaultValue={branchCode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Branch Code',
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={branchCodeErr ? !branchCode : false}
                // required
                disabled={mode === "Edit" && !editPerposal}
                id="branchCode"
                // label={<div>Branch Code <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={branchCode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, branchCode: e.target.value });
                  // setBranchCode(e.target.value)
                  // setBranchCodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Branch Name"
              name="branchName"
              // defaultValue={branchName}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Branch Name',
                },
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } return Promise.resolve();
                  },
                },
              ]}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                // error={branchNameErr ? !branchName : false}
                // required
                id="branchName"
                // label={<div>Branch Name <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={branchName}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, branchName: e.target.value });
                  // setBranchName(e.target.value)
                  // setBranchNameErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>


            <Form.Item
              label="Vat Branch Code"
              name="vatBranchCode"
              // defaultValue={vatBranchCode}
              style={{ width: "100%" }}
            >
              <Input
                className="mb-3"
                maxLength="5"
                onKeyDown={(e) => {
                  if (!["0", "1", "2", "3",
                    "4", "5", "6", "7", "8",
                    "9", "Backspace", "Tab",
                    "Shift", "ArrowLeft", "ArrowRight", "Control"
                  ].includes(e.key)) {
                    return e.preventDefault();
                  }
                }}
                // required
                id="vatBranchCode"
                // label="Vat Branch Code"
                variant="outlined"
                // value={vatBranchCode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, vatBranchCode: e.target.value });
                  // setVatBranchCode(e.target.value)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Vat Branch Name"
              // defaultValue={vatBranchName}
              name="vatBranchName"
              style={{ width: "100%" }}
              rules={[
                {
                  validator: (rule, value) => {
                    // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                    if (
                      !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                      value !== ''
                    ) {
                      return Promise.reject(
                        'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                      );
                    } return Promise.resolve();
                  },
                },
              ]}
            >
              <Input
                className="mb-3"
                // required
                id="vatBranchName"
                // label="Vat Branch Name"
                variant="outlined"
                // value={vatBranchName}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, vatBranchName: e.target.value });
                  // setVatBranchName(e.target.value)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>


            {/* <Form.Item
                label="Payment Condition"
                name="paymentCondition"
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="paymentCondition"
                  // label="Payment Condition"
                  variant="outlined"
                  defaultValue={paymentCondition}
                  value={paymentCondition}
                  onChange={(e) => {
                    setPaymentCondition(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item> */}

            <Form.Item
              label="Address Detail"
              name="addressDetail"
              // defaultValue={addressDetail}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Address Detail',
                },
              ]}
              style={{ width: "100%" }}
            >
              <TextArea
                className="mb-3"
                rows={3}
                // error={addressDetailErr ? !addressDetail : false}
                // required
                id="addressDetail"
                // label={<div>Address Detail <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={addressDetail}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, addressDetail: e.target.value });
                  // setAddressDetail(e.target.value)
                  // setAddressDetailErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Province"
              name="province"
              // defaultValue={province}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Province',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={provinceErr ? !province : false}
                // required
                id="province"
                // label={<div>Province <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={province}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, province: e.target.value });
                  // setProvince(e.target.value)
                  // setProvinceErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="District"
              name="district"
              // defaultValue={district}
              rules={[
                {
                  required: true,
                  message: 'Please fill in District',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={districtErr ? !district : false}
                // required
                id="district"
                // label={<div>District <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={district}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, district: e.target.value });
                  // setDistrict(e.target.value)
                  // setDistrictErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Sub district"
              name="subdistrict"
              // defaultValue={subdistrict}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Sub district',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                // error={subdistrictErr ? !subdistrict : false}
                // required
                id="subdistrict"
                // label={<div>Sub district <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={subdistrict}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, subdistrict: e.target.value });
                  // setSubdistrict(e.target.value)
                  // setSubdistrictErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Post code"
              name="postcode"
              // defaultValue={postcode}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Post code',
                },
                {
                  min: 5,
                  message: 'Pleas enter a valid number 5 digit',
                },
              ]}
              style={{ width: "49%" }}
            >
              <Input
                className="mb-3"
                id="postcode"
                maxLength="5"
                onKeyDown={(e) => {
                  if (!["0", "1", "2", "3",
                    "4", "5", "6", "7", "8",
                    "9", "Backspace", "Tab",
                    "Shift", "ArrowLeft", "ArrowRight", "Control"
                  ].includes(e.key)) {
                    return e.preventDefault();
                  }
                }}
                // label={<div>Post code <span className="text-danger">*</span></div>}
                variant="outlined"
                // value={postcode}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, postcode: e.target.value });
                  // setPostcode(e.target.value)
                  // setPostcodeErr(true)
                }}
                style={{ width: "100%" }}
              />
            </Form.Item>

            <Form.Item
              label="Company Status"
              name="companyStatus"
              // defaultValue={companyStatus}
              rules={[
                {
                  required: true,
                  message: 'Please fill in Company Status'
                }
              ]}
              style={{ width: "100%" }}
            >
              <Radio.Group
                // value={companyStatus}
                onChange={(e) => {
                  setInitialDataForm({ ...initialDataForm, companyStatus: e.target.value });
                  // setCompanyStatus(e.target.value)
                  // setCompanyStatusErr(true)
                }}
              >
                <Radio value="1">Active</Radio>
                <Radio value="2">Inactive</Radio>
              </Radio.Group>
            </Form.Item>


            <Form.Item
              label="Buyer Picture"
              name="buyerPicture"
              className="mb-3"
              rules={[
                {
                  required: uploadErr,
                  message: '',
                },
              ]}
              style={{ width: '100%' }}
            >
              <div className="row ml-2" style={{ width: '100%' }}>
                {/* <p className="text-danger">
                    * &nbsp;
                  </p>
                  <p>
                    Buyer Picture
                  </p> */}
              </div>
              <ImgCrop grid modalTitle="Crop Buyer Picture" modalWidth={300}>
                <Upload {...propsUpload}>
                  <span className="ant-upload" role="button">
                    <Button className="btn btn-blue mr-4 mb-3" shape="round">
                      Upload Photo
                    </Button>
                  </span>
                  {uploadErr && <span style={{ color: "#ff4d4f" }}>{uploadErrMessage}</span>}
                </Upload>
              </ImgCrop>
            </Form.Item>

            {/* --------- Setup Payment Method --------------- */}
            <div
              className="mt-3 mb-3"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Setup Payment Method
                </div>
              </div>
            </div>

            <Table
              className="table-header-blue mb-5"
              columns={columnsPaymentMethod}
              dataSource={dataPaymentMethod}
              pagination={false}
              bordered={false}
              style={{ width: "100%" }}
            />

            {/*   --------- End ---------------- */}


            <div
              className="mt-3 mb-3"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Setup Document Process
                </div>
              </div>
            </div>

            {/* <Button onClick={() => {
              console.log(dataPOGR)
            }}>
              aaa
            </Button> */}

            <Table
              className="table-header-blue mb-5"
              columns={columnsPOGR}
              dataSource={dataPOGR}
              pagination={false}
              bordered={false}
              style={{ width: "100%" }}
            />

            <Table
              className="table-header-blue mb-5"
              columns={columnsMatching}
              dataSource={dataMatching}
              pagination={false}
              bordered={false}
              style={{ width: "100%" }}
            />


            <div
              className="mt-3 mb-3"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Contact Person
                </div>
              </div>
            </div>

            <div style={{
              border: "2px solid #a7a5a5",
              padding: "2%",
              borderRadius: "25px",
              width: "100%",
              marginTop: "2%",
              marginBottom: "2%",
            }}>
              <div style={{
                width: "13%",
                borderRadius: "8px",
                border: "2px solid #a7a5a5",
                background: "#a7a5a5",
                marginTop: "-4%",
                marginBottom: "2%",
              }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>
                  Person 1
                </div>
              </div>

              <Form.Item
                label="Name"
                name="name1"
                // defaultValue={name1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Name',
                  },
                  {
                    validator: (rule, value) => {
                      // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                      if (
                        !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                        value !== ''
                      ) {
                        return Promise.reject(
                          'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                        );
                      } return Promise.resolve();
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={name1Err ? !name1 : false}
                  // required
                  id="name1"
                  variant="outlined"
                  // value={name1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, name1: e.target.value });
                    // setName1(e.target.value)
                    // setName1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>


              <Form.Item
                label="Email"
                name="email1"
                // defaultValue={email1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Email',
                  },
                  {
                    validator: (rule, value = '') => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                        && value !== '') {
                        return Promise.reject('Please fill in English Language');
                      } else if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                        return Promise.reject('Invalid email format');
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={email1Err ? !email1 : alertFormat1}
                  // required
                  id="email1"
                  // label={<div>Email <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={email1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, email1: e.target.value });
                    // setEmail1(e.target.value)
                    // setAlertFormat1(false)
                    // setEmail1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              {/* {alertFormat1 ?
                  <p style={{ marginTop: "-3%", marginLeft: "9%", color: '#ff4d4f' }}>
                    The Format of Email is Invalid
                  </p>
                  :
                  ""
                } */}

              <Form.Item
                label="Mobile No."
                name="mobileNo1"
                // defaultValue={mobileNo1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Mobile No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={mobileNo1Err ? !mobileNo1 : false}
                  // required
                  id="mobileNo1"
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3",
                      "4", "5", "6", "7", "8",
                      "9", "Backspace", "Tab",
                      "Shift", "ArrowLeft", "ArrowRight", "Control"
                    ].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  // label={<div>Mobile No. <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={mobileNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, mobileNo1: e.target.value });
                    // setMobileNo1(e.target.value)
                    // setMobileNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Office Tel No."
                name="officeTelNo1"
                // defaultValue={officeTelNo1}
                rules={[
                  {
                    required: true,
                    message: 'Please fill in Office Tel No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={officeTelNo1Err ? !officeTelNo1 : false}
                  // required
                  id="officeTelNo1"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  variant="outlined"
                  // value={officeTelNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, officeTelNo1: e.target.value });
                    // setOfficeTelNo1(e.target.value)
                    // setOfficeTelNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Fax No."
                name="faxNo1"
                // defaultValue={faxNo1}
                // rules={[
                //   {
                //     required: true,
                //     message: 'Please fill in Fax No.',
                //   },
                // ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // error={faxNo1Err ? !faxNo1 : false}
                  // required
                  id="faxNo1"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  // label={<div>Fax No. <span className="text-danger">*</span></div>}
                  variant="outlined"
                  // value={faxNo1}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, faxNo1: e.target.value });
                    // setFaxNo1(e.target.value)
                    // setFaxNo1Err(true)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>


            <div style={{
              border: "2px solid #a7a5a5",
              padding: "2%",
              borderRadius: "25px",
              width: "100%",
              marginTop: "2%",
              marginBottom: "2%",
            }}>
              <div style={{
                width: "13%",
                borderRadius: "8px",
                border: "2px solid #a7a5a5",
                background: "#a7a5a5",
                marginTop: "-4%",
                marginBottom: "2%",
              }}
              >
                <div
                  style={{
                    color: "#ffffff",
                    fontWeight: "bold",
                    textAlign: "center"
                  }}>
                  Person 2
                </div>
              </div>

              <Form.Item
                label="Name"
                name="name2"
                // defaultValue={name2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Name',
                  },
                  {
                    validator: (rule, value) => {
                      // console.log(new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value));
                      if (
                        !new RegExp('^[\u0E00-\u0E7FA-Za-z0-9-().\\s]+$').test(value) &&
                        value !== ''
                      ) {
                        return Promise.reject(
                          'The only special characters allowed are:  Dash (-), Full stop (.), Brackets (), Space',
                        );
                      } return Promise.resolve();
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="name2"
                  label="Name"
                  variant="outlined"
                  // value={name2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, name2: e.target.value });
                    // setName2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>


              <Form.Item
                label="Email"
                name="email2"
                // defaultValue={email2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Email',
                  },
                  {
                    validator: (rule, value = '') => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value)
                        && value !== '') {
                        return Promise.reject('Please fill in English Language');
                      } else if (!value.match(/^.+@.+\..{2,3}$/) && value !== '') {
                        return Promise.reject('Invalid email format');
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="email2"
                  // error={alertFormat2}
                  label="Email"
                  variant="outlined"
                  // value={email2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, email2: e.target.value });
                    // setEmail2(e.target.value)
                    // setAlertFormat2(false)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
              {/* {alertFormat2 ?
                  <p style={{ marginTop: "-3%", marginLeft: "9%", color: '#ff4d4f' }}>
                    The Format of Email is Invalid
                  </p>
                  :
                  ""
                } */}

              <Form.Item
                label="Mobile No."
                name="mobileNo2"
                // defaultValue={mobileNo2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Mobile No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="mobileNo2"
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3",
                      "4", "5", "6", "7", "8",
                      "9", "Backspace", "Tab",
                      "Shift", "ArrowLeft", "ArrowRight", "Control"
                    ].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  label="Mobile No."
                  variant="outlined"
                  // value={mobileNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, mobileNo2: e.target.value });
                    // setMobileNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Office Tel No."
                name="officeTelNo2"
                // defaultValue={officeTelNo2}
                rules={[
                  {
                    required: _.get(initialDataForm, 'officeTelNo2', '') ||
                      _.get(initialDataForm, 'email2', '') ||
                      _.get(initialDataForm, 'mobileNo2', '') ||
                      _.get(initialDataForm, 'name2', '') ||
                      _.get(initialDataForm, 'faxNo2', ''),
                    message: 'Please fill in Office Tel No.',
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  // required
                  id="officeTelNo2"
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  label="Office Tel No."
                  variant="outlined"
                  // value={officeTelNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, officeTelNo2: e.target.value });
                    // setOfficeTelNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Fax No."
                name="faxNo2"
                // defaultValue={faxNo2}
                style={{ width: "100%" }}
              >
                <Input
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3",
                  //     "4", "5", "6", "7", "8",
                  //     "9", "Backspace", "Tab",
                  //     "Shift", "ArrowLeft", "ArrowRight", "Control"
                  //   ].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  className="mb-3"
                  // required
                  id="faxNo2"
                  label="Fax No."
                  variant="outlined"
                  // value={faxNo2}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, faxNo2: e.target.value });
                    // setFaxNo2(e.target.value)
                  }}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </div>


            <div
              className="mt-3 mb-4"
              style={{
                width: "100%",
                height: "auto",
                background: "#f7f7f7",
                boxSizing: "border-box"
              }}
            >
              <div
                style={{
                  color: "#333333",
                  fontWeight: "bold",
                  verticalAlign: "middle",
                  marginLeft: "1%",
                  display: "table-cell",
                  height: "40px"
                }}>
                <div className="ml-3">
                  Buyer Payment Info
                </div>
              </div>
            </div>

            <div style={{ width: "-webkit-fill-available" }}>
              <Button
                onClick={() => handleAdd()}
                className="btn btn-blue"
                shape="round"
                style={{
                  marginBottom: 16,
                }}
              >
                Add
              </Button>
              <Button
                onClick={() => handleDelete()}
                className="btn btn-orange ml-2"
                shape="round"
                style={{
                  marginBottom: 16,
                }}
              >
                Delete
              </Button>
              <Table
                className="table-header-blue"
                components={components}
                rowClassName={() => 'editable-row'}
                pagination={false}
                rowSelection={{
                  selectedRowKeys: selectKeys,
                  ...rowSelection
                }}
                bordered={false}
                columns={editColumns}
                dataSource={dataSource}
              />
              {alertPaymentInfo ?
                <div className="mt-3" style={{ color: "#ff4d4f" }}>
                  {alertPaymentInfoMessage}
                </div>
                :
                ""
              }
            </div>


          </div>

          <div className="row justify-content-md-center mt-5">
            <Button
              className="btn btn-blue"
              shape="round"
              htmlType="submit"
              onClick={() => {
                checkPaymentInfoAndPhoto()
                setOnSubmit(true)
              }}
            // onClick={() => { onTest() }}
            >
              Submit
            </Button>

            <Button
              className="btn btn-blue-transparent ml-5"
              shape="round"
              onClick={() => {
                showLoading("Loading")
                window.history.back()
              }}
            >
              Back
            </Button>
          </div>

        </Form>

      </div>
    </div>
  );
}

addEditBuyer.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}