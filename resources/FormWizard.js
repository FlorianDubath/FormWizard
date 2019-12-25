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

class FormWizard {
  constructor(container_id, model) {
    this.container_id = container_id;
    this.model = model;
    this.initialized = false;
    
    this.initialize();
    this.showSection(0);
    
  }
  
  initialize() {
  	 if (this.initialized) {
  	 	return;
  	 }
  	 this.current_section = -1;
  	 
  	 this.container = document.getElementById(this.container_id); 
  	 // Create the bread crumb
  	 var header = document.createElement("div");
  	 header.id="header";
  	 header.classList.add("header");
  	 
  	 for (var index=0; index < model["formWizardObject"].section.length; index++) {
  	 	 var btn = new BcButton(this, index);
  	 	 header.appendChild(btn.getDom());
  	 }
  	 
  	 var btn_close = document.createElement("div");  
  	 btn_close.classList.add("bc_btn_close");
  	 btn_close.form_wizard = this;
