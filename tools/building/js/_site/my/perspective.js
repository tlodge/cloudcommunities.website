define(['jquery','d3', 'util', 'numeric'], function($,d3, util, numeric){
	
	"use strict";
	
	var
		margin    	   = {top:20, right:20, bottom:20, left:20},
	  	
	  	height    	   = $(document).height() - margin.top - margin.bottom,
		
	  	width    	   = $(document).width() - margin.left - margin.right,
		
		wh 				= function(){return Math.min(width/3,height/3)},
		
		ptransforms  	= [],
		sourcepoints	= [],
		targetpoints    = [],
		
		rc,
		roomxpadding = 5,
		xskew = 40,
    	yskew = 20,
    	linepadding = -30,
    	
    	layer1SourcePoints = [[0, 0], [(wh()+20)*3, 0], [(wh()+20)*3, wh()], [0, wh()]],
    	
    	layer1TargetPoints = [[xskew, 0], [((wh()+20)*3)-xskew, 0], [(wh()+20)*3, wh()-yskew], [0, wh()-yskew]],
    	
    	layer2SourcePoints = [[0, wh()+linepadding], [(wh()+20)*3, wh()+linepadding], [(wh()+20)*3, wh()+linepadding+wh()], [0, wh()+linepadding+wh()]],
    	
    	layer2TargetPoints = [[xskew, wh()+linepadding], [((wh()+20)*3) -xskew, wh()+linepadding], [(wh()+20)*3, wh()+linepadding+wh()-yskew], [0, wh()+linepadding+wh()-yskew]],
    
    	transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform",

		svg  = d3.select("#building").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    			
		 
		svgTransform2,
		
		svgTransform1,		   
    	
    	dragged = function(d,i) {	
    			var xtrans = d3.event.x - d[0];
    			var ytrans = d3.event.y - d[1];
    			layer2TargetPoints[i][0] += xtrans;
    			layer2TargetPoints[i][1] += ytrans;
  				d3.select(this).attr("transform", "translate(" + (d[0] = d3.event.x) + "," + (d[1] = d3.event.y) + ")");
  				transformed();
		},
		
		
		getParameterByName = function(name){
			name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    		var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        	results = regex.exec(location.search);
    		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "));
		},
		
		ax = function(idx, rows,cols){
  			return ((idx % cols) * maxaspect(cols,rows)) + roomxpadding;
  		},
  		
  		ay = function(idx, rows,cols){
  			return (Math.floor(idx / cols) * maxaspect(cols,rows)) + roomxpadding;
  		},
  		
  		rowscols = function(totalitems){
  			if (totalitems == 0)
  				return {rows:1,cols:1}
  			
  			var cols = 	 Math.max(1,Math.floor(totalitems / maxrows(totalitems)));
  			var rows =   Math.ceil(totalitems / cols);
  			
  			//if rows != cols, work out which will give the largest aspect ratio!
  			
  			if ( maxaspect(cols,rows) < maxaspect(rows,cols)){
  				var tmp = cols
  				cols = rows;
  				rows = tmp;
  			}
  			
  			return {cols:cols, rows:rows};
  		},
  		
  		maxrows = function(itemcount){	
  			var ratio = width/height;
  			return Math.ceil(Math.sqrt( itemcount / ratio ));	  	
	  	},
  		
  		maxaspect = function(cols, rows){
  			return Math.min((width/cols), (height/rows))
  		}, 
		
		transformed = function() {
		
		
			
			for (var sp = 0; sp < sourcepoints.length; sp++){
				
				var layerSourcePoints = sourcepoints[sp];
				var layerTargetPoints = targetpoints[sp];
				
				for (var a = [], b = [], i = 0, n = layerSourcePoints.length; i < n; ++i) {
						var s = layerSourcePoints[i], t = layerTargetPoints[i];
						a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
						a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);
				}
			
				var X = solve(a, b, true), matrix = [
						X[0], X[3], 0, X[6],
						X[1], X[4], 0, X[7],
						0,    0, 1,    0,
						X[2], X[5], 0,    1
				  ].map(function(x) {
					return d3.round(x, 6);
				});
			
				ptransforms[sp].style(transform, "matrix3d(" + matrix + ")");
			}
		},
				
		transformer = function(el, layerSourcePoints, layerTargetPoints){
			for (var a = [], b = [], i = 0, n = layerSourcePoints.length; i < n; ++i) {
					var s = layerSourcePoints[i], t = layerTargetPoints[i];
					a.push([s[0], s[1], 1, 0, 0, 0, -s[0] * t[0], -s[1] * t[0]]), b.push(t[0]);
					a.push([0, 0, 0, s[0], s[1], 1, -s[0] * t[1], -s[1] * t[1]]), b.push(t[1]);
			}
			
			var X = solve(a, b, true), matrix = [
					X[0], X[3], 0, X[6],
					X[1], X[4], 0, X[7],
					0,    0, 1,    0,
					X[2], X[5], 0,    1
				].map(function(x) {
					return d3.round(x, 6);
			});
			
			el.style(transform, "matrix3d(" + matrix + ")");
		},
		
		// Given a 4x4 perspective transformation matrix, and a 2D point (a 2x1 vector),
		// applies the transformation matrix by converting the point to homogeneous
		// coordinates at z=0, post-multiplying, and then applying a perspective divide.
		project = function(matrix, point) {
		  point = multiply(matrix, [point[0], point[1], 0, 1]);
		  return [point[0] / point[3], point[1] / point[3]];
		},

		// Post-multiply a 4x4 matrix in column-major order by a 4x1 column vector:
		// [ m0 m4 m8  m12 ]   [ v0 ]   [ x ]
		// [ m1 m5 m9  m13 ] * [ v1 ] = [ y ]
		// [ m2 m6 m10 m14 ]   [ v2 ]   [ z ]
		// [ m3 m7 m11 m15 ]   [ v3 ]   [ w ]
		multiply = function(matrix, vector) {
		  return [
			matrix[0] * vector[0] + matrix[4] * vector[1] + matrix[8 ] * vector[2] + matrix[12] * vector[3],
			matrix[1] * vector[0] + matrix[5] * vector[1] + matrix[9 ] * vector[2] + matrix[13] * vector[3],
			matrix[2] * vector[0] + matrix[6] * vector[1] + matrix[10] * vector[2] + matrix[14] * vector[3],
			matrix[3] * vector[0] + matrix[7] * vector[1] + matrix[11] * vector[2] + matrix[15] * vector[3]
		  ];
		},

		render = function(data){
			
			console.log(data);
			
			var rooms = svg.selectAll("rooms")
						  .data(data)
						  .enter()
						  .append("g")
						  .attr("class", function(d,i){return "player layer"+i})
						  
			rooms.selectAll("room")
						  .data(function(d,i){return d})
						  .enter()
						  .append("rect")
						  .attr("x", function(d,i,j){return ax(i,rc.rows,rc.cols)})
						  .attr("y", function(d,i,j){return j *  maxaspect(rc.cols,rc.rows) + roomxpadding})
						  .attr("width", maxaspect(rc.cols,rc.rows) - (2*roomxpadding))
						  .attr("height", maxaspect(rc.cols,rc.rows) - (2*roomxpadding))
						  .style("fill", "white")
						  .style("fill-opacity", 0.8)
						  .style("stroke", "black")
						  
			transformed();
		},
		
		init = function(){
			var rooms = getParameterByName("rooms") || 10;
			rc = rowscols(rooms);
			
			var matrix = [];
			 
			for (var i = 0; i < rooms; i++){
				if (!matrix[Math.floor(i/rc.cols)]){
					matrix[Math.floor(i/rc.cols)] = [];
				}
				matrix[Math.floor(i/rc.cols)].push({room:i});
			} 
			
			render(matrix);
			
			//get the size of each rect
			
			var ma = maxaspect(rc.cols, rc.rows);
		
			d3.selectAll("g.player")
				.each(function(d,i){
					var element = d3.select("g.layer"+i).style(transform + "-origin", margin.left + "px " + margin.top + "px 0");
					ptransforms.push(element); 
					//lt,rt,lb,rb
					sourcepoints[i] = [[0, (ma+roomxpadding)*i],[rc.cols*(ma+roomxpadding), (ma+roomxpadding)*i], [0, ((ma+roomxpadding)*i)+ma],[rc.cols*(ma+roomxpadding), ((ma+roomxpadding)*i)+ma]]; 
					targetpoints[i] = [[xskew, (ma+roomxpadding)*i],[rc.cols*(ma+roomxpadding)-xskew, (ma+roomxpadding)*i], [0, ((ma+roomxpadding)*i)+ma-yskew],[rc.cols*(ma+roomxpadding), ((ma+roomxpadding)*i)+ma-yskew]];
			});
				
			d3.transition()
				.duration(750)
				.tween("points", function(){
					//create the iterators
					var iterators = [];
					
					ptransforms.forEach(function(element,i){
						iterators.push(d3.interpolate(sourcepoints[i], targetpoints[i]));
					});
					return function(t){
						ptransforms.forEach(function(element,i){
					  		transformer(element, sourcepoints[i], iterators[i](t));
					  	})
					}
			});
			
			//check http://bl.ocks.org/mbostock/10571478 to do it over time!
			//transformed();
			
			
			/*
			function clicked(d) { - d is new targetpoints!
  					d3.transition()
      					.duration(750)
      					.tween("points", function() {
       					 var i = d3.interpolate(targetPoints, d);  //d will be a control points array, target points is current points
       					 										   //so our interpolation will be from sourcepoints[i] to targetpoints[i]!
        														   //the interpolator i is initialized when the transition starts, 
        														   //and then used subsequently over the course of the transition
        					return function(t) {
						  		//this will recall handle with i(t) and also set targetpoints to i(t).  Then does translation.
						  		//so this is called again and again, setting target points to i
						  		//think that all this does is move handle points, which we're not all that interested in
						  		//handle.data(targetPoints = i(t)).attr("transform", function(d) { return "translate(" + d + ")"; });
						  		//but this calls transformed over and over again!!! yes!!
						  		transformed(); //this currently calls across all matrix - but will d be modified by interpolate?
							};
					  });
			}
			*/
		}
		
	return {
		init: init
	}
});