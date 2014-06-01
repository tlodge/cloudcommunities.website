define(['jquery','knockout', 'knockoutpb', 'custom_bindings','firebase'], function($,ko){

	var 
			
		sections = ko.observableArray([
											{
												name:"governance",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/governance.png',
											},
											{	name:"communication",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/communication.png',
											},
											{
												name:"rules",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/rules.png',
											},
											{
												name:"action",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/action.png',
											},
											{
												name:"living",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/living.png',
											}
										]),
	 	
	 	section = ko.observable().syncWith("section"),
	 	
	 	homevisible = ko.computed(function(){
			return section() == "home";	
		}),
		
	 	stickyNavTop = $('.barnav').offset().top,
		
		stickyNav = function(){  
		
			var scrollTop = $(window).scrollTop();  
		
			if (scrollTop > stickyNavTop) {   
				$('.barnav').addClass('sticky');  
			} else {  
				$('.barnav').removeClass('sticky');   
			}  
		},
		
		
		commentsfor = function(section){
			for (i = 0; i < sections().length; i++){
				if (sections()[i].name == section){
					return sections()[i].comments;
				}
			}
		},
		
		commentfor = function(section){
			for (i = 0; i < sections().length; i++){
				if (sections()[i].name == section){
					return sections()[i].comment;
				}
			}
		},
		
		postcomment = function(s){
			console.log("posting to section");
			console.log(s);
			fb = new Firebase('https://block49.firebaseio.com/' + s);

			var pushref = fb.push();
			
			for (i = 0; i < sections().length; i++){
				if (sections()[i].name == s){
					pushref.set({
	  					comment:  sections()[i].comment()
					});
				}	
			}
		},
		
		sectionClicked =  function(s){
			
			$('html, body').animate({
					scrollTop: $("#" + s).offset().top - 40
			},1000);
		},
		
		init = function(){
		
				section("home");
		
				var fb = new Firebase('https://block49.firebaseio.com/');
				
				fb.on("value", function(data) {	
					console.log(data.val());
					for (var item in data.val()){
						for (i = 0; i < sections().length; i++){
							if (sections()[i].name == item){
								sections()[i].comment("");
								for (value in data.val()[item]){
									c = data.val()[item][value].comment;
									if (sections()[i].comments().indexOf(c) == -1){
										sections()[i].comments.push(c);
									}
								}
							}
						}
					}
				});
		},
		
		scroller = function(){
			$(window).scroll(function() {  
    			stickyNav();  
			})
		}()
		
	return{
		section:section,
		sections: sections,
		sectionClicked:sectionClicked,
		postcomment:postcomment,
		commentsfor:commentsfor,
		commentfor:commentfor,
		homevisible:homevisible,
		init:init,	
	}

});