import Document, { Html, Head, Main, NextScript } from 'next/document'
import {  useContext} from 'react'
import {StoreContext} from "@/context/store";
import { useRouter } from "next/router";
class MyDocument extends Document {

  static async getInitialProps(ctx) {

    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps  }
  }



  render() {
    const { locale } = this.props.__NEXT_DATA__;
    return (
      <Html lang={locale}>
        <Head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Poppins:300,400,500,600,700" />
        <link href="/assets/plugins/global/plugins.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/assets/plugins/custom/prismjs/prismjs.bundle.css" rel="stylesheet" type="text/css" />
        <link href="/assets/css/style.bundle.css" rel="stylesheet" type="text/css" />
        </Head>
        <body id="bbl_body" className="header-mobile-fixed header-bottom-enabled page-loading">
          <Main />
          <NextScript />

          <script src="/assets/plugins/global/plugins.bundle.js"></script>
          <script src="/assets/plugins/custom/prismjs/prismjs.bundle.js"></script>
          <script src="/assets/js/scripts.bundle.js"></script>
        </body>
      </Html>
    )
  }
}

export default MyDocument
