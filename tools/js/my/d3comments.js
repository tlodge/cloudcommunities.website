define(['jquery','d3'], function($,d3){
	
	var
	
		
        
        margin    = {top:20, right:10, bottom:20,left:35},
		
		width 	  = 500 - margin.left - margin.right,
		
	  	height    = 470 - margin.top - margin.bottom,
				
		bubble 	  = "m 18.418412,1381.8075 c -15.7000089,-28.5466 -5.803644,-62.6496 -15.7324574,-92.5686 -9.2081987,-15.247 -30.4228406,-16.8556 -42.6777366,-29.6819 -29.188275,-21.7923 -53.638677,-57.5686 -45.845838,-95.5559 10.182922,-51.654 55.287738,-87.6765 100.676508,-108.9 69.391733,-32.8801 154.693092,-32.6558 222.822722,3.3353 38.7899,21.1304 73.46742,62.4924 67.87439,109.1353 -6.43574,47.1 -46.60247,82.1761 -89.29953,97.9435 -44.49651,17.7094 -91.87957,27.0604 -139.310352,32.4503 -35.869542,9.2718 -57.405943,48.8325 -58.507706,83.842 z",
         
	  	svg  = d3.select("#comments").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
				.append("g")
				.attr("transform", "translate(89.714286, -1030.0007)")
    	
    	renderbubble = function(){
    		var comment1 = svg
    						.append("path")
    						.attr("d", bubble)
    					  	.style("stroke-width", 2)
    					  	.style("stroke", "#000")
    					  	.style("fill", "none")
    					  	
    	}
     	
		init = function(){
			console.log("initing speech!");
			renderbubble();		
		}
	
	
	
	return {
		init:init,
	}
	
});