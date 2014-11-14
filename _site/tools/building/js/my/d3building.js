define(['jquery','d3', 'util'], function($,d3,util){

	"use strict";
	var 
	
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
		
		margin    	   = {top:0, right:0, bottom:0, left:0},

		innermargin    = {top:10, right:0, bottom:0, left:20},
	  	
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
	  
  		
  		
  		dragfloormove = function(d){
  			
  			var x = d3.event.x - margin.left;
  			var y = d3.event.y - margin.top;
  					
  			flooroverlays.filter(function(item){
  				return selectedfloors.indexOf(item) == -1;
  			}).forEach(function(d){
  				var bounds = d.bounds;
  	
  				if ( (x >= bounds.minx && x <= bounds.maxx) && (y >= bounds.miny && y <= bounds.maxy)){
  					
  					floorselected(d);
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
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.append("g")
				.attr("class", "padding")
				.attr("transform", "translate(" + innermargin.left + "," + innermargin.top + ")"),
	
		adjustfloorcoords = function(){
  			var rc  = rowscols(selectedfloors.length);
  			//could this live in a domain/range function...?
			selectedfloors.forEach(function(floor,i){
				if (floordata[floor.id]){
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
				}
			});
  		},
  			
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
			
			
			adjustfloorcoords();
  		
			
			
  		},
  		
  		dragend = function(d){
			if (selectedrooms.length > 0){
  				selectedfloors = [];
  				renderfloors();
  				d3.selectAll("rect.window").style("fill-opacity", 0.0)
  				renderrooms();
  			}
  		},
  		
  		
  		

  		
  		
		dragrooms = d3.behavior.drag()
	   					  .on("drag", dragmove)
						   .on("dragend", dragend)
						   .on("dragstart", dragstart),
  		
  		
	  	
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
  						.on("click", floorselected)
  						.call(dragfloors)
  		},
  		
  		renderapartments = function(){
  			
  			var paths = apartmentdata.filter(function(item){
  				return item.type=="path";
  			});
  			
  			
  			var rects = apartmentdata.filter(function(item){
  				return item.type=="rect";
  			});
  			
  			
  			paths.forEach(function(path){
  				var pathstr = util.generatepath(path);
  				
  				/*var apartment = svg.select("g")	
  								  
  								  .append("path")
  								  .attr("d", pathstr)
    							  .style("stroke-width", 2)
    							  .style("stroke", "red")
    							  .style("fill-opacity",0)*/
  									
  			});
  	
  		},
  		
  		floorselected = function(d){
  		
  			selectedrooms = []
  			renderrooms();
  			
			if (d3.event != null){
  				if (d3.event.defaultPrevented)
	  				return;
	  		}
  			var idx = selectedfloors.indexOf(d);
  			
  			if (idx == -1){
  				selectedfloors.push(d);
  				d3.selectAll("rect.window" + d.id).style("fill-opacity", 1.0);
  			}else{
  				selectedfloors.splice(idx, 1);
  				d3.selectAll("rect.window" + d.id).style("fill-opacity", 0);
  			}	
  			selectedfloors.sort(function(a,b){return (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0})
  			renderfloors();
  		},
  		
  		roomselected = function(room){
  			if (!roomdata[room])
  				return;
  			
  			selectedrooms = [];	
  			selectedfloors = [];
  			renderfloors();
  			
  			
  			var floor = floorforid(roomdata[room].floor);
  			selectedfloors.push(floor);
  			renderfloors();
  			d3.select("rect.room_" + roomdata[room].id).style("fill", "red");
  			
  			window.setTimeout(function(){	
  					selectedrooms.push(roomdata[room]);
  					selectedfloors = [];
  					renderfloors();
  					d3.selectAll("rect.window").style("fill-opacity", 0.0)
  					renderrooms();
  			},1000);
  				
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

    			
  		renderrooms = function(){
  			
  			
  			selectedrooms.sort(function(a,b){return (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0})
  			console.log(selectedrooms);
  			
  			var rc 		=  rowscols(selectedrooms.length);
  			var roomhw  =  maxaspect(rc.cols,rc.rows) - (2*apartmentpadding);
  			var transx  =  function(d,i){return -(d.coords.x*(roomhw/d.coords.width)) +  ax(i,rc.rows,rc.cols)};
			var transy  =  function(d,i){return -(d.coords.y*(roomhw/d.coords.height)) + ay(i,rc.rows,rc.cols)};
			var sfx     =  function (d){return roomhw/d.coords.width};
			var sfy     =  function (d){return roomhw/d.coords.height};
			var labelheight = function(d){return (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding)) / 5}
  			
  			var rooms  	= svg.select("g.apartmentdetail")
  							 .selectAll("g.room")
  							 .data(selectedrooms, function(d,i){return d.id})
  			
  			
  			//note that we can't just append labels to the rooms g container as when the translate
  			//occurs it'll screw up the fonts. Instead we bind to selectedrooms again and update 
  			//coords directly
  			
  			var labels  = svg.select("g.apartmentdetail")
  							 .selectAll("g.roomlabel")
  							 .data(selectedrooms, function(d,i){return d.id})
  			
  			//handle current rooms
  			
  			rooms.selectAll("rect.apartment")
  				 .attr("x",function(d){return d.coords.x})
				 .attr("y",function(d){return  d.coords.y})
				 .attr("width", function(d){return d.coords.width})
				 .attr("height", function(d){return d.coords.height})
				 .style("fill", "red")
  			
  			//handle current labels
  			
  			labels.selectAll("rect.roomlabel")
  				 .attr("x",function(d){return d.coords.x})
				  .attr("y",function(d){return  d.coords.y + d.coords.height - roomlabelheight})
				  .attr("width", function(d){return d.coords.width})
				  .attr("height", function(d){return roomlabelheight})
				  .style("stroke-width", function(d){return 1/sfx(d)})
				  .style("stroke", "black")		  
				  .style("fill-opacity", 1.0)
				  .style("fill", "white")
  			
  			//handle new rooms					 	
  			var window = rooms
						.enter()
						.append("g")
						.attr("class", "room")
				
			
			window.append("rect")
				.attr("class", "apartment")	
				.attr("x",function(d){return d.coords.x})
				.attr("y",function(d){return  d.coords.y})
				.attr("width", function(d){return d.coords.width})
				.attr("height", function(d){return d.coords.height})
				.style("fill", "red")
				.transition()
				.duration(500)	
				.style("stroke-width", function(d){return 1/sfx(d)})
				.style("stroke", "black")
				.style("fill", "white")
				.each('end',function(){
					//fade in labels once the room rects have moved into place!
					 d3.selectAll("g.roomlabel")
					 	.transition()
					 	.duration(500)
					    .style("opacity", 1.0);
				});
				
			window.transition()
				.duration(500)
				.attr("transform", function(d,i){return "translate(" + transx(d,i) + "," + transy(d,i) +"),scale(" + sfx(d)  + "," + sfy(d) +")"})
			
			//handle new labels
			var label = labels
						.enter()
						.append("g")
						.attr("class", "roomlabel")	
						.attr("opacity", 0.0)
						
			label.append("rect")
				 .attr("x",function(d,i){return ax(i,rc.rows,rc.cols)})
				 .attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)})	
				 .attr("width",function(d,i){return maxaspect(rc.cols,rc.rows) - (2*apartmentpadding)})
				 .attr("height", function(d){return labelheight(d)})	
				 .style("stroke-width", function(d){return 1})
				 .style("stroke", "black")
				 .style("fill", "#d78242")
			
			
			label.append("text")
				  .attr("class", "roomlabel")
				  .attr("dy", ".35em")
	  			  .attr("x",function(d,i){return ax(i,rc.rows,rc.cols) +  (maxaspect(rc.cols,rc.rows) - (2*apartmentpadding))/2})
				  .attr("y",function(d,i){return (ay(i,rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)) + labelheight(d)/2})	
	  			  .attr("fill", "#000")
	  			  .attr("text-anchor", "middle")
	  			  .style("font-size", function(d){return 0.8*labelheight(d) + "px"})
	  			  .style("fill", "white")
	  			  .text(function(d){return d.name;})
	  			  	
			//handle gone
			
			rooms.exit()
				.remove();
				
			labels.exit()
				.remove();
			
  		},
  		
  		renderfloors = function(cback){	
  			
  			var labelradius = 15;
  			var transitioncount = 0; //used to monitor when all transitions are ended (and when callback is called)
  			
  			var rc = rowscols(selectedfloors.length);
  			
  			
  			var floordisplaywidth = width - buildingwidth - 30;
  				
  				
  			var apartments  = svg.select("g.apartmentdetail")
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
	  	
	  	
	  	floorforid = function(id){
	  		for (var i = 0; i < flooroverlays.length; i++){
	  			var floor = flooroverlays[i];	
	  			if (floor.id == id){
	  				return floor;
	  			}
	  		}
	  		return null;
	  	},
	  	
	  	init = function(){
	  		var screenwidth  = $(document).width();
	  		var screenheight = $(document).height();
	  		var bottompadding = 30;
	  		
	  		
	  		svg.append("g").attr("class","floors");
	  		
  			svg.append("g").attr("class","flooroverlays");
  									
  			svg.append("g").attr("class","apartmentdetail")
  							.call(dragrooms);
  			
  			
  							
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
							return {path:util.generatepath(path),width:path.width,height:path.height};	
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
  								roomdata[room.name]['floor'] = floor;
  							});
  						});
  						renderbuilding();
  						renderapartments();
  					});
				});
			});
		
	  		//d3.select(window).on('resize', resize);
	  	}

	return {
		init:init,
		floorforid: floorforid,
		floorselected:floorselected,
		roomselected:roomselected,
	}

});
