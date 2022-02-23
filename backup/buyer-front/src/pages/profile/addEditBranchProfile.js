import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router'
import { Form, Button, Modal, Result, Radio } from 'antd';
import TextField from '@material-ui/core/TextField';
import { connect } from 'react-redux';

import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';


function addEditBranch(props) {
    const { blockUI, unblockUI } = props;
    const router = useRouter()

    const [branch, setBranch] = useState("Buyer")
    const [mode, setMode] = useState("add")
    const [id, setId] = useState("")

    const [showConfirmCard, setShowConfirmCard] = useState(false)
    const [showSuccessCard, setShowSuccessCard] = useState(false)

    const [buyerCode, setBuyerCode] = useState("0000")
    const [compCodeforiCash, setCompCodeforiCash] = useState("ตัวอย่าง")
    const [compCodeforiSupply, setCompCodeforiSupply] = useState("ตัวอย่าง")
    const [buyerNameTH, setBuyerNameTH] = useState("ตัวอย่าง")
    const [byerNameEN, setBuyerNameEN] = useState("Example")
    const [taxID, setTaxID] = useState("")
    const [branchCode, setBranchCode] = useState("")
    const [branchName, setBranchName] = useState("")
    const [vatBranchCode, setVatBranchCode] = useState("")
    const [vatBranchName, setVatBranchName] = useState("")
    const [addressDetail, setAddressDetail] = useState("")
    const [subdistrict, setSubdistrict] = useState("")
    const [district, setDistrict] = useState("")
    const [province, setProvince] = useState("")
    const [postcode, setPostcode] = useState("")

    const [companyStatus, setCompanyStatus] = useState("1")

    const [name1, setName1] = useState("")
    const [email1, setEmail1] = useState("")
    const [mobileNo1, setMobileNo1] = useState("")
    const [officeTelNo1, setOfficeTelNo1] = useState("")
    const [faxNo1, setFaxNo1] = useState("")

    const [name2, setName2] = useState("")
    const [email2, setEmail2] = useState("")
    const [mobileNo2, setMobileNo2] = useState("")
    const [officeTelNo2, setOfficeTelNo2] = useState("")
    const [faxNo2, setFaxNo2] = useState("")


    const [buyerCodeErr, setBuyerCodeErr] = useState(false)
    const [compCodeforiCashErr, setCompCodeforiCashErr] = useState(false)
    const [compCodeforiSupplyErr, setCompCodeforiSupplyErr] = useState(false)
    const [buyerNameTHErr, setBuyerNameTHErr] = useState(false)
    const [byerNameENErr, setBuyerNameENErr] = useState(false)
    const [taxIDErr, setTaxIDErr] = useState(false)
    const [branchCodeErr, setBranchCodeErr] = useState(false)
    const [branchNameErr, setBranchNameErr] = useState(false)
    const [addressDetailErr, setAddressDetailErr] = useState(false)
    const [subdistrictErr, setSubdistrictErr] = useState(false)
    const [districtErr, setDistrictErr] = useState(false)
    const [provinceErr, setProvinceErr] = useState(false)
    const [postcodeErr, setPostcodeErr] = useState(false)

    const [name1Err, setName1Err] = useState(false)
    const [email1Err, setEmail1Err] = useState(false)
    const [mobileNo1Err, setMobileNo1Err] = useState(false)
    const [officeTelNo1Err, setOfficeTelNo1Err] = useState(false)
    const [faxNo1Err, setFaxNo1Err] = useState(false)

    const [alertFormat1, setAlertFormat1] = useState(false)
    const [alertFormat2, setAlertFormat2] = useState(false)


    useEffect(async () => {
        unblockUI()
        const idForPath = router.query.id
        if (idForPath !== "undefined" && idForPath !== undefined && idForPath !== "") {
            setId(idForPath)
            setMode("edit")
        } else {
            setMode("add")
        }
    })


    const data = {
        buyerCode: buyerCode || "",
        buyerNameTH: buyerNameTH || "",
        compCodeforiCash: compCodeforiCash || "",
        compCodeforiSupply: compCodeforiSupply || "",
        byerNameEN: byerNameEN || "",
        taxID: taxID || "",
        branchCode: branchCode || "",
        branchName: branchName || "",
        addressDetail: addressDetail || "",
        subdistrict: subdistrict || "",
        district: district || "",
        province: province || "",
        postcode: postcode || "",
        vatBranchCode: vatBranchCode || "",
        vatBranchName: vatBranchName || "",
        companyStatus: companyStatus || "",
        name1: name1 || "",
        email1: email1 || "",
        mobileNo1: mobileNo1 || "",
        officeTelNo1: officeTelNo1 || "",
        faxNo1: faxNo1 || "",
        name2: name2 || "",
        email2: email2 || "",
        mobileNo2: mobileNo2 || "",
        officeTelNo2: officeTelNo2 || "",
        faxNo2: faxNo2 || ""
    }

    const checkEmailFormat = async () => {
        const emailFormat = /^.+@.+\..{2,3}$/
        if (email1) {
            if (!email1.match(emailFormat)) {
                setAlertFormat1(true)
            } else {
                setAlertFormat1(false)
            }
        }
        if (email2) {
            if (!email2.match(emailFormat)) {
                setAlertFormat2(true)
            } else {
                setAlertFormat2(false)
            }
        }
    }


    const onFinish = (values) => {
        console.log('Success:', values);
        setShowSuccessCard(true)
    };

    const onFinishFailed = (errorInfo) => {
        if (!email1) {
            setEmail1Err(true)
        } else {
            setEmail1Err(false)
        }

        setBuyerCodeErr(true)
        setCompCodeforiCashErr(true)
        setBuyerNameTHErr(true)
        setBuyerNameENErr(true)
        setTaxIDErr(true)
        setBranchCodeErr(true)
        setBranchNameErr(true)
        setAddressDetailErr(true)
        setSubdistrictErr(true)
        setDistrictErr(true)
        setProvinceErr(true)
        setPostcodeErr(true)
        setName1Err(true)
        setMobileNo1Err(true)
        setOfficeTelNo1Err(true)
        setFaxNo1Err(true)
    };

    return (
        <div className="row justify-content-md-center">
            <div className="col-7">
                {/* {console.log("mode", mode)} */}

                <div>
                    <div className="row bbl-font mt-3">

                        <p style={{ color: "#000" }}>
                            Profile &nbsp;
                            </p>

                        {'>'} &nbsp;

                            <p style={{ color: "#000" }}>
                            {branch} Profile &nbsp;
                            </p>

                        {'>'} &nbsp;

                            <a href='/profile/branchLists/' style={{ color: "#000" }}>
                            Branch List &nbsp;
                            </a>

                        {'>'} &nbsp;

                        <a>
                            <div className="bbl-font-bold">
                                Edit {branch} Branch Profile
                            </div>
                        </a>
                    </div>

                    <Modal
                        title=" "
                        visible={showConfirmCard}
                        // onOk={() => {
                        //     console.log("ok Confirm " + id)
                        //     setShowConfirmCard(false)
                        //     setShowSuccessCard(true)
                        // }}
                        onCancel={() => {
                            setShowConfirmCard(false)
                        }}
                        footer={[]}
                        closable={false}
                    >
                        <div className="mt-1">
                            <p className="text-center" style={{ fontSize: "17px" }}>
                                Please comfirm to Edit Branch Profile
                            </p>
                            <div className="row justify-content-md-center mt-4">
                                <Button
                                    className="bbl-btn-blue mr-3"
                                    shape="round"
                                    onClick={() => {
                                        console.log(`ok Confirm ${id}`)
                                        onFinish(data)
                                        setShowConfirmCard(false)
                                        setShowSuccessCard(true)
                                    }}
                                >
                                    Comfirm
                            </Button>
                                <Button
                                    className="bbl-btn-orange px-4"
                                    shape="round"
                                    onClick={() => {
                                        setShowConfirmCard(false)
                                    }}
                                >
                                    Close
                            </Button>
                            </div>
                        </div>
                    </Modal>

                    <Modal
                        title=" "
                        footer={[]}
                        visible={showSuccessCard}
                        closable={false}
                        onOk={() => {
                            console.log("ok success")
                            setShowSuccessCard(false)
                        }}
                        onCancel={() => {
                            setShowSuccessCard(false)
                        }}
                    >
                        <Result
                            status="success"
                            title={
                                <p>
                                    Edit Buyer Branch Profile Successfully.
                                </p>
                            }
                        />
                    </Modal>


                    <Form
                        name="basic"
                        initialValues={{
                            remember: true,
                        }}
                        onFinish={() => alertFormat1 || alertFormat2 ? "" : setShowConfirmCard(true)}
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
                                        {branch} Branch Profile
                            </div>
                                </div>
                            </div>

                            <Form.Item
                                // label="Company Legal Name"
                                name="buyerCode"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'กรุณากรอกข้อมูล Company Legal Name',
                                //     },
                                // ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={buyerCodeErr ? !buyerCode : false}
                                    // required
                                    id="buyerCode"
                                    disabled
                                    label={<div>Buyer Code </div>}
                                    variant="outlined"
                                    defaultValue={buyerCode}
                                    value={buyerCode}
                                    onChange={(e) => {
                                        setBuyerCode(e.target.value)
                                        setBuyerCodeErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="CompCode for iCash"
                                name="compCodeforiCash"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'กรุณากรอกข้อมูล CompCode for iCash',
                                //     },
                                // ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={compCodeforiCashErr ? !compCodeforiCash : false}
                                    // required
                                    id="compCodeforiCash"
                                    disabled
                                    label={<div>CompCode for iCash </div>}
                                    variant="outlined"
                                    defaultValue={compCodeforiCash}
                                    value={compCodeforiCash}
                                    onChange={(e) => {
                                        setCompCodeforiCash(e.target.value)
                                        setCompCodeforiCashErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="CompCode for iSupply"
                                name="compCodeforiSupply"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'กรุณากรอกข้อมูล CompCode for iSupply',
                                //     },
                                // ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={compCodeforiSupplyErr ? !compCodeforiSupply : false}
                                    // required
                                    id="compCodeforiSupply"
                                    disabled
                                    label={<div>CompCode for iSupply </div>}
                                    variant="outlined"
                                    defaultValue={compCodeforiSupply}
                                    value={compCodeforiSupply}
                                    onChange={(e) => {
                                        setCompCodeforiSupply(e.target.value)
                                        setCompCodeforiSupplyErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Company Code"
                                name="buyerNameTH"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'กรุณากรอกข้อมูล Company Code',
                                //     },
                                // ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={buyerNameTHErr ? !buyerNameTH : false}
                                    // required
                                    id="buyerNameTH"
                                    disabled
                                    label={<div>Buyer Name (TH)</div>}
                                    variant="outlined"
                                    defaultValue={buyerNameTH}
                                    value={buyerNameTH}
                                    onChange={(e) => {
                                        setBuyerNameTH(e.target.value)
                                        setBuyerNameTHErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Company Name"
                                name="byerNameEN"
                                // rules={[
                                //     {
                                //         required: true,
                                //         message: 'กรุณากรอกข้อมูล Company Name',
                                //     },
                                // ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={byerNameENErr ? !byerNameEN : false}
                                    // required
                                    id="byerNameEN"
                                    disabled
                                    label={<div>Buyer Name (EN)</div>}
                                    variant="outlined"
                                    defaultValue={byerNameEN}
                                    value={byerNameEN}
                                    onChange={(e) => {
                                        setBuyerNameEN(e.target.value)
                                        setBuyerNameENErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Tax ID"
                                name="taxID"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Tax ID',
                                    },
                                ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={taxIDErr ? !taxID : false}
                                    // required
                                    id="taxID"
                                    label={<div>Tax ID <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={taxID}
                                    value={taxID}
                                    onChange={(e) => {
                                        setTaxID(e.target.value)
                                        setTaxIDErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Branch Code"
                                name="branchCode"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Branch Code',
                                    },
                                ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={branchCodeErr ? !branchCode : false}
                                    // required
                                    id="branchCode"
                                    label={<div>Branch Code <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={branchCode}
                                    value={branchCode}
                                    onChange={(e) => {
                                        setBranchCode(e.target.value)
                                        setBranchCodeErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Branch Name"
                                name="branchName"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Branch Name',
                                    },
                                ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={branchNameErr ? !branchName : false}
                                    // required
                                    id="branchName"
                                    label={<div>Branch Name <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={branchName}
                                    value={branchName}
                                    onChange={(e) => {
                                        setBranchName(e.target.value)
                                        setBranchNameErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>


                            <Form.Item
                                // label="Vat Branch Code"
                                name="vatBranchCode"
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    // required
                                    id="vatBranchCode"
                                    label="Vat Branch Code"
                                    variant="outlined"
                                    defaultValue={vatBranchCode}
                                    value={vatBranchCode}
                                    onChange={(e) => {
                                        setVatBranchCode(e.target.value)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Vat Branch Name"
                                name="vatBranchName"
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    // required
                                    id="vatBranchName"
                                    label="Vat Branch Name"
                                    variant="outlined"
                                    defaultValue={vatBranchName}
                                    value={vatBranchName}
                                    onChange={(e) => {
                                        setVatBranchName(e.target.value)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Address Detail"
                                name="addressDetail"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Address Detail',
                                    },
                                ]}
                                style={{ width: "100%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={addressDetailErr ? !addressDetail : false}
                                    // required
                                    id="addressDetail"
                                    label={<div>Address Detail <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={addressDetail}
                                    value={addressDetail}
                                    onChange={(e) => {
                                        setAddressDetail(e.target.value)
                                        setAddressDetailErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Sub district"
                                name="subdistrict"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Sub district',
                                    },
                                ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={subdistrictErr ? !subdistrict : false}
                                    // required
                                    id="subdistrict"
                                    label={<div>Sub district <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={subdistrict}
                                    value={subdistrict}
                                    onChange={(e) => {
                                        setSubdistrict(e.target.value)
                                        setSubdistrictErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="District"
                                name="district"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล District',
                                    },
                                ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={districtErr ? !district : false}
                                    // required
                                    id="district"
                                    label={<div>District <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={district}
                                    value={district}
                                    onChange={(e) => {
                                        setDistrict(e.target.value)
                                        setDistrictErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Province"
                                name="province"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Province',
                                    },
                                ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={provinceErr ? !province : false}
                                    // required
                                    id="province"
                                    label={<div>Province <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={province}
                                    value={province}
                                    onChange={(e) => {
                                        setProvince(e.target.value)
                                        setProvinceErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Post code"
                                name="postcode"
                                rules={[
                                    {
                                        required: true,
                                        message: 'กรุณากรอกข้อมูล Post code',
                                    },
                                ]}
                                style={{ width: "49%" }}
                            >
                                <TextField
                                    className="mb-3"
                                    error={postcodeErr ? !postcode : false}
                                    // required
                                    id="postcode"
                                    label={<div>Post code <span className="text-danger">*</span></div>}
                                    variant="outlined"
                                    defaultValue={postcode}
                                    value={postcode}
                                    onChange={(e) => {
                                        setPostcode(e.target.value)
                                        setPostcodeErr(true)
                                    }}
                                    style={{ width: "100%" }}
                                />
                            </Form.Item>

                            <Form.Item
                                // label="Company Status"
                                name="companyStatus"
                                style={{ width: "100%" }}
                            >
                                <div style={{ width: "100%" }}>
                                    <p>Company Status</p>
                                    <Radio.Group
                                        defaultValue={companyStatus}
                                        value={companyStatus}
                                        onChange={(e) => {
                                            setCompanyStatus(e.target.value)
                                            setCompanyStatusErr(true)
                                        }}
                                    >
                                        <Radio value="1">Active</Radio>
                                        <Radio value="2">Inactive</Radio>
                                    </Radio.Group>
                                </div>
                            </Form.Item>

                            <Form.Item
                                // label="Logo"
                                className="mt-2"
                                name="logo"
                                style={{ width: "100%" }}
                            >
                                <div style={{ width: '100%' }}>
                                    <p>Buyer Logo</p>
                                    <Button className="bbl-btn-blue mr-2 mb-3" shape="round" onClick={() => { }}>
                                        Upload Photo
                                    </Button>
                                </div>
                            </Form.Item>

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

                            <div className="person-card">
                                <div className="person-header">
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
                                    // label="Name"
                                    name="name1"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'กรุณากรอกข้อมูล Name',
                                        },
                                    ]}
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        error={name1Err ? !name1 : false}
                                        // required
                                        id="name1"
                                        label={<div>Name <span className="text-danger">*</span></div>}
                                        variant="outlined"
                                        defaultValue={name1}
                                        value={name1}
                                        onChange={(e) => {
                                            setName1(e.target.value)
                                            setName1Err(true)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>


                                <Form.Item
                                    // label="Email"
                                    name="email1"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'กรุณากรอกข้อมูล Email',
                                        },
                                    ]}
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        error={email1Err ? !email1 : alertFormat1}
                                        // required
                                        id="email1"
                                        label={<div>Email <span className="text-danger">*</span></div>}
                                        variant="outlined"
                                        defaultValue={email1}
                                        value={email1}
                                        onChange={(e) => {
                                            setEmail1(e.target.value)
                                            setAlertFormat1(false)
                                            setEmail1Err(true)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                                {alertFormat1 ?
                                    <p className="text-danger" style={{ marginTop: "-3%" }}>
                                        รูปแบบข้อมูล Email ไม่ถูกต้อง
                                        </p>
                                    :
                                    ""
                                }

                                <Form.Item
                                    // label="Mobile No."
                                    name="mobileNo1"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'กรุณากรอกข้อมูล Mobile No.',
                                        },
                                    ]}
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        error={mobileNo1Err ? !mobileNo1 : false}
                                        // required
                                        id="mobileNo1"
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        label={<div>Mobile No. <span className="text-danger">*</span></div>}
                                        variant="outlined"
                                        defaultValue={mobileNo1}
                                        value={mobileNo1}
                                        onChange={(e) => {
                                            setMobileNo1(e.target.value)
                                            setMobileNo1Err(true)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    // label="Office Tel No."
                                    name="officeTelNo1"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'กรุณากรอกข้อมูล Office Tel No.',
                                        },
                                    ]}
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        error={officeTelNo1Err ? !officeTelNo1 : false}
                                        // required
                                        id="officeTelNo1"
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        label={<div>Office Tel No. <span className="text-danger">*</span></div>}
                                        variant="outlined"
                                        defaultValue={officeTelNo1}
                                        value={officeTelNo1}
                                        onChange={(e) => {
                                            setOfficeTelNo1(e.target.value)
                                            setOfficeTelNo1Err(true)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    // label="Fax No."
                                    name="faxNo1"
                                    rules={[
                                        {
                                            required: true,
                                            message: 'กรุณากรอกข้อมูล Fax No.',
                                        },
                                    ]}
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        error={faxNo1Err ? !faxNo1 : false}
                                        // required
                                        id="faxNo1"
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        label={<div>Fax No. <span className="text-danger">*</span></div>}
                                        variant="outlined"
                                        defaultValue={faxNo1}
                                        value={faxNo1}
                                        onChange={(e) => {
                                            setFaxNo1(e.target.value)
                                            setFaxNo1Err(true)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </div>



                            <div className="person-card">
                                <div className="person-header">
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
                                    // label="Name"
                                    name="name2"
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        // required
                                        id="name2"
                                        label="Name"
                                        variant="outlined"
                                        defaultValue={name2}
                                        value={name2}
                                        onChange={(e) => {
                                            setName2(e.target.value)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>


                                <Form.Item
                                    // label="Email"
                                    name="email2"
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        // required
                                        id="email2"
                                        error={alertFormat2}
                                        label="Email"
                                        variant="outlined"
                                        defaultValue={email2}
                                        value={email2}
                                        onChange={(e) => {
                                            setEmail2(e.target.value)
                                            setAlertFormat2(false)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                                {alertFormat2 ?
                                    <p className="text-danger" style={{ marginTop: "-3%" }}>
                                        รูปแบบข้อมูล Email ไม่ถูกต้อง
                                        </p>
                                    :
                                    ""
                                }

                                <Form.Item
                                    // label="Mobile No."
                                    name="mobileNo2"
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        // required
                                        id="mobileNo2"
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        label="Mobile No."
                                        variant="outlined"
                                        defaultValue={mobileNo2}
                                        value={mobileNo2}
                                        onChange={(e) => {
                                            setMobileNo2(e.target.value)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    // label="Office Tel No."
                                    name="officeTelNo2"
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        className="mb-3"
                                        // required
                                        id="officeTelNo2"
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        label="Office Tel No."
                                        variant="outlined"
                                        defaultValue={officeTelNo2}
                                        value={officeTelNo2}
                                        onChange={(e) => {
                                            setOfficeTelNo2(e.target.value)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>

                                <Form.Item
                                    // label="Fax No."
                                    name="faxNo2"
                                    style={{ width: "100%" }}
                                >
                                    <TextField
                                        onKeyDown={(e) => {
                                            if (!["0", "1", "2", "3",
                                                "4", "5", "6", "7", "8",
                                                "9", "Backspace", "Tab"].includes(e.key)) {
                                                return e.preventDefault();
                                            }
                                        }}
                                        className="mb-3"
                                        // required
                                        id="faxNo2"
                                        label="Fax No."
                                        variant="outlined"
                                        defaultValue={faxNo2}
                                        value={faxNo2}
                                        onChange={(e) => {
                                            setFaxNo2(e.target.value)
                                        }}
                                        style={{ width: "100%" }}
                                    />
                                </Form.Item>
                            </div>

                        </div>

                        <div className="row justify-content-md-center mt-3 mb-3">
                            <Button
                                className="bbl-btn-blue mr-2 px-5"
                                shape="round"
                                htmlType="submit"
                                onClick={() => { checkEmailFormat() }}
                            >
                                Submit
                        </Button>

                            <Button
                                className="bbl-btn-blue-light px-5"
                                shape="round"
                                onClick={() => {
                                    blockUI()
                                    window.history.back()
                                }}
                            >
                                Back
                        </Button>
                        </div>

                    </Form>

                </div>
            </div>
        </div>
    )
}

const mapStateToProps = (state) => ({
});

const mapDispatchToProps = (dispatch) => ({
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(addEditBranch);