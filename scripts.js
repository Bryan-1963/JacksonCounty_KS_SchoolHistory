
	
	//==========================================================================================
	// GLOBAL VARIABLES
	//==========================================================================================
	var topTitleHeight = 46;
	var topMenuHeight=51;
	var subTitleHeight=46;
	var subMenuHeight=51;	
	var contentTitleHeight=46;
	var maps = []; //array of PageObjects for maps
	var countySchoolDistricts = []; //array of PageObjects for elementary schools
	var countyHighSchools = []; //array of PageObjects for high schools
	var usdSchools = []; //array of PageObjects for USDs
	var docPages = []; //array of AnnotatedPhotoObject, loaded by loadDocPages
	var docSearchPrecision = 1.00;
	var docPagesAreSearched = false;
	var docSearchResultPages = []; //array of page numbers containing the searched for text
	var docSearchResultCurrPg = 0;
	var docSearchPatterns = []; //array of regex patterns to search for
	var docSearchTerm = "";
	var docPgNum = 0;
	var webRootLocation = "https://bryan-1963.github.io/JacksonCounty_KS_SchoolHistory/";
	var subMenuName = '';
	var subMenuCat = '';
	var docPageNumInput = document.getElementById("docPageNumInput");
	var docPageSearchInput = document.getElementById("docPageSearchInput");
		
	//=======================================================================================================================================================
	// EVENT LISTENERS
	//=======================================================================================================================================================	
	window.addEventListener("resize", sizeBars());
	document.getElementById("MainMenu").addEventListener("load", sizeBars());
	document.getElementById("SubMenu").addEventListener("load", sizeBars());
	document.getElementById("iFrameHolder").addEventListener("load", sizeBars());
	document.getElementById("SubTitle").addEventListener("load", sizeBars());
	document.getElementById("ContentTitle").addEventListener("load", sizeBars());
	
	//---------------------------
	// ELEMENT RESIZE OBSERVER
	//---------------------------
	var ro = new ResizeObserver( entries => {
	  for (let entry of entries) {
		if (entry.contentBoxSize) {
			//entry.target.handleResize(entry);
			sizeBars();
		}
	  }
	});
	ro.observe(document.getElementById("MainMenu"));
	ro.observe(document.getElementById("SubMenu"));
	ro.observe(document.getElementById("SubTitle"));
	ro.observe(document.getElementById("ContentTitle"));
	
	//-----------------------------------------
	// Document pagenumber input listener 
	//-----------------------------------------
	docPageNumInput.addEventListener("keydown", function (e) {
		if (e.code === "Enter" || e.code === "NumpadEnter") //checks whether the pressed key is "Enter"
		{  
			docPgNum = Math.floor(Number(e.target.value))-1; //eliminate any decimal and change user 1-based input to 0-based input
			if (docPgNum>docPages.length-1) {docPgNum=docPages.length-1}
			if (docPgNum<0){docPgNum=0};
			
			//update the page number input box to account for limiting
			docPageNumInput.setAttribute("value",Number(docPgNum)+1);

			//load the requested page
			loadDocPageNum(docPgNum);
		}
	});
	
	//-----------------------------------------
	// Document search input listener 
	//-----------------------------------------
	docPageSearchInput.addEventListener("keydown", function (e) {
		if (e.code === "Enter" || e.code === "NumpadEnter") //checks whether the pressed key is "Enter"
		{  
			let searchTerm = docPageSearchInput.value;
			if (searchTerm != null && searchTerm!=""){
				searchDocument(1);
			}
		}
	});	
	
	//=======================================================================================================================================================
	// FUNCTIONS
	//=======================================================================================================================================================
		
	//==========================================================================================
	// clearSearchInput
	//==========================================================================================
	function clearSearchInput(inputBoxName){
		
		//get the input box
		let thisSearchBox = document.getElementById(inputBoxName);
		
		//clear the input box
		thisSearchBox.setAttribute("value",""); 
		thisSearchBox.dispatchEvent(new Event('input'));
		thisSearchBox.value = "";
		thisSearchBox.focus();
		thisSearchBox.dispatchEvent(new Event('input'));
		
		//reset the search results counter
		document.getElementById("docSearchResultsQty").innerHTML='0/0';
		docSearchResultCurrPg=0;
		
		//clear out the search results
		clearDocumentSearch();
		
	};
	
	//==========================================================================================
	// clearDocumentSearch
	//==========================================================================================	
	function clearDocumentSearch(){

		//reset the search patterns
		docSearchPatterns.length = 0;		
		
		//reset flag
		docPagesAreSearched=false;
		
		//reset the results array
		docSearchResultPages.length=0;
		
		//remove highlights from current page by reloading it without highlights
		loadDocPageNum(docPgNum);

	};

	//==========================================================================================
	// searchDocument
	//==========================================================================================
	function searchDocument(precisionRqd=1.00){  
		//0.70 (very fuzzy) < precisionRqd <= 1.00 (perfect matches only)
	
		//initialize variables
		let foundSomeMatches = false;
		docSearchPrecision = precisionRqd; //save to global variable
		
		//clear out any existing search 
		clearDocumentSearch();
		docSearchPatterns.length = 0;
		
		docSearchTermInput = docPageSearchInput.value.toString().trim().toLowerCase();
		console.log("in searchDocument, rcd precisionRqd=" + precisionRqd + ", and docSearchTermInput=" + docSearchTermInput);
		
		if (docSearchTermInput != null && docSearchTermInput!=""){
			
			//.................................................
			// load docSearchPatterns
			//.................................................
			//keep anything between quotes as an individual item, otherwise split them up
			let startQuote = false;
			let word = "";
			for (let i=0;i<=docSearchTermInput.length-1;i++){
				let char = docSearchTermInput[i];
				let charIsQuote = /^[“"']/.test(char);

				//console.log(i + ") char=|"+char+"|, charIsQuote=" + charIsQuote + ", startQuote=" + startQuote);
				
				if (charIsQuote && !startQuote) {
					startQuote=true;
				}
				else if (charIsQuote && startQuote) {
					//found end of words in quotes
					startQuote=false;
					if (word !=""){
						docSearchPatterns.push(word);
					}
					word = "";
				}
				else if (char === " " && !startQuote) {
					//found end of word
					if (word !=""){
						docSearchPatterns.push(word);
					}
					word = "";
				}
				else if (i===docSearchTermInput.length-1){
					//reached end of input String
					if (!charIsQuote){
						word = word + char;
					}
					if (word !=""){
						docSearchPatterns.push(word);
					}
				}
				else if (!charIsQuote){
					word = word + char;
				}
			}
			
			console.log("   docSearchPatterns = " + JSON.stringify(docSearchPatterns));
			
			//.................................................
			// search document text fields for matches
			//.................................................				
			//loop through annotations and captions of each page
			for (let pgNum=0; pgNum<=docPages.length-1; pgNum++){
					
				let thisPageHasIt = false;
				
				//loop thru all the annotation paragraphs
				let thisAnnotation = docPages[pgNum]['description'];  //NOTE: thisAnnotation is an array of paragraph texts
				
				for (let paraNum=0; paraNum<=thisAnnotation.length-1; paraNum++){
					
					let thisTxt = thisAnnotation[paraNum].toString();
					thisPageHasIt = TextHasSearchTerm(thisTxt);
					
					if (thisPageHasIt){
						break; //out of (let paraNum) loop
					}						

				} //end of of (let paraNum) loop
				
				//check the caption
				if (!thisPageHasIt){
					thisTxt = docPages[pgNum]['caption'].toString();
					thisPageHasIt = TextHasSearchTerm(thisTxt);
				}

				
				//if found match, add this page to docSearchResultPages array
				if (thisPageHasIt){
					docSearchResultPages.push(pgNum);
					foundSomeMatches = true;
					//DEBUG ONLY 
					console.log("searchDocument, pgNum=" + pgNum +", thisPageHasIt=" + thisPageHasIt);
					//DEBUG ONLY END
				}

			} //end of pgNum loop
		
			//.........................................................
			// if matches were found then show qty & go to first page
			//.........................................................
			if (foundSomeMatches) {
				docPagesAreSearched=true;
				//DEBUG ONLY 
				console.log("searchDocument, docSearchResultPages.length=" + docSearchResultPages.length +", docSearchResultPages=" + JSON.stringify(docSearchResultPages));
				//DEBUG ONLY END
				
				document.getElementById("docSearchResultsQty").innerHTML='1/' + docSearchResultPages.length;
				docSearchResultCurrPg=0;
				loadDocPageNum(docSearchResultPages[0]);
			}
			// else reset to 0/0 and do not change pages
			else {
				document.getElementById("docSearchResultsQty").innerHTML='0/0';
				docSearchResultCurrPg=0;
			}
			
		} // end if (docSearchTermInput != null && docSearchTermInput!="")
			
	//==========================================================================================		
	} //END OF FUNCTION searchDocument
	//==========================================================================================

	function ZZZZsearchDocument(type){  //type can be 'exact' or 'fuzzy'
		
		//initialize variables
		let foundSomeMatches = false;
		
		//clear out any existing search 
		clearDocumentSearch();
		docSearchPatterns.length = 0;
		
		// load docSearchPatterns
		//.................................................
		docSearchTermInput = docPageSearchInput.value.toString().trim().toLowerCase();
		console.log("in searchDocument, rcd type=" + type + ", and docSearchTermInput=" + docSearchTermInput);
		if (docSearchTermInput != null && docSearchTermInput!=""){
			
			//keep anything between quotes as an individual item, otherwise split them up
			let startQuote = false;
			let word = "";
			for (let i=0;i<=docSearchTermInput.length-1;i++){
				let char = docSearchTermInput[i];
				let charIsQuote = /^[“"']/.test(char);

				//console.log(i + ") char=|"+char+"|, charIsQuote=" + charIsQuote + ", startQuote=" + startQuote);
				
				if (charIsQuote && !startQuote) {
					startQuote=true;
				}
				else if (charIsQuote && startQuote) {
					//found end of words in quotes
					startQuote=false;
					if (word !=""){
						docSearchPatterns.push(word);
					}
					word = "";
				}
				else if (char === " " && !startQuote) {
					//found end of word
					if (word !=""){
						docSearchPatterns.push(word);
					}
					word = "";
				}
				else if (i===docSearchTermInput.length-1){
					//reached end of input String
					if (!charIsQuote){
						word = word + char;
					}
					if (word !=""){
						docSearchPatterns.push(word);
					}
				}
				else if (!charIsQuote){
					word = word + char;
				}
			}
			console.log("   docSearchPatterns = " + JSON.stringify(docSearchPatterns));
			
			// add fuzzy search patterns 
			if (type==='fuzzy') {
				let startLen = docSearchPatterns.length;		
				
				for (let term=0; term<=startLen-1; term++){
					let thisTerm = docSearchPatterns[term];
					let newTerm="";
					let baseTerm="";
					let thisLen = thisTerm.length;
					//................................................................................
					// fuzzies for any length of term >=4 (one char differences)
					//................................................................................
					if (thisLen>=4){
						// one character changed
						for (let i=0;i<=thisLen-1;i++){
							newTerm= thisTerm.slice(0,i) + '[a-z]' + thisTerm.slice(i+1);
							docSearchPatterns.push(newTerm);
						}

						//one character missing in search
						newTerm = '[a-z]' + thisTerm.slice(0);
						docSearchPatterns.push(newTerm);
						for (let i=0;i<=thisLen-1;i++){
							newTerm= thisTerm.slice(0,i+1) + '[a-z]' + thisTerm.slice(i+1);
							docSearchPatterns.push(newTerm);
						}
						
						//one character missing in text
						for (let i=0;i<=thisLen-1;i++){
							newTerm= thisTerm.slice(0,i) + thisTerm.slice(i+1);
							docSearchPatterns.push(newTerm);
						}
						
						console.log("   added 1 char fuzzies = " + JSON.stringify(docSearchPatterns));
					}
					
					//................................................................................
					// fuzzies for terms longer than 10 characters, two characters changed, two chars missing
					//................................................................................		
					if (thisLen>=10){
						//two characters different 
						console.log("thisTerm="+thisTerm);
						console.log("    TWO CHARS DIFF");
						for (let i=0;i<=thisLen-1;i++){
							baseTerm= thisTerm.slice(0,i) + '[a-z]' + thisTerm.slice(i+1);
							console.log("   " + i + ") baseTerm="+baseTerm);
							for (let j=i+5;j<=baseTerm.length-1;j++){
								newTerm= baseTerm.slice(0,j) + '[a-z]' + baseTerm.slice(j+1);
								console.log("       " + j + ") newTerm=" + newTerm);
								docSearchPatterns.push(newTerm);
							}
						}
						//two characters missing in search
						console.log("    TWO CHARS MISSING IN SEARCH");
						for (let i=0;i<=thisLen-1;i++){
							if (i===0){
								baseTerm = '[a-z]' + thisTerm.slice(0);;
							}
							else {
								baseTerm= thisTerm.slice(0,i) + '[a-z]' + thisTerm.slice(i);
							}
							console.log("   " + i + ") baseTerm="+baseTerm);
							for (let j=i+5;j<=baseTerm.length-1;j++){
								newTerm= baseTerm.slice(0,j) + '[a-z]' + baseTerm.slice(j+1);
								console.log("       " + j + ") newTerm=" + newTerm);
								docSearchPatterns.push(newTerm);
							}
						}
						
						//two character missing in text
						console.log("    TWO CHARS MISSING IN TEXT");
						for (let i=0;i<=thisLen-1;i++){
							baseTerm= thisTerm.slice(0,i) + thisTerm.slice(i+1);
							console.log("   " + i + ") baseTerm="+baseTerm);
							for (let j=0;j<=baseTerm.length-1;j++){
								newTerm= baseTerm.slice(0,j) + baseTerm.slice(j+1);
								console.log("       " + j + ") newTerm="+newTerm);
								docSearchPatterns.push(newTerm);
							}
						}
						console.log("   added 2 char fuzzies = " + JSON.stringify(docSearchPatterns));	
					}

				
				//................................................................................
				// fuzzies for terms longer than 15 characters, 3 characters changed, 3 chars missing
				//................................................................................	
				// TO-DO!!!!
				
					
				}
				
			} // end of if (type==='fuzzy')
			

			
			//if we have docSearchPatterns, then find the pages that contain them
			//.....................................................................
			if (docSearchPatterns.length>0){
			
				//loop through annotations and captions of each page
				for (let pgNum=0; pgNum<=docPages.length-1; pgNum++){
					
					let thisPageHasIt = false;
					
					//loop thru all the annotation paragraphs
					let thisAnnotation = docPages[pgNum]['description'] ;  //NOTE: thisAnnotation is an array of paragraph texts
					for (let paraNum=0; paraNum<=thisAnnotation.length-1; paraNum++){
						
						let thisTxt = thisAnnotation[paraNum].toString();
						//console.log("pgNum=" + pgNum + ", paraNum=" + paraNum);
						//console.log("     thisTxt=" + thisTxt);
						
						for (let term=0; term<=docSearchPatterns.length-1; term++){
							//console.log("     docSearchPatterns[term]=|" + docSearchPatterns[term] + "|");
							if(thisTxt.toLowerCase().includes(docSearchPatterns[term])){
								thisPageHasIt=true;
								foundSomeMatches=true;
								//console.log("FOUND Match for |" + docSearchPatterns[term] +"| in pgNum="+pgNum+", paraNum="+paraNum);
							}
						}
					} //end of paraNum loop
					
					//check the caption
					thisTxt = docPages[pgNum]['caption'].toString();
					for (let term=0; term<=docSearchPatterns.length-1; term++){
						if(thisTxt.toLowerCase().includes(docSearchPatterns[term])){
							thisPageHasIt=true;
							foundSomeMatches=true;
						}
					}
					
					//if page contained the search term, then add it to the results array
					if (thisPageHasIt){
						docPagesAreSearched=true;
						docSearchResultPages.push(pgNum);
					}
					
				} //end of pgNum loop
			
			}
			
			// if matches were found then show qty & go to first page
			//.........................................................
			if (foundSomeMatches) {
				document.getElementById("docSearchResultsQty").innerHTML='1/' + docSearchResultPages.length;
				docSearchResultCurrPg=0;
				loadDocPageNum(docSearchResultPages[0]);
			}
			// else reset to 0/0 and do not change pages
			else {
				document.getElementById("docSearchResultsQty").innerHTML='0/0';
				docSearchResultCurrPg=0;
			}
			
		}  //end of if (searchTerm != null && searchTerm!="")
			
		
	}; //end of function searchDocument
	
	//==========================================================================================
	// navDocSearchResults
	//==========================================================================================	
	function navDocSearchResults(movement){
		//console.log("navDocSearchResults, docSearchResultCurrPg=" + docSearchResultCurrPg + ", rcd movement=" + movement );
		if (docPagesAreSearched) {
			if (movement === 'next'){
				docSearchResultCurrPg=docSearchResultCurrPg+1;
			}
			else if (movement === 'prev'){
				docSearchResultCurrPg=docSearchResultCurrPg-1;
			};
			
			if (docSearchResultCurrPg>docSearchResultPages.length-1){
				docSearchResultCurrPg=0;
			};
			
			if (docSearchResultCurrPg<0){
				docSearchResultCurrPg=docSearchResultPages.length-1;
			};
			
			//update results quantity curr page number and load the page
			document.getElementById("docSearchResultsQty").innerHTML= (docSearchResultCurrPg +1) + '/' + docSearchResultPages.length;
			docPgNum = docSearchResultPages[docSearchResultCurrPg];
			//console.log("    NOW docSearchResultCurrPg=" + docSearchResultCurrPg + " and docPgNum=" + docPgNum);
			loadDocPageNum(docPgNum);
		}
	}
	
	//==========================================================================================
	// loadDocPages
	//==========================================================================================
	async function loadDocPages(filePath, docTitle){
		//console.log("in loadDocPages, rcd filePath=|" + filePath + "|");
		subMenuName = '';
		subMenuCat = '';
		
		//set the subTitle
		let subTitle = document.getElementById("SubTitle");
		subTitle.innerHTML = docTitle;
		
		//set up submenu with document navigation controls
		let subMenu = document.getElementById("SubMenu");
		subMenu.style.display = "block";
		docNavBar.style.display = "block";
		schoolNavBar.style.display = "none"
		
		//hide the iFrame content
		let contentTitleBar = document.getElementById("ContentTitle");
		contentTitleBar.className = "titleBar3Empty";
		let iFrameHldr = document.getElementById("iFrameHolder");
		iFrameHldr.style.display = "none";
		
		//show the document content
		let documentContentHolder = document.getElementById("documentContentHolder");
		documentContentHolder.style.display = "block";

		//clean out old info
		document.getElementById("docAnnotation").innerHTML="";
		document.getElementById("figCaption").innerHTML="";
		document.getElementById("docPageImg").src="";
				
		//fetch the data about the document
		docPages.length = 0;	
		let myObject = await fetch(webRootLocation+filePath);
		let myText = await myObject.text();
		docPages = JSON.parse(myText);
		let totDocPgs = document.getElementById("totalDocPages");
		totalDocPages.innerHTML = " of " + docPages.length;
		
		//load the first page
		loadDocPageNum(0);
	};
	
	//==========================================================================================
	// loadDocPageNum
	//==========================================================================================	
	function loadDocPageNum(pgNum){
		//DEBUG ONLY 
		console.log("loadDocPageNum, rcd pgNum=" + pgNum + ", docPagesAreSearched=" + docPagesAreSearched);
		//DEBUG ONLY 
		
		let docImg = document.getElementById('docPageImg');
		docImg.src = webRootLocation + docPages[pgNum]['photoFilePath'].toString();
		
		//update image caption
		let figCapt = document.getElementById('figCaption');
		if (docPages[pgNum]['caption'].length>0) {
			figCapt.innerHTML = docPages[pgNum]['caption'];
		}
		else {
			figCapt.innerHTML = "";
		}
		
		//update the annotation page HTML
		let thisAnnotation = docPages[pgNum]['description'] ;  //NOTE: thisAnnotation is an array of paragraph texts
		let totalAnnotation = "";
		for (let paraNum=0; paraNum<=thisAnnotation.length-1; paraNum++){
			thisAnnotation[paraNum] = thisAnnotation[paraNum].toString().replace(/[\r\n]/g,"<br>");
			totalAnnotation = totalAnnotation + thisAnnotation[paraNum] + "<br><br>";
		}
		let docAnnot = document.getElementById("docAnnotation");
		docAnnot.innerHTML=totalAnnotation;
		
		//update the page number input box
		let pgNumInput = document.getElementById("docPageNumInput");
		pgNumInput.setAttribute("value",Number(pgNum)+1); //NOTE: pgNum is zero based, people like 1 based
		pgNumInput.dispatchEvent(new Event('input'));
		pgNumInput.value = Number(pgNum)+1;
		pgNumInput.focus();
		pgNumInput.dispatchEvent(new Event('input'));
		
		// if docPagesAreSearched then search and highlight all the instances
		if (docPagesAreSearched){	
			
			for (let term=0; term<=docSearchPatterns.length-1; term++){

				//build regex to search for
				//let re = new RegExp("(?<!mark\\>)" + docSearchPatterns[term],"gi"); // '(?<!mark\\>)' is negative lookahead assertion, shouldn't re-find words already marked
			
				//..................................
				//highlight instances in caption
				//..................................
				let text = figCapt.innerHTML;
				
				/*
				let result = text.match(re);  //returns array of all matching subtexts
				if (result !=null){
					for (let rslt=0;rslt<=result.length-1;rslt++){  //loop thru matching subtexts and highlight them
						text = text.replace(result[rslt],'<mark>' + result[rslt] + '</mark>');
					}
					figCapt.innerHTML = text;
					result.length = 0;
				}
				*/
				
				//DEBUG ONLY 
				//console.log("figCapt CALLING FindMatchSubStrings(" + text);
				//DEBUG ONLY END
				
				let matchSubStrings = FindMatchSubStrings(text);
				
						
				//..................................						
				//highlight instances in annotation
				//..................................
				text = docAnnot.innerHTML;
				//DEBUG ONLY 
				//console.log("docAnnot CALLING FindMatchSubStrings(" + text);
				//DEBUG ONLY END
				
				matchSubStrings = FindMatchSubStrings(text);	
				
				/*
				result = text.match(re);
				
				if (result !=null){

					for (let rslt=0;rslt<=result.length-1;rslt++){
						text = text.replace(result[rslt],'<mark>' + result[rslt] + '</mark>');
					
						//eliminate double flagging
						let re = new RegExp('&ltmark&gt&ltmark&gt',"gi");
					}
					
					docAnnot.innerHTML = text;
				}
				*/
				
			}
		}
	};
	
	//==========================================================================================
	// navDocPage
	//==========================================================================================	
	function navDocPage(movement){
		console.log("in navDocPage, rcd movement=" + movement );
		if (movement === 'first'){
			docPgNum=0;
		}
		else if (movement === 'last'){
			docPgNum=docPages.length-1;
		}
		else if (movement==="prev"){
			if (docPgNum===0){ //circle back to end
				docPgNum=docPages.length-1; 
			}
			else {
				docPgNum=docPgNum-1;
			}
		}
		else if (movement==="next"){
			if (docPgNum===docPages.length-1){ //circle back to start
				docPgNum=0; 
			}
			else {
				docPgNum=docPgNum+1;
			}		
		}
				
		//update the page number input box to account for limiting
		let pgNumInput = document.getElementById("docPageNumInput");
		pgNumInput.setAttribute("value",Number(docPgNum)+1); //NOTE: pgNum is zero based, people like 1 based
		pgNumInput.dispatchEvent(new Event('input'));
		pgNumInput.value = Number(docPgNum)+1;
		pgNumInput.focus();
		pgNumInput.dispatchEvent(new Event('input'));
		
		//load the requested page	
		//console.log("calling loadDocPage, sending docPgNum=" + docPgNum);
		loadDocPageNum(docPgNum);
	};
		
	//==========================================================================================
	// startup
	//==========================================================================================
	function startup(){
		//console.log("in startup");
		countySchoolDistricts.length =0;
		countyHighSchools.length = 0;
		usdSchools.length=0;
		initVars(); //load global variables
		buildMenus(); //build dropdowns based on contents of school arrays
		sizeBars(); //size and place the menu bars
		//console.log("countySchoolDistricts.length=" + countySchoolDistricts.length);
	};

	//==========================================================================================
	// buildMenus
	//==========================================================================================	
	function buildMenus(){
		//............................
		// County Districts
		//............................
		var dropDown = document.getElementById("CountyDistrictsDropdown");
		var dropDownContents = dropDown.innerHTML;
		var foundJoints = false;
		var foundAdjacents = false;

		for (var i = 0; i<=countySchoolDistricts.length-1;i++){

			if (countySchoolDistricts[i].category === "Joint" && !foundJoints) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a>";
				foundJoints = true;
			}
			
			if (countySchoolDistricts[i].category === "Adjacent" && !foundAdjacents) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="menuClick({category:'County Districts', subCat:'090', title:'90 Rock Brook'})">090 Rock Brook</a>
			dropDownContents = dropDownContents + String.fromCharCode(13) + "<a onclick=\"menuClick({category:'County Districts', subCat:'" + countySchoolDistricts[i].number 
			dropDownContents = dropDownContents + "', title:'" + countySchoolDistricts[i].title + "'})\">"+ countySchoolDistricts[i].title + "</a>";
				
		}
		dropDown.innerHTML = dropDownContents;
		
		//............................
		// County High Schools
		//............................
		dropDown = document.getElementById("CountyHighSchoolsDropdown");
		dropDownContents = dropDown.innerHTML;
		foundJoints = false;
		foundAdjacents = false;

		for (var i = 0; i<=countyHighSchools.length-1;i++){

			if (countyHighSchools[i].category === "Joint" && !foundJoints) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a>";
				foundJoints = true;
			}

			if (countyHighSchools[i].category === "Adjacent" && !foundAdjacents) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="menuClick({category:'High Schools',subCat:'RHS5', title:'RHS 5 Mayetta'})">RHS 5 Mayetta</a>
			dropDownContents = dropDownContents + String.fromCharCode(13) + "<a onclick=\"menuClick({category:'County High Schools', subCat:'" + countyHighSchools[i].number 
			dropDownContents = dropDownContents + "', title:'" + countyHighSchools[i].title + "'})\">"+ countyHighSchools[i].title + "</a>";
				
		}
		dropDown.innerHTML = dropDownContents;		
		
		//............................
		// USDs
		//............................
		dropDown = document.getElementById("UsdSchoolsDropdown");
		dropDownContents = dropDown.innerHTML;
		foundJoints = false;
		foundAdjacents = false;

		for (var i = 0; i<=usdSchools.length-1;i++){

			if (usdSchools[i].category === "Joint" && !foundJoints) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a>";
				foundJoints = true;
			}

			if (usdSchools[i].category === "Adjacent" && !foundAdjacents) {
				dropDownContents = dropDownContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="menuClick({category:'UnifiedSchoolDistricts',subCat:'USD337', title:'USD337 Royal Valley'})">USD337 Royal Valley</a>
			dropDownContents = dropDownContents + String.fromCharCode(13) + "<a onclick=\"menuClick({category:'Unified School Districts', subCat:'" + usdSchools[i].number 
			dropDownContents = dropDownContents + "', title:'" + usdSchools[i].title + "'})\">"+ usdSchools[i].title + "</a>";
				
		}
		dropDown.innerHTML = dropDownContents;	
		
		//............................		
		// Maps
		//............................
		dropDown = document.getElementById("MapsDropdown");
		dropDownContents = dropDown.innerHTML;

		for (var i = 0; i<=maps.length-1;i++){
			// Example:
			//<a onclick="menuClick({category:'Maps',subCat:'1878 Jackson Co.'})">1878 Jackson Co.</a>
			dropDownContents = dropDownContents + String.fromCharCode(13) + "<a onclick=\"menuClick({category:'Maps', subCat:'" + maps[i].number 
			dropDownContents = dropDownContents + "', title:'" + maps[i].title + "'})\">"+ maps[i].title + "</a>";
				
		}
		dropDown.innerHTML = dropDownContents;	
	};
	
	//==========================================================================================
	// sizeBars
	//==========================================================================================
	function sizeBars(){
	  // CALCULATE HEIGHT OF MAIN TITLE
	  var titleBar = document.getElementById("TitleBar");
	  topTitleHeight = titleBar.offsetHeight;
	  
	  // LOCATE TOP OF MAIN MENU BAR AND CALCULATE ITS HEIGHT
	  var menuBar = document.getElementById("MainMenu");
	  menuBar.style.top=topTitleHeight + "px";
	  topMenuHeight = menuBar.offsetHeight;
	  
	  // LOCATE TOP OF SUB TITLE AND CALCULATE ITS HEIGHT
	  var subTitle = document.getElementById("SubTitle");
	  subTitle.style.top= (topTitleHeight + topMenuHeight) + 'px';
	  subTitleHeight = subTitle.offsetHeight;
	  
	  // LOCATE TOP OF SUB MENU AND CALCULATE ITS HEIGHT
	  var subMenu = document.getElementById("SubMenu");
	  subMenu.style.top = (topTitleHeight + topMenuHeight + subTitleHeight) + 'px';
	  subMenuHeight = subMenu.offsetHeight;
	  
	  // LOCATE CONTENT TITLE BAR AND CALCULATE ITS HEIGHT
	  var contentTitle = document.getElementById("ContentTitle");
	  contentTitle.style.top = (topTitleHeight + topMenuHeight + subTitleHeight + subMenuHeight) + 'px';
	  contentTitleHeight = contentTitle.offsetHeight;
	  
	  // SIZE THE SPACER ELEMENT 
	  var spacer = document.getElementById("Spacer");
	  spacer.style.height = (topTitleHeight + topMenuHeight + subTitleHeight + subMenuHeight + contentTitleHeight) + 'px';
	  
	  //console.log("topTitleHeight="+topTitleHeight+", topMenuHeight="+topMenuHeight+", subTitleHeight="+subTitleHeight+", subMenuHeight=" + subMenuHeight+", contentTitleHeight=" + contentTitleHeight);
	};
	
	//==========================================================================================
	// menuClick
	//==========================================================================================
	function menuClick(params) {
		var category = params.category;
		var subCat = params.subCat;
		var title=``;
		if (params.title) {
			title = params.title;
		}
		console.log("menuClick: category=" + category + ", subCat=" + subCat);
		var contentSource = '';
		var subTitle = document.getElementById("SubTitle");
		var subMenu = document.getElementById("SubMenu");
		var contentHolder = document.getElementById("ContentHolder");
		var contentTitleBar = document.getElementById("ContentTitle");
		let iFrameHldr = document.getElementById("iFrameHolder");
		let documentContentHolder = document.getElementById("documentContentHolder");
		let docAnnot = document.getElementById("docAnnotation");
		let docFigCapt = document.getElementById("figCaption");
		let docNavBar = document.getElementById("docNavBar");
		let schoolNavBar = document.getElementById("schoolNavBar");
		let docPgImg = document.getElementById("docPageImg");
			
		subMenuName = '';
		subMenuCat = '';
		
		// SWITCH ON CATEGORY
		switch(category){
			
		  //---------------------------
		  case 'Test':
		  //---------------------------	
			subMenuName = '';
			subMenuCat = '';
			
			//set the subTitle
			subTitle.innerHTML = "Test";
			
			//set up submenu with document navigation controls
			subMenu.style.display = "block";
			docNavBar.style.display = "block";
			schoolNavBar.style.display = "none"
			
			//hide the iFrame content
			contentTitleBar.className = "titleBar3Empty";
			iFrameHldr.style.display = "none";
			
			//hide the document content
			documentContentHolder.style.display = "block";
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			
			//load the document pages
			loadDocPages("Test/Test_Files/AnnotatedPhotos_LloydCopeland.json");
			break;
			
		  //---------------------------
		  case 'Home':
		  //---------------------------		  
			subMenuName = '';
			subMenuCat = '';
			contentSource="Welcome/Welcome.html"
			subTitle.innerHTML = "Welcome";
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			contentTitleBar.className = "titleBar3Empty";
			break;

		  //---------------------------
		  case 'Overview':
		  //---------------------------		
			subMenuName = '';
			subMenuCat = '';		  
			subTitle.innerHTML = "Overview";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			contentTitleBar.className = "titleBar3";
			iFrameHldr.style.display = "block";
			
			if (subCat==='Overview'){
				contentSource="Overview/CountyOverview.html";
				contentTitleBar.innerHTML="County Overview";
			}
			if (subCat==='CoDistrictSumm'){
				contentSource="Overview/CountyDistrictsSummary.html";
				contentTitleBar.innerHTML="County Districts Summary";
			}
			if (subCat==='CoHSSumm'){
				contentSource="Overview/CountyHighSchoolSummary.html";
				contentTitleBar.innerHTML="County High School Summary";
			}
			if (subCat==='TeachersInst'){
				contentSource="Overview/TeachersInstitute.html";
				contentTitleBar.innerHTML="County Teachers Institute";
			}
			if (subCat==='DeedsLists'){
				contentSource="Overview/RegisterOfDeedLists.html";
				contentTitleBar.innerHTML="County Register of Deeds List";
			}
			if (subCat==='TreasurerAndTaxRpts'){
				contentSource="Overview/CountyTreasurerAndTaxReports.html";
				contentTitleBar.innerHTML="County Treasurer and Tax Reports";
			}
			if (subCat==='GradRpts'){
				contentSource="Overview/CommonSchoolGraduateReports.html";
				contentTitleBar.innerHTML="County Common School Graduate Reports";
			}
			if (subCat==='TeachersRpts'){
				contentSource="Overview/TeachersReports.html";
				contentTitleBar.innerHTML="County Teachers Reports";
			}
			if (subCat==='OtherRpts'){
				contentSource="Overview/OtherReports.html";
				contentTitleBar.innerHTML="Other County Reports";
			}					
			break;
			
		  //---------------------------
		  case 'Maps':
		  //---------------------------
			subMenuName = '';
			subMenuCat = '';
			subTitle.innerHTML = "Maps";
			contentTitleBar.className = "titleBar3";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			
			if (subCat==='1878 Jackson Co.'){
				contentSource="Maps/1878_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1878";
			}
			else if (subCat==='1881 Jackson Co.'){
				contentSource="Maps/1881_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1881";
			}
			else if (subCat==='1883 Jackson Co.'){
				contentSource="Maps/1883_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1883";
			}
			else if (subCat==='1885 Holton'){
				contentSource="Maps/1885_Holton.html";
				contentTitleBar.innerHTML="Holton 1885";
			}			
			else if (subCat==='1887 Jackson Co.'){
				contentSource="Maps/1887_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1887";
			}
			else if (subCat==='1887 Brown Co.'){
				contentSource="Maps/1887_BrownCo.html";
				contentTitleBar.innerHTML="Brown County 1887";
			}
			else if (subCat==='1887 Nemaha Co.'){
				contentSource="Maps/1887_NemahaCo.html";
				contentTitleBar.innerHTML="Nemaha County 1887";
			}
			else if (subCat==='1889 Holton'){
				contentSource="Maps/1889_Holton.html";
				contentTitleBar.innerHTML="Holton 1889";
			}
			else if (subCat==='1896 Holton'){
				contentSource="Maps/1896_Holton.html";
				contentTitleBar.innerHTML="Holton 1896";
			}						
			else if (subCat==='1899 Pottawatamie Co.'){
				contentSource="Maps/1899_PottawatomieCo.html";
				contentTitleBar.innerHTML="Pottawatomie County 1899";
			}				
			else if (subCat==='1903 Jackson Co.'){
				contentSource="Maps/1903_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1903";
			}			
			else if (subCat==='1905 Holton'){
				contentSource="Maps/1905_Holton.html";
				contentTitleBar.innerHTML="Holton 1905";
			}				
			else if (subCat==='1908 Nemaha Co.'){
				contentSource="Maps/1908_NemahaCo.html";
				contentTitleBar.innerHTML="Nemaha County 1908";
			}		
			else if (subCat==='1911 Holton'){
				contentSource="Maps/1911_Holton.html";
				contentTitleBar.innerHTML="Holton 1911";
			}
			else if (subCat==='1912 Jackson Co. School Dist.'){
				contentSource="Maps/1912_JacksonCoSchoolDistricts.html";
				contentTitleBar.innerHTML="Jackson County School Districts 1912";
			}
			else if (subCat==='1918 Pottawatamie Reservation'){
				contentSource="Maps/1918_PottawatomieReservation.html";
				contentTitleBar.innerHTML="Pottawatomie Reservation 1918";
			}
			else if (subCat==='1919 Brown Co.'){
				contentSource="Maps/1919_BrownCo.html";
				contentTitleBar.innerHTML="Brown County 1919";
			}
			else if (subCat==='1921 Jackson Co.'){
				contentSource="Maps/1921_JacksonCo.html";
				contentTitleBar.innerHTML="Jackson County 1921";
			}	
			else if (subCat==='1922 Holton'){
				contentSource="Maps/1922_Holton.html";
				contentTitleBar.innerHTML="Holton 1922";
			}	
			else if (subCat==='1938 Jackson Co. Schl Dir'){
				contentSource="Maps/1938_JacksonCoSchlDir.html";
				contentTitleBar.innerHTML="Jackson County School Directory 1938";
			}	
			else if (subCat==='1963 Jackson Co. Rural Dir'){
				contentSource="Maps/1963_JacksonCoRuralDir.html";
				contentTitleBar.innerHTML="Jackson County Rural Directory 1963";
			}			
			else {
				console.log("NO MENU MATCH FOR " + subCat);
			}
			break;

		  //---------------------------		  
		  case 'Pre-Org':
		  //---------------------------	
			subMenuName = '';
			subMenuCat = '';		  
			subTitle.innerHTML = "Territorial Kansas";
			contentTitleBar.className = "titleBar3Empty";
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			
			if (subCat==='Frontier'){
				contentSource="Pre-Org/Frontier.html";
			}
			if (subCat==='Territorial'){
				contentSource="Pre-Org/Territorial.html";
			}
			break;

			//---------------------------	
			// SCHOOLS		  
			case 'County Districts':
			case 'County High Schools':
			case 'Colleges':
			case 'Unified School Districts':
			//---------------------------	
				// LOAD SUB TITLE
				let catFolderName = category.replace(/\s/g,"");
				var subTitleHTML = catFolderName + title;
				subTitle.innerHTML = subTitleHTML;
				iFrameHldr.style.display = "block";
				documentContentHolder.display = "none";
				subMenu.style.display = "block";
				docNavBar.style.display = "none";
				schoolNavBar.style.display = "block"
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';

				// LOAD SUBMENU click parameters
				subMenuName = catFolderName;
				subMenuCat = subCat;

				contentSource= catFolderName + "/" + subCat + "/" + subCat + "_Overview.html";
				contentTitleBar.className = "titleBar3";
				contentTitleBar.innerHTML="Overview";
			break;
			
		  //---------------------------		
		  case 'Pottawatomie Mission':
		  //---------------------------		
			subTitle.innerHTML = "Pottawatomie Mission";
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "block"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			
			// LOAD SUBMENU click parameters
			subMenuName = "PottawatomieMission";
			subMenuCat = "";
	
			contentTitleBar.className = "titleBar3";
			contentTitleBar.innerHTML="Overview";
			contentSource="PottawatomieMission/PottawatomieMission_Overview.html";
			break;

		  //---------------------------				
		  case 'High Schools':
		  //---------------------------	
			// LOAD SUB TITLE
			var subTitleHTML = "County High Schools - " + title;
			subTitle.innerHTML = subTitleHTML;
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "block"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
						
						
			// LOAD SUBMENU click parameters
			subMenuName = "CountyHighSchools";
			subMenuCat = subCat;
			
	
			contentSource="CountyHighSchools/" + subCat + "/" + subCat + "_Overview.html";
			contentTitleBar.className = "titleBar3";
			contentTitleBar.innerHTML="Overview";			
			break;

		  //---------------------------				
		  case 'USD':
		  //---------------------------	

			// LOAD SUB TITLE
			var subTitleHTML = title;
			subTitle.innerHTML = subTitleHTML;
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "block"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
									
			// LOAD SUBMENU click parameters
			subMenuName = "UnifiedSchoolDistricts";
			subMenuCat = subCat;

			contentSource="UnifiedSchoolDistricts/" + subCat + "/" + subCat + "_Overview.html";
			contentTitleBar.className = "titleBar3";
			contentTitleBar.innerHTML="Overview";	
			break;	  

		  //---------------------------	
		  case 'Colleges':
		  //---------------------------	
			// LOAD SUB TITLE
			var subTitleHTML = title;	
			subTitle.innerHTML = subTitleHTML;
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "block"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';

			// LOAD SUBMENU click parameters
			subMenuName = "Colleges";
			subMenuCat = subCat;

			contentSource="Colleges/" + subCat + "/" + subCat + "_Overview.html";
			contentTitleBar.className = "titleBar3";
			contentTitleBar.innerHTML="Overview";
			break;

		  //---------------------------	
		  case 'References':
		  //---------------------------		
			subMenuName = "";
			subMenuCat = "";		  
			subTitle.innerHTML = "References";	
			contentTitleBar.className = "titleBar3Empty";
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			contentSource="References/References.html";
			break;
			
		  //---------------------------	
		  case 'SourceMatl':
		  //---------------------------			  
			subMenuName = "";
			subMenuCat = "";
			subTitle.innerHTML = "Source Materials";	
			contentTitleBar.className = "titleBar3Empty";
			iFrameHldr.style.display = "block";
			documentContentHolder.display = "none";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			contentSource="SourceMatls/SourceMatls.html";
			break;

		  //---------------------------	
		  case 'Contact':
		  //---------------------------	
			subMenuName = "";
			subMenuCat = "";		  
			subTitle.innerHTML = "Contact";	
			contentTitleBar.className = "titleBar3Empty";
			subMenu.style.display = "block";
			docNavBar.style.display = "none";
			schoolNavBar.style.display = "none"
			iFrameHldr.style.display = "block";
			contentSource="Contact/Contact.html";
			documentContentHolder.display = "none";
			docAnnot.innerHTML="";
			docFigCapt.innerHTML="";
			docPgImg.src='';
			break;

		} 
	
		// CHANGE THE SOURCE FOR THE iFrame
		contentHolder.src =contentSource;
		window.top.scrollTo(0,0);
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
		
	};
	
	//==========================================================================================
	// schoolSubMenuClick
	//==========================================================================================
	function schoolSubMenuClick(category) {
		console.log("schoolSubMenuClick: subMenuName=" + subMenuName + ", category=" + category + ", subCat=" + subMenuCat);
		var contentTitleBar = document.getElementById("ContentTitle");
		var contentHolder = document.getElementById("ContentHolder");

		// change the content title bar
		contentTitleBar.innerHTML=category;

		// change the source for the  iFrame
		contentHolder.src =subMenuName + "/" + subMenuCat + "/" + subMenuCat + "_" + category + ".html";;
		
		// adjust locations of bars
		sizeBars()
		
	}; // end of function subMenuClick 
	
	//==========================================================================================
	// FindMatchSubStrings
	//==========================================================================================	
	function FindMatchSubStrings(textIn){
		//==========================================================================================
		//find unique substrings within textIn that match items in array docSearchPatterns 
		//		with precision docSearchPrecision
		//==========================================================================================
		//DEBUG ONLY
		if (textIn.includes('Cedar') || textIn.includes('cedar')){
			console.log("------------------------------------------");
			console.log("in FindMatchSubStrings.");
			//console.log("  Rcd textIn             =" + textIn);
			console.log("  Rcd docSearchPatterns  =" + JSON.stringify(docSearchPatterns));
			console.log("  Rcd docSearchPrecision =" + docSearchPrecision);
		}
		//DEBUG ONLY END
		
		let grossMatches= [];

		for (let termNum=0; termNum<=docSearchPatterns.length-1; termNum++){
			let thisTerm = docSearchPatterns[termNum];
			if (docSearchPrecision>=1){
				let re=new RegExp(thisTerm,"gi");
				let result = textIn.match(re);  //returns array of all matching subtexts
				if (result !=null){
					grossMatches = grossMatches.concat(result);
					//DEBUG ONLY
					console.log("    thisTerm=|" + thisTerm+ "| result =" + JSON.stringify(result) + "| grossMatches =" + JSON.stringify(grossMatches));
					//DEBUG ONLY END
				}
			}
			else {	
				//check substrings with lengths between docSearchPrecision*thisTerm.length and 1.precisionRequired*thisTerm.length (e.g. between 0.75 and 1.25)
				let thisStartLen = Math.floor(thisTerm.length*docSearchPrecision);
				let thisEndLen = Math.ceil(thisTerm.length*(1+(1-docSearchPrecision)));
				for (let len=thisStartLen; len<=thisEndLen; len++){
					for (let startPos=0;startPos<=textIn.length-1-len;startPos++){
						let subStr = textIn.substring(i,i+len-1);
						let wt = JaroWinklerDistance(thisTerm,subStr);
						//DEBUG ONLY
						if (textIn.includes('Cedar') || textIn.includes('cedar')){
							console.log("    substring= |" + subStr + "|, weight   =  " + wt + ", grossMatches =" + JSON.stringify(grossMatches));
						}
						//DEBUG ONLY END
						if (wt>=docSearchPrecision){
							grossMatches.push(subStr);
						}
					} //end of (let startPos) loop

					
				} //end of (let len) loop

			} //end of else docSearchPrecision<1
		} //end of (let termNum)
		console.log("grossMatches = " + JSON.stringify(grossMatches));
	}
			
	//==========================================================================================
	// TextHasSearchTerm
	//==========================================================================================	
	function TextHasSearchTerm(textIn) {
		//==========================================================================================
		// Returns true if any term in array docSearchPatterns matches any part of 
		//		textIn with precisionRqd
		//==========================================================================================
		
		//DEBUG ONLY
		if (textIn.includes('Cedar') || textIn.includes('cedar')){
			console.log("------------------------------------------");
			console.log("in TextHasSearchTerm.");
			//console.log("  Rcd textIn=             " + textIn);
			console.log("  Rcd docSearchPatterns=  " + JSON.stringify(docSearchPatterns));
			console.log("  Rcd docSearchPrecision= " + docSearchPrecision);
		}
		//DEBUG ONLY END
		
		let thisPageHasIt=false;
		for (let termNum=0; termNum<=docSearchPatterns.length-1; termNum++){
			let thisTerm = docSearchPatterns[termNum];
			
			if (docSearchPrecision>=1){
				let re=new RegExp(thisTerm,"gi");
				let result = textIn.match(re);  //returns array of all matching subtexts
				//DEBUG ONLY
				if (textIn.includes('Cedar') || textIn.includes('cedar')){
					console.log("    re   =  " + re + ", result=" + JSON.stringify(result));
				}
				//DEBUG ONLY END
				if (result !=null){
					thisPageHasIt=true;
					break; //out of (let termNum) loop
				}
			}
			else {
				//check substrings with lengths between docSearchPrecision*thisTerm.length and 1.precisionRequired*thisTerm.length (e.g. between 0.75 and 1.25)
				let thisStartLen = Math.floor(thisTerm.length*docSearchPrecision);
				let thisEndLen = Math.ceil(thisTerm.length*(1+(1-docSearchPrecision)));
				for (let len=thisStartLen; len<=thisEndLen; len++){
					//DEBUG ONLY
					if (textIn.includes('Cedar') || textIn.includes('cedar')){
						console.log("thisTerm.length = " + thisTerm.length + "thisStartLen = " + thisStartLen + " for thisEndLen = " + thisEndLen);
					}
					//DEBUG ONLY END					
					for (let startPos=0;startPos<=textIn.length-1-len;startPos++){
						
						let wt = JaroWinklerDistance(thisTerm,textIn.substring(startPos,startPos+len-1));
						
						//DEBUG ONLY
						if (textIn.includes('Cedar') || textIn.includes('cedar')){
							console.log("    weight = " + wt + " for substring=|" + textIn.substring(startPos,startPos+len-1) + "|");
						}
						//DEBUG ONLY END

						if (wt>=docSearchPrecision){
							thisPageHasIt=true;
							break; //out of (let startPos) loop
						}
					} //end of (let startPos) loop
					
					if (thisPageHasIt){
						break; //out of (let len) loop
					}
					
				} //end of (let len) loop
				
				if (thisPageHasIt){
					break; //out of (let termNum) loop
				}
			} //end of else docSearchPrecision<1
			
		} //end of (let termNum) loop		
		
		//DEBUG ONLY
		if (textIn.includes('Cedar') || textIn.includes('cedar')){
			console.log("  thisPageHasIt=          " + thisPageHasIt);
		}
		//DEBUG ONLY END
		
		return(thisPageHasIt);
		
	}
	
	//==========================================================================================
	// JaroWinklerDistance
	//==========================================================================================
	JaroWinklerDistance  = function (s1, s2) {
		//==========================================================================================
		// for fuzzy searches, returns 'weight' where 0 = no match, 1=perfect match
		//		s1='martha', s2='marhta' --> weight = 0.96
		//==========================================================================================
		// REFS: 
		//	1) https://sumn2u.medium.com/string-similarity-comparision-in-js-with-examples-4bae35f13968
		//
		//==========================================================================================
        var m = 0;

        // Exit early if either are empty.
        if ( s1.length === 0 || s2.length === 0 ) {
            return 0;
        }

        // Exit early if they're an exact match.
        if ( s1 === s2 ) {
            return 1;
        }

        var range     = (Math.floor(Math.max(s1.length, s2.length) / 2)) - 1,
            s1Matches = new Array(s1.length),
            s2Matches = new Array(s2.length);

        for ( i = 0; i < s1.length; i++ ) {
            var low  = (i >= range) ? i - range : 0,
                high = (i + range <= s2.length) ? (i + range) : (s2.length - 1);

            for ( j = low; j <= high; j++ ) {
            if ( s1Matches[i] !== true && s2Matches[j] !== true && s1[i] === s2[j] ) {
                ++m;
                s1Matches[i] = s2Matches[j] = true;
                break;
            }
            }
        }

        // Exit early if no matches were found.
        if ( m === 0 ) {
            return 0;
        }

        // Count the transpositions.
        var k = n_trans = 0;

        for ( i = 0; i < s1.length; i++ ) {
            if ( s1Matches[i] === true ) {
            for ( j = k; j < s2.length; j++ ) {
                if ( s2Matches[j] === true ) {
                k = j + 1;
                break;
                }
            }

            if ( s1[i] !== s2[j] ) {
                ++n_trans;
            }
            }
        }

        var weight = (m / s1.length + m / s2.length + (m - (n_trans / 2)) / m) / 3,
            l      = 0,
            p      = 0.1;

        if ( weight > 0.7 ) {
            while ( s1[l] === s2[l] && l < 4 ) {
            ++l;
            }

            weight = weight + l * p * (1 - weight);
        }

        return weight;
    };

	
	
	//======================================================================================================================================================================================
	// CLASSES
	//======================================================================================================================================================================================
	//---------------------------
	// PageObject
	//---------------------------	
	class PageObject{
		number;
		title;
		path;
		category;
	};
	
	//---------------------------
	// AnnotatedPhotoObject
	//---------------------------	
	class AnnotatedPhotoObject{
		photoFilePath;
		caption;
		annotation;
	};
	
	
