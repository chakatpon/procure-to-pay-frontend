import SeparateNumberByComma from "@/shared/helper/separateNumberByComma"
import { get } from "lodash"
import Link from "next/link"

const BadgeItem = ({
  title = "",
  totalAmount = 0,
  totalTransaction = 0,
  icon = "",
  unitAmount = "THB",
  redirectParam = {}
}) => {
    return (
      <Link href={get(redirectParam, "url")}>
        <a className="blog blog-item col d-flex flex-wrap align-items-center">
          <div className="blog-info col-8">
            <h5 className="blue bold mb-0">{SeparateNumberByComma(totalTransaction, 0)}</h5>
            <p className="grey mb-3">{title}</p>
          </div>
          <div className="blog-icon col-4 py-0 text-right">
            <img src={`/assets/media/svg/dashboard/${icon}`} alt="" width="30" />
          </div>
          <div className="col-12">
          <p className="orange bold mb-0">{`${SeparateNumberByComma(totalAmount, 2)} ${unitAmount}`}</p>
          </div>
        </a>
      </Link>
    )
}

export default BadgeItem
