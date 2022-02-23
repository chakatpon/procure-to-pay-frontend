"use strict";

// Class definition
var KTProfile = function () {
	// Elements
	var avatar;
	var offcanvas;

	// Private functions
	var _initAside = function () {
		// Mobile offcanvas for mobile mode
		offcanvas = new KTOffcanvas('bbl_profile_aside', {
            overlay: true,
            baseClass: 'offcanvas-mobile',
            //closeBy: 'bbl_user_profile_aside_close',
            toggleBy: 'bbl_subheader_mobile_toggle'
        });
	}

	var _initForm = function() {
		avatar = new KTImageInput('bbl_profile_avatar');
	}

	return {
		// public functions
		init: function() {
			_initAside();
			_initForm();
		}
	};
}();

jQuery(document).ready(function() {
	KTProfile.init();
});
