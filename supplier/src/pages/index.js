import Head from "next/head";
import {connect} from "react-redux";
import Router from "next/router";
import {useRouter} from "next/router";
import {get, sortBy, isEmpty, debounce, isEqual} from "lodash";
import {StoreContext} from "@/context/store";
import Layout from "@/component/layout";
import { useEffect , useContext} from 'react'
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
// import { useEffect } from 'react'


export default function Home(props) {

  const  { locale, locales, defaultLocale } = useRouter();
  const {showLoading, hideLoading} = useContext(StoreContext);
  const { t, i18n } = useTranslation();
  const router = useRouter();
  useEffect( () => {
      try {
        // showLoading("Data Prepairing");
        hideLoading();
        router.push("/dashboard")
      } catch (e) {
          console.error(e);
      }
  },[]);
  return (
    <>
      <Head>
        <title>BBL PROCURE TO PAY</title>
      </Head>
    </>
  );
}
Home.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  };
}
