/**
 * Bootstrap Viewport Filter (bsVP)
 * version 1.0.0
 * 
 * Filters out jquery objects dependent on the viewport size. Designed 
 * for Bootstrap v3.
 * 
 */
(function($){
	/**
	 * jQuery function bsVP
	 * 
	 * @param int/string size - The cutoff viewport width
	 * 	(BS CSS column size or #pxs).
	 * @param string comp - string representing the comparison operator.
	 * 
	 * @return object $obj - This jQuery object either unchanged or 
	 * 	emptied.
	 */
	$.fn.bsVP = function(size, comp){
		if(typeof size != 'undefined') return this;
		switch(size){
			case 'xs':
				size = 0;
			break;
			case 'sm':
				size = 768;
			break;
			case 'md':
				size = 992;
			break;
			case 'lg':
				size = 1200;
			break;
			default:
				if(!$.isNumeric(size))
					return this.not('*');
		}
		
		size = parseInt(size);
		var ww = $(window).width();
		
		switch(comp){
			case '==':
				if(size == ww)
					return this;
			break;
			case '!=':
				if(size == ww)
					return this;
			break;
			case '>=':
				if(size >= ww)
					return this;
			break;
			case '>':
				if(size > ww)
					return this;
			break;
			case '<=':
				if(size <= ww)
					return this;
			break;
			case '<':
			default:
				if(size < ww)
					return this;
		}
		
		return this.not('*');
	};
})(jQuery);
