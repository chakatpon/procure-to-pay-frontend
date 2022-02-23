
import React, { useEffect } from 'react';
import { Table, Descriptions,Input, Form } from "antd";
import TableBlue from "./TableBlue";
import _, { get } from "lodash";

/**
 *
 * @param {columns} props.columns -----> for show column header and data
 * @param {dataSource} props.dataSource  -----> The data shown in the table
 * @param {current} props.current -----> current page
 * @param {total} props.total -----> total record
 * @param {pageSize} props.pageSize -----> page size of table
 * @param {onChange} props.onChange() -----> Function for setting page size and manage data when sorting.
 * @param {loading} props.loading -----> flag for loading table
 * @param {supplierDetail} props.supplierDetail -----> supplier detail
 * @param {showPagination} props.showPagination -----> flag for show pagination
 * @param {onChangeExSupplierCode} props.onChangeExSupplierCode -----> onChange external supplier code input ----
 *
 * @returns Table
 */

 const ReferenceInfo = React.forwardRef((props, ref) => {
  const supplierDetail = _.get(props, 'supplierDetail', {});
  const [form] = Form.useForm();

  useEffect(() => {
    if (props.flagEdit) {
      form.setFieldsValue({ extSupplierCode: _.get(props.supplierDetail, 'extSupplierCode', '') });
    }
  }, [props.supplierDetail]);

  return (
    <div className="mt-10">
      <Descriptions colon={false} labelStyle={{ width: "14%", fontWeight: "bold" }}>
        <Descriptions.Item label="Suppleir Name (TH)">
          <div style={{ marginRight: "2%" }}> : </div>{" "}
          {_.get(supplierDetail, "supplierNameTH", "") !== null && _.get(supplierDetail, "supplierNameTH", "") !== "" ? _.get(supplierDetail, "supplierNameTH", "") : "-"}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} labelStyle={{ width: "14%", fontWeight: "bold" }}>
        <Descriptions.Item label="Suppleir Name (EN)">
          <div style={{ marginRight: "2%" }}> : </div>{" "}
          {_.get(supplierDetail, "supplierNameEN", "") !== null && _.get(supplierDetail, "supplierNameEN", "") !== "" ? _.get(supplierDetail, "supplierNameEN", "") : "-"}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} labelStyle={{ width: "14%", fontWeight: "bold" }}>
        <Descriptions.Item label="TAX ID">
          <div style={{ marginRight: "2%" }}> : </div>{" "}
          {_.get(supplierDetail, "supplierTaxId", "") !== null && _.get(supplierDetail, "supplierTaxId", "") !== "" ? _.get(supplierDetail, "supplierTaxId", "") : "-"}
        </Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} labelStyle={{ width: "14%", fontWeight: "bold" }}>
        <Descriptions.Item label={<div>External Supplier Code{props.flagEdit && <span style={{ color: "#ff4d4f" }}> *</span>}</div>}>
          <div style={{ marginRight: "2%" }}> : </div>{" "}
          {props.flagEdit ? (
            <Form form={form}>
              <div ref={ref}>
                <Form.Item
                  style={{ width: "230px" }}
                  name="extSupplierCode"
                  rules={[
                    {
                      message: "Please fill in External Supplier Code",
                      validator: (rule, value) => (value == "" ? Promise.reject(_.get(rule, "message", "")) : Promise.resolve()),
                    },
                  ]}
                >
                  <Input onChange={props.onChangeExSupplierCode} />
                </Form.Item>
              </div>
            </Form>
          ) : (
            <span>{_.get(supplierDetail, "extSupplierCode", "") !== null && _.get(supplierDetail, "extSupplierCode", "") !== "" ? _.get(supplierDetail, "extSupplierCode", "") : "-"}</span>
          )}
        </Descriptions.Item>
      </Descriptions>

      <TableBlue
        columns={_.get(props, "columns", [])}
        dataSource={_.get(props, "dataSource", [])}
        current={_.get(props, "current", 1)}
        total={_.get(props, "total", 0)}
        pageSize={_.get(props, "pageSize", 10)}
        loading={_.get(props, "loading", false)}
        onChange={(pagination,filters,sorter,extra) => props.onChange(pagination,filters,sorter,extra)}
        showPagination={get(props,"showPagination",true)}
      />
      {/* <Table
        className="table-header-blue mt-5"
        columns={_.get(props,"columns",[])}
        rowKey={(record) => record.no}
        dataSource={_.get(props,"dataSource",[])}
        pagination={{
          className: 'pagination justify-content-end',
          defaultPageSize: 10,
          showTotal,
          current: _.get(props,"current",1),
          total: _.get(props,"total",0),
          pageSize: _.get(props,"pageSize",10),
          showSizeChanger: true,
        }}
        onChange={(pagination, filters, sorter, extra) =>
          props.onChange(pagination, filters, sorter, extra)
        }
        loading={_.get(props,"loading",false)}
      /> */}
    </div>
  );
});

export default ReferenceInfo;
