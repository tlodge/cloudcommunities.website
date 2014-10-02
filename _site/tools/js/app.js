require.config({
    baseUrl: 'js/my',

    paths: {
        "jquery": "../jquery/jquery-2.1.0.min",
	"d3": "../d3/d3"
    },

    
    "shim": {
    }
});

require(['d3list', 'd3comments'], function(d3list, d3comments) {
  d3list.init();
  //d3comments.init();
});
