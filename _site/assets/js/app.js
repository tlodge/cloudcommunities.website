require.config({
        baseUrl: '/static/js/my',
        paths:{
          "knockout" : "../knockout/knockout-3.1.0",
          "jquery" : "../jquery/jquery-2.1.0.min",
	  	  "modernizr" : "../modernizr/modernizr.min",
	  	  "foundation" : "../foundation/foundation.min"
        },
        
        shim: {
        	"foundation"  : ["jquery"]
    	}
})

require(['jquery','knockout', 'categorise_vm', 'modernizr', 'foundation'], function($, ko, categorise_vm) {
    console.log("in require...");
    categorise_vm.init()
    ko.applyBindings(categorise_vm, $("#buttons")[0]);
   
 
});
