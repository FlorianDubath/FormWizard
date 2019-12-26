
class BcButton {
	constructor(form_wizard, index) {
		this.form_wizard = form_wizard;
		this.index = index;
	}
	
	getDom() {
		var btn = document.createElement("div");  
  	 	btn.appendChild(document.createTextNode((this.index+1)));
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
  constructor(container_id, model, trad, exit_callback,complete_callback) {
    this.container_id = container_id;
    this.model = model;
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
    
    this.initialize();
    this.showSection(0);
    
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
  	 			break;
  	 		case 'text':
  	 			fld_input = document.createElement("textarea");
  	 		    fld_input.id = "fi_s"+section_index+"_f"+field_index;
  	 		    fld_input.classList.add("fld_input");
  	 			fld_input.classList.add("fld_txtarea");
  	 			if (field.value !== undefined) {
  	 				fld_input.value = field.value;
  	 			}
  	 			break;
  	 		case 'date':
  	 			fld_input.type="date";  	 			
  	 			if (field.value !== undefined) {
  	 				fld_input.value = field.value;
  	 			}
  	 			fld_input.classList.add("fld_date");
  	 			break;
  	 		default:
  	 		 	if (this.model["formWizardObject"].list!== undefined) {
  	 				for (var list_counter = 0; list_counter < this.model["formWizardObject"].list.length; list_counter++){
  	 					const list = this.model["formWizardObject"].list[list_counter];
  	 					if (list.name == field.type) {
  	 						fld_input = document.createElement("select");
  	 		    			fld_input.id = "fi_s"+section_index+"_f"+field_index;
  	 		    			fld_input.classList.add("fld_input");
  	 						fld_input.classList.add("fld_drop");
  	 						
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
  	 			}
 
  	 			break;
  	 	}
  	 	

  	 	
  	 	
  	 	div_field.appendChild(fld_input);
  	 	return div_field;
  	 	
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
  	 btn_close.appendChild(document.createTextNode("X"));
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
  	 	if (section.description!==undefined && section.description!="") {
  	 	var sect_descr = document.createElement("div");
  	 		sect_descr.appendChild(document.createTextNode(section.description));
  	 		sect_descr.classList.add("sect_descr");
  	 		sect_div.appendChild(sect_descr);
  	 	}
  
  	 	var field_index;
  	 	for (field_index in section.field) {
  	 		var field = section.field[field_index];
  	 		sect_div.appendChild(this.getDomField(section_index, field_index, field));
  	 	}
  	 	
  	 	
  	    sect_cont_div.appendChild(sect_div);
  	 }
  	
  	 var footer_div = document.createElement("div");
  	 footer_div.classList.add("footer");
  	 
  	 var btn_prev = document.createElement("div");  
  	 btn_prev.appendChild(document.createTextNode("Prev"));
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
  	 btn_next.appendChild(document.createTextNode("Next"));
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
  	 btn_end.appendChild(document.createTextNode("End"));
  	 btn_end.id="btn_end";
  	 btn_end.classList.add("fw_btn");
  	 btn_end.classList.add("fw_btn_end");
  	 btn_end.classList.add("fw_btn_hidden");
  	 btn_end.form_wizard = this;
  	 if (btn_end.addEventListener) {
        	btn_end.addEventListener('click', function() {
        	    this.form_wizard.completed();
        	}, false);
     } else if (btn_end.attachEvent) {
        	btn_end.attachEvent('onclick', function() {
            	this.form_wizard.completed();
        	});
     }	
  	 footer_div.appendChild(btn_end);
	 sect_cont_div.appendChild(footer_div);
  	 this.container.appendChild(sect_cont_div);
  	 this.initialized=true;
  }
  
  isSectionValid(section_index) {
    var valid=true;
    var section = this.model["formWizardObject"].section[section_index];
    var field_index;
  	for (field_index in section.field) {
  		var field = section.field[field_index];
  		if (field.mandatory.toLowerCase()=="true") {
  			const input = document.getElementById("fi_s"+section_index+"_f"+field_index);
  			const fld_valid =  input.value!==undefined && input.value.trim()!="";
  			var lbl = document.getElementById("fl_s"+section_index+"_f"+field_index);
  			if (fld_valid) {
  				lbl.classList.remove("lbl_invalid");
  			} else {
  				lbl.classList.add("lbl_invalid");
  			}
  			valid &= fld_valid;
  		}
  	}
	return valid;  
  }
  
  nextSection() {
  	this.showSection(this.current_section+1);
  }
  
 
  
  showSection(section_index){
    if (this.current_section>=0) {
      // when invalid ask for completion
       const valid = this.isSectionValid(this.current_section);
       if (!valid && this.current_section < section_index) {
       	 if (confirm(this.trad.emptySection)){
       	 	return;
       	 }
       }
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
  } 
  
  readValues() {
  	for (var section_index =0;section_index<  this.model["formWizardObject"].section.length; section_index++) {
  		var section = this.model["formWizardObject"].section[section_index];
    	var field_index;
  		for (field_index in section.field) {
  			section.field[field_index].value = document.getElementById("fi_s"+section_index+"_f"+field_index).value;
  		}
  	}
  }
  
   close(){
  	if (confirm(this.trad.close)){
  		this.exit_callback();
  	} 
  } 
  
  completed(){
  	var valid =true;
    for (var section_index in this.model["formWizardObject"].section) {
    	valid &= this.isSectionValid(section_index);
    }
  	if (!valid) {
  		alert(this.trad.incomplete)
  	} else {
  		this.readValues();
    	this.complete_callback(this.model)
  	}
  }
  
}