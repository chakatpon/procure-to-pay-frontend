import React, { useState, useContext, useEffect } from 'react';
// import { useCallback, useEffect } from 'react'
// import { useRouter } from 'next/router';

import { Form, Input, Button, Checkbox, Modal, Result } from 'antd';
// import styles from '../styles/Home.module.css';

import Router from 'next/router';

import TextField from '@material-ui/core/TextField';

import { connect } from 'react-redux';
import * as Auth from './api/AuthApi';
import * as MenuAPI from './api/MenuApi';
import { encryptStorage } from '../lib/encrypStorage';
import { StoreContext } from '../../context/store';

import { BLOCK_UI, UNBLOCK_UI } from '../../constant/login';

function Login(props) {
  // const router = useRouter();
  const context = useContext(StoreContext);
  const { blockUI, unblockUI } = props;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [alert, setAlert] = useState(false);
  const [messageAlert, setMessageAlert] = useState('');
  const [showSuccessCard, setShowSuccessCard] = useState(false);

  const onLogin = async (req) => {
    blockUI();
    Auth.getLoginBuyer(req).then(async (res) => {
      unblockUI();
      if (res !== undefined) {
        if (res.status === 200) {
          const userData = res.data;
          encryptStorage('user', userData);
          setShowSuccessCard(true);
          await dataMenu();
          // Router.push({
          //   pathname: '/dashboard',
          // });
        } else if (res.status === 422) {
          setShowSuccessCard(false);
          setAlert(true);
          setMessageAlert('Username or Password is incorrect.');
        }
      } else {
        setShowSuccessCard(false);
        setAlert(true);
        setMessageAlert('Something went wrong, please try again.');
      }
    });
  };

  const dataMenu = async () => {
    const resultMenu = await MenuAPI.getMenuBuyer();
    if (resultMenu) {
      console.log(resultMenu);
      encryptStorage('menu', resultMenu);
      Router.push({
        pathname: '/dashboard',
      });
      // setMenu(resultMenu);
    }
  };

  const onFinish = async () => {
    const data = {
      username: username || '',
      password: password || '',
      isRemember: remember ? 'Y' : 'N' || 'N',
    };

    await onLogin(data);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div className="content login d-flex flex-wrap align-items-center" id="bbl_login">
      <div className="row col-12">
        <Modal title=" " footer={null} visible={showSuccessCard} closable={false} width={400}>
          <Result status="success" title={<p>Login Successfully.</p>} />
        </Modal>
        <div className="col-6" style={{ textAlign: 'end', padding: '0px' }}>
          <img src="/assets/image/mockUpLogin.jpg" />
        </div>
        <div className="card col-4" style={{ minWidth: '440px' }}>
          <div className="card-body centerAll">
            <div className="container">
              <div className="row">
                <div className="container mt-5 col align-self-center">
                  <h2 className="text-center">Login</h2>
                  <br />
                  <Form onFinish={() => onFinish()} onFinishFailed={() => onFinishFailed()}>
                    <Form.Item
                      // label="Username"
                      name="username"
                      // rules={[{ required: true, message: 'กรุณากรอกข้อมูล Username' }]}
                      // hasFeedback
                    >
                      {/* <Input placeholder="USERNAME@COMCODE" allowClear /> */}
                      <TextField
                        // className="mb-4"
                        id="username"
                        label="Username"
                        variant="outlined"
                        // style={{ flex: "auto" }}
                        // defaultValue={username}
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          setAlert(false);
                        }}
                        style={{ width: '100%', marginBottom: '3%' }}
                      />
                    </Form.Item>

                    <Form.Item
                      // label="Password"
                      name="password"
                      // rules={[{ required: true, message: 'กรุณากรอกข้อมูล Password' }]}
                      // hasFeedback
                    >
                      {/* <Input.Password /> */}
                      <TextField
                        // className="mb-4"
                        id="password"
                        label="Password"
                        variant="outlined"
                        type="password"
                        // style={{ flex: "auto" }}
                        // value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setAlert(false);
                        }}
                        style={{ width: '100%', marginBottom: '3%' }}
                      />
                    </Form.Item>

                    {alert ? <p className="text-danger">{messageAlert}</p> : ''}

                    <div
                      className="row justify-content-between"
                      style={{ marginTop: '-10px', marginLeft: '0px' }}
                    >
                      <div className="col-6">
                        <Form.Item name="remember" valuePropName="checked">
                          <Checkbox
                            onChange={(e) => {
                              setRemember(e.target.checked);
                            }}
                          >
                            Remember me
                          </Checkbox>
                        </Form.Item>
                      </div>

                      <div className="col-6 mt-1">
                        <a style={{ float: 'right' }} href="/forgotPassword">
                          Forgot Password?
                        </a>
                      </div>
                    </div>

                    <div className="text-center">
                      <Form.Item>
                        <Button className="bbl-btn-blue px-5" shape="round" htmlType="submit">
                          Login
                        </Button>
                      </Form.Item>
                    </div>
                  </Form>
                </div>
              </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(Login);
