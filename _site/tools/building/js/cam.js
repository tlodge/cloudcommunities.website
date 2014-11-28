require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
	 	"pubnub": "../pubnub/pubnub.min", 
	 	"ramda": "../ramda/ramda.min",
    },
    
    "shim": {
    }
});

require(['jquery','camera'], function($,camera) {
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
	camera.init();
});
