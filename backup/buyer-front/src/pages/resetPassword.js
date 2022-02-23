import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import IconButton from '@material-ui/core/IconButton';
import { Button, Modal, Result, Breadcrumb } from 'antd';
import { connect } from 'react-redux';

import * as Password from './api/PasswordApi';
import { BLOCK_UI, UNBLOCK_UI } from '../../constant/login';

function ResetPassword(props) {
  const { blockUI, unblockUI } = props;
  const router = useRouter();
  const path = router.asPath;
  const token = path.replace('/resetPassword/?token=', '');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordErr, setPasswordErr] = useState(false);
  const [confirmPasswordErr, setConfirmPasswordErr] = useState(false);

  const [showPassword, setShowPassword] = useState('');
  const [showPassword2, setShowPassword2] = useState('');

  const [alert, setAlert] = useState(false);
  const [alertMessages, setAlertMessage] = useState('');

  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    unblockUI();
  });

  const data = {
    newPassword: password,
    recoverToken: token,
  };

  const resetPassword = async (req) => {
    blockUI();
    Password.getResetPassword(req).then((res) => {
      unblockUI();
      if (res.status === 200) {
        setShowSuccessCard(true);
      } else {
        console.log(res);
      }
    });
  };

  const onSend = () => {
    if (password.length === 0) {
      setAlertMessage('Please enter your password');
      setPasswordErr(true);
      setAlert(true);
    } else if (confirmPassword.length === 0) {
      setAlertMessage('Please enter your confirm password');
      setConfirmPasswordErr(true);
      setAlert(true);
    } else if (password !== confirmPassword) {
      setAlertMessage('The passwords entered do not match');
      setPasswordErr(true);
      setConfirmPasswordErr(true);
      setAlert(true);
    } else {
      resetPassword(data);
    }
  };

  return (
    <div>
      {/* <div className="card shadow-sm bg-white rounded"> */}
      <div
        className="card-header bg-white adjust-height"
        style={{
          borderBottomColor: '#ffffff',
        }} // minHeight: "768px"
      >
        <div className="container">
          <div className="row justify-content-md-center">
            <div className="col-8">
              <div className="row bbl-font mt-3 mb-3">
                <Breadcrumb separator=">">
                  <Breadcrumb.Item>Home</Breadcrumb.Item>
                  <Breadcrumb.Item className="bbl-font-bold">Reset Password</Breadcrumb.Item>
                </Breadcrumb>
              </div>

              <Modal
                title=" "
                footer={[]}
                visible={showSuccessCard}
                closable={false}
                onOk={() => {
                  setConfirmPassword('');
                  setPassword('');
                  window.location.replace('/login/');
                  setShowSuccessCard(false);
                }}
                onCancel={() => {
                  setConfirmPassword('');
                  setPassword('');
                  window.location.replace('/login/');
                  setShowSuccessCard(false);
                }}
              >
                <Result status="success" title={<p>Reset Password Succesfully.</p>} />
              </Modal>

              <div
                style={{
                  width: '100%',
                  height: 'auto',
                  margin: '0px -15px 0px -15px',
                  border: '2px solid #f7f7f7',
                  background: '#f7f7f7',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    color: '#585858',
                    fontWeight: 'bold',
                    verticalAlign: 'middle',
                    marginLeft: '1%',
                    display: 'table-cell',
                    height: '40px',
                  }}
                >
                  <div className="ml-3">Reset Password</div>
                </div>
              </div>

              <div>
                <FormControl
                  className="mt-4"
                  variant="outlined"
                  style={{ flex: 'auto', height: '80%', width: '100%' }}
                >
                  <InputLabel>New Password</InputLabel>
                  <OutlinedInput
                    id="password"
                    label="New Password"
                    variant="outlined"
                    error={passwordErr}
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setPasswordErr(false);
                      setAlertMessage('');
                      setAlert(false);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          // onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    labelWidth={70}
                  />
                </FormControl>

                <FormControl
                  className="mt-4"
                  variant="outlined"
                  style={{ flex: 'auto', height: '80%', width: '100%' }}
                >
                  <InputLabel>Confirm New Password</InputLabel>
                  <OutlinedInput
                    type={showPassword2 ? 'text' : 'password'}
                    id="confirmPassword"
                    label="Confirm New Password"
                    error={confirmPasswordErr}
                    variant="outlined"
                    style={{ flex: 'auto', height: '80%', width: '100%' }}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      // setPasswordErr(false)
                      setConfirmPasswordErr(false);
                      setAlertMessage('');
                      setAlert(false);
                    }}
                    endAdornment={
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword2(!showPassword2)}
                          // onMouseDown={handleMouseDownPassword}
                          edge="end"
                        >
                          {showPassword2 ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </InputAdornment>
                    }
                    labelWidth={70}
                  />
                </FormControl>

                {alert ? <p className="text-danger">{alertMessages}</p> : ''}
              </div>

              <div className="row justify-content-md-center mt-3">
                <Button
                  className="bbl-btn-blue mr-2 px-5"
                  shape="round"
                  onClick={() => {
                    onSend();
                  }}
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
            </div>
          </div>
        </div>
      </div>
      {/* </div> */}
    </div>
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  blockUI: () => dispatch({ type: BLOCK_UI }),
  unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ResetPassword);
