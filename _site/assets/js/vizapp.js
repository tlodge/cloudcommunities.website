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
        },
        
        shim: {

    	}
})

require(['jquery','knockout', 'd3', 'developments', 'ajaxservice', 'root', 'catdetail', 'sentiment'], function($,ko,d3,developments,ajaxservice, root, catdetail, sentiment) {

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
		
		root.init(data);
		catdetail.init();
		
		ko.applyBindings(root, 		document.getElementById("rootchart"));
		ko.applyBindings(catdetail, document.getElementById("categorydetail"));
		ko.applyBindings(sentiment, document.getElementById("sentiment"));
		
		$("#viz").css("display","block");
	});
});
