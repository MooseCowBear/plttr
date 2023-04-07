//functions for linear fits.

function SVD(m, n, eps, tol, inputMatrix) {
  /*
    SVD algorithm from Golub and Reinsch 1970, 
    except that goto statements have been replaced by functions. 
    outputs SVD matrices q, u, v where q is a triangular matrix represented as an array.
    leaves the input matrix unaltered. 
  */
	const u = Array(m).fill().map(() => Array(n).fill(0.0)); 
	const v = Array(n).fill().map(() => Array(n).fill(0.0));
	const q = Array(n).fill(0.0);

	const e = Array(n).fill(0.0);

	for (let i = 0; i < m; i ++) {
		for (let j = 0; j < n; j++) {
			u[i][j] = inputMatrix[i][j]; 
		}
	}

	let l, s, f, h, y; 

	let g = x = 0;
	
	for (let i = 0; i < n; i ++) {
		e[i] = g;
		s = 0; 
		l = i + 1
		for (let j = i; j < m; j ++) {
			s += u[j][i]**2;
		}
		if (s < tol) {
			g = 0;
		}
		else {
			f = u[i][i];
			if (f < 0) {
				g = Math.sqrt(s);
			}
			else {
				 g = -Math.sqrt(s);
			}

			h = f * g - s;
			u[i][i] = f - g;

			for (let j = l; j < n; j ++) {
				s = 0;
				for (let k = i; k < m; k ++) {
					s += u[k][i] * u[k][j];
				}

				f = s / h;

				for (let k = i; k < m; k++) {
					u[k][j] += f * u[k][i];
				}
			}
		}
		q[i] = g;
		s = 0;

		for (let j = l; j < n; j ++) {
			s += u[i][j]**2;
		}
		if (s < tol) {
			g = 0;
		}
		else {
			f = u[i][i + 1];
			if (f < 0) {
				g = Math.sqrt(s);
			}
			else {
				g = -Math.sqrt(s);
			}
			h = f * g - s;
			u[i][i + 1] = f - g;

			for (let j = l; j < n; j ++) {
				e[j] = u[i][j] / h;
			}
			for (let j = l; j < m; j ++) {
				s = 0;
				for (let k = l; k < n; k ++) {
					s += u[j][k] * u[i][k];
				}
				for (let k = l; k < n; k ++) {
					u[j][k] += s * e[k];
				}
			}
		}

		y = Math.abs(q[i]) + Math.abs(e[i]);
		if (y > x) {
			x = y;
		}
	} //end for i

	//accumulation of right-hand transformations
	for (let i = n - 1; i > -1; i --) {
		if (g !== 0) {
			h = u[i][i + 1] * g;
			for (let j = l; j < n; j ++) {
				v[j][i] = u[i][j] / h;
			}
			for (let j = l; j < n; j++) {
				s = 0;
				for (let k = l; k < n; k ++) {
					s += u[i][k] * v[k][j];
				}
				for (let k = l; k < n; k ++) {
					v[k][j] += s * v[k][i];
				}
			}
		}
		for (let j = l; j < n; j ++) {
			v[i][j] = 0;
			v[j][i] = 0;
		}
		v[i][i] = 1;
		g = e[i];
		l = i;
	}

	//accumulation of left-hand transformations
	for (let i = n - 1; i > -1; i --) {
		l = i + 1;
		g = q[i];

		for (let j = l; j < n; j++) {
			u[i][j] = 0;
		}
		if (g !== 0) {
			h = u[i][i] * g;
			for (let j = l; j < n; j ++) {
				s = 0;
				for (let k = l; k < m; k ++) {
					s += u[k][i] * u[k][j];
				}
				f = s / h;
				for (let k = i; k < m; k ++) {
					u[k][j] += f * u[k][i];
				}
			}
			for(let j = i; j < m; j ++) {
				u[j][i] /= g;
			}
		}
		else {
			for (let j = i; j < m; j ++) {
				u[j][i] = 0;
			}
		}
		u[i][i] += 1;
	}

	//diagonalization of the bidiagonal form
	eps *= x;
	let z = 0;
	for (let k = n - 1; k > -1; k --) {
		let its = 0;
		let cont = true;
		let converged = false;

		while(cont) {
			[its, converged, z] = testFsplitting(k, e, u, eps, q, m, n, v, its, z);
			if (its > 30 || converged === true) {
				cont = false;
			}
		}
	}
	return [q, u, v]; 
}

function testFsplitting(k, e, u, eps, q, m, n, v, its, z) {
	its += 1;
	let L = 0;
	let converged = false;

	for (let l = k; l > -1; l --) {
		L = l;
		if (Math.abs(e[l]) <= eps) {
			[z, converged] = testFconvergence(k, L, q);
			if (converged) {
				convergence(z, n, k, v, q);
				return [its, true, z];
			}
		}
		if (Math.abs(q[l - 1]) <= eps) {
			if (L > 0) {
				[z, converged] = cancellation(L, eps, e, u, q, m, k);
				if (converged) {
					convergence(z, n, k, v, q);
					return [its, true, z];
				}
			}
			else {
				[z, converged] = testFconvergence(k, L, q);
				if (converged) {
					convergence(z, n, k, v, q);
					return [its, true, z];
				}
			}
		}	
	}
	if (L > 0) {
		[z, converged] = cancellation(L, eps, e, u, q, m, k);
		if (converged) {
			convergence(z, n, k, v, q);
			return [its, true, z];
		}
	}
	else {
		[z, converged] = testFconvergence(k, L, q);
		if (converged) {
			convergence(z, n, k, v, q);
			return [its, true, z];
		}
	}
	z = QRtransformation(m, n, q, e, k, L, z, v, u);
	return [its, false, z];
}

function QRtransformation(m, n, q, e, k, l, z, v, u) {
  /* 
    plus shift from bottom 2x2 minor. 
    only returning z, since all other (non-arr, non-matrix) values will be overwritten.
    the original paper gave options for whether u, v matrices would be returned. 
    here, we choose to always return them. 
  */
	let x = q[l]; 
	let y = q[k - 1];
	let g = e[k - 1];
	let h = e[k];
	let f = ((y - z) * (y + z) + (g - h) * (g + h)) / (2 * h * y);

	g = Math.sqrt(f * f + 1);
	let interm = 0;
	if (f < 0) {
		interm = f - g;
	}
	else {
		interm = f + g;
	}
	f = ((x - z) * (x + z) + h * (y/interm - h)) / x;

	let c = 1.0
	let s = 1.0;

	for (let i = l + 1; i < k + 1; i ++) {
    //won't be here if k == l
		g = e[i];
		y = q[i];
		h = s * g;
		g = c * g;
		z = Math.sqrt(f * f + h * h);
		e[i - 1] = z;
		c = f / z;
		s = h / z;
		f = x * c + g * s;
		g = -x * s + g * c;
		h = y * s;
		y *= c;
		for (let j = 0; j < n; j ++) { //skip this if you don't care about v
			x = v[j][i - 1];
			z = v[j][i];
			v[j][i - 1] = x * c + z * s;
			v[j][i] = -x * s + z * c;
		}
		z = Math.sqrt(f * f + h * h);
		q[i - 1] = z;
		c = f / z;
		s = h / z;
		f = c * g + s * y;
		x = -s * g + c * y;
		for (let j = 0; j < m; j ++) { //skip this if you don't care about u
			y = u[j][i - 1];
			z = u[j][i];
			u[j][i - 1] = y * c + z * s;
			u[j][i] = -y * s + z * c;
		}
	}
	e[l] = 0;
	e[k] = f;
	q[k] = x;

	return z;
}

function convergence(z, n, k, v, q) {
	if (z < 0) {
		q[k] = -z;
		for (let j = 0; j < n; j ++) {
			v[j][k] = -v[j][k];
		}
	}
}

function testFconvergence(k, l, q) {
	let converged = false;
	z = q[k];
	if (l === k) {
		converged = true;
	}
	return [z, converged];
}

function cancellation(l, eps, e, u, q, m, k) {
	let c = z = 0;
	let s = 1.0;
	let ll = l - 1; 
	let converged = false;

	let f, g, h, y;

	for (let i = l; i < k + 1; i ++) {
		f = s * e[i];
		e[i] *= c;
		if (Math.abs(f) <= eps) {
			[z, converged] = testFconvergence(k, l, q);
			if (converged) {
				return [z, converged];
			}
		}
		else {
			g = q[i];
			q[i] = Math.sqrt(f * f + g * g);
			h = q[i];
			c = g / h;
			s = -f / h;
			for (let j = 0; j < m; j ++) {
				y = u[j][ll];
				z = u[j][i];
				u[j][ll] = y * c + z * s;
				u[j][i] = -y * s + z * c;
			}
		}
	}
	[z, converged] = testFconvergence(k, l, q); 
	return [z, converged];
}

/* 
  functions to solve for Ax = b, once we have the decomp.
  matrix operation functions assume that we have the correct sizes
*/

function invertDiag(q) {
	const qInverse =  Array(q.length).fill().map(() => Array(q.length).fill(0.0)); 

	for (let i = 0; i < q.length; i ++) {
    //COULD BE TERNARY OP
		if (q[i] !== 0) {
			qInverse[i][i] = 1/q[i];
		}
		else {
			qInverse[i][i] = 0;
		}
	}
	return qInverse;
}

function dot(v1, v2) {
	let dotProduct = 0;
	for (let i = 0; i < v1.length; i ++) {
		dotProduct += v1[i] * v2[i]
	}
	return dotProduct;
}

function getMatrixCol(B, index, len) {
	const column = Array(len).fill(0.0);
	for (let i = 0; i < len; i ++) {
		column[i] = B[i][index];
	}
	return column;
}

function matrixMult(A, B) {
	const result = Array(A.length).fill().map(() => Array(B[0].length).fill(0.0)); 

	for (let i = 0; i < A.length; i ++) {
		for(let j = 0; j < B[0].length; j ++) {
			const Bcol = getMatrixCol(B, j, A.length);
			const dotPr = dot(A[i], Bcol);
			result[i][j] = dotPr;
		}
	}
	return result;
}

function matrixVectMult(A, v) {
	const result = [];

	for (let i = 0; i < A.length; i ++) {
		const dotPr = dot(A[i], v);
		result.push(dotPr);
	}
	return result;
}

function transpose(A) {
	const At = Array(A[0].length).fill().map(() => Array(A.length).fill(0.0)); 

	for (let i = 0; i < A.length; i ++) {
		for (let j = 0; j < A[0].length; j ++) {
			At[j][i] = A[i][j];
		}
	}
	return At;
}

function getVariance(v, q, numCoefs) {
	/*
    fills diagonal of the covariance matrix
    from Numerical Recipes
  */
	const cvm = Array(numCoefs).fill().map(() => Array(numCoefs).fill(0.0)); 

	for (let i = 0; i < numCoefs; i ++) {
		let sum = 0;
		for (let j = 0; j < numCoefs; j ++) {
			if (q[j] !== 0) {
				sum += (v[i][j]/q[j])**2;
			}
		}
		cvm[i][i] = sum;
	}
	return cvm;
}

function svdCovariance(v, q, numCoefs) {
  /* 
    makes covariance matrix.
    from Numerical Recipes.
  */

	const qti = Array(numCoefs).fill(0.0);
	const cvm = getVariance(v, q, numCoefs); //first get diagonal

	for (let i = 0; i < numCoefs; i ++) { //now calc nondiagonal
		qti[i] = 0;
		if (q[i] !== 0) {
			qti[i] = 1/(q[i]**2);
		}
	}
	for (let i = 0; i < numCoefs; i ++) {
		for (let j = 0; j < i; j ++) {
			let sum = 0;
			for (let k = 0; k < numCoefs; k ++) {
				sum += v[i][k] * v[j][k] * qti[k];
			}
			cvm[i][j] = sum;
			cvm[j][i] = sum;
		}
	}
	return cvm;
}

function getNumCoefs(fit) {
	//tells us how many columns our starting matrix should have
	if (fit === "quadratic") {
		return 3;
	}
	else if (fit === "linear") {
		return 2;
	}
	else {
		return 1;
	}
}

function makeMatrix(xs, fit) {
  //create our starting matrix. 
	const numCoefs = getNumCoefs(fit);
	const numPts = xs.length;
	const A = Array(numPts).fill().map(()=> Array(numCoefs).fill(0.0)); 
	
	for (let i = 0; i < numPts; i ++) {
		const afuncs = funcsLinear(xs[i], fit); 
		for (let j = 0; j < numCoefs; j ++) {
			A[i][j] = afuncs[j];
		}
	}
	return A;
}

function funcsLinear(xi, fit) {
	//a modification of the funcs function as in nPlot. 
  let result;
  switch(fit) {
    case "quadratic":
      result = [xi**2, xi, 1.0];
      break;
    case "linear":
      result = [xi, 1.0];
      break;
    case "square law":
      result = [xi**2];
      break;
    case "inverse":
      result = (xi === 0) ? [0] : [1/xi];
      break;
    case "inverse square":
      result = (xi === 0) ? [0] : [1/xi**2];
      break;
    case "proportional":
      result = [xi];
      break;
    case "square root":
      result = xi >= 0 ? [Math.sqrt(xi)] : [0];
      break;
    default:
      result = [1.0];
  }
  return result;
}

function SVDfitWithCovar(xs, ys, fit) {
	const A = makeMatrix(xs, fit);

	m = A.length; //rows
	n = A[0].length; //cols
	tol = 0.0000000000000000000000000000001 //NOTE WHAT PAPER SAID THIS SHOULD BE
	eps = 0.00000001; 

	let sigma, u, v;

	[sigma, u, v] = SVD(m, n, eps, tol, A);

	const sigmaInverse = invertDiag(sigma);
	const uT = transpose(u); 

	let pseudoInverse = matrixMult(v, sigmaInverse);
	pseudoInverse = matrixMult(pseudoInverse, uT);

	const coefs = matrixVectMult(pseudoInverse, ys);
	const covar = svdCovariance(v, sigma, n); 

	return [coefs, covar];
}

//functions for the non-linear fits. i.e. exponential and power law.

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
			done = true;
		}
	}
	values.Lambda = 0;

  //one last call to get the correct covariance matrix
	mrqmin(xs, ys, numPts, a, totalCoef, ia, covar, alpha, beta, numFitCoef, values); 

	return [a, covar, true]; 
}

function powerLawTrans(xs, ys) {
	/* 
    both power law and exponential fits need reasonable starting points.
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
	/*
    this function sorts out the covar matrix so things are in their right place, 
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

function mrqmin(xs, ys, numPts, a, totalCoef, ia, covar, alpha, beta, numFitCoef, values) {	
  /*
    the function responsbile for trials. lambda is our step size. 
  */
	const atry = Array(totalCoef).fill(0.0); //holds temporary coef values
	const da = Array(totalCoef).fill(0.0); 

	if (values.Lambda < 0) { //the first round
		values.Lambda = 0.001;
		values.ochisq = mrqcof(xs, ys, numPts, a, totalCoef, ia, numFitCoef, alpha, beta);
		
		for (let j = 0; j < totalCoef; j ++) {
			atry[j] = a[j];
		}
	}

	for (let j = 0; j < numFitCoef; j ++) {
		for (let k = 0; k < numFitCoef; k ++) {
			covar[j][k] = alpha[j][k];
		}
		covar[j][j] = alpha[j][j] * (1 + values.Lambda);
		da[j] = beta[j];
	}
	
	gaussj(covar, numFitCoef, da); 

	if (values.Lambda === 0) { //last call puts the covariance matrix in its right place
		covsrt(covar, totalCoef, ia, numFitCoef); 
		return;
	}

	let jj = -1;
	for (let i = 0; i < totalCoef; i ++) {
		if (ia[i] !== 0) {
			jj += 1;
			atry[i] = a[i] + da[jj];
		}
	}

	values.chisq = mrqcof(xs, ys, numPts, atry, totalCoef, ia, numFitCoef, covar, da);

	if (values.chisq < values.ochisq) {//did the trial succeed? if so, keep the results and decrease the step
		values.Lambda *= 0.1;
		values.ochisq = values.chisq;

		for (let i = 0; i < numFitCoef; i ++) {
			for (let j = 0; j < numFitCoef; j ++) {
				alpha[i][j] = covar[i][j];
			}
			beta[i] = da[i];
		}
		for (let i = 0; i < totalCoef; i ++) {
			a[i] = atry[i]; 
		}
	}
	else { //a fail, so make the step bigger. discard results. 
		values.Lambda *= 10;
		values.chisq = values.ochisq;
	}
}

function mrqcof(xs, ys, numPts, a, totalCoef, ia, numFitCoef, alpha, beta) {
  /*
    this function gives us the the values of the coefficients, the covariance matrix, 
    and the chisq of our "trial". We compare it to the prev trial to see if it's an 
    improvement (i.e. better chisq means improvement), 
		from Numerical Recipes
  */
	for (let i = 0; i < numFitCoef; i ++) {
		for (let j = 0; j < i + 1; j ++) {
			alpha[i][j] = 0;
		}
		beta[i] = 0;
	}
	let chisq = 0;
	
	for (let i = 0; i < numPts; i++) {
		const [ymod, dyda] = funcsNonlinear(xs[i], a);
		const dy = ys[i] - ymod;
		let jj = -1; //this and kk keep the relevant parts in the upper left of the covar matrix

		for (let j = 0; j < totalCoef; j ++) {
			if (ia[j] !== 0) {
				jj += 1;
				const wt = dyda[j];
				let kk = -1;
			
				for (let k = 0; k < j + 1; k ++) {
					if (ia[k] !== 0) {
						kk += 1;
						alpha[jj][kk] += wt * dyda[k]; 
					}
				}
				beta[jj] += dy * wt
			}
		}
		chisq += dy * dy;
	}

	for (let i = 0; i < numFitCoef; i ++) {
		for (let j = 0; j < i; j ++) {
			alpha[j][i] = alpha[i][j];
		}	
	}
	return chisq;
}

function funcsNonlinear(xi, a) { //as in nPlot
	const y = a[0] * (xi**a[1]) + a[2] * Math.exp(xi * a[3]) + a[4]; 
	const dyda =  Array(5).fill(0.0);
	
	dyda[0] = xi**a[1]; 

	if (xi > 0) {
		dyda[1] = a[0] * (xi**a[1]) * Math.log(xi);
	}
	dyda[2] = Math.exp(xi * a[3]);
	dyda[3] = a[2] * xi * Math.exp(xi * a[3]);
	dyda[4] = 1.0;

	return [y, dyda];
}