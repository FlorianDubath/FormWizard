  window.createModal = function(text) {
  
      var div_glassPane = document.createElement("div");
      var content =" <div class=\"popmod\" id=\"popmod\" > <div class=\"pop_cont\"> <div class=\"pop_text\" id=\"poptxt\"> "+text+"</div><div class=\"pop_btn\" id=\"popok\" title=\"OK\" onClick=\" var mod = document.getElementById('popmod'); mod.parentElement.removeChild(mod);\">OK</div>";  
       content += " </div></div>";
    
     div_glassPane.innerHTML = content
    document.body.appendChild(div_glassPane)
  }
  
  
 window.createValidate = function(text, yes_callback, no_callback) {
  
      var div_glassPane = document.createElement("div");
      var content =" <div class=\"popmod\" id=\"popmod\" > <div class=\"pop_cont\"> <div class=\"pop_text\" id=\"poptxt\"> "+text+"</div><div class=\"pop_btn\" id=\"popyes\" title=\"Yes\" >Yes</div>";
     
       content += "<div class=\"pop_btn\" id=\"popno\" title=\"No\" >No</div>   ";
   
       content += " </div></div>";
    
     div_glassPane.innerHTML = content
     document.body.appendChild(div_glassPane)  
     
      if ( document.getElementById("popyes").addEventListener) {
     
     	document.getElementById("popyes").addEventListener("click",function(){var mod = document.getElementById('popmod'); mod.parentElement.removeChild(mod);yes_callback();});
     	document.getElementById("popno").addEventListener("click",function(){var mod = document.getElementById('popmod'); mod.parentElement.removeChild(mod);no_callback();});
     }  else if (document.getElementById("popyes").attachEvent) {
        	document.getElementById("popyes").attachEvent('onclick',function(){var mod = document.getElementById('popmod'); mod.parentElement.removeChild(mod);yes_callback();});
              document.getElementById("popno").attachEvent("onclick",function(){var mod = document.getElementById('popmod'); mod.parentElement.removeChild(mod);no_callback();});
     }
    
  } 
  
  window.doshowSec  = function (instance,index) {
     instance.doShowSection(index);
  }
  


class BcButton {
	constructor(form_wizard, index) {
		this.form_wizard = form_wizard;
		this.index = index;
	}
	
	getDom() {
		var btn = document.createElement("div"); 
        var text=this.index+1;
         if (!this.form_wizard.show_section_numbering){
             text='';
         }
  	 	btn.appendChild(document.createTextNode(text));
  	    btn.id="btn_s"+this.index;
  	 	btn.classList.add("bc_btn");
  	 	btn.form_wizard = this.form_wizard;
  	 	btn.index = this.index;
  	 	
 		if (btn.addEventListener) {
        	btn.addEventListener('click', function() {
        	    this.form_wizard.showSection(this.index);
        	}, false);
    	} else if (btn.attachEvent) {
        	btn.attachEvent('onclick', function() {
            	this.form_wizard.showSection(this.index);
        	});
    	}
    	return btn;
	}
}

const getMandatorySymbol = function(field) {
	return (field.mandatory.toLowerCase()=="true")? " *":"";
	
}


class FormWizard {
  constructor(container_id, model, image_folder, trad, exit_callback, complete_callback) {
    
    this.container_id = container_id;
    this.model = model;
    this.image_folder = image_folder;
    if(this.image_folder!="" && this.image_folder.length>0 && !this.image_folder.endsWith("/")){
        this.image_folder=this.image_folder+"/";
    }
    this.normalizeModel();
    this.initialized = false;
    this.exit_callback = exit_callback;
    this.complete_callback = complete_callback;
    
    this.trad = [];
    if (trad !== undefined && trad.emptySection != undefined) {
    	this.trad.emptySection = trad.emptySection;
    } else {
    	this.trad.emptySection = "This section has some missing or invalid fields. Do you want to complete them now?";
    }
    
    if (trad !== undefined && trad.incomplete != undefined) {
    	this.trad.incomplete = trad.incomplete;
    } else {
    	this.trad.incomplete = "At least one section has some missing or invalid fields. You need to complete them.";
    }
    
    if (trad !== undefined && trad.close != undefined) {
    	this.trad.close = trad.close;
    } else {
    	this.trad.close = "Do you want to exit this wizard without completing it (data that you already entered will be lost).";
    }
    
    if (trad !== undefined && trad.exit_confirm != undefined) {
    	this.trad.exit_confirm = trad.exit_confirm;
    } else {
    	this.trad.exit_confirm = undefined;
    }
    
    this.show_section_numbering = true;
    
    if (this.model.formWizardObject["hide_wizzard_numbering"]==="true" || this.model.formWizardObject["hide_wizzard_numbering"]==="True"){
        this.show_section_numbering = false;
    }
    
    this.conditions = [];
    this.initialize();
    this.showSection(0);
    if (trad.open != undefined) {
        window.createModal(trad.open);
    }
    
    
    window.onbeforeunload = function() {
            return this.trad.close;
    };  
    
  }
  
  
  insertLineBreak(text){
      return text.replace(/(?:\r\n|\r|\n)/g, '<br>');
  }
  
   
  
  normalizeModel() {
  	// list
  	if (this.model["formWizardObject"].list!== undefined && !Array.isArray(this.model["formWizardObject"].list)) {
  		this.model["formWizardObject"].list=[this.model["formWizardObject"].list];
  	}
  	
  	// section
  	if (this.model["formWizardObject"].section === undefined) {
  		this.model["formWizardObject"].section = [];
  	}
  	
  	if (!Array.isArray(this.model["formWizardObject"].section)) {
  		this.model["formWizardObject"].section=[this.model["formWizardObject"].section];
  	}
  	
  	//fields
  	var section_index;
  	for (section_index in this.model["formWizardObject"].section) {
  	   var section = this.model["formWizardObject"].section[section_index];
  	   if (section.field === undefined) {
  		  section.field = [];
  	   }
  	
  	   if (!Array.isArray(section.field)) {
  		  section.field=[section.field];
  	   }
  	 }
  }
  
  
 
  
  getDomField(section_index, field_index, field) {
  	 	var div_field = document.createElement("div");

  	 	div_field.id="f_s"+section_index+"_f"+field_index;
  	 	div_field.classList.add("fld");
  	 	this.addToCondition(field, div_field.id);
  	 	
  	 	var fld_lbl =  document.createElement("div");
  	 	fld_lbl.appendChild(document.createTextNode(field.label + getMandatorySymbol(field)));
  	 	fld_lbl.classList.add("fld_lbl");
  	 	fld_lbl.id="fl_s"+section_index+"_f"+field_index;
  	 	div_field.appendChild(fld_lbl);
  	 	var fld_input = document.createElement("input");
  	 	fld_input.id = "fi_s"+section_index+"_f"+field_index;
  	 	fld_input.classList.add("fld_input");
  	 	switch (field.type.toLowerCase()) {
  	 		case 'string':
  	 			fld_input.type="text";
  	 			if (field.value !== undefined) {
  	 				fld_input.value = field.value;
  	 			}
  	 			fld_input.classList.add("fld_txt");
                
  	 	        div_field.appendChild(fld_input);
  	 			break;
  	 		case 'text':
  	 			fld_input = document.createElement("textarea");
  	 		    fld_input.id = "fi_s"+section_index+"_f"+field_index;
  	 		    fld_input.classList.add("fld_input");
  	 			fld_input.classList.add("fld_txtarea");
  	 			if (field.value !== undefined) {
  	 				fld_input.value = field.value;
  	 			}
                
  	 	        div_field.appendChild(fld_input);
  	 			break;
  	 		case 'date':
  	 			fld_input.type="date";  	 			
  	 			if (field.value !== undefined) {
  	 				fld_input.value = field.value;
  	 			}
  	 			fld_input.classList.add("fld_date");
                
  	 	        div_field.appendChild(fld_input);
  	 			break;
  	 		default:
  	 		    // enumaration (list) case
  	 		    
  	 		 	if (this.model["formWizardObject"].list!== undefined) {
                    if (field.rb) {
                        for (var list_counter = 0; list_counter < this.model["formWizardObject"].list.length; list_counter++){
      	 					const list = this.model["formWizardObject"].list[list_counter];
      	 					if (list.name == field.type) {
                                const fld_name = "fi_s"+section_index+"_f"+field_index;
                                const has_condition = this.addCondition(field, fld_name);
      	 							
                                for (var item_counter = 0; item_counter < list.item.length; item_counter++){
                                    var div_rb_input = document.createElement("span");		
                                    div_rb_input.classList.add("radio");
                                    var rb_input = document.createElement("input");
                                    rb_input.type="radio"
                                    rb_input.name=fld_name;
                                    rb_input.id = fld_name+"_i"+item_counter;
                                    rb_input.value = list.item[item_counter];
                                    rb_input.classList.add("fld_input");
      	 						    rb_input.classList.add("fld_rb");
                                    if ( rb_input.value ==  field.value) {
      	 								item.checked = true;
      	 							}
                                    
                                    if (has_condition){
                                        rb_input.form_wizard = this;
      	 							    rb_input.onchange = function(){this.form_wizard.applyConditions();};
      	 						    }
                                
          	 						
                                    div_rb_input.appendChild(rb_input);
                                    div_rb_input.appendChild(document.createTextNode(rb_input.value));
  	 	                            div_field.appendChild(div_rb_input);
                                }
      	 					}
      	 				}
                    } else {
      	 				for (var list_counter = 0; list_counter < this.model["formWizardObject"].list.length; list_counter++){
      	 					const list = this.model["formWizardObject"].list[list_counter];
      	 					if (list.name == field.type) {
      	 						fld_input = document.createElement("select");
      	 		    			fld_input.id = "fi_s"+section_index+"_f"+field_index;
      	 		    			fld_input.name = "fi_s"+section_index+"_f"+field_index;
      	 		    			fld_input.classList.add("fld_input");
      	 						fld_input.classList.add("fld_drop");
      	 						
      	 						if (this.addCondition(field, fld_input.name)) {
      	 							fld_input.form_wizard = this;
      	 							fld_input.onchange = function(){this.form_wizard.applyConditions();};
      	 						}
      	 						
      	 						const item_value = list.item[item_counter];
      	 						var item = document.createElement("option");
      	 						item.classList.add("fld_option");
      	 						item.value = "";
      	 						item.text = "";
      	 						fld_input.add(item);
      	 						for (var item_counter = 0; item_counter < list.item.length; item_counter++){
      	 							const item_value = list.item[item_counter];
      	 							var item = document.createElement("option");
      	 							item.classList.add("fld_option");
      	 							item.value = item_value;
      	 							item.text = item_value;
      	 							if ( item_value ==  field.value) {
      	 								item.selected = true;
      	 							}
      	 							fld_input.add(item);
      	 						}
      	 					}
      	 				}
                        
  	 	                div_field.appendChild(fld_input);
                    }
  	 			}
  	 			
 
  	 			break;
  	 	}
  	 	

  	 	
  	 	
  	 	return div_field;
  	 	
  }
  
  addCondition(condition_field, input_name) {
  	if (condition_field.condition!==undefined){
  		var fields = [];
  		if ( condition_field.condition.name in this.conditions){
  			fields = this.conditions[condition_field.condition.name].fields;
  		}
  		var cond = {"input_name":input_name, "fields":fields};
  		if (condition_field.condition.value_true!==undefined){
  				cond.value_true = condition_field.condition.value_true;
  		} else if (condition_field.condition.value_false!==undefined){
  				cond.value_false = condition_field.condition.value_false;
  		}
  		
  		this.conditions[condition_field.condition.name] = cond;
  		return true;
  	}
  	return false;
  }
  
   
  
  
  addToCondition(field, field_div_id) {
  	if (field.show_on_condition!==undefined) {
  	 if (!(field.show_on_condition in this.conditions)){
  	 	this.conditions[field.show_on_condition] = {"fields":[]};
  	 }
  	 
  	 this.conditions[field.show_on_condition].fields.push(field_div_id);
  	}
  }
  
  applyConditions(){
  	var cond_index;
  	for (cond_index in this.conditions){
  		const cond = this.conditions[cond_index];
  		var valid = this.isConditionValid(cond);
  		
  		for (var fld_index=0; fld_index< cond.fields.length; fld_index++){
  			var fld_div = document.getElementById(cond.fields[fld_index]);
  			if (valid) {
  				fld_div.classList.remove("cond_excluded");
  			} else {
  				fld_div.classList.add("cond_excluded");
  			}
  		}
  	}
  }
  
  
   readRbFieldByName(name){
      const rbs = document.getElementsByName(name);
      var value = "";
      if (rbs.length==1) {
          value = rbs[0].value;
      } else {
          for (var i=0; i< rbs.length;i++){
              if (rbs[i].checked) {
                 value = rbs[i].value;
              }
          }
      }
      
  	  return  value;
      		
  }
  
  isConditionValid(cond){
  	const curr_value = this.readRbFieldByName(cond.input_name);
  	return cond.value_true!==undefined ? cond.value_true == curr_value: cond.value_false != curr_value;
   
    //todo rb case
  }
  
  initialize() {
  	 if (this.initialized) {
  	 	return;
  	 }
  	 this.current_section = -1;
  	 
  	 var ext_cont = document.getElementById(this.container_id); 
  	 this.container = document.createElement("div");
  	 this.container.classList.add("inner_cont");
	 ext_cont.appendChild(this.container);
	 
  	 // Create the bread crumb
  	 var header = document.createElement("div");
  	 header.id="header";
  	 header.classList.add("header");
  	 
  	 for (var index=0; index < this.model["formWizardObject"].section.length; index++) {
         
         var btn = new BcButton(this, index);
  	 	 header.appendChild(btn.getDom());
  	 }
  	 
  	 var btn_close = document.createElement("div");  
  	 btn_close.classList.add("fw_btn"); 
  	 btn_close.classList.add("bc_btn_close");
  	 btn_close.form_wizard = this;
  	 if (btn_close.addEventListener) {
        	btn_close.addEventListener('click', function() {
        	    this.form_wizard.close();
        	}, false);
    	} else if (btn_close.attachEvent) {
        	btn_close.attachEvent('onclick', function() {
            	this.form_wizard.close();
        	});
    	}
  	 header.appendChild(btn_close);
  	 this.container.appendChild(header);
  	 
  	 // add the sections
  	 var sect_cont_div = document.createElement("div");
  	 sect_cont_div.classList.add("sect_cont");
  	 var section_index;
  	 for (section_index in this.model["formWizardObject"].section) {
  	    var section = this.model["formWizardObject"].section[section_index];
  	 	var sect_div = document.createElement("div");
  		sect_div.classList.add("sect_hidden");
  	 	sect_div.id="sec_"+section_index;
  	 	sect_div.classList.add("sect");
  	 	var sect_title = document.createElement("div");
  	 	sect_title.appendChild(document.createTextNode(section.title));
  	 	sect_title.classList.add("sect_title");
  	 	sect_div.appendChild(sect_title);
  	 	if (section.image!==undefined && section.image!="") {
            var dom_img = document.createElement("img");
            dom_img.classList.add("sect_img");
            dom_img.onload = function() {
                this.style.maxWidth  = Math.round(1.2*this.naturalWidth)+'px';
                this.style.maxHeight  = Math.round(1.2*this.naturalHeight)+'px';
            }
            dom_img.src = this.image_folder+section.image;
            sect_div.appendChild(dom_img);
        }
  	 	if (section.description!==undefined && section.description!="") {
 	        var sect_descr = document.createElement("div");
  	 		sect_descr.innerHTML = this.insertLineBreak(section.description);
  	 		sect_descr.classList.add("sect_descr");
  	 		sect_div.appendChild(sect_descr);
  	 	}
  
  	 	var field_index;
  	 	for (field_index in section.field) {
  	 		var field = section.field[field_index];
  	 		if (field.manuscript === undefined || field.manuscript.toLowerCase()=="false") {
  	 			sect_div.appendChild(this.getDomField(section_index, field_index, field));
  	 		}
  	 	}
  	 	
  	 	
  	    sect_cont_div.appendChild(sect_div);
  	 }
  	
  	 var footer_div = document.createElement("div");
  	 footer_div.classList.add("footer");
  	 
  	 var btn_prev = document.createElement("div");  
  	 btn_prev.id="btn_prev";
  	 btn_prev.classList.add("fw_btn");
  	 btn_prev.classList.add("fw_btn_prev");
  	 btn_prev.classList.add("fw_btn_hidden");
  	 btn_prev.form_wizard = this;
  	 if (btn_prev.addEventListener) {
        	btn_prev.addEventListener('click', function() {
        	    this.form_wizard.showSection(this.form_wizard.current_section -1);
        	}, false);
     } else if (btn_prev.attachEvent) {
        	btn_prev.attachEvent('onclick', function() {
        	    this.form_wizard.showSection(this.form_wizard.current_section -1);
        	});
     }	
  	 footer_div.appendChild(btn_prev);
  	 
  	 var btn_next = document.createElement("div");  
  	 btn_next.id="btn_next";
  	 btn_next.classList.add("fw_btn");
  	 btn_next.classList.add("fw_btn_next");
  	 btn_next.classList.add("fw_btn_hidden");
  	 btn_next.form_wizard = this;
  	 if (btn_next.addEventListener) {
        	btn_next.addEventListener('click', function() {
        	    this.form_wizard.nextSection();
        	}, false);
     } else if (btn_next.attachEvent) {
        	btn_next.attachEvent('onclick', function() {
            	this.form_wizard.nextSection();
        	});
     }	
  	 footer_div.appendChild(btn_next);
  	 

  	 
  	 var btn_end = document.createElement("div");  
  	 btn_end.id="btn_end";
  	 btn_end.classList.add("fw_btn");
  	 btn_end.classList.add("fw_btn_end");
  	 btn_end.classList.add("fw_btn_hidden");
  	 btn_end.form_wizard = this;
  	 if (btn_end.addEventListener) {
        	btn_end.addEventListener('click', function() {
        	    if (this.form_wizard.trad.exit_confirm!==undefined){
        	    	window.createValidate(this.form_wizard.trad.exit_confirm, this.form_wizard.completed.bind(this.form_wizard), function(){});
                } else {
            	    this.form_wizard.completed();
                }
        	}, false);
     } else if (btn_end.attachEvent) {
        	btn_end.attachEvent('onclick', function() {
                if (this.form_wizard.trad.exit_confirm!==undefined){
        	    	window.createValidate(this.form_wizard.trad.exit_confirm, this.form_wizard.completed.bind(this.form_wizard), function(){});
                } else {
            	    this.form_wizard.completed();
                }
                
        	});
     }	
  	 footer_div.appendChild(btn_end);
	 sect_cont_div.appendChild(footer_div);
  	 this.container.appendChild(sect_cont_div);
  	 this.initialized=true;
  }
  
 
  
  readRbFieldValue(section_index,field_index){
  	  return  this.readRbFieldByName("fi_s"+section_index+"_f"+field_index); 		
  }
  
  validateRbField(section_index,field_index){
      const value = this.readRbFieldValue(section_index,field_index)
  	  return  value!==undefined && value.trim()!="";  		
  }
  
  
  isSectionValid(section_index) {
    var valid=true;
    var section = this.model["formWizardObject"].section[section_index];
    var field_index;
  	for (field_index in section.field) {
  		var field = section.field[field_index];
  		if (field.mandatory.toLowerCase()=="true" && (field.manuscript === undefined || field.manuscript.toLowerCase()=="false")) {
  		   if (field.show_on_condition === undefined || this.isConditionValid(this.conditions[field.show_on_condition])) {
  				var fld_valid = false;
                if (field.rb) {
                   fld_valid = this.validateRbField(section_index,field_index);
                } else {
                    const input = document.getElementById("fi_s"+section_index+"_f"+field_index);
  				    fld_valid =  input.value!==undefined && input.value.trim()!="";
                }
               
  				var lbl = document.getElementById("fl_s"+section_index+"_f"+field_index);
  				if (fld_valid) {
  					lbl.classList.remove("lbl_invalid");
  				} else {
  					lbl.classList.add("lbl_invalid");
  				}
  				valid &= fld_valid;
  			}
  		}
  	}
	return valid;  
  }
  
  nextSection() {
  	this.showSection(this.current_section+1);
  }
  
  
 
  
 
  
  showSection(section_index){
    this.applyConditions();
    if (this.current_section>=0) {
      // when invalid ask for completion
       const valid = this.isSectionValid(this.current_section);
       if (!valid && this.current_section < section_index) {
         window.createValidate(this.trad.emptySection, function(){}, function(){this.doShowSection(section_index);}.bind(this));
       	
       }else {
           this.doShowSection(section_index);
       }
    } else {
        this.doShowSection(section_index);
   }

  }
      
   doShowSection(section_index){
       if (this.current_section>=0) {
  	   document.getElementById("sec_"+this.current_section).classList.add("sect_hidden");
  	}
  	
  	if (section_index==this.model["formWizardObject"].section.length-1) {
  		document.getElementById("btn_next").classList.add("fw_btn_hidden");
  		document.getElementById("btn_end").classList.remove("fw_btn_hidden");
  	} else{
  		document.getElementById("btn_next").classList.remove("fw_btn_hidden");
  		document.getElementById("btn_end").classList.add("fw_btn_hidden");
	} 
	
	if (section_index==0){
		document.getElementById("btn_prev").classList.add("fw_btn_hidden");
	} else {
		document.getElementById("btn_prev").classList.remove("fw_btn_hidden");
	}
  	
  	document.getElementById("sec_"+section_index).classList.remove("sect_hidden");

  	this.current_section = section_index;
  	for (var sect_index =0;sect_index<  this.model["formWizardObject"].section.length; sect_index++) {
  		var btn = document.getElementById("btn_s"+sect_index);
  		if (sect_index < this.current_section) {
  			const valid = this.isSectionValid(sect_index);
  			btn.classList.remove("bc_btn_not_view");
  			btn.classList.remove("bc_btn_current");
  			btn.classList.remove("bc_btn_invalid");
  			if (!valid) {
  				btn.classList.add("bc_btn_invalid");
  			}
  		} else if 	(sect_index == this.current_section) {
  			btn.classList.remove("bc_btn_not_view");
  			btn.classList.add("bc_btn_current");
  			btn.classList.remove("bc_btn_invalid");
  		} else {
  			btn.classList.add("bc_btn_not_view");
  			btn.classList.remove("bc_btn_current");
  			btn.classList.remove("bc_btn_invalid");
  		}	
  	}
  	
  	window.scrollTo(0, 0);
    
    
  } 
  

  
  readValues() {
  	for (var section_index =0;section_index<  this.model["formWizardObject"].section.length; section_index++) {
  		var section = this.model["formWizardObject"].section[section_index];
    	var field_index;
  		for (field_index in section.field) {
  			var field = section.field[field_index];
  			if (field.manuscript === undefined || field.manuscript.toLowerCase()=="false") {
  		 		if (field.show_on_condition === undefined || this.isConditionValid(this.conditions[field.show_on_condition])) {
                    if (field.rb){
                        section.field[field_index].value = this.readRbFieldValue(section_index,field_index);
                    } else {
  					    section.field[field_index].value = document.getElementById("fi_s"+section_index+"_f"+field_index).value;
                    }
  				} else {
  					section.field[field_index].value = undefined;
  				}
  			}
  		}
  	}
  }
  

  
   close(){
    let message = this.trad.close;
    let callbk = this.exit_callback
        window.createValidate(message, function() { window.onbeforeunload = function() {return; };callbk();}, function(){});
  } 
  
  completed(){
  	var valid =true;
    for (var section_index in this.model["formWizardObject"].section) {
    	valid &= this.isSectionValid(section_index);
    }
  	if (!valid) {
  		window.createModal(this.trad.incomplete);
  	} else {
  		this.readValues();
        window.onbeforeunload = function() {
            return;
        };
    	this.complete_callback(this.model);
  	}
  }
  
}

simplifyObject = function(section){
	var new_object = {"title":section.title, "fields":{}};
	var field_index;
  	for (field_index in section.field) {
  		new_object.fields[section.field[field_index].label]=section.field[field_index].value;
  	}
	return new_object;
}

addDomQRs = function(model){
	var section_index;
  	for (section_index in model["formWizardObject"].section) {
        try {
  	   var section = model["formWizardObject"].section[section_index];
  	   var div_qr = document.createElement("div");  
  	   div_qr.id="qr_s"+section_index;
  	   div_qr.classList.add("qr");
  	   document.body.appendChild(div_qr);
  	   var qrcode = new QRCode(div_qr, {width : 300,height : 300});
  	   qrcode.makeCode(JSON.stringify(simplifyObject(section)));
        } catch(e){
            
        }
   }
}

// you need to include jspdf package if you want to use this part (https://parall.ax/products/jspdf)
// you need to include qrcodejs package if you want to add the QR's (https://github.com/davidshimjs/qrcodejs)
// logo should be a 45x30 mm base64 encoded jpeg or "undefined"
savePdf = function(model, font, total_column, logo, add_qr_text, file_name, server_url, server_post_data, callback ){

   if (add_qr_text!=undefined) {
   		addDomQRs(model);  
   }


	if ( font===undefined){
		font='helvetica';
	}
	
	
	var doc = new window.jspdf.jsPDF('p','mm','a4');
	
	const margin_top = 30;
	const line_height = 5.5;
	const total_height= 220; 
	const max_lines = Math.floor(total_height/line_height);

	const margin_left = 40;
	const column_separation = 4;

	const column_width = (doc.internal.pageSize.width -2*margin_left -column_separation*(total_column-1))/total_column;
	
	var line_number = 0;
	var column_counter =0;
	
	
	if (logo!== undefined) {
	 doc.addImage(logo, 'JPEG', 5, 5, 45, 30)
	}
	
	newPage = function() {
		line_number = 2;
		column_counter = 0;
		doc.addPage();
		if (logo!== undefined) {
		   doc.addImage(logo, 'JPEG', 5, 5, 45, 30)
		}
	}
	
	addCentered = function(text, max_width) {
		var lines = doc.splitTextToSize(text, max_width, {});
        for (var index=0; index<lines.length; index++){
        	var textWidth = doc.getStringUnitWidth(lines[index]) * doc.internal.getFontSize() / doc.internal.scaleFactor;
        	var textOffset = (doc.internal.pageSize.width - textWidth) / 2;
        	var v = margin_top + line_number*line_height;
        	line_number+=0.9;
        	if (line_number>max_lines) {
				newPage();
			}
        	doc.text(textOffset, v, lines[index]);
        }
		
	}
	
	addElement = function(text){
		addColSpanElement(text, 1, false);
	}
	
	addColSpanElement= function(text, col_span, add_feed_line) {
	    // check there is enough column left
		if (column_counter+col_span>total_column){
			column_counter = 0;
			line_number+=1;
			if (line_number>max_lines) {
				newPage();
			}
		}
		
		const max_w = col_span*column_width + (col_span-1)*column_separation;
		const h = margin_left + column_counter*(column_width + column_separation);
		var textWidth = doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor;
		if (textWidth >max_w) {
			var lines = doc.splitTextToSize(text, max_w, {});
			
			for (var index=0; index<lines.length; index++){
				if (index!=0) {
					line_number+=0.9;
					if (line_number>max_lines) {
						newPage();
					}
				}
				const v = margin_top + line_number*line_height;
				doc.text(h, v, lines[index]);
				if (add_feed_line && index == lines.length-1) {
					textWidth = doc.getStringUnitWidth(lines[index]) * doc.internal.getFontSize() / doc.internal.scaleFactor;
					doc.line(h + textWidth, v, h + max_w, v);
				}
				
			}
		} else {
			const v = margin_top + line_number*line_height;
			doc.text(h, v, text);
			if (add_feed_line){
				doc.line(h + textWidth, v, h + max_w, v);
			}
		}
		
		if (column_counter + col_span >= total_column) {
			column_counter = 0;
			line_number+=1;
		} else {
			column_counter += col_span;
		}
		
		if (line_number>max_lines) {
			newPage();
		}
	}
	
        doc.setLineWidth(0.1)
	doc.setFont(font,"bold");
	doc.setFontSize(12);
	addCentered(model["formWizardObject"].title, 2*column_width + column_separation);
	doc.setFontSize(10);
  	doc.setFont(font,'normal');
	addCentered(model["formWizardObject"].description, column_width);
	line_number+=1;
	var section_index;
  	for (section_index in model["formWizardObject"].section) {
  	   var section = model["formWizardObject"].section[section_index];
	   doc.setFont(font,'bold');
	   line_number+=0.5;
	   addColSpanElement( section.title, total_column, false);
       
  	   doc.setFont(font,'normal');
       if (section.show_description!==undefined){ 
	    addColSpanElement( section.description, total_column, false);
       }
	  
  	   var field_index;
  	   for (field_index in section.field) {
  	   	   
  		   const field = section.field[field_index];
  		   if ((field.show_on_condition === undefined || field.value!==undefined) && field.value!=="") {
  		   	 var colspan = field.type!="text"? 1: total_column;
             if (field.span!== undefined){
                colspan = Math.min(field.span,total_column);
             }
             const label = field.pdflabel=== undefined ? field.label:field.pdflabel;
  		   	 if (field.manuscript === undefined || field.manuscript.toLowerCase()=="false") {
  		   		 addColSpanElement(label + ": " + field.value, colspan, false);
  		   	 } else {
  		   	 	if (column_counter == 0) {
  		   	 		line_number+=0.5;
  		   	 	}
  		   	 	addColSpanElement(label + ": ", colspan, true);
  		   	 }
  		   }
	  }
  	}
  	
  setTimeout(function() {
	if (add_qr_text!=undefined) {
		for (section_index in model["formWizardObject"].section) {
			if (section_index % 6==0){
   		  			 newPage();
   		  			 line_number = -1;
					 column_counter =0;
					 addCentered(add_qr_text, 110);
   		  	}
   			var imgData = document.getElementById("qr_s"+section_index).getElementsByTagName('img')[0].src;
   			var line = Math.floor((section_index % 6) / 2);
   			var col = (section_index % 6) % 2;
            doc.addImage(imgData, 'JPEG', 29 + col*(70 + 10), 50 + line*(70 + 10), 70, 70);
        } 
   	}
   		 
	if (file_name!==undefined){
    	 doc.save(file_name);
   	}
    
    if (server_url!==undefined){
        if (server_post_data===undefined){
            server_post_data = {'pdf':'', 'data':''};
        }
        
    	var uri = doc.output('datauristring');
        server_post_data['pdf'] = uri;
        server_post_data['data'] = JSON.stringify(model);
        
        var xhr = new XMLHttpRequest();
        xhr.open("POST", server_url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function(){
            if (xhr.readyState==4)   {
                if (xhr.status=='200'){
                    callback();
                } else {
                    window.createModal("Une erreur de communication c'est produite: ".xhr.status);
                }
                
            } 
        };
        xhr.send(JSON.stringify(server_post_data));
   	}
    
  },200);
    
	
	
}


