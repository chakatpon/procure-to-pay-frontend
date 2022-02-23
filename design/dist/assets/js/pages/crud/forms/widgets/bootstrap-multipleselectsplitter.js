// Class definition

var KTBootstrapMultipleSelectsplitter = function () {

    // Private functions
    var demos = function () {
        // minimum setup
        $('#bbl_multipleselectsplitter_1, #bbl_multipleselectsplitter_2').multiselectsplitter();
    }

    return {
        // public functions
        init: function() {
            demos();
        }
    };
}();

jQuery(document).ready(function() {
    KTBootstrapMultipleSelectsplitter.init();
});
