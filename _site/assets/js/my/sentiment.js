define(['knockout','d3', 'ajaxservice', 'knockoutpb'], function(ko,d3,ajaxservice){
	
	var	
		
		data = {},
		
		lastsentiment = 1,
		
		margin = {top: 20, right: 20, bottom: 150, left: 40},
    	
    	width = 1000 - margin.left - margin.right,
    	
    	height = 550 - margin.top - margin.bottom,
			
		x = d3.scale.ordinal().rangeRoundBands([0, width], .1),
		
		y = d3.scale.linear().range([height, 0]),

		xAxis = d3.svg.axis().scale(x).orient("bottom"),

 		yAxis = d3.svg.axis().scale(y).orient("left"),
		
		type = function(d){
			//d.value = +d.value;
			return d;
		},
		
		svg = d3.select(".sentimentchart")
				.attr("width", width + margin.left + margin.right)
    			.attr("height", height + margin.top + margin.bottom)
  				.append("g")
    			.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
		
	
		section = ko.observable().syncWith("section"),
		
		sentimentlookup = {
					 '1': "absence of anything positive",
       				 '2': "some weak positive elements of generic ethusiasm without negative slant",
       				 '3': "clear positive elements of messages",
       				 '4': "overwhelmingly positive or several positive elements or some emphasis of positive elements",
       				 '5': "enthusiastically positive",
       				 '-1': "absence of anything negative",
       				 '-2': "some negative elements",
       				 '-3': "clear negative elements of message",
       				 '-4': "overwhelmingly negative or several negative elements or some emphasis of negative elements",
       				 '-5': "definitely negative"
       				 }
		
		currentsentiment = ko.observable("-1"),
		
		sentimentlabel = ko.computed(function(){
			return sentimentlookup[currentsentiment()];
		}),
		
		sentimentexampletext = ko.observable("");
		
		sentimentsubscription = currentsentiment.subscribe(function(newValue){
			sentiment = newValue <= 0 ? newValue+5 : newValue+4;
			sentiment = Math.max(0, Math.min(9,sentiment)); ////to keep in range..
			updateexample(sentiment);
			renderbar(sentiment); 
			
		}),
		
		updateexample = function(sentiment){
			nameexample	   = data[0].name;
			percentexample = ((data[0].sentiment[sentiment] /  data[0].total) * 100).toFixed(1);
			sentimentexampletext("e.g: <strong>" + percentexample + "%</strong> of posts within <strong>" + nameexample + "</strong> are marked '" + sentimentlabel() + "'");	
			
		},
		
		sentimentvisible = ko.computed(function(){
			return section() == "sentiment";
		}),
		
		renderer = sentimentvisible.subscribe(function(newvalue){
			if (newvalue){
			
				ajaxservice.ajaxGetJson('sentiment', {}, function(result){
					data = result.summary.sentiments;
					renderbar(5);
					updateexample(5);
					renderaxes();
				});
		
			}	
		
		}),
		
		renderaxes = function(){
		
			d3.select(".sentimentchart .x.axis").remove(); 	
		 	d3.select(".sentimentchart .y.axis").remove();
			
			
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
				  .text("% of posts in category");
		},
		
		renderbar = function(sentiment){
		
			x.domain(data.map(function(d,i) { return  d.name;}));
			
			y.domain([0, d3.max(data.map(function(d,i) {
				return d3.max(d.sentiment, function(e){return (e/d.total)*100});
			}))]);
			
			var bars = svg.selectAll(".bar")
				.data(data);
			
			
			//update old elements as needed	
			bars
				.transition()
				.duration(1000)
				.attr("x", function(d,i) { return x(d.name);})
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y( (d.sentiment[sentiment] / d.total) * 100); })
				.attr("height", function(d) { return height - y((d.sentiment[sentiment] / d.total) * 100); })
			
			
			//enter new data
			bars
				.enter().append("rect")
				.attr("class", "bar")
				.attr("rx", 1)
				.attr("ry", 1)
				.attr("x", function(d,i) { return x(d.name)})
				.attr("width", x.rangeBand())
				.attr("y", function(d) { return y((d.sentiment[sentiment] / d.total) * 100); })
				.attr("height", function(d) { return height - y((d.sentiment[sentiment] / d.total) * 100); })
				.on("click", function(d){});
				
			
		},
		
		renderslider = function(){
		
			
			radius = 20,
			sliderwidth = 500,
			sliderheight = 100,
			happiness = d3.scale.linear().range([-5,4]),
			happiness.domain([radius+2, (sliderwidth+20) - radius]);
			
			var dragmove = function(d) {
				d.x = Math.max(radius + 2, Math.min((sliderwidth+20) - radius, d3.event.x));
				s = Math.round(happiness(d.x));
				s = s >= 0 ? s+1: s;
				currentsentiment(s);
			  	d3.select(this)
				  .attr("cx", d.x = Math.max(radius + 2, Math.min((sliderwidth+20) - radius, d3.event.x)))
				  .attr("cy", 50)
			};

			var drag = d3.behavior.drag()
				.origin(function(d) { return d; })
				.on("drag", dragmove);

			var svg = d3.select(".sentimentslider")
				.attr("width", sliderwidth + 30)
    			.attr("height", sliderheight)
  				.append("g")
  				
			var slider = svg.selectAll("g")
				.data([{'x':radius + 2 + (sliderwidth/10) *5, 'y':50}])
			  
			slider
			    .enter()
			    .append("rect")
			    .attr("class", "sliderbar")
				.attr("rx", 3)
				.attr("ry", 3)
				.attr("x", 10)
				.attr("width",sliderwidth)
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
			renderslider();
		}
		
	return{
		section:section,
		sentimentvisible:sentimentvisible,
		sentimentlabel:sentimentlabel,
		sentimentexampletext:sentimentexampletext,
		init:init
	}

});