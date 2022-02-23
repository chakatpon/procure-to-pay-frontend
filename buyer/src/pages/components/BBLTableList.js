import React from 'react';
import { Table } from 'antd';

/**
 *
 * @param {columns} -----> for show column header and data
 * @param {dataSource}  -----> The data shown in the table
 * @param {pagination} props.pagination -----> object data and classname for show pagination
 * @param {current} props.current -----> current page
 * @param {total} props.total -----> total record
 * @param {pageSize} props.pageSize -----> page size of table
 * @param {onChange} props.onChange() -----> Function for setting page size and manage data when sorting.
 * @param {loading} -----> flag for loading table
 *
 * @returns Table
 */

const BBLTableList = (props) => {
  // const showTotal = props.pagination;
  const { columns, dataSource, loading } = props;

  return (
    <Table
      columns={columns}
      rowKey={(record) => record.no}
      dataSource={dataSource}
      // scroll={{ x: true}}
      pagination={{
        className: 'pagination justify-content-end',
        defaultPageSize: 10,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} item(s)`,
        current: props.current,
        total: props.total,
        pageSize: props.pageSize,
        showSizeChanger: true,
      }}
      onChange={(pagination, filters, sorter, extra) =>
        props.onChange(pagination, filters, sorter, extra)
      }
      loading={loading || false}
    />
  );
};

export default BBLTableList;
