$(function() {
	TweenMax.fromTo($(".slogan1"), 1, {
		delay: 3000,
		opacity: 0,
	}, {
		opacity: 1,
		onComplete: function() {
			TweenMax.fromTo($(".slogan2"), 1, {
				delay: 1000,
				opacity: 0
			}, {
				opacity: 1,
				onComplete: function() {
					TweenMax.fromTo($(".slogan3"), 1, {
						delay: 1000,
						opacity: 0
					}, {
						opacity: 1
					});
				}
			});
		}
	});


	var controller = new ScrollMagic.Controller();

	var scene = new ScrollMagic.Scene({triggerElement: "#serviceWrap"})
	.setTween($(".service_item"), 0.5, {opacity: 1}) // trigger a TweenMax.to tween
	// .addIndicators({name: "1 (duration: 0)"}) // add indicators (requires plugin)
	.addTo(controller);
});