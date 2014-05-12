define(['knockout','d3', 'ajaxservice', 'knockoutpb', 'custom_bindings'], function(ko,d3,ajaxservice){
	
	var
		
		data = {},
		
		lines ={},
		
		margin = {top: 20, right: 200, bottom: 0, left: 20},
		width = 650, height = 650,
	
		parseDate = d3.time.format("%Y-%m-%d").parse,
		
		c = d3.scale.category20c(),
		
		x = d3.time.scale().range([0,width]),
		
		xAxis = d3.svg.axis().scale(x).orient("top");
		
		svg = d3.select(".rootchart")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.style("margin-left", margin.left + "px")
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),

		section = ko.observable().syncWith("section", true),
		
		
		rootvisible = ko.computed(function(){
			return section() == "root";	
		}),
		
		rendersubcategory = function(data){
			console.log("rendering  " + data);
		},
		
		renderroot = function(){
			max = d3.max(data, function(d){return d3.max(d.posts, function(c){return c[1]})});
				
			var rScale = d3.scale.linear()
			
					.domain([0,
							 d3.max(data, function(d){return d3.max(d.posts, function(c){return c[1]})})
							 ])
					.range([2, 9]);

			var xscale = [d3.min(data, function(d){return d3.min(d.posts, function(c){return parseDate(c[0])})}),
					   d3.max(data, function(d){return d3.max(d.posts, function(c){return parseDate(c[0])})})];
			 
			x.domain(xscale);
			
			var xScale = d3.time.scale()//scale.linear()
				.domain(xscale)
				.range([0, width]);

			svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + 0 + ")")
				.call(xAxis);
			
			lines = svg.selectAll("posts")
				.data(data)
				.enter().append("g")
				
			lines.selectAll("labels")
				.data(function(d) {return [d.name]})
				.enter()
				.append("text")
				.attr('y', function(d,i,j){return 24+j*20})
				.attr('x', function(d){return width+20})
				.text(function(d){return truncate(d)})
				.style("fill", function(d,i,j) {return c(j)})
				.on("click", categoryclicked)
				.on("mouseenter", mouseover)
				.on("mouseleave", mouseout)
				
			circles = lines.selectAll("category")
				.data(function(d,i){return d.posts})
				.enter()
				.append('circle')
				.on("click", circleclicked)
				.attr("cx", function(d, i) { return xScale(parseDate(d[0])); })
				.attr("cy", function(d,i,j){return j*20+20;})
				.attr("r", function(d) { return rScale(d[1]); })
				.style("fill", function(d,i,j) { return c(j); });		
		
			text = lines.selectAll("value")
				.data(function(d,i){return d.posts})
				.enter()
				.append("text")
				.attr("y", function(d,i,j){return j*20+25})
				.attr("x",function(d) {return xScale(parseDate(d[0]))-5; })
				.attr("class","value")
				.text(function(d){return d[1]; })
				.style("fill", function(d,i,j) { return c(j) })
				.style("display","none")
			
			
			/*
			//--- same as ---//
			
			svg.selectAll("category")
				.data(data)
				.enter()
				.append("g")
				.each(function(d, j){
					
					d3.select(this).selectAll("circle")
						.data(d.posts)
						.enter()
						.append("circle")
						.on("click", circleclicked)
						.attr("cx", function(d, i) { return xScale(parseDate(d[0])); })
						.attr("cy", function(d,i){return j*20+20;})
						.attr("r", function(d) { return rScale(d[1]); })
						.style("fill", function(d) { return c(j); });		
					
					d3.select(this).selectAll("text")
						.data(d.posts)
						.enter()
						.append("text")
						.attr("y", function(d){return j*20+25})
						.attr("x",function(d, i) { return xScale(parseDate(d[0]))-5; })
						.attr("class","value")
						.text(function(d){ return d[1]; })
						.style("fill", function(d) { return c(j); })
						.style("display","none")
				
					d3.select(this).selectAll("label")
						.data([d.name])
						.enter()
						.append("text")
						.attr('y', function(d){return 24+j*20})
						.attr('x', function(d){return width+20})
						.text(function(d){return truncate(d)})
						.style("fill", function(d) {return c(j)})
						.on("click", categoryclicked)
						.on("mouseenter", mouseover)
						.on("mouseleave", mouseout)
			});*/
		},
		
		init = function(){
			
				section("root");
				
				ajaxservice.ajaxGetJson('categories', {} , function(result){	
					data = result.categories;
		
					d3.xml('static/face.svg', 'image/svg+xml', function (error, data) {
						console.log("nice am here");
						face = data.documentElement;
						renderroot();
					});
		
		
				});
		
		},
		
		truncate = function (str, maxLength, suffix) {
			if(str.length > maxLength) {
				str = str.substring(0, maxLength + 1); 
				str = str.substring(0, Math.min(str.length, str.lastIndexOf(" ")));
				str = str + suffix;
			}
			return str;
		},
		
		
		categoryclicked = function(p){
			ko.postbox.publish('selectedCategory',p);
			section('catdetail');
		},
		
		//overlay sentiment by colouring circles different colour!!!
		
		circleclicked = function(p){
			console.log("circle mouse over");
			console.log(p);
			var g = d3.select(this).node()
			d3.select(g).style("fill", "#ff0000")
			console.log(g);
		},
		
		
		mouseover = function(){ 
			var g = d3.select(this).node().parentNode;
			
			d3.select(g).selectAll("circle").style("display","none");
			d3.select(g).selectAll("text.value").style("display","block");
		},

		mouseout = function() {
			var g = d3.select(this).node().parentNode;
			d3.select(g).selectAll("circle").style("display","block");
			d3.select(g).selectAll("text.value").style("display","none");
		}
		
	return {
		init: init,
		rootvisible:rootvisible,
		section: section,
		categoryclicked:categoryclicked,
	}
});