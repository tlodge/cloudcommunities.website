define(['knockout','d3', 'knockoutpb'], function(ko,d3){
	
	var
		data = {},
		
		developments = [],//d3.map(), 
		
		margin = {top:20, right:30, bottom:30, left:40},
		
		width = 500 - margin.left - margin.right,
		
		height = 360 - margin.top - margin.bottom,
		
		x = d3.scale.ordinal().rangeRoundBands([0,width], .1),
					
		y = d3.scale.linear().range([height, 0]),
	
		color = d3.scale.category10(),

		xAxis = d3.svg.axis().scale(x).orient("bottom"),

		yAxis = d3.svg.axis().scale(y).orient("left"),

		line = d3.svg.line()
		.interpolate("basis")
		.x(function(d) { return x(d.name); })
		.y(function(d) { return y(d.value); }),
		
		chart = d3.select(".chart2")
				.attr("width", width+margin.left+margin.right)
				.attr("height",height+margin.top+margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"
		),
	
			
		init = function(d){
			data = d;
			//readings = []
			//for (var key in d){
			//	developments.push({name:key, values:d[key]});
			//}
			//render(readings);
			//developments.set('bowposts', {name:'bowposts', values:d['bowposts']});
			developments.push({name:'bowposts', values:d['bowposts']});
			render();
		},
	
		render = function(){
			  
			  console.log(developments);	
			  
			  color.domain(d3.keys(developments));
			  
			  x.domain(developments[0].values.map(function(d) {return d.name}));
			 
			  y.domain([
				d3.min(developments, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
				d3.max(developments, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
			  ]);
				
			  chart.append("g")
				  .attr("class", "x axis")
				  .attr("transform", "translate(0," + height + ")")
				  .call(xAxis);

			  chart.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				  .append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", 6)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text("% of all topics posted");

			  var development = chart.selectAll(".development")
				  	.data(developments, function(d){
				  	   return d.name;
				  	})
				
			  development.enter().append("g")
				  	.attr("class", "development");
			
				
			  development.append("path")
				  .attr("class", "line")
				  .attr("d", function(d) { return line(d.values); })
				  .style("stroke", function(d) { return color(d.name); });

			  development.append("text")
				  .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
				  .attr("transform", function(d) { return "translate(" + x(d.value.name) + "," + y(d.value.value) + ")"; })
				  .attr("x", 3)
				  .attr("dy", ".35em")
				  .text(function(d) { return d.name; });
			
		},
		
		indexOf = function(site){
			for (i = 0; i < developments.length; i++){
				if (developments[i].name == site){
					return i;
				}
			}
			return -1;
		},
		
		update = ko.postbox.subscribe("development", function(site){
			idx = indexOf(site);
		
			if (idx == -1){
				developments.push({'name':site, 'values':data[site]});
			}else{
				developments.splice(idx,1);
			}
		
			console.log(developments);
		
			y.domain([
				d3.min(developments, function(c) { return d3.min(c.values, function(v) { return v.value; }); }),
				d3.max(developments, function(c) { return d3.max(c.values, function(v) { return v.value; }); })
			]);
		
			//this is crucial to get right!  make sure the line is added in the correct way
			//compare the incremental added html against the full line chart!
			var l = chart.selectAll('.line')
				.data(developments, function(d){
				  	   return d.name;
			});
			
			l.enter()
			 .append("path")
			 .attr("class", "line")
			 .attr("d", function(d) { return line(d.values); })
			 .style("stroke", function(d) { return color(d.name); });		

			l.transition()
			 .duration(1000)
			 .attr("d", function(d) { return line(d.values); })
				
			
			var yaxis = chart.select(".y.axis")
			
			yaxis.transition()
				.duration(1000)
				.call(yAxis);	
			
			l.exit().remove();
		
		})
		
	return {
		init: init
	}

});
