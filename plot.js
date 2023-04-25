/* functions for the graph and the graph report - needs to reference fits.js 
AND whatever file ends up reading from the table
*/

function fitGraphReport(graphState) {
  /* 
    the main function to do the fit, make the graph, report the fit. called when 
    all 5 selectors have been chosen. 
  */
	if (!validColumnSelection(graphState.xAxis, graphState.yAxis, graphState.xAxisError, graphState.yAxisError)) {
    return;
  }

  const graphDiv = document.querySelector(".graph-wrapper__outer");
  graphDiv.style.display = "flex";
  const dataObject = getData(graphState.xAxis, graphState.yAxis, graphState.xAxisError, graphState.yAxisError);
  const points = getPointPlotObjects(dataObject);
  let data = [points.active, points.inactive];

  if (graphState.fitSelection === "none") {
    graph(data, graphState.fitSelection);
    reportRMSE(dataObject, graphState.fitSelection, [], false);
    reportFit(graphState.fitSelection, [], []);
    return; 
  }

  const [fitToReport, coefs, covar, line] = fitPoints(dataObject, graphState.fitSelection);

  if (line !== null) data.push(line); 
  graph(data, graphState.fitSelection);
  reportRMSE(dataObject, graphState.fitSelection, coefs, fitToReport);

  if (fitToReport) { 
		reportFit(graphState.fitSelection, coefs, covar);
	}
	else {
		addNotEnoughDataWarning(graphState.fitSelection);
	}
}

function validColumnSelection(independent, dependent, independentErr, dependentErr) {
  /* 
    since users can change the names of the editable columns at any time, want to make 
    sure that the columns chosen for the fit still match columns in the table before 
    trying to get data
  */
  let columns = [];

	for (let i = 0; i < table.rows[0].cells.length; i ++) {
		columns.push(table.rows[0].cells[i].innerText); 
	}
	if (!columns.includes(independent) || !columns.includes(dependent)) {
		return false;
	}
	if ( (independentErr != "none" && !columns.includes(independentErr)) || (dependentErr != "none" && !columns.includes(dependentErr)) ) {
		return false;
	}
  return true;
}

function graph(data, fit) { 
  const { background_color, font_color, font_family } = getGraphAttributes();

  const config = {responsive: true}

  const layout = {
    title: getGraphTitle(fit),
    showlegend: false, 
    paper_bgcolor: background_color,
    plot_bgcolor: background_color, 
    font: {
      family: font_family,
      size: 14,
      color: font_color 
    } 
  };

  Plotly.newPlot("graph", data, layout, config); //takes id as first parameter 
}

function getGraphAttributes() {
  return {
    background_color: 'hsl(37, 18%, 91%)',
    font_color: 'hsl(185, 96%, 22%)',
    font_family: 'Inter, monospace'
  };
}

function getPointPlotObjects(dataObject) {
  const { active_color, inactive_color } = getColors();

  let active = {
    x: dataObject.activeX, 
    y: dataObject.activeY,
    error_x: {
      type: 'data',
      array: dataObject.activeXerr,
      visible: dataObject.activeXerr.every(elem => elem === 0) ? false : true
    },
    error_y: {
      type: 'data',
      array: dataObject.activeYerr,
      visible: dataObject.activeYerr.every(elem => elem === 0) ? false : true
    },
    marker: {
      color: active_color
    },
    mode: 'markers', 
    type: 'scatter'
  };

  let inactive = {
    x: dataObject.inactiveX, 
    y: dataObject.inactiveY,
    error_x: {
      type: 'data',
      array: dataObject.inactiveXerr,
      visible: dataObject.inactiveXerr.every(elem => elem === 0) ? false : true
    },
    error_y: {
      type: 'data',
      array: dataObject.inactiveYerr,
      visible: dataObject.inactiveYerr.every(elem => elem === 0) ? false : true
    },
    marker: {
      color: inactive_color
    },
    mode: 'markers', 
    type: 'scatter'
  };

  return {active: active, inactive: inactive};
}

function getColors() {
  return { 
    active_color: 'hsla(185, 96%, 22%, 0.7)', 
    inactive_color: 'hsl(0, 0%, 60%)' 
  };
}

function getGraphTitle(fit) {
  const titles = { 
    "quadratic": "y = Ax\u00B2 + Bx + C",
    "linear": "y = Ax + B",
    "square law": "y = Ax\u00B2",
    "inverse": "y = A/x",
    "inverse square": "y = A/x\u00B2",
    "proportional": "y = Ax",
    "exactly proportional": "y = x",
    "square root": "y = A\u221Ax",
    "exponential": "y = Aeᴮ\u02E3 + C",
    "power law": "y = Ax\u1D47",
    "no relation": "y = A",
    "none": ""
  }
  return titles[fit];
}

function fitPoints(dataObject, fitSelection) {
  /*
    here we take the data we got from the table, clean and fit it.
    we return a bool to indicate whether there is a fit to graph.
    also we return points that will make up the regression line, and the 
    coefficients and covariance matrix, which will be used to report the fit
  */

	const xsToGraph = getXValuesForLine(dataObject);

	if (fitSelection === "exactly proportional") {
		const line = solveForY(xsToGraph, fitSelection, []);
		return [true, [], [], line]; 
	}
	else {
		const [cleanXs, cleanYs] = cleanData(dataObject.activeX, dataObject.activeY, fitSelection);

		if (cleanXs.length < 3) { //there's not enough data for a fit
			return [false, [], [], null]; 
		}
		else {
			if (fitSelection === "exponential" || fitSelection === "power law") {
				//call nonlinear fitting routine
				const [coefs, covar, graph] = nonlinearFit(cleanXs, cleanYs, fitSelection);
				
				if (graph) { 
					const line = solveForY(xsToGraph, fitSelection, coefs);
					return [true, coefs, covar, line]; 
				}
				else { //not enough data points for nonlinear fit after removing singularities
					return [false, [], [], null];
				}
			}
			else { //one of the linear fits
				const [coefs, covar] = SVDfitWithCovar(cleanXs, cleanYs, fitSelection); 
				const line = solveForY(xsToGraph, fitSelection, coefs);
				
				return [true, coefs, covar, line]; 
			}
		}
	}
}

function getXValuesForLine(dataObject) {
  [min, max] = getXMinAndMax(dataObject);
  if (min === max) {
    return []; 
  }
  const xsToGraph = []; 
	const incr = (max - min)/100; 

	let curr = min;
	while (curr <= max) {
		xsToGraph.push(curr);
		curr += incr; 
	}
  return xsToGraph;
}

function getXMinAndMax(dataObject) {
  const min = Math.min(Math.min(...dataObject.activeX), Math.min(...dataObject.inactiveX));
  const max = Math.max(Math.max(...dataObject.activeX), Math.max(...dataObject.inactiveX));
  return [min, max];
}

function cleanData(xs, ys, fit) {
  /*
    need to remove any duplicate values.
    in the case of power law and square root fits, we need to remove any points with
    negative x-values. 
  */
	const cleanXs = [];
	const cleanYs = [];
	const seen = new Set();

  for (let i = 0; i < xs.length; i ++) {
    const point = `${xs[i]}, ${ys[i]}`;
		if (!seen.has(point) && (xs[i] >= 0 || (fit != "power law" && fit != "square root"))) {
			cleanXs.push(xs[i]);
			cleanYs.push(ys[i]);
			seen.add(point);
		}
  }
	return [cleanXs, cleanYs]; 
}

function solveForY(xs, fit, coefs) {
  /* 
    gets the y values needed for the plot 
    returns object that plotly will use to draw the regression line 
  */
	const xsToGraph = [];
	const ysToGraph = [];

  switch(fit) {
    case "quadratic":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[0] * xs[i]**2 + coefs[1] * xs[i] + coefs[2]);
      }
      break;
    case  "linear":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[0] * xs[i] + coefs[1]);
      }
      break;
    case "square law":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[0] * xs[i]**2);
      }
      break;
    case "inverse":
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== 0) {
          xsToGraph.push(xs[i]);
          ysToGraph.push(coefs[0] * (1 / xs[i])); 
        }
      }
      break;
    case "inverse square":
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== 0) {
          xsToGraph.push(xs[i]);
          ysToGraph.push(coefs[0] * (1 / xs[i]**2)); 
        }
      }
      break;
    case "proportional":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[0] * xs[i]);
      }
      break;
    case "square root":
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] >= 0) {
          xsToGraph.push(xs[i]);
          ysToGraph.push(coefs[0] * Math.sqrt(xs[i]));
        }
      }
      break;
    case "exactly proportional":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(xs[i]);
      }
      break;
    case "exponential":
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[2] * Math.E**(coefs[3] * xs[i]) + coefs[4]); 
      }
      break;
    case "power law":
      for (let i = 0; i < xs.length; i++) {
        if (isWhole(coefs[1])) { //if this coef is a fractional, then we need to exclude negative x values
          if (xs[i] > 0) {
            xsToGraph.push(xs[i]);
            ysToGraph.push(coefs[0]*xs[i]**coefs[1]);
          }
        }
        else {
          xsToGraph.push(xs[i]);
          ysToGraph.push(coefs[0]*xs[i]**coefs[1]); 
        }
      }
      break;
    default:
      for (let i = 0; i < xs.length; i++) {
        xsToGraph.push(xs[i]);
        ysToGraph.push(coefs[0]); 
      }
  }

  const line = {
    x: xsToGraph, 
    y: ysToGraph, 
    marker: { color: '#026670'}, 
    mode:"lines" //"lines is what connects the points"
  }
  return line;
}

function isWhole(num) {
  //helper function used to determine which x values are okay for power law
	if (num - Math.floor(num) > 0) {
		return false;
	}
	return true; 
}

function computeRMSE(xs, ys, fit, coefs) {
  /*
    computes rmse for points whose x-values are not singularities. 
    display of rmse for a set of data points whose fit produced one or more singularities
    is appended with +/- infinity
  */
	let sumOfErrSq = 0;
	let N = xs.length; 

  switch(fit) {
    case "quadratic":
      for (let i = 0; i < xs.length; i++) {
        yhat = coefs[0] * xs[i]**2 + coefs[1] * xs[i] + coefs[2];
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "linear":
      for (let i = 0; i < xs.length; i++) {
        yhat = coefs[0] * xs[i] + coefs[1];
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "square law":
      for (let i = 0; i < xs.length; i++) {
        yhat = coefs[0] * xs[i]**2;
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "inverse":
      N = 0;
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== 0) {
          N += 1;
          yhat = coefs[0] * (1 / xs[i]);
          sumOfErrSq += (ys[i] - yhat)**2;
        }
      }
      break;
    case "inverse square":
      N = 0;
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] !== 0) {
          N += 1;
          yhat = coefs[0] * (1 / xs[i]**2); 
          sumOfErrSq += (ys[i] - yhat)**2;
        }
      }
      break;
    case "proportional":
      for (let i = 0; i < xs.length; i++) {
        yhat = coefs[0] * xs[i];
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "square root":
      N = 0;
      for (let i = 0; i < xs.length; i++) {
        if (xs[i] >= 0) {
          N += 1;
          yhat = coefs[0] * Math.sqrt(xs[i]);
          sumOfErrSq += (ys[i] - yhat)**2;
        }
      }
      break;
    case "exactly proportional":
      for (let i = 0; i < xs.length; i++) {
        yhat = xs[i];
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "exponential":
      for (let i = 0; i < xs.length; i++) {
        yhat = coefs[2] * Math.E**(coefs[3] * xs[i]) + coefs[4]; 
        sumOfErrSq += (ys[i] - yhat)**2;
      }
      break;
    case "power law":
      N = 0;
      for (let i = 0; i < xs.length; i++) {
        if (isWhole(coefs[1])) {
          if (xs[i] > 0) {
            N += 1;
            yhat = coefs[0] * xs[i]**coefs[1];
            sumOfErrSq += (ys[i] - yhat)**2;
          }
        }
        else {
          N += 1;
          yhat = coefs[0] * xs[i]**coefs[1]; 
          sumOfErrSq += (ys[i] - yhat)**2;
        }
      }
      break;
    default:
      for (let i = 0; i < xs.length; i++){
        yhat = coefs[0]; 
        sumOfErrSq += (ys[i] - yhat)**2;
      }
  }
  let addInf = false;
	if (N !== xs.length) {
		addInf = true;
	}
	return [Math.sqrt(sumOfErrSq/N), addInf];
}

function reportRMSE(dataObject, fitSelection, coefs, fitToReport) {
	const RMSE = document.getElementById("rmse");
  RMSE.innerText = "";

	if (fitToReport) {
		let [rmse, addInf] = computeRMSE(dataObject.activeX, dataObject.activeY, fitSelection, coefs);
		
		if (addInf) {
			RMSE.innerText = `RMSE: ${rmse} &infin;`;
		}
		else {
			RMSE.innerText = `RMSE: ${rmse}`;
		}
	}
}

function addNotEnoughDataWarning(fitSelection) {
	const fitReport = document.getElementById("coefs"); 
	fitReport.innerText = `not enough data for ${fitSelection} fit`; 
}

function reportFit(fit, coefs, covar) {
	const coefParagraph = document.getElementById("coefs");
  let a, b, c = "";

  switch(fit) {
    case "quadratic":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} \u00b1 ${Math.sqrt(covar[1][1])}`; 
		  c = `C = ${coefs[2]} \u00b1 ${Math.sqrt(covar[2][2])}`;

      coefParagraph.innerText = `${a}\n${b}\n${c}`;
      break;
    case "linear":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} \u00b1 ${Math.sqrt(covar[1][1])}`; 

		  coefParagraph.innerText = `${a}\n${b}`;
      break;
    case "square law":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "inverse":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "inverse square":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "proportional":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "square root":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "exponential":
      a = `A = ${coefs[2]} \u00b1 ${Math.sqrt(covar[2][2])}`;
		  b = `B = ${coefs[3]} \u00b1 ${Math.sqrt(covar[3][3])}`; 
		  c = `C = ${coefs[4]} \u00b1 ${Math.sqrt(covar[4][4])}`;
		
		  coefParagraph.innerText = `${a}\n${b}\n${c}`;
      break;
    case "power law":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} \u00b1 ${Math.sqrt(covar[1][1])}`; 
		
		  coefParagraph.innerText = `${a}\n${b}`;
      break;
    case "no relation":
      a = `A = ${coefs[0]} \u00b1 ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    default: //both none and exactly proportional
      coefParagraph.innerText = "";
  }
}

function hideGraph(graphState) {
  const graphDiv = document.querySelector(".graph-wrapper__outer");
  graphDiv.style.display = "none";
  clearSelections(graphState);
}