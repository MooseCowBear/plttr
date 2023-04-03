/* functions relating to adding/ evaluating formulas */

function resetModal() {
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

	newFormula = ""; //stays
	infix.length = 0; 
	prevNum = false;
	number = "";
	ROC = 0;

	updateDisplay();
	enableNonColButtons();
}

function updateDisplay() {
	const display = document.querySelector(".calculator-screen");
	display.innerText = newFormula; //do we want to pass this?
}

function disableNonColButtons() {
	document.querySelectorAll('button.calc-btn').forEach(elem => {
    elem.disabled = true;
	  elem.classList.remove("hov"); //THIS NEEDS TO BE UPDATED
  });
}

function enableNonColButtons(){
	document.querySelectorAll('button.calc-btn').forEach(elem => {
    elem.disabled = false;
	  elem.classList.add("hov"); //UPDATE
  });
}
