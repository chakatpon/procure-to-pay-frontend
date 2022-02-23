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

function ChangePasswordprops(props) {
  const { blockUI, unblockUI } = props;
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState('');
  const [showPassword, setShowPassword] = useState('');
  const [showPassword2, setShowPassword2] = useState('');

  const [showOldPasswordErr, setShowOldPasswordErr] = useState(false);
  const [showPasswordErr, setShowPasswordErr] = useState(false);
  const [showPassword2Err, setShowPassword2Err] = useState(false);

  const [alert, setAlert] = useState(false);
  const [alertMessages, setAlertMessage] = useState('');

  const [showSuccessCard, setShowSuccessCard] = useState(false);

  useEffect(() => {
    unblockUI();
  });

  const data = {
    oldPassword,
    newPassword,
  };

  const changePassword = async (req) => {
    blockUI();
    Password.getChangePassword(req).then((res) => {
      unblockUI();
      if (res.status != null) {
        if (res.status === 200) {
          setShowSuccessCard(true);
        } else if (res.status === 422) {
          setAlertMessage('The current passwords entered an incorrect');
          setShowOldPasswordErr(true);
          setAlert(true);
        } else {
          console.log(res);
        }
      }
    });
  };

  const onSend = () => {
    if (oldPassword.length === 0) {
      setAlertMessage('Please enter your current password');
      setShowOldPasswordErr(true);
      setAlert(true);
    } else if (newPassword.length === 0) {
      setAlertMessage('Please enter your new password');
      setShowPasswordErr(true);
      setAlert(true);
    } else if (confirmPassword.length === 0) {
      setAlertMessage('Please enter your confirm password');
      setShowPassword2Err(true);
      setAlert(true);
    } else if (newPassword !== confirmPassword) {
      setAlertMessage('The passwords entered do not match');
      setShowPasswordErr(true);
      setShowPassword2Err(true);
      setAlert(true);
    } else {
      changePassword(data);
    }
  };

  return (
    <div>
      <div className="container">
        <div className="row justify-content-md-center">
          <div className="col-8">
            <div className="row bbl-font mt-3 mb-3">
              <Breadcrumb separator=">">
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item className="bbl-font-bold">Change Password</Breadcrumb.Item>
              </Breadcrumb>
            </div>

            <Modal
              title=" "
              footer={[]}
              visible={showSuccessCard}
              closable={false}
              onOk={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowSuccessCard(false);
              }}
              onCancel={() => {
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setShowSuccessCard(false);
              }}
            >
              <Result status="success" title={<p>Change Password Succesfully.</p>} />
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
                <div className="ml-3">Change Password</div>
              </div>
            </div>

            <div>
              <FormControl
                className="mt-4"
                variant="outlined"
                style={{ flex: 'auto', height: '80%', width: '100%' }}
              >
                <InputLabel>Current Password</InputLabel>
                <OutlinedInput
                  id="oldPassword"
                  label="Current Password"
                  variant="outlined"
                  error={showOldPasswordErr}
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setAlertMessage('');
                    setShowOldPasswordErr(false);
                    setAlert(false);
                  }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        // onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showOldPassword ? <Visibility /> : <VisibilityOff />}
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
                <InputLabel>New Password</InputLabel>
                <OutlinedInput
                  id="newPassword"
                  label="New Password"
                  error={showPasswordErr}
                  variant="outlined"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setShowPasswordErr(false);
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
                  error={showPassword2Err}
                  label="Confirm New Password"
                  variant="outlined"
                  style={{ flex: 'auto', height: '80%', width: '100%' }}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setAlertMessage('');
                    // setShowPasswordErr(false)
                    setShowPassword2Err(false);
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
  );
}

const mapStateToProps = (state) => ({});

const mapDispatchToProps = (dispatch) => ({
  blockUI: () => dispatch({ type: BLOCK_UI }),
  unblockUI: () => dispatch({ type: UNBLOCK_UI }),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordprops);
