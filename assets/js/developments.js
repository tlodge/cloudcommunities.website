define(['knockout','ajaxservice', "knockoutpb"], function(ko,ajaxservice){
	
	var
		developments = ko.observableArray([]),
		
		selecteddevelopments = ko.observableArray([]),
	
		init = function(){
			ajaxservice.ajaxGetJson('developments', {} , function(result){
				developments(result.developments);
			});
		},
		
		selectdevelopment = function(development){
			ko.postbox.publish("development", development);
			//update(development);
			
			if (selecteddevelopments.indexOf(development) < 0){
				selecteddevelopments.push(development);
			}else{
				selecteddevelopments.remove(development);
			}
		}
		
		
		return{
			init: init,
			developments:developments,	
			selectdevelopment: selectdevelopment,
			selecteddevelopments: selecteddevelopments
		}
		
});