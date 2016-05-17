$(document).ready(function(){
  $("#home-link").click(function(){
      
      $(this).animate({ top: '+=90', opacity: '0'}, 400, "swing");
      $(this).animate({ top: '-=150', opacity: '0'}, 50, "linear");
      $(this).animate({ top: '+=60', opacity: '1'}, 400, "swing");
      
  });
});
