// functions for the graph and the graph report

//except for title, will stay the same
let layout = {
  title: "", //THIS WILL CHANGE = eq from reportRMSE??
  showlegend: false, 
  paper_bgcolor: '#edeae5', 
  plot_bgcolor: '#edeae5', 
  font: {
    family: 'Inter, monospace',
    size: 14,
    color: '#026670'
  } 
};

/*
  going to need up to 3 plots: active points, inactive points, regression line. 
  want functions to return the jsons that are passed to the plot function.
  plus a plot function. 
*/

function graph(fit) {
  /* not finished want this to be where all the action is*/
  const graph = document.getElementById("graph");

  Plotly.newPlot("graph", data, layout, config);
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
    "exponential": "y = Ae\u1D2D\u02E3 + C",
    "power law": "y = Ax\u1D47",
    "no relation": "y = A",
    "none": ""
  }
  return titles[fit];
}

function fitPoints(dataObject, fitSelection, xRange) {
  /*
    here we take the data we got from the table, clean and fit it.
    we return a bool to indicate whether there is a fit to graph.
    also we return points that will make up the regression line, and the 
    coefficients and covariance matrix, which will be used to report the fit
  */

	const xsToGraph = getXValuesForLine(xRange);

	if (fitSelection === "exactly proportional") {
		const toGraph = solveForY(xsToGraph, fitSelection, []);
		return [true, [], [], toGraph[0], toGraph[1]]; 
	}
	else {
		const [cleanXs, cleanYs] = cleanData(dataObject.activeX, dataObject.activeY, fitSelection);

		if (cleanXs.length < 3) { //there's not enough data for a fit
			return [false, [], [], [], []]; 
		}
		else
		{
			if (fitSelection === "exponential" || fitSelection === "power law") {
				//call nonlinear fitting routine
				const [coefs, covar, graph] = nonlinearFit(cleanXs, cleanYs, fitSelection);
				
				if (graph) {
					const toGraph = solveForY(xsToGraph, fitSelection, coefs);
					return [true, coefs, covar, toGraph[0], toGraph[1]]; 
				}
				else //not enough data points for nonlinear fit
				{
					return [false, [], [], [], []];
				}
			}
			else { //one of the linear fits
				const [coefs, covar] = SVDfitWithCovar(cleanXs, cleanYs, fitSelection); 
				const toGraph = solveForY(xsToGraph, fitSelection, coefs);
				
				return [true, coefs, covar, toGraph[0], toGraph[1]]; 
			}
		}
	}
}

function getXValuesForLine(xRange) {
  const xsToGraph = []; 
	const incr = (xRange.max - xRange.min)/100; 

	let curr = xRange.min;
	while (curr <= xRange.max) {
		xsToGraph.push(curr);
		curr += incr; 
	}
  return xsToGraph
}

function getRange(values) {
	let min = Math.min(...values); 
	let max = Math.max(...values);

	const sci = (max - min).toExponential();
	const index = sci.indexOf("e"); 
	const base = parseInt(sci.slice(0, index)); 

	const power = parseInt(sci.slice(index + 1)); //getting the power of the difference
	const padding = 10**power; //dont want data points to be right on the edge of the graph
	
	//rounding to the nearest "nice" number
	if (power < 0) {
		min = roundDecimal(min - padding, Math.abs(power));
		max = roundDecimal(max + padding, Math.abs(power));
	}
	else {
		min = roundInt(min - padding, power);
		max = roundInt(max + padding, power);
	}
	return {"min": min, "max": max}
}

/* helper functions for getRange */
function roundDecimal(num, places) {
    const multiplier = Math.pow(10, places);
    return Math.round(num * multiplier) / multiplier;
}

function roundInt(num, pow) {
  return Math.round(num/10**pow)*10**pow;
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
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} &plusmn; ${Math.sqrt(covar[1][1])}`; 
		  c = `C = ${coefs[2]} &plusmn; ${Math.sqrt(covar[2][2])}`;

      coefParagraph.innerText = `${a}\n${b}\n${c}`;
      break;
    case "linear":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} &plusmn; ${Math.sqrt(covar[1][1])}`; 

		  coefParagraph.innerText = `${a}\n${b}`;
      break;
    case "square law":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "inverse":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "inverse square":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "proportional":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "square root":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    case "exponential":
      a = `A = ${coefs[2]} &plusmn; ${Math.sqrt(covar[2][2])}`;
		  b = `B = ${coefs[3]} &plusmn; ${Math.sqrt(covar[3][3])}`; 
		  c = `C = ${coefs[4]} &plusmn; ${Math.sqrt(covar[4][4])}`;
		
		  coefParagraph.innerText = `${a}\n${b}\n${c}`;
      break;
    case "power law":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;
		  b = `B = ${coefs[1]} &plusmn; ${Math.sqrt(covar[1][1])}`; 
		
		  coefParagraph.innerText = `${a}\n${b}`;
      break;
    case "no relation":
      a = `A = ${coefs[0]} &plusmn; ${Math.sqrt(covar[0][0])}`;

		  coefParagraph.innerText = a;
      break;
    default: //both none and exactly proportional
      coefParagraph.innerText = "";
  }
}