define(['jquery','d3','util','pubnub','ramda'], function($,d3,util,pubnub,R){
	"use strict"
	
	var
		building,
		
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		roomindex = 0,
		
		//roomstoadd = [ ["b.1.1"], ["b.2.2", "b.4.1"], ["b.8.1"], ["b.8.2"], ["b.8.3"],["b.2.1"], ["b.1.2"]],
		
		//roomstoadd = [ "b.1.1", "b.2.2", "b.4.1", "b.8.1", "b.8.2", "b.8.3","b.2.1", "b.1.2"],
		
		roomstoadd = ["a1", "a3", "a7", "a9", "a11", "a15"],
		
		datatimer,
		
		subscribe = function(chnl){			
			channel.subscribe({
				channel: chnl,
				message: function(m){
					if (m.type == "list"){
						if (m.command == "init"){
							building.unionrooms(roomstoadd);
							building.overlay(listcback);	
						}
						if (m.command == "update"){
							var list = m.attr.list;
							var room = m.attr.room; 
							updatelistforroom(room,list);
						}
					}
				}
			});	
		},
		
		setdimensions = function(elements){
			
		},
		
		addanotherroom = function(){
			if (roomindex < roomstoadd.length){
				building.unionrooms(roomstoadd[roomindex]);	
				datatimer = window.setTimeout(addanotherroom, 1000);
				roomindex+=1;
			}else{
				roomindex = 0;
				building.overlay([{"type":"circle", "attr":{"cx":5,"cy":5,"r":5}, callback:setdimensions}]);
				datatimer = window.setTimeout(updatedata, 1000);
				//how do we update the data and know what we're updating??
				
			}
		},
		
		updatedata = function(){
			var randomdata = {};

			//generate some new test scale factors for all data
			d3.selectAll("rect.apartment")
				.each(function(d){
					randomdata[d.id] = 0.1 + (Math.random()*0.9);
				});
				
			
			d3.selectAll(".overlayitem")
				
				.transition()
				.duration(400)
				.attr("transform", function(d){
						//get the rect bounding box to figure out coords - can then work out translation.
						//get rect.apartment.id to get the width,height, which we can then use to scale!.
						//don't need x,y as normalised to 0,0 with g transform
						var bb = d3.select("rect.apartment_"+d.id);
						var scalefactor = randomdata[d.id];
						var x =  bb.attr("width")/2;
						var y =  bb.attr("height")/2;
						var transx = x - (x * scalefactor);
						var transy = y - (y * scalefactor);		
						return "translate(" + transx +"," + transy+"),scale(" + scalefactor + ")"
						
				}).attr("stroke-width", function(d){
					var scalefactor = randomdata[d.id];
					return 0.5/scalefactor;
				});
						
			datatimer = window.setTimeout(updatedata, 1000);
		},
		
		
		refreshanotherroom = function(){
			if (roomindex < roomstoadd.length){
				building.refreshrooms(roomstoadd[roomindex]);	
				datatimer = window.setTimeout(refreshanotherroom, 1000);
				roomindex+=1;
			}else{
				roomindex = 0;
			}
		},
		query = function(qobj){
		
		},
		
		circlescback = function(rooms){
		
			rooms.append("circle")
				.attr("class", function(d){return "overlayitem overlay_"+d.id})
				.attr("cx", function(d){return  d.coords.width/2})
  			  	.attr("cy", function(d){return  d.coords.height/2})
  			  	.attr("r",  function(d){return d.coords.height/2;})
				.style("fill", "white")
				.style("stroke", "black");
				
			updatedata();
		},
		
		heartscback = function(heart, rooms){
			rooms.append("path")
					.attr("class",function(d){return "overlayitem overlay_"+d.id})
					.attr("d", function(d){
						var transforms = {
	  						scalex: d.coords.width/heart.width,
	  						scaley: d.coords.height/heart.height,
	  						transx: 0,
	  						transy: 0,
	  					}
						return  util.transformpath(heart, transforms);
					})
					.style("fill", "#fff")
					.style("stroke", "#000")
			updatedata();
		},
		
		updategraphdata = function(){
			
			d3.selectAll("g.overlay")
				.each(function(room){
				
					var w = room.coords.width;
					var h = room.coords.height;
					var data = [];
					
					for (var j = 0; j < 25; j++) {			 
						data.push(Math.random() * 30);
					}
					
					var max = d3.max(data);
					
					var bars = d3.select(this)
						.selectAll("rect.bar")
						.data(data)
					
					bars.transition()
						.duration(500)
						.attr("y",function(d,i){return d/max * h})
						.attr("height",function(d,i){return h - (d/max * h)})
						
						
				});
				
				datatimer= window.setTimeout(updategraphdata, 2000);
		},
		
		
		
		updatelistforroom = function(room, data){
			d3.selectAll("g.overlay_" + room)
				.each(function(room){
					var h = room.coords.height;
					
					var listitems = d3.select(this)
						.selectAll("g.listitem")
						.data(data, function(d,i){return d})
					
					listitems
						.transition()
						.duration(500)
						.attr("transform", function(d,i){return "translate(0," +  (i * (h/data.length)) + ")";});
					
					listitems.select("text.position")
					  	.text(function(d,i){
							return i+1;
					});
				});
		},
		
		updatelistdata = function(){
			//var colours = {"greggs":"#9c27b0", "coop":"#00bcd4", "tesco":"#e91e63",  "asda":"#cddc39",  "birds":"#ff5722"};
			var colours = {"greggs":"#9c27b0", "coop":"#cddc39", "tesco":"#ff5722",  "asda":"#00bcd4",  "birds":"#00bcd4"};
			
			d3.selectAll("g.overlay")
				.filter(function(item){return Math.random() > 0.75})
				.each(function(room){
					var data = util.shuffle(["greggs", "coop","tesco", "asda", "birds"]);
					var h = room.coords.height;
					
					var listitems = d3.select(this)
						.selectAll("g.listitem")
						.data(data, function(d,i){return d})
					
					listitems
						.transition()
						.duration(500)
						.attr("transform", function(d,i){return "translate(0," +  (i * (h/data.length)) + ")";});
					
					listitems.select("text.position")
					  	.text(function(d,i){
							return i+1;
					  	});
				});
				datatimer= window.setTimeout(updatelistdata, 2000);
		},
		
		listcback = function(rooms){
		
			//var colours = {"greggs":"#9c27b0", "coop":"#00bcd4", "tesco":"#e91e63",  "asda":"#cddc39",  "birds":"#ff5722"};
			var colours = {"greggs":"#9c27b0", "coop":"#cddc39", "tesco":"#ff5722",  "asda":"#e91e63",  "birds":"#00bcd4"};
			
			rooms.each(function(room,i){
				var w = room.coords.width;
				var h = room.coords.height;
				var data = util.shuffle(["greggs", "coop","tesco", "asda", "birds"]);
				
				var listitem =	d3.select(this)
									.selectAll("bar")
									.data(data, function(d,i){return d})
									.enter()
									.append("g")
									.attr("class", "listitem")
									.attr("transform", function(d,i){return "translate(0," +  (i * (h/data.length)) + ")"})
						
				listitem.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", function(d, i){return w})
						.attr("height", function(d,i){return (h/data.length)})
						.style("fill", function(d,i){return colours[d]})
				
				listitem.append("circle")
						.attr("cx", h/data.length/2)
						.attr("cy", h/data.length/2)
						.attr("r",  h/data.length/3)
						.style("fill", "black")
						.style("stroke", "white")
						.style("stroke-width", 0.5)
				
				
				listitem.append("text")
					   .attr("class","position")
					  .attr("dy", ".35em")
					  .attr("x",h/data.length/2)
					  .attr("y",h/data.length/2)	
					  .attr("fill", "#000")
					   .attr("text-anchor", "middle")
					  .style("font-size", (h/data.length/2) + "px")
					  .style("fill", "white")
					  .text(function(d,i){
							return i+1;
					  })
					  
				listitem.append("text")
					  .attr("dy", ".35em")
					  .attr("x",h/data.length)
					  .attr("y",h/data.length/2)	
					  .attr("fill", "#000")
					  .style("font-size", (h/data.length/2) + "px")
					  .style("fill", "white")
					  .text(function(d){
							return d;
					  })
			
			});
			
			//datatimer= window.setTimeout(updatelistdata, 2000);
		},
		
		graphcback = function(rooms){
			
			rooms.each(function(room,i){
				var w = room.coords.width;
				var h = room.coords.height;
				var data = [];
				
				for (var j = 0; j < 25; j++) {			 
					data.push(Math.random() * 30);
				}
				
				var max = d3.max(data);
				
				d3.select(this)
						.selectAll("bar")
						.data(data)
						.enter()
						.append("rect")
						.attr("class", "bar")
				 		.attr("x",function(d,i){return  (w / data.length) * i})
				 		.attr("y",function(d,i){return d/max * h})
				 		.attr("width",  function(d,i){return (w / data.length)})
				 		.attr("height",function(d,i){return h - (d/max * h)})
				 		.style("fill","#00aad4")
				 		.style("stroke","#00aad4")
				 		.style("fill-opacity",0.6)
				 		.style("stroke-opacity",1)
				 		.style("stroke-width", 0.5);
				
			});
			updategraphdata();		
		},
		
		init = function(datasource, b){
			
			building = b;
			
			d3.json("data/heart.json", function(error, json){
  				if(error)
  					console.warn(error);
  					
  				var heart = json[0];
  				
  				datasource.bind(function(event, item){
				
					window.clearTimeout(datatimer);
					
					if (item.source == "filter"){
						building.unionrooms(roomstoadd);
					}
					else if (item.source == "data"){	
						
						/*d3.selectAll("rect.apartment")
							.transition()
							.duration(500)
							.style("opacity",0);
						
						d3.selectAll("g.roomlabel")
							.transition()
							.duration(500)
							.style("opacity",0);*/	
						
							
						if (item.type=="select"){
							if (item.data.id == 1){
								building.overlay(circlescback);	
							}
							else if (item.data.id == 2){
								building.overlay(listcback);	
							}
							else if (item.data.id == 3){
								building.overlay(R.curry(heartscback)(heart));	
							}else if (item.data.id > 3){
								building.overlay(graphcback);	
							}	
						}else{
							/*d3.selectAll("rect.apartment")
								.transition()
								.duration(500)
								.style("opacity",1.0);
							d3.selectAll("g.roomlabel")
								.transition()
								.duration(500)
								.style("opacity",1.0);*/
						}
					}
	  			});
  			});
		}

	return {
		subscribe:subscribe,
		init: init,
	}
});