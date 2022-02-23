
$(document).ready(function(){
  $("#dashboard-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#document-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#matching-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#approval-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#monitoring-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#profile-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });
  $("#report-menu").click(function(){
    $( "#show-submenu" ).addClass("submenu");
  });


  //hide submenu when mouse leave and remove active class
  $("#show-submenu").mouseleave(function(){
    $( "#show-submenu" ).removeClass("submenu");
    $( "#dashboard-active" ).removeClass("active");
    $( "#document-active" ).removeClass("active");
    $( "#matching-active" ).removeClass("active");
    $( "#approval-active" ).removeClass("active");
    $( "#monitoring-active" ).removeClass("active");
    $( "#profile-active" ).removeClass("active");
    $( "#report-active" ).removeClass("active");
  });
});


