define(['jquery'], function($){

	var 
	
		generatepath = function(pobj){
	  		return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";
	  	}
	
		//scale and relative translate
		transformpath = function(pobj, transforms){
	  		
	  		pobj.width = 0;
	  		pobj.height = 0;
	  		
	  		//scale...
	  		pobj.path.forEach(function(path){
	  		
	  			path['xcomp'] = path['xcomp'].map(function(item){
	  				return item * transforms['scalex'];
	  			});	
	  			path['ycomp'] = path['ycomp'].map(function(item){
	  				return item * transforms['scaley'];
	  			});	
	  			
	  			pobj.width  = Math.max(pobj.width, path['xcomp'].reduce(function(x,y){return Math.max(x,y)}));
  				pobj.height = Math.max(pobj.height, path['ycomp'].reduce(function(x,y){return Math.max(x,y)}));
	  			
	  		});
	  		
	  		
	  		//translate
	  		pobj.path.forEach(function(path){
	  			
	  			path['xcomp'] = path['xcomp'].map(function(item){
	  				return item + transforms.transx;
	  			});	
	  			path['ycomp'] = path['ycomp'].map(function(item){
	  				return item + transforms.transy;
	  			});	
	  			
	  			pobj.width  = Math.max(pobj.width, path['xcomp'].reduce(function(x,y){return Math.max(x,y)}));
  				pobj.height = Math.max(pobj.height, path['ycomp'].reduce(function(x,y){return Math.max(x,y)}));
	  			
	  		});
	  		
	  		
	  		return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";
	  	}
	  	
	return {
		generatepath: generatepath,
		transformpath:transformpath
	}
});