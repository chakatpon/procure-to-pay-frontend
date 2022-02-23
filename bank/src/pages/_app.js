import App from 'next/app'
import React from "react";
import {Provider} from "react-redux";
import moment from "moment-timezone";
// import {useStore} from "../context/store"
import { appWithTranslation } from 'next-i18next';
import nextI18NextConfig from '../../next-i18next.config';
import {StoreContextProvider} from "../context/store";
import { CookiesProvider } from 'react-cookie';
import Head from 'next/head'
import "../css/picker.css";
import "react-image-crop/dist/ReactCrop.css";
const MyApp = ({ Component, pageProps }) => {
  pageProps = {
    ...pageProps,
    // momentDate : moment().tz.setDefault('Asia/Bangkok')

  }

  const Layout = Component.Layout ? Component.Layout : React.Fragment;

  return (
    <CookiesProvider>
    <StoreContextProvider  {...pageProps}>
      <Head>
      <meta id="vp" name="viewport" content="user-scalable=no,width=1024" />
      </Head>
        <Layout>
          <Component {...pageProps} />
        </Layout>

    </StoreContextProvider>
    </CookiesProvider>

  )
};

MyApp.getInitialProps = async (appContext) => {
  const cookie = appContext.ctx.req ? appContext.ctx.req.cookies : null;
  // calls page's `getInitialProps` and fills `appProps.pageProps`
  const appProps = await App.getInitialProps(appContext);
  return {
    cookie,
    ...appProps ,
    pageProps : {
      ...appProps.pageProps
    }
  }
}
export default appWithTranslation(MyApp,nextI18NextConfig);
