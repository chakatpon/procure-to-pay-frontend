"use strict";
// Class definition

var KTMaskDemo = function () {

    // private functions
    var demos = function () {
        $('#bbl_date_input').mask('00/00/0000', {
            placeholder: "dd/mm/yyyy"
        });

        $('#bbl_time_input').mask('00:00:00', {
            placeholder: "hh:mm:ss"
        });

        $('#bbl_date_time_input').mask('00/00/0000 00:00:00', {
            placeholder: "dd/mm/yyyy hh:mm:ss"
        });

        $('#bbl_cep_input').mask('00000-000', {
            placeholder: "99999-999"
        });

        $('#bbl_phone_input').mask('0000-0000', {
            placeholder: "9999-9999"
        });

        $('#bbl_phone_with_ddd_input').mask('(00) 0000-0000', {
            placeholder: "(99) 9999-9999"
        });

        $('#bbl_cpf_input').mask('000.000.000-00', {
            reverse: true
        });

        $('#bbl_cnpj_input').mask('00.000.000/0000-00', {
            reverse: true
        });

        $('#bbl_money_input').mask('000.000.000.000.000,00', {
            reverse: true
        });

        $('#bbl_money2_input').mask("#.##0,00", {
            reverse: true
        });

        $('#bbl_percent_input').mask('##0,00%', {
            reverse: true
        });

        $('#bbl_clear_if_not_match_input').mask("00/00/0000", {
            clearIfNotMatch: true
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
    KTMaskDemo.init();
});
