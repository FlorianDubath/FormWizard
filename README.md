# FormWizard
This project create a wizard out of a json object describing the fields to be completed. All the navigation of one page of the wizard to the other, the validation and (if requested) pdf generation are done on the browser. The wizard do *NOT* communicate with the server unless requested (and then it send the final pdf).

## Functionality
Gives a div id and a json, the FormWizard will create the form into the div. 

For each section it create a page of the wizard. On navigation the section is validated (check if mandatory fields are filled)
On the last section, the user validate the form this action will call a callback with the json completed with the user-provided values.

A function is provided to convert the json completed with user-provided values into a pdf.

## specification
* N section(s) to be filled.
* Each section has an arbitrary number of fields
* Fields can be of type: Single line text, Multiline text, Date or Enumeration (dropdown or radio-button)
* Enumerations are listed into the json
* Fields can be specified as mandatory and/or pre-filled. 
* One can define a test on an enumeration field, either by providing a value to be match or a value not to be match
* Fields can be display only if a given condition is meet

## More
* Play with the test.html... you may hove to access it throug a web server due to cross requests bloqued by the browser
* PHP class for edit the json model file

