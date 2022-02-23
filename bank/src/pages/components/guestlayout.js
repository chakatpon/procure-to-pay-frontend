import React from "react";
import HeaderMobile from "@/shared/components/HeaderMobile";
import Topbar from "@/shared/components/TopBar";
import Footer from "@/shared/components/Footer";
import QuickUserPanel from "@/shared/components/QuickUserPanel";
import { useEffect , useContext, useState} from 'react'
import { useRouter } from 'next/router'
import {StoreContext} from "@/context/store";
import BlockUi from 'react-block-ui';
import { useTranslation } from 'next-i18next';

import 'antd/dist/antd.css';
// import 'sweetalert2/dist/sweetalert2.css'
export default function GuestLayout({ children }) {
  const { t, i18n } = useTranslation('layout');
  const {appLoading, setAppLoading} = useContext(StoreContext);
  const {appLoadingText, setAppLoadingText} = useContext(StoreContext);
  const {loginUser, setLoginUser} = useContext(StoreContext);
  const {showLoading,hideLoading} = useContext(StoreContext);
  const {getStorage,setStorage} = useContext(StoreContext);
  let checkLogin = false;

  const router = useRouter();

  return (
    <>
      <BlockUi tag="div" className="loadingBody" blocking={appLoading} message={ t(appLoadingText)}>
        <Topbar />
        <div className="d-flex flex-column flex-root">
            {children}
            <Footer />
        </div>
      </BlockUi>
    </>
  )
}



