import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import { StoreContext } from "@/context/store";
import { useTranslation } from "next-i18next";
import { B2PAPI } from "@/context/api";
import { get, sortBy, isEmpty, debounce, isEqual, difference, forEach, unionBy } from "lodash";
import Link from "next/link";
import SockJsClient from "react-stomp";
import InfiniteScroll from "react-infinite-scroll-component";
import moment from "moment";
import notification from "../../models/notification.json";
import { Badge, Skeleton } from "antd";
import ErrorHandle from "./ErrorHandle";

function Header(props) {
  const { t, i18n } = useTranslation("layout");
  const {
    isLogin,
    appMenu,
    setAppMenu,
    showAlertDialog,
    showLoading,
    hideLoading,
    forceLogin,
    forceChangePassword,
    appMenuActive,
    loginUser,
    setProfileCanvas,
    getStorage,
    setLoginUser,
    appSocketEndPoint,
  } = useContext(StoreContext);
  let AppApi = B2PAPI(StoreContext);
  const context = useContext(StoreContext);
  const router = useRouter();
  const notiModel = notification; //----- notification model show pageCode,Url and pageParams ---

  // ---------- Notification -----------
  const [notifyList, setNotifyList] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [unRead, setUnread] = useState(0);
  const [unReview, setUnReview] = useState(0);
  const [token, setToken] = useState("");
  const [lastDateItem, setLastDateItem] = useState(moment().format("yyyy-MM-DDTHH:mm:ss.SSS"));
  const [flagInquiry, setFlagInquiry] = useState(false);
  const [countNoti, setCountNoti] = useState(10);

  const path = router.asPath;

  const nonLoginPage = router.asPath == "/login" || router.asPath == "/forgotPassword" || path.search("/resetPassword") != "-1";

  useEffect(async () => {
    initialMenu();
    if ((!isEmpty(getStorage("userData")) || (!isEmpty(getStorage("menuList")))) && get(getStorage("userData"), "forceChangePassword", "N") == "N") {
      // -- inquiry noti and start noti when login success ---
      if (!nonLoginPage) {
        await inquiryNoti();
        setToken(get(getStorage("userData"), "token", ""));
      }
    }
  }, []);

  // ----------- function for inquiry noti firstTime past 30 days ---------------
  const inquiryNoti = async () => {
    const dateTime = moment().format("YYYY-MM-DD[T]HH:mm:ss.SSS");
    // console.log('dateTime', dateTime);
    const inquiryNoti = await AppApi.getApi(
      "p2p/api/v1/inquiry/notificationUser",
      { lastDateItem: dateTime, pageSize: 10 },
      {
        method: "post",
        authorized: true,
      }
    );

    if (get(inquiryNoti, "status", 500) == 200) {
      // console.log("inquiry : ", inquiryNoti.data);
      // setLastDateItem(get(inquiryNoti.data, "notiDateTime", dateTime));
      setUnReview(get(inquiryNoti.data, "unReview"));
      setUnread(get(inquiryNoti.data, "unRead"));
      const notiListMap = mapPageCodeNotiURL(get(inquiryNoti.data, "notifyList", []));
      // console.log("notiListMap : ",notiListMap);
      setNotifyList(notiListMap);
      setFlagInquiry(true);
    } else {
      setFlagInquiry(false);
      showAlertDialog({
        title: get(inquiryNoti, "data.error", "Error !"),
        text: get(inquiryNoti, "data.message", ""),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
    }
  };

  const initLoad = () => {
    // Init Desktop & Mobile Headers
    if (typeof KTLayoutHeader !== "undefined") {
      KTLayoutHeader.init("bbl_header", "bbl_header_mobile");
    }

    // Init Header Menu

    if (typeof KTLayoutHeaderMenu !== "undefined") {
      KTLayoutHeaderMenu.init("bbl_header_menu", "bbl_header_navs");
    } else {
    }

    // Init Header Topbar For Mobile Mode
    if (typeof KTLayoutHeaderTopbar !== "undefined") {
      KTLayoutHeaderTopbar.init("bbl_header_mobile_topbar_toggle");
    }

    // Init Brand Panel For Logo
    if (typeof KTLayoutBrand !== "undefined") {
      KTLayoutBrand.init("bbl_brand");
    }

    // Init Aside
    if (typeof KTLayoutAside !== "undefined") {
      KTLayoutAside.init("bbl_aside");
    }

    // Init Aside Menu Toggle
    if (typeof KTLayoutAsideToggle !== "undefined") {
      KTLayoutAsideToggle.init("bbl_aside_toggle");
    }

    // Init Aside Menu
    if (typeof KTLayoutAsideMenu !== "undefined") {
      KTLayoutAsideMenu.init("bbl_aside_menu");
    }

    // Init Subheader
    if (typeof KTLayoutSubheader !== "undefined") {
      KTLayoutSubheader.init("bbl_subheader");
    }

    // Init Content
    if (typeof KTLayoutContent !== "undefined") {
      KTLayoutContent.init("bbl_content");
    }

    // Init Footer
    if (typeof KTLayoutFooter !== "undefined") {
      KTLayoutFooter.init("bbl_footer");
    }

    //////////////////////////////////////////////
    // Layout Extended Partials(optional to use)//
    //////////////////////////////////////////////

    // Init Scrolltop
    if (typeof KTLayoutScrolltop !== "undefined") {
      KTLayoutScrolltop.init("bbl_scrolltop");
    }

    // Init Sticky Card
    if (typeof KTLayoutStickyCard !== "undefined") {
      KTLayoutStickyCard.init("bbl_page_sticky_card");
    }

    // Init Stretched Card
    if (typeof KTLayoutStretchedCard !== "undefined") {
      KTLayoutStretchedCard.init("bbl_page_stretched_card");
    }

    // Init Code Highlighter & Preview Blocks(used to demonstrate the theme features)
    if (typeof KTLayoutExamples !== "undefined") {
      KTLayoutExamples.init();
    }

    // Init Quick Notifications Offcanvas Panel
    if (typeof KTLayoutQuickNotifications !== "undefined") {
      KTLayoutQuickNotifications.init("bbl_quick_notifications");
    }

    // Init Quick Offcanvas Panel
    if (typeof KTLayoutQuickPanel !== "undefined") {
      KTLayoutQuickPanel.init("bbl_quick_panel");
    }

    // Init Quick User Panel
    if (typeof KTLayoutQuickUser !== "undefined") {
      KTLayoutQuickUser.init("bbl_quick_user");
    }
    if (typeof $) {
      setTimeout(() => {
        let tMenu = false;
        $(".header-tabs .nav-item .nav-link").on("mouseover", function () {
          if (tMenu) {
            clearTimeout(tMenu);
          }
          let id = $(this).data("target");
          $(".header-bottom .tab-pane.active").removeClass("active");
          $(".header-tabs .nav-item .nav-link.active").removeClass("active");
          $(".header-bottom " + id).addClass("active");
          $(this).addClass("active");
        });
        $(".tab-pane").on("mouseover", function () {
          if ($(this).hasClass("active")) {
            if (tMenu) {
              clearTimeout(tMenu);
            }
          }
        });
        $(".header-tabs .nav-item .nav-link,.header-bottom .tab-pane").on("mouseout", function () {
          if ($(this).hasClass("active")) {
            tMenu = setTimeout(() => {
              $(".header-tabs .nav-item .nav-link.active").removeClass("active");
              $(".header-bottom .tab-pane.active").removeClass("active");
            }, 2000);
          }
        });
      }, 500);
    }
  };

  const initialMenu = () => {
    if (isEmpty(getStorage("userData")) || isEmpty(getStorage("menuList"))) {
      // no user data or no menuList -> go to login
      if (!nonLoginPage) {
        return forceLogin();
      }
    }

    if (get(getStorage("userData"), "forceChangePassword", "N") == "Y") {
      setAppMenu([]);
      forceChangePassword();
    } else {
      setAppMenu(getStorage("menuList"));
    }

    setLoginUser(getStorage("userData"));
    initLoad();
  };

  // --------------- function for manage notification when have new notification from SockJs --------- //
  const handleNotify = (message) => {
    let unreadCount = unRead;
    let unreviewCount = unReview;
    let notifyLists = [...notifyList];
    // console.log("message Stomp : ",message.notifyList);
    const notiListMap = mapPageCodeNotiURL(get(message, "notifyList", []));
    // setLastDateItem(get(message, "notifyList.0.notiDateTime", []));
    notifyLists.unshift(get(notiListMap, "0", {}));
    unreadCount = unreadCount + get(message, "unRead", 0);
    unreviewCount = unreviewCount + get(message, "unReview", 0);

    setNotifyList(notifyLists);
    setUnread(unreadCount);
    setUnReview(unreviewCount);
    setHasMore(true);
  };

  // ---------- function for update flag of notification such as flag "REVIEW", "READ" ----------
  const updateNotification = async (flagUpdate, msgIdList) => {
    try {
      const requestBody = {
        msgIdList: msgIdList || [],
        flag: flagUpdate || "REVIEW",
      };

      const updateNoti = await AppApi.getApi("/p2p/api/v1/update/notificationUser", requestBody, {
        method: "post",
        authorized: true,
      });

      if (updateNoti && updateNoti.status == 200) {
        return true;
      } else {
        showAlertDialog({
          title: get(updateNoti, "data.error", "Error !"),
          text: get(updateNoti, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
      }

      return false;
    } catch (err) {
      ErrorHandle(err);
    }
  };

  // -------------- function for count unread and unreview ---------------------
  const updateStatusNoti = (notiList) => {
    const countUnRead = notiList.filter((noti) => noti.read == false).length;
    const countUnReview = notiList.filter((noti) => noti.review == false).length;
    setUnread(countUnRead);
    setUnReview(countUnReview);
  };

  // --------- function call when user click bell of notification for update flag "REVIEW" --------
  const onReviewNoti = async () => {
    if (!document.getElementById("notification").classList.contains("show")) {
      if (unReview > 0) {
        // const msgIdList = [];
        // let updateReviewNoti = false;
        // const notifyListNew = notifyList.map((noti) => {
        //   if (noti.review == false) {
        //     msgIdList.push(noti.msgId);
        //     noti.review = true;
        //   }
        //   return noti;
        // });

        // if (msgIdList.length > 0) {
        const updateNotiReviewStatus = await AppApi.getApi("p2p/api/v1/update/notification/review", {}, { method: "get", authorized: true });

        if (get(updateNotiReviewStatus, "status", 500) == 200) {
          setUnReview(0);
        } else {
          showAlertDialog({
            title: get(updateNotiReviewStatus, "data.error", "Error !"),
            text: get(updateNotiReviewStatus, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
        }
        // }
      }
    }
  };

  // ------------ function for manage redirect notification -------------
  const onRedirectNoti = async (notification) => {
    // console.log("noti Redirect : ", notification);
    // console.log("AAAAA", get(notification, "redirectCode", {}));
    // console.log("AAAAA", get(notification, "redirectParam.id", {}));

    // -------** set id on context **-------
    if (
      get(notification, "redirectCode", {}) == "PF_BUYER_WAITING_APPROVAL" ||
      get(notification, "redirectCode", {}) == "PF_BUYER_REJECTED" ||
      get(notification, "redirectCode", {}) == "PF_BUYER_REJECTED_BY_BUYER"
    ) {
      await context.setBuyerApprovalDetailId(get(notification, "redirectParam.id", {}));
    }
    if (get(notification, "redirectCode", {}) == "PF_BUYER_APPROVED_BY_BUYER" || get(notification, "redirectCode", {}) == "PF_BUYER_APPROVED") {
      await context.setBuyerDetailId(get(notification, "redirectParam.buyerCode", {}));
    }
    if (get(notification, "redirectCode", {}) == "PF_PNS_REJECTED" || get(notification, "redirectCode", {}) == "PF_PNS_WAITING_APPROVAL") {
      await context.setSupplierNameApprovalDetailId(get(notification, "redirectParam.id", {}));
    }
    if (get(notification, "redirectCode", {}) == "PF_PNS_APPROVED") {
      await context.setBuyerDetailId(get(notification, "redirectParam.buyerCode", {}));
      await context.setSupplierNameDetailId(get(notification, "redirectParam.supplierCode", {}));
    }

    // ------- update unRead -------
    if (get(notification, "read", false) == false) {
      const msgIdList = [get(notification, "msgId", "")];
      const updateReadNoti = await updateNotification("READ", msgIdList);
      if (updateReadNoti) {
        const newNotiList = notifyList.map((noti) => {
          if (get(noti, "msgId", "") == get(notification, "msgId", "")) {
            noti.read = true;
          }

          return noti;
        });
        setNotifyList(newNotiList);
        updateStatusNoti(newNotiList);
      }
    }

    // ---------- Redirect to page ------------
    showLoading();
    router.push(
      {
        pathname: get(notification, "url", "/"),
        query: { ...get(notification, "redirectParam", {}) },
      },
      get(notification, "url", "/")
    );
    // .then(() => {
    //   hideLoading();
    // }).catch((err) => {
    //   hideLoading();
    // });

    // ----- close notification list -------
    let dropdownNoti = document.getElementById("notification");
    if (dropdownNoti.classList.contains("show")) {
      dropdownNoti.classList.remove("show");
    }
  };

  // --------- function for fetch more notification ----------
  const fetchMoreData = async () => {
    // console.log("fetchMore"); `${notifyList.length - 1}.notiDateTime`
    const indexLastNotify = notifyList.length - 1;
    const notiDateItem = get(notifyList, [indexLastNotify.toString(), "notiDateTime"], moment().format("YYYY-MM-DD[T]HH:mm:ss.SSS"));
    // console.log(309, notiDateItem);
    const fetchMoreNoti = await AppApi.getApi(
      "p2p/api/v1/inquiry/notificationUser",
      { lastDateItem: notiDateItem, pageSize: 10 },
      {
        method: "post",
        authorized: true,
      }
    );

    if (get(fetchMoreNoti, "status", 500) == 200) {
      // console.log("fetch more : ", fetchMoreNoti.data);
      if (get(fetchMoreNoti.data, "notifyList", []).length == 0) {
        setHasMore(false);
        return;
      }

      const notiListMap = mapPageCodeNotiURL(get(fetchMoreNoti.data, "notifyList", []));
      const msgId = notiListMap.filter((notiMap) => notiMap.review == false).map((noti) => noti.msgId);
      if (msgId.length > 0) {
        const updateReviewNoti = await updateNotification("REVIEW", msgId);
        if (updateReviewNoti) {
          setUnReview(0);
        }
      }

      setTimeout(() => {
        setNotifyList([...notifyList, ...notiListMap]);

        // setLastDateItem(get(fetchMoreNoti.data, "notiDateTime", moment().format("YYYY-MM-DD[T]HH:mm:ss.SSS")));
        // setUnReview(get(fetchMoreNoti.data, "unReview"));
        setUnread(get(fetchMoreNoti.data, "unRead"));
      }, 500);
    } else {
      setHasMore(false);
      showAlertDialog({
        title: get(fetchMoreNoti, "data.error", "Error !"),
        text: get(fetchMoreNoti, "data.message", ""),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
      return;
    }
  };

  // ------------- function for map notification url fo redirect to page --------------
  const mapPageCodeNotiURL = (notiList) => {
    const mapUrlNoti = notiList.map((noti) => {
      forEach(notiModel, (notiModels, index) => {
        if (noti.redirectCode == index) {
          noti.url = get(notiModels, "url", null);
          const redirectParamModel = get(notiModels, "redirectParam", {});
          // const notiJson = JSON.parse(noti.redirectParam);
          // const redirecParam = JSON.parse(notiJson);
          // noti.redirectParam = {
          //   ...redirecParam,
          // };

          if (!isEmpty(redirectParamModel)) {
            noti.redirectParam = {
              ...noti.redirectParam,
              ...redirectParamModel,
            };
          }
        }
      });

      return noti;
    });
    return mapUrlNoti;
  };

  return (
    <div id="bbl_header" className="header flex-column header-fixed">
      <div className="header-top">
        <div className="container">
          <div className="d-none d-lg-flex align-items-center mr-3 justify-content-between">
            <a href="/" className="mr-20">
              <img alt="Logo" src="/assets/media/logos/bbl-logos.png" className="max-h-35px" />
            </a>
          </div>

          <div className="topbar bg-primary">
            <ul ket="m-1" className="d-none d-lg-flex header-tabs nav align-self-end font-size-sm" role="tablist">
              {!isEmpty(appMenu) ? (
                appMenu.map((r) => {
                  return (
                    <li key={get(r, "code", "")} className="nav-item">
                      <Link href={get(r, "url", "javascript:void(0);")}>
                        <a
                          className={appMenuActive == get(r, "url", "javascript:void(0);") ? "nav-link py-7 px-3 active" : "nav-link py-7 px-3"}
                          data-toggle="tab"
                          data-target={get(r, "code", "") ? "#bbl_header_tab_" + get(r, "code", "") : ""}
                          role="tab"
                        >
                          {get(r, "name")}
                        </a>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <></>
              )}
            </ul>

            {isLogin == false || !loginUser || get(getStorage("userData"), "forceChangePassword", "N") == "Y" ? (
              ""
            ) : (
              <div className="dropdown">
                {appSocketEndPoint && flagInquiry && token !== "" ? (
                  <SockJsClient
                    url={appSocketEndPoint}
                    topics={["/user/client/web/messages"]}
                    headers={{ Authorization: "Bearer " + token }}
                    onMessage={(msg) => {
                      handleNotify(msg);
                    }}
                    // debug
                    autoReconnect={true}
                  />
                ) : (
                  <></>
                )}
                <div className="topbar-item" id="" data-toggle="dropdown" data-offset="10px,0px">
                  <div
                    id="bell-noti"
                    style={{ padding: "1rem 1.42rem" }}
                    className="btn btn-icon btn-hover-transparent-white btn-dropdown btn-lg mr-1 pulse pulse-white"
                    onMouseDown={() => onReviewNoti()}
                  >
                    <Badge size="small" count={unReview}>
                      <i className="fal fa-bell icon-xl"></i>
                    </Badge>
                    {notifyList.length > 0 ? (
                      <>
                        {/* <span className="label label-dot label-xl label-warning"></span> */}
                        <span className="pulse-ring"></span>
                      </>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div id="notification" style={{ maxHeight: "500px", overflow: "auto" }} className="dropdown-menu p-0 m-0 dropdown-menu-right dropdown-menu-anim-up dropdown-menu-lg">
                  {/* <div className="dropdown-noti-arrow"></div> */}
                  {unRead > 0 && (
                    <div className="mt-5 ml-4">
                      <span style={{ color: "#3269CD", fontWeight: "bold" }}>Unread {unRead}</span>
                    </div>
                  )}

                  <form>
                    <div className="navi navi-hover scroll my-4" data-scroll="true" data-height="300" data-mobile-height="200">
                      {notifyList.length > 0 ? (
                        <InfiniteScroll
                          dataLength={notifyList.length} //notifyList.length
                          next={fetchMoreData}
                          hasMore={hasMore}
                          loader={
                            <div style={{ marginLeft: "20px", marginRight: "20px" }}>
                              <Skeleton active paragraph={{ rows: 2 }} />
                            </div>
                          }
                          // loader={<span style={{ fontSize: "16px", marginLeft: "20px" }}>Loading</span>}
                          scrollableTarget="notification"
                          endMessage={
                            <p style={{ textAlign: "center" }}>
                              <b>You have seen it all</b>
                            </p>
                          }
                        >
                          {notifyList.map((noti, index) => (
                            // <Link href="http://google.com" key={index}>
                            <a className="navi-item" onClick={() => onRedirectNoti(noti)}>
                              <div className={get(noti, "read", false) == false ? "navi-link unread" : "navi-link"}>
                                <div className="navi-text">
                                  <span dangerouslySetInnerHTML={{ __html: get(noti, "topic", "<span> - </span>") }}></span>
                                  <br />
                                  <span style={{overflow: "hidden", lineBreak: "anywhere"}} dangerouslySetInnerHTML={{ __html: get(noti, "content", "<p> - </p>") }}></span>
                                  <p className="mt-3" style={{ color: "#003399" }}>
                                    {moment(get(noti, "notiDateTime", "")).format("DD-MM-YYYY HH:mm:ss")}
                                  </p>
                                </div>
                              </div>
                              <div style={{ borderTop: "1px solid #E6EEF4", margin: "5px 10px" }}></div>
                            </a>
                            // </Link>
                          ))}
                        </InfiniteScroll>
                      ) : (
                        <>
                          <a className="navi-item">
                            <div className="navi-link">
                              <div className="navi-text text-center">
                                <i className="fad fa-clipboard-list-check fa-2x text-success m-3"></i>
                                <div className="font-weight-bold">No new notification.</div>
                              </div>
                            </div>
                          </a>
                        </>
                      )}
                    </div>
                  </form>
                </div>
              </div>
            )}

            {isLogin == true && loginUser ? (
              <div className="topbar-item">
                <div className="btn btn-icon btn-hover-transparent-white w-sm-auto d-flex align-items-center btn-lg px-2" onClick={() => setProfileCanvas(true)}>
                  <div className="d-flex flex-column text-right pr-sm-3">
                    <span className="text-white text-uppercase opacity-50 font-weight-bold font-size-sm d-none d-sm-inline">
                      {get(loginUser, "firstName")} {get(loginUser, "lastName")}
                    </span>
                    <span className="text-white font-weight-bolder font-size-sm d-none d-sm-inline">{get(loginUser, "role")}</span>
                  </div>
                  <span className="symbol symbol-35 symbol-circle">
                    {get(loginUser, "picture", "") ? (
                      <div
                        className="symbol-label  bg-white-o-30"
                        style={{
                          backgroundImage: "url(data:image/jpeg;base64," + get(loginUser, "picture", "") + ")",
                        }}
                      ></div>
                    ) : (
                      <>
                        <span className="symbol-label font-size-h5 font-weight-bold text-white bg-white-o-30">{get(loginUser, "firstName", "").substr(0, 1)}</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            ) : (
              <></>
            )}
          </div>
        </div>
      </div>

      <div className="header-bottom">
        <div className="container">
          <div className="header-navs header-navs-left" id="bbl_header_navs">
            <ul className="header-tabs p-5 p-lg-0 d-flex d-lg-none nav nav-bold nav-tabs" role="tablist">
              {!isEmpty(appMenu) ? (
                appMenu.map((r) => {
                  return (
                    <li key={get(r, "code", "")} className="nav-item mr-2">
                      <Link href={get(r, "url", "javascript:void(0);")}>
                        <a
                          className={appMenuActive == get(r, "url", "javascript:void(0);") ? "nav-link btn btn-clean active" : "nav-link btn btn-clean py-4 px-6"}
                          data-toggle="tab"
                          data-target={get(r, "code", "") ? "#bbl_header_tab_" + get(r, "code", "") : ""}
                          role="tab"
                        >
                          {get(r, "name")}
                        </a>
                      </Link>
                    </li>
                  );
                })
              ) : (
                <></>
              )}
            </ul>

            <div className="tab-content">
              {!isEmpty(appMenu) ? (
                appMenu.map((r) => {
                  if (get(r, "code", "") != "" && get(r, "subMenu", false)) {
                    return (
                      <div
                        className={
                          appMenuActive == get(r, "url", "javascript:void(0);") ? "m-4 tab-pane p-5 p-lg-0 justify-content-between show active" : "m-4 tab-pane p-5 p-lg-0 justify-content-between"
                        }
                        id={"bbl_header_tab_" + get(r, "code", "")}
                      >
                        {get(r, "subMenu", []).filter((ss) => get(ss, "subMenu", []).length != 0).length > 0 ? (
                          <div className="header-menu header-menu-left header-menu-mobile header-menu-layout-default">
                            <div className="fullwidth-submenu d-flex flex-wrap">
                              {get(r, "subMenu", []).map((s) => {
                                return get(s, "subMenu", []).length > 0 ? (
                                  <div className="col menu-blog text-left">
                                    <p className="menu-blog-title white bold py-2 px-5 mb-0 max-width-sub-menu">{get(s, "name")}</p>
                                    <hr size="0" className="border-white col-4 px-0 mx-0 mb-7" />
                                    {get(s, "subMenu", []).map((ss) => {
                                      return (
                                        <p className="pb-3 mb-2 max-width-sub-menu">
                                          <Link href={get(ss, "url", "javascript:void(0);")}>
                                            <a
                                              className="w-100 btn-text"
                                              onClick={() => {
                                                // console.log("profile");
                                                context.setBuyerApprovalDetailId("");
                                                context.setBuyerDetailId("");
                                                context.setPaymentReferenceView(false)
                                              }}
                                            >
                                              {get(ss, "name")}
                                            </a>
                                          </Link>
                                        </p>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div id="bbl_header_menu">
                                    <ul className="menu-nav">
                                      <li key={get(s, "code", "")} className="menu-item" aria-haspopup="true">
                                        <Link href={get(s, "url", "javascript:void(0);")}>
                                          <a className="menu-link" style={{ padding: "0.5rem 1.35rem" }}>
                                            <span className="menu-text">{get(s, "name")}</span>
                                          </a>
                                        </Link>
                                      </li>
                                    </ul>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ) : (
                          <div id="bbl_header_menu" className="header-menu header-menu-mobile header-menu-layout-default col-12 flex-wrap">
                            <ul className="menu-nav">
                              {get(r, "subMenu", []).map((s) => {
                                return (
                                  <li key={get(s, "code", "")} className="menu-item" aria-haspopup="true">
                                    <Link href={get(s, "url", "javascript:void(0);")}>
                                      <a className="menu-link">
                                        <span className="menu-text">{get(s, "name")}</span>
                                      </a>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div
                        className={appMenuActive == get(r, "url", "javascript:void(0);") ? "tab-pane py-5 p-lg-0 show active" : "tab-pane py-5 p-lg-0"}
                        id={"bbl_header_tab_" + get(r, "code", "")}
                      ></div>
                    );
                  }
                })
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Header;
