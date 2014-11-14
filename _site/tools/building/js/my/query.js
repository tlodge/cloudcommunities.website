define(['jquery','d3building','pubnub'], function($,building,pubnub){
	"use strict"
	
	var
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		subscribe = function(chnl){
			channel.subscribe({
				channel: chnl,
				message: function(m){
					var floor = building.floorforid(m.floor);
					if (floor != null){
						building.roomselected("b.1.1");
						//building.floorselected(floor);
					}
				}
			});	
		},
		
		query = function(qobj){
		
		}

	return {
		subscribe:subscribe
	}
});