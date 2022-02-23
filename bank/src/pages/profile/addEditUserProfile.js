import React, { useState, useEffect, useContext } from "react";
import Router, { useRouter } from "next/router";

import _, { add, filter, get } from "lodash";

import { StoreContext } from "../../context/store";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import ErrorHandle from "@/shared/components/ErrorHandle";

// ----------------- api -------------
import { B2PAPI } from "../../context/api";

// -------------- UI -------------------
import Layout from "../components/layout";
import { Form, Button, Modal, Result, Table, Breadcrumb, Pagination, Upload, Radio, Input, Select, Tag } from "antd";
import ImgCrop from "antd-img-crop";
import DialogConfirm from "@/shared/components/DialogConfirm";
import ReactCrop from "react-image-crop";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

export default function addEditUserProfile() {
  const router = useRouter();
  const AppApi = B2PAPI(StoreContext);
  const { showLoading, hideLoading, showAlertDialog, isAllow } = useContext(StoreContext);
  const [mode, setMode] = useState("");
  const [id, setId] = useState("");
  const [form] = Form.useForm();

  const [flagPath, setFlagPath] = useState(false); // ----- flag for show path of breadcrumb ----

  // -------------------- Modal Card ------------------
  const [showConfirmCard, setShowConfirmCard] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");

  const handleConfirmModalClose = () => setShowConfirmCard(false);
  const handleConfirmModalShow = () => setShowConfirmCard(true);

  // ----------------- Modal Crop User Image -----------------
  const [showModalCrop, setShowModalCrop] = useState(false);
  const [crop, setCrop] = useState({
    unit: "px",
    width: 50,
    height: 50,
  });
  const [srcForCrop, setSrcForCrop] = useState(null); //---- src base64 from upload file to show in crop modal ----
  const [imgRef, setImgRef] = useState(null);
  const [fileName, setFileName] = useState("userProfile.jpg");
  const [fileListTemp, setFileListTemp] = useState([]); // ----- for store fileList from crop -----
  const [loadingCrop, setLoadingCrop] = useState(false);

  // ------------- dropdown list in form ------------
  const [userRoleList, setUserRoleList] = useState([]);

  // ------------- Form create user --------------
  const [statusCode, setStatusCode] = useState("");
  const [initialDataForm, setInitialDataForm] = useState({
    roleCode: "",
    buyerCode: "",
    branchCode: "",
    firstName: "",
    lastName: "",
    email: "",
    mobileNo: "",
    officeTelNo: "",
    isActive: true,
  });
  const [fileList, setFileList] = useState([]);
  const [password, setPassword] = useState("");
  const [userPicture, setUserPicture] = useState(null);

  // ------------------ validate ------------
  const [uploadErr, setUploadErr] = useState(false);
  const [uploadErrMessage, setuploadErrMessage] = useState("");

  useEffect(async () => {
    const flagPath = _.get(router.query, "flagPath", false) == "true" ? true : false;
    setFlagPath(flagPath);
    await initialData();
  }, []);

  const initialData = async () => {
    showLoading();
    const userId = _.get(router, "query.id", "");
    let modePage = "add";
    if (userId !== "undefined" && userId !== undefined && userId !== "") {
      setId(userId);
      setStatusCode(_.get(router, "query.status", ""));
      modePage = "edit";
      setMode(modePage);
    } else {
      setMode(modePage);
    }

    const userRole = await AppApi.getApi("p2p/api/v1/role", {}, { method: "get", authorized: true });
    if (userRole && userRole.status === 200) {
      const userRoleLists = [{ code: "", name: "-- Please Select --" }, ...userRole.data];
      setUserRoleList(userRoleLists);
    } else {
      //-----  alert error message
      hideLoading();
      showAlertDialog({
        title: _.get(userRole, "data.error", "Error !"),
        text: _.get(userRole, "data.message", ""),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
      return;
    }

    if (userId !== "" && modePage == "edit") {
      showLoading();
      // -------- edit mode ---------
      const userDetailResult = await getUserDetail(userId);
      const userRoleData = userRole.data;

      if (userDetailResult) {
        const userRoleFind = _.find(userRoleData, (role) => {
          return role.name === _.get(userDetailResult, "role", "");
        });

        let userDetail = {
          roleCode: _.get(userRoleFind, "code", ""),
          // username: _.get(userDetailResult, 'username', ''),
          firstName: _.get(userDetailResult, "firstName", ""),
          lastName: _.get(userDetailResult, "lastName", ""),
          email: _.get(userDetailResult, "email", ""),
          mobileNo: _.get(userDetailResult, "mobileNo", ""),
          officeTelNo: _.get(userDetailResult, "officeTelNo", ""),
          isActive: _.get(userDetailResult, "isActive", true),
        };

        setInitialDataForm(userDetail);
        form.setFieldsValue(userDetail);
        if (_.get(userDetailResult, "picture", "")) {
          const userPictureDetail = _.get(userDetailResult, "picture", "");

          // ------ process for show user piceture in FileList ------------
          const fileObject = [
            {
              uid: "-1",
              name: _.get(userDetailResult, "pictureName", ""),
              status: "done",
              url: `data:image/png;base64,${userPictureDetail}`,
              thumbUrl: `data:image/png;base64,${userPictureDetail}`,
            },
          ];
          setFileList(fileObject); // ---- variable for show file list on Upload ---
          /* --------------- end of process ---------------*/

          // --------------- process for convert Base64 to File ------------
          let arr = `data:image/png;base64,${userPictureDetail}`.split(","),
            mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);

          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }

          const fileOldPicture = new File([u8arr], _.get(userDetailResult, "pictureName", ""), {
            type: mime,
          });
          setUserPicture(fileOldPicture);

          /* --------------- end of process ---------------*/
        }

        if (_.get(userDetailResult, "companyCode", "")) {
          // setBuyerCode(buyerCode);
          onSelectBuyerCode(buyerCode, branchCode, companyAccessLists, companyAccessDetail);
        }

        hideLoading();
      } else {
        hideLoading();
      }
    } else {
      hideLoading();
    }
  };

  const getUserDetail = async (id) => {
    try {
      const getUserDetail = await AppApi.getApi(
        "p2p/api/v1/view/user/profile",
        { id: id },
        {
          method: "post",
          authorized: true,
        }
      );
      if (getUserDetail && getUserDetail.status === 200) {
        const userDetail = getUserDetail.data;
        return userDetail;
      } else {
        showAlertDialog({
          title: _.get(getUserDetail, "data.error", "Error !"),
          text: _.get(getUserDetail, "data.message", ""),
          icon: "warning",
          showCloseButton: true,
          showConfirmButton: false,
        });
        return false;
        // ---- alert
      }
    } catch (err) {
      ErrorHandle(err);
      return false;
    }
  };

  const propsUpload = {
    name: "userProfile",
    listType: "picture",
    maxCount: 1,
    fileList: fileList,
    beforeUpload: (file) => {
      setLoadingCrop(true);
      if (file.type !== "image/png" && file.type !== "image/jpeg" && file.type !== "image/jpg") {
        setUploadErr(true);
        setuploadErrMessage("Invalid file type.");
        setLoadingCrop(false);
        return Upload.LIST_IGNORE;
      }

      if (file.size / 1024 > 200) {
        setUploadErr(true);
        setuploadErrMessage("Picture must smaller than 200KB.");
        setLoadingCrop(false);
        return Upload.LIST_IGNORE;
      }
      setUploadErr(false);
      setuploadErrMessage("");
      return false;
    },
    onChange: ({ file, fileList }) => {
      if (fileList.length > 0) {
        setFileName(fileList[0].name);
        const reader = new FileReader();
        reader.onload = () => {
          setSrcForCrop(reader.result);
        };
        reader.readAsDataURL(fileList[0].originFileObj);
        setShowModalCrop(true);
      } else {
        setFileList(fileList);
        setLoadingCrop(false);
      }

      // if (file.status === 'done') {
      //   setFileList(fileList);
      //   setUserPicture(fileList[0].originFileObj);
      // }
    },
  };

  // ------------------- > crop user image part < ------------------
  const onImageLoaded = (img) => {
    setImgRef(img);
    setCrop({ unit: "px", width: 50, height: 50 });
  };

  const onCropChange = (crop, percentCrop) => {
    setCrop(crop);
  };

  const onCropComplete = async (crop) => {
    // setCrop(crop);
    if (imgRef && crop.width && crop.height) {
      getCroppedImg(imgRef, crop, fileName);
    }
  };

  const getCroppedImg = (image, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, crop.x * scaleX, crop.y * scaleY, crop.width * scaleX, crop.height * scaleY, 0, 0, crop.width, crop.height);

    new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          //reject(new Error('Canvas is empty'));
          console.error("Canvas is empty");
          return;
        }

        const reader = new FileReader();
        blob.name = fileName;
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const newFile = new File([blob], fileName, { type: blob.type });

          let fileTemp = {
            lastModified: newFile.lastModified,
            lastModifiedDate: newFile.lastModifiedDate,
            name: newFile.name,
            size: newFile.size,
            type: newFile.type,
            originFileObj: newFile,
          };

          setFileListTemp([fileTemp]);
        };
      });
    });
  };

  const onSubmitCropUserImag = () => {
    if (_.get(fileListTemp, "0.size", 0) / 1024 > 200) {
      setUploadErr(true);
      setuploadErrMessage("Picture must smaller than 200KB.");
      return;
    }

    setUploadErr(false);
    setuploadErrMessage("");
    setFileList(fileListTemp);
    setUserPicture(_.get(fileListTemp, "0.originFileObj", null));
  };

  // ---------------- > end of crop user image part <---------------------

  const onFinish = async () => {
    showLoading();

    const data = {
      roleCode: _.get(initialDataForm, "roleCode", ""),
      firstName: _.get(initialDataForm, "firstName", ""),
      lastName: _.get(initialDataForm, "lastName", ""),
      email: _.get(initialDataForm, "email", ""),
      mobileNo: _.get(initialDataForm, "mobileNo", ""),
      officeTelNo: _.get(initialDataForm, "officeTelNo", ""),
      isLdap: false,
      isActive: _.get(initialDataForm, "isActive", true),
    };

    if (id !== "" && mode == "edit") {
      _.set(data, "userId", id);
    }
    if (password !== "" && password !== null) {
      _.set(data, "password", password);
    }
    if (userPicture !== null) {
      _.set(data, "picture", userPicture);
    }

    let formData = new FormData();
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        formData.append(key, data[key]);
      }
    }

    if (id !== "" && mode === "edit") {
      try {
        if (statusCode == "PFK11") {
          // ------------------- update user profile proposal ---------------
          const editUserProposal = await AppApi.getApi("p2p/api/v1/edit/user/profile/proposal", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
          if (editUserProposal && editUserProposal.status == 200) {
            hideLoading();
            showAlertDialog({
              text: editUserProposal.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
              routerLink: "/profile/usersLists",
            });

            // setShowSuccessCard(true);
            // setSuccessCardMessage(editUserProposal.data.message);

            // const timeOut = setTimeout(() => {
            //   showLoading();
            //   Router.push({
            //     pathname: "/profile/usersLists",
            //   });
            //   clearTimeout(timeOut);
            // }, 4000);
          } else {
            showAlertDialog({
              title: _.get(editUserProposal, "data.error", "Error !"),
              text: _.get(editUserProposal, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
            hideLoading();
          }
        } else {
          // ------------------- update user profile ---------------
          const editUserRes = await AppApi.getApi("p2p/api/v1/edit/user/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });
          if (editUserRes && editUserRes.status == 200) {
            hideLoading();
            showAlertDialog({
              text: editUserRes.data.message,
              icon: "success",
              showCloseButton: false,
              showConfirmButton: true,
              routerLink: "/profile/usersLists",
            });
            // setShowSuccessCard(true);
            // setSuccessCardMessage(editUserRes.data.message);

            // const timeOut = setTimeout(() => {
            //   showLoading();
            //   Router.push({
            //     pathname: "/profile/usersLists",
            //   });
            //   clearTimeout(timeOut);
            // }, 4000);
          } else {
            showAlertDialog({
              title: _.get(editUserRes, "data.error", "Error !"),
              text: _.get(editUserRes, "data.message", ""),
              icon: "warning",
              showCloseButton: true,
              showConfirmButton: false,
            });
            hideLoading();
          }
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    } else {
      try {
        // -------------- create user profile ------------
        const createUserRes = await AppApi.getApi("p2p/api/v1/create/user/profile", formData, { "Content-Type": "multipart/form-data", method: "post", authorized: true });

        if (createUserRes && createUserRes.status == 200) {
          hideLoading();
          showAlertDialog({
            text: createUserRes.data.message,
            icon: "success",
            showCloseButton: false,
            showConfirmButton: true,
            routerLink: "/profile/usersLists",
          });
          // setShowSuccessCard(true);
          // setSuccessCardMessage(createUserRes.data.message);

          // const timeOut = setTimeout(() => {
          //   showLoading();
          //   Router.push({
          //     pathname: "/profile/usersLists",
          //   });
          //   clearTimeout(timeOut);
          // }, 4000);
        } else {
          showAlertDialog({
            title: _.get(createUserRes, "data.error", "Error !"),
            text: _.get(createUserRes, "data.message", ""),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
          hideLoading();
        }
      } catch (err) {
        hideLoading();
        ErrorHandle(err);
      }
    }
  };

  // const footerConfirm = (
  //   <div className="mt-5">
  //     <Button
  //       className="btn btn-blue mr-3"
  //       shape="round"
  //       onClick={() => {
  //         setShowConfirmCard(false);
  //         onFinish();
  //       }}
  //     >
  //       Confirm
  //     </Button>
  //     <Button
  //       className="btn btn-orange"
  //       shape="round"
  //       onClick={() => {
  //         setShowConfirmCard(false);
  //       }}
  //     >
  //       Close
  //     </Button>
  //   </div>
  // );

  return (
    <div className="row justify-content-md-center">
      <div className="col-7">
        <div>
          <div className="row bbl-font mt-3 mb-3">
            <Breadcrumb separator=">">
              <Breadcrumb.Item>Profile</Breadcrumb.Item>
              <Breadcrumb.Item>User Profile</Breadcrumb.Item>
              {flagPath && <Breadcrumb.Item href={"/profile/usersLists"}>User Profile Lists</Breadcrumb.Item>}
              <Breadcrumb.Item className="breadcrumb-item active">{mode === "edit" ? "Edit User Profile" : "Create User Profile"}</Breadcrumb.Item>
            </Breadcrumb>
          </div>

          {/* ========================= Modal Crop User picture ============================ */}
          <Modal
            title={"Crop User Picture"}
            centered
            visible={showModalCrop}
            closable={false}
            bodyStyle={{ marginTop: "0px" }}
            footer={[
              <Button
                key={"crop"}
                className="btn-blue mr-2"
                onClick={() => {
                  setShowModalCrop(false);
                  setLoadingCrop(false);
                  onSubmitCropUserImag();
                }}
              >
                Crop
              </Button>,
              <Button
                key={"close"}
                className="btn-orange"
                onClick={() => {
                  setLoadingCrop(false);
                  setShowModalCrop(false);
                }}
              >
                Close
              </Button>,
            ]}
          >
            <>
              <ReactCrop src={srcForCrop} crop={crop} onImageLoaded={onImageLoaded} onChange={onCropChange} onComplete={onCropComplete} />
              {/* {croppedImagUrl && <img alt="Crop" style={{ maxWidth: "100%" }} src={croppedImagUrl} />} */}
            </>
          </Modal>

          {/* <Modal
            title=" "
            footer={null}
            visible={showSuccessCard || showErrorCard}
            closable={false}
            onCancel={() => {
              setShowErrorCard(false);
              setShowSuccessCard(false);
            }}
          >
            <Result status={showSuccessCard ? "success" : "error"} title={<p>{showSuccessCard ? successCardMessage : errorMessage}</p>} />
          </Modal>

          <Modal title=" " visible={showConfirmCard} footer={footerConfirm} closable={false}>
            <div className="mt-1">
              <p className="text-center" style={{ fontWeight: "500", fontSize: "17px" }}>
                {confirmMessage}
              </p>
            </div>
          </Modal> */}

          {/* --------------- Confirm Dialog ------------ */}
          <DialogConfirm
            visible={showConfirmCard}
            closable={false}
            onFinish={() => {
              onFinish();
              handleConfirmModalClose();
            }}
            onClose={() => {
              handleConfirmModalClose();
            }}
          >
            {confirmMessage}
          </DialogConfirm>

          <Form
            form={form}
            layout="vertical"
            labelAlign="right"
            initialValues={initialDataForm}
            onFinish={() => {
              if (mode === "edit") {
                handleConfirmModalShow();
                // setShowConfirmCard(true);
                setConfirmMessage("Please confirm to Edit this User.");
              } else {
                handleConfirmModalShow();
                // setShowConfirmCard(true);
                setConfirmMessage("Please confirm to Create this User.");
              }
            }}
            scrollToFirstError={{ behavior: "smooth", inline: "center", block: "center" }}
          >
            <div className="row justify-content-between">
              <div
                className="mb-3"
                style={{
                  width: "100%",
                  height: "auto",
                  border: "2px solid #f7f7f7",
                  background: "#f7f7f7",
                  boxSizing: "border-box",
                }}
              >
                <div
                  style={{
                    color: "#333333",
                    fontWeight: "bold",
                    verticalAlign: "middle",
                    marginLeft: "1%",
                    display: "table-cell",
                    height: "40px",
                  }}
                >
                  <div className="ml-3">User Profile</div>
                </div>
              </div>
              {/* <Form.Item label="User LDAP" colon={false} name="userLDAP" style={{ width: '100%' }}>
                <Switch
                  checked={isLdap}
                  checkedChildren="ON"
                  unCheckedChildren="OFF"
                  onChange={(checked) => {
                    setIsLdap(checked);
                  }}
                />
              </Form.Item> */}

              {/* {mode == "edit" && initialDataForm.username !== "" && statusCode !== "PFK11" && (
                <Form.Item
                  label="User Name"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: "Please fill in User Name",
                    },
                  ]}
                  style={{ width: "100%" }}
                >
                  <Input
                    className="mb-3"
                    disabled={true}
                    id="username"
                    onChange={(e) => {
                      setInitialDataForm({ ...initialDataForm, username: e.target.value });
                    }}
                  />
                </Form.Item>
              )} */}

              <Form.Item
                label="First Name"
                name="firstName"
                rules={[
                  {
                    required: true,
                    message: "Please fill in First Name",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Space");
                      } else if (!new RegExp("^[A-Za-z-\\s]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  id="firstName"
                  // value={firstName}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, firstName: e.target.value });
                    // setFirstName(e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Last Name",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[\u0E00-\u0E7FA-Za-z0-9-\\s]+$").test(value) && value !== "") {
                        return Promise.reject("The only special characters allowed are: Dash (-), Space");
                      } else if (!new RegExp("^[A-Za-z-\\s]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "49%" }}
              >
                <Input
                  className="mb-3"
                  id="lastName"
                  // value={lastName}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, lastName: e.target.value });
                    // setLastName(e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="User Role"
                name="roleCode"
                rules={[
                  {
                    required: true,
                    message: "Please select User Role",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Select
                  className="mb-3"
                  placeholder="-- Please Select --"
                  // value={roleCode}
                  onChange={(value) => {
                    setInitialDataForm({ ...initialDataForm, roleCode: value });
                    // setRoleCode(value);
                  }}
                >
                  {userRoleList &&
                    userRoleList.map((list) => (
                      <Select.Option key={list.code} value={list.code}>
                        {list.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              {(mode === "add" || statusCode === "PFK11") && (
                <>
                  <Form.Item
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Please fill in Password",
                      },
                      {
                        pattern: "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
                        message: (
                          <>
                            Your password must contain:
                            <ul>
                              <li>at least 8 characters and</li>
                              <li>at least 1 lowercase letter (a-z) and</li>
                              <li>at least 1 uppercase letter (A-Z) and</li>
                              <li>at least 1 number (0-9) and</li>
                              <li>at least 1 special characters</li>
                            </ul>
                          </>
                        ),
                      },
                    ]}
                    style={{ width: "100%" }}
                  >
                    <Input.Password
                      className="mb-3"
                      autoComplete="new-password"
                      // value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (form.getFieldValue("confirmPassword") !== "" && form.getFieldValue("confirmPassword") !== null) {
                          form.validateFields(["confirmPassword"]);
                        }
                      }}
                    />
                  </Form.Item>

                  <Form.Item
                    label="Confirm Password"
                    name="confirmPassword"
                    rules={[
                      {
                        required: true,
                        message: "Please fill in Confirm Password",
                      },
                      {
                        validator: (rule, value) => {
                          if (value !== password && value) {
                            return Promise.reject("Your new password and confirm password do not match.");
                          } else {
                            return Promise.resolve();
                          }
                        },
                      },
                    ]}
                    style={{ width: "100%" }}
                  >
                    <Input.Password className="mb-3" id="confirmPassword" />
                  </Form.Item>
                </>
              )}

              <Form.Item label="User Picture" className="mb-3" style={{ width: "100%" }}>
                {/* <ImgCrop grid={true} modalTitle="Crop User Picture" modalWidth={300}> */}
                <Upload {...propsUpload}>
                  <span className="ant-upload" role="button">
                    <Button className="btn btn-blue mr-4 mb-3" shape="round">
                      Upload
                    </Button>
                  </span>
                  <span className="mr-3">
                    <Spin spinning={loadingCrop} indicator={<LoadingOutlined />} />
                  </span>
                  {uploadErr && <span className="text-danger">{uploadErrMessage}</span>}
                </Upload>
                {/* </ImgCrop> */}
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Email",
                  },
                  {
                    validator: (rule, value = "") => {
                      if (!new RegExp("^[a-zA-Z0-9.!#$@%&'*+/=?^_`{|}~-]+$").test(value) && value !== "") {
                        return Promise.reject("Please fill in English Language");
                      } else if (!new RegExp(/^.+@.+\..{2,3}$/).test(value) && value !== "") {
                        return Promise.reject("Invalid email format");
                      } else {
                        return Promise.resolve();
                      }
                    },
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  id="email"
                  // value={email}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, email: e.target.value });
                    // setEmail(e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Mobile No."
                name="mobileNo"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Mobile No.",
                  },
                  {
                    pattern: new RegExp("^[0-9]+$"),
                    message: "Please enter a valid number",
                  },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  id="mobileNo"
                  // value={mobileNo}
                  onKeyDown={(e) => {
                    if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                      return e.preventDefault();
                    }
                  }}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, mobileNo: e.target.value });
                    // setMobileNo(e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item
                label="Office No."
                name="officeTelNo"
                rules={[
                  {
                    required: true,
                    message: "Please fill in Office No.",
                  },
                  // {
                  //   pattern: new RegExp("^[0-9]+$"),
                  //   message: "Please enter a valid number",
                  // },
                ]}
                style={{ width: "100%" }}
              >
                <Input
                  className="mb-3"
                  id="officeTelNo"
                  // value={officeTelNo}
                  // onKeyDown={(e) => {
                  //   if (!["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                  //     return e.preventDefault();
                  //   }
                  // }}
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, officeTelNo: e.target.value });
                    // setOfficeTelNo(e.target.value);
                  }}
                />
              </Form.Item>

              <Form.Item label="User Status" name="isActive" style={{ width: "100%" }}>
                <Radio.Group
                  onChange={(e) => {
                    setInitialDataForm({ ...initialDataForm, isActive: e.target.value });
                    // setIsActive(e.target.value);
                  }}
                >
                  <Radio value={true}>Active</Radio>
                  <Radio value={false}>Inactive</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <div className="row justify-content-md-center">
              {isAllow("P6301", ["CREATE", "EDIT"]) && (
                <Button className="btn btn-blue mr-5" shape="round" htmlType="submit">
                  Submit
                </Button>
              )}

              <Button
                className="btn btn-blue-transparent"
                shape="round"
                onClick={() => {
                  showLoading();
                  window.history.back();
                }}
              >
                Back
              </Button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}

addEditUserProfile.Layout = Layout;
export async function getStaticProps({ locale }) {
  const apiUrl = process.env.API_ENDPOINT;
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common"])),
    },
  };
}
