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
	 * 
	 * bsVP(size [, comp])
	 * 
	 * @param int/string size - The cutoff viewport width
	 * 	(BS CSS column size or #pxs).
	 * 	(required)
	 * @param string comp - string representing the comparison operator.
	 * 	E.g. '>' empties if window width is smaller than size.
	 * 	(optional) default: '>'.
	 * @return object $obj - This jQuery object either unchanged or 
	 * 	emptied.
	 * 
	 * 
	 * bsVP(size, incb [, outcb])
	 * 
	 * @param int/string size - The cutoff viewport width
	 * 	(BS CSS column size or #pxs).
	 * 	(required)
	 * @param function incb - function on viewport width > size.
	 * 	(required)
	 * @param function outcb - function on viewport width <= size.
	 * 	(optional) default: do nothing.
	 * @return object $obj - this
	 * 
	 * 
	 * bsVP(size, comp, incb [, outcb])
	 * 
	 * @param int/string size - The cutoff viewport width
	 * 	(BS CSS column size or #pxs).
	 * 	(required)
	 * @param string comp - string representing the comparison operator.
	 * 	E.g. '>' empties if window width is smaller than size.
	 * 	(required)
	 * @param function incb - function on conditions met.
	 * 	(required)
	 * @param function outcb - function on conditions not met.
	 * 	(optional) default: do nothing.
	 * @return object $obj - this
	 */
	$.fn.bsVP = function(size, comp, incb, outcb){
		if(typeof size == 'undefined') return this;
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
		var isIn = false;
		
		if(typeof comp == 'function'){
			outcb = incb;
			incb = comp;
			isIn = ww > size;
		}else{
			switch(comp){
				case '<=':
					isIn = ww <= size;
				break;
				case '==':
					isIn = ww == size;
				break;
				case '!=':
					isIn = ww != size;
				break;
				case '>=':
					isIn = ww >= size;
				break;
				case '<':
					isIn = ww < size;
				break;
				case '>':
				default:
					isIn = ww > size;
			}
		}
		
		
		if(typeof incb == 'function'){
			if(isIn){
				this.each(incb);
			}else if(typeof outcb == 'function')
				this.each(outcb);
			return this;
		}else{
			if(isIn)
				return this;
			return this.not('*');
		}
	};
})(jQuery);
