define(['jquery'], function($){

	"use strict";
	
	var 
	
		shuffle = function(o){
    		for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
   		  	return o;
		},
		
		generatepath = function(pobj){
	  		return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";
	  	},
	  	
	  	rightroundedrect = function(x,y,w,h,r){
	  		 return "M" + x + "," + y
						+ "h " + (w - r) + " " 
						+ "a " + r + "," + r + " 0 0 1 " + r + "," + r + " "
						+ "v " + (h - 2 * r) + " "
						+ "a " + r + "," + r + " 0 0 1 " + -r + "," + r + " "
						+ "h " + (r - w)
						+ "z";
	  	},
	  	
	    leftroundedrect = function(x,y,w,h,r){
	  		 return "M" + x + "," + y
	  		 			+ " a " + r + " " + r + ", 1, 0, 0," + (-r) + " " + r
						+ "v " + (h - 2 * r) + " "
						+ " a " + r + " " + r + ", 1, 0, 0," + r + " " + r
						+ " h " + w
						+ " v " +  -(h) + " "
						+ "z";
	  	},
	  	
	  	toproundedrect = function(x,y,w,h,r){
	  		 return "M" + x + "," + y
	  		 			+ " a " + r + " " + r + ", 1, 0, 0," + (-r) + " " + r
						+ "v " + h + " "
						+ " h " + w
						+ "v " + (-h) + " "
						+ " a " + r + " " + r + ", 1, 0, 0," + -r + " " + (-r)
						+ "z";
	  	},
	  	
	
		//scale and relative translate
		transformpath = function(pobj, transforms){
	  		
	  		pobj.width	 = 0;
	  		pobj.height	 = 0;
	  		pobj.minx 	 =  999999;
	  		pobj.miny 	 =	999999;
	  		pobj.maxx 	 = 0;
	  		pobj.maxy    = 0;
	  		
	  	
	  		//scale...
	  		pobj.path.forEach(function(path){
	  		
	  			path['xcomp'] = path['xcomp'].map(function(item){
	  				return item * transforms['scalex'];
	  			});	
	  			path['ycomp'] = path['ycomp'].map(function(item){
	  				return item * transforms['scaley'];
	  			});	
	  		});
	  		
	  		
	  		//translate
	  		pobj.path.forEach(function(path){
	  			
	  			path['xcomp'] = path['xcomp'].map(function(item){
	  				return item + transforms['transx'];
	  			});	
	  			path['ycomp'] = path['ycomp'].map(function(item){
	  				return item + transforms['transy'];
	  			});	
	  			
	  			pobj.maxx = Math.max(pobj.maxx, path['xcomp'].reduce(function(x,y){return Math.max(x,y)}));
  				pobj.maxy = Math.max(pobj.maxy, path['ycomp'].reduce(function(x,y){return Math.max(x,y)}));
	  			pobj.minx = Math.min(pobj.minx, path['xcomp'].reduce(function(x,y){return Math.min(x,y)}));
  				pobj.miny = Math.min(pobj.miny, path['ycomp'].reduce(function(x,y){return Math.min(x,y)}));
  				pobj.width = pobj.maxx - pobj.minx;
  				pobj.height = pobj.maxy - pobj.miny;
	  		});
	  		
	  		
	  		
	  		return pobj;
	  		/*return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";*/
	  	}
	  	
	return {
		generatepath: generatepath,
		transformpath:transformpath,
		rightroundedrect:rightroundedrect,
		leftroundedrect:leftroundedrect,
		toproundedrect:toproundedrect,
		shuffle: shuffle
	}
});