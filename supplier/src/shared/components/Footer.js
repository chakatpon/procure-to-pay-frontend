import { useEffect, useContext, useState } from "react";
import moment from "moment";
import { useRouter } from "next/router";
import { Trans, useTranslation } from "react-i18next";
import { now } from "lodash";
export default function Footer() {
  const { locale, locales, defaultLocale } = useRouter();
  const [version, setVersion] = useState("0.0.0");
  const [year, setYear] = useState("");
  const { t, i18n } = useTranslation();

  useEffect(async () => {
    if (locale.indexOf("th") !== -1) {
      setYear(parseInt(moment().format("YYYY")) + 543);
    } else {
      setYear(moment().format("YYYY"));
    }

    setVersion(process.env.version);
  }, []);
  return (
    <footer className="bg-blue">
      <div className="container py-4">
        <div className="d-flex flex-wrap align-items-center">
          <div className="col-1 px-0">
            <img src="/assets/media/logos/bbl-logos.png" alt="" className="img-fullwidth" />
          </div>
          <div className="col-6 px-4">
            <div className="small white mb-2">
              {t("footercopyright", { year })}
              <ul className="d-inline-block footer-privacy">
                <li>
                  <a className="small white underline-link" href="https://www.bangkokbank.com/en/Privacy-Notice" target="_blank" rel="noopener noreferrer">
                    Privacy Notice
                  </a>
                </li>
                <li>
                  <a className="small white underline-link" href="https://www.bangkokbank.com/th-TH/Privacy-Notice" target="_blank" rel="noopener noreferrer">
                    หนังสือแจ้งการคุ้มครองข้อมูลส่วนบุคคล
                  </a>
                </li>
              </ul>
            </div>
            <p className="small white mb-0">{t("footerbrowsersupport", { browserList: "Google Chrome, Firefox, Safari" })}</p>
          </div>
          <div className="col px-4">
            <p className="small white mb-0 text-right">Version {process.env.version}</p>
            {process.env.buildVersion ? <p className="small white mb-0 text-right">Build Version {process.env.buildVersion}</p> : <></>}
          </div>
        </div>
      </div>
    </footer>
  );
}
