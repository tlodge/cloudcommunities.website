define(['knockout','d3', 'knockoutpb'], function(ko,d3){
	
	var
		suffix = {},
		
		data = {},
		
		margin = {top:20, right:30, bottom:30, left:40},
		
		width = 500 - margin.left - margin.right,
		
		height = 360 - margin.top - margin.bottom,
		
		x = d3.scale.ordinal()
					.rangeRoundBands([0,width], .1),
					
		y = d3.scale.linear()
					.range([height, 0]),
			
		xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom"),
			
		yAxis = d3.svg.axis()
				.scale(y)
				.orient("left"),
					
		chart = d3.select(".chart1")
				.attr("width", width+margin.left+margin.right)
				.attr("height",height+margin.top+margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"
		),
		
		pval = "my m1 private value",
		
		init = function(d){
			data = d;
			render(data['bowposts']);
		},
	
		render = function(cdata){
			console.log("m1 is rendering!!");
			x.domain(cdata.map(function(d) { return d.name}));
			y.domain([0, d3.max(cdata, function(d){return d.value})]);
			barWidth = width / cdata.length;
				
			chart.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);
			
			chart.selectAll('bar')
				.data(cdata)
				.enter().append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.name);})
				.attr("y", function(d) { return y(d.value).toFixed(2);})
				.attr("height", function(d) { return height - y(d.value);})
				.attr("width", x.rangeBand());
		
			chart.append("g")
				.attr("class", "y axis")
				.call(yAxis)
				.append("text")
				.attr("transform", "rotate(-90)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.text("% all topics posted");
		},
		
		update = ko.postbox.subscribe("development", function(site){
			cdata = data[site];
			y.domain([0, d3.max(cdata, function(d){return d.value})]);
			var barWidth = width / cdata.length;
			
			var rect = chart.selectAll('rect')
				.data(cdata);
			
			var yaxis = chart.select(".y.axis")
			
			rect.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", function(d) { return x(d.name);})
				.attr("y", function(d) { return y(d.value).toFixed(2);})
				.attr("height", function(d) { return height - y(d.value);})
				.attr("width", x.rangeBand());	
			
			
			yaxis.transition()
				.duration(1000)
				.call(yAxis);	
			
			rect.transition()
				.duration(1000)
				.attr("y", function(d) { return y(d.value).toFixed(2);})
				.attr("height", function(d) { return height - y(d.value);})

				
			rect.exit()
				.remove();	
		})
		
	return {
		init: init
	}

});