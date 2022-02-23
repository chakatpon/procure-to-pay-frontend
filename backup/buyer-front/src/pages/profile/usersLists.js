import React, { useState, useEffect } from 'react';
// import { StoreContext } from "../../context/store";
import Router from 'next/router';
import Link from 'next/link';
import { connect } from 'react-redux';

// ------------------------ constant ------------------------
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

// -------------------------- api -----------------------------
import * as UserProfileApi from '../api/UserProfileApi';

// ---------------------- UI ---------------
import TextField from '@material-ui/core/TextField';
import { Button, Breadcrumb } from 'antd';
import BBLTableList from '../components/BBLTableList';

function usersLists(props) {
  // const context = useContext(StoreContext);
  const { blockUI, unblockUI } = props;

  const [dataSource, setDataSource] = useState([]);
  const [userName, setUserName] = useState('');
  const [companyCode, setCompanyCode] = useState('');
  const [branchCode, setBranchCode] = useState('');

  const [current, setCurrent] = useState('1');
  const [pageSize, setPageSize] = useState('10');
  const [totalItem, setTotalItem] = useState(0);
  const [totalRecord, setTotalRecord] = useState(0);
  const [isLoadingTable, setIsLoadingTable] = useState(false);

  const BuyerColumns = [
    {
      title: 'No.',
      key: 'no',
      dataIndex: 'no',
      defaultSortOrder: 'ascend',
      // width: '10%',
      editable: true,
      align: 'center',
      sorter: true,
    },
    {
      title: 'Username',
      key: 'username',
      dataIndex: 'username',
      defaultSortOrder: 'ascend',
      // width: '15%',
      editable: true,
      align: 'center',
      sorter: true,
      render: (text, record, index) => (
        <Link
          onClick={() => blockUI()}
          href={`/profile/userDetail?mode=edit&mpfId=${record.id}`}
          as="/profile/userDetail"
          style={{ color: 'blue' }}
        >
          <a style={{ textDecoration: 'underline' }} key={index}>
            {text}
          </a>
        </Link>
      ),
    },
    {
      title: 'Company Code',
      key: 'companyCode',
      dataIndex: 'companyCode',
      defaultSortOrder: 'ascend',
      // width: '10%',
      align: 'center',
      editable: true,
      sorter: true,
    },
    {
      title: 'Branch Code',
      key: 'branchCode',
      dataIndex: 'branchCode',
      defaultSortOrder: 'ascend',
      // width: '20%',
      editable: true,
      align: 'center',
      sorter: true,
    },
    {
      title: 'Create Date',
      key: 'createDate',
      dataIndex: 'createDate',
      defaultSortOrder: 'ascend',
      // width: '20%',
      editable: true,
      align: 'center',
      sorter: true,
    },
    {
      title: 'Status',
      key: 'isActive',
      dataIndex: 'isActive',
      defaultSortOrder: 'ascend',
      // width: '20%',
      editable: true,
      align: 'center',
      sorter: true,
    },
  ];

  useEffect(() => {
    unblockUI();
    initialData();
  }, []);

  const initialData = async () => {
    getUserProfile({
      current,
      pageSize,
    });
  };

  const getUserProfile = async ({ current, pageSize, searchList, sortList }) => {
    setIsLoadingTable(true);
    const bodyRequest = {
      page: current,
      pageSize: pageSize,
      searchList: searchList ? searchList : [],
      sortList: sortList ? sortList : [],
    };
    const userProfileList = await UserProfileApi.userProfileInquiry(bodyRequest);
    if (userProfileList && userProfileList !== null) {
      setDataSource(userProfileList.items);
      setIsLoadingTable(false);
      setTotalItem(userProfileList.totalItem);
      setTotalRecord(userProfileList.totalRecord);
    } else {
      setIsLoadingTable(false);
    }
  };

  const showTotal = () =>
    `${current * pageSize - pageSize + 1} - ${
      totalRecord < current * pageSize ? totalRecord : current * pageSize
    } of ${totalRecord} item(s)`;

  const pageChanger = async (pagination, filters, sorter, extra) => {
    console.log(pagination);
    let inquiryUser = {};
    if (pagination.current) {
      setCurrent(pagination.current);
    }
    if (pagination.pageSize) {
      setPageSize(pagination.pageSize);
    }
    if (extra.action == 'sort') {
      const sortValue = {
        field: sorter.field,
        order: sorter.order === 'descend' ? 'DESC' : 'ASC',
      };
      inquiryUser = {
        ...inquiryUser,
        current: pagination.current,
        pageSize: pagination.pageSize,
        sortList: [sortValue],
      };
    }

    if (extra.action == 'paginate') {
      inquiryUser = {
        ...inquiryUser,
        current: pagination.current,
        pageSize: pagination.pageSize,
      };
    }

    await getUserProfile(inquiryUser);
  };

  const onSearch = () => {
    const searchList = [];
    const mapData = (field, value) => {
      searchList.push({
        field: field,
        value: value,
      });
    };

    if (userName !== '') {
      mapData('username', userName);
    }
    if (companyCode !== '') {
      mapData('companyCode', companyCode);
    }
    if (branchCode !== '') {
      mapData('branchCode', branchCode);
    }

    const inquiryUser = {
      current: current,
      pageSize: pageSize,
      searchList: searchList,
    };

    getUserProfile(inquiryUser);
  };

  const onClearInput = () => {
    setUserName('');
    setCompanyCode('');
    setBranchCode('');
  };

  return (
    <div className="card-page">
      <div className="row justify-content-md-center">
        <div className="col-12" style={{ background: '#f0f0f0' }}>
          <div className="card-body card-search">
            <div className="row bbl-font mb-3 ml-5 mr-5">
              <Breadcrumb separator=">">
                <Breadcrumb.Item>Profile</Breadcrumb.Item>
                <Breadcrumb.Item>User</Breadcrumb.Item>
                <Breadcrumb.Item className="bbl-font-bold">User Lists</Breadcrumb.Item>
              </Breadcrumb>
            </div>

            {/*  Search Bar */}

            <div className="row ml-5 mr-5">
              <TextField
                className="mt-2 mr-3"
                id="username"
                label="Username"
                variant="outlined"
                value={userName}
                style={{ width: '15%' }}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <TextField
                className="mt-2 mr-3"
                id="companyCode"
                label="Company Code"
                variant="outlined"
                value={companyCode}
                style={{ width: '15%' }}
                onChange={(e) => {
                  setCompanyCode(e.target.value);
                }}
              />
              <TextField
                className="mt-2 mr-3"
                id="branchCode"
                label="Branch Code"
                variant="outlined"
                value={branchCode}
                style={{ width: '15%' }}
                onChange={(e) => {
                  setBranchCode(e.target.value);
                }}
              />

              <div className="row align-self-center mt-2 ml-2">
                <Button
                  className="bbl-btn-blue mr-2 px-4"
                  shape="round"
                  onClick={onSearch}
                  style={{
                    height: '100%',
                  }}
                >
                  Search
                </Button>
                <Button className="bbl-btn-blue-light px-4" shape="round" onClick={onClearInput}>
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div className="card-body mt-3 card-body card-search">
            <div className="ml-5 mr-5">
              <div className="text-right">
                <Button
                  className="bbl-btn-blue mr-2 px-4"
                  shape="round"
                  style={{
                    height: '100%',
                  }}
                  onClick={() => {
                    blockUI();
                    Router.push({
                      pathname: '/profile/addEditUserProfile',
                    });
                  }}
                >
                  Create User
                </Button>
              </div>
              <BBLTableList
                columns={BuyerColumns}
                dataSource={dataSource}
                total={totalRecord}
                pageSize={pageSize}
                pagination={showTotal}
                onChange={pageChanger}
                loading={isLoadingTable}
              />
            </div>
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(usersLists);
