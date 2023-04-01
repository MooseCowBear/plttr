// functions for plotting

//solving for y, for plotting regression line
function solveForY(xs, fit, coefs) {
	const xsToGraph = [];
	const ysToGraph = [];

	if (fit === "quadratic") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(coefs[0]*xs[i]**2 + coefs[1]*xs[i] + coefs[2]);
		}
	}
	else if (fit === "linear") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(coefs[0]*xs[i] + coefs[1]);
		}
	}
	else if (fit === "square law") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(coefs[0]*xs[i]**2);
		}
	}
	else if (fit === "inverse") {
		for (let i = 0; i < xs.length; i++) {
			if (xs[i] !== 0) {
				xsToGraph.push(xs[i]);
				ysToGraph.push(coefs[0]*(1/xs[i])); 
			}
		}
	}
	else if (fit === "inverse square") {
		for (let i = 0; i < xs.length; i++) {
			if (xs[i] !== 0) {
				xsToGraph.push(xs[i]);
				ysToGraph.push(coefs[0]*(1/xs[i]**2)); 
			}
		}
	}
	else if (fit === "proportional") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(coefs[0]*xs[i]);
		}
	}
	else if (fit === "square root") {
		for (let i = 0; i < xs.length; i++) {
			if (xs[i] >= 0) {
				xsToGraph.push(xs[i]);
				ysToGraph.push(coefs[0]*Math.sqrt(xs[i]));
			}
		}
	}
	else if (fit === "exactly proportional") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(xs[i]);
		}
	}	
	else if (fit === "exponential") {
		for (let i = 0; i < xs.length; i++) {
			xsToGraph.push(xs[i]);
			ysToGraph.push(coefs[2]*Math.E**(coefs[3]*xs[i]) + coefs[4]); 
		}
	}
	else if (fit === "power law") {
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
	}
	else { //no relation 
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
