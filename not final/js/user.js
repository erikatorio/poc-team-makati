$(document).ready(function() {
    if(sessionStorage.getItem("username") !== null){
        document.getElementById("userName").innerHTML = sessionStorage.getItem("username");
    }
});