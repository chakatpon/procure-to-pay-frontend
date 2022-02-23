"use strict";

// Class definition
var KTAppsEducationStudentProfile = function () {
	// Base elements
	var avatar;

	var initAvatar = function() {
		avatar = new KTImageInput('bbl_user_avatar');
	}

	return {
		// public functions
		init: function() {
			initAvatar();
		}
	};
}();

jQuery(document).ready(function() {
	KTAppsEducationStudentProfile.init();
});
