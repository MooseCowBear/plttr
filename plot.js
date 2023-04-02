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

//switch to switch - return equation to go in title of plot - also use formatted strings
function reportFit(fit, coefs, covar) {
	const eqParagraph = document.getElementById("equation");	//NEED TO MAKE SURE JS HAS A PLACE FOR THESE THINGS
	const coefParagraph = document.getElementById("coefs");

	if (fit === "quadratic") {
		const eq = "y = Ax" + String.fromCharCode(178) + " + Bx + C"; 
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);
		const b = "B = " + coefs[1] + " " + "&plusmn;" + " " + Math.sqrt(covar[1][1]); 
		const c = "C = " + coefs[2] + " " + "&plusmn;" + " " + Math.sqrt(covar[2][2]);
		
		eqParagraph.innerText = eq;
		coefParagraph.innerText = a + "\n" + b + "\n" + c; 
	}
	else if (fit === "linear") {
		const eq = "y = Ax + B";
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);
		const b = "B = " + coefs[1] + " " + "&plusmn;" + " " + Math.sqrt(covar[1][1]); 

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a + "\n" + b;
	}
	else if (fit === "square law") {
		const eq = "y = Ax" + String.fromCharCode(178);
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}
	else if (fit === "inverse") {
		const eq = "y = A/x";
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}
	else if (fit === "inverse square") {
		const eq = "y = A/x" + String.fromCharCode(178);
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}
	else if (fit === "proportional") {
		const eq = "y = Ax";
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}
	else if (fit === "exactly proportional") {
		const eq = "y = x";
		eqParagraph.innerText = eq;
	}
	else if (fit === "square root") {
		const eq = "y = A" + "\u221A" + "x"; 	
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}	
	else if (fit === "exponential") {
		const eq = "y = Ae" +  "\u1D2D\u02E3"+ " + C"; 
		const a = "A = " + coefs[2] + " " + "&plusmn;" + " " + Math.sqrt(covar[2][2]);
		const b = "B = " + coefs[3] + " " + "&plusmn;" + " " + Math.sqrt(covar[3][3]); 
		const c = "C = " + coefs[4] + " " + "&plusmn;" + " " + Math.sqrt(covar[4][4]);
		
		eqParagraph.innerText = eq;
		coefParagraph.innerText = a + "\n" + b + "\n" + c; 
	}
	else if (fit === "power law") {
		const eq = "y = Ax" + "\u1D47"; // should be: supescript b
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);
		const b = "B = " + coefs[1] + " " + "&plusmn;" + " " + Math.sqrt(covar[1][1]); 
		
		eqParagraph.innerText = eq;
		coefParagraph.innerText = a + "\n" + b;  
	}
	else if (fit === "no relation") {
		const eq = "y = A";
		const a = "A = " + coefs[0] + " " + "&plusmn;" + " " + Math.sqrt(covar[0][0]);

		eqParagraph.innerText = eq;
		coefParagraph.innerText = a;
	}
	else {
		eqParagraph.innerText = "";
		coefParagraph.innerText = "";
	}
}
