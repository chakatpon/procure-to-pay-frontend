import { useRouter } from 'next/router';
import Router from 'next/router';
import React, { useState, useEffect, useContext } from 'react';
import { Badge, Layout, Menu, Space, Divider, Button, Dropdown, Modal, Result } from 'antd';
import NoticeIcon from 'ant-design-pro/lib/NoticeIcon';
import { Tag } from 'antd';
import { UserOutlined, BellOutlined } from '@ant-design/icons';
import { CgPassword } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
import LoadingOverlay from 'react-loading-overlay';
import { connect } from 'react-redux';
import Icon, { DownOutlined } from '@ant-design/icons';

import _, { isNull } from 'lodash';
import * as AuthAPI from '../api/AuthApi';
import * as MenuAPI from '../api/MenuApi';
import { encryptStorage, decryptStorage } from '../../lib/encrypStorage';
import { refreshTokenApi } from '../api/RefreshTokenApi';
import { StoreContext } from '../../../context/store';

const layout = (props) => {
  const context = useContext(StoreContext);
  const { children, blockUI } = props;

  const router = useRouter();
  const { Header, Content, Footer } = Layout;

  const [haveHolder, setHaveHolder] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [menu, setMenu] = useState([{ code: 'M010000', name: 'Dashboard' }]);
  const [menuHighlight, setMenuHighlight] = useState('');
  const [showModalConfirm, setShowModalConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({});
  const [nameAt, setNameAt] = useState('');

  const [onActionUser, setOnActionUser] = useState(false);

  // ------ expire token variable -----
  const [intervalResult, setIntervalResult] = useState(0);
  const [timer, setTimer] = useState(0);

  const nonLoginPath =
    router.asPath === '/login/' ||
    router.asPath === '/forgotPassword/' ||
    router.asPath === '/resetPassword/';

  const getLocalStorage = () => {
    return decryptStorage('user');
  };

  const logout = () => {
    AuthAPI.logout();
  };

  const checkTokenExpire = async (interval, showModal) => {
    const localStoreUser = getLocalStorage();
    const dateNow = new Date();
    if ((localStoreUser.expireTime / 1000) < ((dateNow.getTime() / 1000) + 380)) {
      if (showModal === false) {
        setShowModalConfirm(true);
        clearInterval(interval);

        const timer = setTimeout(() => {
          setShowModalConfirm(false);
          clearTimeout(timer);
          logout();
        }, 318000);

        setTimer(timer);
      }
    }
  };

  useEffect(async () => {
    const path = router.asPath.split('/');
    const menuHighlight1 = path[1].charAt(0).toUpperCase() + path[1].slice(1);
    setMenuHighlight(menuHighlight1);

    const localStorageUser = getLocalStorage();
    let interval;
    const dataMenu = async () => {
      const resultMenu = decryptStorage('menu');
      // const permission = _.get(localStorageUser, 'permission', []);
      // console.log(permission);
      //------------ process 1 -------------
      // const menuPermission = _.forEach(resultMenu, (menu) =>
      //   _.filter(
      //     permission,
      //     (permiss, key) => key == menu.code && permiss.some((item) => item == 'SEARCH_VIEW'),
      //   ),
      // );
      // console.log(menuPermission);

      // ---------- process 2 ------------------
      // const filterPermiss = [];
      // _.forEach(permission , (value, key) => {
      //   if (_.some(value, (permiss) => permiss == "SEARCH_VIEW")) {
      //     filterPermiss.push(key);
      //   }
      // });
      // const menuPermission = _.filter(resultMenu, (menu) => _.some(filterPermiss , (item) => menu.code == item));
      // console.log(menuPermission);

      if (resultMenu) {
        setMenu(resultMenu);
      }
    };
    if (!nonLoginPath) {
      if (isNull(localStorageUser) === false) {
        // if (!nonLoginPath) {
        await dataMenu();
        setShowMenu(true);
        getCurrentUser();
        const showModal = showModalConfirm === true;
        interval = setInterval(() => {
          checkTokenExpire(interval, showModal);
        }, 120000);

        setIntervalResult(interval);
        // }
      } else {
        setShowMenu(false);
        Router.push({
          pathname: '/login',
        }).then(() => {
          localStorage.removeItem('user');
        });
      }
    }

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [nonLoginPath]);

  const getCurrentUser = () => {
    let userData = AuthAPI.getCurrentUser();
    if (userData !== null) {
      userData = {
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        mobileNo: userData.mobileNo || '',
      };
      setUserData(userData);
      const userName = userData.firstName;
      const NameAt = userName.charAt(0);
      const atBig = NameAt.toLocaleUpperCase();
      setNameAt(atBig);
    }
  };

  const refreshToken = async () => {
    const localStorageUser = getLocalStorage();
    const { token } = localStorageUser;
    const refreshResult = await refreshTokenApi(token);

    if (refreshResult !== null) {
      const localStorageRefresh = {
        ...localStorageUser,
        expireTime: refreshResult.expireTime,
        token: refreshResult.token,
      };
      encryptStorage('user', localStorageRefresh);
      const showModal = false;
      const interval = setInterval(() => {
        checkTokenExpire(interval, showModal);
      }, 120000);

      setIntervalResult(interval);
    } else {
      logout();
    }
  };

  const footerModal = (
    <div className="text-center">
      <Button
        className="bbl-btn-blue px-5"
        shape="round"
        onClick={async () => {
          setShowModalConfirm(false);
          clearTimeout(timer);
          await refreshToken();
        }}
      >
        Yes
      </Button>
      <Button
        className="bbl-btn-orange px-5"
        shape="round"
        onClick={() => {
          clearInterval(intervalResult);
          setIntervalResult(0);
          setShowModalConfirm(false);
          logout();
        }}
      >
        No
      </Button>
    </div>
  );

  const menuDropdown = (
    <Menu>
      <Menu.Item
        key="0"
        icon={<CgPassword style={{ marginTop: '-3%', fontSize: '24px' }} />}
        style={{ height: '100%' }}
      >
        <a onClick={() => setLoading(true)} href="/changePassword" style={{ color: '#000000' }}>
          &nbsp; Change Password
        </a>
      </Menu.Item>
      <Menu.Item
        icon={<FiLogOut style={{ marginTop: '-3%', fontSize: '24px' }} />}
        key="1"
        onClick={() => {
          setLoading(true);
          logout();
        }}
      >
        <a style={{ color: '#000000' }}>&nbsp; Logout</a>
      </Menu.Item>
    </Menu>
  );

  const data = [
    {
      id: '000000001',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      title: 'aaaaaaaaaaaaaaaaaaaaaa',
      datetime: '2017-08-09',
      type: 'notification',
    },
    {
      id: '000000002',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
      title: 'bbbbbbbbbbbbbbb',
      datetime: '2017-08-08',
      type: 'notification',
    },
    {
      id: '000000003',
      avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
      title: 'cccccccccccccccccccccc',
      datetime: '2017-08-07',
      // read: true,
      type: 'notification',
    },
  ];

  const onItemClick = (item, tabProps) => {
    console.log(item, tabProps);
  };

  const onClear = (tabTitle) => {
    console.log(tabTitle);
  };

  const getNoticeData = (notices) => {
    if (notices.length === 0) {
      return {};
    }
    const newNotices = notices.map((notice) => {
      // console.log(notices)
      const newNotice = { ...notice };
      // transform id to item key
      if (newNotice.id) {
        newNotice.key = newNotice.id;
      }

      return newNotice;
    });
    return newNotices.reduce((pre, data) => {
      if (!pre[data.type]) {
        pre[data.type] = [];
      }
      pre[data.type].push(data);
      return pre;
    }, {});
  };

  const noticeData = getNoticeData(data);

  return (
    <div style={{ margin: '0px 0.04% 0px 0px' }}>
      <LoadingOverlay
        // active={context.loading}
        active={blockUI || loading}
        spinner
        text="กำลังดำเนินการ..."
        styles={{
          overlay: (base) => ({
            ...base,
            height: '100vh',
            position: 'fixed',
          }),
        }}
      >
        <div
          style={{
            margin: '0px 0.04% 0px 0px',
            background: '#f0f0f0',
            height: '100%',
          }}
        >
          {
            // <StoreContextProvider>
            // < Provider store={store} >
            <Layout style={{ background: '#f0f0f0', height: '100%' }}>
              {/* {console.log(children.blockUI)} */}

              <div className="wrapper">
                <Header
                  className={showMenu ? 'shadow-sm fixed-top-menu' : 'shadow-sm non-fixed-top-menu'}
                >
                  <div
                    className="row justify-content-between"
                    style={{ height: '100%', maxWidth: '100%' }}
                  >
                    <div className="row">
                      <div>
                        <img
                          src="/assets/image/BBL_Flag_EN_Blue.jpg"
                          style={{ display: 'block', height: '80px', width: 'auto' }}
                        />
                      </div>
                    </div>

                    {showMenu ? (
                      <div className="row">
                        <div>
                          <div className="navbar">
                            {/* <a href="/dashboard">Dashboard</a> */}

                            {menu &&
                              menu.map((menu, index) => (
                                <div key={index} className="subnav">
                                  {/* {menu.name === 'Dashboard' ? (
                                    <a onClick={() => setLoading(true)} href="/dashboard">
                                      Dashboard
                                    </a>
                                  ) : ( */}
                                  <button
                                    className={
                                      haveHolder
                                        ? 'subnavbtn'
                                        : menu.name === menuHighlight
                                        ? 'subnavbtn this-subnav'
                                        : 'subnavbtn'
                                    }
                                    type="button"
                                    onClick={() => {
                                      if (menu.url) {
                                        setLoading(true);
                                        window.location.href = menu.url;
                                      }
                                    }}
                                    onMouseOver={() => {
                                      setHaveHolder(true);
                                    }}
                                    onMouseLeave={() => {
                                      setHaveHolder(false);
                                    }}
                                  >
                                    <div>{menu.name}</div>
                                  </button>
                                  {/* )} */}
                                  <div
                                    className="subnav-content"
                                    onMouseOver={() => {
                                      setHaveHolder(true);
                                    }}
                                    onMouseLeave={() => {
                                      setHaveHolder(false);
                                    }}
                                  >
                                    {menu.subMenu &&
                                      menu.subMenu.map((submenu, index) =>
                                        submenu.url !== undefined ? (
                                          <a
                                            onClick={() => setLoading(true)}
                                            onMouseOver={() => {
                                              setHaveHolder(true);
                                            }}
                                            onMouseLeave={() => {
                                              setHaveHolder(false);
                                            }}
                                            href={`${submenu.url}`}
                                            key={index}
                                            style={
                                              index === 0
                                                ? { marginLeft: '50px' }
                                                : { marginLeft: '10px' }
                                            }
                                          >
                                            {/* {console.log("1")} */}
                                            {submenu.name}
                                          </a>
                                        ) : (
                                          <div key={index} className="subnav">
                                            <div
                                              className="subnavbtn"
                                              // onMouseOver={() => console.log(submenu.subMenu)}
                                              style={
                                                index === 0
                                                  ? { marginLeft: '50px' }
                                                  : { marginLeft: '10px' }
                                              }
                                            >
                                              <div style={{ fontWeight: 'bold' }}>
                                                {submenu.name}
                                              </div>

                                              <hr
                                                className="hr-left"
                                                style={{
                                                  borderColor: '#ffffff',
                                                  borderWidth: '2px',
                                                  width: '100%',
                                                }}
                                              />

                                              {submenu.subMenu &&
                                                submenu.subMenu.map((submenu, index) => (
                                                  <div key={index}>
                                                    <button
                                                      onClick={() => setLoading(true)}
                                                      onMouseOver={() => {
                                                        setHaveHolder(true);
                                                      }}
                                                      onMouseLeave={() => {
                                                        setHaveHolder(false);
                                                      }}
                                                    >
                                                      <a href={`${submenu.url}`}>{submenu.name}</a>
                                                    </button>
                                                  </div>
                                                ))}
                                            </div>
                                          </div>
                                        ),
                                      )}
                                  </div>
                                </div>
                              ))}

                            {/* <div className="subnav">
                            <button className="subnavbtn">Profile</button>
                            <div className="subnav-content">
                              <a href="/profile/buyerLists" style={{ marginLeft: '50px' }}>
                                Branch List
                              </a>
                              <a href="/profile/partnershipList" style={{ marginLeft: '10px' }}>
                                Partnership List
                              </a>
                            </div>
                          </div> */}
                          </div>
                        </div>

                        <div style={{ display: 'block', lineHeight: '79px' }}>
                          <Space
                            split={
                              <Divider
                                type="vertical"
                                style={{
                                  background: '#ffffff',
                                  height: '40px',
                                  borderWidth: '1px',
                                  margin: '0px 10px 0px 10px',
                                }}
                              />
                            }
                          >
                            <div
                              style={{
                                textAlign: 'right',
                                height: '64px',
                                lineHeight: '64px',
                                boxShadow: '0 1px 4px rgba(0,21,41,.12)',
                                padding: '0px 16px 0px 0px',
                              }}
                            >
                              <NoticeIcon
                                className="notice-icon"
                                bell={
                                  <BellOutlined style={{ fontSize: '25px', color: '#ffffff' }} />
                                }
                                count={5}
                                onItemClick={() => onItemClick}
                                onClear={() => onClear}
                              >
                                <NoticeIcon.Tab
                                  list={noticeData.notification}
                                  title="notification"
                                  emptyText="ไม่มีการแจ้งเตือน"
                                  emptyImage="https://gw.alipayobjects.com/zos/rmsportal/wAhyIChODzsoKIOBHcBk.svg"
                                />
                              </NoticeIcon>
                            </div>

                            <div className="row" style={{ marginLeft: '0px' }}>
                              <div
                                style={{
                                  width: '40px',
                                  height: '40px',
                                  marginTop: '10px',
                                  background: '#ffffff',
                                  MozBorderRadius: '10px',
                                  WebkitBorderRadius: '50px',
                                  borderRadius: '50px',
                                }}
                              >
                                <p
                                  style={{
                                    display: 'block',
                                    fontSize: '28px',
                                    color: '#003399',
                                    margin: '-45% 26%',
                                  }}
                                >
                                  {nameAt}
                                </p>
                              </div>

                              <h6 style={{ color: '#ffffff', marginTop: '9px' }}>
                                <Dropdown overlay={menuDropdown} trigger={['click']}>
                                  <Button
                                    style={{
                                      backgroundColor: '#003399',
                                      color: '#ffffff',
                                      borderColor: '#003399',
                                      marginTop: '5px',
                                    }}
                                    onClick={(e) => {
                                      setOnActionUser(!onActionUser);
                                      e.preventDefault();
                                    }}
                                  >
                                    {userData ? (
                                      <p>
                                        <span style={{ fontSize: '17px' }}>
                                          {userData.firstName}&nbsp;&nbsp;&nbsp;{userData.lastName}
                                        </span>
                                        <DownOutlined
                                          rotate={onActionUser ? 180 : ''}
                                          style={{
                                            fontSize: '12px',
                                            marginLeft: '10px',
                                            marginTop: '-20%',
                                            display: 'inline-grid',
                                          }}
                                        />
                                      </p>
                                    ) : (
                                      <></>
                                    )}
                                  </Button>
                                </Dropdown>
                              </h6>
                            </div>
                          </Space>
                        </div>
                      </div>
                    ) : (
                      ''
                    )}
                  </div>
                </Header>

                <div className="d-flex flex-column flex-root">
                  <Content
                    className="site-layout-background"
                    style={{
                      background: '#f0f0f0',
                      // minHeight: 768,
                    }}
                  >
                    <Modal
                      title=" "
                      visible={showModalConfirm}
                      closable={false}
                      footer={footerModal}
                      centered={true}
                    >
                      <h5 style={{ textAlign: 'center' }}>
                        Session will expire soon, will you continue?
                      </h5>
                    </Modal>
                    {!nonLoginPath ? (
                      <div className="card shadow-sm bg-white rounded fullpage">
                        <div
                          className="card-header bg-white"
                          style={{
                            // minHeight: 768,
                            borderBottomColor: '#ffffff',
                          }}
                        >
                          {children}
                        </div>
                      </div>
                    ) : (
                      <>{children}</>
                    )}
                  </Content>

                  <footer
                    style={{
                      backgroundColor: '#003399',
                    }}
                  >
                    <div className="container py-2" style={{ whiteSpace: 'normal' }}>
                      <div className="row">
                        <div className="col-1 px-0">
                          <img
                            src="/assets/image/BBL_Flag_EN_Blue.jpg"
                            alt=""
                            style={{ maxHeight: '37px' }}
                          />
                        </div>
                        <div className="col ml-10">
                          <h6 style={{ color: '#ffffff', fontSize: '12px' }}>
                            สงวนสิทธิ์ พ.ศ.2561 บมจ.ธนาคารกรุงเทพ <br />
                            เว็บไซค์ธนาคารกรุงเทพใช้งานได้ดีบนบราวเซอร์ Google Chrome, Firefox,
                            Safari และ Internet Expoler เวอร์ชั่น 11 ขึ้นไป
                          </h6>
                        </div>
                      </div>
                    </div>
                  </footer>
                </div>
              </div>

              {/* <Footer className="row"
                  style={{ backgroundColor: '#003399', height: '52px', padding: "0.7% 3%", marginRight: "0%" }}
                >
                  <div>
                    <img
                      src="/assets/image/BBL_Flag_EN_Blue.jpg"
                      style={{ height: '50px', width: 'auto', margin: "-6.5% 10%" }}
                    />
                  </div>
                  <h6 style={{ color: '#ffffff', fontSize: '12px', padding: "0.2% 3%" }}>
                    สงวนสิทธิ์ พ.ศ.2561 บมจ.ธนาคารกรุงเทพ <br />
                    เว็บไซค์ธนาคารกรุงเทพใช้งานได้ดีบนบราวเซอร์ Google Chrome, Firefox, Safari และ
                    Internet Expoler เวอร์ชั่น 11 ขึ้นไป
                  </h6>
                </Footer> */}
              {/* </div> */}
            </Layout>
            // </Provider >
            // </StoreContextProvider >
          }
        </div>
      </LoadingOverlay>
    </div>
  );
};

const mapStateToProps = (state) => ({
  blockUI: state.loadingOverlay.blockUI,
});

const mapDispatchToProps = (dispatch) => ({});

export default connect(mapStateToProps, mapDispatchToProps)(layout);
