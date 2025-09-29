_checkConnection();
var requiredFields = [];
const baseUrl = document.head.querySelector('meta[name="base-url"]').content;
$(document).ready(function() {
    setTimeout(hide_ajax_message, 5000);

    $(document).on("click", "#apaginate ul li a", function(e) {
        showLoader("Processing...", true);
        var _form = $("#frmSearch");
        var _srcUrl = $(this).attr('href');

        $.ajax({
            type: "POST",
            url: _srcUrl,
            data: _form.serialize(),
            success: function(res) {
                showLoader("", false);
                $("#ajax_content").html('');
                $("#ajax_content").html(res);
            },
            error: function(jqXHR, textStatus, errorThrown) {
                var _html = "<b>Request failed :</b> " + errorThrown + " [" + jqXHR.status + "]";
                showLoader("", false);
                $("#ajax_content").showAjaxMessage({
                    html: _html,
                    type: 'error'
                });
            }
        });
        e.preventDefault();
    });

    $(document).on("change", "#check_all", function() {
        if ($(this).is(":checked")) {
            $("#check input[type='checkbox']").prop("checked", true);
            $("#check input[type='checkbox']").closest("tr").not("#r_checkAll").addClass("bg-danger");
            $("#Del_btn").removeAttr("disabled");
            $(".btnAction").removeAttr("disabled");
        } else {
            $("#check input[type='checkbox']").prop("checked", false);
            $("#check tr").removeClass("bg-danger");
            $("#Del_btn").attr("disabled", "disabled");
            $(".btnAction").attr("disabled", "disabled");
        }
    });

    $(document).on("change", "#check input[type='checkbox']", function() {
        if (this.checked) {
            $(this).closest("tr").not("#r_checkAll").addClass("bg-danger");
        } else {
            $(this).closest("tr").removeClass("bg-danger");
        }

        if ($("#check input[type='checkbox']:checked").not("#check_all").length > 0) {
            $("#check_all").prop("checked", true);
            $("#Del_btn").prop("disabled", false);
            $(".btnAction").prop("disabled", false);
        } else {
            $("#check_all").prop("checked", false);
            $("#Del_btn").prop("disabled", true);
            $(".btnAction").prop("disabled", true);
        }
    });

    //Date Picker
    $('.pickdate').datepicker({
        format: 'dd-mm-yyyy',
        //startDate: '-3d'
        immediateUpdates: true,
        todayBtn: 'linked',
        todayHighlight: true,
        autoclose: true,
        orientation: 'bottom',
    });

    //Reset Search Form
    $("#clear_from").click(function() {
        var _form = $("#frmSearch");
        _form[0].reset();
        $("#search").trigger('click');
    });

    $(document).ajaxStart(function() {
        $(document.body).css({
            'cursor': 'wait'
        });
        $("#loading_image").show();
        $("#mask").show();
    }).ajaxStop(function() {
        $(document.body).css({
            'cursor': 'default'
        });
        $("#loading_image").hide();
        $("#mask").hide();
    });

    // Select 2 Javascript
    $('.select2search').select2();

    tinymce.init({
        selector: '.tinytext',
        menubar: true,
        statusbar: false,
        height: "160",
        content_style: "p { margin: 2px; }",
    });

});

function hide_ajax_message() {
    return $(".alert").slideUp(200);
}

function hideAjaxMessage() {
    $("#ajaxMessage").animate({
        right: '-15px'
    }, 200).hide();
}

function _checkConnection() {
    if (navigator.onLine) {
        $("#notificationMessage").hide();
    } else {
        $("#notificationMessage").html('<b>No Internet Connection.</b>');
        $("#notificationMessage").removeClass('alert-info');
        $("#notificationMessage").addClass('alert-danger');
        //$("#notification_btm").show();
    }
    setTimeout(_checkConnection, 3000);
}

function get_sum(elm) {
    var tval = document.getElementsByClassName(elm),
        sum = 0,
        i;
    for (i = tval.length; i--;)
        if (tval[i].value)
            sum += parseFloat(tval[i].value);
    return sum;
}

function sumVal(elm) {
    var tval = document.getElementsByClassName(elm),
        sum = 0,
        i;
    for (i = tval.length; i--;)
        if (tval[i].value)
            sum += parseFloat(tval[i].value);
    return sum;
}

// Function to Calculate Kg to Mon
function kgToMon(kg, mon = 40) {
    var result = kg / mon;
    return parseFloat(result).toFixed(2);
}

// Function to Calculate Kg to Mon
function monToKg(mon) {
    var result = mon * 40;
    return parseFloat(result).toFixed(2);
}

function printDiv(divName) {
    var printContents = document.getElementById(divName).innerHTML;
    var originalContents = document.body.innerHTML;

    document.body.innerHTML = printContents;

    window.print();

    document.body.innerHTML = originalContents;
}

function redirectTo(url) {
    window.location = url;
}

function readURL(input, to) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function(e) {
            $("#" + to).attr("src", e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function show_percentage_ratio(id) {
    var total_weight = parseFloat(document.getElementById("total_weight").value);
    var net_weight = parseFloat(document.getElementById("net_weight_" + id).value);
    var sum_weight = get_sum("total_weight_check");
    //alert (total_weight);
    //alert (sum_weight);

    if (isNaN(net_weight)) {
        net_weight = 0;
    }
    if (isNaN(total_weight)) {
        total_weight = 0;
    }

    if (sum_weight > total_weight) {
        document.getElementById("alt_" + id).style.display = "block";
    } else {
        document.getElementById("alt_" + id).style.display = "none";
        var percentage = (net_weight * 100) / total_weight;
        if (isNaN(percentage)) {
            percentage = 0;
        }
        document.getElementById("ratio_" + id).value = percentage.toFixed(2);
    }

}


// Convery Number to Words funciton 
function convertNumberToWords(s, elm) {
    // System for American Numbering 
    var words_string = '';
    var th_val = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
    // System for uncomment this line for Number of English 
    // var th_val = ['','Thousand','Million', 'Milliard','Billion'];

    var dg_val = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    var tn_val = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var tw_val = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    s = s.toString();
    s = s.replace(/[\, ]/g, '');
    if (s != parseFloat(s))
        return 'Not a number ';
    var x_val = s.indexOf('.');
    if (x_val == -1)
        x_val = s.length;
    if (x_val > 15)
        return 'Too big';
    var n_val = s.split('');
    var str_val = '';
    var sk_val = 0;
    for (var i = 0; i < x_val; i++) {
        if ((x_val - i) % 3 == 2) {
            if (n_val[i] == '1') {
                str_val += tn_val[Number(n_val[i + 1])] + ' ';
                i++;
                sk_val = 1;
            } else if (n_val[i] != 0) {
                str_val += tw_val[n_val[i] - 2] + ' ';
                sk_val = 1;
            }
        } else if (n_val[i] != 0) {
            str_val += dg_val[n_val[i]] + ' ';
            if ((x_val - i) % 3 == 0)
                str_val += 'Hundred ';
            sk_val = 1;
        }
        if ((x_val - i) % 3 == 1) {
            if (sk_val)
                str_val += th_val[(x_val - i - 1) / 3] + ' ';
            sk_val = 0;
        }
    }
    if (x_val != s.length) {
        var y_val = s.length;
        str_val += 'Point ';
        for (var i = x_val + 1; i < y_val; i++)
            str_val += dg_val[n_val[i]] + ' ';
    }
    var words_string = str_val.replace(/\s+/g, ' ');
    document.getElementById(elm).innerHTML = words_string + "Naira Only";
}

(function($) {
    $.fn.showAjaxMessage = function(options) {
        var _handler = $(this);

        var settings = {
            html: 'Undefined',
            type: 'alert'
        };

        settings = $.extend(settings, options);

        if (settings.type == 'success') {
            _handler
                .removeClass('alert-danger')
                .removeClass('alert-info')
                .addClass('alert-success')
                .html(settings.html)
                .slideDown(200);
        } else if (settings.type == 'error') {
            _handler
                .removeClass('alert-success')
                .removeClass('alert-info')
                .addClass('alert-danger')
                .html(settings.html)
                .slideDown(200);
        } else {
            _handler
                .removeClass('alert-danger')
                .removeClass('alert-success')
                .addClass('alert-info')
                .html(settings.html)
                .slideDown(200);
        }
    };

    $.fn.callAjax = function(options) {
        var _handler = $(this);

        var settings = {
            url: '',
            data: {},
            dataType: 'json',
            crossDomain: false,
            global: true,
            processData: true,
            type: 'POST',
            respTo: $('<div>'),
            beforeSend: function() {
                settings.respTo.hide();
                _handler.show();
            },
            done: function(data, textStatus, jqXHR) {
                _handler.hide();
                settings.respTo.html(JSON.stringify(data)).show();
            },
            fail: function(jqXHR, textStatus, errorThrown) {
                _handler.hide();
                settings.respTo.html('Error: while processing the request <br/>' + errorThrown).show();
            },
            always: function(data, textStatus, jqXHR) {}
        };

        settings = $.extend(settings, options);

        $.ajaxSetup({
            url: settings.url,
            dataType: settings.dataType,
            crossDomain: settings.crossDomain,
            global: settings.global,
            processData: settings.processData,
            type: settings.type,
            beforeSend: settings.beforeSend
        });

        var jqxhr = $.ajax({
                data: settings.data
            })
            .done(settings.done)
            .fail(settings.fail)
            .always(settings.always);

        return jqxhr;
    };

    $.fn.priceField = function() {
        $(this).keydown(function(e) {
            var val = $(this).val();
            var code = (e.keyCode ? e.keyCode : e.which);
            var nums = ((code >= 96) && (code <= 105)) || ((code >= 48) && (code <= 57)); //keypad || regular
            var backspace = (code == 8);
            var specialkey = (e.metaKey || e.altKey || e.shiftKey);
            var arrowkey = ((code >= 37) && (code <= 40));
            var Fkey = ((code >= 112) && (code <= 123));
            var decimal = ((code == 110 || code == 190) && val.indexOf('.') == -1);

            // UGLY!!
            var misckey = (code == 9) || (code == 144) || (code == 145) || (code == 45) || (code == 46) || (code == 33) || (code == 34) || (code == 35) || (code == 36) || (code == 19) || (code == 20) || (code == 92) || (code == 93) || (code == 27);

            var properKey = (nums || decimal || backspace || specialkey || arrowkey || Fkey || misckey);
            var properFormatting = backspace || specialkey || arrowkey || Fkey || misckey || ((val.indexOf('.') == -1) || (val.length - val.indexOf('.') < 3) || ($(this).getCaret() < val.length - 2));

            if (!(properKey && properFormatting)) {
                return false;
            }
        });

        $(this).blur(function() {
            var val = $(this).val();
            if (val === '') {
                $(this).val('0.00');
            } else if (val.indexOf('.') == -1) {
                $(this).val(val + '.00');
            } else if (val.length - val.indexOf('.') == 1) {
                $(this).val(val + '00');
            } else if (val.length - val.indexOf('.') == 2) {
                $(this).val(val + '0');
            }
        });

        return $(this);
    };
})(jQuery);

function disable(element) {
    return $(element).attr('disabled', 'disabled');
}

function enable(element) {
    return $(element).removeAttr('disabled');
}

function showLoader(text, show) {
    if (show == true) {
        $("#cover").show();
        $('#superLoader').show();
        $('#superLoaderText').html(text);
    } else {
        $("#cover").hide();
        $('#superLoader').hide();
        $('#superLoaderText').html(text);
    }
}

function get_selected_option_text(select) {
    var elm = document.getElementById(select);
    return elm.options[elm.selectedIndex].text;
}

function get_selected_option_info(select, name) {
    var selectedOption = select.options[select.selectedIndex];
    var value = selectedOption.getAttribute(name);
    return value;
}

function get_selected_option_datainfo(element, name) {
    var select = document.getElementById(element);
    var selectedOption = select.options[select.selectedIndex];
    var value = selectedOption.getAttribute(name);
    return value;
}

function validate_required_field(arr, zero = false) {
    for (var field in arr) {
        var obj = document.getElementById(field);
        var msg = arr[field];
        //console.log(msg);

        if (obj.value == '') {
            $("#ajaxMessage").showAjaxMessage({
                html: msg,
                type: "error"
            });
            $(obj).focus();
            return false;
        }
        if (zero === true) {
            if (obj.value == 0) {
                $("#ajaxMessage").showAjaxMessage({
                    html: `${msg} and value should not be 0.`,
                    type: "error"
                });
                $(obj).focus();
                return false;
            }
        }
    }
    return true;
}