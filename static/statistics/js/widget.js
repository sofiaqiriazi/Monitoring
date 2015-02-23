$(function(){	
		var demo = {

			yScroll: function(wrapper, scrollable) {

				var wrapper = $(wrapper), scrollable = $(scrollable),
					loading = $('<div class="loading">Loading...</div>').appendTo(wrapper),
					internal = null,
					images	= null;
					scrollable.hide();
					images = scrollable.find('img');
					completed = 0;
					
					images.each(function(){
						if (this.complete) completed++;	
					});
					
					if (completed == images.length){
						setTimeout(function(){							
							loading.hide();
							wrapper.css({overflow: 'hidden'});						
							scrollable.slideDown('slow', function(){
								enable();	
							});					
						}, 0);	
					}
			
				
				function enable(){
					var inactiveMargin = 99,
						wrapperWidth = wrapper.width(),
						wrapperHeight = wrapper.height(),
						scrollableHeight = scrollable.outerHeight() + 2*inactiveMargin,
						wrapperOffset = 0,
						top = 0,
						lastTarget = null;

					
					wrapper.mousemove(function(e){
						lastTarget = e.target;
						wrapperOffset = wrapper.offset();		
						top = (e.pageY -  wrapperOffset.top) * (scrollableHeight - wrapperHeight) / wrapperHeight - inactiveMargin;
						if (top < 0){
							top = 0;
						}			
						wrapper.scrollTop(top);
					});	
				}			
			}
		}

		
		demo.yScroll('#scroll-pane', 'ul#sortable');

			
});
