import React, { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

// ----------------- UI --------------------
import {
  Descriptions,
  Modal,
  Button,
  Table,
  Result,
  Input,
  Select,
  Breadcrumb,
  Pagination,
} from 'antd';
import { DownOutlined } from '@ant-design/icons';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

// --------------------- API ----------------------
import * as UserProfileApi from '../api/UserProfileApi';

function userDetail(props) {
  const router = useRouter();
  const { Option } = Select;
  const { blockUI, unblockUI } = props;

  const [id, setId] = useState(0);
  const [waiting, setWaiting] = useState(false);

  const [showApprovedCard, setShowApprovedCard] = useState(false);
  const [showRejectCard, setShowRejectCard] = useState(false);
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  // ---------- data detail ---------
  const [userDetail, setUserDetail] = useState({});

  // ---------- company access --------
  const [dataCompany, setDataCompany] = useState([]);
  const [pageCompany, setPageCompany] = useState(1);
  const [pageCompanySize, setPageCompanySize] = useState(10);
  const [totalRecord, setTotalRecord] = useState(0);

  // ---------- action history --------
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [dataActionHis, setDataActionHis] = useState([]);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);
  const [totalRecordAction, setTotalRecordAction] = useState(0);

  useEffect(() => {
    const { mpfId, mode } = router.query;
    setId(mpfId);
    if (mpfId % 2 === 1) {
      setWaiting(true);
    } else {
      setWaiting(false);
    }
    getInitialData(mpfId);
  }, []);

  const columnsCompanyAccess = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: '10%',
      align: 'center',
    },
    {
      title: 'Company Code',
      dataIndex: 'companyCode',
      key: 'companyCode',
      align: 'center',
    },
    {
      title: 'Company Name',
      dataIndex: 'companyName',
      key: 'companyName',
    },
    {
      title: 'Branch Name',
      dataIndex: 'branchName',
      key: 'branchName',
    },
    {
      title: 'Branch Code',
      dataIndex: 'branchCode',
      key: 'branchCode',
    },
  ];

  const columnsActionHistory = [
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Date Time',
      dataIndex: 'dateTime',
      key: 'dateTime',
    },
    {
      title: 'By User',
      dataIndex: 'by',
      key: 'by',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      render: (text) => (
        <span dangerouslySetInnerHTML={{ __html: text != null && text != '' ? text : '-' }}></span>
      ),
    },
  ];

  const getInitialData = async (userId) => {
    blockUI();
    const idRequest = {
      id: userId,
    };
    await getUserDetail(idRequest);
    await getActionHistory(idRequest);
    unblockUI();
  };

  const getUserDetail = async (id) => {
    const getUserDetail = await UserProfileApi.getUserDetail(id);
    if (getUserDetail && getUserDetail.status === 200) {
      setUserDetail(getUserDetail.data);
      let companyAccessList = _.get(getUserDetail.data, 'companyAccessList', []);
      companyAccessList = companyAccessList.map((data, index) => ({ no: index + 1, ...data }));
      setDataCompany(companyAccessList);
      setTotalRecord(companyAccessList.length);
    } else {
      Router.push({
        pathname: '/profile/usersLists',
      });
      // ---- alert
    }
  };

  const getActionHistory = async (id) => {
    const getActionHistory = await UserProfileApi.getUserActionHistory(id);
    if (getActionHistory && getActionHistory.status === 200) {
      setDataActionHis(_.get(getActionHistory.data, 'items', []));
    } else {
      // ---- alert
    }
  };

  const onChangePagination = (page, pageSize) => {
    setPageCompany(page);
    setPageCompanySize(pageSize);
  };

  const onChangePageActionHis = (page, pageSize) => {
    setPageActionHis(page);
    setPageActionHisSize(pageSize);
  };

  return (
    <div className="row justify-content-md-center">
      <div className="col-11">
        <div>
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>User</Breadcrumb.Item>
              <Breadcrumb.Item href={'/profile/usersLists'}>User Lists</Breadcrumb.Item>
              <Breadcrumb.Item className="bbl-font-bold">User Profile</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {waiting ? (
            <div>
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
                <Result status="success" title={<p>Approve this User Profile Successfully.</p>} />
              </Modal>

              <Modal
                title=" "
                visible={showApprovedCard}
                // onOk={() => {
                //     console.log("ok Approved " + id)
                //     setShowApprovedCard(false)
                //     setShowSuccessCard(true)
                // }}
                onCancel={() => {
                  setShowApprovedCard(false);
                }}
                footer={[]}
                closable={false}
              >
                <div className="mt-1">
                  <p className="text-center" style={{ fontWeight: 'bolder', fontSize: '17px' }}>
                    Please comfirm to approve this User Profile ?
                  </p>
                  <div className="row justify-content-md-center mt-4">
                    <Button
                      className="bbl-btn-blue mr-3"
                      shape="round"
                      onClick={() => {
                        console.log(`ok Approved ${id}`);
                        setShowApprovedCard(false);
                        setShowSuccessCard(true);
                      }}
                    >
                      Comfirm
                    </Button>
                    <Button
                      className="bbl-btn-orange"
                      shape="round"
                      onClick={() => {
                        setShowApprovedCard(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>

              <Modal
                title=" "
                visible={showRejectCard}
                // onOk={() => {
                //     console.log("ok Reject " + id)
                //     setShowRejectCard(false)
                // }}
                onCancel={() => {
                  setShowRejectCard(false);
                }}
                closable={false}
                footer={[]}
              >
                <div style={{ margin: '10px 30px 0px 30px' }}>
                  <h5 style={{ fontWeight: 'bolder' }}>Reject User Profile</h5>
                  <p>Reject reason</p>
                  <Select placeholder="Please select" style={{ width: '100%' }}>
                    <Option value="edit">Edit detail</Option>
                    <Option value="another">Another</Option>
                  </Select>
                  <div className="row mt-2 ml-1">
                    {' '}
                    Note <p className="text-danger"> * </p>
                  </div>

                  <Input placeholder="Please remake" />

                  <div className="row justify-content-md-center mt-4">
                    <Button
                      className="bbl-btn-blue mr-3"
                      shape="round"
                      onClick={() => {
                        console.log(`ok Reject ${id}`);
                        setShowRejectCard(false);
                      }}
                    >
                      Comfirm
                    </Button>
                    <Button
                      className="bbl-btn-orange"
                      shape="round"
                      onClick={() => {
                        setShowRejectCard(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Modal>
            </div>
          ) : (
            ''
          )}

          <div className="row ml-3">
            {userDetail.picture && (
              <div>
                <img
                  src={'data:image/png;base64,' + `${userDetail.picture}`}
                  className="border-img mr-3"
                  style={{ width: '180px', height: 'auto' }}
                />
              </div>
            )}

            <div className="row col-9">
              <div className="col-9">
                <h4 style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                  User Detail
                </h4>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="Username">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.username}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="User Role">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.role}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="First Name">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.firstName}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="Last Name">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.lastName}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="Email">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.email}
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="Mobile No.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.mobileNo}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                  <Descriptions.Item label="User Status">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {userDetail.isActive}
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </div>

          <hr />

          <p style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
            Company Access
          </p>

          <Table
            className="table-header-blue"
            rowKey="no"
            pagination={false}
            scroll={{ y: 200 }}
            dataSource={dataCompany}
            columns={columnsCompanyAccess}
          />
          <Pagination
            className="pagination-blue"
            total={totalRecord}
            onChange={onChangePagination}
            showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} item(s)`}
            current={pageCompany}
            showSizeChanger
            pageSize={pageCompanySize}
            defaultCurrent={1}
            defaultPageSize={10}
          />

          <hr style={{ borderColor: '#456fb6', borderWidth: '2px' }} />

          <Button
            shape="round bbl-btn-blue-bark"
            onClick={() => {
              setFlagActionHis(!flagActionHis);
            }}
          >
            Action History
            <DownOutlined
              rotate={!flagActionHis ? 180 : ''}
              style={{ fontSize: '12px', marginLeft: '10px' }}
            />
          </Button>

          {flagActionHis && (
            <div className="mt-3 mb-3">
              <Table
                className="table-header-blue"
                rowKey={(record) => record.id}
                pagination={false}
                scroll={{ y: 200 }}
                dataSource={dataActionHis}
                columns={columnsActionHistory}
              />
              <Pagination
                className="pagination-blue"
                total={totalRecordAction}
                onChange={onChangePageActionHis}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} item(s)`}
                current={pageActionHis}
                showSizeChanger
                pageSize={pageActionHisSize}
                defaultCurrent={1}
                defaultPageSize={10}
              />
            </div>
          )}

          {waiting ? (
            <div className="row justify-content-md-center">
              <Button
                className="bbl-btn-blue mr-2 px-4"
                shape="round"
                onClick={() => {
                  setShowApprovedCard(true);
                }}
              >
                Approved
              </Button>
              <Button
                className="bbl-btn-orange mr-2 px-4"
                shape="round"
                onClick={() => {
                  setShowRejectCard(true);
                }}
              >
                Reject
              </Button>
              <Button
                shape="round"
                className="bbl-btn-blue-light mr-2 px-4"
                onClick={() => {
                  blockUI();
                  window.history.back();
                }}
              >
                Back
              </Button>
            </div>
          ) : (
            <div className="row justify-content-md-center">
              <Button
                className="bbl-btn-blue mr-2 px-5"
                shape="round"
                onClick={() => {
                  blockUI();
                  router.push(
                    {
                      pathname: `/profile/addEditUserProfile`,
                      query: { id },
                    },
                    `/profile/addEditUserProfile`,
                  );
                }}
              >
                Edit
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
          )}
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
export default connect(mapStateToProps, mapDispatchToProps)(userDetail);
