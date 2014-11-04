require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
	 	"pusher": "../pusher/pusher.min",
	 	"knockout" : "../knockout/knockout-3.1.0",
        "knockoutpb": "../knockout/knockout-postbox",
    },

});

require(['jquery', 'communicator', "knockout"], function($, communicator, ko) {
  	communicator.init();
  	ko.applyBindings(communicator, document.getElementById("communicator"));
});
