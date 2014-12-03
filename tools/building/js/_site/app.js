require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
		"d3": "../d3/d3",
	 	"pusher": "../pusher/pusher.min",
	 	"pubnub": "../pubnub/pubnub.min", 
	 	"ramda": "../ramda/ramda.min",
	 	"numeric": "../numeric/numeric-solve"	
    },
    
	//"pubnub": "//cdn.pubnub.com/pubnub.min"
    
    "shim": {
    }
});

require(['jquery',/*'d3building',*/ 'controller', 'model', 'uidelegate', 'd3menu', 'signal','perspective'], function($,/*d3building,*/controller, model, ui, menu, Signal , perspective) {
	
	$(document).bind(
		'touchmove',
			function(e){
				e.preventDefault();
			}
	);
	
	perspective.init();
	
	/*//model stuff
	model.init();
	
	//view stuff
	ui.init(model);
 	d3building.init();
  	d3building.setdelegate(ui);
 	
 	//controller stuff
    datasource = new Signal(this, "filterselected");
    controller.init(datasource, d3building);
	controller.subscribe('list');
	
	
  	menu.init("#building", datasource);*/
  	
});
