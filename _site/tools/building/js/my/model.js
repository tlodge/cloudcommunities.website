define(['jquery','d3', 'ramda'], function($,d3,R){

	"use strict";
	
	var
	
		roomdata = {},
		
		
		/*
		 *	traverse building to get rooms above/below from starting point
		 */	
		traverse = function(relation, r){
			
			if (["above","below"].indexOf(relation) == -1){
				return [];
			}
			
			if (r.length == 0){
				return [];
			}
			
			if (r.length == 1){
				
				var room = roomdata[r[0]];
				
				if (room['relations'][relation] == undefined){
					return [];
				}
				if (room['relations'][relation].length <= 0){
					return [room.id];
				} 
				return R.concat([room.relations[relation][0]], traverse(relation,room.relations[relation]));
			}
			return R.concat(traverse(relation,[R.head(r)]), traverse(relation, R.tail(r)));
					
		},
		
		/*
		 * get all adjacent rooms.
		 */	
		neighbours = function(filters, room){
			
			if (roomdata[room]){
				var relations = roomdata[room].relations;
				
				if (relations){
					var result = [];
					
					if (filters){	
						filters.forEach(function(filter){
							result = R.concat(result, relations[filter]);
						});
						return result;
					}
					for (var relation in relations){
						result = R.concat(result, relations[relation])
					}
					return result;
				}
			}
			return [];
		},
		
		
		dedup    = function(list){
			if (list.length == 0){
				return [];
			}
			if (list.length == 1){
				return list;
			}
			var first  = list[0], second = list[1];
			
			if (first == second){
				return dedup(R.tail(list));
			}
			return R.concat([first], dedup(R.tail(list)));
		},
		
		comp	 = function(label){
			//pull out all numbers in the string and return as Integer
			return Math.floor(label.match(/\d+$/)[0]);
		},
		
		roomforid   = function(roomid){
			return roomdata[roomid];
		},
		
		adjacent = R.curry(neighbours)(["adjacent"]),
		
		sort	 = R.curry(R.sort(function(a,b){return comp(a) > comp(b)})),
		
		below	 = R.compose(dedup, sort, R.curry(traverse)("below")),
		
		above    = R.compose(dedup, sort, R.curry(traverse)("above")),
		
		
		init = function(){
			
			var adjacentbelow = R.compose(below, adjacent);
			var adjacentabove = R.compose(above,adjacent);
			
			d3.json("data/buildingdata.json", function(error, json){
  				if(error)
  					console.warn(error);		
				
				json.floors.forEach(function(floor){
					floor.apartments.forEach(function(apartment){
						roomdata[apartment.id] = apartment;
					});
				});
				
				
				//create room dict
				//Object.keys(roomdata).forEach(function(room){
					
					//console.log("below / above " + room);
					//console.log(below([room]));
					//console.log(above([room]));
				//});
			});
		}	

	return{
		init: init,
		roomforid:roomforid
	}

});