(function($){
	$.fn.bsVP = function(size, comp){
		switch(size){
			case 'xs':
				size = 0;
			break;
			case 'sm':
				size = 750;
			break;
			case 'md':
				size = 970;
			break;
			case 'lg':
				size = 1170;
			break;
			default:
				if(!$.isNumeric(size))
					return this.not('*');
		}
		
		size = parseInt(size);
		var ww = $(window).width();
		
		switch(comp){
			case '<':
				if(size < ww)
					return this;
			break;
			case '<=':
				if(size <= ww)
					return this;
			break;
			case '>=':
				if(size >= ww)
					return this;
			break;
			case '==':
				if(size == ww)
					return this;
			break;
			case '!=':
				if(size == ww)
					return this;
			break;
			case '>':
			default:
				if(size > ww)
					return this;
		}
		
		return this.not('*');
	};
})(jQuery);