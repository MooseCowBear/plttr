# plttr-2.0

plttr was developed for use in an introductory physics course. It has the functionality of nPlot, plus calculated columns. 


Any two columns maybe selected for the x- and y-axes, and if desired, the student may also chose columns for x-error and y-error. The application will calculate, graph, and report the coefficients of the selected fit, the standard errors of those coefficients, and the fit’s RMSE. 


Students have the option of excluding any point(s) they desire from the fit. These points will appear in the graph grayed out, so students can see where they fall in relation to the other points, but they are not factored into the calculations for the regression line. 

## Live

- [Live](https://moosecowbear.github.io/plttr-2.0/)

### The Table


Four default columns are presented: x, y, x-err, y-err. Students may rename the x and y columns so long as the chosen names are distinct. Changes will populate throughout. If a student tries to rename the x or y column to a column name that has already been chosen, the change will not be accepted and the column will revert to its original column name. 


Any number counts as valid input (including scientific notation, which for JS looks like 3.125e-10). Any non-number input to a data cell will be highlighted with a red border. 


There are no prohibitions on what may be entered into a table cell. If a table cell contains a non-number, the fitting functions will ignore it. 


### The Calculated Columns


Calculated columns are entered through a calculator-like modal where references to columns are presented in blue. 


Upon submission, the formula is converted from infix to postfix via the shunting yard algorithm. Validation has been added to the algorithm. If the student enters a invalid formula, a warning is displayed and the modal remains open so that the student may correct their entry. 


Superfluous parentheses are valid as long as they are matched. 


Columns must be named. If the student fails to provide a distinct name for the column, a warning will be displayed, the formula will not be accepted and the modal remains open. 


Calculations will be made whenever possible, i.e. when new data is added to the table or when a new column is added. So if a student wants to collect some data, then add some calculated columns, then collect new data or make changes to existing data, etc. that is fine. 


If a row contains a non-number or a singularity, an “!” will be displayed for any cell whose calculation depends on that value. 


Calculated values are rounded to five significant digits. 


##### Two notes about slope…


1. When the student includes Rate of Change in a formula, all non-column buttons on the calculator will be disabled until the two columns for the slope have been chosen. 


2. Without slope, (re)calculations could've been limited to the row in which a change is made. Slope interferes with the ability to do this. So instead of keeping detailed and convoluted track of which cells affect which others, the whole table recalculates whenever a change is made. It kills my soul slightly to do this, but so would the alternative and the table will be small. 


### The Fits


All of the fits use single value decomposition. All of the fits, except for exponential and power law, use SVD exclusively. Exponential and power law are performed using the Levenberg–Marquardt method. They use SVD on a log transformation of the data to obtain a starting point for LM. 


Any data points containing singularities, such as negative x-values for square root, are ignored. 


At least three valid data points are needed in order to perform any fit. If a fit cannot be performed due to insufficient data, this is stated above the graph. In this case, a graph of only the data will be presented. 


No restrictions are made as so which fits may be performed on the chosen data. This means even terrible fits will be calculated and displayed. In the case of exponential and power law, LM may not reach convergence. Nevertheless, the result will be displayed. 


RMSE is calculated using only x-values that are not singularities. Therefore a relatively low RMSE does not guarantee a better fit. I indicate the presence of one or more singularities with a “+ infinity”. 


Currently, errors are not incorporated into the fits. This is something I intend to remedy at some point. 

### The graph


Graphing is done with plotly.js


##### References

The algorithms employed can be found in the following places:

Dijkstra, Edsger W. (1961) "Algol 60 translation : An Algol 60 translator for the x1 and Making a translator for Algol 60", Research Report 35, Mathematisch Centrum, Amsterdam. 

Golub, G.H. and Reinsch, C. (1970) Singular Value Decomposition and Least Squares Solutions. Numerische Mathematik, 14, 403-420.

Press, William H. et al. (1986) Numerical Recipes. Cambridge University Press. 