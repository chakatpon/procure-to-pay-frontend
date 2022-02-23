"use strict";

// Class definition
var KTContactsListColumns = function () {

	// Private functions
	var initAside = function () {
		// Mobile offcanvas for mobile mode
		var offcanvas = new KTOffcanvas('bbl_contact_aside', {
            overlay: true,  
            baseClass: 'kt-app__aside',
            closeBy: 'bbl_contact_aside_close',
            toggleBy: 'bbl_subheader_mobile_toggle'
        }); 
	}

	return {
		// public functions
		init: function() {
			initAside();
		}
	};
}();

KTUtil.ready(function() {	
	KTContactsListColumns.init();
});