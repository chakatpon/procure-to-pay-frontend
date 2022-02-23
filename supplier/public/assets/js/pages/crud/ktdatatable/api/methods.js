"use strict";
// Class definition

var KTDefaultDatatableDemo = function() {
	// Private functions

	// basic demo
	var demo = function() {

		var options = {
			// datasource definition
			data: {
				type: 'remote',
				source: {
					read: {
						url: HOST_URL + '/api/datatables/demos/default.php',
					},
				},
				pageSize: 20, // display 20 records per page
				serverPaging: true,
				serverFiltering: true,
				serverSorting: true,
			},

			// layout definition
			layout: {
				scroll: true, // enable/disable datatable scroll both horizontal and vertical when needed.
				height: 550, // datatable's body's fixed height
				footer: false, // display/hide footer
			},

			// column sorting
			sortable: true,

			pagination: true,

			search: {
				input: $('#bbl_datatable_search_query'),
				key: 'generalSearch'
			},

			// columns definition
			columns: [
				{
					field: 'ID',
					title: '#',
					sortable: false,
					type: 'number',
					width: 30,
					selector: true,
					textAlign: 'center',
					template: function(row) {
						return row.RecordID;
					},
				},
				{
					field: 'RecordID',
					title: 'ID',
					width: 30,
					type: 'number',
				}, {
					field: 'OrderID',
					title: 'Order ID',
				}, {
					field: 'Country',
					title: 'Country',
					template: function(row) {
						return row.Country + ' ' + row.ShipCountry;
					},
				}, {
					field: 'ShipDate',
					title: 'Ship Date',
					type: 'date',
					format: 'MM/DD/YYYY',
				}, {
					field: 'CompanyName',
					title: 'Company Name',
				}, {
					field: 'Status',
					title: 'Status',
					// callback function support for column rendering
					template: function(row) {
						var status = {
							1: {'title': 'Pending', 'class': 'label-light-primary'},
							2: {'title': 'Delivered', 'class': ' label-light-danger'},
							3: {'title': 'Canceled', 'class': ' label-light-primary'},
							4: {'title': 'Success', 'class': ' label-light-success'},
							5: {'title': 'Info', 'class': ' label-light-info'},
							6: {'title': 'Danger', 'class': ' label-light-danger'},
							7: {'title': 'Warning', 'class': ' label-light-warning'},
						};
						return '<span class="label ' + status[row.Status].class + ' label-inline font-weight-bold label-lg">' + status[row.Status].title + '</span>';
					},
				}, {
					field: 'Type',
					title: 'Type',
					autoHide: false,
					// callback function support for column rendering
					template: function(row) {
						var status = {
							1: {'title': 'Online', 'state': 'danger'},
							2: {'title': 'Retail', 'state': 'primary'},
							3: {'title': 'Direct', 'state': 'success'},
						};
						return '<span class="label label-' + status[row.Type].state + ' label-dot mr-2"></span><span class="font-weight-bold text-' + status[row.Type].state + '">' +
							status[row.Type].title + '</span>';
					},
				}, {
					field: 'Actions',
					title: 'Actions',
					sortable: false,
					width: 125,
					overflow: 'visible',
					autoHide: false,
					template: function() {
						return '\
							<div class="dropdown dropdown-inline">\
								<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" data-toggle="dropdown">\
	                                <i class="la la-cog"></i>\
	                            </a>\
							  	<div class="dropdown-menu dropdown-menu-sm dropdown-menu-right">\
									<ul class="nav nav-hoverable flex-column">\
							    		<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-edit"></i><span class="nav-text">Edit Details</span></a></li>\
							    		<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-leaf"></i><span class="nav-text">Update Status</span></a></li>\
							    		<li class="nav-item"><a class="nav-link" href="#"><i class="nav-icon la la-print"></i><span class="nav-text">Print</span></a></li>\
									</ul>\
							  	</div>\
							</div>\
							<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Edit details">\
								<i class="la la-edit"></i>\
							</a>\
							<a href="javascript:;" class="btn btn-sm btn-clean btn-icon" title="Delete">\
								<i class="la la-trash"></i>\
							</a>\
						';
					},
				}],

		};

		var datatable = $('#bbl_datatable').KTDatatable(options);

		// both methods are supported
		// datatable.methodName(args); or $(datatable).KTDatatable(methodName, args);

		$('#bbl_datatable_destroy').on('click', function() {
			// datatable.destroy();
			$('#bbl_datatable').KTDatatable('destroy');
		});

		$('#bbl_datatable_init').on('click', function() {
			datatable = $('#bbl_datatable').KTDatatable(options);
		});

		$('#bbl_datatable_reload').on('click', function() {
			// datatable.reload();
			$('#bbl_datatable').KTDatatable('reload');
		});

		$('#bbl_datatable_sort_asc').on('click', function() {
			datatable.sort('Status', 'asc');
		});

		$('#bbl_datatable_sort_desc').on('click', function() {
			datatable.sort('Status', 'desc');
		});

		// get checked record and get value by column name
		$('#bbl_datatable_get').on('click', function() {
			// select active rows
			datatable.rows('.datatable-row-active');
			// check selected nodes
			if (datatable.nodes().length > 0) {
				// get column by field name and get the column nodes
				var value = datatable.columns('CompanyName').nodes().text();
				console.log(value);
			}
		});

		// record selection
		$('#bbl_datatable_check').on('click', function() {
			var input = $('#bbl_datatable_check_input').val();
			datatable.setActive(input);
		});

		$('#bbl_datatable_check_all').on('click', function() {
			// datatable.setActiveAll(true);
			$('#bbl_datatable').KTDatatable('setActiveAll', true);
		});

		$('#bbl_datatable_uncheck_all').on('click', function() {
			// datatable.setActiveAll(false);
			$('#bbl_datatable').KTDatatable('setActiveAll', false);
		});

		$('#bbl_datatable_hide_column').on('click', function() {
			datatable.columns('ShipDate').visible(false);
		});

		$('#bbl_datatable_show_column').on('click', function() {
			datatable.columns('ShipDate').visible(true);
		});

		$('#bbl_datatable_remove_row').on('click', function() {
			datatable.rows('.datatable-row-active').remove();
		});

		$('#bbl_datatable_search_status').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Status');
		});

		$('#bbl_datatable_search_type').on('change', function() {
			datatable.search($(this).val().toLowerCase(), 'Type');
		});

		$('#bbl_datatable_search_status, #bbl_datatable_search_type').selectpicker();

	};

	return {
		// public functions
		init: function() {
			demo();
		},
	};
}();

jQuery(document).ready(function() {
	KTDefaultDatatableDemo.init();
});
