$(document).ready(function() {

    var currentURL = location.href;

    $('#register_form').submit(function() {
        var password = $('#password').val();
        console.log("password is" + password);

    });
})