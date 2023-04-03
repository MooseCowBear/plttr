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
      cell.classList.add(".edit");
   	}
	}
}

function updateColumnName(event, x = true) {
  /*
    when user updates x, y column names, need to populate throughout.
    if they attempt to change to a name that is already taken or to none, 
    refuse the change and revert to original name.
  */
  let newColName = e.target.innerText;
  const index = x ? 1: 2;
	const validName = checkName(newColName, index);

  if (!validName) {
		newColName = x ? "x" : "y"; 
		e.target.innerText = newColName;
	}

  const err = x ? document.getElementById("x-err") : document.getElementById("y-err");
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

function addFormulaColumn(newColName, formulaMap) {
	const numRows = document.querySelector("table").rows.length; 
	const currNumCols = document.getElementById('table').rows[0].cells.length;  

  for (const [i, row] of [...document.querySelectorAll("#table tr")].entries()) {
    const cell = document.createElement(i ? "td" : "th"); 

		if (cell.nodeName === "TH") {
      cell.innerText = newColName;
    }
		else {
			const formula = formulaMap.get(currNumCols); //SHOULD THESE BE IN THIS FILE OR WITH THE FORMULA ENTERER STUFF or does the map belong in the main file?
			const cellValue = compute(formula, i, numRows); 
			cell.innerText = cellValue;
		}
    row.appendChild(cell); 
	}
}

function updateTableValues(event, formulaMap) {
  if (event.target.classList.contains(".edit")) {
    const val = event.target.innerText; 
    if (checkInput(val)) { 
      event.target.border = "none"; //remove warning border if there was one
    }
    else { 
      event.target.border = "1px solid salmon"; //CHECK COLOR - would a border or a change to the background color look better?
    }
    const numRows = table.rows.length; 
  
    for (let i = 5; i < table.rows[0].cells.length; i ++) {
      for (let row = 1; row < numRows; row ++) {
        const formula = formulaMap.get(i); 
        const computedValue = compute(formula, row, numRows);
        table.rows[row].cells[i].innerText = computedValue;
      }
    }
  }
}

function checkInput(input) { 
	const inp = input.trim(); 
	if(isFinite(inp)){ 
  		return true;
	}
	return false;
}

function extendVariableDropdowns(colName) {
	/*
    when we add a new column, we also need to add it 
    to each of the relevant dropdown options
  */

	const x = document.getElementById("x-dropdown");
	const y = document.getElementById("y-dropdown");
	const x_error = document.getElementById("x-err-dropdown");
	const y_error = document.getElementById("y-err-dropdown");

  const dropdowns = [x, y, x_error, y_error];

  dropdowns.forEach(elem => {
    const newButton = document.createElement("button");
    newButton.classList.add("button__dropdown", "dropdown-option", elem.id);
    newButton.innerText = colName;
    elem.appendChild(newButton);
  });
}