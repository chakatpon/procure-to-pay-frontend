import { Table, Descriptions } from 'antd';
import _ from 'lodash';


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
function ReferenceInfo(props) {
  const showTotal = _.get(props,"pagination","");
  return (
    <div className="mt-10">
      <Descriptions colon={false} labelStyle={{ width: '14%', fontWeight: 'bold' }}>
        <Descriptions.Item label="Suppleir Name (TH)">
          <div style={{ marginRight: '2%' }}> : </div>โตโยต้ามหานคร
        </Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} labelStyle={{ width: '14%', fontWeight: 'bold' }}>
        <Descriptions.Item label="Suppleir Name (EN)">
          <div style={{ marginRight: '2%' }}> : </div> Toyota Mahanakorn
        </Descriptions.Item>
      </Descriptions>
      <Descriptions colon={false} labelStyle={{ width: '14%', fontWeight: 'bold' }}>
        <Descriptions.Item label="Dealer Code (D1)">
          <div style={{ marginRight: '2%' }}> : </div> 00004
        </Descriptions.Item>
      </Descriptions>

      <Table
        className="table-header-blue mt-5"
        columns={_.get(props,"columns",[])}
        rowKey={(record) => record.no}
        dataSource={_.get(props,"dataSource",[])}
        pagination={{
          className: 'pagination-blue',
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
      />
    </div>
  );
}

export default ReferenceInfo;
