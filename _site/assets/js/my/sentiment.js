define(['knockout','d3', 'ajaxservice', 'knockoutpb'], function(ko,d3,ajaxservice){
	
	var	
		
		data = {},
		
		_current, //for pie chart
		
		selectedbar,
		
		lastsentiment = 1,
		
		
		margin = {top: 20, right: 10, bottom: 150, left: 40},
    	
    	piemargin =  {top: 10, right: 320, bottom: 10, left: 40},
    	
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
		
		
		//stuff for pie chart..
		piewidth = 600 - piemargin.left - piemargin.right,
   		
   		pieheight = 600 - piemargin.top - piemargin.bottom,
    	
    	pieradius = Math.min(piewidth, pieheight) / 1.5,
    	
		color = d3.scale.category20c(),
 		
 		arc = d3.svg.arc().outerRadius(pieradius - 10).innerRadius(0),

		pie = d3.layout.pie().sort(null).value(function(d) {return d}),

		piesvg = d3.select(".sentimentpie")
    			   .attr("width", piewidth + piemargin.left + piemargin.right)
    			   .attr("height", pieheight + piemargin.top + piemargin.bottom )
  				   .append("g")
    			   .attr("transform", "translate(" + (piewidth + piemargin.left + piemargin.right) / 4 + "," + (pieheight + piemargin.top + piemargin.bottom ) / 4 + ")"),
	
	
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
	
		pielabels = [
						 "definitely negative(5)",
						 "overwhelmingly negative(4)",
						 "clear negative elements(3)",
						 "some negative elements(2)",
						 "absence of anything negative(1)",
						 "absence of anything positive (1)",
						 "weak positive elements(2)", 
						 "clear positive elements(3)", 
						 "overwhelmingly positive(4)",
						 "enthusiastically positive(5)",
					],
		
		piekey = ko.observableArray([]),
		
		examplemessages = ko.observableArray([]),
		
		examplesheading = ko.observable(""),
		
		currentcategory = ko.observable(""),
		
		sentimentdetailvisible = ko.computed(function(){
			return currentcategory() != "";
		}),
		
		sentimentexamplemessagesvisible = ko.computed(function(){
			return examplemessages().length > 0;
		}),
		
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
				.on("click", barclicked);
				
			
		},
		
		barclicked = function(d){
			clearbarselection();
			var g = d3.select(this).node()
			selectedbar = d3.select(g);
			selectedbar.style("fill", "#ff0000");	
			selectedbar.style("stroke", "#dd0000");
			
			currentcategory(d.name);
			examplemessages([]);
			renderpie(d);
		
			$('html, body').animate({
					scrollTop: $("#sentimentdetail").offset().top
			},1000);
		},
		
		
		clearbarselection = function(){
			if (selectedbar){
				selectedbar.style("fill", "#ABD9D0");
				selectedbar.style("stroke", "#2CA089");
			}
		},		
		
		segmentclicked = function(d,i){
			
			pole 	= "";
			value 	= "";
			
			examplesheading(piekey()[i].name);
			
			//translate values to sentiment scale (1-5, postive/negative)
			if (i <= 4){
				pole  = "negative"
				value = 5 - i; 
			}else{
				pole  = "positive"
				value = i - 4;
			}
			ajaxservice.ajaxGetJson('sentimentforcategory', {'category': currentcategory(), 'pole':pole, 'value':value}, function(result){
				examplemessages(result.summary);
			})
		},
		
		renderpie = function(piedata){
					
  			var path = piesvg.datum(piedata.sentiment).selectAll("path")
      			.data(pie)
    			
    		path.enter()
				.append("path")
      			.attr("d", arc)
      			.style("fill", function(d,i) { return color(i) })
      			.on("click", segmentclicked)
				.each(function(d){_current = d}) //store initial angles.
				
			piesvg.selectAll("text").remove(); 	
		 	piesvg.selectAll("circle").remove(); 	
		 	
			var circle = piesvg.selectAll(".label")
      					.data(piedata.sentiment)
      		
								
      			circle
      					.enter()
      					.append("circle")
      					.attr("cx", function(d, i) { return piewidth - 15})
						.attr("cy", function(d, i){return -(pieradius-20) + (i * 30)})
						.attr("r", function(d) { return 10; })
						.style("fill", function(d,i) { return color(i); })	
      					.on("click", segmentclicked)
      			
      			circle
      					.enter()
      					.append("text")
      					.attr('x', function(d){return piewidth})
						.attr('y', function(d,i){return -(pieradius-25) + (i * 30)})
						.text(function(d,i){return piekey()[i].name})	
						.on("click", segmentclicked)
      			
      			
      			
			path	
				.transition()
				.duration(1000)
      			.attrTween("d", arcTween) //redraw arcs!
      		
      		path
      			.exit()
      			.remove();	
  		
		},
		
		arcTween = function(a){
			var i = d3.interpolate(_current, a);
			_current = i(0);
			return function(t){
				return arc(i(t));
			} 	
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
			
			for (i = 0; i < pielabels.length; i++){
				piekey.push({"name":pielabels[i], "color":color(i)});
			}
			renderslider();
		}
		
	return{
		section:section,
		sentimentvisible:sentimentvisible,
		sentimentdetailvisible:sentimentdetailvisible,
		sentimentexamplemessagesvisible: sentimentexamplemessagesvisible,
		
		sentimentlabel:sentimentlabel,
		sentimentexampletext:sentimentexampletext,
		init:init,
		currentcategory: currentcategory,
		examplemessages: examplemessages,
		examplesheading:examplesheading,
	}

});