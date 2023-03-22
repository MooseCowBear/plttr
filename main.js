
let exp = "Math.sin(x)";

// Generate values
let xValues = [];
let yValues = [];
for (let x = 0; x <= 10; x += 0.1) {
  yValues.push(eval(exp));
  xValues.push(x);
}

// Display using Plotly
//var data = [{x:xValues, y:yValues, mode:"lines"}];
let layout = {title: "y = " + exp, paper_bgcolor: '#edeae5', plot_bgcolor: '#edeae5', font: {
  family: 'Inter, monospace',
  size: 14,
  color: '#026670'
} };
//Plotly.newPlot("graph", data, layout);

let trace1 = {
  x: [0, 1, 2, 3, 4, 5], 
  y: [1.5, 1, 1.3, 0.7, 0.8, 0.9], 
  marker:{
    color: 'hsla(185, 96%, 22%, 0.7)'
  },
  mode: 'markers',
  type: 'scatter'
};

let trace2 = {
  x:xValues, y:yValues, marker: { color: '#026670'}, mode:"lines"
}

let data = [trace1, trace2]
Plotly.newPlot("graph", data, layout);