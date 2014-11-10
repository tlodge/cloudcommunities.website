require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
	 	"pusher": "../pusher/pusher.min",
	 	//"pubnub": "../pubnub/pubnub.min", 	
    },
    
	//"pubnub": "//cdn.pubnub.com/pubnub.min"
    
    "shim": {
    }
});

require(['jquery','d3building'], function($,d3building) {
	
 $(document).bind(
 	'touchmove',
 		function(e){
 			e.preventDefault();
 		}
 );
  d3building.init();
});
