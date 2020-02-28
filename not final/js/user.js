$(document).ready(function() {
    if(sessionStorage.getItem("username") !== null){
        document.getElementById("userName").innerHTML = sessionStorage.getItem("username");
    }

    var value;
    
    $('.btn-cat').click(function() {
      value = $(this).attr("value");
      document.cookie = "category="+value;
    });

  function showChat(){
        $('.toast').toast('show');
      }
       function autoScrollToBottom(){
      $("#message-container").animate({ 
        scrollTop: $('#message-container').get(0).scrollHeight 
      }, 1000); 
    }
    
    function sendMessage(){
      var message =   $('textarea#textarea-message').val().trim();
      if(message != ""){
        $('#textarea-message').val('');
        appendMessage(message);
      }
      autoScrollToBottom();
      //add to database
    }
     function appendMessage(message){
      //if user, check if received or sending
      //if admin, check if receeived or sending and who is
      //the user/chatbox owner
      var sender = "./img/ricky.JPG";

      //get current timestamp
      var timestamp = "01/23/2020 10:56AM"
      $('#message-container').append('<div class="d-flex justify-content-between"><span class="timestamp text-muted">'+timestamp+'</span><img id="chat_pic" src="'+sender+'" class="rounded-circle"></div><div class="row no-gutters"><div class="col"><div id="user_message" class="message_display badge badge-secondary text-wrap d-inline-flex p-2 col-example">'+message+'</div></div></div>');
    }
});