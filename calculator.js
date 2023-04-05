/* functions relating to adding/ evaluating formulas */

function openCalculator() {
	const formulaModal = document.getElementById("formula-modal");
	formulaModal.style.display = "block";
}

function getEvaluationUtilities() {
	return {
		operators: ["+", "-", "/", "*", "^"], 
		functions: ["log10", "ln", "negate", "sqRoot", "sin", "cos", "tan", "slope", "log2", "abs"],
		precedence: {
			"+": 1,
			"-": 1,
			"/": 2,
			"*": 2,
			"^": 3
		},
		association: {
			"+": "left",
			"-": "left",
			"/": "left",
			"*": "left",
			"^": "right"
		}
	};
}

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

	formulaState.newFormula = ""; 
	formulaState.infix.length = 0; 
	formulaState.prevNum = false;
	formulaState.number = "";
	formulaState.ROC = 0;

	updateDisplay(formulaState);
	enableNonColButtons();
}

function updateDisplay(formulaState) {
	const display = document.querySelector(".calculator__screen");
	display.innerText = formulaState.newFormula; 
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

function updateNumber(formulaState) {
	/* 
		called when a non-digit calculator is pushed. 
		need to wait until we know the number is finished before we add it to the 
		infix array
	*/
	if (formulaState.prevNum) { 
		formulaState.infix.push(number);
		formulaState.prevNum = false;
		formulaState.number = ""; 
	}
}

function getColNameFromIndex(index) {
  const theTable = document.getElementById("table");
	return theTable.rows[0].cells[index].innerText; 
}
	
function cancelFormula(formulaState) {
	const formulaModal = document.getElementById("formulaModal");
	resetModal(formulaState);
	formulaModal.style.display = "none";
}

function addNonDigit(char, formulaState) {
	/* this includes e and pi, but not functions */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += char;
	updateDisplay(formulaState);
	updateNumber(formulaState);
	formulaState.infix.push(char);
}

function addDigit(digit, formulaState) { 
	/* decimal counts as digit for our purposes */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += digit;	
	updateDisplay(formulaState);
	formulaState.prevNum = true;
	formulaState.number += digit;
}

function addFunction(funcName, charRepresentation, formulaState, withParen = false) {
	/* every function except for negation adds left parenthesis */
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += charRepresentation; 
	updateDisplay(formulaState);
	updateNumber(formulaState);
	formulaState.infix.push(funcName);
	if (withParen) {
		formulaState.infix.push("(");
	}
}
	
function addSlope(formulaState) {
	warning.style.visibility = "hidden"; 
	formulaState.newFormula += "Rate of Change( , )";  
	updateDisplay(formulaState);
	updateNumber(formulaState);
	formulaState.infix.push("slope"); 
	formulaState.infix.push("(");
	formulaState.ROC = 1;

	disableNonColButtons();
}

function degreesToRadians(degrees) {
  	return degrees * (Math.PI / 180);
}