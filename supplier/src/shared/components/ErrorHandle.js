import _, { get, isEmpty, forEach, filter } from "lodash";
import Swal from "sweetalert2";
// import { useRouter } from "next/router";

const ErrorHandle = (props) => {
  try {
    let error = props;
    if (get(props, "error", false)) {
      error = get(props, "error", false);
    }
    // const router = useRouter();
    const showAlertDialog = (opts) => {
      Swal.fire({
        heightAuto: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        ...opts,
      });
    };

    if (get(error, "response.data.status") == 403) {
      Swal.fire({
        heightAuto: false,
        allowOutsideClick: false,
        allowEscapeKey: false,
        title: "Error!",
        text: "You don't have permission to access requested page.",
        icon: "warning",
      });
      return;
    }

    if (get(error, "response.data.status") == 401) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("menuList");
      window.location = "/login";
      return;
    }

    if (get(error, "response.data.status")) {
      showAlertDialog({
        title: get(error, "response.data.error", "Error!"),
        text: get(error, "response.data.message", "Service is not responding."),
        icon: "warning",
        confirmButtonText: "OK",
      });
      return;
    }

    if(get(error, "code") == "ETIMEDOUT" || get(error, "code") == "ECONNABORTED" || get(error, ["response", "data", "status"]) == 504) {
      // handle error 504 or timeout is in api.js
      return;
    }

    if(get(error, ["response", "data", "status"]) == 502){
      // handle error bad gateway is in api.js
      return;
    }

    showAlertDialog({
      title: "Error!",
      text: get(error, "message", "Service is not responding."),
      icon: "warning",
      confirmButtonText: "OK",
    });
    return;
  } catch (err) {
    console.log("Error In Error", err);
  }
};
export default ErrorHandle;
