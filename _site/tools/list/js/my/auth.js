define(['jquery', 'pubnub'], function($,pubnub){

	"use strict";

	var 
	
		channel = PUBNUB.init({
				publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
				subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
		
		authenticate = function(keys){
	   		
	   		channel.publish({
					channel: 'list',
					message: {"floor":keys[0]}
			});	
	   				
	   		return true;
	   	}
		
	return{
	 	authenticate:authenticate
	}
});