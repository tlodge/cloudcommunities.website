define(['jquery','d3'], function($,d3){

	var 
	
		startpos   = 0,
		
		rectmargin = 30,
		
		dragoffset = -1,
		
		pointerwidth = 55,
		
		pointerpadding = [40,-20,-15,50,70],
		
		transitionduration = 300,
		
		draggedcontainer,
		
		commentwidth = 500,
		
		largebubble	  	= "m 65.927149,1379.5978 c -31.804666,-11.6554 -81.376874,-46.4077 -63.2411944,-90.3589 -9.2081987,-15.247 -30.4228406,-16.8556 -42.6777366,-29.6819 -29.188275,-21.7923 -53.638677,-57.5686 -45.845838,-95.5559 10.182922,-51.654 55.287738,-87.6765 100.676508,-108.9 69.391733,-32.8801 154.693092,-32.6558 222.822722,3.3353 38.7899,21.1304 73.46742,62.4924 67.87439,109.1353 -6.43574,47.1 -46.60247,82.1761 -89.29953,97.9435 -44.49651,17.7094 -91.87957,27.0604 -139.310352,32.4503 -65.625765,4.3124 -33.6088,52.9828 -10.998969,81.6323 z",
         
        smallbubble	= "m 433.84398,1212.9876 c 10.87312,-25.4968 -6.52217,-47.7724 11.26563,-56.3796 17.78776,-8.6072 62.30363,-42.7121 48.06646,-83.7428 -14.23712,-41.0306 -69.11472,-68.6351 -124.69494,-76.91352 -55.58028,-8.27847 -132.67227,7.48782 -165.65162,51.77382 -32.97945,44.2859 -5.85204,83.1973 32.09977,103.5921 37.29425,20.0413 111.28325,25.1469 141.78218,24.5249 30.49902,-0.6219 52.83522,12.7275 57.13252,37.1451 z",
       
        transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform",
	  	
		colours		 = ["#880e4f","#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
		
		mydata = [{position: 1, value: "greggs", comments:['aaaaaaass nice comment one about greggs which should also go nicely onto a new line and I can say quite a bit too which is good and this makes it all loook terribly nice so there we go and this is a really special thing I think','a nicer comment two about greggs']},
				  {position: 2, value: "birds", comments:['a nice comment one about birds','a nicer comment two about birds']}, 
				  {position: 3, value: "asda", comments:['a nasty comment one about asda','a nice comment two about asda']},
				  {position: 4, value: "coop", comments:['a lovely comment one about coop','a devastating comment two about coop']},
				  {position: 5, value: "tesco",comments:['a nice comment one about tesco','an okish comment two about tesco']}],
				  
		margin    = {top:20, right:pointerwidth+10, bottom:20,left:35},
		
		width 	  = 400 - margin.left - margin.right,
		
	  	height    = 450 - margin.top - margin.bottom,
		
		bubblemargin = {top:0, left: width, right:0, bottom:0},
		
	  	svg  = d3.select("#list").append("svg")
				.attr("width", width + commentwidth + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),	
	  
	  	y = function(position){
	  		return (position - 1) * (height/mydata.length);
	  	},
	  	
	  	rectoffset = (height/mydata.length),
	  	
	  	cy = function(position){
	  		return ((position - 1) * (height/mydata.length)) + ((height/mydata.length) / 2) - rectmargin/2;
	  	},
	  	
	  	cx = function(position){
	  		
	  		return width + pointerwidth + pointerpadding[position-1] - ((height/mydata.length) / 2);
	  	},
	  
	  	calcpos = function(ypos){
	  		return Math.max(0,Math.min(mydata.length-1,(ypos/height) * mydata.length));
	  	},
	  	
	  	colour = function(ypos){
	  		return colours[ypos%colours.length];	
	  	},
	  	
	  	highlighted = function(ypos){
	  		return "#e51c23";
	  	},
	  	
	  	multiplier = function(ypos){
	  		return 0.7 + (0.3 * (1 - (ypos/mydata.length)));
	  	},
	  	
	  	dragstart = function(d){
	  		//this.parentNode.appendChild(this);
	  		
	  		
	  		startpos = (d.position - 1);
	  		currentpos = startpos;
	  		dragoffset = cy(mydata[startpos].position);
	  		
	  		draggedcontainer = d3.select("g." +  mydata[startpos].value);
	   		
	  		draggedcontainer.select("rect")
	  			.style("fill", highlighted(startpos))
	  			.style("stroke", highlighted(startpos));
	  		
	  		
	  		//make any previously selected pointers transparent
	  		var listitems = d3.selectAll("g.listitem");
	  		
	  		var pointers = listitems.selectAll("g")
	  		
	  		pointers.selectAll("circle")
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  		
	  		pointers.selectAll("line")
	  			.style("stroke-opacity", 0.0)
	  	   
	  				
	  		//now make the current pointer opaque	
	  		var pointer = draggedcontainer.select("g")
	  		
	  		pointer.selectAll("circle.inner")
	  			.style("stroke-opacity", 1.0)	
	  			.style("fill-opacity", 1.0)	
	  		
	  		pointer.selectAll("circle.outer")
	  			.style("stroke-opacity", 1.0)	
	  			.style("fill-opacity", 1.0)	
	  			
	  		pointer.selectAll("line")
	  			.style("stroke-opacity", 1.0)	
	  			
	  	},
	  	
	  	moveneighbour = function(pos){
	  		
	  		var neighbourcontainer = d3.select("g." +  mydata[pos].value);
			var newpos = -1;
			
			if (pos > startpos && pos > 0 && pos < mydata.length){	
				newpos = mydata[pos].position - 1;
				mydata[pos].position = newpos;
				mydata[startpos].position += 1;	
			}
			else if (pos < startpos && pos >= 0 && pos < mydata.length-1){	
				newpos = mydata[pos].position + 1;
				mydata[pos].position = newpos;
				mydata[startpos].position -= 1;
			
			}
		
			if (newpos == -1){
				return;
			}
			
			//individually set the x and y coords.  this is much easier than translating the g container
			//as then would need to subsequently offset by whatever translated to.
			
			neighbourcontainer.select("circle.outer")
					.transition()
					.duration(transitionduration)
					.attr("r", multiplier(newpos) * ((height/mydata.length) / 2) - 4)
					.attr("cy", cy(newpos))
				
			neighbourcontainer.select("circle.inner")
					.transition()
					.duration(transitionduration)
					.attr("r", multiplier(newpos) * ((height/mydata.length) / 2) - 7)
					.attr("cy", cy(newpos))
					.style("fill", "#fff")
					.style("stroke",function(d){return colour(newpos-1)})
		
			neighbourcontainer.select("text.rank")
					.transition()
					.duration(transitionduration)
					.attr("y", cy(newpos))
					.attr("font-size", multiplier(newpos) * 35 + "px")	
					.text(function(d){return newpos})
			
			neighbourcontainer.select("text.label")
					.transition()
					.duration(transitionduration)
					.attr("y", cy(newpos))
					.attr("font-size", multiplier(newpos) * 35 + "px")	
					.text(function(d){return d.value})
						
			neighbourcontainer.select("rect")
					.transition()
					.duration(transitionduration)
					.attr("y", y(newpos))
					.style("fill",colour(newpos-1))	
					.style("stroke",colour(newpos-1))	
		
		
			//these are currently transparent so no point in doing a transition.
			neighbourcontainer.select("g")
					.selectAll("circle")
					.attr("cy", cy(newpos))
					.attr("cx", cx(newpos))
			
			neighbourcontainer.select("g")
					.select("circle.inner")		
					.style("fill",colour(newpos-1))	
			
			neighbourcontainer.select("g")
					.selectAll("line")
	  				.attr("y1", cy(newpos))
	  				.attr("y2", cy(newpos))	
	  				.attr("x2",  cx(newpos))
	  				.style("stroke", function(d){return colour(d.position-1)});
	  	},
	  	
	  	dragit = function(d){
	  		
	  		currentpos = parseInt(calcpos(d3.event.y + (height/mydata.length)/2));
	  		
	  		//shuffle the neighbouring rects above or below down/up if position changes
		
	  		if(Math.abs(currentpos-startpos) >= 1){ //if there has been some kind of movement
	  			if (currentpos > startpos){
	  				for (var i = startpos+1; i <= currentpos; i++){
	  					moveneighbour(i); 
	  				}
	  				
	  			}else{
	  				for (var i = startpos-1; i >= currentpos; i--){
	  					moveneighbour(i);
	  				}
	  			}
	  		 	mydata.sort(function(a,b){return (a.position > b.position) ? 1 : (a.position < b.position) ? -1 : 0})
	  		 	
	  			startpos = currentpos;
	  			
	  			//selects seem to be quite expensive, so must do a minimum in the dragit function!
	  			draggedcontainer.select("text.rank").text(mydata[currentpos].position)
	  		}	
	  	
     		draggedcontainer
     			 .style(transform, function(d) {return "translate(0px," + -(dragoffset-d3.event.y) + "px)"; });
	   	},
	   			
	   	
	   	dragend = function(d,i){
	   	
	   		//reset translation to 0 and update the x,y coords.  We do a translate as its the only
	   		//way of shifting a svg group (g) element. And is more efficient than shifting each 
	   		//component that makes up a group element.
	   		
	   		draggedcontainer
	  			.style(transform, function(d){return "translate(0px,0px)";})
	  			
	   		draggedcontainer.select("rect")
	  				.attr("y", y(mydata[currentpos].position))	
	  		
	  		draggedcontainer.select("rect")
	  				.style("fill", colour(currentpos))
	  				.style("stroke", colour(currentpos));
	  		
	  	    draggedcontainer.selectAll("circle.ranking")
	  				.attr("cy", cy(mydata[currentpos].position))
	  				
	  		draggedcontainer.select("circle.outer")
	  				.attr("r", multiplier(mydata[currentpos].position) * ((height/mydata.length) / 2) - 4)
	  				
	  				
	  		draggedcontainer.select("circle.inner")
	  				.attr("r", multiplier(mydata[currentpos].position) * ((height/mydata.length) / 2) - 7)
	  				.style("fill", "#fff")
	  				.style("stroke",function(d){return colour(d.position - 1)})
	  		
	  		draggedcontainer.selectAll("text")
				.attr("y", function(d){return cy(mydata[currentpos].position)})
	  			.attr("font-size", function(d){return multiplier(currentpos) * 35 + "px"})	
	  		
	  		
	  		var pointer   = draggedcontainer.select("g");
	  		
	  		pointer.selectAll("circle")
	  				.attr("cy", cy(mydata[currentpos].position))
	  		
	  		pointer.selectAll("circle")
	  				.transition()
	  				.duration(transitionduration)	
	  				.attr("cx", cx(mydata[currentpos].position))
	  		
	  		pointer.select("circle.inner")
	  				
	  				.style("fill", function(d){return colour(d.position-1)});
	  				
	  		pointer.selectAll("line")
	  				.attr("y1", cy(mydata[currentpos].position))
	  				.attr("y2", cy(mydata[currentpos].position))	
	  				.style("stroke", function(d){return colour(d.position-1)});
	  				
	  		pointer.selectAll("line")
	  				.transition()
	  				.duration(transitionduration)		
	  				.attr("x2", cx(mydata[currentpos].position))	
	  						  			
	  		svg.selectAll("path")
	  					.transition()
	  					.duration(transitionduration)
	  					.style("fill", colour(d.position-1));
	  		
	  		console.log(mydata[mydata[currentpos].position-1].comments[0]);
	  		
	  		svg.selectAll("text.comment")
	  					.text(mydata[mydata[currentpos].position-1].comments[0])
	  					.call(wrap, {0:100,1:260,3:350, 4:380, 5:360, 6:180, 7:160},{5:-80,6:-90, 7:-80})			
	   	},
	   	
	   	drag = d3.behavior.drag()
	   					  .on("dragstart", dragstart)
	   					  .on("drag", dragit)
	   					  .on("dragend", dragend),
	   	
	   	toggleoverlay = function(){

	   	},
	   	
	   	renderbubble = function(){
	   		
    		var comment1 = svg
    						.append("g")
    						.attr("transform", "translate(" + (89.714286 + bubblemargin.left) + ", -1030.0007)")
    						
    			comment1
    						.append("path")
    						.attr("d", largebubble)
    					  	.style("stroke-width", 10)
    					  	.style("stroke", "#262238")
    					  	.style("fill", colour(0))
    		
    			comment1
    						.append("circle")
							.attr("cx",75)
							.attr("cy",1400)
							.attr("r", 25)
							.style("fill", "#fff")
							.style("stroke", colour(0))
							.style("stroke-width", 6)
							.style("stroke-opacity", 1.0)	
							.style("fill-opacity", 1.0)
							.on("mouseover", function(d){
															d3.select(this).style("fill", colour(0));
															comment1.select("text").style("fill", "#fff");
															
														}
															
							)	
							.on("mouseout", function(d){d3.select(this).style("fill", "#fff")
														comment1.select("text").style("fill", colour(0));
														})	
							.on("click", toggleoverlay)
							
				/*comment1
    						.append("foreignObject")
	  						.attr("width", 380)
	  						.attr("height", 120)
	  						.attr("y", 1080)
	  						.attr("x", -80)
	  						.append("xhtml:body")
	  						.append("xhtml:div")
	  						.attr("class", "comment")
	  						.attr("width", 350)
	  						.attr("height", 120)
	  						.append("span")
	  						.text(mydata[startpos].comments[0])	*/
	  			comment1
	  					.append("g")
	  					.attr("width", 300)
	  					.attr("height", 200)
	  					.attr("transform", "translate(115, -15)")
	  					.append("text")			
	  					.attr("class", "comment")
	  					.attr("dy", ".3em")
	  					.attr("y", 1080)
	  					.attr("text-anchor", "middle")
	  					.attr("fill", "#fff")
	  					.text(mydata[startpos].comments[0])
	  					.call(wrap, {0:100,1:260,3:350, 4:380, 5:360, 6:180, 7:160},{5:-80,6:-90, 7:-80})
	  								
				comment1
    						.append("text")
	  						.attr("class", "label")
	  						.attr("text-anchor", "middle")
	  						.attr("fill", colour(0))
	  						.attr("y", 1400)
	  						.attr("x", 75)
	  						.attr("dy", ".3em")
	  						.attr("font-size", "35px")
	  						.text("+")
	  						.on("mouseover", function(d){comment1.select("circle").style("fill", colour(0));
	  													d3.select(this).style("fill", "#fff")});	
							
							
    		var comment2 = svg
    						.append("g")
    						.attr("transform", "translate(" + (-181, + bubblemargin.left) + ", -830)")
    			
    			comment2
    						.append("path")
    						.attr("d", smallbubble)
    					  	.style("stroke-width", 10)
    					  	.style("stroke", "#262238")
    					  	.style("fill", colour(0))
    					  	
    	
    					  	
    	},
	     
	  	renderlist = function(){
	  		
	  		var itemheight = height/mydata.length;
	  		var vcenter    = (itemheight / 2) - rectmargin/2;
	  		
	  		var list = svg.selectAll(".mylist")
	  					.data(mydata)
	  			
	  			
	  		//essential that the drag is called on the same object that we translate on		
	  		var container = list.enter()
	  						.append("g")
	  						.attr("class", function(d){return d.value + " listitem"})
	  						.call(drag)
	  		container
	  			.append("rect")
	  			.attr("rx", 8)
	  			.attr("ry", 8)
	  			.attr("x", function(d){return 0})
	  			.attr("y", function(d){return (d.position - 1) * itemheight})
	  			.attr("width" , function(d){return width-pointerwidth})
	  			.attr("height", function(d){return itemheight-rectmargin})
	  			.style("fill", function(d){return colour(d.position - 1)})
	  			.style("stroke", function(d){return colour(d.position - 1)})
	  			.style("stroke-width", 3)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
				
	  			
	  		container
	  			.append("text")
	  			.attr("class", "label")
	  			.attr("text-anchor", "middle")
	  			.attr("fill", "white")
	  			.attr("y", function(d){return cy(d.position)})
	  			.attr("x", function(d){return (width-pointerwidth)/2})
	  			.attr("dy", ".3em")
	  			.attr("font-size", function(d){return multiplier(d.position-1) * 35 + "px"})
	  			.text(function(d){return d.value})
	  						
	  		
	  		container
	  			.append("circle")
	  			.attr("class", "ranking outer")
	  			.attr("cx", function(d){return 0})
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return multiplier(d.position-1) * (itemheight / 2) - 4})
	  			.style("fill", "#fff")
	  			.style("stroke", "#fff" )
	  			.style("stroke-width", 4)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
	  			
	  		
	  		container
						.append("circle")
						.attr("class", "ranking inner")
						.attr("cx", function(d){return 0})
						.attr("cy", function(d){return cy(d.position)})
						.attr("r", function(d){return multiplier(d.position-1) * (itemheight / 2) - 7})
						.style("fill", "#fff")
						.style("stroke",function(d){return colour(d.position - 1)})
						.style("stroke-width", 4)
						.style("fill-opacity", 1.0)	
						.style("stroke-opacity", 1.0)
						
	  		
	  		
	  			
	  		container
	  			.append("text")
	  			.attr("class", "rank")
	  			.attr("text-anchor", "middle")
	  			.attr("y", function(d){return cy(d.position)})
	  			.attr("dy", ".35em")
	  			.attr("font-size", function(d){return multiplier(d.position-1) * 35 + "px"})
	  			.text(function(d){return d.position})
	  			
	  				
	  		var pointer = container
	  			.append("g")

	  		
	  		pointer.append("circle")
	  			.attr("class", "outer")
	  			.attr("cx", function(d){return cx(d.position)})//return width + pointerwidth - (itemheight / 2) })
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return ((height/mydata.length) / 2)})
	  			.style("fill", "#262238")
	  			.style("stroke", "#fff")
	  			.style("stroke-width", 4)
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  			
	  		pointer.append("circle")
	  			.attr("class", "inner")
	  			.attr("cx", function(d){return cx(d.position)})//width + pointerwidth - ((height/mydata.length) / 2) })
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return ((height/mydata.length) / 4)})
	  			.style("fill", function(d){return colour(d.position - 1)})
	  			.style("stroke", "#fff")
	  			.style("stroke-width", 8)
	  			.style("stroke-opacity", 0.0)	
	  			.style("fill-opacity", 0.0)	
	  		
	  		pointer.append("line")
	  			.attr("y1", function(d){return cy(d.position)})
				.attr("x1", function(d){return width - pointerwidth})
				.attr("y2", function(d){return cy(d.position)})
				.attr("x2", function(d){return cx(d.position)  })
	  			.style("stroke", function(d){return colour(d.position - 1)})
	  			.style("stroke-width", 3)
	  			.style("stroke-opacity", 0.0)
	  		
	  			
	  	},
	  	
	  	
	  	wrap = function(text, width, xpadding) {
	  	
			 text.each(function() {
			 	
				var text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.1, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				while (word = words.pop()) {
				  line.push(word);
				  tspan.text(line.join(" "));
				  lwidth   = width[''+lineNumber] ? width[''+lineNumber] : 300;
				  xp       = xpadding[''+lineNumber] ? xpadding[''+lineNumber] : 0;
				  
				  if (tspan.node().getComputedTextLength() > lwidth) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", xp).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				  }
				}
			  });
		},
		
		
	  	init = function(){
	  	
	  		renderbubble();	
			renderlist();
	  	}

	return {
		init:init,
	}

});
