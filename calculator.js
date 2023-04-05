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
	/* this includes e and pi, "(", ")", but not functions */
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

function deleteFromFormula(formulaState) {
	/*
		a convoluted function that removes the last element from the infix array,
		and the calculator display
	*/
	const util = getEvaluationUtilities();
	if(number !== "") {
		formulaState.number = number.slice(0, number.length - 1); 
		formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 1);
		updateDisplay(formulaState);
	}
	else {
		if (formulaState.infix.length === 0) {
			return;
		}
		else if (typeof formulaState.infix[infix.length -1] === "string" && formulaState.infix[infix.length - 1].startsWith("col")) {
			const col = formulaState.infix.pop(); //remove the last elem of infix arr
			let index = col.slice(3); //remove "col" from front
			index = parseInt(index); //convert from string to int

			const colName = getColNameFromIndex(index);

			formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - colName.length); //chop off column name from formula string
			updateDisplay();
		}
		else if (formulaState.infix[formulaState.infix.length - 1] === "(") {
			if (util.functions.includes(infix[infix.length - 2])) {
				formulaState.infix.pop(); 
				const endingFcn = formulaState.infix.pop(); //2nd to last elem
				if (endingFcn == "sqRoot") {
					formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 8); //bc "&#8730;(" has 8 chars
				}
				else {
					formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - (endingFcn.length + 1)); //+1 for the left parenthesis
				}
				updateDisplay(formulaState);
			}	
			else { //here is just open "("
				formulaState.infix.pop();
				formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 1); 
				updateDisplay();
			}
		}
		else if (formulaState.infix[formulaState.infix.length - 1] === ")") {
			if (formulaState.infix[formulaState.infix.length - 5] === "slope") {
				let curr; 
				let toSlice = 0; 

				while (curr !== "slope") {
					curr = formulaState.infix.pop(); //as soon as we've pooped slope we're done
					if (curr.startsWith("col")) { //curr is always a string
						let index = col.slice(3); //remove "col" from front
						index = parseInt(index); //convert from string to int

						const colName = getColNameFromIndex(index);
						toSlice += colName.length;
					}
					else {
						toSlice += curr.length;
					}
				}
				formulaState.newFormula = formulaState.newFormula.slice(0, toSlice); 
				enableNonColButtons(); //in case they were deactivated
				updateDisplay(formulaState);
			}
			else { //")" all by itself
				formulaState.infix.pop();
				formulaState.newFormula = formulaState.newFormula.slice(0, newFormula.length - 1); 
				updateDisplay(formulaState);
			}
		}
		else if (infix[infix.length - 1] === Math.PI) {
			formulaState.infix.pop(); 
			formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 4); //"&pi;" has 4 chars
			updateDisplay(formulaState);
		}
		else { //either negate or an operator or E is at the end
			formulaState.infix.pop();
			formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 1); 
			updateDisplay(formulaState);
		}
	}
}

function updateFormula(event, formulaState) {
	if (event.target.classList.contains("digit")) {
		addDigit(event.target.innerText, formulaState);
		return;
	}
	else if (event.target.classList.contains("non-digit")) {
		addNonDigit(event.target.innerText, formulaState);
		return;
	}
	else if (event.target.classList.contains("func")) {
		if (event.target.id === "negate") {
			addFunction("negate", " -", formulaState);
		}
		else {
			addFunction(event.target.id, event.target.innerText, formulaState, true);
		}
		return;
	}
	else if (event.target.classList.contains("calculator__button-column")) {
		columnName = event.target.innerText; 
		addColumnToFormula(columnName);
	}

	switch(event.target.id) {
		case "del":
			deleteFromFormula(formulaState);
			break;
		case "cancel":
			cancelFormula(formulaState);
			break;
		case "clear":
			resetModal();
			break;
		case "slope":
			addSlope(formulaState)
			break;
		default: 
			submitFormula(formulaState, formulaMap);
	}
}

function addColumnToFormula(columnName, formulaState) { 
	const theTable = document.getElementById("table");
	const row = theTable.rows[0]; 
	
	//CAN THIS BE CLEANED UP?
	let colFound = false;
	for (let i = 0, col; col = row.cells[i]; i++) {
		const header = col.innerText;
		if (header === columnName) {
			formulaState.infix.push("col" + i); //whoever's header matches the innertext of the button pushed
			colFound = true;
		}
	}
	if (!colFound) {
		for (let i = 0, col; col = row.cells[i]; i++) {
			const header = col.innerText;
			if (header.includes(columnName.slice(1, columnName.length - 1))) {
				formulaState.infix.push("col" + i);
			}
		}
	}

	if (formulaState.ROC === 1) {
		formulaState.newFormula = formulaState.newFormula.slice(0, formulaState.newFormula.length - 4);
		formulaState.newFormula += columnName;
		formulaState.newFormula += ", )";
		formulaState.ROC = 2;
	}
	else if (formulaState.ROC === 2) {
		formulaState.newFormula = formulaState.newFormula.slice(0, newFormula.length - 2);
		formulaState.newFormula += columnName;
		formulaState.newFormula += ")";
		formulaState.ROC = 0;
		formulaState.infix.push(")");

		//reactivate other, non-col buttons here...
		enableNonColButtons(); 
	}
	else {
		formulaState.newFormula += columnName; 
	}
	updateDisplay(formulaState);
}

function submitFormula(formulaState, formulaMap) { 
	/*
		when a new formula is submitted, we need to check 1. that it is a valid formula,
		2. that user has entered a name for the column and it is unique.
		we also need to update the dom to reflect the new column.
	*/
	const formModal = document.getElementById("formula-modal");
	updateNumber(formulaState);

	const nameForm = document.getElementById("name");
	const nameLabel = document.getElementById("name-input__label");

	if (nameForm.value === "") {
		nameLabel.classList.add("warning-on");
		nameForm.classList.add("warning-on"); 
	}

	else { 
		const validName = checkName(newColName, 0); 

		if (validName) {
			nameLabel.innerText = "add a name:"; 
			nameLabel.classList.remove("warning-on"); 
			nameForm.classList.remove("warning-on");

			const [valid, postfix] = makePostfix(); 

			if (valid) {
				addToFormulaMap(postfix, formulaMap);

				addFormulaColumn(newColName); 

				extendVariableDropdowns(newColName);

				formulaState.newFormula = "";
				formulaState.infix.length = 0;
				
				const newColumnButton = document.createElement('button'); 
				newColumnButton.classList.add("calculator__button-column", "active"); 
				newColumnButton.innerText = newColName;
		
				const columns = document.getElementById("columns");
				columns.appendChild(newColumnButton); 

				nameForm.value = ""; 
				updateDisplay(formulaState); 
				formModal.style.display = "none"; 
			}
			else { 
				const warning = document.getElementById("invalid-formula");
				warning.style.visibility = "visible"; 
				updateDisplay(formulaState);
			}
		} 
		else {
			nameLabel.innerText = "add a distinct name:"; 
			nameLabel.classList.add("warning-on");
			nameForm.classList.add("warning-on");
		}
	}
}

function addToFormulaMap(postfix, formulaMap) {
	const currNumCols = document.getElementById('table').rows[0].cells.length; 
	formulaMap.set(currNumCols, postfix); 
}