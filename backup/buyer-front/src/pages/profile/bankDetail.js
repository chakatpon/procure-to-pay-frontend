import React, { useState, useEffect } from 'react';
import Router, { useRouter } from 'next/router';
import { Descriptions, Button } from 'antd';

import { connect } from 'react-redux';
import { BLOCK_UI, UNBLOCK_UI } from '../../../constant/login';

function bankDetail(props) {
    const { blockUI, unblockUI } = props;
    const router = useRouter();

    const [branch, setBranch] = useState('Buyer');
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
                        Profile {'>'} {branch} Profile {'>'} Bank Profile Lists {'>'} &nbsp;
            <div className="bbl-font-bold">Bank Detail</div>
                    </div>

                    <div className="row ml-3">
                        <div className="row col-9">
                            <div className="col-7">
                                <p style={{ color: '#003399', fontWeight: 'bold', marginBottom: '20px' }}>
                                    Bank Detail
                </p>

                                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                                    <Descriptions.Item label="Division Code">
                                        <div style={{ marginRight: '12%' }}> : </div>
                                        {id}
                                    </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                                    <Descriptions.Item label="Division Name">
                                        <div style={{ marginRight: '12%' }}> : </div>
                    สำนักงานใหญ่
                  </Descriptions.Item>
                                </Descriptions>

                                <Descriptions colon={false} labelStyle={{ width: '50%' }}>
                                    <Descriptions.Item label="Company Status">
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
                        {branch === 'Bank' ? (
                            <Button
                                className="bbl-btn-blue mr-2 px-5"
                                shape="round"
                                onClick={() => {
                                    blockUI();
                                    Router.push({
                                        pathname: `/profile/addEditBankProfile/${id}`,
                                    });
                                }}
                            >
                                Edit
                            </Button>
                        ) : (
                            ''
                        )}

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

const mapStateToProps = (state) => ({

});

const mapDispatchToProps = (dispatch) => ({
    blockUI: () => dispatch({ type: BLOCK_UI }),
    unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(bankDetail);
