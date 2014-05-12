define(['knockout','d3', 'ajaxservice', 'knockoutpb', 'custom_bindings'], function(ko,d3,ajaxservice){

	var
		init = function(){
			d3.xml('static/face.svg', 'image/svg+xml', function (error, data) {
				if (error) {
					console.log('Error while loading the SVG file!', error);
				}
				else {
					d3.select('.face')
    				  .node()
    				  .appendChild(data.documentElement)
    				 
    				 var svg = d3.select('.face svg');
    				 
    				 var face = svg.select('#sentiment')
    				 	.on('mouseenter', function(){
    				 		svg.select('#mouth').transition().duration(1000)
    				 			.attr("d", "M20.1015625,64.5449219 C29.5121193,64.7541457 31.4453125,55.5722656 53.9746094,59.984375 C76.5039062,64.3964844 81.15625,65.9023438 81.15625,65.9023438")
    				 			
    				 	 /* face.transition()
			 				.duration(500)
    				 		.attr("transform", "translate(20,20)")*/
    				 	}).on('mouseleave', function(){
    				 		svg.select('#mouth').transition().duration(1000)
    				 			.attr("d", "M20.1015625,64.5449219 C29.5121193,64.7541457 28.0996094,76.6914062 50.6289062,81.1035156 C73.1582031,85.515625 81.15625,65.9023438 81.15625,65.9023438")
    				 		
    				 	  /*face.transition()
			 				.duration(500)
    				 		.attr("transform", "translate(1,1)")*/
    				 	});
    				 	
    				 var lefteye = svg.select('#lefteye')
    				 	.on('mouseenter', function(){
    				 		lefteye.style('fill',  '#AB69C6');
    				 	})
    				 	.on('mouseleave', function(){
    				 		lefteye.style('fill',  '#ffffff');
    				 	});
    				 	
    				 /*var appButton = svg.select('#AppButton')
						.on('mouseenter', function () {
							// put on some flashy color!
							appButton.style('fill', '#AB69C6');
						});*/
    				
				}
			});
		}
		
	return {
		init: init
	}

});