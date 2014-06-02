define(['jquery','knockout', 'knockoutpb', 'custom_bindings','firebase'], function($,ko){

	var 
			
		sections = ko.observableArray([
											{
												name:"governance",
												id:"governance",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/governance.png',
												overview: "The Barbican has several volunteer residents committees who act on behalf of the rest of the community, to make decisions in the interest of all.  <strong> How well does this work? </strong>",
												thoughts:"Many residents <strong> give up their time </strong> to help manage the Barbican.  Although 'just' volunteers, they may need to negotiate domains as wide ranging as engineering, planning, law, architecture and technology.  Their roles may be equally diverse: resolving disputes, improving and maintaining the estate, liaising with fellow residents, councillors, MPs, planners and management.  <strong> Is it right that unpaid volunteers find themselves responsible for (and exert influence over) hundreds of millions of pounds worth of real estate</strong>, (not to mention residents' lives)? Should they be 'cut some slack', given that they donate their time and take on the responsibility?  And given they're residents can they take an unbiased position on all decisions? Here are a few choice quotes from discussions on barbicantalk:  <blockquote>If someone doesn't have the time (or even the temperament or abilities) to volunteer to help out, it doesn't mean their criticisms aren't valid.</blockquote><blockquote>It's all very well for a house group member to say that anyone can join the committee and have a say.  But most of us lack the will or the time to be useful members of a committee that on occasion has to deal with complicated matters.</blockquote><blockquote>How come such a tiny number of residents can put a spanner in the works for the rest of us? Please, not more delays!</blockquote><blockquote> Ask us to study, say, all the CrossRail papers, and most of us will melt away, while grateful to those few who stay.  But ask us to express a preference about the colour of our flats and a far greater number will not only take an interest but will also have a valid view.</blockquote>",
												
											},
											{	name:"communication",
												id:"communication",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/communication.png',
												overview: "Barbicantalk is an amazing resource with over <strong>2000</strong> members, and over <strong>50,000</strong> posts.  But how well do forums work?",
												thoughts:"We've not read all of barbicantalk's <strong>50,000</strong> posts.  But it is clear that the forum is being used for a <strong>huge range of purposes</strong>: socialising, recommendations, advice (sought and offered), warnings, complaints, community action.  The forum is a <strong>rich but unwieldy resource</strong>; useful information ('where can I buy x?') mixes with outdated content ('anyone experiencing tv reception problems at the moment?) and lengthy debates.  There have been many discussions on <strong>moderation, anonymity and participation</strong> (i.e. restricted to residents or open to all). How could we design a <strong>better communication service</strong>?  Would full anonymity be useful in certain cases?  Would it be useful to send messages to apartments, floors and blocks (or even 'the owner of the car in bay X').  And can we make it easier for residents to get a message out to fellow residents - an app or even a dedicated 'apartment appliance'? <blockquote>I'm worried I'll be labeled as a 'muck-raker' when the people down in the Estate Office read my whine here</blockquote><blockquote>I've administered boards myself, and noticed that criticism can be easier to express than appreciation</blockquote><blockquote>I simply would like to know whether there are rules regarding deleting threads. If there are not such rules, any deletion, no matter what the good intention behind it is, is arbitary and subjective. If there are user rules, then whoever joins the forum should abide by them.</blockquote>",
											},
											{
												name:"rules",
												id:"rules",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/rules.png',
												overview: "High-rise residents are legally bound by the terms of the <strong>lease</strong>.  Despite being a fairly <strong>rigid</strong> and <strong>formal</strong> document, it is open to interpretation; there are also many day to day rules that it does not cover.",
												thoughts:"Do the rules in the <strong>lease</strong> really represent the <strong>wants and needs</strong> of current Barbican residents?  Does it make sense to have rules applied estate-wide, or would it be better to let different <strong>towers and blocks to set their own terms?</strong> What systems need to exist in order to allow residents to adapt rules over time in sympathy with <strong>changing needs</strong> and attitudes? <blockquote>Maybe its my profession taking over, but 'rules are rules' is too simplistic. Rules intended to prevent neighbours getting annoyed should be applied flexibly to cases where there isn't actually any reason to get annoyed. To take an analogy, it's unlawful for someone to touch you without your permission. But that doesn't mean you can sue everyone who bumps into you at rush hour on the tube; you need to show you've suffered some harm. As judges like to say, de minimis non curat lex.</blockquote><blockquote>I know it is easy to mock some of its more fastidious clauses, but actually I wish the Estate Office did more to enforce the rules.</blockquote><blockquote>In this day and age so many people buy or rent flats elsewhere and never really pay much attention to the rules and nothing is normally done about this</blockquote><blockquote>OK, so people don't have to live here. But that doesn't mean that everything in the lease is automatically justified. It's not as if the lease is a democratic instrument agreed by the will of the residents. It was written by lawyers working for the Corporation and reflects the Corporations ideas, circa 1981 or whenever they started selling off the flats, of what should and shouldn't be allowed</blockquote>",
											},
											{
												name:"action",
												id:"action",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/action.png',
												overview: "The Barbican has <strong>3500+</strong> residents.  How well do they pull together to bring about <strong>positive</strong> change?",
												thoughts:"The forum has been used to <strong>exert pressure</strong> (for example construction noise in unsociable hours),<strong>drive campaigns</strong> (boycotting restaurants with nefarious tipping policies), <strong>object to planning</strong> and even bring in a <strong>new supermarket</strong> to the area.  But could the Barbican community be coordinated to extend and increase its power? <blockquote>we need a communications strategy that keeps people in touch and involved, and clearly should do better than we have done on that score.</blockquote><blockquote>If people have unexpended energy and want to expend it on such a campaign, all well and good, and I will be the first to cheer when it succeeds. However, given what is currently on my plate, I cannot find time to do more than cheer from the sidelines on this.</blockquote><blockquote>I have a belief that unless those who are directly affected are closely involved things are unlikely to progress either quickly or appropriately</blockquote><blockquote>The immediate impact and financial hurt of a boycott will be felt by the very staff you are trying to help. I still think that we cannot take one newspaper article and presume to draw conclusions as to how an apparently sucessful restaurant (everyone agrees the staff seem happy and the food is good) should run its business</blockquote>",
											},
											{
												name:"living standards",
												id:"living",
												comment : ko.observable(""),
												comments: ko.observableArray([]),
												image: '/assets/img/comic/living.png',
												overview: "Barbican is a high-rise living <strong>success story</strong>.  But how can you tell if <strong>standards<strong> are <strong>slipping</strong>?",
												thoughts:"What is the measure of <strong>how well the estate is being managed?</strong> Aside from anecdotal observations, how does one track the <strong>effectiveness</strong> of the management of the Barbican over time, are there a set of metrics that can be used to <strong> hold management to account</strong>, and if so, how can they be collected?<blockquote>It struck me once again just how awful the Estate looks now, and how sharp its decline has been over the past two years.</blockquote><blockquote>Apologies if these pictures offend anyone. I am posting them in the hope that, by raising awareness of the Estate's decline, this will not be our 'new normal'.</blockquote><blockquote>There must be something we can do as a collective. It's poor management and lets face it, we are paying top dollar to live here. </blockquote><blockquote>As I am away for work all day, I find it very hard (read impossible) to know when (if) there has been progress done on the works.</blockquote>",
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