document.addEventListener('DOMContentLoaded', () => { 
  const formulas = new Map();

  const graphState = {
    fitSelection: null,
    xAxis: null,
    xAxisError: null,
    yAxis: null,
    yAxisError: null,
  }

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
    updateColumnName();
  });
  yColumn.addEventListener("blur", () => {
    updateColumnName(false);
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
      resetModal();
  	  formulaModal.style.display = "none";
    }
  });

  //event listener to close modal if click outside the calculator

  //graphing event listeners

  //clear graph event listener

  //clear everything event listener
});


//some testing to see what the graph will look like... 

let exp = "Math.sin(x)"; 

// Generate values
let xValues = [];
let yValues = [];

for (let x = 0; x <= 10; x += 0.1) {  //100-ish data points for regression line
  yValues.push(Math.sin(x));
  xValues.push(x);
}

console.log("the number of x vals is: ", xValues.length); 

// Display using Plotly

let layout = {title: "y = " + exp, showlegend: false, paper_bgcolor: '#edeae5', plot_bgcolor: '#edeae5', font: {
  family: 'Inter, monospace',
  size: 14,
  color: '#026670'
} };

let points = {
  x: [0, 1, 2, 3, 4, 5], 
  y: [1.5, 1, 1.3, 0.7, 0.8, 0.9], 
  error_x: {
    type: 'data',
    array: [0, 0, 0, 0, 0, 0],
    visible: false
  },
  marker:{
    color: 'hsla(185, 96%, 22%, 0.7)'
  },
  mode: 'markers',
  type: 'scatter'
};

let line = {
  x:xValues, y:yValues, marker: { color: '#026670'}, mode:"lines" //"lines is what connects the points"
}

const graph = document.getElementById("graph");

let config = {responsive: true}
let data = [points, line]
Plotly.newPlot("graph", data, layout, config);


//TEST! - this moves into dom loaded event
const clearEverything = document.getElementById("clear-everything");
clearEverything.addEventListener("click", refresh); 

function refresh() {
  window.location.reload(); 

	console.log(formulaState); //FOR DEBUGGING
  console.log(graphState);
	console.log("formulas", formulas.entries()); 
}