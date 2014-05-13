define(['knockout','d3', 'ajaxservice', 'knockoutpb'], function(ko,d3,ajaxservice){
	
	var	
		radius = 20,
		
		width = 500,
		
		height = 100,
		
		section = ko.observable().syncWith("section"),
		
		sentimentvisible = ko.computed(function(){
			return section() == "sentiment";
		}),
				
		renderhappiness = function(){
			happiness = d3.scale.linear().range([1,5]),
			happiness.domain([radius+2, (width+20) - radius]);
			
			var dragmove = function(d) {
			  	d3.select(this)
				  .attr("cx", d.x = Math.max(radius + 2, Math.min((width+20) - radius, d3.event.x)))
				  .attr("cy", 50)
			};

			var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("drag", dragmove);

			var svg = d3.select(".happinesschart")
				.attr("width", width + 30)
    			.attr("height", height)
  				.append("g")
  				
			var slider = svg.selectAll("g")
				.data([{'x':100, 'y':50}])
			  
			slider
			    .enter()
			    .append("rect")
			    .attr("class", "sliderbar")
				.attr("rx", 3)
				.attr("ry", 3)
				.attr("x", 10)
				.attr("width",width)
				.attr("y", 40)
				.attr("height", function(d) { return 20});	
				  
			slider.enter()
			    .append("circle")
			    .attr("class", "sliderhandle")
				.attr("r", radius)
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.call(drag);
		},
		
		rendersadness = function(){
			sadness = d3.scale.linear().range([-5,-1]),
			sadness.domain([radius+2, (width+20) - radius]);
			
			var dragmove = function(d) {
			  	d3.select(this)
				  .attr("cx", d.x = Math.max(radius + 2, Math.min((width+20) - radius, d3.event.x)))
				  .attr("cy", 50)
			};

			var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("drag", dragmove);

			var svg = d3.select(".sadnesschart")
				.attr("width", width + 30)
    			.attr("height", height)
  				.append("g")
  				
			var slider = svg.selectAll("g")
				.data([{'x':100, 'y':50}])
			  
			slider
			    .enter()
			    .append("rect")
			    .attr("class", "sliderbar")
				.attr("rx", 3)
				.attr("ry", 3)
				.attr("x", 10)
				.attr("width",width)
				.attr("y", 40)
				.attr("height", function(d) { return 20});	
				  
			slider.enter()
			    .append("circle")
			    .attr("class", "sliderhandle")
				.attr("r", radius)
				.attr("cx", function(d) { return d.x; })
				.attr("cy", function(d) { return d.y; })
				.call(drag);
		
		},
		
		init = function(){
			renderhappiness();
			rendersadness();
		}
		
	return{
		section:section,
		sentimentvisible:sentimentvisible,
		init:init
	}

});