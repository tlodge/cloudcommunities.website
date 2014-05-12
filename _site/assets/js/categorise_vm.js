define(['jquery','knockout', 'ajaxservice'], function($, ko, ajaxservice){

    var
       	self = this,
       	
       	pSentimentLabels = {1: "absence of anything positive",
       						2: "some weak positive elements of generic ethusiasm without negative slant (e.g) hey!",
       						3: "clear positive elements of messages (includes fun, happiness, optimism, positive evaluations, love",
       						4: "overwhelmingly positive or several positive elements or some emphasis of positive elements",
       						5: "enthusiastically positive (e.g. I am very happy!!!!)"
       						},
       	
       	nSentimentLabels = {1: "absence of anything negative",
       						2: "some negative elements (e.g a casual 'miss you')",
       						3: "clear negative elements of message",
       						4: "overwhelmingly negative or several negative elements or some emphasis of negative elements",
       						5: "definitely negative (e.g. this is totally shit)"},
       	
       	topicindex 	 = 0,
       	
       	datasource	= ko.observable(),
       
       	topics		= ko.observableArray([{}]),
       	
       	topic		= ko.observable(topics()[topicindex]),
       	
       	selectedCategories = ko.observableArray([]),
       	
       	selectedNSentiment = ko.observable({}),
       	
       	selectedPSentiment = ko.observable({}),
       	
       	selectedChildren	 = ko.observableArray([]),
       	
        children = ko.observableArray([]),
       	
       	categories  = ko.observableArray([]),
       	
       	notes		= ko.observable(""),
       	
       	oldcatdata = [							
       										/* person situation  track down (trying to find) (i.e where is, what happened to) -- could add  (also find duck lady comment)
       										/*information*/
       										{"id": 1, "name": "advice sought" /*inc opinions*/,  "children":["decoration","upholstery","IT","water softener","facility","thermostat","insulation","deliveries","toilet","directions","phone","parking","product","water pump","concessions/discounts","neighbour etiquette", "jury service","cleaning", "storage","dimensions","procedure", "security", "locks", "radio","splash boards","mail","orientation", "appliances", "heating","switches", "carpets", "limescale","electrics", "broadband", "tv", "mobile", "legal", "DIY", "flooring", "boiler", "energy", "energy prices", "service charge", "lease", "condensation", "transport", "insurance", "buzzer", "renovation", "interior", "aircon", "area/living", "flood", "disposal", "business" /* specific business names*/, "cleaner", "noise", "balcony doors", "property plans", "pigeons", "communication", "source product", "window boxes", "fire safety"]}, 
       										{"id": 2, "name":"help sought", "children":["donations","volunteers","web address","contact details","influence","watering plants","storage","input","property use", "expertise", "borrow", "original fixtures/fittings", "restoration", "moving", "computer", "wifi borrowing"]},
       										
       										/* news? - take from gossip/media? */
       										
       										/*advice unbidden, includes speculation! - should perhaps separate out advice from info?*/
       										{"id": 3, "name": "advice offered", "children":["opening times","consultation","contact details","investigation","congestion charge","link","property plans","pests/infestations","radio","disposal", "orientation","heating", "carpets", "broadband", "tv", "legal", "boiler", "plumbing", "energy", "service charge", "lease", "condensation", "transport", "smoke alarms", "property prices", "insurance", "antisocial", "recycling", "concessions/discounts", "management", "plants", "window boxes", "original fixtures", "procedure", "future projects", "appliances"]}, 
       										/* general recommendations sought/offered */
       										{"id": 4,"name": "local business", "children":["printers","framer","jeweller", "electrical repairs", "optician","furniture store","dry cleaner", "pest control","watch repair","chiropodist","knife sharpening","live-in help", "bathroom installer","acupuncture therapist", "architect","curtain/blind fitters", "christmas trees","joiner","piano tuner","babysitters","lawyer","hypnotherapist","nutritionist","car rental","physiotherapist","bath resurfacing", "ironing","web designer","personal trainer","appliance engineer","catering","kitchen installer", "garage","tiler","tv repair","gardeners","accountant", "it support", "interior design", "locksmith", "builder", "supermarket", "laundry","pet shop", "glazier", "restaurant", "carpenter", "tradesman", "plumber", "window cleaner", "shop", "pub", "school", "solicitors", "plasterer", "doctor", "mechanic", "dentist", "childcare", "roofer", "flooring", "gym", "balcony doors", "electrician", "cleaner", "carpet cleaner", "carpet fitter", "handyman", "dog walker", "man with van", "takeaway", "estate agent", "removal company", "painter decorator", "hairdresser", "vegetable boxes", "taxi", "secretary", "technician", "tailor", "charity", "car sharing", "uphosterer"]},
       										
       										{"id": 5, "name": "warning", "children":["noise", "vibrations", "health/safety","works","scam", "mugging", "suspicious individual(s)", "maintenance", "business", "driving penalties", "road closure", "fire", "station closure", "weather"]},
       										{"id": 6, "name": "antisocial", "children":["assault", "swearing", "homophobia","homeless","drugs",  "drink", "intimidation", "fight", "dogs", "prostitution", "theft","crime", "youths", "graffiti", "litter",  "fly tipping", "noise", "fellow residents", "vandalism", "cars", "shopping trolleys", "trespassing", "break in", "squatters"]},
       										{"id": 7, "name": "living", "children":["health","security","privacy","brand","safety","composting", "noise", "lights", "daylight", "smell", "cats", "wildlife", "cold callers", "quality of life/environment", "junk mail", "post", "pests", "temperature", "fellow residents", "lost and found" ]},
       										{"id": 8,"name": "local area", "children":["polling station", "post office","museum/gallery/exhibition","bridge","bank","hotel","superstore","ymca","courses","garden center","roads","hospital","wine bar","clothes recycling","park","event", "church", "supermarket", "market", "planning", "licences","restaurant", "construction", "plumber", "shop", "pub", "nightclub", "school", "nursery", "solicitors", "gossip", "parking", "request for info", "sports facilities", "wedding location", "venue", "cinema", "bus", "tube", "local authority"]},
       										{"id": 9,"name": "local incident", "children":["gun fire", "police raid","earthquake","theft","pick-pocket","demonstration","murder","police","episode","arrest","robbery","alarm","police on site", "fire", "explosion", "accident", "request for info", "request for witnesses", "eviction", "event", "terrorism", "shooting"]},
       										/* governance */
       										{"id": 10, "name": "rules", "children":["broken","procedural issue","validity","enforcement notices","rights", "clarification advice", "flooring","modification request","communal areas","rental", "balcony", "parking", "bbq", "airbnb", "improvements", "access", "recycling", "smoking", "enforcement request", "enforcement advice", "procedural advice", "animals"]},
       										{"id": 11, "name": "legal", "children":["review", "illegality","compensation","appeal","status advice","LVT", "lease", "dispute", "AGM", "freehold", "clause breach", "invoke rights", "threat"]},
       										{"id": 12, "name": "media", "children":["related"]},
       										
       										/* perhaps change pressure to lobbying and petitions to objections */
       										{"id": 13, "name": "action", "children":["media awareness", "questionnaire","test support","poll","demonstration","formal complaint","broadband", "mp", "planning", "councillor", "management company", "service charges", "freeholder", "neighbourhood watch", "policing", "community funds", "campaign", "community building", "charity", "pool resources", "pressure", "reporting", "claim", "petition", "logging"]},
       								
       										/*social*/
       										{"id": 14, "name": "social", "children":["person(s) status","death announcement", "link","open house","philanthropy","tips","competition","quiz","politics","introduction", "event", "sports", "club", "history", "drink", "party", "children", "car share", "gossip", /*inc news*/ "game", "borrow", "pictures", "walking", "conservation", "freebies", "shared interest", "banter", "neighbourliness", "magazine", "would like to meet", "charity"]},
       										
       										/*property management*/
       										{"id": 15, "name": "management", "children":["complaint resolution", "council tax","meeting","report","request", "ground rent", "service charge", "lease", "communication", "residents association", "proposal", "contact details", "council", "culpablility", "request for comment", "request for disclosure"]},
       										{"id": 16, "name": "staff", "children": ["concierge", "security", "cleaner", "maintenance", "builders", "gardeners", "caretaker", "parking attendant", "porters", "tipping"]},
       										{"id": 17, "name": "management company", "children":["disinterest", "service charge", "performance", "trust", "project", "tender", "comparison", "specific responsibility" /*(who is who?)*/, "contracts"]},
       										{"id": 18, "name": "property issue", "children":["snagging list","concrete cancer","security", "drains","access", "insulation", "intercom", "windows", "balcony doors", "heating", "parking", "grounds", "stairs", "lift", "roof", "corridors", "doors", "gates", "floors", "gym", "balcony", "cctv", "rubbish","water", "fire alarm", "decoration", "health/safety", "pests/infestations", "mould", "damp", "crime prevention", "lighting", "walls","ceiling", "carpets", "meters", "works", "guttering", "notice board", "bin", "asbestos"]},
       										
       										/*commerce & finance*/
       										{"id": 19,"name": "commerce", "children":["flat share", "wanted","property rental", "property sale", "service offered", "service sought", "prospective buyer", "parking", "storage", "for sale", "promotion"]},
       										/* principally property finance */
       										{"id": 20,"name": "finance", "children":["letting","renting", "HIP", "estate agent commission", "building survey", "prices", "insurance","council tax", "fees", "service charges", "water meter", "water prices", "energy prices", "rental prices", "property prices", "equity release", "mortgage", "lease extension"]},
       										
       										/*website*/
       										{"id": 21,"name": "website", "children":["security", "empty post","request for help", "anonymity","hack", "spam", "about", "input", "complaint", "observation", "moderation", "issue", "close", "functionality question", "role", "content request", "audience", "acceptable use", "external perception"]},
       										
       										/*specific thread here on barbican, answered by police */
       										{"id": 22, "name": "policing", "children":["meeting","compliment","newsletter","advice sought","request for witnesses", "complaint","advice offered","warning", "request for input", "contacts"]},
       										
       										{"id":23, "name": "documentation", "children":["guide","archives","floorplan","map", "flyer", "blueprints"]},
       										
       										{"id":24, "name": "property suggestion", "children":["composting bins", "parcel store","planting","bike racks", "feature removal", "storage", "water meter", "lighting", "heating system", 'floor numbers','gates']},
       										{"id": -1,"name": "+", "children":[]}
       									
       									];	
       							
       									/* combine management */
       									/* update culpability and responsibility */
       									/* set local business to recommendation (sought/provided) */
       									
       									
       	psentiment	= ko.observableArray([{"id":1, "name":"1 (none)"},
       									 {"id":2, "name":"2 (weak positive elements)"},
       									 {"id":3, "name":"3 (clear positive elements)"},
       									 {"id":4, "name":"4 (overwhelmingly positive)"},
       									 {"id":5, "name":"5 (enthusiastically positive)"},
       									]),
       	
       	
       	nsentiment = ko.observableArray([{"id":1, "name":"1 (none)"},
       									 {"id":2, "name":"2 (some negative elements)"},
       									 {"id":3, "name":"3 (clear negative elements)"},
       									 {"id":4, "name":"4 (overwhelmingly negative)"},
       									 {"id":5, "name":"5 (definitely negative)   "},
       									]),
		//attach observables..
		
		anon = function(){
       		nsentiment().forEach(function(item){
       			item.nselected = ko.computed(function(){
       				return item.id== selectedNSentiment().id
       			});
       		});
       		psentiment().forEach(function(item){
       			item.pselected = ko.computed(function(){
       				return item.id == selectedPSentiment().id
       			});
       		});
       	}(),	
       	
		nSentimentSummary = ko.computed(function(){
			if (selectedNSentiment()){
				return nSentimentLabels[selectedNSentiment().id];
			}
			return "";
		}),
		
		pSentimentSummary = ko.computed(function(){
			if (selectedPSentiment()){
				return pSentimentLabels[selectedPSentiment().id];
			}
			return "";
		}),
		
		tlen = ko.computed(function(){
			return topics().length;	
		}),
		
		updateAnnotations = function(){
			selectedCategories([]);
			selectedChildren([]);
			selectedNSentiment(0);
       		selectedPSentiment(0);
       		notes("");
       		
			if (topic().category){
				catarray = topic().category.split(",");
				
				for (i = 0; i < catarray.length; i++){
					cname = catarray[i];
					cat = $.grep(categories(), function(e){return e.name == cname});
				
					if (cat && cat.length > 0){
						if (selectedCategories().indexOf(cat) <= -1){
							selectedCategories.push(cat[0]);
							children(cat[0].children());
						}
					}
				}
			}	
		
			if (topic().subcategory){
				carray = topic().subcategory.split(",");
				
				for (i = 0; i < carray.length; i++){  
					selectedChildren.push(carray[i]);
				}
			}
			if (topic().nsentiment){
				console.log(topic().nsentiment);
				sentiment = $.grep(nsentiment(), function(e){return e.id == topic().nsentiment});
				selectedNSentiment(sentiment[0])
			}
			if (topic().psentiment){
				console.log(topic().psentiment);
				sentiment = $.grep(psentiment(), function(e){return e.id == topic().psentiment});
				selectedPSentiment(sentiment[0])
			}	
			if (topic().notes){
				notes(topic().notes);
			}
		},
		
		
		completed = ko.computed(function(){
			return selectedPSentiment() != 0 && selectedNSentiment() != 0 && selectedCategories().length > 0 && selectedChildren().length > 0;
		}),
		
		completedText = ko.computed(function(){
			if (completed())
				return "completed";
			return "incomplete";
		}),
		
		gottopics = function(data){
			topics(data.topics);
			topic(topics()[topicindex]);
			updateAnnotations();
			console.log(topic());
		},
		
		
		postedcat = function(data){
			topic().category = data.topic.category;
			topic().subcategory = data.topic.subcategory;
			topic().psentiment = data.topic.psentiment;
			topic().nsentiment = data.topic.nsentiment;
			topic().notes	 = data.topic.notes;
			topicindex = ++topicindex % topics().length;
       		topic(topics()[topicindex]);
       		updateAnnotations();
		},
		
		init = function(){
			ajaxservice.ajaxGetJson('categorylist', {}, function(data){
				data.categories.forEach(function(item){
       				item.selected = ko.computed(function(){
       					return selectedCategories().indexOf(item) > -1;		
       				});
       				item.children = ko.observableArray(item.children);
       				categories.push(item);
       			});
			 	ajaxservice.ajaxGetJson('topics', {} , gottopics);
			
			});
       	},
       	
       	next = function(){
       		if (completed()){
       			//send just the names of categories
       			names = [];
       			for (i = 0; i < selectedCategories().length; i++){
       				names.push(selectedCategories()[i].name);
       			}
       			ajaxservice.ajaxPostJson('annotate', {
       						"tid": topic().tid, 
       						"psentiment":selectedPSentiment().id, 
       						"nsentiment":selectedNSentiment().id, 
       						"category":names.join(), 
       						"subcategory":selectedChildren().join(),
       						"notes":notes()} , postedcat);
       		}else{
       			postedcat({});
       		}
       	},
       	
       	previous = function(){
       		if (topicindex >= 1){
       			topicindex--;
       			topic(topics()[topicindex]);
       		}
       		updateAnnotations();
       	},
       	
       	isChildSelected = function(child){
       		return selectedChildren().indexOf(child) > -1;
       	},
       	
       	setChildSelected = function(child){
       		if (selectedChildren().indexOf(child) > -1){
       			selectedChildren.remove(child);
       		}else{
       			selectedChildren.push(child);
       		}
       	},
       	
       	//setters and getters for category
		setCategorySelected = function(category){
			if (selectedCategories().indexOf(category) > -1){
				selectedCategories.remove(category);	
			}else{
				selectedCategories.push(category);	
				children(category.children().sort());
			}
			
		},
		
		//setters and getters for sentiment
		setNSentimentSelected = function(sentiment){
			selectedNSentiment(sentiment);	
		},
		
		setPSentimentSelected = function(sentiment){
			selectedPSentiment(sentiment);	
		},
	
		isPSentimentSelected = function(sentiment){
			return sentiment.id == selectedPSentiment().id
		},
		
		isNSentimentSelected = function(sentiment){
			return sentiment.id == selectedNSentiment().id
		}

    return {
    	tlen: tlen,
    	init: init,
    	gottopics: gottopics,
    	postedcat: postedcat,
    	topic: topic,
    	next: next,
    	previous: previous,
    	psentiment:psentiment,
    	nsentiment:nsentiment,
    	children:children,
    	categories: categories,
	
    	setCategorySelected: setCategorySelected,
    	//isCategorySelected: isCategorySelected,
    	
    	selectedCategories: selectedCategories,
    	selectedChildren: selectedChildren,
    	setChildSelected: setChildSelected,
    	isChildSelected: isChildSelected,
    	
        setPSentimentSelected: setPSentimentSelected,
        setNSentimentSelected: setNSentimentSelected, 
        isPSentimentSelected: isPSentimentSelected,
        isNSentimentSelected: isNSentimentSelected,  
        
        nSentimentSummary : nSentimentSummary,  
        pSentimentSummary : pSentimentSummary,  
        
        notes: notes,
        
        completed: completed,
        completedText: completedText,
    }
});

