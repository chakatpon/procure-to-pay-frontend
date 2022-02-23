import React from "react";
import { Table, Pagination } from "antd";
import { get } from "lodash";

/**
 *
 * @param {columns} columns -----> for show column header and data
 * @param {dataSource} dataSource  -----> The data shown in the table
 * @param {current} current -----> current page
 * @param {total} total -----> total record
 * @param {pageSize} pageSize -----> page size of table
 * @param {onChange} onChange() -----> Function for setting page size and manage data when sorting.
 * @param {loading} loading -----> flag for loading table
 * @param {rowSelection} rowSelection -----> for show checkbox in table
 * @param {locale} locale -----> for show locale setting
 * @param {showPagination} showPagination -----> flag to show pagination
 *
 * @returns Table
 */

function TableBlue(props) {
  return (
    <>
      <Table 
        className="table-header-blue"
        rowSelection={get(props,"rowSelection",null)}
        rowKey={(record) => record.no}
        pagination={get(props,"showPagination",false) ? {
          className: "pagination justify-content-end",
          total: get(props,"total",0),
          current: get(props,"current",1),
          showSizeChanger: true,
          pageSize: get(props,"pageSize",10),
          defaultCurrent:1,
          defaultPageSize: 10,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} item(s)`,
        } : false} 
        dataSource={get(props,"dataSource",[])} 
        columns={get(props,"columns",[])}
        locale={{...get(props,"locale",{})}}
        loading={get(props,"loading",false)}
        onChange={(pagination,filters,sorter,extra) => props.onChange(pagination,filters,sorter,extra)}
      />
      {/* {get(props,"showPagination",true) && (
        <Pagination
          className="pagination justify-content-end"
          total={get(props,"total",0)}
          onChange={(page, pageSize) => props.onChangePagination(page, pageSize)}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total} items`}
          current={get(props,"current",1)}
          showSizeChanger
          pageSize={get(props,"pageSize",10)}
          defaultCurrent={1}
          defaultPageSize={10}
      />
      )} */}
      
    </>
  );
}

export default TableBlue;
