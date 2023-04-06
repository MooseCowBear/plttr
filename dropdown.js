function addSelection(event, graphState) {
  if (event.target.tagName === "BUTTON") {
    const selectionFor = event.target.parentNode.id; 
    const selectionMap = getSelectionMap();
    graphState[selectionMap[selectionFor]] = event.target.innerText; 

    addToSelectionsDisplay(event, selectionFor);
    updateDropdownHighlight(event);

    if (readyToGraph(graphState)) {
      fitGraphReport(graphState);
    }
  }
}

function getSelectionMap() {
  return {
    "x-axis": "xAxis",
    "x-axis-err": "xAxisError",
    "y-axis": "yAxis",
    "y-axis-err": "yAxisError",
    "fit-selection": "fitSelection"
  };
}

function readyToGraph(graphState) {
  return Object.values(graphState).every(x => x !== null); 
}

function addToSelectionsDisplay(event, choice) {
  const display = document.querySelector(".selection__choices");
  const selection = display.querySelector(`.${choice}`);
  const colonIndex = selection.innerText.indexOf(":");

  selection.innerText = selection.innerText.slice(0, colonIndex + 2) + event.target.innerText;
  selection.style.display = "block";
}

function updateDropdownHighlight(event) {
  const parent = event.target.parentNode;
  const options = parent.querySelectorAll("BUTTON");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("current");
  }
  event.target.classList.add("current"); 
}

function clearSelections(graphState) {
  /* 
    remove highlighting from all dropdowns, 
    remove all displayed choices from view, 
    update graphState object
  */
  const graphSelectionDiv = document.querySelector(".selectors");
  const options = graphSelectionDiv.querySelectorAll("BUTTON");
  for (let i = 0; i < options.length; i++) {
    options[i].classList.remove("current");
  }

  const display = document.querySelector(".selection__choices");
  const displayDivs = display.querySelectorAll("DIV");
  for (let i = 0; i < displayDivs.length; i++) {
    displayDivs[i].style.display = "none";
  }

  graphState.fitSelection = null;
  graphState.xAxis = null;
  graphState.xAxisError = null;
  graphState.yAxis = null;
  graphState.yAxisError = null;
}

function extendVariableDropdowns(colName) {
	/*
    when we add a new column, we also need to add it 
    to each of the relevant dropdown options
  */

	const x = document.getElementById("x-dropdown");
	const y = document.getElementById("y-dropdown");
	const x_error = document.getElementById("x-err-dropdown");
	const y_error = document.getElementById("y-err-dropdown");

  const dropdowns = [x, y, x_error, y_error];

  dropdowns.forEach(elem => {
    const newButton = document.createElement("button");
    newButton.classList.add("button__dropdown", "dropdown-option", elem.id);
    newButton.innerText = colName;
    elem.appendChild(newButton);
  });
}