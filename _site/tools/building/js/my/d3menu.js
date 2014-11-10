define(['jquery','d3', 'util'], function($,d3, util){

	var
  	
  		svg,
  		
  		margin    = {top:10, right:0, bottom:0, left:20},

	  	height    = $(document).height() - margin.top - margin.bottom,
		
	  	width    = $(document).width() - margin.left - margin.right,
	  	
	  	overlaymenu,
	  	overlayactive = true,
	  	
	  	datamenu,
	  	datamenuactive = true,
	  	
	  	filtermenu,
	  	filtermenuactive = true,
	  	
	  	draggedmenu,
	  	
	  	dragmenu = function(d){
	  		draggedmenu = d.id;	
	  	},
	  	
	  	togglemenu = function(){
	  		var xtrans = 0;
	  		var ytrans = 0;
	  		
	  		if (draggedmenu == "overlaymenu"){
	  			xtrans = overlayactive ? (-width/2) : 0;
	  			overlayactive = !overlayactive;
	  		}
	  		else if (draggedmenu == "filtermenu"){
	  			xtrans = filtermenuactive ? width/2 - margin.left-margin.right :0;
	  			filtermenuactive = !filtermenuactive;
	  		}
	  		else if (draggedmenu == "datamenu"){
	  			ytrans = datamenuactive ? height/2 - margin.top-margin.bottom :0;
	  			datamenuactive = !datamenuactive;
	  		}
	  		
	  		d3.select("g."+draggedmenu)
	  			 	.transition()
	  			 	.duration(1000)
	  			   	.attr("transform", "translate(" + xtrans + "," + ytrans + ")");	
	  			   	
	  		draggedmenu = null;
	  	},
	  	
	  	dragmenu = d3.behavior.drag()
  						   .on("drag", dragmenu)
  						   .on("dragend", togglemenu),
  		
  		colour = function(d){
  			
  			if (d.id == "datamenu"){
  				return "#e9af7d";
  			}
  			return "#4e4e4e";
  		},
  						   			   
	  	menutransforms = function(path){
	  		
	  		var w = width - margin.left - margin.right;
	  		var h = height - margin.top - margin.bottom;
	  		
	  		if (path.id == "overlaymenu"){
	  			
	  			return {
	  						scalex:(w/2) / path.width,
	  						scaley:(h/2) / path.height,
	  						transx: 0,
	  						transy: 0
	  					}
	  		}
	  		if (path.id == "filtermenu"){
	  			return {
	  						scalex:(w/2) / path.width,
	  						scaley:(h/2) / path.height,
	  						transx: w/2,
	  						transy: 0
	  			}
	  		}
	  		if (path.id == "datamenu"){
	  			return {
	  						scalex:(w) / path.width,
	  						scaley:(h/2) / path.height,
	  						transx: 0,
	  						transy: h/2
	  			}
	  		}
	  		return {xscale:1,yscale:1,xtrans:0, ytrans:0};
	  	},
	  	
		init = function(rootelement){
	
			d3.json("data/menu.json", function(error, json) {
				
				
				var pathdata = json.map(function(path){	
					return {id:path.id, path:util.transformpath(path, menutransforms(path))}
				});
						
				svg = d3.select("#building")
				  		.select("svg")
				  		.select("g")
			
				var menu = svg.append("g")
					.attr("class", "menu")
					
				menu.selectAll("menuitems")
					.data(pathdata)
					.enter()
					.append("g")
					.attr("class", function(d){return d.id})
					.append("path")
					.attr("d", function(d){return d.path})
					.style("fill", function(d){return colour(d)})
					.style("stroke-width", 2)
					.style("stroke", "white")
					.style("fill-opacity",0.9)
					.call(dragmenu);
						
			});	
			
		}
		
	return {
		init: init
	}

});