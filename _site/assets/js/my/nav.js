define(['knockout', 'knockoutpb'], function(ko){
	var 
		rootvisible = true,
	
		togglerootvisible = function(){
			rootvisible = !rootvisible;
			ko.postbox.publish("rootvisible", rootvisible);	
		}	
		
	return{
		togglerootvisible:togglerootvisible
	}
}