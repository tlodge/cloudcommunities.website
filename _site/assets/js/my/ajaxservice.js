define(['jquery'], function($){
    var
    
    	intercept = function(route,parameters){
    		switch (route){
    			case 'posts':
    				return '../../assets/data/barbicanposts/posts.json';
    				break;
    			case 'categorylist':
    				return '../../assets/data/categorylist.json';
    				break;
    			case 'categories':
    				return '../../assets/data/barbicanposts/categories.json';
    				break;
    			case 'subcategories':
    				var cat = parameters.category.replace(" ", "_")
    				return '../../assets/data/barbicanposts/' + cat + '/summary.json';
    			case 'subcategory':
    				var toreplace = ("()\/ ")
    				var cat = parameters.category.replace(" ", "_")
    				var subcat = parameters.subcategory;
    				
    				for (i = 0; i < toreplace.length; i++)
    					subcat = subcat.replace(toreplace[i], "_")
    				
    				return '../../assets/data/barbicanposts/' + cat + '/' + subcat + '/summary.json';
    				
    				
    				
    			default:
    				return route;
    		}
    		//'posts':'../../assets/data/barbicanposts/posts.json',
    		//'categorylist':'../../assets/data/categories.json'
    	},
    	
        ajaxPostJson = function(url, jsonIn, success_callback, error_callback){
            $.ajax({
                    url: url,
                    //contentType: 'application/x-www-form-urlencoded',
                    type: "POST",
                    data: jsonIn,
                    dataType: 'json',
                    success: function(result){
                        success_callback(result)    
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        if (error_callback){
                            error_callback(XMLHttpRequest, textStatus, errorThrown);
                        }       
                    }
            });
        }
    
        ajaxGetJson = function(url, jsonIn, success_callback, error_callback){
           
            $.ajax({
                    url: intercept(url,jsonIn),
                    //contentType: 'application/x-www-form-urlencoded',
                    type: "GET",
                    data: jsonIn,
                    timeout: 4000,
                    dataType: 'json',
                    
                    success: function(result){
                        success_callback(result)    
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown){
                        if (error_callback){
                            error_callback(XMLHttpRequest, textStatus, errorThrown);
                        }       
                    }
            });
        }
        
        return{
            ajaxPostJson: ajaxPostJson,
            ajaxGetJson: ajaxGetJson
        }
});

