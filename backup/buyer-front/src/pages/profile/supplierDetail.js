import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Descriptions, Button } from 'antd';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

function supplierDetail(props) {
  const { blockUI, unblockUI } = props;
  const router = useRouter();

  const [branch, setBranch] = useState('Suppiler');

  const [id, setId] = useState('');

  useEffect(() => {
    const idForPath = router.query.id;
    setId(idForPath);
    unblockUI();
  });

  return (
    <div className="row justify-content-md-center">
      <div className="col-11">
        <div>
          <div className="row bbl-font mt-3 mb-3">
            Profile {'>'} {branch} Profile {'>'} {branch} Lists {'>'} &nbsp;
            <div className="bbl-font-bold">{branch} Detail</div>
          </div>

          <div className="row ml-3">
            <div>
              <img
                src="/assets/image/toyota-logo.png"
                className="border-img mr-3"
                style={{ width: '180px', height: 'auto' }}
              />
            </div>

            <div className="row col-9">
              <div className="col-7">
                <p style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                  Toyota Leasing Thailand
                </p>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Legal Name">
                    <div style={{ marginRight: '12%' }}> : </div>
                    TLT,TH, Bangkok
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Code">
                    <div style={{ marginRight: '12%' }}> : </div>
                    TLT1234
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Code for iCash">
                    <div style={{ marginRight: '12%' }}> : </div>
                    TLT9876
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Code for iSupply">
                    <div style={{ marginRight: '12%' }}> : </div>
                    TLT9876
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Name">
                    <div style={{ marginRight: '12%' }}> : </div>
                    Toyota Leasing Thailand
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Tax ID">
                    <div style={{ marginRight: '12%' }}> : </div>
                    01055300028259
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Branch Code">
                    <div style={{ marginRight: '12%' }}> : </div>
                    {id}
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Branch Name">
                    <div style={{ marginRight: '12%' }}> : </div>
                    สำนักงานใหญ่
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Address Detail">
                    <div style={{ marginRight: '12%' }}> : </div>
                    12/13 Silom Street
                  </Descriptions.Item>
                </Descriptions>
                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Sub District">
                    <div style={{ marginRight: '12%' }}> : </div>
                    สีลม
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="District">
                    <div style={{ marginRight: '12%' }}> : </div>
                    บางรัก
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Province">
                    <div style={{ marginRight: '12%' }}> : </div>
                    Bangkok
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Postcode">
                    <div style={{ marginRight: '12%' }}> : </div>
                    10500
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Payment Due Date">
                    <div style={{ marginRight: '12%' }}> : </div>
                    25
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="VAT Branch Code">
                    <div style={{ marginRight: '12%' }}> : </div>-
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="VAT Branch Name">
                    <div style={{ marginRight: '12%' }}> : </div>-
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                  <Descriptions.Item label="Company Code">
                    <div style={{ marginRight: '12%' }}> : </div>
                    Active
                  </Descriptions.Item>
                </Descriptions>
              </div>

              <div className="col-1" />

              <div className="col-4">
                <p style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                  Contect Person
                </p>

                <Descriptions colon={false} labelStyle={{ width: '100%' }}>
                  <Descriptions.Item label="Kunanon Somkham" />
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Email">
                    <div style={{ marginRight: '12%' }}> : </div>
                    kunanon@xxxxx
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Mobile no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Office Tel no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Fax no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions className="mt-3" colon={false} labelStyle={{ width: '100%' }}>
                  <Descriptions.Item label="Kunanon Somkham" />
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Email">
                    <div style={{ marginRight: '12%' }}> : </div>
                    kunanon@xxxxx
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Mobile no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Office Tel no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>

                <Descriptions colon={false} labelStyle={{ width: '40%' }}>
                  <Descriptions.Item label="Fax no.">
                    <div style={{ marginRight: '12%' }}> : </div>
                    02-3569442
                  </Descriptions.Item>
                </Descriptions>
              </div>
            </div>
          </div>

          <hr style={{ borderColor: '#456fb6', borderWidth: '2px' }} />

          <div className="row justify-content-md-center">
            {/* <Button
                            className="mr-2 px-5"
                            shape="round"
                            style={{ backgroundColor: "#003399", color: "#ffffff" }}
                            onClick={() => {
                                Router.push({
                                    pathname: "/profile/addEditBranchProfile/" + id,
                                })
                            }}
                        >
                            Edit
                        </Button> */}

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

export default connect(mapStateToProps, mapDispatchToProps)(supplierDetail);
