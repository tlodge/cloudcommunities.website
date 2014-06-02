require.config({
        baseUrl: '/assets/js/my',
        paths:{
          "knockout" : "../knockout/knockout-3.1.0",
          "knockoutpb": "../knockout/knockout-postbox",
          "jquery" : "../jquery/jquery-2.1.0.min",
	  	  "modernizr" : "../modernizr/modernizr.min",
	  	  "foundation" : "../foundation/foundation.min",
	  	  "nvd3" : "../d3/nv.d3",
	  	  "d3" : "../d3/d3",
	  	  "firebase": "//cdn.firebase.com/js/client/1.0.15/firebase",
        },
        
        waitSeconds:0,
        
        shim: {

    	}
})

require(['jquery','knockout', 'd3', 'developments', 'ajaxservice', 'nav', 'root', 'catdetail', 'sentiment', 'comic'], function($,ko,d3,developments,ajaxservice, nav, root, catdetail, sentiment, comic) {

	//d3.json('../../assets/data/barbicanposts/posts.json', function(result){
	
	ajaxservice.ajaxGetJson('posts', {} , function(result){
		postings = result.posts;
		
		data = {};
		
		for(i = 0; i< postings.length; i++){
		
			posts = postings[i];
			name = posts.name;
			postdata = []
			siteposts = postings[i].posts;
		
			for (j = 0; j < siteposts.length; j++){
				postdata.push({name:siteposts[j].rank,value:siteposts[j].posts});
			}	
			data[name] = postdata;
		}
		
		comic.init();
		root.init(data);
		catdetail.init();
		sentiment.init();
		
		ko.applyBindings(nav, 		document.getElementById("navigation"));
		ko.applyBindings(root, 		document.getElementById("rootchart"));
		ko.applyBindings(catdetail, document.getElementById("categorydetail"));
		ko.applyBindings(sentiment, document.getElementById("sentiment"));
		ko.applyBindings(comic, document.getElementById("home"));
		
		$("#viz").css("display","block");
	});
});
