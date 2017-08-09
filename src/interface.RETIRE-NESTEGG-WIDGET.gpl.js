
/*global alert: false, jQuery: false, GUI$: false */

/*jslint vars: true */

/** 
* @preserve Copyright 2016 Pine Grove Software, LLC
* financial-calculators.com
* pine-grove.com
* interface.RETIRE-NESTEGG-WIDGET.js
*/
(function ($, GUI) {
	'use strict';

	// don't try to initialize the wrong calculator
	if (!document.getElementById('retire-nest-egg')) {
		return;
	}


	var obj = {}, // interface object to base equations
		// gui controls
		currentAgeInput,		
		retireAgeInput,		
		pvInput,
		cfInput,
		rateInput;		


	/**
	* init() -- init or reset GUI's values
	*/
	function initGUI() {
		currentAgeInput.setValue(currentAgeInput.getUSNumber());
		retireAgeInput.setValue(retireAgeInput.getUSNumber());
		pvInput.setValue(pvInput.getUSNumber());
		cfInput.setValue(cfInput.getUSNumber());
		rateInput.setValue(rateInput.getUSNumber());

		document.getElementById("edFV").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFVDate").value = GUI.dateConventions.date_mask;

	} // initGUI



	/**
	* clearGUI() -- reset GUI's values
	*/
	function clearGUI() {

		currentAgeInput.setValue(0);
		retireAgeInput.setValue(0);
		pvInput.setValue(0.0);
		cfInput.setValue(0.0);
		rateInput.setValue(0.0);


		document.getElementById("edFV").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(0, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(0.0, GUI.moneyConventions, 2);
		document.getElementById("edFVDate").value = GUI.dateConventions.date_mask;

	} // clearGUI



	/**
	* getInputs() -- get user inputs and initialize obj equation interface object
	*/
	function getInputs() {
		var yrs;
		// all rates are passed as decimal equivalents
		obj = {};
		if (currentAgeInput.getUSNumber() <= 0) {
			alert('"Current Age" must be greater than 0.');
			return null;
		}
		if (retireAgeInput.getUSNumber() > currentAgeInput.getUSNumber()) {
			yrs = (retireAgeInput.getUSNumber() - currentAgeInput.getUSNumber()) + 1;
		} else {
			alert('"Retirement Age" must be greater than "Current Age"');
			return null;
		}
		obj.n = yrs * 12;
		obj.pv = pvInput.getUSNumber();
		obj.cf = cfInput.getUSNumber();
		obj.nominalRate = rateInput.getUSNumber() / 100;


		obj.oDate = GUI.dateMath.getFirstNextMonth(new Date());
		obj.oDate.setHours(0, 0, 0, 0);
		obj.fDate = GUI.dateMath.getFirstNextMonth(new Date(obj.oDate));
		obj.lDate = new Date();

		obj.pmtFreq = 6;
		obj.cmpFreq = 6;
		obj.pmtMthd = 0;
		return 1;
	} // getInputs()



	/** 
	* calc() -- initialize CashInputs data structures for equation classes
	*/
	function calc() {
		var invested, interest, bal;

		getInputs();
		// ca = currentAgeInput.getUSNumber();
		// if (ca <= 0) {
		// 	alert('Current age must be greater than 0.');
		// 	return null;
		// }
		if (obj.n === 0 || (obj.pv === 0 && obj.cf === 0) || obj.nominalRate === 0) {
			alert('There are unknown values.\nPlease make sure all values are entered.\n\n"Current Retirement Savings" can be 0.');
			return null;
		}

		// obj.fv = 0;
		// obj.fv = GUI.FV.calc(obj);

		obj.lDate.setTime(GUI.dateMath.addPeriods(obj.oDate, obj.n, obj.pmtFreq));
		GUI.RETIRE_NESTEGG_SCHEDULE.calc(obj);
		obj.fv = GUI.summary.unadjustedBalance;
		invested = GUI.summary.totalPmts[1];
		interest = GUI.summary.totalInterest[1];
		bal = GUI.summary.unadjustedBalance;

		document.getElementById("edFV").value = GUI.formatLocalFloat(obj.fv, GUI.moneyConventions, 2);
		document.getElementById("edNumPmts").value = GUI.formatLocalFloat(obj.n, GUI.numConventions, 0);
		document.getElementById("edTotalInvested").value = GUI.formatLocalFloat(GUI.roundMoney(invested, 2), GUI.moneyConventions, 2);
		document.getElementById("edInterest").value = GUI.formatLocalFloat(GUI.roundMoney(interest, 2), GUI.moneyConventions, 2);
		document.getElementById('edFVDate').value = GUI.dateMath.dateToDateStr(obj.lDate, GUI.dateConventions);
		return 1;
	} // function calc()




	$(document).ready(function () {

		//
		// initialize GUI controls & dialog / modal controls here
		// attach
		//


		// main window
		currentAgeInput = new GUI.NE('edCurrentAge', GUI.numConventions, 0);
		retireAgeInput = new GUI.NE('edRetirementAge', GUI.numConventions, 0);
		pvInput = new GUI.NE('edPV', GUI.moneyConventions, 2);
		cfInput = new GUI.NE('edCF', GUI.moneyConventions, 2);
		rateInput = new GUI.NE('edRate', GUI.rateConventions, 4);

		initGUI();


		$('#btnCalc').click(function () {
			// getInputs();
			calc();
		});


		$('#btnClear').click(function () {
			clearGUI();
		});


		$('#btnPrint').click(function () {
			// getInputs();
			calc();
			GUI.print_calc();
		});


		$('#btnSchedule').click(function () {
			// getInputs();
			if (calc() !== null) {
				GUI.showSavingsSchedule(GUI.RETIRE_NESTEGG_SCHEDULE.calc(obj));
			}
		});


		$('#btnCharts').click(function () {
			// getInputs();
			if (calc() !== null) {
				GUI.showSavingsCharts(GUI.RETIRE_NESTEGG_SCHEDULE.calc(obj));
			}
		});


		$('#btnHelp').click(function () {
			GUI.show_help();
		});


		$('#btnCcyDate, #btnCcyDate2, #CCY').click(function () {
			GUI$.init_CURRENCYDATE_Dlg();
		});

	}); // $(document).ready

}(jQuery, GUI$));
