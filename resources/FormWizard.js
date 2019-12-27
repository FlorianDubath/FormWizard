
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
    
    this.conditions = [];
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
  	 		    // enumaration (list) case
  	 		    
  	 		 	if (this.model["formWizardObject"].list!== undefined) {
  	 				for (var list_counter = 0; list_counter < this.model["formWizardObject"].list.length; list_counter++){
  	 					const list = this.model["formWizardObject"].list[list_counter];
  	 					if (list.name == field.type) {
  	 						fld_input = document.createElement("select");
  	 		    			fld_input.id = "fi_s"+section_index+"_f"+field_index;
  	 		    			fld_input.classList.add("fld_input");
  	 						fld_input.classList.add("fld_drop");
  	 						
  	 						if (this.addCondition(field, fld_input.id)) {
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
  	 			}
  	 			
 
  	 			break;
  	 	}
  	 	

  	 	
  	 	
  	 	div_field.appendChild(fld_input);
  	 	return div_field;
  	 	
  }
  
  addCondition(condition_field, input_id) {
  	if (condition_field.condition!==undefined){
  		var fields = [];
  		if ( condition_field.condition.name in this.conditions){
  			fields = this.conditions[condition_field.condition.name].fields;
  		}
  		var cond = {"input_id":input_id, "fields":fields};
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
  
  isConditionValid(cond){
  	const curr_value = document.getElementById(cond.input_id).value;
  	return cond.value_true!==undefined ? cond.value_true == curr_value: cond.value_false != curr_value;
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
  		   if (field.show_on_condition === undefined || this.isConditionValid(this.conditions[field.show_on_condition])) {
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
  			var field = section.field[field_index];
  		 	if (field.show_on_condition === undefined || this.isConditionValid(this.conditions[field.show_on_condition])) {
  				section.field[field_index].value = document.getElementById("fi_s"+section_index+"_f"+field_index).value;
  			} else {
  				section.field[field_index].value = undefined;
  			}
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


// you need to include jspdf package if you want to use this part (https://parall.ax/products/jspdf)
// logo should be a 45x30 mm base64 encoded jpeg or "undefined"
savePdf = function(model, font, logo, file_name ){
	if ( font===undefined){
		font='helvetica';
	}
	
	const margin_top = 30;
	const line_height = 5.5;
	const total_height= 220; 
	const max_lines = Math.floor(total_height/line_height);

	const margin_left = 40;
	const column_width = 58;
	const column_separation = 4;
	const total_column = 2;
	
	var line_number = 0;
	var column_counter =0;
	
	var doc = new jsPDF('p','mm','a4');
	
	if (logo!== undefined) {
	 doc.addImage(logo, 'JPEG', 5, 5, 45, 30)
	}
	
	newPage = function() {
		line_number = 0;
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
        	line_number++;
        	doc.text(textOffset, v, lines[index]);
        }
		
	}
	
	addElement = function(text){
		addColSpanElement(text, 1);
	}
	
	addColSpanElement= function(text, col_span) {
	    // check there is enough column left
		if (column_counter+col_span>total_column){
			column_counter = 0;
			line_number++;
			if (line_number>max_lines) {
				newPage();
			}
		}
		
		const max_w = col_span*column_width + (col_span-1)*column_separation;
		const h = margin_left + column_counter*(column_width + column_separation);
		
		if (doc.getStringUnitWidth(text) * doc.internal.getFontSize() / doc.internal.scaleFactor >max_w) {
			var lines = doc.splitTextToSize(text, max_w, {});
			
			for (var index=0; index<lines.length; index++){
				if (index!=0) {
					line_number++;
					if (line_number>max_lines) {
						newPage();
					}
				}
				const v = margin_top + line_number*line_height;
				doc.text(h, v, lines[index]);
				
			}
		} else {
			const v = margin_top + line_number*line_height;
			doc.text(h, v, text);
		}
		
		if (column_counter + col_span >= total_column) {
			column_counter = 0;
			line_number++;
		} else {
			column_counter += col_span;
		}
		
		if (line_number>max_lines) {
			newPage();
		}
	}
	
	doc.setFont(font);
	doc.setFontType('bold');
	doc.setFontSize(12);
	addCentered(model["formWizardObject"].title, 2*column_width + column_separation);
	doc.setFontSize(10);
  	doc.setFontType('normal');
	addCentered(model["formWizardObject"].description, column_width);
	line_number++;
	var section_index;
  	for (section_index in model["formWizardObject"].section) {
  	   var section = model["formWizardObject"].section[section_index];
	   doc.setFontType('bold');
	   addColSpanElement( section.title,2);
	  
  	   doc.setFontType('normal');
  	   var field_index;
  	   for (field_index in section.field) {
  	   	   
  		   const field = section.field[field_index];
  		   if (field.show_on_condition === undefined || field.value!==undefined) {
  		   	 const colspan = field.type!="text"? 1: 2;
  		   	 addColSpanElement(field.label + ": " + field.value, colspan);
  		   }
	  }
  	}
	
    doc.save(file_name);
	
}

