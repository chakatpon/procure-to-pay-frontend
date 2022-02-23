import React, { useState, useEffect } from 'react';
// import { StoreContext } from "../../context/store";
import Link from "next/link";

import TextField from '@material-ui/core/TextField';
import { Button, Table } from 'antd';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';
import BBLTableList from '../components/BBLTableList';

function bankLists(props) {
  // const context = useContext(StoreContext);
  const { blockUI, unblockUI } = props;
  const [branch, setBranch] = useState('Buyer');

  const [current, setCurrent] = useState('1');
  const [pageSize, setPageSize] = useState('10');


  const dataTable = [];

  useEffect(() => {
    unblockUI();
  }, [])

  for (let i = 0; i < 85; i++) {
    dataTable.push({
      key: i,
      no: i + 1,
      divisionCode: `0000${i}`,
      divisionName: `Division ${i + 1}`,
      createDate: '21-04-2021 00:00:20',
      status: 'Active',
    });
  }

  const BuyerColumns = [
    {
      id: '1',
      title: 'No.',
      dataIndex: 'no',
      // width: '10%',
      editable: true,
      align: 'center',
      sorter: {
        compare: (a, b) => a.no - b.no,
      },
    },
    {
      id: '2',
      title: 'Division Code',
      dataIndex: 'divisionCode',
      // width: '15%',
      editable: true,
      align: 'center',
      sorter: {
        compare: (a, b) => a.divisionCode - b.divisionCode,
      },
      render: (text, record, index) => (
        <Link
          onClick={() => blockUI()}
          href={`/profile/bankDetail?mode=edit&mpfId=${text}`}
          as="/profile/bankDetail"
          style={{ color: "blue" }}
        >
          {text}
        </Link>
      ),
    },
    {
      id: '3',
      title: 'Division Name',
      dataIndex: 'divisionName',
      // width: '15%',
      align: 'center',
      editable: true,
      sorter: (a, b) => {
        if (a.divisionName < b.divisionName) return -1;
        if (b.divisionName < a.divisionName) return 1;
        return 0;
      },
    },
    {
      id: '4',
      title: 'Create Date',
      dataIndex: 'createDate',
      // width: '10%',
      align: 'center',
      editable: true,
      sorter: (a, b) => {
        if (a.createDate < b.createDate) return -1;
        if (b.createDate < a.createDate) return 1;
        return 0;
      },
    },
    {
      id: '5',
      title: 'Status',
      dataIndex: 'status',
      // width: '20%',
      editable: true,
      align: 'center',
      sorter: (a, b) => {
        if (a.status < b.status) return -1;
        if (b.status < a.status) return 1;
        return 0;
      },
    },
  ];

  const showTotal = () => `${(current * pageSize) - pageSize + 1} - ${current * pageSize} of ${dataTable.length} item(s)`

  const pageChanger = (e) => {
    console.log("pageChanger", e);
    if (e.current) {
      setCurrent(e.current)
    }
    if (e.pageSize) {
      setPageSize(e.pageSize)
    }
  }

  return (
    <div className="card-page">
      <div className="row justify-content-md-center">
        <div className="col-12" style={{ background: "#f0f0f0" }}>

          <div className="card-body card-search">
            <div className="row bbl-font mb-3 ml-5 mr-5">
              Profile {'>'} {branch} Profile {'>'} &nbsp;
            <div className="bbl-font-bold">Bank Profile List</div>
            </div>

            {/*  Search Bar */}

            <div className="row ml-5 mr-5">
              <TextField
                className="mt-2 mr-3"
                id="divisioncode"
                label="Division Code"
                variant="outlined"
                // value={divisioncode}
                style={{ width: '15%' }}
                onChange={(e) => { }}
              />
              <TextField
                className="mt-2 mr-3"
                id="divisionname"
                label="Division Name"
                variant="outlined"
                // value={divisionname}
                style={{ width: '15%' }}
                onChange={(e) => { }}
              />

              <div className="row align-self-center mt-2 ml-2">
                <Button
                  className="bbl-btn-blue mr-2 px-4"
                  shape="round"
                  onClick={() => { }}
                  style={{
                    height: '100%',
                  }}
                >
                  Search
              </Button>
                <Button className="bbl-btn-blue-light px-4" shape="round" onClick={() => { }}>
                  Clear
              </Button>
              </div>
            </div>
          </div>



          <div className="card-body mt-3 card-body card-search">
            <div className="ml-5 mr-5">
              {branch === 'Bank' ? (
                <div className="text-right">
                  <Button
                    className="bbl-btn-blue mr-2 px-4"
                    shape="round"
                    onClick={() => { }}
                    style={{
                      height: '100%',
                    }}
                  >
                    Create Profile
                </Button>
                </div>
              ) : (
                ''
              )}

              <BBLTableList
                columns={BuyerColumns}
                dataSource={dataTable}
                pagination={showTotal}
                onChange={(e) => {
                  pageChanger(e);
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),

  };
};

export default connect(mapStateToProps, mapDispatchToProps)(bankLists);
