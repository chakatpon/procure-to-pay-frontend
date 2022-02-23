// Class definition

var KTBootstrapDatetimepicker = function () {
    // Private functions
    var baseDemos = function () {
        // Demo 1
        $('#bbl_datetimepicker_1').datetimepicker();

        // Demo 2
        $('#bbl_datetimepicker_2').datetimepicker({
            locale: 'de'
        });

        // Demo 3
        $('#bbl_datetimepicker_3').datetimepicker({
            format: 'L'
        });

        // Demo 4
        $('#bbl_datetimepicker_4').datetimepicker({
            format: 'LT'
        });

        // Demo 5
        $('#bbl_datetimepicker_5').datetimepicker();

        // Demo 6
        $('#bbl_datetimepicker_6').datetimepicker({
            defaultDate: '11/1/2020',
            disabledDates: [
                moment('12/25/2020'),
                new Date(2020, 11 - 1, 21),
                '11/22/2022 00:53'
            ]
        });

        // Demo 7
        $('#bbl_datetimepicker_7_1').datetimepicker();
        $('#bbl_datetimepicker_7_2').datetimepicker({
            useCurrent: false
        });

        $('#bbl_datetimepicker_7_1').on('change.datetimepicker', function (e) {
            $('#bbl_datetimepicker_7_2').datetimepicker('minDate', e.date);
        });
        $('#bbl_datetimepicker_7_2').on('change.datetimepicker', function (e) {
            $('#bbl_datetimepicker_7_1').datetimepicker('maxDate', e.date);
        });

        // Demo 8
        $('#bbl_datetimepicker_8').datetimepicker({
            inline: true,
        });
    }

    var modalDemos = function () {
        // Demo 9
        $('#bbl_datetimepicker_9').datetimepicker();

        // Demo 10
        $('#bbl_datetimepicker_10').datetimepicker({
            locale: 'de'
        });

        // Demo 11
        $('#bbl_datetimepicker_11').datetimepicker({
            format: 'L'
        });
    }

    var validationDemos = function () {
        // Demo 12
        $('#bbl_datetimepicker_12').datetimepicker();

        // Demo 13
        $('#bbl_datetimepicker_13').datetimepicker();
    }

    return {
        // Public functions
        init: function() {
            baseDemos();
            modalDemos();
            validationDemos();
        }
    };
}();

jQuery(document).ready(function() {
    KTBootstrapDatetimepicker.init();
});
