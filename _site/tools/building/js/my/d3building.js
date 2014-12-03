define(['jquery','d3', 'util', 'numeric', 'pubnub'], function($,d3,util,numeric, pubnub){

	"use strict";
	var 
	
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		delegate,
		
		apartmentdata 	  = {},
		
		rooms		  = {},
		floors		  = {},
		
		flooroverlays 	  = [],
		apartmentpaths	  = [],
		maxwidths  		  = [],
		maxheights		  = [],
		apartmentrects	  = [],
		visiblerooms	  = {},
		
		xskew = 40,
    	
    	yskew = 20,
        
        
        matrix 		   = [],
        
		margin    	   = {top:0, right:0, bottom:0, left:0},

		innermargin    = {top:10, right:0, bottom:0, left:20},
	  	
	  	height    = $(document).height() - margin.top - margin.bottom,
		
	  	width    = $(document).width() - margin.left - margin.right,
	  
	  	transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform",

	  	MAXCOLS  =  4,
	  		
	  	TRANSITIONDURATION = 1500,
	  	
	  	selectedfloors = [],
	  	selectedrooms  = [],
	  	
	  	buildingwidth = 0,
	  	
	  	buildingheight = 0,
	  	
	  	roompadding = 10,
	  	
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
				if (floors[floor.id]){
					floors[floor.id].forEach(function(room){
						
						var rd = $.extend(true,{},rooms[room.id]); //create a deep copy of rooms
						var scale = scalefactor(rc.cols,rc.rows,i);//indexforid(floor.id));
					
					
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
						visiblerooms[room.id] = rd;
					});
				}
			});	
  		},
  			
  		square = function(room){
  			var minaspect = Math.min(room.coords.width, room.coords.height);
  			room.coords.width = minaspect;
  			room.coords.height = minaspect;
  			return room;
  		},
  		
		dragmove = function(d){
			
  			 Object.keys(visiblerooms).forEach(function(id,i){
  			 	var room  = rooms[id];

  			 	var coords = visiblerooms[id].coords;
  			 	var x = d3.event.x;
  				var y = d3.event.y;
  				if ( (x >= coords.x && x <= coords.x+coords.width) && (y >= coords.y && y <= coords.y + coords.height)){
  					d3.select("rect.room_" + room.id).style("fill", "red");
  					//visiblerooms.splice(i, 1);
  					selectedrooms.push(square(visiblerooms[id]));
  					delete visiblerooms[id];
  					//should push a square room, so that scaling is uniform!
  					
  				} 
  			 });
  		},
  	
  		
  		dragstart = function(d){
			//generate all of the rooms that may drag into!
			visiblerooms = {};
			selectedrooms = [];
			
			
			d3.selectAll("rect.room").style("fill", function(d){return delegate.colour(d.data["id"])})
			
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
  			return ((idx % cols) * maxaspect(cols,rows)) + buildingwidth + roompadding;
  		},
  		
  		ay = function(idx, rows,cols){
  			return (Math.floor(idx / cols) * maxaspect(cols,rows)) + roompadding;
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
  		
  		
  		renderbuilding = function(buildingdata){
  								
  			
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
  		
  		
  		perspective = function(){
  			console.log("IN PERSPECTIVE!!!");
  			var rc = rowscols(selectedrooms.length);
			var ma = maxaspect(rc.cols, rc.rows);
  			var ptransforms = [];
  			var sourcepoints = [];
  			var targetpoints = [];
  			
  			d3.selectAll("g.layer")
				.each(function(d,i){
					console.log("selecting g.layer" + i);
					
					var element = d3.select("g.layer"+i);
					
					var ctrans = d3.transform(element.attr("transform"));
					console.log(ctrans);
					
					ptransforms.push(element); 
					//lt,rt,lb,rb
					sourcepoints[i] = [[0, (ma+roompadding)*i],[rc.cols*(ma+roompadding), (ma+roompadding)*i], [0, ((ma+roompadding)*i)+ma],[rc.cols*(ma+roompadding), ((ma+roompadding)*i)+ma]]; 
					
					var tpx1 = 0,
					tpx2 	 = rc.cols*(ma+roompadding),
					tpx3 	 = 0,
					tpx4     = rc.cols*(ma+roompadding);
					
					var tpy1 = (ma+roompadding)*i,
					tpy2 	 = (ma+roompadding)*i,
					tpy3 	 = ((ma+roompadding)*i)+ma,
					tpy4 	 = ((ma+roompadding)*i)+ma;
					
					console.log([[tpx1, tpy1],[tpx2,tpy2], [tpx3,tpy3],[tpx4,tpy4]]);
		//			element.style(transform + "-origin",  ((ma+roompadding)*i)/2 + "px " + (rc.cols*(ma+roompadding))/2 + "px 0");
					//targetpoints[i] = [[xskew, (ma+roompadding)*i],[rc.cols*(ma+roompadding)-xskew, (ma+roompadding)*i], [0, ((ma+roompadding)*i)+ma-yskew],[rc.cols*(ma+roompadding), ((ma+roompadding)*i)+ma-yskew]];
					//targetpoints[i] = [[tpx1+xskew, tpy1],[tpx2-xskew,tpy2], [tpx3,tpy3-yskew],[tpx4,tpy4-yskew]];
					
					targetpoints[i] = [[tpx1+xskew, tpy1],[tpx2,tpy2], [tpx3,tpy3],[tpx4,tpy4]];
					
			});
		
			ptransforms.forEach(function(element, i){
				console.log(element);
				transformer(element, sourcepoints[i], targetpoints[i]);
			});
			
			/*d3.transition()
				.duration(750)
				.tween("points", function(){
					//create the iterators
					var iterators = [];
					
					ptransforms.forEach(function(element,i){
						iterators.push(d3.interpolate(sourcepoints[i], targetpoints[i]));
					});
					return function(t){
						ptransforms.forEach(function(element,i){
					  		transformer(element, sourcepoints[i], iterators[i](t));
					  	})
					}
			});*/
  		
  		},
  
  		floorselected = function(d){
  			if (selectedrooms != []){
  				selectedrooms = []
  				renderrooms();
  			}
  			
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
  			for (var i =0; i < selectedrooms.length; i++){
  				if (selectedrooms[i].id == room)
  					return true;
  			}
  			return false;
  		},
  		
  		
  		//intersect and union?
  		overlay = function(cback){

			d3.selectAll("g.room").selectAll("g.overlay").remove();
			
			var room = d3.selectAll("g.room")
  			  			 //.append("g")
  			  			 .insert("g", "rect.roomlabelcontainer")
			  		     .attr("class", function(d){return "overlay overlay_"+ d.id})
			  		     .attr("transform", function(d){return "translate(" + d.coords.x + "," + d.coords.y + ")"})		    
					     .call(cback);						
  		},
  		
  		//update the current rooms with additional ones
  		unionrooms  = function(rms){
  			
  			console.log("DOING A UNION ROOMS!!");
  			
  			d3.selectAll("rect.window").style("fill-opacity", 0.0);
  			selectedfloors = [];
  			renderfloors();
  			
  			//determine what level of zoom we're at?
			if (!rooms)
				return;
			
  			rms.forEach(function(room){
  				
  				if (rooms[room]){
					if (!roomselected(room)){
						console.log("ADDING ROOM ");
						console.log(room);
						selectedrooms.push(square(rooms[room]));
					}
  				}
  			});
  			console.log("ok selected rooms is now");
  			console.log(selectedrooms);
  			renderrooms();
  		},
  		
  		//re-initialise the chart with a set of rooms
  		refreshrooms = function(rooms){
  			
  			//set all data to empty
  			
  			selectedrooms = [];
  			renderrooms();
  			
  			selectedfloors = [];
  			renderfloors();
  			
  			
  			rooms.forEach(function(room){
  				if (roomdata[room]){
  				var floor = floorforid(roomdata[room].floor);
  					if (selectedfloors.indexOf(floor) == -1)
  						selectedfloors.push(floor);
  				}
  			});
  		
  			renderfloors();
  			
  			window.setTimeout(function(){
  					
  				//drag start
  				visiblerooms = [];
				selectedrooms = [];
				d3.selectAll("rect.room").style("fill", function(d){return delegate.colour(d.data["id"])})
				adjustfloorcoords();
				
				var roomnames = visiblerooms.map(function(item){
					return item.name;
				});
				
				//drag move		
				selectedrooms = visiblerooms.filter(function(item){
					return rooms.indexOf(item.name) != -1;
				});
				
				//drag end
				selectedfloors = [];
  				renderfloors();
  				d3.selectAll("rect.window").style("fill-opacity", 0.0)
  				renderrooms();
				
  			},500);
  				
  		},
  		
  		scalefactor = function(cols, rows, floor){
  		    var maxwidth = maxwidths[floor];
  			var w = maxaspect(cols,rows) - (2*roompadding) - (2*layoutpadding);
  			var scale = (w / maxwidth);
  			return scale;
  		},
  		
  		indexforid = function(id){
  			return parseInt(id)-1;
  		},
  		
  		roomclicked = function(d){
  			channel.publish({
					channel: 'taptap',
					message: d.id
			});	
  		},
  		
  		comp	 = function(label){
			//pull out all numbers in the string and return as Integer
			return Math.floor(label.match(/\d+$/)[0]);
		},
		
  		renderrooms = function(){
  			var layerlookup = {};
  			selectedrooms.sort(function(a,b){return (comp(a.id) > comp(b.id)) ? 1 : (comp(a.id) < comp(b.id)) ? -1 : 0})
  			
  			var rc 	=  rowscols(selectedrooms.length);
  			
  			var roomhw  =  maxaspect(rc.cols,rc.rows) - (2*roompadding);
  			var transx  =  function(d,i,j){return -(d.coords.x*(roomhw/d.coords.width)) +  ax(i,rc.rows,rc.cols)};
			var transy  =  function(d,i,j){return -(d.coords.y*(roomhw/d.coords.height)) + j *  maxaspect(rc.cols,rc.rows) + roompadding};
			var sfx     =  function (d){return roomhw/d.coords.width};
			var sfy     =  function (d){return roomhw/d.coords.height};
			var labelheight = function(d){return (maxaspect(rc.cols,rc.rows) - (2*roompadding)) / 5}
  			
  			
  			//create the matrix..
  			matrix = [];
			 
			for (var i = 0; i < selectedrooms.length; i++){
				if (!matrix[Math.floor(i/rc.cols)]){
					matrix[Math.floor(i/rc.cols)] = [];
				}
				matrix[Math.floor(i/rc.cols)].push(selectedrooms[i]);
				layerlookup[selectedrooms[i].id] = Math.floor(i/rc.cols);
			} 
		
				
			var layers = svg.select("g.apartmentdetail")
  						    .selectAll("g.layer")
						    .data(matrix, function(d){return (d.map(function (item){return item.id})).join("")});
										
										
			layers.selectAll("g.room")
  				.transition()
  				.duration(800)
  				.attr("transform", function(d,i,j){
  					var idx = selectedrooms.indexOf(d);
  					var t = d3.transform(d3.select(this).attr("transform"));
  					return "translate(" + transx(d,i,j) + "," + transy(d,i,j) +"),scale(" + sfx(d)  + "," + sfy(d) +")"
  				
  			});
  						
			
			var layer = layers
						.enter()
						.append("g")
						.attr("class", function(d,i){return "layer layer"+i})	
						
													  
			var roomline = layer.selectAll("line")
  		 						.data(function(d,i){return d})
								
			
			var room = roomline
								.enter()
								.append("g")
				  				.attr("class", "room")
								
			room.append("rect")
				.attr("class", function(d){return "apartment apartment_" + d.id})	
				.attr("x",function(d){return d.coords.x})
				.attr("y",function(d){return  d.coords.y})
				.attr("width", function(d){return d.coords.width})
				.attr("height", function(d){return d.coords.height})
				.style("fill", "red")
				.on("click", roomclicked)
				.transition()
				.duration(500)	
				.style("stroke-width", function(d){return 1/sfx(d)})
				.style("stroke", "black")
				.style("fill", "white")
				.each('end',function(){
					//fade in labels once the room rects have moved into place!
					 d3.selectAll("g.roomlabel")
					 	.transition()
					 	.duration(800)
					    .style("opacity", 1.0);
				})
			
			
			room.append("rect")
				 .attr("class", "roomlabelcontainer")
				 .attr("x",function(d,i){return d.coords.x})
				 .attr("y",function(d,i){return (d.coords.y + d.coords.height) - (d.coords.height/5) })	
				 .attr("width",function(d,i){return d.coords.width})
				 .attr("height", function(d){return d.coords.height/5})	
				 .style("stroke-width", function(d){return 1/sfx(d)})
				 .style("stroke", "black")
				 .style("fill", "#d78242")
				 .style("fill-opacity", 0.9)
			
			room.append("text")
				  .attr("class", "roomlabel")
				  .attr("dy", ".35em")
	  			  .attr("x",function(d,i){return d.coords.x + (d.coords.width/2)})
				  .attr("y",function(d,i){return (d.coords.y + d.coords.height) - ((d.coords.height/5)/2)})	
	  			  .attr("fill", "#000")
	  			  .attr("text-anchor", "middle")
	  			  .style("font-size", function(d){return (d.coords.height/5) + "px"})
	  			  .style("fill", "white")
	  			  .text(function(d){
	  			  		return delegate.roomtext(d.id);
	  			  })
	  			  	  
			room.transition()
				   .duration(800)
					.attr("transform", function(d,i){
						var j = layerlookup[d.id];	
						return "translate(" + transx(d,i,j) + "," + transy(d,i,j) +"),scale(" + sfx(d)  + "," + sfy(d) +")"
					});
			
			
			layers.exit()
					.remove();
	
			roomline.exit()
					.remove();
			
			//perspective();
			//window.setTimeout(perspective, 1000);
  		},
    			
  		renderrooms_old = function(){
  			
  			
  			selectedrooms.sort(function(a,b){return (a.id > b.id) ? 1 : (a.id < b.id) ? -1 : 0})
  			
  			var rc 		=  rowscols(selectedrooms.length);
  			var roomhw  =  maxaspect(rc.cols,rc.rows) - (2*roompadding);
  			var transx  =  function(d,i){return -(d.coords.x*(roomhw/d.coords.width)) +  ax(i,rc.rows,rc.cols)};
			var transy  =  function(d,i){return -(d.coords.y*(roomhw/d.coords.height)) + ay(i,rc.rows,rc.cols)};
			var sfx     =  function (d){return roomhw/d.coords.width};
			var sfy     =  function (d){return roomhw/d.coords.height};
			var labelheight = function(d){return (maxaspect(rc.cols,rc.rows) - (2*roompadding)) / 5}
  			
  			var rooms  	= svg.select("g.apartmentdetail")
  							 .selectAll("g.room")
  							 .data(selectedrooms, function(d,i){return d.id})
  			
  			
  			//hmmm - think translate makes new additions hard. might be better to move coords explicitly
  			
  			
  			//note that we can't just append labels to the rooms g container as when the translate
  			//occurs it'll screw up the fonts. Instead we bind to selectedrooms again and update 
  			//coords directly
  			
  			var labels  = svg.select("g.apartmentdetail")
  							 .selectAll("g.roomlabel")
  							 .data(selectedrooms, function(d,i){return d.id})
  			
  			//handle old rooms
  			svg.selectAll("g.room")
  				.transition()
  				.duration(800)
  				.attr("transform", function(d,i){
  					var idx = selectedrooms.indexOf(d);
  					var t = d3.transform(d3.select(this).attr("transform"));
  					return "translate(" + transx(d,idx) + "," + transy(d,idx) +"),scale(" + sfx(d)  + "," + sfy(d) +")"
  				
  				})
			
  			svg.selectAll("rect.apartment")
  				.style("stroke-width", function(d){return 1/sfx(d)})
  			
  			svg.selectAll("rect.roomlabelcontainer")
  				 .transition()
  				 .duration(800)
				 .attr("x",function(d,i){return ax(selectedrooms.indexOf(d),rc.rows,rc.cols)})
				 .attr("y",function(d,i){return ay(selectedrooms.indexOf(d),rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)})	
				 .attr("width",function(d,i){return maxaspect(rc.cols,rc.rows) - (2*roompadding)})
				 .attr("height", function(d){return labelheight(d)})
  			
  			 svg.selectAll("text.roomlabel")
  			 	 .transition()
  				 .duration(800)
  			 	 .attr("x",function(d,i){return ax(selectedrooms.indexOf(d),rc.rows,rc.cols) +  (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2})
				 .attr("y",function(d,i){return (ay(selectedrooms.indexOf(d),rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)) + labelheight(d)/2})	
	  			 .style("font-size", function(d){return 0.8*labelheight(d) + "px"})
  			
  			//handle new rooms					 	
  			var window = rooms
						.enter()
						.append("g")
						.attr("class", "room")
				
			window.append("rect")
				.attr("class", function(d){return "apartment apartment_" + d.id})	
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
					 	.duration(800)
					    .style("opacity", 1.0);
				});
			
			
			window.transition()
				.duration(1000)
				.attr("transform", function(d,i){return "translate(" + transx(d,i) + "," + transy(d,i) +"),scale(" + sfx(d)  + "," + sfy(d) +")"})
			
			//handle new labels
			
			var label = labels
						.enter()
						.append("g")
						.attr("class", "roomlabel")	
						.attr("opacity", 0.0)
						
			label.append("rect")
				 .attr("class", "roomlabelcontainer")
				 .attr("x",function(d,i){return ax(i,rc.rows,rc.cols)})
				 .attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)})	
				 .attr("width",function(d,i){return maxaspect(rc.cols,rc.rows) - (2*roompadding)})
				 .attr("height", function(d){return labelheight(d)})	
				 .style("stroke-width", function(d){return 1})
				 .style("stroke", "black")
				 .style("fill", "#d78242")
				 .style("fill-opacity", 0.9)
			
			
			label.append("text")
				  .attr("class", "roomlabel")
				  .attr("dy", ".35em")
	  			  .attr("x",function(d,i){return ax(i,rc.rows,rc.cols) +  (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2})
				  .attr("y",function(d,i){return (ay(i,rc.rows,rc.cols) + (d.coords.height*sfy(d)) - labelheight(d)) + labelheight(d)/2})	
	  			  .attr("fill", "#000")
	  			  .attr("text-anchor", "middle")
	  			  .style("font-size", function(d){return 0.8*labelheight(d) + "px"})
	  			  .style("fill", "white")
	  			  .text(function(d){
	  			  		return delegate.roomtext(d.id);
	  			  })
	  		  	
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
  					  .attr("width",  maxaspect(rc.cols,rc.rows) - (2*roompadding))
  					  .attr("height", maxaspect(rc.cols,rc.rows) - (2*roompadding))
  					   
  			apartments.select("circle")
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("cx",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2 })
					.attr("cy",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))})	
			
			apartments.select("text")
					
  					.transition()
  					.duration(TRANSITIONDURATION)
  					.attr("x",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2 })
					.attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))})	
	  				
		
	  		
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
					.attr("width", maxaspect(rc.cols,rc.rows) - (2*roompadding))
					.attr("height", maxaspect(rc.cols,rc.rows) - (2*roompadding))	
					.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", "#d78242")
					.style("fill-opacity", 0)
						
				apt.append("circle")
					.attr("class", "floorlabel")
					.attr("cx",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2})
					.attr("cy",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))})	
					.attr("r", labelradius)
					.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", "white")
			
				apt.append("text")
					.attr("class", "floortext")
					.attr("dy", ".35em")
	  				.attr("x",function(d,i){return ax(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))/2})
					.attr("y",function(d,i){return ay(i,rc.rows,rc.cols) + (maxaspect(rc.cols,rc.rows) - (2*roompadding))})	
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
												
													return "room room_" + rooms[d.data.id].id; 
													
												}
												return "floorplan";
											   })
											   
    				.attr("x",function(d,i){return d.x})
					.attr("y",function(d,i){return d.y})	
					.attr("width", function(d){return d.width})
					.attr("height",function(d){return d.height})
    				.style("stroke-width", 1)
					.style("stroke", "black")
					.style("fill", function(d){return delegate.colour(d.data["id"])})
					//.on("click", function(d,i){flooritemclicked(d,d3.select(this.parentNode).datum())})	
		
		
    		//remove old!	  
    				  
  					
  			apartments
  					  .exit()
  					  .transition()
  					  .duration(200)
  					  .style("opacity",0)
  					  .transition()
  					  .duration(200)
  					  .remove()
  					  
  			floorplans
  					  .exit()
  					  .transition()
  					  .duration(200)
  					  .style("opacity",0)
  					  .transition()
  					  .duration(200)
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
	  	
	  	
	  	setdelegate = function(d){
	  		delegate = d;
	  	},
	  	
	  	
	  	transformer = function(el, layerSourcePoints, layerTargetPoints){
			for (var a = [], b = [], i = 0, n = layerSourcePoints.length; i < n; ++i) {
					var s = layerSourcePoints[i], t = layerTargetPoints[i];
					a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
					a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);
			}
			
			var X = solve(a, b, true), matrix = [
					X[0], X[3], 0, X[6],
					X[1], X[4], 0, X[7],
					0,    0, 1,    0,
					X[2], X[5], 0,    1
				].map(function(x) {
					return d3.round(x, 6);
			});
			
			console.log(matrix);
			el.style(transform, "matrix3d(" + matrix + ")");
		},
		
		// Given a 4x4 perspective transformation matrix, and a 2D point (a 2x1 vector),
		// applies the transformation matrix by converting the point to homogeneous
		// coordinates at z=0, post-multiplying, and then applying a perspective divide.
		project = function(matrix, point) {
		  point = multiply(matrix, [point[0], point[1], 0, 1]);
		  return [point[0] / point[3], point[1] / point[3]];
		},

		// Post-multiply a 4x4 matrix in column-major order by a 4x1 column vector:
		// [ m0 m4 m8  m12 ]   [ v0 ]   [ x ]
		// [ m1 m5 m9  m13 ] * [ v1 ] = [ y ]
		// [ m2 m6 m10 m14 ]   [ v2 ]   [ z ]
		// [ m3 m7 m11 m15 ]   [ v3 ]   [ w ]
		multiply = function(matrix, vector) {
		  return [
			matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8 ] * vector[2] + matrix[12] * vector[3],
			matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9 ] * vector[2] + matrix[13] * vector[3],
			matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
			matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3]
		  ];
		},
	  	
	  	
	  	subscribe = function(chnl){	
	  	
	  		
			channel.subscribe({
				channel: 'photo',
				message: function(m){
					
					var el = d3.select("g.room").select("rect.apartment");
					var x = el.attr("x");
					var y = el.attr("y");
					var width = el.attr("width");
					var height = el.attr("height");
					
					d3.select("g.room")
						.append("svg:image")
						.attr("x", x)
						.attr("y", y)
						.attr("width", width)
						.attr("height", height)
						.attr("xlink:href",m);
						
				}
			});	
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
  				if (error) 
  					return console.warn(error);
  				
  				var buildingdata = json.floors;
  				
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
					
					if (error) 
						return console.warn(error);
  					
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
					
					
					
					apartmentrects.forEach(function(rects){
  						rects.forEach(function(item){
  							//console.log(item);	
  							if (item.data.type == "room"){
  								rooms[item.data.id] = {"id":item.data.id, "coords":{x:item.x,y:item.y,width:item.width,height:item.height}};
  								if (floors[item.data.floor] == undefined){
  									floors[item.data.floor] = [];
  								}
  								floors[item.data.floor].push({"id":item.data.id});
  							}
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
  					renderbuilding(buildingdata);
  					subscribe();
  				
				});
			});
		
	  		//d3.select(window).on('resize', resize);
	  	}

	return {
		init:init,
		floorforid: floorforid,
		floorselected:floorselected,
		refreshrooms:refreshrooms,
		unionrooms:unionrooms,
		overlay:overlay,
		setdelegate: setdelegate,
		perspective: perspective,
	}

});
