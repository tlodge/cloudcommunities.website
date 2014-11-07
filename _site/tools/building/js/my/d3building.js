define(['jquery','d3', 'pusher' /*'pubnub'*/], function($,d3,pusher /*,pubnub*/){

	"use strict";
	var 
		//pusher = new Pusher('8e22d04310c8ee0d5159'),
		
		//channel = pusher.subscribe('private-channel'),
   		
   		/*PUBNUB_demo = PUBNUB.init({
				publish_key: 'demo',
				subscribe_key: 'demo'
		}),*/
   		
		buildingdata 	  = {},
		
		apartmentdata 	  = {},
		
		roomdata		  = {},
		floordata		  = {},
		flooroverlays 		= [],
		apartmentpaths	  	= [],
		maxwidths  			= [],
		maxheights			= [],
		apartmentrects	 	= [],
		visiblerooms		= [],
		
		margin    = {top:10, right:0, bottom:0, left:20},

	  	height    = $(document).height() - margin.top - margin.bottom,
		
	  	width    = $(document).width() - margin.left - margin.right,
	  
	  	MAXCOLS  =  4,
	  		
	  	TRANSITIONDURATION = 1500,
	  	
	  	selectedfloors = [],
	  	selectedrooms  = [],
	  	
	  	buildingwidth = 0,
	  	
	  	buildingheight = 0,
	  	
	  	apartmentpadding = 10,
	  	
	  	layoutpadding  = 10,
	  
  		lastcontrolx   = 0,
  		
  		controldragdir = 1,
  		
  		dragfloormove = function(d){
  			
  			var x = d3.event.x - margin.left;
  			var y = d3.event.y - margin.top;
  					
  			flooroverlays.filter(function(item){
  				return selectedfloors.indexOf(item) == -1;
  			}).forEach(function(d){
  				var bounds = d.bounds;
  	
  				if ( (x >= bounds.minx && x <= bounds.maxx) && (y >= bounds.miny && y <= bounds.maxy)){
  					
  					floorclicked(d);
  					//d3.selectAll("rect.window" + d.id).style("fill-opacity", 1.0);
  				} 	
  			});
  		},
  		
  		
	  	dragfloors = d3.behavior.drag()
  						   .on("drag", dragfloormove),
								   		   
	  	svg  = d3.select("#building").append("svg")
				.attr("width", width)
				.attr("height", height)
				//.attr("viewBox", "0 0 " + width + " " + height)
				.append("g")
				.attr("class", "building")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
				
				
		dragmove = function(d){
		
  			visiblerooms.forEach(function(room, i){
  				var coords = room.coords;
  				var x = d3.event.x;
  				var y = d3.event.y;
  				if ( (x >= coords.x && x <= coords.x+coords.width) && (y >= coords.y && y <= coords.y + coords.height)){
  					d3.select("rect.room_" + room.id).style("fill", "red");
  					visiblerooms.splice(i, 1);
  					selectedrooms.push(room);
  				}
  			});
  		},
  		
  		dragstart = function(d){
			//generate all of the rooms that may drag into!
			visiblerooms = [];
			selectedrooms = [];
			
			d3.selectAll("rect.room").style("fill", function(d){return colour(d.data)})
			
			//apply the translation/scale coords to the coordinates to match coordinate systems 
			//match between the x,y mouse and svg coords
			
			var rc  = rowscols(selectedfloors.length);
			
  			//could this live in a domain/range function...?
			selectedfloors.forEach(function(floor,i){
				floordata[floor.id].rooms.forEach(function(room){
					
					var rd = $.extend(true,{},roomdata[room.name]); //create a deep copy of roomdata
					var scale = scalefactor(rc.cols,rc.rows,indexforid(floor.id));
					
					
					var tx = ax(i,rc.rows,rc.cols) + layoutpadding;
					var ty = cy(i, rc.rows,rc.cols,indexforid(floor.id));
					
					//scale
					rd.coords.x *= scale;
					rd.coords.y *= scale;
					rd.coords.width *= scale;
					rd.coords.height *= scale;
					
					//translate
					rd.coords.x += tx;
					rd.coords.y += ty;	
					visiblerooms.push(rd);
				});
			});
			
			
  		},
  		
  		dragend = function(d){
			if (selectedrooms.length > 0){
  				selectedfloors = [];
  				renderfloors();
  				d3.selectAll("rect.window").style("fill-opacity", 0.0)
  				renderrooms();
  			}
  		},
  		
  		
  		dragcontrolstart = function(d){
  			
  		},
  		
  		dragcontrolmove = function(d){
  			
  			//d3.select("g.overlaycontrol").attr("transform", "translate(0," + (d3.event.y) + ")");
  			
  			
  			controldragdir = (lastcontrolx > d3.event.x) ? 1:-1;
  			lastcontrolx = d3.event.x;
  		},
  		
  		dragcontrolend = function(d){
  			
  			var xtrans = 0
  			var barwidth = (width/20);
  			if(controldragdir == -1){
  				xtrans = barwidth; 
  			}else{
  				xtrans = 0;
  			}
  			
  			d3.select("g.overlaycontrol")
  				.transition()
  				.duration(500)
  				.attr("transform", "translate(" + xtrans +",0)");
  			lastcontrolx = 0;
  			
  		},
  		
  		
  		
		dragrooms = d3.behavior.drag()
	   					  .on("drag", dragmove)
						   .on("dragend", dragend)
						   .on("dragstart", dragstart),
  		
  		dragcontrol = d3.behavior.drag()
	   					  .on("drag", dragcontrolmove)
						   .on("dragend", dragcontrolend)
						   .on("dragstart", dragcontrolstart),
  		
	  	
  		ax = function(idx, rows,cols){
  			return ((idx % cols) * maxaspect(cols,rows)) + buildingwidth + apartmentpadding;
  		},
  		
  		ay = function(idx, rows,cols){
  			return (Math.floor(idx / cols) * maxaspect(cols,rows)) + apartmentpadding;
  		},
  		
  		//center floorplan within surrounding rect
  		cy = function(i, rows, cols, floorno){
  			//y + height/2 - half height of (scaled) floorplan
  			return (Math.floor(i / cols) * maxaspect(cols,rows))  + (maxaspect(cols,rows)/2) - ((scalefactor(cols, rows, floorno) * maxheights[floorno])/2);
  		},
  		
  		
  		maxrows = function(itemcount){	
  			var ratio = width/height;
  			return Math.ceil(Math.sqrt( itemcount / ratio ));
  			
	  		//return  Math.max(1,Math.ceil(itemcount/ratio));	  	
	  	},
	  	
  		rowscols = function(totalitems){
  			if (totalitems == 0)
  				return {rows:1,cols:1}
  			
  			var cols = 	 Math.max(1,Math.floor(totalitems / maxrows(totalitems)));
  			var rows =   Math.ceil(totalitems / cols);
  			
  			//if rows != cols, work out which will give the largest aspect ratio!
  			
  			if ( maxaspect(cols,rows) < maxaspect(rows,cols)){
  				var tmp = cols
  				cols = rows;
  				rows = tmp;
  			}
  			
  			return {cols:cols, rows:rows};
  		},
  		
  		
  		
  			
  		renderbuilding = function(){
  								
  			
  			//should use update/enter/exit with this
  				
  			//flatten data to matrix
			// [
			//   [{rect1.1},{rect1.2},{rect1.3}],
			//   [{rect2.1},{rect2.2},{rect2.3}]
			//   ...
			//  ]
			
			var floormatrix = Object.keys(buildingdata).map(function(floor){
				return buildingdata[floor].rects.map(function(d,i){
					return {x:d['x'], y:d['y'], width:d['width'], height:d['height'], id:buildingdata[floor].id}
				});
			});
			
			//build an array of rects to overlay on top of floors
  			flooroverlays = Object.keys(buildingdata).map(function(floor){
  				var bounds = {"maxx":0, "maxy":0, "minx":Number.POSITIVE_INFINITY, "miny":Number.POSITIVE_INFINITY};
				
  				buildingdata[floor].rects.forEach(function(d){
  					
  					bounds.maxx = Math.max(d.x+d.width, bounds.maxx);
  					buildingwidth = Math.max(buildingwidth, bounds.maxx);
  					
  					bounds.maxy = Math.max(d.y+d.height, bounds.maxy);
  					buildingheight = Math.max(buildingheight, bounds.maxy);
  					bounds.minx = Math.min(d.x, bounds.minx);
  					bounds.miny = Math.min(d.y, bounds.miny);
  				});
  				return {"id":buildingdata[floor].id, "bounds":bounds};
  			});
  				
  			
  			
  			var floors = d3.select("g.floors")
  				.selectAll("floors")
  				.data(floormatrix)
  				.enter()
  				.append("g")
  				.attr("class", function(d){return "floor"});
  				
  			renderfloors();	
  			
  			var floor = floors
  						.selectAll("floor")
  						.data(function(d,i){return d})
  						.enter()
  						.append("rect")
  						.attr("class", function(d){return "window window"+d.id})
  						.attr("x", function(d){return d.x})
  						.attr("y", function(d){return d.y})
  						.attr("width", function(d){return d.width})
  						.attr("height", function(d){return d.height})
  						.style("fill", "#d78242")
  						.style("fill-opacity", 0.0)
  						.style("stroke", "black")
  						
  			d3.select("g.flooroverlays")
  						.selectAll("overlays")
  						.data(flooroverlays)
  						.enter()
  						.append("rect")
  						.attr("class", function(d){return "floor floor"+d.id})
  						.attr("x", function(d){return d.bounds.minx})
  						.attr("y", function(d){return d.bounds.miny})
  						.attr("width", function(d){return  (d.bounds.maxx-d.bounds.minx)})		
  						.attr("height", function(d){return (d.bounds.maxy-d.bounds.miny)})
  						.style("fill", "#d78242")
  						.style("fill-opacity", 0)
  						.on("click", floorclicked)
  						.call(dragfloors)
  		},
  		
		//pass in x,y width and height params here..
  		generatepath = function(pobj){
	  		return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";
	  	},
  	
  		
  		renderapartments = function(){
  			
  			var paths = apartmentdata.filter(function(item){
  				return item.type=="path";
  			});
  			
  			
  			var rects = apartmentdata.filter(function(item){
  				return item.type=="rect";
  			});
  			
  			
  			paths.forEach(function(path){
  				var pathstr = generatepath(path);
  				
  				/*var apartment = svg.select("g")	
  								  
  								  .append("path")
  								  .attr("d", pathstr)
    							  .style("stroke-width", 2)
    							  .style("stroke", "red")
    							  .style("fill-opacity",0)*/
  									
  			});
  	
  		},
  		
  		floorclicked = function(d){
  			
  			var idx = selectedfloors.indexOf(d);
  			
  			if (idx == -1){
  				selectedfloors.push(d);
  				//d3.select("rect.floor" + d.id).style("fill-opacity", 1.0);
  				d3.selectAll("rect.window" + d.id).style("fill-opacity", 1.0);
  			}else{
  				selectedfloors.splice(idx, 1);
  				d3.selectAll("rect.window" + d.id).style("fill-opacity", 0);
  			}	
  			
  			selectedfloors.sort(function(a,b){return (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0})
  			renderfloors();
  		},
  		
  		apartmentsforfloor = function(floorid){
  			//.attr("d",  generatepath(path))
    		//		  .style("stroke-width", 2)
    		//		  .style("stroke", "red")
    		//		  .style("fill-opacity",0)
  			
  		},
  		
  		scalefactor = function(cols, rows, floor){
  		    var maxwidth = maxwidths[floor];
  			var w = maxaspect(cols,rows) - (2*apartmentpadding) - (2*layoutpadding);
  			var scale = (w / maxwidth);
  			return scale;
  		},
  		
  		indexforid = function(id){
  			return parseInt(id)-1;
  		},
  		
  		colour = function(floordata){
  			
  			if (floordata['type'] == "room"){ 
  			 	var rdata = roomdata[floordata['name']];
  			 	if (rdata.beds == 1)
  			 		return "#fbefe3";
  			 	if (rdata.beds == 2){
  			 		if (rdata.study)
  			 			return "#e9af7d";
  			 		return "#f4d3b5";
  			 	}
  			 }
  		 	return "white";
  		},
  		
  		/*selectfloor = function(floor){
  			
			d3.selectAll("rect.window").style("fill-opacity", 0);
			d3.selectAll("rect.window"+floor.id).style("fill-opacity", 1);
			selectedfloors = [floor];
  			renderfloor();
  		
  		},
  		
  		
  		flooritemclicked = function(item, floor){
  			
  			//reset all room colours for ths floor
  			
  			if (item.data && item.data.type=="room"){		
  			
  				d3.select("g.floor_" + floor.id)
  							.selectAll("rect.room")
  							.style("fill", function(d){ if (d.data.name == item.data.name) return "red" ;return colour(d.data)})
  				   
  				selectfloor(floor);
  				
  	  		}

  		},*/
  		
  		/*renderdetail = function(){
  			var rows = Math.ceil(6 / MAXCOLS);
  			var cols = Math.ceil(6 / rows);
  			
  			var detail = svg.select("g.apartmentdetail")
  							 .append("g")
  							 .attr("class", "detail")
  							 .attr("opacity", 0.0)
  			
  			detail
  				.append("rect")	
  				.attr("x",function(d,i){return buildingwidth + maxaspect(cols,rows) + apartmentpadding})
  				.attr("y",function(d,i){return apartmentpadding})	
  				.attr("width",  maxaspect(cols,rows) - (2*apartmentpadding))
  				.attr("height", maxaspect(cols,rows) - (2*apartmentpadding))
  				.style("stroke-width", 1)
				.style("stroke", "black")
				.style("fill", "#fff")
					
  			
  			detail
  				.append("rect")
  				.attr("class", "detail")
  				.attr("x",function(d,i){return buildingwidth + apartmentpadding})
  				.attr("y",function(d,i){return maxaspect(cols,rows) + 2*apartmentpadding})	
  				.attr("width",  (2 * maxaspect(cols,rows)) - (2*apartmentpadding))
  				.attr("height", maxaspect(cols,rows) - (2*apartmentpadding))
  				.style("stroke-width", 1)
				.style("stroke", "black")
				.style("fill", "#fff")
				
			detail
  				.append("rect")
  				.attr("class", "detail")
  				.attr("x",function(d,i){return buildingwidth + 2*maxaspect(cols,rows) + apartmentpadding})
  				.attr("y",function(d,i){return apartmentpadding})	
  				.attr("width",  maxaspect(cols,rows) - (2*apartmentpadding))
  				.attr("height",  (2 *maxaspect(cols,rows)) - apartmentpadding)
  				.style("stroke-width", 1)
				.style("stroke", "black")
				.style("fill", "#fff")
				
  			detail
  				.transition()
  				.duration(TRANSITIONDURATION)
  				.attr("opacity", 1.0)
  				
  		},*/
  		
  		/*renderfloor = function(){
  			 
  			 
  			var rows = Math.ceil(6 / MAXCOLS);
  			var cols = Math.ceil(6 / rows);
  			
  			var floorplans = svg.selectAll("g.floorcontainer")
  								.data(selectedfloors, function(d,i){return d.id})
  								
  			var apartments  	= svg.select("g.apartmentdetail")
  								.selectAll("g.floorlabel")
  								.data(selectedfloors, function(d,i){return d.id})				
  			
  			apartments.select("rect")
  				  	  .transition()
  					  .duration(TRANSITIONDURATION)
  					  .attr("x",function(d,i){return ax(i,rows,cols)})
  					  .attr("y",function(d,i){return ay(i,rows,cols)})	
  					  .attr("width",  maxaspect(cols,rows) - (2*apartmentpadding))
  					  .attr("height", maxaspect(cols,rows) - (2*apartmentpadding))
  						
  			apartments.select("circle")
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("cx",function(d,i){return ax(i,rows,cols) + (maxaspect(cols,rows) - (2*apartmentpadding))/2 })
					.attr("cy",function(d,i){return ay(i,rows,cols) + (maxaspect(cols,rows) - (2*apartmentpadding))})
					
			
			apartments.select("text")
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("x",function(d,i){return ax(i,rows,cols) + (maxaspect(cols,rows) - (2*apartmentpadding))/2 })
					.attr("y",function(d,i){return ay(i,rows,cols) + (maxaspect(cols,rows) - (2*apartmentpadding))})	
	  		
	  		
	  		//use i to get paths!		
  			floorplans.transition()
  					  .duration(TRANSITIONDURATION)
  					  .attr("transform", function(d,i){return "translate(" + (ax(i,rows,cols) + layoutpadding) + "," +  cy(i,rows,cols,indexforid(d.id)) + "),scale("+ scalefactor(cols,rows,indexforid(d.id)) + ")"})
  			
  			
  			//add the extra rects for additional details...
  			renderdetail();
  				
  			apartments
  					  .exit()
  					  .remove()
  			
  			floorplans
  					  .exit()
  					  .remove()
  		
  		},*/
  		
  		
  		
  		rendercontrol = function(){
  			var barwidth = width/20;
  			
  			var circleradius = (barwidth/2.5);
  			var paddingtop = 30;
  			var buttons = ["one", "two", "three", "four"];
  			var rightmargin = barwidth;
  			var controlbar = d3.select("g.overlaycontrol")
  			var xpos = (width - margin.right - margin.left) - rightmargin;
  			var xtrans = barwidth
  			
  			
  			controlbar
  								.append("circle")
  								.attr("cx", xpos+2)
  								.attr("cy",height/2)
  								.attr("r",20)
  								.style("fill","#30363c")
  								.style("fill-opacity",0.8)
  								//.style("stroke", "#30363c")
  								.call(dragcontrol)
  								
  			controlbar			.append("rect")
  								.attr("class","controlrect")
  								.attr("x", xpos)
  								.attr("y",0)
  								.attr("width",barwidth)
  								.attr("height",height)
  								.style("fill","#30363c")//"#e9af7d")
  								.style("fill-opacity",1)
  								
  			/*controlbar			.append("rect")
  								.attr("class","controlborder")
  								.attr("x", xpos-2)
  								.attr("y",0)
  								.attr("width",barwidth/15)
  								.attr("height",height)
  								.style("fill","#30363c")
  								.style("fill-opacity",0.6)*/
  			
  			
  			controlbar
  					.attr("transform", "translate(" + xtrans + ",0)");
  			
  			
  			/*controlbar
  						.selectAll("button")
  						.data(buttons)
  						.enter()
  						.append("circle")
  						.attr("cx", function(d){return xpos + (barwidth/2)})
  						.attr("cy", function(d,i){return 30 + ((height-30)/buttons.length) * i })
  						.attr("r", circleradius)
  						.style("fill", "#fbefe3")
  						.style("stroke","white")
  						.style("stroke-width", 2);*/
  		},	
  		
  		
  		renderrooms = function(){
  
  			var rooms  	= svg.select("g.apartmentdetail")
  							 .selectAll("g.room")
  							 .data(selectedrooms, function(d,i){return d.id})
  								 
  			var rc = rowscols(selectedrooms.length);
  			
  			var room = rooms
						.enter()
						
			room.append("rect")
				.attr("class", "apartment")
				.attr("x",function(d,i){return ax(i,rc.rows,rc.cols)})
				.attr("y",function(d,i){return ay(i,rc.rows,rc.cols)})	
				.attr("width", maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))
				.attr("height", maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))	
				.style("stroke-width", 1)
				.style("stroke", "black")
				.style("fill", "#d78242")
				.style("fill-opacity", 0)					 
  		},
  		
  		renderfloors = function(){	
  			
			d3.selectAll("g.detail").remove();
			d3.selectAll("rect.apartment").remove();
			
  			var labelradius = 15;
  			
  			
  			var rc = rowscols(selectedfloors.length);
  			
  			
  			var floordisplaywidth = width - buildingwidth - 30;
  				
  				
  			var apartments  	= svg.select("g.apartmentdetail")
  								.selectAll("g.floorlabel")
  								.data(selectedfloors, function(d,i){return d.id})
  								
  								
  			var floorplans =  	svg.select("g.apartmentdetail")
  								.selectAll("g.floorcontainer")
  								.data(selectedfloors, function(d,i){return d.id})
  			
  			//update current
  							
  			apartments.select("rect")
  				  	  .transition()
  					  .duration(TRANSITIONDURATION)
  					  .attr("x",function(d,i){return ax(i,rc.rows,rc.cols)})
  					  .attr("y",function(d,i){return ay(i,rc.rows,rc.cols)})	
  					  .attr("width",  maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))
  					  .attr("height", maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))
  			
  			apartments.select("circle")
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("cx",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))/2 })
					.attr("cy",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))})	
			
			apartments.select("text")
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("x",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))/2 })
					.attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))})	
	  		
	  		
	  		//use i to get paths!		
  			floorplans.transition()
  					  .duration(TRANSITIONDURATION)
  					  .attr("transform", function(d,i){return "translate(" + (ax(i,rc.rows,rc.cols) + layoutpadding) + "," +  cy(i,rc.rows,rc.cols,indexforid(d.id)) + "),scale("+ scalefactor(rc.cols,rc.rows,indexforid(d.id)) + ")"})
  					
		
			var apt = apartments
							.enter()
							.append("g")
							.attr("class", "floorlabel")
				
				apt.append("rect")
					.attr("class", "floorplan")
					.attr("x",function(d,i){return ax(i,rc.rows,rc.cols)})
					.attr("y",function(d,i){return ay(i,rc.rows,rc.cols)})	
					.attr("width", maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))
					.attr("height", maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))	
					.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", "#d78242")
					.style("fill-opacity", 0)
						
				apt.append("circle")
					.attr("class", "floorlabel")
					.attr("cx",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))/2})
					.attr("cy",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))})	
					.attr("r", labelradius)
					.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", "white")
			
				apt.append("text")
					.attr("class", "floortext")
					.attr("dy", ".35em")
	  				.attr("x",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))/2})
					.attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))})	
	  				.attr("fill", "#000")
	  				.attr("text-anchor", "middle")
	  				.style("font-size", "26px")
	  				.text(function(d){return d.id})
	
					
		var detail = floorplans
					.enter()
					.append("g")
					.attr("class", function(d){return "floorcontainer" + " floor_" + d.id})
					.attr("transform", function(d,i){return "translate(" + (ax(i,rc.rows,rc.cols) + layoutpadding) + "," +  cy(i, rc.rows,rc.cols,indexforid(d.id)) + "),scale("+ scalefactor(rc.cols,rc.rows,indexforid(d.id)) + ")"})
  					
		detail.selectAll("paths")
					.data(function(d,i){return apartmentpaths[parseInt(d.id)-1]})
					.enter()
					.append("path")
					.attr("d", function(d){return d.path})
					.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill-opacity",0)
						
		detail.selectAll("rects")
					.data(function(d,i,j){return apartmentrects[parseInt(d.id)-1]})
					.enter()
					.append("rect")
					.attr("class", function(d){ 
												if (d.data && d.data.type == "room"){
													return "room room_" + roomdata[d.data.name].id;
												}
												return "floorplan";
											   })
											   
    				.attr("x",function(d,i){return d.x})
					.attr("y",function(d,i){return d.y})	
					.attr("width", function(d){return d.width})
					.attr("height",function(d){return d.height})
    				.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", function(d){return colour(d.data)})
					//.on("click", function(d,i){flooritemclicked(d,d3.select(this.parentNode).datum())})	
		
		
    		//remove old!	  
    				  
  			apartments
  					  .exit()
  					  .remove()
  			
  			floorplans
  					  .exit()
  					  .remove()
  					  
  		},
  		
  		maxaspect = function(cols, rows){
  			var floordisplaywidth = width - buildingwidth - 30;
  			return Math.min((floordisplaywidth/cols), (buildingheight/rows))
  		}, 
	  	
	  	init = function(){
	  		var screenwidth  = $(document).width();
	  		var screenheight = $(document).height();
	  		var bottompadding = 30;
	  		
	  		
	  		svg.append("g").attr("class","floors");
	  		
  			svg.append("g").attr("class","flooroverlays");
  									
  			svg.append("g").attr("class","apartmentdetail")
  							.call(dragrooms);
  			
  			svg.append("g").attr("class","overlaycontrol")
  							.call(dragcontrol);
  							
	  		d3.json("data/building.json", function(error, json) {
  				if (error) return console.warn(error);
  				buildingdata = json.floors;
  				
  				var scalefactor = (screenheight - bottompadding)/ json.height ;
  				
  				//rescale all windows to fit within the screen
  				
  				Object.keys(buildingdata).forEach(function(floor){
  					buildingdata[floor].rects.forEach(function(rect){
  						rect.x = rect.x * scalefactor;
  						rect.y = rect.y * scalefactor;
  						rect.width = rect.width * scalefactor;
  						rect.height = rect.height * scalefactor;
  					});
  				});
  			
  				
  				d3.json("data/apartment.json", function(error, json){
				if (error) return console.warn(error);
  					apartmentdata = json;
  					
  					apartmentpaths = apartmentdata.map(function(items){
  						return items.filter(function(item){
  							return item.type=="path";
  						}).map(function(path){
							return {path:generatepath(path),width:path.width,height:path.height};	
						});
  						
  					});
  					
  					apartmentrects = apartmentdata.map(function(items){
						return items.filter(function(item){
							return item.type=="rect";
						});
					});
					
					
					//max width of the path is just the max of path widths (note that we 
					//should probably more strictly calculate width as the path's M x + width
  					var pathwidths = apartmentpaths.map(function(item){
  						
  						if (item.length == 0){
  							return 0;
  						}
  						if (item.length == 1){
  							return item[0].width;
  						}
  						return item.reduce(function(x,y){
  							return Math.max(x.width, y.width);
  						});
  					});
  					

  					var pathheights = apartmentpaths.map(function(item){
  						if (item.length == 0){
  							return 0;
  						}
  						if (item.length == 1){
  							return item[0].height;
  						}
  								
  						return item.reduce(function(x,y){
  							return Math.max(x.height, y.height);
  						});
  					});
  					
  					
  					//max width of rects is calculated by finding the rect with the smallest x
  					//and the rect with the biggest x+width and subtracting the first from the second
  					var rectwidths = apartmentrects.map(function(items){
  						var minxs = items.map(function(rect){
  							return rect.x;
  						});
  						var maxxs = items.map(function(rect){
  							return rect.x + rect.width;
  						});
  						
  						var maxx = maxxs.reduce(function(x,y){return Math.max(x,y)});
  						var minx = minxs.reduce(function(x,y){return Math.min(x,y)});
  						return maxx-minx;
  					});
  					
  					
  					var rectheights = apartmentrects.map(function(items){
  						var minys = items.map(function(rect){
  							return rect.y;
  						});
  						var maxys = items.map(function(rect){
  							return rect.y + rect.height;
  						});
  						
  						var maxy = maxys.reduce(function(x,y){return Math.max(x,y)});
  						var miny = minys.reduce(function(x,y){return Math.min(x,y)});
  						return maxy-miny;
  					});
  				
  					
  					maxwidths = pathwidths.map(function(item,index){
  						return Math.max(item, rectwidths[index]);
  					});
  					
  					maxheights = pathheights.map(function(item,index){
  						return Math.max(item, rectheights[index]);
  					});
  					
  					//should do maxheights too so that we can center in container!
  					
  					d3.json("data/floordata.json", function(error, json){
  						if(error)
  							console.warn(error);
  						
  						floordata = json;
  						
  						//generate data for looking up rooms
  						//first get all svg data in the svg json (apartmentrects)
  						
  						apartmentrects.forEach(function(rects){
  							rects.forEach(function(item){
  								if (item.data.type == "room"){
  									roomdata[item.data.name] = {"coords":{x:item.x,y:item.y,width:item.width,height:item.height}};
  								}
  							});
  						});
  						
  						//now add additional (non-svg) metadata to roomdata
  						Object.keys(floordata).forEach(function(floor){
  							floordata[floor].rooms.forEach(function(room){
  								for (var attrname in room){
  									roomdata[room.name][attrname] = room[attrname];
  								}
  							});
  						});
  						
  						renderbuilding();
  						renderapartments();
  						rendercontrol();
  					});
				});
			});
			
			//channel.bind('my_event', function(data) {
      		//	alert(data.message);
   			//});
   			
   			/*PUBNUB_demo.subscribe({
				channel: 'demo_tutorial',
				message: function(m){
					var d = flooroverlays[1];
					d3.selectAll("rect.window").style("fill-opacity", 0);
					d3.selectAll("rect.window"+d.id).style("fill-opacity", 1);
					selectedfloors = [d];
					selectedfloors.sort(function(a,b){return (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0})
  					renderfloors();
			
				}
			});*/
    
			
	  		//d3.select(window).on('resize', resize);
	  	}

	return {
		init:init,
	}

});
