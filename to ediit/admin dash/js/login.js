function displayLogin() {
    // Declaration of Variables
    var x = document.getElementById("anonlogin");
    var y = document.getElementById("logindiv1");
    var z = document.getElementById("logindiv2");
    // Hide initial Cards and Display Anon Login Card
    if (x.style.display === "none") {
      // Fade out Animation
      z.style.animation = "fadeout .3s ease 0s forwards";
      y.style.animation = "fadeout .3s ease 0s forwards";
      setTimeout(function(){ 
        z.style.display = "none";
        y.style.display = "none";
        x.style.display = "block";
      },400);
    } 
    // Hide Anon Login Card and Display Initial Cards
    else {
      // Fade in animation
      z.style.animation = "fadein .3s ease 0s forwards";
      y.style.animation = "fadein .3s ease 0s forwards";
      z.style.display = "block";
      y.style.display = "block";
      x.style.display = "none";
    }
  }

function load_BG(){
  var bg1 = document.getElementById("bg1");
  var bg2 = document.getElementById("bg2");
  var bg3 = document.getElementById("bg3");
  var main = document.getElementById("maincontent");
  setTimeout(function(){ 
    bg2.media = '';
    setTimeout(function(){ 
      bg3.media = '';
      setTimeout(function(){ 
        main.style.display='';
      },600);
    },600);
  },600);
}