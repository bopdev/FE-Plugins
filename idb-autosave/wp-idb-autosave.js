var wp_idb_autosave_db_ver = '1.0.0';
(function($){
	$(document).on('ready', function(){
		
		if( ! window.indexedDB || ! Dexie )
			return;
		
		//window.indexedDB.deleteDatabase('wp-idb-autosave');
		
		var db = new Dexie('wp-idb-autosave');
		
		db.version(wp_idb_autosave_db_ver.replace(/\./g,'')).stores({pages:'++id,path', forms:'++id,path_id,selector,order', fields:'++id,form_id,selector', revisions:'++id,field_id,value,time'});
		
		db.open();
		
		var pageID;
		var currPagePath = window.location.href;
		db.pages.where('path').equals(currPagePath).first(function(page){
			pageID = page.id;
		}).catch(function(){
			db.pages.add({path:currPagePath}).then(function(id){
				pageID = id;
			}).catch(function(n){
				console.error(n);
			});
		});
		
		function makeInputSelector(el){
			var $el = $(el);
			var id = $el.attr('id');
			var sel = el.tagName;
			
			if(id) return sel+'#'+id;
			
			var type = $el.attr('type');
			if(type) sel += '[type="'+type+'"]';
			
			var name = $el.attr('name');
			if(name) sel += '[type="'+name+'"]';
			
			return sel;
		}
		
		function makeFormSelector(el){
			var $el = $(el);
			var id = $el.attr('id');
			var sel = el.tagName;
			
			if(id) sel+'#'+id;
			/*var classes = $el.attr('class');
			if(classes){
				classes = classes.split(' ');
				$.each(classes, function(k,v){
					sel += '.'+v.trim();
				});
			}*/
			
			var action = $el.attr('action');
			if(action) sel += '[action="'+action+'"]';
			
			var method = $el.attr('method');
			if(method) sel += '[method="'+method+'"]';
			
			return {selector:sel, order:$(sel).index(el)};
		}
		
		function getInputsFormSelector(el){
			var id = $(this).attr('form');
			if(id){
				return makeFormSelector($('form#'+id).get(0));
			}
			var $form = $(this).closest('form');
			if($form.length){
				return makeFormSelector($form.get(0));
			}else{
				return {selector:false, order:false};
			}
		}
		
		function getDBForm(formSel){
			var result;
			
			db.forms
			.where('page_id').equals(pageID)
			.and(function(form){
				return form.selector == formSel.selector
			}).and(function(form){
				return form.order == formSel.order;
			}).limit(1).each(function(form){
				result = form;
			});
			
			return result;
		}
		
		function addDBForm(formSel, cbthen, cbcatch){
			db.forms
			.add({page_id:pageID, selector:formSel.selector, order:formSel.order})
			.then(cbthen)
			.catch(cbcatch);
		}
		
		function getDBField(fieldSel, formID){
			var result;
			
			db.fields
			.where('form_id').equals(formID)
			.and(function(field){
				return field.selector == fieldSel.selector
			}).limit(1).each(function(form){
				result = form;
			});
			
			return result;
		}
		
		function addDBField(fieldSel, formID, cbthen, cbcatch){
			db.forms
			.add({form_id:formID, selector:fieldSel.selector})
			.then(cbthen)
			.catch(cbcatch);
		}
		
		function getDBRevisions(fieldID){
			var result;
			
			result = db.revisions
			.orderBy('time')
			.where('form_id').equals(formID);
			
			return result;
		}
		
		function getDBRevision(revisionID){
			var result;
			
			result = db.revisions
			.limit(1)
			.where('revision_id').equals(revisionID);
			
			return result;
		}
		
		function addDBRevision(fieldID, value, cbthen, cbcatch){
			time = Date.now();
			db.revisions
			.add({field_id:fieldID, value:value, time:time})
			.then(cbthen)
			.catch(cbcatch);
		}
		
		function updateDBRevision(revisionID, update, cbthen, cbcatch){
			db.revisions
			.update(revisionID, update)
			.then(cbthen)
			.catch(cbcatch);
		}
		
		var inputSelectors = 'input[type!="hidden"][type!="button"][type!="submit"][type!="reset"][type!="search"][data-wpidbas_type!="revision"], select, textarea';
		
		var revisionExplorerBtn = $('<button type="button" data-wpidbas_action="openRevisionExplorer">R</button>');
		
		$('body')
		.on('prepare_inputs.wpidbas', inputSelectors, function(){
			//var sel = makeInputSelector(this);
			//var formSel = getInputsFormSelector(this);
			//var form = getDBForm(formSel, true);
			//var field = getField(sel, formID);
			
			//var btn = revisionExplorerBtn.clone().data('wpidbas_btn_reference_field_id', sel).data('wpidbas_btn_reference_form', formSel);
			
			//$(this).after(btn);
		})
		.on('start_revising.wpidbas', inputSelectors, function(){
			var $t = $(this);
			var field = $t.data('wpidbas_field');
			if( ! field ){
				var formSel = getInputsFormSelector(this);
				var form = getDBForm(formSel);
				if( ! form ){
					addDBForm(formSel, function(){
						$t.trigger('start_revising.wpidbas');
					});
					return;
				}
				var sel = makeInputSelector(this);
				field = getDBField(sel, form.id);
				if( ! field ){
					addDBField(sel, form.id, function(){
						$t.trigger('start_revising.wpidbas');
					});
					return;
				}
				$t.data({'wpidbas_field':field, 'wpidbas_field_id':field.id, 'wpidbas_field':form});
			}
			//add btn
		})
		.on('change.wpidbas', inputSelectors, function(){
			this.saveRevisionTimeoutIDs = Array.isArray(this.saveRevisionTimeoutIDs) ? this.saveRevisionTimeoutIDs : [];
			this.saveRevisionTimeoutIDs.push(
				window.setTimeout(
					function(el){
						//Only save when the user has stopped editing
						if(el.saveRevisionTimeoutIDs.length > 1){
							while(el.saveRevisionTimeoutIDs.length > 1){
								window.clearTimeout(el.saveRevisionTimeoutIDs.shift());
							}
							return;
						}
						$(el).trigger('save_revision.wpidbas');
					}
					,5000
					,this
				)
			);
		})
		.on('save_revision.wpidbas', inputSelectors, function(){
			var $t = $(this);
			var value = '';
			var field = $t.data('wpidbas_field');
			switch($t.attr('type')){
				case 'checkbox':
					value = [];
					$(field.sel).filter(':checked').each(function(){
						value.push($(this).val());
					});
				break;
				case 'radio':
					$(field.sel).filter(':checked').each(function(){
						value = $(this).val();
					});
				break;
				default:
					value = $t.val();
				break;
			}
			addDBRevision(field.id, value);
		})
		.on('restore.wpidbas', inputSelectors, function(revision){
			if( ! revision )
				return;
		})
		.on('focus', inputSelectors, function(){
			$(this).trigger('start_revising.wpidbas');
		});
		
		
		$(window).on('load', function(){
			$('body '+inputSelectors).trigger('prepare_inputs.wpidbas');
		});
	});
})(jQuery);
