// Class definition

var KTBootstrapTimepicker = function () {
    
    // Private functions
    var demos = function () {
        // minimum setup
        $('#bbl_timepicker_1, #bbl_timepicker_1_modal').timepicker();

        // minimum setup
        $('#bbl_timepicker_2, #bbl_timepicker_2_modal').timepicker({
            minuteStep: 1,
            defaultTime: '',
            showSeconds: true,
            showMeridian: false,
            snapToStep: true
        });

        // default time
        $('#bbl_timepicker_3, #bbl_timepicker_3_modal').timepicker({
            defaultTime: '11:45:20 AM',
            minuteStep: 1,
            showSeconds: true,
            showMeridian: true
        });

        // default time
        $('#bbl_timepicker_4, #bbl_timepicker_4_modal').timepicker({
            defaultTime: '10:30:20 AM',           
            minuteStep: 1,
            showSeconds: true,
            showMeridian: true
        });

        // validation state demos
        // minimum setup
        $('#bbl_timepicker_1_validate, #bbl_timepicker_2_validate, #bbl_timepicker_3_validate').timepicker({
            minuteStep: 1,
            showSeconds: true,
            showMeridian: false,
            snapToStep: true
        });
    }

    return {
        // public functions
        init: function() {
            demos(); 
        }
    };
}();

jQuery(document).ready(function() {
    KTBootstrapTimepicker.init();
});