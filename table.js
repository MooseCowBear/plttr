function getData(independentCol, dependentCol, independentErr, dependentErr) {
  /*
    function to retrieve data from the table. 
    points are divided into two categories: active and inactive. 
    only active points are used to perfom fit.
  */
	let independentColIndex, dependentColIndex; 
	let independentErrIndex = "none";
  let dependentErrIndex = "none";

	for (let i = 0; i < table.rows[0].cells.length; i ++) {
		const cellText = table.rows[0].cells[i].innerText; 
		if (cellText === independentCol) {
			independentColIndex = i;
		}
		else if (cellText === dependentCol) {
			dependentColIndex = i;
		}
		else if (cellText === independentErr) {
			independentErrIndex = i;
		}
		else if (cellText === dependentErr) {
			dependentErrIndex = i;
		}
	}
	
	const activeXs = [];
	const activeYs = [];

	const inactiveXs = [];
	const inactiveYs = [];

	const activeXerrs = [];
	const activeYerrs = [];

	const inactiveXerrs = [];
	const inactiveYerrs = [];

	for (let i = 1, row; row = table.rows[i]; i++) {
		const firstCol = row.cells[0]; 
		const child = firstCol.getElementsByTagName("input"); 
		const chk = child[0]; //the "exclude" checkbox
		
		if (chk.checked) {
      getPoint(independentColIndex, dependentColIndex, independentErrIndex, dependentErrIndex, inactiveXs, inactiveYs, inactiveXerrs, inactiveYerrs);
		}
		else { //active point
      getPoint(independentColIndex, dependentColIndex, independentErrIndex, dependentErrIndex, activeXs, activeYs, activeXerrs, activeYerrs);
    }
	}
	return {"activeX": activeXs, "activeY": activeYs, "inactiveX": inactiveXs, "inactiveY": inactiveYs, "activeXerr": activeXerrs, "activeYerr": activeYerrs, "inactiveXerr": inactiveXerrs, "inactiveYerr": inactiveYerrs}; //for graphing and fitting
}

function getPoint(xIndex, yIndex, xErrIndex, yErrIndex, xs, ys, xErrs, yErrs) {		
  let x = row.cells[xIndex].innerText;
  let y = row.cells[yIndex].innerText;

	if (checkInput(x) && checkInput(y) && x !== "" && y !== "") {
		xs.push(parseFloat(x));
		ys.push(parseFloat(y));

		let xErr = row.cells[xErrIndex].innerText;

		if (xErrIndex != "none" && checkInput(xErr) && xErr !== "") {
			xErrs.push(parseFloat(xErr));
		}
		else {
			xErrs.push(0);
		}

    let yErr = row.cells[yErrIndex].innerText;

    if (yErrIndex != "none" && checkInput(yErr) && yErr !== "") {
      yErrs.push(parseFloat(yErr)); 
    }
    else {
      yErrs.push(0);
    }
	}
}

function checkInput(input) {
  // either empty table cell or a number counts as valid input. 
	const inp = input.trim(); 

	if(isFinite(inp)){ 
  		return true;
	}
	return false;
}