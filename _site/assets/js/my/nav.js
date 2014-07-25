define(['knockout', 'knockoutpb'], function(ko){
	var 
	
		menuitems = ko.observableArray([	
										{name:'home', section:'home'},
										{name:'summary', section:'root'},
										{name:'categories', section:'catdetail'},
										{name:'sentiment',section:'sentiment'}
										]),
		
		amactive = function(sec){
			return section() == sec;
		},
								
		section = ko.observable().syncWith("section")
		
		
	return{
		menuitems:menuitems,
		section:section,
		amactive:amactive
	}
});