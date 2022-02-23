// Class definition

var KTBootstrapMaxlength = function () {

    // Private functions
    var demos = function () {
        // minimum setup
        $('#bbl_maxlength_1').maxlength({
            warningClass: "label label-warning label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline"
        });

        // threshold value
        $('#bbl_maxlength_2').maxlength({
            threshold: 5,
            warningClass: "label label-warning label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline"
        });

        // always show
        $('#bbl_maxlength_3').maxlength({
            alwaysShow: true,
            threshold: 5,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        // custom text
        $('#bbl_maxlength_4').maxlength({
            threshold: 3,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline",
            separator: ' of ',
            preText: 'You have ',
            postText: ' chars remaining.',
            validate: true
        });

        // textarea example
        $('#bbl_maxlength_5').maxlength({
            threshold: 5,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        // position examples
        $('#bbl_maxlength_6_1').maxlength({
            alwaysShow: true,
            threshold: 5,
            placement: 'top-left',
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        $('#bbl_maxlength_6_2').maxlength({
            alwaysShow: true,
            threshold: 5,
            placement: 'top-right',
            warningClass: "label label-success label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        $('#bbl_maxlength_6_3').maxlength({
            alwaysShow: true,
            threshold: 5,
            placement: 'bottom-left',
            warningClass: "label label-warning label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        $('#bbl_maxlength_6_4').maxlength({
            alwaysShow: true,
            threshold: 5,
            placement: 'bottom-right',
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline"
        });

        // Modal Examples

        // minimum setup
        $('#bbl_maxlength_1_modal').maxlength({
            warningClass: "label label-warning label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline",
            appendToParent: true
        });

        // threshold value
        $('#bbl_maxlength_2_modal').maxlength({
            threshold: 5,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline",
            appendToParent: true
        });

        // always show
        // textarea example
        $('#bbl_maxlength_5_modal').maxlength({
            threshold: 5,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-primary label-rounded label-inline",
            appendToParent: true
        });

        // custom text
        $('#bbl_maxlength_4_modal').maxlength({
            threshold: 3,
            warningClass: "label label-danger label-rounded label-inline",
            limitReachedClass: "label label-success label-rounded label-inline",
            appendToParent: true,
            separator: ' of ',
            preText: 'You have ',
            postText: ' chars remaining.',
            validate: true
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
    KTBootstrapMaxlength.init();
});
