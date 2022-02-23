/* eslint-disable react/prop-types */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/react-in-jsx-scope */
import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from 'next/router'
import { Provider } from "react-redux";

import DefaultLayout from './components/Layout'

import * as AuthAPI from "./api/AuthApi"

import { useStore } from '../../store'
// import { StoreContext } from "../../context/store";
import { StoreContextProvider } from '../../context/store';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import '../styles/globals.css';
import '../styles/style.bundle.css';
import 'ant-design-pro/dist/ant-design-pro.css';

function BBLApp({ Component, pageProps }) {

  const Layout = Component.Layout ? Component.Layout : DefaultLayout;

  const store = useStore(pageProps.initialReduxState);
  // const context = useContext(StoreContext)
  const router = useRouter()

  const [user, setUser] = useState(null)


  const nonLoginPath = router.asPath === '/login/' ||
    router.asPath === '/forgotPassword/' ||
    router.asPath === '/resetPassword/';

  const loginpage = (userData) => {
    if (userData) {
      if (nonLoginPath) {
        Router.push({
          pathname: "/dashboard",
        });
      }
    }
  }

  const dataUser = async () => {
    const userData = await AuthAPI.getCurrentUser()
    setUser(userData)
    loginpage(userData)
  }

  useEffect(async () => {
    await dataUser()
  }, [])



  return (

    <StoreContextProvider>
      < Provider store={store} >

        <Layout>
          <Component {...pageProps} />
        </Layout>

      </Provider>
    </StoreContextProvider>

  );
}

// BBLApp.getInitialProps = async ({ ctx }) => {
//   try {
//     if (
//       ctx.pathname.indexOf('/login/') === -1 &&
//       ctx.pathname.indexOf('/forgotPassword/') === -1 &&
//       ctx.pathname.indexOf('/reset-password/') === -1
//     ) {
//       const token = ctx.req ? ctx.req.session.get('token') : '-';
//       console.log(token);
//       if (!token) {
//         return ctx.res.redirect('/login/');
//       }
//       return { token };
//     }
//     return {};
//   } catch (err) {
//     return {};
//   }
// };

export default BBLApp;
