define(['knockout','d3','nvd3', 'knockoutpb'], function(ko,d3,nv){
	var 
	
		data,
		
		title = ko.observable("user postings"),
		
		margin = {top:20, right:30, bottom:30, left:40},
		
		width = 560 - margin.left - margin.right,
		
		height = 300 - margin.top - margin.bottom,
		
		x = d3.scale.ordinal()
					.rangeRoundBands([0,width], .1);
					
		y = d3.scale.linear()
					.range([height, 0]);
			
		xAxis = d3.svg.axis()
				.scale(x)
				.orient("bottom");
			
		yAxis = d3.svg.axis()
				.scale(y)
				.orient("left");
					
		chart = d3.select(".chart1")
				.attr("width", width+margin.left+margin.right)
				.attr("height",height+margin.top+margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"
		),
				
		bar_update = ko.postbox.subscribe("development", function(site){	
			
			console.log(title() + " updating...");
			console.log(chart);
			cdata = data[site];
			//x.domain(cdata.map(function(d) { return d.name}));
			
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
		
		}),
		
		render_bar = function(cdata){
			x.domain(cdata.map(function(d) { return d.name}));
			y.domain([0, d3.max(cdata, function(d){return d.value})]);
			var barWidth = width / cdata.length;
				
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
		
		init = function(cdata){
			data = cdata;
			render_bar(data['bowposts']);
		}
		
		
		/*render_user_post_summary = function(result){
			
			/*data = []
			
			postings = result.posts;
			
			//console.log(postings);
			
			for(i = 0; i< postings.length; i++){
				posts = postings[i];
				name = posts.name;
				selecteddevelopments.push(name);
				postdata = []
				siteposts = postings[i].posts;
				
				for (j = 0; j < siteposts.length; j++){
					postdata.push({x:siteposts[j].rank, y:siteposts[j].posts});
				}	
				data.push({values:postdata, key:name, area:false, color:'#'+Math.floor(Math.random()*16777215).toString(16)});
				
			}
			
			console.log(selecteddevelopments());
			nv.addGraph(function() {
				var chart = nv.models.lineChart()
								.margin({left: 100})  //Adjust chart margins to give the x-axis some breathing room.
								.useInteractiveGuideline(true)  //We want nice looking tooltips and a guideline!
								.transitionDuration(350)  //how fast do you want the lines to transition?
								.showLegend(true)       //Show the legend, allowing users to turn on/off line series.
								.showYAxis(true)        //Show the y-axis
								.showXAxis(true)        //Show the x-axis
				  ;

				  chart.xAxis     //Chart x-axis settings
					  .axisLabel('rank')
					  .tickFormat(d3.format(',r'));

				  chart.yAxis     //Chart y-axis settings
					  .axisLabel('% posts (v)')
					  .tickFormat(d3.format('.02f'));

				  // Done setting the chart up? Time to render it!

				  d3.select('#chart svg')    //Select the <svg> element you want to render the chart in.   
					  .datum(data)          //Populate the <svg> element with chart data...
					  .call(chart);          //Finally, render the chart!

				  //Update the chart when window resizes.
				  nv.utils.windowResize(function() { chart.update() });
				  return chart;
			});
		}*/
		
		
			
	return{
		init: init,
		title: title
	}
})