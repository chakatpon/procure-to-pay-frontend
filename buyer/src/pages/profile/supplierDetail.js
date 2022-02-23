import React, { useState, useEffect, useContext } from 'react';
import Router, { useRouter } from 'next/router';
import Link from 'next/link';

import { connect } from 'react-redux';
import { Descriptions, Button, Breadcrumb, Table, Pagination, Modal, Result, Select, Input, } from 'antd';
import { UpOutlined, DownOutlined, CheckCircleOutlined, CloseCircleOutlined, } from '@ant-design/icons';
import _ from 'lodash';

import TableBlue from "../components/TableBlue";

import Layout from "../components/layout";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { StoreContext } from "../../context/store";

import { B2PAPI } from "../../context/api";

export default function supplierDetail(props) {
  const { showLoading, hideLoading, showAlertDialog } = useContext(StoreContext);
  const router = useRouter();
  const context = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const { Option } = Select;

  //= ============== Detail ============
  const [id, setId] = useState('');
  const [mainBranchId, setMainBranchId] = useState('');
  const [supplierDetail, setSupplierDetail] = useState({});
  const [branchCode, setBranchCode] = useState('');

  // =============== Table ==============
  const [hisActionData, setHisActionData] = useState([]);
  const [flagActionHis, setFlagActionHis] = useState(false);
  const [totalRecordAction, setTotalRecordAction] = useState(0);
  const [pageActionHis, setPageActionHis] = useState(1);
  const [pageActionHisSize, setPageActionHisSize] = useState(10);

  const [branchProfileList, setBranchProfileList] = useState([])
  const [totalRecordBranch, setTotalRecordBranch] = useState(0);
  const [pageBranch, setPageBranch] = useState(1);
  const [pageBranchSize, setPageBranchSize] = useState(10);


  const [suppBranchData, setSuppBranchData] = useState([]);

  const actionHisCol = [
    {
      key: 'action',
      title: 'Action',
      dataIndex: 'action',
    },
    {
      key: 'actionDate',
      title: 'Date Time',
      align: 'center',
      dataIndex: 'actionDate',
    },
    {
      key: 'actionBy',
      title: 'By User',
      dataIndex: 'actionBy',
    },
    {
      key: 'actionReason',
      title: 'Reason',
      dataIndex: 'actionReason',
      render: (text, record, index) => (
        <div >
          {text === "" ? ("-") : (text)}
        </div>
      ),
    },
  ];

  const supplierBranchCol = [
    {
      key: 'no',
      title: 'No',
      dataIndex: 'no',
      width: '10%',
      align: "center",
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      key: 'supplierBranchCode',
      title: 'Branch Code',
      // align: 'center',
      dataIndex: 'supplierBranchCode',
      render: (text, record, index) =>
        text == _.get(supplierDetail, 'supplierBranchCode', '') ? (
          <span>{text}</span>
        ) :
          (
            // <span>{text}</span>
            <a
              onClick={async () => {
                showLoading("Loading")
                await context.setSupplierBranchNameDetailId(_.get(record, 'supplierBranchCode', ''))
                // console.log(_.get(record, 'supplierBranchCode', ''))
                Router.push({
                  pathname: "/profile/supplierBranchDetail",
                });
              }}
              style={{ textDecoration: 'underline', color: 'blue' }}
              key={index}
            >
              {text}
            </a>
          ),
    },
    {
      key: 'supplierBranchName',
      title: 'Branch Name',
      dataIndex: 'supplierBranchName',
    },
    {
      key: 'supplierTaxId',
      title: 'Tax ID',
      dataIndex: 'supplierTaxId',
    },
    {
      key: 'isActive',
      title: 'Active',
      dataIndex: 'isActive',
      render: (text) =>
        text === true ? (
          <CheckCircleOutlined style={{ fontSize: '18px', color: '#1BAA6E' }} />
        ) : (
          <CloseCircleOutlined style={{ fontSize: '18px', color: '#C12C20' }} />
        ),
    },
  ];

  useEffect(async () => {
    const suppilerId = context.supplierNameDetailId;
    if (!suppilerId) {
      showLoading("Loading")
      window.history.back();
    } else {
      setId(suppilerId);
      setMainBranchId(suppilerId);

      if (context.buyerDetailId != "") {
        const supplierData = await AppApi.getApi('p2p/api/v1/view/supplier/profile/buyerCode', {
          supplierCode: suppilerId,
          buyerCode: context.buyerDetailId
        }, {
          method: "post", authorized: true,
        });
        if (supplierData.status == 200) {
          initialData(supplierData.data);
          hideLoading()
        } else {
          showAlertDialog({
            text: supplierData.data.message,
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: true,
          })
        }
      } else {
        const supplierData = await AppApi.getApi('p2p/api/v1/view/supplier/profile', {
          supplierCode: suppilerId
        }, {
          method: "post", authorized: true,
        });
        if (supplierData.status == 200) {
          initialData(supplierData.data);
          hideLoading()
        } else {
          showAlertDialog({
            text: supplierData.data.message,
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: true,
          })
        }
      }
    }
  }, []);

  const initialData = async (dataApi) => {

    setSupplierDetail(dataApi)

    const branch = _.get(dataApi, "branchList", []).map((bran, index) => ({ no: index + 1, ...bran }));
    setSuppBranchData(branch)
    setTotalRecordBranch(branch.length);

    setHisActionData(_.get(dataApi, 'historyList', []))

    setId(buyerId)

    hideLoading()
  };

  const onChangePageBranch = (pagination, filters, sorter, extra) => {
    setPageBranch(pagination.current);
    setPageBranchSize(pagination.pageSize);
  };


  const onChangePageActionHis = (pagination) => {
    setPageActionHis(pagination.current);
    setPageActionHisSize(pagination.pageSize);
  };

  return (
    <div className="container-fluid px-0">

      <section className="mb-8">
        <div className="container">

          <div id="box-header" className="col-12 mb-10">
            <Breadcrumb separator=">">
              <Breadcrumb.Item className="breadcrumb-item">
                Profile
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item">
                Supplier Profile
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item" href="/profile/supplierLists">
                Supplier Profile Lists
              </Breadcrumb.Item>
              <Breadcrumb.Item className="breadcrumb-item active">
                Supplier Detail
              </Breadcrumb.Item>
            </Breadcrumb>
          </div>

          <div className="row ml-3 mt-7 mb-12">
            {/* <div>
              <img
                src="/assets/image/toyota-logo.png"
                className="border-img mr-3"
                style={{ width: '180px', height: 'auto' }}
              />
            </div> */}

            {/* <div className="row col-10"> */}
            <div className="col-6">
              <h5 style={{ color: '#003399', marginBottom: '20px', fontWeight: 'bold' }}>
                {branchCode !== '' ? 'Supplier Branch Detail' : 'Supplier Detail'}
              </h5>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Supplier Name (TH)">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierCompNameTH', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Supplier Name (EN)">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierCompNameEN', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Tax ID">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierTaxId', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Branch Code">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierBranchCode', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Branch Name">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierBranchName', '-')}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="VAT Branch Code">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierVatBranchCode', '-') !== null &&
                    _.get(supplierDetail, 'supplierVatBranchCode', '-') !== '' ? (
                    _.get(supplierDetail, 'supplierVatBranchCode', '-')
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="VAT Branch Name">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierVatBranchName', '-') !== null &&
                    _.get(supplierDetail, 'supplierVatBranchName', '-') !== '' ? (
                    _.get(supplierDetail, 'supplierVatBranchName', '-')
                  ) : (
                    <span>-</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="WHT Type">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierWHTType', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Address Detail">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'addressDetail', '-')}
                </Descriptions.Item>
              </Descriptions>
              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Province">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'province', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="District">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'district', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Sub District">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'subDistrict', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Postcode">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'postcode', '-')}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Supplier Email 1">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierEmail1', '-') !== null ? (
                    _.get(supplierDetail, 'supplierEmail1', '-')
                  ) : (
                    <span> - </span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Supplier Email 2">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierEmail2', '-') !== null &&
                    _.get(supplierDetail, 'supplierEmail2', '-') !== '' ? (
                    _.get(supplierDetail, 'supplierEmail2', '-')
                  ) : (
                    <span> - </span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Supplier Email 3">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'supplierEmail3', '-') !== null &&
                    _.get(supplierDetail, 'supplierEmail3', '-') !== '' ? (
                    _.get(supplierDetail, 'supplierEmail3', '-')
                  ) : (
                    <span> - </span>
                  )}
                </Descriptions.Item>
              </Descriptions>

              <Descriptions colon={false} labelStyle={{ width: '30%' }}>
                <Descriptions.Item label="Company Status">
                  <div style={{ marginRight: '12%' }}> : </div>
                  {_.get(supplierDetail, 'isActive', '-') == true ? (
                    <span>Active</span>
                  ) : (
                    <span>Inactive</span>
                  )}
                </Descriptions.Item>
              </Descriptions>
            </div>

            <div className="col-1" />

            <div className="col-5">
              <h5 style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                Contact Person
              </h5>

              {_.get(supplierDetail, 'contactInfo', []).map((contact, index) => (
                <div key={index}>
                  <p style={{ fontWeight: 'bold', fontSize: '15px' }}>
                    {_.get(contact, 'name', '')}
                  </p>
                  <Descriptions colon={false} labelStyle={{ width: '20%' }}>
                    <Descriptions.Item label="Email">
                      <div style={{ marginRight: '12%' }}> : </div>
                      {_.get(contact, 'email', '-')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: '20%' }}>
                    <Descriptions.Item label="Mobile no.">
                      <div style={{ marginRight: '12%' }}> : </div>
                      {_.get(contact, 'mobileTelNo', '-')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: '20%' }}>
                    <Descriptions.Item label="Office Tel no.">
                      <div style={{ marginRight: '12%' }}> : </div>
                      {_.get(contact, 'officeTelNo', '-')}
                    </Descriptions.Item>
                  </Descriptions>

                  <Descriptions colon={false} labelStyle={{ width: '20%' }}>
                    <Descriptions.Item label="Fax no.">
                      <div style={{ marginRight: '12%' }}> : </div>
                      {_.get(contact, 'fax', '-') !== null && _.get(contact, 'fax', '-') !== '' ? (
                        _.get(contact, 'fax', '-')
                      ) : (
                        <span>-</span>
                      )}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              ))}
            </div>
            {/* </div> */}
          </div>

          <hr />

          {branchCode == '' && (
            <>
              <div className="row justify-content-between mt-5">
                <h5 className="ml-3" style={{ color: "#003399", fontWeight: "bold", marginBottom: "20px" }}>
                  Supplier Branch Lists
                </h5>
                {/*
                  <Button
                    className="bbl-btn-blue mr-2 px-10"
                    shape="round"
                    onClick={() => {
                      bshowLoading("Loading")
                      router.push(
                        {
                          pathname: '/profile/addEditSupplierBranchProfile',
                          query: {
                            supplierNameTH: _.get(supplierDetail, 'supplierCompNameTH', ''),
                            supplierNameEN: _.get(supplierDetail, 'supplierCompNameEN', ''),
                            supplierCompCode: id,
                          },
                        },
                        '/profile/addEditSupplierBranchProfile',
                      );
                    }}
                  >
                    Create
                  </Button>
                 */}
              </div>
              {/* <Table
                className="table-header-blue"
                pagination={false}
                dataSource={suppBranchData}
                columns={supplierBranchCol}
                rowKey={(record) => record.id}
              /> */}

              <TableBlue
                scroll={{ y: 200 }}
                dataSource={suppBranchData}
                columns={supplierBranchCol}
                total={totalRecordBranch}
                onChange={onChangePageBranch}
                current={pageBranch}
                pageSize={pageBranchSize}
                showPagination={true}
              />


              <br />
              {/* <hr /> */}
            </>
          )}

          {/* <Button
            className="mb-10"
            shape="round bbl-btn-blue-bark"
            onClick={() => {
              setFlagActionHis(!flagActionHis);
            }}
          >
            Action History
            {flagActionHis ? (
              <DownOutlined style={{ fontSize: '12px', marginLeft: '10px' }} />
            ) : (
              <UpOutlined style={{ fontSize: '12px', marginLeft: '10px' }} />
            )}
          </Button>

          {flagActionHis && (
            <>
              <Table
                className="table-header-blue"
                pagination={false}
                scroll={{ y: 200 }}
                dataSource={hisActionData}
                columns={actionHisCol}
              />
              <Pagination
                className="pagination-blue"
                total={totalRecordAction}
                onChange={onChangePageActionHis}
                showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
                current={pageActionHis}
                showSizeChanger
                pageSize={pageActionHisSize}
                defaultCurrent={1}
                defaultPageSize={10}
              />
            </>
          )} */}

          <hr style={{ borderColor: '#456fb6', borderWidth: '2px' }} />

          <div className="row justify-content-md-center">
            {/* {branchCode !== '' && (
              <Button
                className="btn btn-blue mr-2"
                shape="round"
                onClick={() => {
                  showLoading("Loading")
                  Router.push(
                    {
                      pathname: `/profile/addEditSupplierBranchProfile`,
                      query: { id: id, supplierBranchCode: branchCode, branch: true },
                    },
                    `/profile/addEditSupplierBranchProfile`,
                  );
                }}
              >
                Edit
              </Button>
            )} */}
            <Button
              className="btn btn-blue-transparent mr-2"
              shape="round"
              onClick={() => {
                showLoading("Loading")
                if (branchCode !== '') {
                  setBranchCode('');
                  setId(mainBranchId);
                  initialData(mainBranchId);
                } else {
                  window.history.back();
                }
              }}
            >
              Back
            </Button>
          </div>

        </div>
      </section>
    </div>
  );
}

supplierDetail.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}