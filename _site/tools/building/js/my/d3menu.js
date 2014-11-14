define(['jquery','d3', 'util'], function($,d3, util){

	"use strict";
	
	var
  	
  		svg,
  		
  		margin    = {top:0, right:0, bottom:0, left:0},

	  	height    = $(document).height() - margin.top - margin.bottom,
		
	  	width    = $(document).width() - margin.left - margin.right,
	  	
	  	overlaymenu,
	  	overlayactive = false,
	  	
	  	datamenu,
	  	datamenuactive = false,
	  	
	  	filtermenu,
	  	filtermenuactive = false,
	  	
	  	draggedmenu,
	  	
	  	buttonwidth =  30,
	  	
	  	buttonheight = height/4,
	  	 
	  	dragmenu = function(d){
	  		draggedmenu = d.id;	
	  	},
	  	
	  	bw = function(d){
	  		if (d.id == "overlaymenu" || d.id == "filtermenu"){
	  			return buttonwidth;
	  		}
	  		return buttonheight;
	  	},
	  	
	  	bh = function(d){
	  		if (d.id == "overlaymenu" || d.id == "filtermenu"){
	  			return buttonheight;
	  		}
	  		return buttonwidth;
	  	},
	  	
	  	bx = function(d){
	  		if (d.id == "overlaymenu"){
	  			return -5;
	  		}
	  		else if (d.id == "filtermenu"){
	  			return width - (margin.left) - buttonwidth + 5;
	  		}
	  		return width/2 - (buttonheight/2);
	  	},
	  	
	  	by = function(d){
	  		if (d.id == "overlaymenu" || d.id == "filtermenu"){
	  			return buttonheight - (buttonheight / 2) 
	  		}
	  		return height - buttonwidth; 	
	  	},
	  	
	  	bp = function(d){
	  		if (d.id == "overlaymenu")
	  			return util.rightroundedrect(bx(d)+5,by(d),bw(d),bh(d),8);
	  		if (d.id == "filtermenu")
	  			return util.leftroundedrect(bx(d),by(d),bw(d),bh(d),8);
	  		else
	  			return util.toproundedrect(bx(d),by(d),bw(d),bh(d),8);
	  	},
	  	
	  	initialtransform = function(d){
	  		var xtrans = 0;
	  		var ytrans = 0;
	  		
	  		if (d.id == "overlaymenu"){
	  			xtrans =  (-width/2);
	  		}else if (d.id == "filtermenu"){
	  			xtrans = width/2 - margin.left-margin.right;
	  		}else if (d.id == "datamenu"){
	  			ytrans = height/2 - margin.top-margin.bottom;
	  		}
	  		return  "translate(" + xtrans + "," + ytrans + ")";
	  	},
	  	
	  	
	  	menuclicked = function(d){
	  		if (d3.event.defaultPrevented)
	  			return;
	  		else{	
	  			draggedmenu = d.id;
	  			togglemenu();
	  		}
	  	},
	  	
	  	togglemenu = function(){
	  		
	  		var xtrans = 0;
	  		var ytrans = 0;
	  		
	  		if (draggedmenu == "overlaymenu"){
	  			xtrans = overlayactive ? 0 : width/2;
	  			overlayactive = !overlayactive;
	  		}
	  		else if (draggedmenu == "filtermenu"){
	  			xtrans = filtermenuactive ? 0 : -width/2;
	  			filtermenuactive = !filtermenuactive;
	  		}
	  		else if (draggedmenu == "datamenu"){
	  			ytrans = datamenuactive ? 0 : -height/2;
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
  				return "#f59946";
  			}
  			if (d.id == "overlaymenu"){
  				return "#00aad4";
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
					
				var menuitems  = menu.selectAll("menuitems")
					.data(pathdata)
					.enter()
					.append("g")
					.attr("class", function(d){return d.id})
					
					
				menuitems.append("path")
					.attr("d", function(d){return d.path})
					.style("fill", function(d){return colour(d)})
					.style("stroke-width", 2)
					.style("stroke", "white")
					.style("fill-opacity",0.9)
					.attr("transform", function(d){
						 return initialtransform(d);
					});
				
				
				var buttons = menu.selectAll("menuitems")
					.data(pathdata)
					.enter()
				
				buttons.append("path")
						.attr("d", function(d){return bp(d)})
						.style("fill", function(d){return "#4e4e4e"})
						.style("fill-opacity",0.2)
						.style("stroke-width", 2)
						.style("stroke", "white")
						.on("click", menuclicked)
						.call(dragmenu);
				
				
						
			});	
			
		}
		
	return {
		init: init
	}

});