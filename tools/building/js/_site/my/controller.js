define(['jquery','d3','util','pubnub'], function($,d3,util,pubnub){
	"use strict"
	
	var
		building,
		
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		roomindex = 0,
		
		//roomstoadd = [ ["b.1.1"], ["b.2.2", "b.4.1"], ["b.8.1"], ["b.8.2"], ["b.8.3"],["b.2.1"], ["b.1.2"]],
		
		roomstoadd = [ "b.1.1", "b.2.2", "b.4.1", "b.8.1", "b.8.2", "b.8.3","b.2.1", "b.1.2"],
		
		datatimer,
		
		subscribe = function(chnl){			
			/*channel.subscribe({
				channel: chnl,
				message: function(m){
					var floor = building.floorforid(m.floor);
					if (floor != null){
						//building.refreshrooms();
						//building.floorselected(floor);
						window.setTimeout(addanotherroom, 1000);
					}
				}
			});*/	
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
		
		init = function(datasource, b){
			
			building = b;
			
			d3.json("data/heart.json", function(error, json){
  				if(error)
  					console.warn(error);
  					
  				var heart = json[0];
  				
  				datasource.bind(function(event, item){
				
					window.clearTimeout(datatimer);
					
					if (item.source == "filter"){
						building.perspective();
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
						
						//building.unionrooms(roomstoadd);	
						if (item.type=="select"){
							if (item.data.id == 3){
								building.overlay({"type":"path", "attr":heart, callback:setdimensions});
							}
							else{
								building.overlay({"type":"circle", "attr":{}, callback:setdimensions});
							}
							updatedata();
						
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