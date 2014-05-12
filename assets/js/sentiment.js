define(['knockout','d3', 'ajaxservice', 'knockoutpb'], function(ko,d3,ajaxservice){
	
	var
		section = ko.observable().syncWith("section"),
		
		sentimentvisible = ko.computed(function(){
			return section() == "sentiment";
		})
		
	return{
		section:section,
		sentimentvisible:sentimentvisible,
	}

});