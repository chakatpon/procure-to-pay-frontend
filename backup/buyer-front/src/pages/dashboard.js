import React, { useState, useContext, useEffect } from 'react';
import { Badge, Layout, Menu, Breadcrumb, Space, Typography, Divider, Button } from 'antd';
import * as AuthAPI from './api/AuthApi';
import { connect } from 'react-redux';

import { StoreContext } from '../../context/store';
import { BLOCK_UI, UNBLOCK_UI } from '../../constant/login';

function Dashboard(props) {
  const context = useContext(StoreContext);
  const { blockUI, unblockUI } = props;

  useEffect(() => {
    unblockUI()
  })

  const click = () => {
    blockUI();
    setTimeout(() => {
      unblockUI();
    }, 3000);
    console.log(AuthAPI.getCurrentUser());
  };

  const click2 = () => {
    context.setTest({ message: 'OK' });
  };

  const click3 = () => {
    console.log(context.test.message);
  };

  return (
    <div>
      <Button
        className="mr-2"
        onClick={() => {
          click();
        }}
      >
        Click Test Token
      </Button>

      <Button
        className="mr-2"
        onClick={() => {
          click2();
        }}
      >
        Click Test Set Context is "OK"
      </Button>

      <Button
        className="mr-2"
        onClick={() => {
          click3();
        }}
      >
        Click Test log Context
      </Button>
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);


