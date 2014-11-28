define(['jquery', 'ramda', 'pubnub'], function($,R, pubnub){

	"use strict";
	
	var
	
		channel = PUBNUB.init({
			publish_key: 'pub-c-5ee6dec5-e3fe-4454-b7ea-fd95dc2d9702',
			subscribe_key: 'sub-c-8a8c2a78-6b54-11e4-bf8f-02ee2ddab7fe'
		}),
	
		context,
		canvas,
		
		hasGetUserMedia = function(){
		  return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia || navigator.msGetUserMedia);
		},
		
		subscribe = function(chnl){			
			channel.subscribe({
				channel: 'taptap',
				message: function(m){
					console.log("seen a tap tap!");
					console.log(m);
					takepicture();
				}
			});	
		},
		
		compressImage = function(canvas, size) {
			var compression = 1.0;
			while(compression > 0.01) {
				var dataURL = canvas.toDataURL('image/jpeg', compression);
				if (dataURL.length/1012 < size) return dataURL;
					if (compression <= 0.1) {
					compression -= 0.01;
				} else {
					compression -= 0.1;
				}
			}
			return null;
		},

		setup = function(){
			
			
			canvas = document.getElementById("canvas");
			context = canvas.getContext("2d");
			
			var video = document.getElementById("video");
			var videoObj = { "video": true };
			
			var errBack = function(error) {
				console.log("Video capture error: ", error.code); 
			};

			// Put video listeners into place
			if(navigator.getUserMedia) { // Standard
				navigator.getUserMedia(videoObj, function(stream) {
					video.src = stream;
					video.play();
				}, errBack);
			} else if(navigator.webkitGetUserMedia) { // WebKit-prefixed
				navigator.webkitGetUserMedia(videoObj, function(stream){
					video.src = window.webkitURL.createObjectURL(stream);
					video.play();
				}, errBack);
			}
			else if(navigator.mozGetUserMedia) { // Firefox-prefixed
				navigator.mozGetUserMedia(videoObj, function(stream){
					video.src = window.URL.createObjectURL(stream);
					video.play();
				}, errBack);
			}
		},
		
		takepicture = function(){
			
			context.drawImage(video, 0, 0, 640, 480);
			var dataURL = compressImage(canvas, 20);
 
			if (dataURL == null) {
				alert("We couldn't compress the image small enough");
				return;
			}
			
			channel.publish({
					channel : "photo",
					message : dataURL,
					error : function(error){console.log(error)}
			});
		},
		
		init = function(){
			if (hasGetUserMedia()) {
		  		setup();
			} else {
		  		alert('getUserMedia() is not supported in your browser');
		  		return;
			}
			
			$("#video").width( $(document).width());
			$("#video").height( $(document).height());
			subscribe();
			
			
			//document.getElementById("snap").addEventListener("click", function() {
			//	console.log("ok seen button press!");
			//	takepicture();
			//});
			
		}
	
	return{
		init: init
	}
	
});