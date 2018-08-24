(function($) {
	/* Mobile menu's functions */
	$(".header__menu_icon").on("click", function () {
		$("nav.header__menu--mobile").toggleClass("mobile-active");
		$(".header__menu_icon").toggleClass("header__menu_icon--transform");
	});

	$(window).on('resize', function(){
		var win = $(this);
		if (win.width() > 768) { 
			if ($("nav.header__menu--mobile").hasClass("mobile-active")) {
				$("nav.header__menu--mobile").removeClass("mobile-active");
			}
			if ($(".header__menu_icon").hasClass("header__menu_icon--transform")) {
				$(".header__menu_icon").removeClass("header__menu_icon--transform");
			}
		}
	});
})(jQuery);