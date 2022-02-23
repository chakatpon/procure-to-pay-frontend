import React, { useEffect, useState } from 'react';
// import { StoreContext } from "../../context/store";
import Link from "next/link";

import TextField from '@material-ui/core/TextField';
import { Button, Table } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';
import BBLTableList from '../components/BBLTableList';

function supplierLists(props) {
  // const context = useContext(StoreContext);
  const { blockUI, unblockUI } = props;
  const [branch, setBranch] = useState('Supplier');

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
      supplierCode: `0000${i}`,
      supplierNameTH: `โตโยต้า มหานคร ${i + 1}`,
      supplierNameEN: `Toyota Motor Thailand ${i + 1}`,
      createDate: '21-04-2021 00:00:20',
      active: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    });
  }

  const SupplierColumns = [
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
      title: 'Supplier Code',
      dataIndex: 'supplierCode',
      // width: '15%',
      editable: true,
      align: 'center',
      sorter: {
        compare: (a, b) => a.supplierCode - b.supplierCode,
      },
      render: (text, record, index) => (
        <Link
          onClick={() => blockUI()}
          href={`/profile/supplierDetail?mode=edit&mpfId=${text}`}
          as="/profile/supplierDetail"
          style={{ color: "blue" }}
        >
          {text}
        </Link>
      ),
    },
    {
      id: '3',
      title: 'Supplier Name(TH)',
      dataIndex: 'supplierNameTH',
      // width: '15%',
      align: 'center',
      editable: true,
      sorter: (a, b) => {
        if (a.supplierNameTH < b.supplierNameTH) return -1;
        if (b.supplierNameTH < a.supplierNameTH) return 1;
        return 0;
      },
    },
    {
      id: '4',
      title: 'Supplier Name(EN)',
      dataIndex: 'supplierNameEN',
      // width: '15%',
      align: 'center',
      editable: true,
      sorter: (a, b) => {
        if (a.supplierNameEN < b.supplierNameEN) return -1;
        if (b.supplierNameEN < a.supplierNameEN) return 1;
        return 0;
      },
    },
    {
      id: '5',
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
      id: '6',
      title: 'Active',
      dataIndex: 'active',
      // width: '10%',
      align: 'center',
      editable: true,
    },
  ];

  const showTotal = () => `${(current * pageSize) - pageSize + 1} - ${current * pageSize} of ${dataTable.length} item(s)`

  const pageChanger = (e) => {
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
            <div className="bbl-font-bold">{branch} Lists</div>
            </div>

            <div className="row ml-5 mr-5">
              <TextField
                className="mt-2 mr-3"
                id="suppliercode"
                label="Supplier Code"
                variant="outlined"
                // value={suppliercode}
                style={{ width: '15%' }}
                onChange={(e) => { }}
              />
              <TextField
                className="mt-2 mr-3"
                id="suppliername"
                label="Supplier Name"
                variant="outlined"
                // value={suppliername}
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
                columns={SupplierColumns}
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

export default connect(mapStateToProps, mapDispatchToProps)(supplierLists);
