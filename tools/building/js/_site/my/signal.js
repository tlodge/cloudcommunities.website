define([ /* No dependencies. */ ], function(){
 
 
	// Define the Signal class. Each signal will be responsible
	// for a specific event beacon attached to an object.
	function Signal( context, eventType ){ 
		// Store the context (the object on which this event
		// is being attached).
		this.context = context;
 
		// Store the event type - the name of the event.
		this.eventType = eventType;
 
		// Create a queue of callbacks for this event.
		this.callbacks = [];
	}
 
	// Define the class methods.
	Signal.prototype = {

		// I bind an event handler.
		bind: function( callback ){

			// Add this callback to the queue.
			this.callbacks.push( callback );

		},
 
 
		// I dispatch the event with the given parameters.
		dispatch: function(){
 		
 		
			// Create an event object.
			var event = {
				type: this.eventType,
				target: this.context,
				dispatched: new Date()
			};
 
			// Create a clean array of arguments.
			var dispatchArguments = Array.prototype.slice.call(arguments);
 
			// Push the event onto the front of the arguments
			// that are being used to trigger the event.
			dispatchArguments.unshift( event );
			
			// Invoke the callbacks with the given arguments.
			for (var i = 0 ; i < this.callbacks.length ; i++){
 
				this.callbacks[ i ].apply(this.context, dispatchArguments);
 
			}
 
		},
 
 
		// I unbind an event handler.
		unbind: function( callback ){
 
			// Map the callbacks to remove the given callback.
			// Keep in mind that a given callback might be bound
			// more than once (no idea why).
			this.callbacks = $.map(this.callbacks,function( boundCallback ){
 
				// Check to see if the given callback is the
				// one that we want to unbind.
					if (boundCallback === callback){
 
					// Return NULL to remove from queue.
						return( null );
 
					} else {
 
					// Return the callback to keep bound.
						return( boundCallback );
 
					}
 
				}
			);
 
		}
	};
 
 
	// -------------------------------------------------- //
	// -------------------------------------------------- //
 
	// Return the class constructor.
	return( Signal );
 
});