import { useEffect, useContext, useState } from "react";
import { useRouter } from "next/router";
import Router from "next/router";
import { StoreContext } from "@/context/store";
import { useTranslation } from "next-i18next";
import { get, sortBy, isEmpty, debounce, isEqual } from "lodash";
import Link from "next/link";
import { B2PAPI } from "@/context/api";
import ErrorHandle from "@/shared/components/ErrorHandle";
import ScrollTop from "@/shared/svg/ScrollTop.svg";
import { CgPassword } from 'react-icons/cg';
import { FiLogOut } from 'react-icons/fi';
export default function QuickUserPanel() {

  const { t, i18n } = useTranslation("layout");
  const context = useContext(StoreContext);
  let AppApi = B2PAPI(StoreContext);

  const router = useRouter();

  const path = router.asPath

  const nonLoginPage = router.asPath == "/login" ||
    router.asPath == "/forgotPassword" ||
    path.search("/resetPassword") != "-1"

  const logOut = async () => {
    try {
      context.showLoading(t("Logging Out"))
      context.setProfileCanvas(false)
      let logout = await AppApi.getApi("/p2p/api/v1/signout", {}, { method: "post", authorized: true });
      if (!nonLoginPage) {
        context.forceLogin();
      }

    } catch (error) {
      context.hideLoading();
      ErrorHandle({ error, context })
    }

  }
  return (
    <div id="bbl_quick_user" className={"offcanvas offcanvas-right p-10" + ((context.profileCanvas) ? " offcanvas-on" : "")}>
      <div className="offcanvas-header d-flex align-items-center justify-content-between pb-5">
        <h3 className="font-weight-bold m-0">User Profile</h3>
        <a
          onClick={() => context.setProfileCanvas(false)}
          className="btn btn-xs btn-icon btn-light btn-hover-primary"

        >
          <i className="ki ki-close icon-xs text-muted"></i>
        </a>
      </div>

      <div className="offcanvas-content pr-5 mr-n5">
        <div className="d-flex align-items-center mt-5">
          <div className="symbol symbol-70 mr-5 symbol-circle">
            {get(context, "loginUser.picture") ? <div
              className="symbol-label  bg-white-o-30"
              style={{
                backgroundImage:
                  "url(data:image/jpeg;base64," + get(context, "loginUser.picture", "") + ")",
              }}
            ></div> : <><span className="symbol-label font-size-h1 font-weight-bold text-white bg-primary">{get(context, "loginUser.firstName", "").substr(0, 1)}</span></>}

            <i className="symbol-badge bg-success"></i>
          </div>
          <div className="d-flex flex-column">
            <a className="text-uppercase font-weight-bold font-size-h5 text-dark-75 text-hover-primary">
              {get(context, "loginUser.firstName")} {get(context, "loginUser.lastName")}
            </a>
            <div className="text-muted mt-1">{get(context, "loginUser.role")}</div>
            <div className="text-muted mt-1">{get(context, "loginUser.companyName")} {get(context, "loginUser.branchName")}</div>

            {/* <div>
              <a
                onClick={() => {
                  context.showLoading("Loading")
                  Router.push({
                    pathname: "/changePassword",
                  });
                }}
              >
                Change Password
              </a>
            </div> */}

            {/* <div className="navi mt-2">
              <a
                onClick={logOut}
                className="btn btn-sm btn-light-primary font-weight-bolder py-2 px-5"
              >
                Sign Out
              </a>
            </div> */}

          </div>
        </div>

        <div className="separator separator-dashed mt-8 mb-5"></div>
        <a
          className="row ml-3 text-dark-75"
          onClick={() => {
            if (router.asPath != "/changePassword") {
              context.showLoading("Loading")
              context.setProfileCanvas(false)
              Router.push({
                pathname: "/changePassword",
              });
            }
            context.setProfileCanvas(false)
          }}
        >
          <CgPassword className="mr-3" style={{ fontSize: '24px' }} />

          Change Password
        </a>

        <div className="separator separator-dashed mt-8 mb-5"></div>

        <a
          className="row ml-3 text-dark-75"
          onClick={logOut}
        >
          <FiLogOut className="mr-3" style={{ fontSize: '24px' }} />

          Sign Out
        </a>

        <div className="separator separator-dashed mt-8 mb-5"></div>

      </div>

      <div id="bbl_scrolltop" className="scrolltop">
        <span className="svg-icon"><ScrollTop /></span>
      </div>
    </div >
  );
}
