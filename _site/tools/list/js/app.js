require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
		"pubnub": "../pubnub/pubnub.min"
    },

    
    "shim": {
    }
});

require(['jquery','d3list', 'd3comments'], function($,d3list, d3comments) {
	
 $(document).bind(
 	'touchmove',
 		function(e){
 			e.preventDefault();
 		}
 );
  d3list.init();
  //d3comments.init();
});
