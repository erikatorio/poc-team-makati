$(document).ready(function() {
    if(sessionStorage.getItem("username") !== null){
        document.getElementById("userName").innerHTML = sessionStorage.getItem("username");
    }

    $('#submit_btn2').click(function() {
        $('#progress-container').html('<div id="prog" class="progress"></div>');
    });
});