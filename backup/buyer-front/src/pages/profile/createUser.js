import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

import { Form, Button, Modal, Result, Table } from 'antd';
import TextField from '@material-ui/core/TextField';

// ----------------- api -------------
import * as UserProfileApi from '../api/UserProfileApi';

function createUser(props) {
  const router = useRouter();
  const { blockUI, unblockUI } = props;
  const regex = /^[0-9\s]+$/;
  const [mode, setMode] = useState('add');
  const [id, setId] = useState('');

  const [showSuccessCard, setShowSuccessCard] = useState(false);
  const [showConfirmCard, setShowConfirmCard] = useState(false);

  const [selectedRowKeys, setSelectedRowKeys] = useState(['1']);
  const [selectedRows, setSelectedRows] = useState([]);

  const [current, setCurrent] = useState('1');
  const [pageSize, setPageSize] = useState('10');
  const [totalItem, setTotalItem] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [dataCompany, setDataCompany] = useState([]);

  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userRole, setUserRole] = useState('');
  const [buyerCode, setBuyerCode] = useState('');
  const [firstname, setFirstname] = useState('');
  const [lastname, setLastname] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [officeNo, setOfficeNo] = useState('');
  const [branchCode, setBranchCode] = useState('');

  const [userIDErr, setUserIDErr] = useState(false);
  const [passwordErr, setPasswordErr] = useState(false);
  const [confirmPasswordErr, setConfirmPasswordErr] = useState(false);
  const [matchPasswordErr, setMatchPasswordErr] = useState(false);
  const [userRoleErr, setUserRoleErr] = useState(false);
  const [buyerCodeErr, setBuyerCodeErr] = useState(false);
  const [firstnameErr, setFirstnameErr] = useState(false);
  const [lastnameErr, setLastnameErr] = useState(false);
  const [emailErr, setEmailErr] = useState(false);
  const [mobileNoErr, setMobileNoErr] = useState(false);
  const [officeNoErr, setOfficeNoErr] = useState(false);
  const [branchCodeErr, setBranchCodeErr] = useState(false);

  useEffect(() => {
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

    showCompanyAccess({
      current,
      pageSize,
    });
  };

  const showCompanyAccess = async ({ current, pageSize, searchList, sortList }) => {
    setIsLoadingTable(true);
    const bodyRequest = {
      page: current,
      pageSize: pageSize,
      searchList: searchList ? searchList : [],
      sortList: sortList ? sortList : [],
    };
    const companyAccessRes = await UserProfileApi.companyAccess(bodyRequest);
    if (companyAccessRes && companyAccessRes !== null) {
      console.log(companyAccessRes);
      setDataCompany(companyAccessRes.items);
      setIsLoadingTable(false);
      setTotalItem(companyAccessRes.totalItem);
    } else {
      setIsLoadingTable(false);
    }
  };

  const onSelectChange = (selectedRowKeys, selectedRows) => {
    console.log(selectedRows);
    setSelectedRowKeys(selectedRowKeys);
    setSelectedRows(selectedRows);
  };

  const rowSelection = {
    selectedRowKeys,
    selectedRows,
    onChange: onSelectChange,
  };

  const columns = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      align: 'center',
      defaultSortOrder: 'ascend',
      sorter: true,
    },
    {
      title: 'Company Code',
      dataIndex: 'companyCode',
      key: 'companyCode',
      align: 'center',
      width: '150px',
      defaultSortOrder: 'ascend',
      sorter: true,
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
      width: '200px',
      defaultSortOrder: 'ascend',
      sorter: true,
    },
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
      width: '200px',
      defaultSortOrder: 'ascend',
      sorter: true,
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
      width: '150px',
      align: 'center',
      defaultSortOrder: 'ascend',
      sorter: true,
    },
  ];

  const data = {
    userID: userID || '',
    password: password || '',
    userRole: userRole || '',
    buyerCode: buyerCode || '',
    firstname: firstname || '',
    lastname: lastname || '',
    email: email || '',
    branchCode: branchCode || '',
    mobileNo: mobileNo || '',
    officeNo: officeNo || '',
  };

  const showTotal = () =>
    `${current * pageSize - pageSize + 1} - ${
      totalItem < pageSize ? totalItem : current * pageSize
    } of ${totalItem} item(s)`;

  const onChangeTable = (pagination, filters, sorter, extra) => {
    setCurrent(pagination.current);
    setPageSize(pagination.pageSize);

    if (extra.action == 'sort') {
      const sortValue = {
        field: sorter.field,
        order: sorter.order === 'descend' ? 'DESC' : 'ASC',
      };
      const inquiryUser = {
        current: pagination.current,
        pageSize: pagination.pageSize,
        sortList: [sortValue],
      };
      showCompanyAccess(inquiryUser);
    }

  }

  const onFinish = (values) => {
    console.log('Success:', values);
    setShowSuccessCard(true);
  };

  const onFinishFailed = ({ errorFields }) => {
    setUserIDErr(true);
    setPasswordErr(true);
    setConfirmPasswordErr(true);
    setUserRoleErr(true);
    setBuyerCodeErr(true);
    setFirstnameErr(true);
    setLastnameErr(true);
    setEmailErr(true);
    setMobileNoErr(true);
    setOfficeNoErr(true);
    setBranchCodeErr(true);
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-7">
        {/* {console.log("mode", mode)} */}

        <div>
          <div className="row bbl-font mt-3 mb-3">
            Profile {'>'} User Lists {'>'} &nbsp;
            <div className="bbl-font-bold">{mode === 'edit' ? 'Edit User' : 'Create User'}</div>
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
                mode === 'edit' ? (
                  <p>Edit User Successfully.</p>
                ) : (
                  <p>Create new User Successfully.</p>
                )
              }
            />
          </Modal>

          <Modal
            title=" "
            visible={showConfirmCard}
            // onOk={() => {
            //     console.log("ok Confirm " + id)
            //     setShowConfirmCard(false)
            //     setShowSuccessCard(true)
            // }}
            onCancel={() => {
              setShowConfirmCard(false);
            }}
            footer={[]}
            closable={false}
          >
            <div className="mt-1">
              <p className="text-center" style={{ fontWeight: 'bolder', fontSize: '17px' }}>
                Please comfirm to Edit this User ?
              </p>
              <div className="row justify-content-md-center mt-4">
                <Button
                  className="bbl-btn-blue mr-3"
                  shape="round"
                  onClick={() => {
                    console.log(`ok Confirm ${id}`);
                    onFinish(data);
                    setShowConfirmCard(false);
                    setShowSuccessCard(true);
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
                onFinish(data);
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

              <Form.Item
                name="userID"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล User ID',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  error={userIDErr ? !userID : false}
                  id="userID"
                  label={
                    <div>
                      User ID <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={userID}
                  onChange={(e) => {
                    setUserID(e.target.value);
                    setUserIDErr(true);
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
                  id="password"
                  type="password"
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
                  error={confirmPasswordErr ? !confirmPassword || matchPasswordErr : false}
                  type="password"
                  id="confirmPassword"
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
                    required: true,
                    message: 'กรุณากรอกข้อมูล User Role',
                  },
                ]}
                style={{ width: '100%' }}
              >
                <TextField
                  className="mb-3"
                  error={userRoleErr ? !userRole : false}
                  id="userRole"
                  label={
                    <div>
                      User Role <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={userRole}
                  onChange={(e) => {
                    setUserRole(e.target.value);
                    setUserRoleErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <div style={{ width: '100%' }}>
                <p> User Picture</p>
                <Button className="bbl-btn-blue mr-2 mb-3" shape="round" onClick={() => {}}>
                  Upload
                </Button>
              </div>

              <Form.Item
                name="firstname"
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
                  error={firstnameErr ? !firstname : false}
                  id="firstname"
                  label={
                    <div>
                      First name <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={firstname}
                  onChange={(e) => {
                    setFirstname(e.target.value);
                    setFirstnameErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="lastname"
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
                  error={lastnameErr ? !lastname : false}
                  id="lastname"
                  label={
                    <div>
                      Last name <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={lastname}
                  onChange={(e) => {
                    setLastname(e.target.value);
                    setLastnameErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
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
                  error={emailErr ? !email : false}
                  id="email"
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
                  error={mobileNoErr ? !mobileNo : false}
                  id="mobileNo"
                  label={
                    <div>
                      Mobile No <span className="text-danger">*</span>
                    </div>
                  }
                  //   type="number"
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
                name="officeNo"
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
                  error={officeNoErr ? !officeNo : false}
                  id="officeNo"
                  label={
                    <div>
                      Office No <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={officeNo}
                  onChange={(e) => {
                    setOfficeNo(e.target.value);
                    setOfficeNoErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                name="buyerCode"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Buyer Code',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <TextField
                  className="mb-3"
                  error={buyerCodeErr ? !buyerCode : false}
                  id="buyerCode"
                  label={
                    <div>
                      Buyer Code <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={buyerCode}
                  onChange={(e) => {
                    setBuyerCode(e.target.value);
                    setBuyerCodeErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>
              <Form.Item
                name="branchCode"
                rules={[
                  {
                    required: true,
                    message: 'กรุณากรอกข้อมูล Branch Code',
                  },
                ]}
                style={{ width: '49%' }}
              >
                <TextField
                  className="mb-3"
                  error={branchCodeErr ? !branchCode : false}
                  id="branchCode"
                  label={
                    <div>
                      Branch Code <span className="text-danger">*</span>
                    </div>
                  }
                  variant="outlined"
                  value={branchCode}
                  onChange={(e) => {
                    setBranchCode(e.target.value);
                    setBranchCodeErr(true);
                  }}
                  style={{ width: '100%' }}
                />
              </Form.Item>

              {/* {mode === 'edit' ? ( */}
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
                <div style={{ boxShadow: '2px 3px 8px #D3D3D3' }}>
                  <Table
                    className="table-header-blue"
                    rowSelection={rowSelection}
                    rowKey={'no'}
                    pagination={showTotal}
                    dataSource={dataCompany}
                    columns={columns}
                    loading={isLoadingTable}
                    onChange={onChangeTable}
                  />
                </div>
              </div>
              {/* ) : (
                ''
              )} */}
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

export default connect(mapStateToProps, mapDispatchToProps)(createUser);
