

function nonlinearFit(xs, ys, fit) {

	const covar = Array(5).fill().map(() => Array(5).fill(0.0)); // 5x5 matrices
	const alpha = Array(5).fill().map(() => Array(5).fill(0.0)); 

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

	const values = {chisq: prevChisq, ochisq: 0, Lambda: -1} //these are values we will need to carry over from one iteration to the next

	while (!done) {
		its += 1; 
		
		mrqmin(xs, ys, numPts, a, totalCoef, ia, covar, alpha, beta, numFitCoef, values); 

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

function powerLawTrans(xs, ys) {
	/* both power law and exponential fits need reasonable starting points.
    these are obtained by running a linear fit on the log values of the data points. 
    here and in the function below, we tranform to log values, excluding singularities.
  */

	const lxs = [];
	const lys = [];

	for (let i = 0; i < xs.length; i ++) {
		if (xs[i] > 0 && ys[i] > 0) {
			lxs.push(Math.log(xs[i]));
			lys.push(Math.log(ys[i]));
		}
	}
	return [lxs, lys];
}

function exponentialTrans(xs, ys) {
	const lxs = [];
	const lys = [];

	for (let i = 0; i < xs.length; i ++) {
		if (ys[i] > 0) {
			lxs.push(xs[i]);
			lys.push(Math.log(ys[i]));
		}
	}
	return [lxs, lys];
}

function covsrt(a, totalCoef, ia, numFitCoef) {
	/*this function sorts out the covar matrix so things are in their right place, 
    which we only really need for the exponential fit. 
    w/o this the covar matrix is in the upper left corner of the 5x5 matrix we started with, 
    we want it in the bottom right.
    alternatively we could omit this and just remember that there was a shift when we go to 
    retrieve the covariances.
  */

	for (let i = 0; i < totalCoef; i ++) {
		for (let j = 0; j < i; j ++) {
			a[i][j] = 0;
			a[j][i] = 0;
		}
	}

	let k = numFitCoef - 1;

	for (let j = totalCoef - 1; j > -1; j --) {
		if (ia[j] !== 0) {
			for (let i = 0; i < totalCoef; i ++) {
				const temp = a[i][k];
				a[i][k] = a[i][j];
				a[i][j] = temp;
			}
			
			for (let i = 0; i < totalCoef; i ++) {
				const temp = a[k][i];
				a[k][i] = a[j][i];
				a[j][i] = temp;
			}
			k -= 1;
		}
	}
}

function gaussj(a, n, b) {
	const ipiv = Array(n).fill(0.0);
	const indxc = Array(n).fill(0.0);
	const indxr = Array(n).fill(0.0);

	let irow = 0;
	let icol = 0;
	let big;

	for (let i = 0; i < n; i ++) {
		big = 0;
		
		for(let j = 0; j < n; j ++) {
			if (ipiv[j] !== 1) {
				for (let k = 0; k < n; k ++) {
					if (ipiv[k] === 0) {
						if (Math.abs(a[j][k]) >= big) {
							big = Math.abs(a[j][k]);
							irow = j;
							icol = k;
						}
					}
				}
			}
		}
		ipiv[icol] += 1;
		
		if (irow !== icol) {
			for (let j = 0; j < n; j ++) {
				const temp = a[irow][j];
				a[irow][j] = a[icol][j];
				a[icol][j] = temp;
			}
			const temp = b[irow];
			b[irow] = b[icol];
			b[icol] = temp;
		}
		indxr[i] = irow;
		indxc[i] = icol;

		if (a[icol][icol] === 0) {
			console.log("singular matrix");
			return;
		}
		const pivinv = 1/a[icol][icol];
		a[icol][icol] = 1;

		for (let j = 0; j < n; j ++) {
			a[icol][j] *= pivinv;
		}
		b[icol] *= pivinv;
		
		for (let j = 0; j < n; j ++) {
			if (j !== icol) {
				const temp = a[j][icol];
				a[j][icol] = 0;
				
				for (let k = 0; k < n; k ++) {
					a[j][k] -= a[icol][k] * temp;
				}
				b[j] -= b[icol] * temp;
			}
		}
	}

	for (let i = n - 1; i > -1; i --) {
		if (indxr[i] !== indxc[i]) {
			for (let j = 0; j < n; j ++) {
				const temp = a[j][indxr[i]];
				a[j][indxr[i]] = a[j][indxc[i]];
				a[j][indxc[i]] = temp;
			}
		}
	}
}