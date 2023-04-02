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
	return {
    activeX: activeXs, 
    activeY: activeYs, 
    inactiveX: inactiveXs, 
    inactiveY: inactiveYs, 
    activeXerr: activeXerrs, 
    activeYerr: activeYerrs, 
    inactiveXerr: inactiveXerrs, 
    inactiveYerr: inactiveYerrs
  }; 
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

/*
need to add addcolumn function 
- add column will need access to all the formula calculator/enterer functions
also functions for renaming the content editable table headers
and for recalculating table when new data is entered
*/

function addRow() { 
  const table = document.getElementById("table");
  const row = table.insertRow(table.rows.length); 

	for (let i = 0; i < table.rows[0].cells.length; i++) {
    const cell = row.insertCell(i); 

		if (i === 0) {
			const chk = document.createElement("input");

			chk.setAttribute("type", "checkbox");
      cell.classList.add("exclude", "checkbox");
			cell.appendChild(chk);
		}
   	else if (i > 0 && i < 5) {
			cell.setAttribute("contenteditable", "true");
   	}
	}
}

function updateColumnName(event, x = true) {
  let newColName = e.target.innerText;
  const index = x ? 1: 2;
	const validName = checkName(newColName, index); //ADD THIS FUNCTION TO THIS FILE

  if (!validName) {
		newColName = x ? "x" : "y"; 
		e.target.innerText = newColName;
	}

  const err = x ? document.getElementById("x-err") : document.getElementById("y-err");
  const col = x ? document.getElementById("x-col") : document.getElementById("y-col"); //where is this used??

  const formulaBtn = x ? document.getElementById("x-btn") : document.getElementById("y-btn");
  const errFormulaBtn = x ? document.getElementById("x-err-btn") : document.getElementById("y-err-btn");

  err.innerText = "&plusmn; " + newColName;
  formulaBtn.innerText = newColName;
  errFormulaBtn.innerText = "&plusmn; " + newColName;

  const dropdowns = x ? document.querySelectorAll('.x-dropdown') : document.querySelectorAll('.y-dropdown');
  const errDropdowns = x ? document.querySelectorAll('.x-err-dropdown') : document.querySelectorAll('.y-err-dropdown');

  dropdowns.forEach(elem => {
    elem.innerText = newColName;
  });

  errDropdowns.forEach(elem => {
    elem.innerText = "&plusmn; " + newColName;
  });
}

function checkName(colName, cellIndex) {
  /*
    need to make sure there are no columns with the same name,
    or that are named none. 
  */
	const strippedColName = colName.trim().toLowerCase();
	if (strippedColName === "none") {
		return false;
	}

	for (let i = 1; i < table.rows[0].cells.length; i++) {
		if (i !== cellIndex && table.rows[0].cells[i].innerText === strippedColName) {
			return false;
		}
	}
	return true; 
}
