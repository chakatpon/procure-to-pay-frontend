import _, { get, isEmpty, isNumber, size } from "lodash";
import { Form, Input, Button, Checkbox, Select, DatePicker, Space, Spin, InputNumber } from "antd";
import moment from "moment";
const dateFormat = "YYYY-MM-DD";
import { useEffect, useContext, useState, useMemo } from "react";
const { RangePicker } = DatePicker;
import { useRouter } from "next/router";
import { StoreContext } from "@/context/store";
import { B2PAPI } from "@/context/api";

const SearchBox = (props) => {
  const { showAlertDialog } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);

  const [form] = Form.useForm();
  const [initialValues, setInitialValues] = useState(false);
  const [expandSearch, setExpandSearch] = useState(false);
  const [dates, setDates] = useState([]);
  // const [fetching, setFetching] = useState(false);
  // const [options, setOptions] = useState({});

  // --------------- search child ----------------
  const [optionsChild, setOptionsChild] = useState([]);
  const [loadingSearchChild, setLoadingSearchChild] = useState(false);
  const [disabledSearchChild, setDisabledSearchChild] = useState(true);

  const onSelectTime = (time, timeString, nameKey) => {
    // timeFormat = type => moment, format => HH
    const timeFormat =
      time !== null
        ? time.map((t) => {
            const fullTime = moment(t).format("HH:mm:ss");
            return moment(fullTime, "HH");
          })
        : [];

    form.setFieldsValue({
      ...form.getFieldsValue(),
      [nameKey]: timeFormat,
    });
  };

  useEffect(() => {
    var searchInputDefaultValue = {};
    get(props, "search", []).map((r) => {
      let n = get(r, "searchInputDefaultValue", "");
      if (get(props, "defaultValues", []).filter((m) => m.field == r.searchKey)) {
        n = get(
          get(props, "defaultValues", []).filter((m) => m.field == r.searchKey),
          "0.value"
        );
      }

      if (get(r, "searchChild", null) !== null) {
        if (get(props, "defaultValues", []).filter((m) => m.field == get(r.searchChild,"searchKey"))) {
          n = get(
            get(props, "defaultValues", []).filter((m) => m.field == get(r.searchChild,"searchKey")),
            "0.value"
          );
          if (typeof n == "string") {
            n = n.split(',')
          } 
          searchInputDefaultValue = { ...searchInputDefaultValue, [r.searchChild.searchKey]: n };
        }
      }
      if (n == null) {
        n = "";
      }
      if (n == undefined) {
        n = "";
      }

      if (get(r, "searchInputDefaultValue") !== null) {
        searchInputDefaultValue = { ...searchInputDefaultValue, [r.searchKey]: get(r, "searchInputDefaultValue") };
      } else {
        switch (get(r, "searchInputType")) {
          case "amountrange":
            n = n.split(",");
            searchInputDefaultValue = {
              ...searchInputDefaultValue,
              [r.searchKey]: {
                start: get(n, "0")
                  ? parseFloat(get(n, "0"))
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "",
                end: get(n, "1")
                  ? parseFloat(get(n, "1"))
                      .toFixed(2)
                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  : "",
              },
            };
            break;
          case "daterangepicker":
            n = n.split(",");
            n = n.map((s) => {
              if (Date.parse(s)) {
                return moment(s);
              }
            });
            searchInputDefaultValue = { ...searchInputDefaultValue, [r.searchKey]: n };
            break;

          case "timerangepicker":
            n = n.split(",");
            n = n.map((s) => {
              if (moment(s, "HH:mm:ss", true).isValid()) {
                return moment(s, "HH");
              }
            });
            searchInputDefaultValue = { ...searchInputDefaultValue, [r.searchKey]: n };
            break;

          case "multi-select":
            break;
          case "multi-selectrelated":
            break;
          default:
            searchInputDefaultValue = { ...searchInputDefaultValue, [r.searchKey]: n };
            break;
        }
      }
    });
    form.setFieldsValue(searchInputDefaultValue);
    setInitialValues(searchInputDefaultValue);
  }, [props]);
  const onReset = () => {
    get(props, "onReset", () => {})();
    form.resetFields();
    // setOptionsChild([]);
    setDisabledSearchChild(true);
  };
  const onFinish = (values) => {
    let s = Object.keys(values)
      .filter((k, v) => {
        return values[k] != undefined;
      })
      .filter((k, v) => {
        return values[k] != "";
      })
      .map((k) => {
        if (typeof values[k] == "object") {
          values[k] = Object.entries(values[k])
            .map((r) => {
              if (get(r, "1") instanceof moment) {
                if (moment(get(r, "1")._i, "HH:mm:ss", true).isValid()) {
                  //---- if then value have time format ----
                  return get(r, "1").format("HH:mm:ss");
                }
                return get(r, "1").format("YYYY-MM-DD");
              }
              if (get(r, "1") && size(get(r, "1").split(".")) > 1) {
                return get(r, "1").replace(/,/g, "");
              }
              return get(r, "1");
            })
            .join(",");
        }
        if (values[k] == ",") {
          return false;
        }
        return { field: k, value: values[k] };
      });
    s = s.filter((r) => r != false);
    get(props, "onFinish", () => {})(s);
  };
  const onExpended = () => {
    setExpandSearch(!expandSearch);
  };

  const searchType = (opt) => {
    let inputKey = get(opt, "searchKey", false);

    const onSelectMainOption = async (value, searchApi) => {
      const searchChildName = get(opt, "searchChild.searchKey", "Untitled");
      setOptionsChild([]);
      setDisabledSearchChild(true);
      form.setFieldsValue({
        ...form.getFieldsValue(),
        [searchChildName]: [],
      });
      if (value.length > 0 && searchApi && !isEmpty(searchApi)) {
        const requestBody = {
          dealer: value,
        };
        setLoadingSearchChild(true);

        let resp = await AppApi.getApi(searchApi, requestBody, {
          method: "post",
          authorized: true,
        });

        if (resp.status == 200) {
          let optKey = [];
          let optVal = [];
          let opts = get(resp, "data.searchOptions", [])
            .map((r) => {
              if (optKey.includes(r.option)) {
                return false;
              }
              if (optVal.includes(r.value)) {
                return false;
              }
              optKey.push(r.option);
              optVal.push(r.value);
              return {
                label: r.option,
                value: r.value,
              };
            })
            .filter((r) => r != false);

          form
            .validateFields()
            .then((values) => {
              setOptionsChild(opts);
              setLoadingSearchChild(false);
              setDisabledSearchChild(false);
            })
            .catch((err) => {
              if (err.errorFields.length > 0) {
                setDisabledSearchChild(true);
                setLoadingSearchChild(false);
                setOptionsChild([]);
              }
            });
        } else {
          showAlertDialog({
            title: get(resp, "data.error", "Error !"),
            text: get(resp, "data.message"),
            icon: "warning",
            showCloseButton: true,
            showConfirmButton: false,
          });
          setLoadingSearchChild(false);
          setDisabledSearchChild(true);
        }
      }
      // else {
      //   setOptionsChild([]);
      //   setDisabledSearchChild(true);
      //   form.setFieldsValue({
      //     ...form.getFieldsValue(),
      //     [searchChildName]: [],
      //   });
      // }
    };

    switch (get(opt, "searchInputType", "text").trim()) {
      case "text":
      case "tel":
      case "number":
        return (
          <Form.Item name={get(opt, "searchKey", "Untitled")}>
            <Input placeholder={get(opt, "searchPlaceholder", "")} type={get(opt, "searchInputType", "text")} />
          </Form.Item>
        );
        break;
      case "multi-select":
        return <TypeTagSelect opt={opt} form={form} />;
        break;

      case "multi-selectrelated":
        return <TypeMultiSelectRelated opt={opt} form={form} onChangeSelect={onSelectMainOption} />;
        break;

      case "select":
        return <TypeSelect opt={opt} form={form} />;
        break;
      case "daterangepicker":
        return (
          <Form.Item name={get(opt, "searchKey", "Untitled")}>
            <RangePicker
              dateRender={(current) => (
                <div className="ant-picker-cell-inner" title={moment(current, "YYYY-MM-DD").format("DD-MM-YYYY")}>
                  {current.date()}
                </div>
              )}
              allowClear={get(opt, "searchAllowClear", true) !== null ? get(opt, "searchAllowClear", true) : true}
              format="DD-MM-YYYY"
              onCalendarChange={(val) => setDates(val)}
              disabledDate={
                get(props, "disabledDate", "3653") != "3653"
                  ? (current) => {
                      if (!dates || dates.length === 0) {
                        return false;
                      }
                      const tooLate = dates[0] && current.diff(dates[0], "days") > get(props, "disabledDate", "3653") - 1;
                      const tooEarly = dates[1] && dates[1].diff(current, "days") > get(props, "disabledDate", "3653") - 1;
                      return tooEarly || tooLate;
                    }
                  : ""
              }
            />
          </Form.Item>
        );
        break;

      case "timerangepicker":
        return (
          <Form.Item name={get(opt, "searchKey", "Untitled")}>
            <TimePicker.RangePicker
              allowClear={get(opt, "searchAllowClear", true) !== null ? get(opt, "searchAllowClear", true) : true}
              format="HH:mm"
              popupClassName="notshow-minute"
              onChange={(time, timeString) => onSelectTime(time, timeString, get(opt, "searchKey", "Untitled"))}
            />
          </Form.Item>
        );
        break;

      case "amountrange":
        return <TypeAmountRange opt={opt} form={form} />;
        break;
      default:
        return (
          <Form.Item name={get(opt, "searchKey", "Untitled")}>
            <Input type="text" />
          </Form.Item>
        );
    }
  };

  let searchVisibleCount = 0;

  return (
    <>
      {initialValues ? (
        <section id="searchBox" className={expandSearch ? "expanded" : ""}>
          <div className="container-fluid">
            <Form form={form} onFinish={onFinish} id="searchForm" name="searchForm" method="post" className="form d-flex flex-wrap" defaultValue={{}}>
              <div id="field-wrapper" className="col-12 col-xl-9 d-flex flex-wrap px-0">
                {get(props, "search", [])
                  .filter((s) => s.searchVisibility == true)
                  .map((s) => {
                    searchVisibleCount++;
                    return (
                      <>
                        <div className="control-group col-3 px-1">
                          <label className="control-label">{get(s, "searchLabel", "Untitled")}</label>
                          <div className="controls">{searchType(s)}</div>
                        </div>
                        {!isEmpty(get(s, "searchChild", {})) && searchVisibleCount++ && (
                          <div className="control-group col-3 px-1">
                            <label className="control-label">{get(s, "searchChild.searchLabel", "Untitled")}</label>
                            <div className="controls">
                              <Form.Item name={get(s, "searchChild.searchKey", "Untitled")}>
                                <Select
                                  mode="multiple"
                                  defaultValue={[]}
                                  disabled={disabledSearchChild && (form.getFieldValue(get(s, "searchKey", "Untitled")) == "" || form.getFieldValue(get(s, "searchKey", "Untitled")) == null)}
                                  loading={loadingSearchChild}
                                  options={optionsChild}
                                  filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                  style={{ width: "100%" }}
                                />
                              </Form.Item>
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })}
                {props.children}
              </div>
              <div id="button-controls" className="col-6 col-xl-3 align-self-start px-0 mt-3 mx-auto mx-xl-0 text-center text-xl-right">
                <Button type="primary" htmlType="submit" name="btnSearch" id="btnSearch" className="btn btn-blue">
                  Search
                </Button>
                <Button name="btnClear" id="btnClear" className="btn btn-blue-transparent ml-2" onClick={onReset}>
                  Clear
                </Button>
              </div>
            </Form>
          </div>

          {searchVisibleCount > 4 ? (
            <a
              id="btnExpand"
              data-expanded={expandSearch}
              onClick={() => {
                onExpended();
              }}
            >
              <i className="fas fa-chevron-up blue"></i>
              <i className="fas fa-chevron-down blue"></i>
            </a>
          ) : null}
        </section>
      ) : (
        <></>
      )}
    </>
  );
};
const TypeAmountRange = ({ opt, form }) => {
  const inputKey = get(opt, "searchKey", "Untitled");
  const [isInvalid, setIsInvalid] = useState(false);
  const [isInvalidMsg, setIsInvalidMsg] = useState(false);
  const [isMaxLength, setIsMaxLength] = useState(false);
  const onInputChange = () => {
    let {
      [inputKey]: { start, end },
    } = form.getFieldsValue([inputKey]);

    // if(size(start.split(".")[0]) > 13 || size(end.split(".")[0]) > 13){
    //   setIsMaxLength(true)
    //   setIsInvalid(true)
    // } else {
    //   setIsMaxLength(false)
    //   setIsInvalid(false)
    // }

    if (start && !isNumber(start)) {
      start = parseFloat(start.replace(/,/g, ""));
    }
    if (end && !isNumber(end)) {
      end = parseFloat(end.replace(/,/g, ""));
    }
    if (start && end) {
      if (start > end) {
        setIsInvalid(true);
        setIsInvalidMsg(true);
      } else {
        setIsInvalid(false);
        setIsInvalidMsg(false);
      }
    } else if (start || end) {
      setIsInvalid(false);
      setIsInvalidMsg(false);
    }
  };
  return (
    <Form.Item>
      <Input.Group compact>
        <Form.Item form={form} name={[inputKey, "start"]}>
          <Input
            disabled={get(opt, "searchDisable", false) !== null ? get(opt, "searchDisable", false) : false}
            // formatter={(value) =>{return isNaN(parseFloat(value)) ? '' : parseFloat(value) ? parseFloat(`${value}`).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '.00'}}
            className="ant-input range-input-left"
            maxLength={16}
            onChange={onInputChange}
            style={{
              width: "100%",
              // textAlign: "center",
              borderColor: isInvalid ? "#ff4d4f" : "",
            }}
            placeholder="Minimum"
            onBlur={(e) =>
              form.setFieldsValue({
                [inputKey]: {
                  start: e.target.value
                    ? size(e.target.value.split(",")) > 0
                      ? parseFloat(e.target.value.replace(/,/g, ""))
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : parseFloat(e.target.value)
                      ? parseFloat(e.target.value)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                    : "",
                },
              })
            }
            onFocus={(e) => form.setFieldsValue({ [inputKey]: { start: parseFloat(e.target.value) ? parseFloat(e.target.value.replace(/,/g, "")) : "" } })}
          />
        </Form.Item>
        <Form.Item form={form} name={[inputKey, "end"]}>
          <Input
            disabled={get(opt, "searchDisable", false) !== null ? get(opt, "searchDisable", false) : false}
            // formatter={(value) =>{return isNaN(parseFloat(value)) ? '' : parseFloat(value) ? parseFloat(`${value}`).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '.00'}}
            className="ant-input site-input-right"
            maxLength={16}
            onChange={onInputChange}
            style={{
              width: "100%",
              // textAlign: "center",
              // borderRadius: "0px 25px 25px 0px !important",
              borderColor: isInvalid ? "#ff4d4f" : "",
            }}
            placeholder="Maximum"
            onBlur={(e) =>
              form.setFieldsValue({
                [inputKey]: {
                  end: e.target.value
                    ? size(e.target.value.split(",")) > 0
                      ? parseFloat(e.target.value.replace(/,/g, ""))
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : parseFloat(e.target.value)
                      ? parseFloat(e.target.value)
                          .toFixed(2)
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      : ""
                    : "",
                },
              })
            }
            onFocus={(e) => form.setFieldsValue({ [inputKey]: { end: parseFloat(e.target.value) ? parseFloat(e.target.value.replace(/,/g, "")) : "" } })}
          />
        </Form.Item>
      </Input.Group>
      {isInvalidMsg ? <span className="text-danger">"Maximum Amount should be equal to or greater than Minimum Amount."</span> : null}
      {isMaxLength ? <span className="text-danger">"Net Amount should be equal to or less than 16 Digit."</span> : null}
    </Form.Item>
  );
};

const TypeMultiSelectRelated = ({ opt, form, onChangeSelect }) => {
  const { showAlertDialog } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const [optionsMain, setOptionsMain] = useState([]);

  let rulesSelect = {};
  // --------- process for add rules of main select ----------
  if (get(opt, "searchInputRule", null) !== null) {
    if (get(opt, "searchInputRule") == "required") {
      rulesSelect = {
        required: true,
        message: `Please Select ${get(opt, "searchLabel", "untitled")}`,
      };
    }
  }

  useEffect(() => {
    if (get(opt, "searchOptionApi")) {
      makeOptionApi();
    }

    // -------- process for default value of child select related ----------
    if (get(opt, "searchInputDefaultValue") !== null && get(opt, "searchInputDefaultValue") !== undefined) {
      onChangeSelect(get(opt, "searchInputDefaultValue"), get(opt.searchChild, "searchOptionApi"));
    }

    if (get(opt, "searchInputDefaultValueOption") !== null && get(opt, "searchInputDefaultValueOption") !== undefined) {
      onChangeSelect(get(opt, "searchInputDefaultValueOption"), get(opt.searchChild, "searchOptionApi"));
    }
  }, []);

  const makeOptionApi = async () => {
    setOptionsMain([]);
    let resp = await AppApi.getApi(
      get(opt, "searchOptionApi"),
      {},
      {
        method: "post",
        authorized: true,
      }
    );

    if (resp.status == 200) {
      let optKey = [];
      let optVal = [];
      let opts = get(resp, "data.searchOptions", [])
        .map((r) => {
          if (optKey.includes(r.option)) {
            return false;
          }
          if (optVal.includes(r.value)) {
            return false;
          }
          optKey.push(r.option);
          optVal.push(r.value);
          return {
            label: r.option,
            value: r.value,
          };
        })
        .filter((r) => r != false);
      setOptionsMain(opts);
    } else {
      showAlertDialog({
        title: get(resp, "data.error", "Error !"),
        text: get(resp, "data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
    }
  };

  return (
    <>
      {/* // ----------- main selection ---------------- */}
      <Form.Item form={form} name={get(opt, "searchKey", "Untitled")}>
        <Select
          // mode="multiple"
          showSearch={get(opt, "searchInputSearchable", false)}
          options={optionsMain}
          filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0}
          style={{ width: "100%" }}
          onChange={(value) => onChangeSelect(value, get(opt.searchChild, "searchOptionApi"))}
        />
      </Form.Item>
    </>
  );
};

const TypeTagSelect = ({ opt, form }) => {
  const { showAlertDialog } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (get(opt, "searchOptionApi")) {
      makeOptionApi();
    }
  }, []);
  const makeOptionApi = async () => {
    setOptions([]);
    let resp = await AppApi.getApi(
      get(opt, "searchOptionApi"),
      {},
      {
        method: "post",
        authorized: true,
      }
    );

    if (resp.status == 200) {
      let optKey = [];
      let optVal = [];
      let opts = get(resp, "data.searchOptions", [])
        .map((r) => {
          if (optKey.includes(r.option)) {
            return false;
          }
          if (optVal.includes(r.value)) {
            return false;
          }
          optKey.push(r.option);
          optVal.push(r.value);
          return {
            label: r.option,
            value: r.value,
          };
        })
        .filter((r) => r != false);
      setOptions(opts);
    } else {
      showAlertDialog({
        title: get(resp, "data.error", "Error !"),
        text: get(resp, "data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
    }
  };
  return (
    <Form.Item form={form} name={get(opt, "searchKey", "Untitled")}>
      <Select mode="multiple" options={options} filterOption={(input, option) => option.label.toLowerCase().indexOf(input.toLowerCase()) >= 0} style={{ width: "100%" }} />
    </Form.Item>
  );
};

const TypeSelect = ({ opt, form }) => {
  const { showAlertDialog } = useContext(StoreContext);
  const AppApi = B2PAPI(StoreContext);
  const [options, setOptions] = useState([]);
  useEffect(() => {
    if (get(opt, "searchOptionApi")) {
      makeOptionApi();
    } else {
      makeOption();
    }
  }, [opt]);
  const makeOption = async () => {
    setOptions(get(opt, "searchOptions", []));
  };
  const makeOptionApi = async () => {
    let resp = await AppApi.getApi(
      get(opt, "searchOptionApi"),
      {},
      {
        method: "post",
        authorized: true,
      }
    );
    if (resp.status == 200) {
      let opts = get(resp, "data.searchOptions", []).map((r) => {
        return {
          option: r.option,
          value: r.value,
        };
      });
      setOptions(opts);
    } else {
      showAlertDialog({
        title: get(resp, "data.error", "Error !"),
        text: get(resp, "data.message"),
        icon: "warning",
        showCloseButton: true,
        showConfirmButton: false,
      });
    }
  };
  // return (
  //   <Form.Item form={form} name={get(opt, "searchKey", "Untitled")}><Select
  //     // mode="multiple"
  //     options={options}
  //     style={{ width: '100%' }}
  //     /></Form.Item>
  // );
  return (
    <Form.Item form={form} name={get(opt, "searchKey", "Untitled")}>
      <Select
        showSearch={get(opt, "searchInputSearchable", false)}
        onSearch={(val) => {}}
        filterOption={(input, option) => option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
        placeholder={get(opt, "searchPlaceholder", "")}
      >
        {get(opt, "searchOptions", []) != null ? (
          get(opt, "searchOptions", []).map((o, i) => (
            <Select.Option key={i} value={get(o, "value")}>
              {get(o, "option")}
            </Select.Option>
          ))
        ) : (
          <></>
        )}
      </Select>
    </Form.Item>
  );
};

export default SearchBox;
