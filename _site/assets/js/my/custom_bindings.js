define(['knockout'], function(ko){
    
   //separate options in binding
	ko.bindingHandlers.stripe = {
		update: function(element, valueAccessor, allBindingsAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor()); //creates the dependency
			var allBindings = allBindingsAccessor();
			var even = allBindings.evenClass;
			var odd = allBindings.oddClass;

			//update odd rows
			$(element).children(":nth-child(odd)").addClass(odd).removeClass(even);
			//update even rows
			$(element).children(":nth-child(even)").addClass(even).removeClass(odd);;
		}
	}


    ko.bindingHandlers.viewMoreBinding = {
        init: function(element, valueAccessor){
            var shouldDisplay = valueAccessor();
            $(element).toggle(shouldDisplay());
        },
        
        update: function(element, valueAccessor){
            var shouldDisplay = valueAccessor();
            if (shouldDisplay()){ 
                $(element).fadeIn();
            }
            else{
                $(element).hide();
            }
        }
    };


    ko.bindingHandlers.accordian = {
          
        init: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
          
            $(element).next().hide();
        },
        
        update: function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
    
            var slideUpTime = 300;
            var slideDownTime = 400;

            var openState = ko.utils.unwrapObservable(valueAccessor());
            var focussed = openState.focussed;
            var shouldOpen = openState.shouldOpen;
            
            if (focussed) {

                var clickedGroup = viewModel;

                $.each(bindingContext.$root.menuItems(), function (idx, group) {
                    if (clickedGroup != group) {
                        group.openState({focussed: false, shouldOpen: false});
                    }
                });
            }

            var dropDown = $(element).next();

            if (focussed && shouldOpen) {
                dropDown.slideDown(slideDownTime);
            } else if (focussed && !shouldOpen) {
                dropDown.slideUp(slideUpTime);
            } else if (!focussed && !shouldOpen) {
                dropDown.slideUp(slideUpTime);
            }
        }
    };       
});
