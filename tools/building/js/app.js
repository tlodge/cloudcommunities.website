require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
	 	"pusher": "../pusher/pusher.min",
	 	"pubnub": "../pubnub/pubnub.min", 	
    },
    
	//"pubnub": "//cdn.pubnub.com/pubnub.min"
    
    "shim": {
    }
});

require(['jquery','d3building', 'query', 'd3menu', 'signal'], function($,d3building, query, menu, Signal) {
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
 
    datasource = new Signal(this, "filterselected");
    query.init(datasource);
	query.subscribe('list');
	d3building.init();
  	menu.init("#building", datasource);
});
