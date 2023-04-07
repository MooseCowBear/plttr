document.addEventListener('DOMContentLoaded', () => { 
  const formulas = new Map();

  const graphState = {
    fitSelection: null,
    xAxis: null,
    xAxisError: null,
    yAxis: null,
    yAxisError: null,
  };

  const formulaState = {
		infix: [],
		newFormula: "",
		number: "",
		ROC: 0,
		prevNum: false
	};
  
  const addRowButton = document.getElementById("add-row");
  const addColumnButton = document.getElementById("add-column");

  addRowButton.addEventListener("click", addRow);
  addColumnButton.addEventListener("click", openCalculator); 

  //event listener for changes to x, y column names
  const xColumn = document.getElementById("x-col");
  const yColumn = document.getElementById("y-col");

  xColumn.addEventListener("blur", () => {
    updateColumnName(xColumn);
  });
  yColumn.addEventListener("blur", () => {
    updateColumnName(yColumn, false);
  });

  //event listener for data being added to the table
  const theTable = document.getElementById("table");
  table.addEventListener("input", (event, formulas) => {
    updateTableValues(event, formulas);
  });

  //event listeners for anything clicked in calculator
  const calculator = document.querySelector(".calculator");
  calculator.addEventListener("click", (event) => {
    if (event.target.nodeName === "BUTTON") {
      updateFormula(event, formulaState, formulas);
    }
    //close  x was clicked
    else if (event.target.id === "close") {
      const formulaModal = document.getElementById("formula-modal");
      resetModal(formulaState);
  	  formulaModal.style.display = "none";
    }
  });

  //for closing the calculator by clicking outside it
  window.addEventListener('click', function(event) {
    const formulaModal = document.getElementById("formula-modal");
    if (event.target === formulaModal) {
      resetModal(formulaState);
      formulaModal.style.display = "none";
      }
  });

  //graphing event listener
  const graphSelectionDiv = document.querySelector(".selectors");
  graphSelectionDiv.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
      event.target.parentNode.nextElementSibling.classList.toggle("show");  
      event.target.nextElementSibling.classList.toggle("show");
    }
    addSelection(event, graphState); //can move if button out here..

  });

  //clear graph event listener
  const clearGraph = document.getElementById("clear-graph");
  clearGraph.addEventListener("click", () => {
    hideGraph(graphState);
  });

  //clear everything event listener
  const clearEverything = document.getElementById("clear-everything");
  clearEverything.addEventListener("click", () => {
    window.location.reload();
  }); 
});