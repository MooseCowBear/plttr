

function nonlinearFit(xs, ys, fit) {

	const covar = Array(5).fill().map(()=> Array(5).fill(0.0)); // 5x5 matrices
	const alpha = Array(5).fill().map(()=> Array(5).fill(0.0)); 

	const ia = Array(5).fill(0);
	const a = Array(5).fill(0.0);

	let lxs, lys;

	if (fit === "power law") {
		[lxs, lys] = powerLawTrans(xs, ys);
	}
	else {
		[lxs, lys] = exponentialTrans(xs, ys);
	}

	if (lxs.length < 3) {
		console.log("Not enough data");
		return [a, covar, false]; //false indicates nothing to graph
	}

	let [linCoefs, ] = SVDfitWithCovar(lxs, lys, "linear"); 

	const numPts = xs.length;
	const totalCoef = 5;
	let numFitCoef;

	if (fit === "power law") {
		ia[0] = 1;
		ia[1] = 1;

		a[0] = Math.exp(linCoefs[1]);
		a[1] = linCoefs[0];
		numFitCoef = 2;
	}
	else {
		ia[2] = 1;
		ia[3] = 1;
		ia[4] = 1;

		a[2] = Math.exp(linCoefs[1]);
		a[3] = linCoefs[0];
		numFitCoef = 3;
	}

	let done = false;
	const maxIts = 200;
	let its = 0;

	let beta = Array(5).fill(0.0);

	let prevChisq = 1000000;

	const values = {chisq: prevChisq, ochisq: 0, Lambda: -1} //these will be changed in the mrqmin call and we want to keep track of them

	while (!done) {
		its += 1; 
		
		mrqmin(xs, ys, numPts, a, totalCoef, ia, covar, alpha, beta, numFitCoef, values); //covar, alpha, beta passed by reference

		if (values.chisq < prevChisq) {
			const test = (prevChisq - values.chisq)/values.chisq;
			if (Math.abs(test) < 0.0001) {
				console.log("convergence");
				done = true;
			}
		}
		prevChisq = values.chisq; 

		if (its > maxIts) {
			console.log("no convergence");
			return [a, covar, true]; //no convergence but we have a fit to graph
		}
	}
	values.Lambda = 0;

	mrqmin(xs, ys, numPts, a, totalCoef, ia, covar, alpha, beta, numFitCoef, values); 

	return [a, covar, true]; 
}