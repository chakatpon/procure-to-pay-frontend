import React, { useState, useEffect } from 'react';
import Router ,{ useRouter } from 'next/router';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

import _ from 'lodash';

// ----------------- api -------------
import * as UserProfileApi from '../api/UserProfileApi';
import * as UserRoleApi from '../api/UserRoleApi';

// -------------- UI -------------------
import {
  Form,
  Button,
  Modal,
  Result,
  Table,
  Breadcrumb,
  Pagination,
  Upload,
  Switch,
  Radio,
} from 'antd';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ImgCrop from 'antd-img-crop';

function addEditUserProfile(props) {
  const router = useRouter();
  const { blockUI, unblockUI } = props;
  const [mode, setMode] = useState('add');
  const [id, setId] = useState('');

  // -------------------- Modal Card ------------------
  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [successCardMessage, setSuccessCardMessage] = useState('');
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');

  // ------------- on select row of company access table --------
  const [selectedRowKeys, setSelectedRowKeys] = useState(['1']);
  const [companyAccess, setCompanyAccess] = useState([]);

  // ------------- Table Company Access -------------
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItem, setTotalItem] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataCompany, setDataCompany] = useState([]); // ----- variable for show data on table -----
  const [dataCompanyList, setDataCompanyList] = useState([]); // ----- variable for filter data company -----
  const [emptyText, setEmptyText] = useState('');
  const [branchNameSearch, setBranchNameSearch] = useState(''); //-- variable for search data on company access table ---
  const [branchCodeSearch, setBranchCodeSearch] = useState(''); //-- variable for search data on company access table ---

  // ------------- dropdown list in form ------------
  const [buyerCodeList, setBuyerCodeList] = useState([]);
  const [branchCodeList, setBranchCodeList] = useState([]);
  const [userRoleList, setUserRoleList] = useState([]);

  // ------------- Form create user --------------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userPicture, setUserPicture] = useState(null);
  const [buyerCode, setBuyerCode] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [officeTelNo, setOfficeTelNo] = useState('');
  const [branchCode, setBranchCode] = useState('');
  // const [isLdap, setIsLdap] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [usernameErr, setUsernameErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [confirmPasswordErr, setConfirmPasswordErr] = useState(false);
  const [matchPasswordErr, setMatchPasswordErr] = useState(false);
  const [userRoleErr, setUserRoleErr] = useState(false);
  const [buyerCodeErr, setBuyerCodeErr] = useState(false);
  const [firstNameErr, setFirstNameErr] = useState(false);
  const [lastNameErr, setLastNameErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [mobileNoErr, setMobileNoErr] = useState(false);
  const [officeTelNoErr, setOfficeTelNoErr] = useState(false);
  const [branchCodeErr, setBranchCodeErr] = useState(false);
  const [uploadErr, setUploadErr] = useState(false);
  const [uploadErrMessage, setuploadErrMessage] = useState('');

  useEffect(async () => {
    unblockUI();
    initialData();
  }, []);

  const initialData = async () => {
    const idForPath = router.query.id;
    if (idForPath !== 'undefined' && idForPath !== undefined && idForPath !== '') {
      setId(idForPath);
      setMode('edit');
    } else {
      setMode('add');
    }

    const userRole = await UserRoleApi.getUserRole();
    if (userRole && userRole.status === 200) {
      const userRoleLists = [{ code: '', name: '-- Please Select --' }, ...userRole.data];
      setUserRoleList(userRoleLists);
    } else {
      console.log(userRole);
      //-----  alert error message
    }

    const companyAccessData = await showCompanyAccess();
    if (companyAccessData) {
      onGroupCompanyCode(companyAccessData.items);
      setDataCompanyList(companyAccessData.items);
      setTotalItem(companyAccessData.totalItem);
      setTotalRecord(companyAccessData.totalRecord);
    }
  };

  const showCompanyAccess = async () => {
    setIsLoadingTable(true);
    const companyAccessRes = await UserProfileApi.companyAccess();
    if (companyAccessRes && companyAccessRes !== null) {
      setIsLoadingTable(false);
      return companyAccessRes;
    } else {
      setIsLoadingTable(false);
      return false;
    }
  };

  const onGroupCompanyCode = (companyAccessList) => {
    const buyerCodeList = _.chain(companyAccessList)
      .groupBy('companyCode')
      .map((value, key) => key)
      .value();
    setBuyerCodeList(buyerCodeList);
    setEmptyText('Please select Buyer Code');
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    let companyAccessList = [];
    _.forEach(selectedRows, function (value) {
      companyAccessList.push(JSON.stringify(value));
    });
    setSelectedRowKeys(selectedRowKeys);
    setCompanyAccess(companyAccessList);
  };

  const rowSelection = {
    selectedRowKeys,
    companyAccess,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
    },
    {
      title: 'Company Code',
      dataIndex: 'companyCode',
      key: 'companyCode',
      align: 'center',
      width: '150px',
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: '200px',
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
      width: '150px',
      align: 'center',
    },
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
      width: '200px',
    },
  ];

  const propsUpload = {
    maxCount: 1,
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
    onChange: ({ file }) => {
      if (file.status === 'done') {
        setUserPicture(file.originFileObj);
      }
    },
  };

  const showTotal = () =>
    `${current * pageSize - pageSize + 1} - ${
      totalItem < pageSize ? totalItem : current * pageSize
    } of ${totalItem} item(s)`;

  const onChangeTable = (pagination, filters, sorter, extra) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const onChangePagination = (page, pageSize) => {
    setCurrent(page);
    setPageSize(pageSize);
  };

  const onSelectBuyerCode = async (value) => {
    setBranchCode('');
    const companyList = dataCompanyList
      .filter((data) => data.companyCode == value)
      .map((val, index) => ({ ...val, no: index + 1 }));
    setTotalRecord(companyList.length);
    setDataCompany(companyList);

    // ----- on group branch code ---------
    const branchCodeList = _.chain(companyList)
      .groupBy('branchCode')
      .map((value, key) => key)
      .value();

    setBranchCodeList(branchCodeList);
  };

  const onSearchCompanyAcc = () => {
    const branchSearch = {
      branchName: branchNameSearch || '',
      branchCode: branchCodeSearch || '',
    };
    console.log('branchSearch : ', branchSearch);
  };

  const onFinish = async () => {
    blockUI();
    const data = {
      username: username || '',
      password: password || '',
      roleCode: userRole || '',
      buyerCode: buyerCode || '',
      firstName: firstName || '',
      lastName: lastName || '',
      email: email || '',
      branchCode: branchCode || '',
      mobileNo: mobileNo || '',
      officeTelNo: officeTelNo || '',
      // isLdap: isLdap || false,
      isActive: isActive || true,
      companyAccessList: _.join(companyAccess, ','),
    };

    if (userPicture !== null) {
      _.set(data, 'picture', userPicture);
    }

    let formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    const createUserRes = await UserProfileApi.createUserProfile(formData, {
      'Content-Type': 'multipart/form-data',
    });
    if (createUserRes && createUserRes.status == 200) {
      unblockUI();
      setShowSuccessCard(true);
      setSuccessCardMessage(createUserRes.message);
      Router.push({
        pathname: '/profile/usersLists',
      });
    }
  };

  const onFinishFailed = (errorInfo) => {
    setUsernameErr(true);
    setPasswordErr(true);
    setConfirmPasswordErr(true);
    setUserRoleErr(true);
    setBuyerCodeErr(true);
    setFirstNameErr(true);
    setLastNameErr(true);
    setEmailErr(true);
    setMobileNoErr(true);
    setOfficeTelNoErr(true);
    setBranchCodeErr(true);
  };

  const footerConfirm = (
    <div className="row justify-content-md-center mt-4">
      <Button
        className="bbl-btn-blue mr-3"
        shape="round"
        onClick={() => {
          console.log(`ok Confirm ${id}`);
          setShowConfirmCard(false);
          onFinish();
        }}
      >
        Comfirm
      </Button>
      <Button
        className="bbl-btn-orange"
        shape="round"
        onClick={() => {
          setShowConfirmCard(false);
        }}
      >
        Cancel
      </Button>
    </div>
  );

  return (
    <div className="row justify-content-md-center">
      <div className="col-7">
        {/* {console.log('mode', mode)} */}

        <div>
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item href={'/profile/usersLists'}>User Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="bbl-font-bold">
                {mode === 'edit' ? 'Edit User' : 'Create User'}
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <Modal
            title=" "
            footer={[]}
            visible={showSuccessCard}
            closable={false}
            onOk={() => {
              console.log('ok success');
              setShowSuccessCard(false);
            }}
            onCancel={() => {
              setShowSuccessCard(false);
            }}
          >
            <Result
              status="success"
              title={
                // mode === 'edit' ? (
                //   <p>Edit User Successfully.</p>
                // ) : (
                <p>{successCardMessage}</p>
                // )
              }
            />
          </Modal>

          <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
            <div className="mt-1">
              <p className="text-center" style={{ fontWeight: 'bolder', fontSize: '17px' }}>
                {confirmMessage}
              </p>
            </div>
          </Modal>

          <Form
            name="basic"
            initialValues={{
              remember: true,
            }}
            onFinish={() => {
              if (mode === 'edit') {
                setShowConfirmCard(true);
              } else {
                setShowConfirmCard(true);
                setConfirmMessage("Please confirm to Create this User");
              }
            }}
            onFinishFailed={onFinishFailed}
          >
            <div className="row justify-content-between">
              <div
                className="mb-3"
                style={{
                  width: '100%',
                  height: 'auto',
                  border: '2px solid #f7f7f7',
                  background: '#f7f7f7',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    color: '#333333',
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    marginLeft: '1%',
                    display: 'table-cell',
                    height: '40px',
                  }}
                >
                  <div className="ml-3">User Profile</div>
                </div>
              </div>
              {/* <Form.Item label="User LDAP" colon={false} name="userLDAP" style={{ width: '100%' }}>
                <Switch
                  checked={isLdap}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  onChange={(checked) => {
                    setIsLdap(checked);
                  }}
                />
              </Form.Item> */}

              <Form.Item
                // label="Company Legal Name"
                name="username"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล User Name',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  id="username"
                  error={usernameErr ? !username : false}
                  label={
                    <div>
                      User Name <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setUsernameErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Password',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  type="password"
                  id="password"
                  error={passwordErr ? !password : false}
                  label={
                    <div>
                      Password <span className="text-danger">*</span>
                    </div>
                  }
                  autoComplete="new-password"
                  variant="outlined"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Confirm Password',
                  },
                  {
                    validator: (rules, value) => {
                      if (value !== password && value) {
                        setMatchPasswordErr(true);
                        return Promise.reject('The passwords entered do not match.');
                      } else {
                        setMatchPasswordErr(false);
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  type="password"
                  id="confirmPassword"
                  error={confirmPasswordErr ? !confirmPassword || matchPasswordErr : false}
                  label={
                    <div>
                      Confirm Password <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setConfirmPasswordErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="userRole"
                rules={[
                  {
                    required: !userRoleErr,
                    message: 'Please input your User Role',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <FormControl className="mb-3 mr-3" variant="outlined" style={{ width: '100%' }}>
                  <InputLabel htmlFor="outlined-age-native-simple">
                    User Role <span className="text-danger">*</span>
                  </InputLabel>
                  <Select
                    value={userRole}
                    error={userRoleErr ? !userRole : false}
                    onChange={(e) => {
                      if (e.target.value !== '') {
                        setUserRole(e.target.value);
                        setUserRoleErr(true);
                      } else {
                        setUserRole(e.target.value);
                        setUserRoleErr(false);
                      }
                    }}
                    label="User Role"
                  >
                    {userRoleList &&
                      userRoleList.map((list) => (
                        <MenuItem key={list.code} value={list.code}>
                          {list.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Form.Item>

              <div className="mb-3" style={{ width: '100%' }}>
                <p> User Picture</p>
                <ImgCrop grid={true} modalTitle="Crop User Picture" modalWidth={300}>
                  <Upload {...propsUpload}>
                    <span className="ant-upload" role="button">
                      <Button className="bbl-btn-blue mr-4 mb-3" shape="round">
                        Upload
                      </Button>
                    </span>
                    {uploadErr && <span className="text-danger">{uploadErrMessage}</span>}
                  </Upload>
                </ImgCrop>
              </div>

              <Form.Item
                // label="Company Legal Name"
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล First name',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <TextField
                  className="mb-3"
                  id="firstName"
                  error={firstNameErr ? !firstName : false}
                  label={
                    <div>
                      First name <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFirstNameErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                // label="Company Code"
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Last name',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <TextField
                  className="mb-3"
                  id="lastName"
                  error={lastNameErr ? !lastName : false}
                  label={
                    <div>
                      Last name <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setLastNameErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                // label="CompCode for iCash"
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Email',
                  },
                  {
                    type: 'email',
                    message: 'รูปแบบข้อมูล Email ไม่ถูกต้อง',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  id="email"
                  error={emailErr ? !email : false}
                  label={
                    <div>
                      Email <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                // label="Company Legal Name"
                name="mobileNo"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Mobile No',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  id="mobileNo"
                  error={mobileNoErr ? !mobileNo : false}
                  label={
                    <div>
                      Mobile No <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={mobileNo}
                  onKeyDown={(e) => {
                    if (
                      ![
                        '0',
                        '1',
                        '2',
                        '3',
                        '4',
                        '5',
                        '6',
                        '7',
                        '8',
                        '9',
                        'Backspace',
                        'Tab',
                      ].includes(e.key)
                    ) {
                      return e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setMobileNo(e.target.value);
                    setMobileNoErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                // label="Company Code"
                name="officeTelNo"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Office No',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  id="officeTelNo"
                  error={officeTelNoErr ? !officeTelNo : false}
                  label={
                    <div>
                      Office No <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={officeTelNo}
                  onChange={(e) => {
                    setOfficeTelNo(e.target.value);
                    setOfficeTelNoErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="buyerCode"
                rules={[
                  {
                    required: !buyerCodeErr,
                    message: 'กรุณากรอกข้อมูล Buyer Code',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <FormControl className="mb-3 mr-3" variant="outlined" style={{ width: '100%' }}>
                  <InputLabel htmlFor="outlined-age-native-simple">
                    Buyer Code <span className="text-danger">*</span>
                  </InputLabel>
                  <Select
                    value={buyerCode}
                    error={buyerCodeErr ? !buyerCode : false}
                    onChange={(e) => {
                      if (e.target.value !== '') {
                        setBuyerCode(e.target.value);
                        setBuyerCodeErr(true);
                        onSelectBuyerCode(e.target.value);
                      } else {
                        setBuyerCode(e.target.value);
                        setBuyerCodeErr(false);
                        setBranchCodeList([]);
                        setBranchCode('');
                        setDataCompany([]);
                      }
                    }}
                    label="Buyer Code"
                  >
                    <MenuItem key="" value="">
                      -- Please Select --
                    </MenuItem>
                    {buyerCodeList &&
                      buyerCodeList.map((list) => (
                        <MenuItem key={list} value={list}>
                          {list}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Form.Item>
              <Form.Item
                name="branchCode"
                rules={[
                  {
                    required: !branchCodeErr,
                    message: 'กรุณากรอกข้อมูล Branch Code',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <FormControl className="mb-3 mr-3" variant="outlined" style={{ width: '100%' }}>
                  <InputLabel htmlFor="outlined-age-native-simple">
                    Branch Code <span className="text-danger">*</span>
                  </InputLabel>
                  <Select
                    value={branchCode}
                    error={branchCodeErr ? !branchCode : false}
                    onChange={(e) => {
                      if (e.target.value !== '') {
                        setBranchCode(e.target.value);
                        setBranchCodeErr(true);
                      } else {
                        setBranchCode(e.target.value);
                        setBranchCodeErr(false);
                      }
                    }}
                    label="Branch Code"
                  >
                    <MenuItem key="" value="">
                      -- Please Select --
                    </MenuItem>
                    {branchCodeList &&
                      branchCodeList.map((branchCode) => (
                        <MenuItem key={branchCode} value={branchCode}>
                          {branchCode}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Form.Item>

              <div style={{ width: '100%' }}>
                <p> User Status</p>
                <Radio.Group value={isActive}>
                  <Radio value={true}>Active</Radio>
                  <Radio disabled value={false}>
                    Inactive
                  </Radio>
                </Radio.Group>
              </div>

              <div>
                <div
                  className="mt-3 mb-3"
                  style={{
                    width: '100%',
                    height: 'auto',
                    border: '2px solid #f7f7f7',
                    background: '#f7f7f7',
                    boxSizing: 'border-box',
                  }}
                >
                  <div
                    style={{
                      color: '#333333',
                      fontWeight: 'bold',
                      verticalAlign: 'middle',
                      marginLeft: '1%',
                      display: 'table-cell',
                      height: '40px',
                    }}
                  >
                    <div className="ml-3">Company Access</div>
                  </div>
                </div>
                {dataCompany.length > 0 ? (
                  <div className="row">
                    <div className="col-4">
                      <Form.Item name="branchNameSearch">
                        <TextField
                          style={{ width: '100%' }}
                          className="mb-3"
                          id="branchNameSearch"
                          label="Branch Name"
                          variant="outlined"
                          value={branchNameSearch}
                          onChange={(e) => {
                            setBranchNameSearch(e.target.value);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-4">
                      <Form.Item name="branchCodeSearch">
                        <TextField
                          style={{ width: '100%' }}
                          className="mb-3"
                          id="branchCodeSearch"
                          label="Branch Code"
                          variant="outlined"
                          value={branchCodeSearch}
                          onChange={(e) => {
                            setBranchCodeSearch(e.target.value);
                          }}
                        />
                      </Form.Item>
                    </div>
                    <div className="col-4" style={{ paddingTop: '5px' }}>
                      <Button
                        style={{ width: '50%' }}
                        className="bbl-btn-blue"
                        shape="round"
                        onClick={onSearchCompanyAcc}
                      >
                        Search
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div style={{ boxShadow: '2px 3px 8px #D3D3D3' }}>
                  <Table
                    className="table-header-blue"
                    rowSelection={rowSelection}
                    rowKey={'no'}
                    pagination={false}
                    // pagination={{ showTotal , className: 'pagination-blue'}}
                    dataSource={dataCompany}
                    locale={{ emptyText: emptyText !== '' && buyerCode == '' && emptyText }}
                    columns={columns}
                    loading={isLoadingTable}
                    onChange={onChangeTable}
                  />
                </div>
                {dataCompany.length > 0 && (
                  <Pagination
                    className="pagination-blue"
                    total={totalRecord}
                    onChange={onChangePagination}
                    showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} item(s)`}
                    current={current}
                    showSizeChanger
                    defaultCurrent={1}
                    defaultPageSize={10}
                  />
                )}
              </div>
            </div>

            <hr style={{ borderColor: '#456fb6', borderWidth: '2px' }} />

            <div className="row justify-content-md-center">
              <Button
                className="bbl-btn-blue mr-2 px-5"
                shape="round"
                htmlType="submit"
                // onClick={() => {onFinish(data)}}
              >
                Submit
              </Button>

              <Button
                className="bbl-btn-blue-light px-5"
                shape="round"
                onClick={() => {
                  blockUI();
                  window.history.back();
                }}
              >
                Back
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {};
};

const mapDispatchToProps = (dispatch) => {
  return {
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(addEditUserProfile);
