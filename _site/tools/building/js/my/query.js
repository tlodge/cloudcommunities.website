define(['jquery','d3','d3building','pubnub'], function($,d3,building,pubnub){
	"use strict"
	
	var
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		roomindex = 0,
		
		roomstoadd = [ ["b.1.1"], ["b.2.2", "b.4.1"], ["b.8.1"], ["b.8.2"], ["b.8.3"],["b.2.1"], ["b.1.2"]],
		
		datatimer,
		//roomstoadd = [ ["b.1.2"], ["b.1.1"]],
		
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
			console.log(elements);
		},
		
		addanotherroom = function(){
			if (roomindex < roomstoadd.length){
				building.unionrooms(roomstoadd[roomindex]);	
				datatimer = window.setTimeout(addanotherroom, 1000);
				roomindex+=1;
			}else{
				roomindex = 0;
				
				/*var detached = d3.select(document.createElement("g"))
				
				detached.append("circle")
					 .attr("cx", 14)
					 .attr("cy", 70)
					 .attr("r",10)
					 .style("fill", "#000")
					 .style("stroke", "000");*/
					 
				//assume room is a 10x10 grid
				building.overlay([{"type":"circle", "attr":{"cx":5,"cy":5,"r":5}, callback:setdimensions}]);
				datatimer = window.setTimeout(updatedata, 1000);
				//how do we update the data and know what we're updating??
				
			}
		},
		
		updatedata = function(){
			d3.selectAll("circle.overlay")
				.transition()
				.duration(400)
				.attr("r", function(d){return 1 + Math.random() * 35} )
		
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
		
		init = function(datasource){
			datasource.bind(function(event, item){
				window.clearTimeout(datatimer);
				
				if (item.type == "select"){	
	  				console.log("nice have seen something!!");
	  				console.log(item);
	  				datatimer = window.setTimeout(addanotherroom, 1000);
	  			}
	  		});
		}

	return {
		subscribe:subscribe,
		init: init,
	}
});