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

function solveForY(xs, fit, coefs) {
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
  return [xsToGraph, ysToGraph];
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