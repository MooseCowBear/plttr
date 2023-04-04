/* functions relating to adding/ evaluating formulas */

function resetModal(formulaState) {
  /*
    function to clear out any changes made to the modal. 
    called whenever the modal closes. 
  */
	const nameLabel = document.getElementById("name-input__label"); 
	const nameForm = document.getElementById("name");

	nameLabel.innerText = "add a name: ";

  nameLabel.classList.remove("warning-on");
  nameForm.classList.remove("warning-on");

	nameForm.value = ""; //stays

  const warning = document.querySelector(".invalid-formula");
	warning.style.visibility = "hidden"; 

	formulaState.newFormula = ""; //stays
	formulaState.infix.length = 0; 
	formulaState.prevNum = false;
	formulaState.number = "";
	formulaState.ROC = 0;

	updateDisplay();
	enableNonColButtons();
}

function updateDisplay() {
	const display = document.querySelector(".calculator__screen");
	display.innerText = newFormula; //do we want to pass this?
}

function disableNonColButtons() {
	document.querySelectorAll('calculator__button').forEach(elem => {
    elem.disabled = true;
	  elem.classList.remove("active"); 
  });
}

function enableNonColButtons(){
	document.querySelectorAll('calculator__button').forEach(elem => {
    elem.disabled = false;
	  elem.classList.add("active"); 
  });
}
 

function updateNumber() {
	/* 
		called when a non-digit calculator is pushed.
	*/
	if (prevNum) { 
		infix.push(number);
		prevNum = false;
		number = ""; 
	}
}

function getColNameFromIndex(index) {
  const the_table = document.getElementById("table");
	return the_table.rows[0].cells[index].innerText; 
}

/* reworking all of the functions used for clicking on a calculator button.
	will add one click event listener to the calculator */
	
function cancelFormula() {
	const formulaModal = document.getElementById("formulaModal");
	resetModal();
	formulaModal.style.display = "none";
}

//everything that is not a digit or roc, updates same...

function addNonDigit(char, formulaState) {
	/* this includes e and pi, but not functions */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += char;
	updateDisplay();
	updateNumber();
	formulaState.infix.push(char);
}

function addDigit(digit, formulaState) { 
	/* decimal counts as digit for our purposes */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += digit;	
	updateDisplay();
	formulaState.prevNum = true;
	formulaState.number += digit;
}

function addFunction(funcName, charRepresentation, formulaState, withParen = false) {
	/* every function except for negation adds left parenthesis */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += charRepresentation; 
	updateDisplay();
	updateNumber();
	formulaState.infix.push(funcName);
	if (withParen) {
		formulaState.infix.push("(");
	}
}
	
function addSlope(formulaState) {
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += "Rate of Change( , )";  
	updateDisplay();
	updateNumber();
	formulaState.infix.push("slope"); 
	formulaState.infix.push("(");
	formulaState.ROC = 1;

	disableNonColButtons();
}

function degreesToRadians(degrees) {
  	return degrees * (Math.PI / 180);
}