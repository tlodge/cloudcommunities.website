define(['jquery','d3'], function($,d3){

	var 
	
		startpos   = 0,
		
		rectmargin = 30,
		
		dragoffset = -1,
		
		dragging, transitioning,
		
		keyspressed  = [],
		
		rankwidth 	= 50,
		
		pointerpadding = [100, 20,60,80,100],
		
		transitionduration = 300,
		
		draggedcontainer,
		
		commentwidth = 574,
		
		overlayflag   = false,
		
		keypressflag = false,
		
		authflag = false,
		
		usagetimer,
		
		bbottom = "m -118.78471,1563.6424 c 201.876986,-7.519 392.8574,15.8184 573.56946,-31.6134 l 0,136.1186 -573.56946,0 z",
           blarge = "M 29.282024,1420.9671 C 7.379162,1378.497 11.316807,1321.3478 -5.928182,1319.6516 c -17.24499,-1.6961 -108.681998,-61.2786 -98.162758,-135.0924 10.519256,-73.814 82.924889,-131.2813 161.060303,-155.258 78.135497,-23.9768 193.162097,-9.8424 251.531227,61.4956 58.36914,71.3381 28.74293,143.6877 -21.01262,185.6988 -48.89349,41.2832 -154.35158,62.9144 -198.48786,67.0891 -44.136199,4.1744 -52.123545,36.4431 -59.718086,77.3824 z",
              bsmall = "m 316.0968,1488.6856 c 14.34671,-31.4682 7.26485,-41.2372 27.91587,-50.4904 20.65099,-9.2533 73.40237,-48.4377 60.95479,-102.1563 -12.44758,-53.7184 -71.54617,-94.254 -133.07728,-110.2059 -61.53123,-15.952 -149.19809,-3.3204 -189.898566,49.9697 -40.7006,53.2901 -13.63852,105.5559 27.121226,135.2529 40.05354,29.1823 122.46823,42.873 156.67252,45.0385 34.20439,2.1657 47.57915,1.0282 50.31144,32.5915 z",
         
		largebubble	= "m 26.32223,1410.4308 c -20.219119,-36.46 -9.310099,-97.6009 -34.930027,-107.8203 -25.619848,-10.2195 -92.566843,-54.5542 -82.856263,-117.9224 9.710664,-63.3683 76.550267,-112.7031 148.679211,-133.2868 72.129029,-20.5837 178.313199,-8.4496 232.195339,52.7931 53.88214,61.2427 26.5334,123.354 -19.39733,159.4198 -45.13494,35.4411 -142.4862,54.0113 -183.22957,57.595 -40.743352,3.5838 -60.240984,52.1285 -60.46136,89.2216 z",
         
        smallbubble	 = "m 319.50702,1472.0793 c 10.65284,-26.2562 4.58484,-49.195 22.01232,-58.0584 17.42748,-8.8635 61.0417,-43.984 47.09288,-86.2364 -13.94875,-42.2524 -67.7148,-70.6788 -122.16924,-79.2038 -54.45444,-8.5249 -129.98491,7.7108 -162.29633,53.3154 -32.311406,45.6047 -5.733446,85.6748 31.44961,106.6768 36.53882,20.638 109.02922,25.8958 138.91038,25.2551 29.88124,-0.6404 40.79014,13.1066 45.00038,38.2513 z",
         
        transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform",
	  	
		//colours		 = ["#880e4f","#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
		
		colours = ["#9c27b0",  "#00bcd4",  "#e91e63",  "#cddc39",  "#ff5722"],
		
		mydata = [{position: 1, value: "greggs", comments:['aass nice wwwwww w wwwwww WWWWWWWW  wwwwww w ww ww wwww comment one about greggs which should also go nicely onto a new line and I can say quite a bit too which is good and this makes it all loook terribly nice','a a a a very much www w ww w ww w nice nicer nicer comment two about greggs and again aaa a a aa and again wwww let us see how far we cab go today and tomorrow and the']},
				  {position: 2, value: "birds", comments:['a nice comment one about birds','a nicer comment two about birds']}, 
				  {position: 3, value: "asda", comments:['a nasty comment one about asda','a nice comment two about asda']},
				  {position: 4, value: "coop", comments:['a lovely comment one about coop','a devastating comment two about coop']},
				  {position: 5, value: "tesco",comments:['a nice comment one about tesco','an okish comment two about tesco']}],
				  
		margin    = {top:0, right:0, bottom:0,left:0},
		
		width 	  = 450 - margin.left - margin.right,
		
		// iPad mini landscape height = 806px
	  	height    = 768 - margin.top - margin.bottom,
		
		bubblemargin = {top:0, left: width, right:0, bottom:0},
		
		topbarheight = 80,
	  	
	  	svg  = d3.select("#list").append("svg")
				.attr("width", width + commentwidth + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")"),
	
		rectheight = ((height-topbarheight)/mydata.length),
	  			
	  	y = function(position){
	  		return ((position - 1) * rectheight);
	  	},
	  	
	  	ry = function(position){
	  		return topbarheight + ((position - 1) * rectheight)
	  	},

	  	
	  	cy = function(position){
	  		return topbarheight + ((position - 1) * rectheight) + rectheight/2;
	  	},
	  	
	  
	  	cx = function(position){
	  		return width +  (rectheight / 2);
	  	},
	  
	  	calcpos = function(ypos){
	  		ypos -= topbarheight;
	  		return Math.max(0,Math.min(mydata.length-1, ((ypos/height) * mydata.length)));
	  	},
	  	
	  	colour = function(ypos){
	  		return colours[ypos%colours.length];	
	  	},
	  	
	  	highlighted = function(ypos){
	  		return "#e51c23";
	  	},
	  	
	  	multiplier = function(ypos){
	  		return 1;//0.7 + (0.3 * (1 - (ypos/mydata.length)));
	  	},
	  	
	  	dragstart = function(d){
	  		window.clearTimeout(usagetimer);
	  	
	  		d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	   		
	  		if (dragging  && d.value != dragging)
	  			return
	  		if (transitioning)
				return;	
	  		dragging = d.value;
	  	
	  		startpos = (d.position - 1);
	  		currentpos = startpos;
	  		dragoffset = cy(mydata[startpos].position);
	  		draggedcontainer = d3.select("g." +  mydata[startpos].value);
	   		 
	  	},
	  	
	  	endtransition = function(){
	  		transitioning = false;
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
			}else{
				return;
			}
		
			//individually set the x and y coords.  this is much easier than translating the g container
			//as then would need to subsequently offset by whatever translated to.
			transitioning = true;
			
			neighbourcontainer.select("rect")
					.transition()
					.duration(transitionduration)
					.each("end", endtransition)
					.attr("y", ry(newpos))
					
			neighbourcontainer.select("circle")
					.transition()
					.duration(transitionduration)
					.attr("cy", cy(newpos))
		
			neighbourcontainer.select("text.rank")
					.transition()
					.duration(transitionduration)
					.attr("y", cy(newpos))
					.attr("font-size", multiplier(newpos) * rankwidth + "px")	
					.text(function(d){return newpos})
			
			neighbourcontainer.select("text.label")
					.transition()
					.duration(transitionduration)
					.attr("y", cy(newpos))
					.attr("font-size", multiplier(newpos) * rankwidth + "px")	
					.text(function(d){return d.value})
						
			
		
	  	},
	  	
	  	dragit = function(d){
			
			if (d.value != dragging)
				return;
			
	  		currentpos = parseInt(calcpos(d3.event.y + rectheight/2));
	  		
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
	   		
	   		if (!dragging)
	   			return;
	   		//reset translation to 0 and update the x,y coords.  We do a translate as its the only
	   		//way of shifting a svg group (g) element. And is more efficient than shifting each 
	   		//component that makes up a group element.
	   		
	   		draggedcontainer
	  			.style(transform, function(d){return "translate(0px,0px)";})
	  			
	   		draggedcontainer.select("rect")
	  				.attr("y", ry(mydata[currentpos].position))	
	  	
	  		
	  	    draggedcontainer.select("circle")
	  				.attr("cy", function(d){return cy(mydata[currentpos].position)})
	  				
	  		
	  		draggedcontainer.selectAll("text")
				.attr("y", function(d){return cy(mydata[currentpos].position)})
				
	  						  			
	  		svg.selectAll("path.foreground")
	  					.transition()
	  					.duration(transitionduration)
	  					.style("fill",  d.colour)
	  		
	  		svg.selectAll("text.comment1")
	  					.text(mydata[mydata[currentpos].position-1].comments[0])
	  					.call(wrap, {0:100,1:260,3:365, 4:365, 5:375, 6:290, 7:195, 8:190},{5:0,6:-40, 7:-75, 8: -70})
	  					
	  		svg.selectAll("text.comment2")			
	  					.text(mydata[startpos].comments[1])
	  					.call(wrap, {0:150,1:240,2:260,3:280, 4:270, 5:230, 6:170, 7:100},{})
	  		
	  		
	  		dragging = null;
	  		window.clearTimeout(usagetimer);
	  		usagetimer = window.setTimeout(renderauth, 5000);
	  				
	   	},
	   	
	   	togglekeypad = function(d){
	    	d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	    	overlay = svg.selectAll('rect.authrect');
	    	authflag = !authflag;
	    				 
	    	if (authflag){
	    		overlay.transition().duration(500).style("fill-opacity", 0.8);
	    		renderkeypad();
	    	}
	    	else{
	    		svg.selectAll('g.keypad').remove();
	    		overlay.transition().duration(500).style("fill-opacity", 0.0);
	    	}
	    		
	    },	
	    
	  
	   	keypressed= function(d){
	   		
	   		if (keypressflag)
	   			return;
	   		keypressflag = true;
	   		d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	   		
	   		d3.select(this)
	   			.transition()
	   			.duration(200)
	   			.each("end", function(){(keypressflag = false)})
	   			.style("fill", "#ff0000")
	   			
	   	  	keyspressed.push(d);
	   		if (keyspressed.length == 4){
	   	  		validateinput();
	   	  	}
	   	},
	   	
	   	drag = d3.behavior.drag()
	   					  .on("dragstart", dragstart)
	   					  .on("drag", dragit)
	   					  .on("dragend", dragend),
	   	
	   	overlaydrag =  d3.behavior.drag()
	   					  .on("dragend", togglekeypad),
	   	
	   	keypaddrag  = d3.behavior.drag().on("dragstart", keypressed),
	   					  
	   	
	   	validateinput = function(){
	   		keyspressed = [];
	   		svg.selectAll('g.authoverlay')
	   				.transition()
	   				.each("end", function(){svg.selectAll('g.authoverlay').remove()})
	   				.duration(500)
	   				.style("opacity", 0.0)
	   				
	   				
	   		usagetimer = window.setTimeout(renderauth, 5000);
	   	},
	   	
	   		  		  
	   	toggleoverlay = function(){
	   			
			overlayflag = !overlayflag;
			
			if (overlayflag){
				showoverlay();
			}else{
				hideoverlay();
			}
	   	},
	   	
	   	hideoverlay = function(){
	   		
	   		overlay = svg.selectAll("g.overlay");
	   		
	   		overlay
	   				.transition()
	   				.duration(800)
	   				.attr("transform", "translate(0," +  (-height/2) + ")");
	   	
	   	},
	   	
	   	showoverlay = function(){
	   		
	   		svg.selectAll("g.overlay").remove();
	   	
	   	    overlay = svg.append("g")
	   						.attr("class", "overlay")
	   		
	   		overlay.append("rect")
    					.attr("x", 0)
    					.attr("y", -height/2)
    					.attr("width", width+commentwidth)
    					.attr("height", height/2)
    					.style("fill", "#fff")
    					.style("fill-opacity", 0.95)
    					.style("stroke", "#262238")
    					.style("stroke-width", 2)
    					
	   		overlay
	   				.transition()
	   				.duration(800)
	   				.attr("transform", "translate(0," +  (height/2) + ")");
    						
	   	},
	   	
	   	renderbubble = function(){
	   		
	   		
	   					
	   		var comments = svg
    						.append("g")
    						.attr("class", "comments")
    						.attr("transform", "translate(" + (120 + bubblemargin.left) + "," +  (-980 + topbarheight) + ")");
    						
    			
    			comments.append("rect")
    					.attr("x", -119)
    					.attr("y", 980)
    					.attr("width", commentwidth)
    					.attr("height", height)
    					.style("fill", "#262238")
    					.style("fill-opacity", 0.8)
    								
    			comments
    						.append("path")
    						.attr("class", "bubbleback")
    						.attr("d", bbottom)
    					  	.style("stroke-width", 2)
    					  	.style("stroke", "#fff")
    					  	.style("fill", "#262238")
    					  				
    			comments
    						.append("path")
    						.attr("class", "bubbleback")
    						.attr("d", blarge)
    					  	.style("stroke-width", 10)
    					  	.style("stroke", "#262238")
    					  	.style("fill", "#262238")
    					  	
				
    			comments
    						.append("path")
    						.attr("class", "bubbleback")
    						.attr("d", bsmall)
    					  	.style("stroke-width", 10)
    					  	.style("stroke", "#262238")
    					  	.style("fill", "#262238")	
    			
    			comments
								.append("path")
								.attr("class", "foreground")
								.attr("d", largebubble)
								.style("stroke-width", 2)
								.style("stroke", "#fff")
								.style("fill", colour(0))		
				
				comments
	  					.append("g")
	  					.attr("width", 300)
	  					.attr("height", 200)
	  					.attr("transform", "translate(120, -15)")
	  					.append("text")			
	  					.attr("class", "comment1")
	  					.attr("dy", ".3em")
	  					.attr("y", 1080)
	  					.attr("text-anchor", "middle")
	  					.attr("fill", "#fff")
	  					.text(mydata[startpos].comments[0])
	  					.call(wrap, {0:100,1:260,3:365, 4:365, 5:375, 6:290, 7:195, 8:190},{5:0,6:-40, 7:-75, 8: -70})
	  										  	
    			
    			comments
								.append("path")
								.attr("class", "foreground")
								.attr("d", smallbubble)
								.style("stroke-width", 2)
								.style("stroke", "#fff")
								.style("fill", colour(0))	
								
				comments
	  					.append("g")
	  					.attr("width", 300)
	  					.attr("height", 200)
	  					.attr("transform", "translate(240, 193)")
	  					.append("text")			
	  					.attr("class", "comment2")
	  					.attr("dy", ".3em")
	  					.attr("y", 1080)
	  					.attr("text-anchor", "middle")
	  					.attr("fill", "#fff")
	  					.text(mydata[startpos].comments[1])
	  					.call(wrap, {0:150,1:240,2:260,3:280, 4:270, 5:230, 6:170, 7:100},{})
	  								  			  	
    			comments
    					.append("svg:image")
    					.attr("xlink:href", "/assets/img/buildings.png")
    					.attr("x", -112)
    					.attr("y", 1580)
    					.attr("width", 560)
    					.attr("height",83)
    			
    			
    			comments
    					.append("circle")
    					.attr("class", "addcomment")
	   					.attr("cx", 30)
	   					.attr("cy", 1430)
	   					.attr("r",30)
	   					.attr("fill", "#262238")
	   					.attr("stroke", "white")
	   					.attr("stroke-width", "2px")
	   					.on("click", toggleoverlay)
	   			
	   			comments
    					.append("text")
    					.attr("text-anchor", "middle")
	   					.attr("x", 30)
	   					.attr("y", 1430)
	   					.attr("dy", ".35em")
	   					.attr("font-size", "40px")
	   					.text("+")
	   					.attr("fill", "white")
	   					.on("click", toggleoverlay)
	   			
	   			comments
    					.append("text")
    					.attr("text-anchor", "middle")
	   					.attr("x", 30)
	   					.attr("y", 1480)
	   					.attr("dy", ".35em")
	   					.attr("font-size", "20px")
	   					.text("add comment")
	   					.attr("fill", "white")	
	   					.on("click", toggleoverlay)	
	   					
	   	},
	    
	    renderauth = function(){
	     	

	     	overlay = svg.append("g")
	   					 .attr("class", "authoverlay")	
	   		
	   		overlay.append("rect")
	   					.attr("class", "authrect")
    					.attr("x", 0)
    					.attr("y", 0)
    					.attr("width", width+commentwidth)
    					.attr("height", height)
    					.style("fill", "#fff")
    					.style("fill-opacity", 0.0)
    					.call(overlaydrag)//much more responsive than click or touch!
    					
	    },
	    
	    
	    
	    renderkeypad = function(){
	    	keyspressed = [];
	    	keyradius = 40;
	    	keys = [0,1,2,3,4,5,6,7,8,9];
	    	
	    	mykeypad = svg.selectAll('g.authoverlay')
	    			   	  .append("g")
	    				  .attr("class", "keypad")
	    				  .selectAll("keys")
	        			  .data(keys)
	        
	        var akey = mykeypad.enter()
	    				.append("circle")
						.attr("cx", function(d,i){return 400 + (((i)%3) * ((2*keyradius)+20))})
						.attr("cy", function(d,i){return 200 + (parseInt((i)/3) * ((2*keyradius)+20))})
						.attr("r", keyradius)
						.style("fill", "#fff")
						.style("fill-opacity", 1.0)
						.style("stroke", "#262238")	
						.call(keypaddrag)
	    	
	    }
	    
	    
	  	renderlist = function(){
	  		
	  		var itemheight = height/mydata.length;
	  			
	  		titlebar = svg
	  			.append("g")
	  			
	  			
	  		titlebar
	  			.append("rect")
	  			.attr("class","titlebar")
	  			.attr("x", 0)
	  			.attr("y", 0)
	  			.attr("width" , width+commentwidth)
	  			.attr("height", topbarheight)
	  			.style("fill", "#262238")
	  		
	  		titlebar
	  			.append("text")
	  			.attr("class", "titletext")
	  			.attr("text-anchor", "middle")
	  			.attr("fill", "white")
	  			.attr("x",  (width+commentwidth)/2)
	  			.attr("y",  (topbarheight/2))
	  			.attr("dy", ".35em")
	  			.text("best places to buy bread")
	  			
	  		var list = svg.selectAll(".mylist")
	  					.data(mydata)
	  			
	  			
	  		//essential that the drag is called on the same object that we translate on		
	  		var container = list.enter()
	  						.append("g")
	  						.attr("class", function(d){return d.value + " listitem"})
	  						.call(drag)
	  		
				
	  		container
	  			.append("rect")
	  			.attr("x", function(d){return 0})
	  			.attr("y", function(d){return ry(d.position)})
	  			.attr("width" , function(d){return width})
	  			.attr("height", function(d){return rectheight})
	  			.style("fill", function(d){return colour(d.position - 1)})
	  			.style("stroke", function(d){return colour(d.position - 1)})
	  			.style("stroke-width", 3)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
				.each(function(d){
						d.colour = colour(d.position - 1);
				})
				
				
	  				
	  		container
	  			.append("text")
	  			.attr("class", "label")
	  			.attr("text-anchor", "middle")
	  			.attr("fill", "white")
	  			.attr("y", function(d){return cy(d.position)})
	  			.attr("x", function(d){return (width)/2})
	  			.attr("dy", ".3em")
	  			.attr("dx", ".8em")
	  			.attr("font-size", function(d){return multiplier(d.position-1) * rankwidth + "px"})
	  			.text(function(d){return d.value})
	  						
	  		
	
	  			
	  		container
	  			.append("circle")
	  			.attr("class", "ranking outer")
	  			.attr("cx", rankwidth + 10)
	  			.attr("cy", function(d){return cy(d.position)})
	  			.attr("r", function(d){return rectheight/2.5})
	  			.style("fill", "#2d213a")
	  			.style("stroke", "#fff" )
	  			.style("stroke-width", 2)
	  			.style("fill-opacity", 1.0)	
				.style("stroke-opacity", 1.0)
	  				
	  			
	  		container
	  			.append("text")
	  			.attr("class", "rank")
				.attr("text-anchor", "middle")
				.attr("x",  rankwidth + 10)
	  			.attr("y", function(d){return cy(d.position)})
	  			.attr("dy", ".4em")
	  			.style("fill", "white")
	  			.attr("font-size", function(d){return multiplier(d.position-1) * rankwidth + "px"})
	  			.text(function(d){return d.position})
	  			
	  				
	  		/*var pointer = container
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
	  			.style("stroke-opacity", 0.0)*/
	  		
	  			
	  	},
	  	
	
	  	
	  	wrap = function(text, width, xpadding) {
	  	
			 text.each(function() {
			 	
				var text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.3, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
				while (word = words.pop()) {
					
				  line.push(word);
				  tspan.text(line.join(" "));
				  lwidth   = width[lineNumber] ? width[lineNumber] : 300;
				  
				  
				  if (tspan.node().getComputedTextLength() > lwidth) {
				 	++lineNumber;
				 	xp  = xpadding[lineNumber] ? xpadding[lineNumber] : 0;
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", xp).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
				  }
				}
			  });
		},
		
		
	  	init = function(){
	  		renderbubble();	
			renderlist();
			renderauth();
	  	}

	return {
		init:init,
	}

});
