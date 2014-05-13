define(['knockout','d3', 'nvd3', 'ajaxservice', 'knockoutpb'], function(ko,d3,nv,ajaxservice){

	var 
	
		selectedbar,
		
		categories		 = ko.observableArray([]),
		
		posts     		 = ko.observableArray([]),
		
		selectedCategory = ko.observable(""),
		
		selectedSubcategory = ko.observable(""),
		
		selectedSubject = ko.observable(""),
		
		selectedBody	= ko.observable(""),
		
		categoryClicked = function(category){
			selectedCategory(category);
			ajaxservice.ajaxGetJson('subcategories', {category:selectedCategory()}, renderbar);
		},
		
		amSelected	= function(category){
			return category == selectedCategory();
		},
		
		categorySelected = ko.observable().subscribeTo("selectedCategory", function(name){	
			selectedCategory(name);
			ajaxservice.ajaxGetJson('subcategories', {category:selectedCategory()}, function(data){renderbar(data); addaxes();});
		}),
		
		margin = {top: 20, right: 20, bottom: 150, left: 40},
    	
    	width = 1000 - margin.left - margin.right,
    	
    	height = 350 - margin.top - margin.bottom,

		x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
		
		y = d3.scale.linear().range([height, 0]),

		xAxis = d3.svg.axis().scale(x).orient("bottom"),

 		yAxis = d3.svg.axis().scale(y).orient("left"),
		
		type = function(d){
			d.value = +d.value;
			return d;
		},
		
		svg = d3.select(".detailbarchart")
				.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
    			
		addaxes = function(){
			
			d3.select(".x.axis").remove();
		 	
		 	d3.select(".y.axis").remove();
			
			svg.append("g")
				.attr("class", "x axis")
        		.attr("transform", "translate(0," + height + ")")
        		.call(xAxis)
        		.selectAll("text")  
            	.style("text-anchor", "end")
            	.attr("dx", "-1em")
            	.attr("dy", "-0.5em")
            	.attr("transform", function(d) {
                	return "rotate(-90)" 
                });

			svg.append("g")
				  .attr("class", "y axis")
				  .call(yAxis)
				  .append("text")
				  .attr("transform", "rotate(-90)")
				  .attr("y", -35)
				  .attr("dy", ".71em")
				  .style("text-anchor", "end")
				  .text("Posts");
		},
		
		renderbar = function(data){
			clearbarselection();
			
			data = data.subcategories;
			
			data.sort(function (a,b){
				return a.value == b.value ? 0 : +(a.value < b.value) || -1;
			});
				
			
			x.domain(data.map(function(d,i) { return  d.name;}));
			y.domain([0, d3.max(data, function(d) { return d.value; })]);

			var bars = svg.selectAll(".bar")
				.data(data,  function(d,i){return i;})
			
			//update old elements as needed	
			bars
				.transition()
				.duration(1000)
				.attr("x", function(d,i) { return x(d.name);})
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.value); })
				.attr("height", function(d) { return height - y(d.value); });
			
			
			//enter new data
			bars
				.enter().append("rect")
				.attr("class", "bar")
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("x", function(d,i) { return x(d.name)})
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y(d.value); })
				.attr("height", function(d) { return height - y(d.value); })
				.on("click", barclicked);
			
			//exit
			bars.exit().remove();	
			
			//update axes
			
			var yaxis = svg.select(".y.axis")
			
			yaxis.transition()
				.duration(1000)
				.call(yAxis);
				
			var xaxis = svg.select(".x.axis")
			
			xaxis.transition()
				.duration(1000)
				.call(xAxis)
			
			xaxis.selectAll('text')
				.style("text-anchor", "end")
            	.attr("dx", "-1em")
            	.attr("dy", "-0.5em")
            	.attr("transform", function(d) {
                	return "rotate(-90)" 
                });		
		},
		
		barclicked = function(data){

			var g = d3.select(this).node()
			clearbarselection();
			selectedbar = d3.select(g);
			selectedbar.style("fill", "#ff0000");	
			selectedbar.style("stroke", "#dd0000");
			selectedSubcategory(data.name);
			
			ajaxservice.ajaxGetJson('subcategory', {category:selectedCategory(), subcategory:selectedSubcategory()}, function(result){
				posts(result.summary);
			});
		},
		
		clearbarselection = function(){
			if (selectedbar){
				selectedbar.style("fill", "#ABD9D0");
				selectedbar.style("stroke", "#2CA089");
			}
			selectedSubcategory("");
			selectedBody("");
			selectedSubject("");
		},
		
		renderpie = function(data){
			
			subcategories = data.subcategories;
			nv.addGraph(function(){
				var chart = nv.models.pieChart()
					.x(function(d) { return d.name})
					.y(function(d) { return d.value})
					.showLabels(true);
				
					d3.select('#piechart svg')
						.datum(subcategories)
						.transition().duration(350)
						.call(chart);
				
				return chart;
			
			});
		},
		
		section = ko.observable().syncWith("section"),
		
		categoryvisible = ko.computed(function(){
			return section() == "catdetail";
		}),
		
		subcategoryvisible = ko.computed(function(){
			return selectedSubcategory() != "";
		}),
		
		messagevisible = ko.computed(function(){
			return selectedSubject() != "";
		}),
		
		init = function(){
			//ajaxservice.ajaxGetJson('categorylist', {} , function(result){
			d3.json('../../assets/data/categories.json', function(result){
				categories(result.categories.map(function(item){return item.name}));
			});
		}
		
		
	return {
		selectedCategory: selectedCategory,
		selectedSubcategory: selectedSubcategory,
		selectedSubject: selectedSubject,
		selectedBody:selectedBody,
		
		categoryvisible: categoryvisible,
		subcategoryvisible: subcategoryvisible,
		messagevisible:messagevisible,
		section:section,
		init:init,
		categories: categories,
		posts: posts,
		
		categoryClicked: categoryClicked,
		amSelected: amSelected	
	}	
});