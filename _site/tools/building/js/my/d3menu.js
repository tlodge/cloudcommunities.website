define(['jquery','d3', 'util'], function($,d3, util){

	"use strict";
	
	var
  		
  		
  		emitter,
  		
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
	  		return (width/2) - (buttonheight/2);
	  	},
	  	
	  	by = function(d){
	  		if (d.id == "overlaymenu" || d.id == "filtermenu"){
	  			return buttonheight - (buttonheight / 2) 
	  			//(height/2) - buttonheight/2;//
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
	  	
	  	
	  	tx = function(d){
  			if (d.id == "datamenu"){
  				return (width/2);
  			}
  			else if (d.id == "overlaymenu"){
  				return buttonwidth/2;
  			}
  			else if (d.id == "filtermenu"){
  				return width-(buttonwidth/2);
  			}
  			return 0;
  		},
  		
  		ty = function(d){
  			
  			if (d.id == "datamenu"){
  				return height-(buttonwidth/2);
  			}
  			else if (d.id == "overlaymenu"){
  				return height/4;
  			}
  			else if (d.id == "filtermenu"){
  				return height/4;
  			}
  			return 0;
  		},
  		
  		trot = function(d){
  			if (d.id == "datamenu"){
  				return "rotate(0)";
  			}
  			if (d.id == "overlaymenu"){
  				return "rotate(90," + tx(d) + "," + ty(d) + ")"
  			}
  			if (d.id == "filtermenu"){
  				return "rotate(-90," + tx(d) + "," + ty(d) + ")"
  			}
  			return 0;
  		} ,
  		
  		ttext = function(d){
  			if (d.id == "datamenu")
  				return "data";
  			if (d.id == "overlaymenu")
  				return "overlays";
  			if (d.id == "filtermenu")
  				return "filters";
  		},
  		
  		
  		filterclicked = function(d){
  			emitter.dispatch({source:"filter", type:'neighbour', data:{}})
  		
  		},
  		
  		sourceclicked = function(d){
  			
  			d3.selectAll("rect.source").style("fill", "white");
  			
  			if (!d.running){
  				d3.select("rect.source_" + d.id).style("fill", "red");
  				emitter.dispatch({source:'data', type:'select', data:{name:d.name, id:d.id}});
  				d.running = true;
  			}else{
  				d3.select("rect.source_" + d.id).style("fill", "white");
  				emitter.dispatch({source:'data', type:'deselect', data:{name:d.name}});
  				d.running = false;
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
	  	
	  	addfilters = function(){
	  		
	  		var filters = [
	  				{id:1, name:"adjacent neighbours"}, 
	  				{id:2, name:"all neighbours (including above and below)"}, 
	  				{id:3, name:"all rooms above"},
	  				{id:4, name:"all rooms below"}
	  				];
	  		
	  		var options = d3.select("g.filtermenu")
	  						.append("g")
	  						.attr("transform", "translate(" + width + ",0)")
	  						.selectAll("filter")
	  						.data(filters)
	  						.enter();
	  		
	  		options.append("rect")
	  			   .attr("class", function(d){return "filteroption filteroption_" + d.id})
	  			   .attr("x", 20)
	  			   .attr("y", function(d,i){return 20 + (30 * i)})
	  			   .attr("width",20)
	  			   .attr("height", 20)
	  			   .style("fill", "#4e4e4e")
	  			   .style("stroke", "white")
	  			   .style("stroke-width", 2)
	  			   .on("click",filterclicked)
	  			   				
	  		/*options.append("circle")
	  			   .attr("class", function(d){return "filteroption filteroption_" + d.id})
	  			   .attr("cx", 20)
	  			   .attr("cy", function(d,i){return 20 + (30 * i)})
	  			   .attr("r",function(d){return 10})
	  			   .style("fill", "#4e4e4e")
	  			   .style("stroke", "white")
	  			   .style("stroke-width", 2);*/
	  			   
	  			   
	  		options.append("text")		
	  				.attr("class", "sourcetext")
	  				.attr("dy", ".35em")
	  				.attr("x", 50)
	  				.attr("y", function(d,i){return 30 + (30 * i)})
	  				.style("fill", "white")
	  				.text(function(d){return d.name})
	  				.style("font-size",  "14px")
	  			   	
	  	},
	  	
	  	adddatasources = function(){
	  		var rheight = 1/2* (height/2)
	  		var padding = rheight/4;
	  		var rtexty =  (height/4) - (rheight/2) + rheight - (rheight/5);
	  		
	  		var datasources = [
	  							{id:1, name:"some live data", running:false}, 
	  							{id:2, name:"energy", running:false},
	  							{id:3, name:"things I love", running: false},
	  							{id:4, name:"favourite picture", running: false}];
	  		
	  		var sources = d3.select("g.datamenu")
	  						.append("g")
	  						.attr("transform", "translate(0,"  + height +  ")")
	  						.selectAll("source")
	  						.data(datasources)
	  						.enter();
	  		
	  		sources.append("rect")
	  				.attr("class", function(d){return "source source_" + d.id})
	  				.attr("width", rheight)
	  				.attr("height", rheight)
	  				.attr("x", function(d,i){return padding + (i * (rheight+padding)) })
	  				.attr("y", (height/4) - (rheight/2))				 
	  				.style("fill", "white")
	  				.style("stroke", "black")
	  				.on("click", function(d){
	  					//d3.select(this).style("fill", "red");
	  					sourceclicked(d);		
	  				})
	  				
	  		sources.append("rect")
	  				.attr("width", rheight)
	  				.attr("height", rheight/5)
	  				.attr("x", function(d,i){return padding + (i * (rheight+padding)) })
	  				.attr("y",	rtexty)			 
	  				.style("fill", "#00aad4")
	  				.style("stroke", "black")
	  				
	  		sources.append("text")		
	  				.attr("class", "sourcetext")
	  				.attr("dy", ".35em")
	  				.attr("text-anchor", "middle")
	  				.attr("x", function(d,i){return padding + (i * (rheight+padding)) + rheight/2})
	  				.attr("y", function(d){return rtexty + (rheight/5)/2})
	  				.attr("fill", "white")
	  				.text(function(d){return d.name})
	  				.style("font-size", (rheight/5)/2 + "px")
	  					
				
	  	},
	  	
	  	
		init = function(rootelement, datasource){
			
			emitter = datasource;
			
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
						
			
  				buttons.append("text")		
	  					.attr("class", "buttontext")
	  					.attr("dy", ".35em")
	  					.attr("dx", "-.2em")
	  					.attr("text-anchor", "middle")
	  					.attr("x", function(d){return tx(d)})
	  					.attr("y", function(d){return ty(d)})
	  					.attr("fill", "white"/*"#4e4e4e"*/)
	  					.text(function(d){return ttext(d)})
	  					.attr("transform", function(d){return trot(d)})
	  					.style("font-size", "26px")
	  					.on("click", menuclicked)
						.call(dragmenu);
				
				adddatasources();	
				addfilters();
			});	
			
		}
		
	return {
		init: init
	}

});