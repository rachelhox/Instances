//change the nav bar from transparent to solid
$(document).ready(function () {
    $(window).scroll(function () {
      if ($(document).scrollTop() > 50) { 
        $('.navbar').removeClass('bg-transparent');
        $('.navbar').addClass('bg-default');
        $('.navbar').removeClass('navbar-nav');
        $('.navbar').addClass('navbar-nav-scrolled');


  
      } else if ($(document).scrollTop() < 50 ) { 
        $('.navbar').addClass('bg-transparent');
        $('.navbar').removeClass('bg-default');
        $('.navbar').addClass('navbar-nav');
        $('.navbar').removeClass('navbar-nav-scrolled');
      }
    });
  });