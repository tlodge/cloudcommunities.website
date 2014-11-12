define(['jquery','d3', 'util'], function($,d3,util){

	"use strict";
	var 
	
		startpos   = 0,
		
		rectmargin = 30,
		
		dragoffset = -1,
		
		dragging, transitioning,
		
		keyspressed  = [],
		
		pointerpadding = [100, 20,60,80,100],
		
		transitionduration = 300,
		
		draggedcontainer,
		
		//commentwidth = 574,
		
		overlayflag   = false,
		
		keypressflag = false,
		
		authflag = false,
		
		usagetimer,
		
		helptimer,
		
		currentpos, 
		usagetimeout = 15000,
		helptimeout  = 7000,
	

		helphand = "m 73.222939,186.77729 -8.81248,-21.0859 c -15.07784,-5.2247 -30.15567,-12.6427 -45.23351,-19.2242 -5.96806,-12.5023 -11.4965704,-25.0922 -15.8317204,-39.5793 1.41613,-10.8284 3.82803,-20.8881 10.1775104,-29.9671 7.82983,-1.5338 11.82762,2.0255 12.43925,6.2196 l 0.84808,21.2031 c 5.03434,3.3479 9.09714,8.9116 13.85273,11.0257 5.50212,-5.6125 2.86161,-17.2522 1.69632,-26.5746 l -15.26631,-43.5372 c 0,0 -12.0056,-17.8188 -14.13548,-29.6845 -2.40118,-13.3771 14.33867,-14.5238 18.65887,-8.1986 6.07313,8.1239 12.31969,15.874 17.24529,26.0092 l 18.65878,42.1237 c 0,0 -14.67618,-31.1068 -11.30842,-40.7102 2.28972,-6.5292 13.0927,-6.3454 14.98357,-3.1097 10.22908,18.6809 5.0736,13.0386 17.24529,38.1657 0,0 -14.69154,-24.4991 -10.74293,-33.3596 3.92335,-8.8039 15.96294,-6.0035 19.78961,1.4135 l 11.591081,28.8363 c 0,0 -7.60008,-16.9604 -2.5444,-22.6167 2.44916,-2.7402 8.34661,-3.0667 11.02567,0 7.10536,12.0906 12.87184,24.8505 16.96254,38.4484 3.94774,21.3569 3.27038,41.1721 2.82707,61.0653 3.39256,17.469 5.98541,33.1044 9.37797,43.1371 z",
	    
bbottom = {'path': [{'xcomp': [0.0], 'type': 'M', 'ycomp': [31.613400000000183]}, {'xcomp': [201.876972, 392.8574, 573.56946], 'type': 'C', 'ycomp': [24.094400000000178, 47.43180000000007, 0.0]}, {'xcomp': [573.56946, 0.0], 'type': 'L', 'ycomp': [136.11860000000001, 136.11860000000001]}], 'height': 136.11860000000001, 'width': 573.56946} ,

blarge = {'path': [{'xcomp': [156.738568], 'type': 'M', 'ycomp': [452.75023999999985]}, {'xcomp': [132.8802729, 137.16946149999998, 118.38488, 99.600297, 0.0, 11.458370000000002, 22.91677, 101.786608, 186.897777, 272.00904, 397.30495, 460.88514, 524.46534, 492.19417, 437.99656, 384.73797, 269.86482, 221.78815600000001, 173.711582, 165.011148, 156.738568], 'type': 'C', 'ycomp': [406.4883399999999, 344.2373399999999, 342.3896399999999, 340.54214, 275.64014, 195.2364399999999, 114.83253999999988, 52.2346399999999, 26.117419999999925, 0.0, 15.396209999999996, 93.10303999999996, 170.81024000000002, 249.61893999999984, 295.38074000000006, 340.3496399999999, 363.91184, 368.4592399999999, 373.0063399999999, 408.15603999999985, 452.75023999999985]}], 'height': 452.75023999999985, 'width': 524.46534} ,
bsmall = {'path': [{'xcomp': [299.33981], 'type': 'M', 'ycomp': [303.69550000000004]}, {'xcomp': [314.96735, 307.25325000000004, 329.74795, 352.24261, 409.70351, 396.14463, 382.58578, 318.21098, 251.18653, 184.16194000000002, 88.66837000000001, 44.334246, 0.0, 29.478119, 73.87679, 117.50622000000001, 207.27870000000001, 244.53667000000002, 281.79476, 296.3636, 299.33981], 'type': 'C', 'ycomp': [269.41790000000015, 258.7768000000001, 248.6975, 238.61820000000012, 195.93540000000007, 137.42100000000005, 78.90660000000003, 34.75199999999995, 17.3759, 0.0, 13.759300000000167, 71.80709999999999, 129.8547000000001, 186.78660000000013, 219.13490000000002, 250.92250000000013, 265.83540000000016, 268.1943000000001, 270.55330000000004, 269.31449999999995, 303.69550000000004]}], 'height': 303.69550000000004, 'width': 409.70351} ,
largebubble = {'path': [{'xcomp': [138.87949], 'type': 'M', 'ycomp': [413.50418]}, {'xcomp': [116.8552596, 128.7382106, 100.830995, 72.92386499999999, 0.0, 10.57750999999999, 21.155124999999998, 93.96201299999998, 172.530465, 251.09899, 366.76306999999997, 425.45568, 484.14831, 454.35792, 404.32661, 355.16211999999996, 249.11956, 204.738713, 160.35787599999998, 139.119542, 138.87949], 'type': 'C', 'ycomp': [373.7891800000001, 307.1895800000001, 296.05797999999993, 284.92618000000004, 236.63317999999992, 167.60757999999998, 98.58208000000002, 44.84278000000006, 22.42138, 0.0, 13.217489999999998, 79.92757999999992, 146.6378800000001, 214.29437999999993, 253.5799800000001, 292.18538, 312.4132800000001, 316.31697999999994, 320.22078, 373.09957999999995, 413.50418]}], 'height': 413.50418, 'width': 484.14831} ,
smallbubble = {'path': [{'xcomp': [269.783336], 'type': 'M', 'ycomp': [252.73800000000006]}, {'xcomp': [281.387246, 274.777516, 293.760876, 312.74424600000003, 360.252226, 345.058086, 329.864026, 271.297886, 211.981876, 152.66585600000002, 70.392186, 35.196076000000005, 0.0, 28.950782000000004, 69.453466, 109.254376, 188.216546, 220.76543600000002, 253.314386, 265.197216, 269.783336], 'type': 'C', 'ycomp': [224.13760000000002, 199.15100000000007, 189.4964, 179.8415, 141.5856000000001, 95.56100000000015, 49.53650000000016, 18.572200000000066, 9.286100000000033, 0.0, 17.685300000000097, 67.36120000000005, 117.03750000000014, 160.68499999999995, 183.56200000000013, 206.04230000000007, 211.76960000000008, 211.07169999999996, 210.37429999999995, 225.34850000000006, 252.73800000000006]}], 'height': 252.73800000000006, 'width': 360.252226} ,
        
        transform = ["", "-webkit-", "-moz-", "-ms-", "-o-"].reduce(function(p, v) { return v + "transform" in document.body.style ? v : p; }) + "transform",
	  	
		//colours		 = ["#880e4f","#c2185b", "#e91e63", "#f06292", "#f8bbd0"],
		
		colours = ["#9c27b0",  "#00bcd4",  "#e91e63",  "#cddc39",  "#ff5722"],
		
		mydata = [{position: 1, value: "greggs", comments:['aass nice wwwwww w wwwwww WWWWWWWW  wwwwww w ww ww wwww comment one about greggs which should also go nicely onto a new line and I can say quite a bit too which is good and this makes it all loook terribly nice','a a a a very much www w ww w ww w nice nicer nicer comment two about greggs and again aaa a a aa and again wwww let us see how far we cab go today and tomorrow and the']},
				  {position: 2, value: "birds", comments:['a nice comment one about birds','a nicer comment two about birds']}, 
				  {position: 3, value: "asda", comments:['a nasty comment one about asda','a nice comment two about asda']},
				  {position: 4, value: "coop", comments:['a lovely comment one about coop','a devastating comment two about coop']},
				  {position: 5, value: "tesco",comments:['a nice comment one about tesco','an okish comment two about tesco']}],
				  
		margin    = {top:0, right:0, bottom:0,left:0},
		
		//width 	    = 450 - margin.left - margin.right,
		
		width		= $(document).width() - margin.left-margin.right,
		
		rectwidth   = (9/20) * width,
		
		rankwidth 	= 50,
		
		// iPad mini landscape height = 806px
	  	height    = $(document).height() - margin.top - margin.bottom,
		
		bubblemargin = {top:0, left: width-rectwidth, right:0, bottom:0},
		
		topbarheight = height/6,
	  	
	  	svg  = d3.select("#list").append("svg")
				.attr("width", "100%")
				.attr("height", "100%")
				.attr("viewBox", "0 0 " + width + " " + height)
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
	  	
		//coordinates for the horizontal middle of the rhs comment rect, given width of object to be placed
		commentxpos = function(objwidth, fraction){
			return rectwidth + ((width-rectwidth)*fraction) - (objwidth/2)
		},
		
		//coordinates for the  vertical middle of svg under the topbar
		commentypos = function(objheight, fraction){
			return  topbarheight  + ((height-topbarheight)*fraction) - (objheight/2)
		},
		  
	  	cx = function(position){
	  		return rectwidth +  (rectheight / 2);
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
	  	
	  	
	  	/*generatepath = function(pobj){
	  		return pobj.path.map(function(x){
	  			
	  			var xpath = $.map(x['xcomp'], function(v,i){
	  				return [v, x['ycomp'][i]]
	  			});
	  		
	  			return x.type + " " + xpath.join();
	  		}).reduce(function(x,y){
	  			return x + " " + y;
	  		}) + " z";
	  		
	  	},*/
	  
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
	  					.call(wrap, {
	  										width: 300,
	  										padding: 0,
	  										widths: {0:100,1:260,3:365, 4:365, 5:375, 6:290, 7:195, 8:190},
	  										paddings: {5:0,6:-40, 7:-75, 8: -70}
	  								})
	  								
	  		svg.selectAll("text.comment2")			
	  					.text(mydata[startpos].comments[1])
	  					.call(wrap, {
	  										width: 300,
	  										padding: 0,
	  										widths: {0:150,1:240,2:260,3:280, 4:270, 5:230, 6:170, 7:100},
	  										paddings: {}
	  								})
	  		
	  		
	  		dragging = null;
	  		window.clearTimeout(usagetimer);
	  		usagetimer = window.setTimeout(renderauth, usagetimeout);
	  				
	   	},
	   	
	   
	    
	  
	   	keypressed= function(d){
	   		
	   		if (keypressflag)
	   			return;
	   			
	   		keypressflag = true;
	   		d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	   		
	   		d3.selectAll("circle.keypad")
	   			.style("fill-opacity", 0.7)
	   			
	   		d3.select("circle.key-" + d)
	   			.transition()
	   			.duration(200)
	   			.each("end", function(){(keypressflag = false)})
	   			.style("fill-opacity", 1.0)
	   			
	   			
	   	  	keyspressed.push(d);
	   		if (keyspressed.length == 4){
	   	  		validateinput();
	   	  	}
	   	},
	   	
	   	
	   	togglekeypad = function(d){
	    	d3.event.sourceEvent.stopPropagation();
	   		d3.event.sourceEvent.preventDefault();
	    	var overlay = svg.selectAll('rect.authrect');
	    	authflag = !authflag;
	    				 
	    	if (authflag){
	    		//overlay.transition().duration(500).style("fill-opacity", 0.8);
	    		renderkeypad();
	    	}
	    	else{
	    		svg.selectAll('g.keypad').remove();
	    		//overlay.transition().duration(500).style("fill-opacity", 0.0);
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
	   				.each("end", function(){svg.selectAll('g.authoverlay').remove();showhelp();})
	   				.duration(500)
	   				.style("opacity", 0.0)
	   				
	   				
	   		usagetimer = window.setTimeout(renderauth, usagetimeout);
	   	},
	   	
	   	
	   	showhelp = function(){
	   		popuphelp(200,200, "drag rectangles to set your ranking");
			popuphelp(600,520, "touch here to add a comment!");
			helptimer = window.setTimeout(hidehelp, helptimeout);
	   	},
	   	
	   	popuphelp = function(x,y,helptext){
	   		
	   		var rectx = 119;
	   		var recty = 102;
	   		var helprectheight = 85;
	   		var helprectwidth = 294;
	   		
	   		var help = svg.append("g")
	   					  .attr("class", "help")
	   					  .attr("transform", "translate(" + x + "," + y + ")")
	   					  .style("opacity",0)
	   		
	   		help
	   					.append("rect")
	   					.attr("rx", 8)
	   					.attr("x", rectx)
    					.attr("y", recty)
    					.attr("width", helprectwidth)
    					.attr("height", helprectheight)
    					.style("fill", "#045050")
    					.style("stroke", "#fff")
    					.style("stroke-width", 2)
	   		
	   		help
    					.append("path")
    					.attr("class", "helphand")
    					.attr("d", helphand)
    					.style("stroke-width", 2)
    					.style("stroke", "#fff")
    					.style("fill", "#008080")
    					
    		help
    					.append("text")			
	  					.attr("class", "helptext")
	  					.attr("dy", ".35em")
	  					.attr("y", recty + 24)
	  					.attr("fill", "#fff")
	  					.attr("text-anchor", "middle")
	  					.style("font-size", "26px")
	  					.text(helptext)
	  					.call(wrap, {
	  										width: helprectwidth-26,
	  										padding: 270,
	  										widths: {},
	  										paddings: {}
	  								}
	  					)
	  		
	  		help
	  			.transition()			
	   			.duration(500)
	   			.style("opacity", 1.0);
	   		
	   	},
	   	
	   	hidehelp = function(){
	   	
	   		window.clearTimeout(helptimer);
	   	
	   		svg.selectAll("g.help")
	   				.transition()
	   				.each("end",function(){ svg.selectAll("g.help").remove()})
	   				.duration(500)
	   				.style("opacity", 0);
	   	},
	   
	   		  		  
	   	hidecommentoverlay = function(){
	   		
	   		if (!overlayflag)
	   			return;
	   		overlayflag = false;
	   		
	   		var overlay = svg.selectAll("g.overlay");
	   		
	   		d3.select("textarea.form-control").remove();
    				
	   		overlay
	   				.transition()
	   				.duration(800)
	   				.attr("transform", "translate(0," +  (-height/2) + ")");
	   	
	   	},
	   	
	   	showcommentoverlay = function(){
	   		
	   		if (overlayflag){
	   			return;
	   		}
	   		
	   		overlayflag = true;	
    		
    		d3.select("body").append("textarea")
    					 .attr("class", "form-control")
    					 .attr("rows", 6)
    					 .style("margin", "20px")
    					 .style("width",  width-(2*20) + "px") 
    					 .style("resize", "none")
    					 .style("font-size", "40px")
    					 .style("opacity", 0.0)
    					 		 
	   		svg.selectAll("g.overlay").remove();
	   	
	   	    var overlay = svg.append("g")
	   						.attr("class", "overlay")
	   		
	   		overlay.append("rect")
    					.attr("x", 0)
    					.attr("y", -height/2)
    					.attr("width", width)
    					.attr("height", height/2.2)
    					.style("fill", "#fff")
    					.style("fill-opacity", 0.95)
    					.style("stroke", "#262238")
    					.style("stroke-width", 2)
    					.call(commentoverlaydrag)
    					
    		d3.select("textarea.form-control")
	   				.transition()
	   				.duration(500)
    				.style("opacity", 1.0)
    				
	   		overlay
	   				.transition()
	   				.duration(500)
	   				.each("end", function(){})
	   				.attr("transform", "translate(0," +  (height/2) + ")");
    		
    		
    						
	   	},
	   	
	   	
	   	commentdrag = d3.behavior.drag().on("dragstart", showcommentoverlay),
	   	commentoverlaydrag = d3.behavior.drag().on("dragstart", hidecommentoverlay),	
	   	
	   	xScaleFactor = function(cwidth, newwidth){
	   		console.log("cuuernt with is " + cwidth);
	   		console.log("new witdh is " + newwidth);
	   		console.log("scaling x by " + parseFloat(newwidth)/parseFloat(cwidth))
	   		return parseFloat(newwidth)/parseFloat(cwidth);
	   	},
	   	
	   	renderbubble = function(){
	   		
	   		var x0 	  	 = rectwidth;		
	   		var y0 	  	 = topbarheight;
	   		var cwidth 	 = width - rectwidth;
	   		var cheight  = height-topbarheight;
	   		
	   		var comments = svg
    						.append("g")
    						.attr("class", "comments")
    						
    			
    			comments.append("rect")
    					.attr("x", rectwidth)
    					.attr("y", topbarheight)
    					.attr("width", width-rectwidth)
    					.attr("height", height-topbarheight)
    					.style("fill", "#262238")
    					.style("fill-opacity", 0.8)
    					
    			
    			comments
    						.append("path")
    						.attr("class", "commentfooter")
    						.attr("d", util.transformpath(bbottom, 
    								{
    									scalex:cwidth/bbottom.width, 
    									scaley:(height/5)/bbottom.height, 
    									transx:x0, 
    									transy:height-((height/5)/bbottom.height* bbottom.height)
    								}
    						))
    					  	.style("stroke-width", 2)
    					  	.style("stroke", "#fff")
    					  	.style("fill", "#262238")
    					  	//.attr("transform", "translate(" + rectwidth + "," +  (height-bbottom.height) + "),"  + "scale(" + 	xScaleFactor(bbottom.width, (width-rectwidth)) + ",1.0)" )
    					  			
    						
    			
    			var sf = (cheight/blarge.height)/1.35;
    			
    			comments
					.append("path")
					.attr("class", "bubbleback")
					.attr("d",  util.transformpath(blarge, 
								{
    								scalex: sf,
    								scaley: sf, 
    								transx: (x0 + cwidth/2) - (sf*(blarge.width/1.6)), 
    								transy: (y0 + (cheight/2) - (sf*(blarge.height/1.5)))
    							}
							)	
					)
					.style("stroke-width", 10)
					.style("stroke", "#262238")
					.style("fill", "#262238")
					//.attr("transform", "translate(" + commentxpos(blarge.width,0.5) + "," + commentypos(blarge.height,0.35) + ")");
				
				sf = (cheight/bsmall.height)/1.8;
							
    			comments
					.append("path")
					.attr("class", "bubbleback")
					.attr("d", util.transformpath(bsmall, 
								{
    								scalex: sf,
    								scaley: sf, 
    								transx: (x0 + cwidth/2) - (sf*(bsmall.width/3.3)), 
    								transy: (y0 + (cheight/2) - (sf*(bsmall.height/3)))
    							}
							)	
					)
					.style("stroke-width", 10)
					.style("stroke", "#262238")
					.style("fill", "#262238")	
					//.attr("transform", "translate(" + commentxpos(bsmall.width,0.6) + "," + commentypos(bsmall.height, 0.55) + ")");
					
				sf = (cheight/largebubble.height)/1.4;
    						
    			comments
					.append("path")
					.attr("class", "foreground")
					.attr("d", util.transformpath(largebubble, 
								{
    								scalex: sf,
    								scaley: sf, 
    								transx: (x0 + cwidth/2) - (sf*(largebubble.width/1.6)), 
    								transy: (y0 + (cheight/2) - (sf*(largebubble.height/1.5)))
    							}
							)
					)	
					.style("stroke-width", 2)
					.style("stroke", "#fff")
					.style("fill", colour(0))		
					//.attr("transform", "translate(" + commentxpos(largebubble.width,0.5) + "," + commentypos(largebubble.height,0.35) + ")");
					
				sf = (cheight/smallbubble.height)/2.0;		
					
    			comments
					.append("path")
					.attr("class", "foreground")
					.attr("d", util.transformpath(smallbubble, 
								{
    								scalex: sf,
    								scaley: sf, 
    								transx: (x0 + cwidth/2) - (sf*(smallbubble.width/3.6)), 
    								transy: (y0 + (cheight/2) - (sf*(smallbubble.height/3.6)))
    							}
							)	
					)
					.style("stroke-width", 2)
					.style("stroke", "#fff")
					.style("fill", colour(0))	
					//.attr("transform", "translate(" + commentxpos(smallbubble.width,0.6) + "," + commentypos(smallbubble.height, 0.55) + ")");
				
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
					.call(wrap, {
										width: 300,
										padding: 0,
										widths: {0:100,1:260,3:365, 4:365, 5:375, 6:290, 7:195, 8:190},
										paddings: {5:0,6:-40, 7:-75, 8: -70}
								});
	  					
	  					
	  								  	
    			
    			
								
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
					.call(wrap, {
										width: 300,
										padding: 0,
										widths: {0:150,1:240,2:260,3:280, 4:270, 5:230, 6:170, 7:100},
										paddings: {}
										});
						
					
	  				
	  								  			  	
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
	   					
	   			
	   			comments
					.append("text")
					.attr("text-anchor", "middle")
					.attr("x", 30)
					.attr("y", 1430)
					.attr("dy", ".35em")
					.attr("font-size", "40px")
					.text("+")
					.attr("fill", "white")
	   					
	   			
	   			comments
					.append("text")
					.attr("text-anchor", "middle")
					.attr("x", 30)
					.attr("y", 1480)
					.attr("dy", ".35em")
					.attr("font-size", "20px")
					.text("add comment")
					.attr("fill", "white")	
	   			
	   			//transparent circle to increase hit size		
	   			comments
					.append("circle")
					.attr("class", "addcomment")
					.attr("cx", 30)
					.attr("cy", 1430)
					.attr("r",50)
					.style("opacity", 0.0)	   					
					.call(commentdrag)	
	   					
	   	},
	    
	    renderauth = function(){
	     	

	     	var overlay = svg.append("g")
	   					 .attr("class", "authoverlay")	
	   		
	   		overlay.append("rect")
	   					.attr("class", "authrect")
    					.attr("x", 0)
    					.attr("y", 0)
    					.attr("width", width)
    					.attr("height", height)
    					.style("fill", "#fff")
    					.style("fill-opacity", 0.0)
    					.call(overlaydrag)//much more responsive than click or touch!
    					
	    },
	    
	    keyx = function(i, keyradius, keypadding){
	    	var keypadwidth = (2 * keypadding) +  (3 * keyradius);
	    	var offset = (width/2) - keypadwidth/2; 
	    	return offset + ((i%3) * ((2*keyradius)+keypadding));
	    },
	    
	    keyy = function(i, keyradius, keypadding){
	    	var keypadheight = (3 * keypadding) + (4 * keyradius);
	    	var offset = (height/2) - keypadheight/2; 
	    	return offset + (parseInt(i/3) * ((2*keyradius)+keypadding));
	    },
	    
	    renderkeypad = function(){
	    	keyspressed = [];
	    	var keyradius = 40;
	    	var keypadding = 20;
	    	
	    	var keys = [1,2,3,4,5,6,7,8,9,0];
	    	
	    	var mykeypad = svg.selectAll('g.authoverlay')
	    			   	  .append("g")
	    				  .attr("class", "keypad")
	    				  .selectAll("keys")
	        			  .data(keys)
	        
	        var akey = mykeypad.enter()
	       
	     
	        akey
				.append("circle")
				.attr("class", function(d){return "keypad key-" + d})
				.attr("cx", function(d,i){return keyx(i,keyradius, keypadding)})
				.attr("cy", function(d,i){return keyy(i,keyradius, keypadding)})
				.attr("r", keyradius)
				.style("fill", "#fff")
				.style("fill-opacity", 0.7)
				.style("stroke", "#262238")	
				.style("stroke-width", "3px")
				.call(keypaddrag)
	    	
	    	akey
				.append("text")
				.attr("x", function(d,i){return keyx(i,keyradius, keypadding)})
				.attr("y", function(d,i){return keyy(i,keyradius, keypadding)})
				.attr("text-anchor", "middle")
				.attr("dy", ".35em")
				.attr("font-size", "40px")
				.style("fill", "#000")
				.text(function(d){return d})
	    		.call(keypaddrag)
	    	
	    	
	    },
	    
	    
	  	renderlist = function(){
	  		
	  		var itemheight = height/mydata.length;
	  					  		
					  			
	  		var titlebar = svg
	  			.append("g")
	  			
	  			
	  		titlebar
	  			.append("rect")
	  			.attr("class","titlebar")
	  			.attr("x", 0)
	  			.attr("y", 0)
	  			.attr("width" , width)
	  			.attr("height", topbarheight)
	  			.style("fill", "#262238")
	  		
	  		titlebar
	  			.append("text")
	  			.attr("class", "titletext")
	  			.attr("text-anchor", "middle")
	  			.attr("fill", "white")
	  			.attr("x",  (width)/2)
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
	  			.attr("width" , function(d){return rectwidth})
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
	  			.attr("x", function(d){return (rectwidth)/2})
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
	  	},
	  	
	
	  	resize = function(x){
	  		console.log("resizing!!");
	  		resizeall();
	  	},
	  	
	  	resizeall = function(){
	  	/*	var newwidth  = $(window).width() - margin.left-margin.right;
	  		var newheight = $(window).height() - margin.top - margin.bottom;
	  		var scaleX = 0.0;
	  		var scaleY = 0.0;
	  		
	  		scaleX = parseFloat(newwidth)/width;
	  		scaleY = parseFloat(newheight)/height;
	  			
	  		
	  		console.log("scale x is " + scaleX);
	  		console.log("scale y is " + scaleY);
	  		
	  		var overall = d3.select("svg")
	  		
	  		var topcontainer = overall.select("g");
	  		width = newwidth;
	  		height = newheight;
	  		
	  		//topcontainer
	  		//	.attr("transform", "scale(" + scaleX + "," + scaleY + ")")
	  		
	  		overall
	  			.attr("width", width) 
	  			.attr("height", height)	*/
	  	},
	  	
	  	wrap = function(text, options){
	  		
	  		 var defaultwidth 	= options.width;
	  		 var defaultpadding = options.padding;
	  		 var widths       	= options.widths;
	  		 var paddings     	= options.paddings;
	  		 
			 text.each(function() {
			 	
				var text = d3.select(this),
					words = text.text().split(/\s+/).reverse(),
					word,
					line = [],
					lineNumber = 0,
					lineHeight = 1.3, // ems
					y = text.attr("y"),
					dy = parseFloat(text.attr("dy")),
					xp  = paddings[0] ? paddings[0] : defaultpadding;
					var tspan = text.text(null).append("tspan").attr("x", xp).attr("y", y).attr("dy", dy + "em");
				while (word = words.pop()) {
					
				  line.push(word);
				  tspan.text(line.join(" "));
				  var lwidth   = widths[lineNumber] ? widths[lineNumber] : defaultwidth;
				  
				  
				  if (tspan.node().getComputedTextLength() > lwidth) {
				 	++lineNumber;
				 	xp  = paddings[lineNumber] ? paddings[lineNumber] : defaultpadding;
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", xp).attr("y", y).attr("dy", lineNumber * lineHeight + dy + "em").text(word);
				  }
				}
			  });
		},
		
		
	  	init = function(){
	  		console.log($(window).height(),$(window).width())
	  		console.log($(document).height(),$(document).width())
	  		d3.select(window).on('resize', resize);
	  		
	  		
			renderlist();
			renderbubble();	
			renderauth();
			
	  	}

	return {
		init:init,
	}

});
