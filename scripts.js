
	
	//==========================================================================================
	// GLOBAL VARIABLES
	//==========================================================================================
	var topTitleHeight = 46;
	var topMenuHeight=51;
	var subTitleHeight=46;
	var subMenuHeight=51;	
	var contentTitleHeight=46;
	var webRootLocation = "https://bryan-1963.github.io/JacksonCounty_KS_SchoolHistory/";
	var subMenuName = '';
	var subMenuCat = '';
	var webStack = []; //stack of pages loaded so can navigate back and forth
	var webStackIndex = 0;

	// pageObject arrays
	var maps = []; //array of PageObjects for maps
	var countySchoolDistricts = []; //array of PageObjects for elementary schools
	var countyHighSchools = []; //array of PageObjects for high schools
	var usdSchools = []; //array of PageObjects for USDs
	var pottawatomieMissionSchool = {};
	var colleges = [];
	var overviews = [];
	
	//siteSearch variables
	var siteSearchInput = document.getElementById("siteSearchInput");
	var siteSearchPrecision = 1.00;
	var searchFiles = []; //array of PageObjects for searching the site
	var siteSearchResults = []; //matches
	var siteSearchTermInput; //user input tot he site search
	
	//variables for displaying documents
	var docPages = []; //array of AnnotatedPhotoObject, loaded by loadDocPages
	var docSearchPrecision = 1.00;
	var docPagesAreSearched = false;
	var docSearchResultPages = []; //array of page numbers containing the searched for text
	var docSearchResultCurrPg = 0;
	var docSearchPatterns = []; //array of regex patterns to search for
	var docSearchTerm = "";
	var docDisplayMode='display'; //'display'=show from file, 'edit'=edit enabled
	var docPgNum = 0;
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
				searchDocument(1.00);
			}
		}
	});	
	
	//-----------------------------------------
	// Site search input listener 
	//-----------------------------------------
	siteSearchInput.addEventListener("keydown", function (e) {
		if (e.code === "Enter" || e.code === "NumpadEnter") //checks whether the pressed key is "Enter"
		{  
			let searchTerm = siteSearchInput.value;
			if (searchTerm != null && searchTerm!=""){
				searchSite(1.00);
			}
		}
	});	
	
	//-----------------------------------------
	// subPage load listener
	//-----------------------------------------
	var myIframe = document.getElementById('ContentHolder');
	myIframe.addEventListener("load", function() {
		console.log("iFrame loaded");

		if (webStack.length===0){
			//initialize the web page stack
			let thisPage = new PageObject();
			thisPage.number="";
			thisPage.title="Welcome";
			thisPage.path="Welcome/Welcome.html";
			thisPage.category="Welcome";
			let thisStackEl = new PageStack();
			thisStackEl.pageParam = JSON.parse(JSON.stringify(thisPage));
			thisStackEl.siteSrchTrmInpt="";
			thisStackEl.siteSearchRslts=[];
			thisStackEl.docPagesRSrchd=false;
			thisStackEl.docSrchTrm="";
			thisStackEl.docSrchRsltPgs=[];
			console.log(JSON.stringify(thisStackEl));
			console.log(JSON.stringify(thisStackEl['pageParam']));
			addToWebStack(thisStackEl);  
			console.log("webStack.length="+webStack.length);
		}
	  
		highlightSearchResultsInSubPage(); //highlight any search results on the page that was loaded
	  
	});
	
	
	//=======================================================================================================================================================
	// FUNCTIONS
	//=======================================================================================================================================================
		
	//==========================================================================================
	// startup
	//==========================================================================================
	function startup(){
		countySchoolDistricts.length =0;
		countyHighSchools.length = 0;
		usdSchools.length=0;
		initVars(); //load global variables
		sizeBars(); //size and place the menu bars
	
		if (webStack.length===0){
			//initialize the web page stack
			let thisPage = new PageObject();
			thisPage.number="";
			thisPage.title="Welcome";
			thisPage.path="Welcome/Welcome.html";
			thisPage.category="Welcome";
			let thisStackEl = new PageStack();
			thisStackEl.pageParam = JSON.parse(JSON.stringify(thisPage));
			thisStackEl.siteSrchTrmInpt="";
			thisStackEl.siteSearchRslts=[];
			thisStackEl.docPagesRSrchd=false;
			thisStackEl.docSrchTrm="";
			thisStackEl.docSrchRsltPgs=[];
			console.log(JSON.stringify(thisStackEl));
			console.log(JSON.stringify(thisStackEl['pageParam']));
			addToWebStack(thisStackEl);  
			console.log("webStack.length="+webStack.length);
		}	

		console.log("startup complete");
	};
	
	//==========================================================================================
	// toggleDocDisplayMode
	//==========================================================================================
	//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
	/*
	function toggleDocDisplayMode(){
		if (docDisplayMode==='display'){
			toggleRslt = setDocDisplayMode('edit');
		}
		else {
			setDocDisplayMode('display');
		}
	}
	*/
	
	//==========================================================================================
	// setDocDisplayMode
	//==========================================================================================
	//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
	/*	
	function setDocDisplayMode(mode){
		// returns 'success' or 'cancel'
		
		let result = "";
		
		if (mode==='display') {

			//if went from edit to display, see if there are any edits made
			if (currDocPageEdited()){
				//see if user wants to cancel and save the changes
				if (confirm("Edits have been made. They will be lost if you proceed without saving first. Proceed?")){
					docDisplayMode='display'
					document.getElementById('docAnnotation').style.display = 'block';
					document.getElementById('docAnnotationEdited').style.display = 'none';
					document.getElementById('figCaption').style.display = 'block';
					document.getElementById('figCaptionEditor').style.display = 'none';		
				result='success';
				}
				else {
					result='cancel';
				}
			}
			else {
				docDisplayMode='display'
				document.getElementById('docAnnotation').style.display = 'block';
				document.getElementById('docAnnotationEdited').style.display = 'none';
				document.getElementById('figCaption').style.display = 'block';
				document.getElementById('figCaptionEditor').style.display = 'none';		
				result='success';
			}
	
		}
		else if (mode==='edit'){
			docDisplayMode='edit'
			document.getElementById('docAnnotation').style.display = 'none';
			document.getElementById('docAnnotationEdited').style.display = 'block';
			document.getElementById('figCaption').style.display = 'none';
			document.getElementById('figCaptionEditor').style.display = 'block';
			result='success';
		}
		return result;
	}
	*/
	
	//==========================================================================================
	// currDocPageEdited
	//==========================================================================================
	//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
	/*
	function currDocPageEdited(){
		
		// docPages[docPgNum]!=current values then it is edited
		let result=false;
		
		// get the caption and compare
		let newCaption=document.getElementById('figCaptionEdited').value;
		if (newCaption != docPages[docPgNum]['caption']){
			console.log("return true, caption has been edited");
			result=true;
			return true;
		}
		
		//get paragraphs from annotation and compare
		let newAnnotation = getEditedDocAnnotationParas();
		
		console.log("newParas=" + JSON.stringify(newParas));
		
		let storedParas=docPages[pgNum]['description'];
		
		console.log("storedParas=" + JSON.stringify(storedParas));
		
		for (let paraNum=0; paraNum<=storedParas.length-1; paraNum++){
			
			if (storedParas[paraNum].toString().trim() != newParas[paraNum].toString().trim()){
				result=true;
				console.log("return true, annotation has been edited");
				return true;
				break;
			}
		} //end of of (let paraNum) loop
		console.log("return false, no edits made");
		return false;
	}
	*/
	
	//==========================================================================================
	// getEditedDocAnnotationParas
	//==========================================================================================
	//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
	/*
	function getEditedDocAnnotationParas(){
		let newAnnotation = document.getElementById('docAnnotationEdited').value;
		let newPieces = newAnnotation.split("\n\r");
		let newParas = [];
		for (let i=0;i<=newPieces.length-1;i++){
			if (newPieces[i] != ''){
				newParas.push(newPieces[i]);
			}
		}
		return newParas;
	}
	*/
	
	//==========================================================================================
	// saveDocDisplayEdits
	//==========================================================================================
	//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
	/*
	async function saveDocDisplayEdits(){
		if (!currDocPageEdited()){
			alert("No changes have been made.");
		}
		else {
			if (confirm("Save your edits?")){
				
				//build newDocPage
				let newCaption=document.getElementById('figCaptionEdited').value;
				let newAnnotation = getEditedDocAnnotationParas();
				let isObject = {photoFilePath: docPages[pgNum]['photoFilePath'], caption: newCaption, description: newAnnotation};

				//store record of changes made in file "OnlineEditHistory.json"
				let chgRecord = {type:'document edit', timeStamp: Date.now(), wasObject:docPages[pgNum], isObject: newDocPage}
				
				//update docPages
				docPages[pgNum] = JSON.parse(JSON.stringify(isObject));
				
				//store updated docPages
				TO-DO!!!
				
			}
		}
	}
	*/

	//==========================================================================================
	// navStack
	//==========================================================================================	
	function navStack(dir){
		var subTitle = document.getElementById("SubTitle");
		var contentHolder = document.getElementById("ContentHolder");
		
		//...........................
		//adjust webStackIndex
		//...........................
		if (dir==='next'){
			webStackIndex=webStackIndex+1;
		}
		if (dir==='prev'){
			webStackIndex=webStackIndex-1;
		}
		if (webStackIndex>webStack.length-1){
			webStackIndex = webStack.length-1;
		}
		if (webStackIndex<0){
			webStackIndex = 0;
		}
		//console.log(JSON.stringify(webStack));
		//console.log(webStackIndex, webStack.length, JSON.stringify(webStack[webStackIndex]));
		console.log(webStack[webStackIndex].pageParam.category);
		
		//......................................
		// set search variables
		//......................................
		siteSearchInput = (' ' + webStack[webStackIndex].siteSrchTrmInpt).slice(1);
		siteSearchResults = JSON.parse(JSON.stringify(webStack[webStackIndex].siteSearchRslts));
		if(siteSearchInput===undefined || siteSearchInput==='undefined'){
			siteSearchInput="";
		}
		document.getElementById("siteSearchInput").value=siteSearchInput;
		
		docPagesAreSearched = webStack[webStackIndex].docPagesRSrchd;
		docSearchTerm = (' ' + webStack[webStackIndex].docSrchTrm).slice(1);
		if(docSearchTerm===undefined || docSearchTerm==='undefined'){
			docSearchTerm="";
		}
		docPageSearchInput.value = docSearchTerm;
		docSearchResultPages = JSON.parse(JSON.stringify(webStack[webStackIndex].docSrchRsltPgs));
		
		//......................................
		//navigate to page at webStackIndex
		//......................................
		switch (webStack[webStackIndex].pageParam.category){
			//......................
			// Home
			//......................
			case 'Home':
				menuClick({"category":"Home","subCat":""}, false);
			break;
			
			//......................
			// Overview
			//......................
			case 'Overview':
				//main menu click to overview:
				if (webStack[webStackIndex].pageParam.path ===""){
					menuClick({"category":"Overview","subCat":""}, false );
				}
				//sub selector click to overview page
				else {
					showOverview(webStack[webStackIndex].pageParam,false);
				}
			break;	
			
			//......................
			// maps
			//......................
			case 'Maps':
				//main menu click to maps:
				if (webStack[webStackIndex].pageParam.path ===""){
					menuClick({"category":"Maps","subCat":""}, false );
				}
				//sub selector click to a maps page
				else {
					showMap(webStack[webStackIndex].pageParam,false);
				}
			break;	

			//......................
			// Territorial
			//......................			
			case 'Pre-Org':
				menuClick({"category":"Pre-Org","subCat":""}, false );
			break;	
			
			//......................
			// Schools
			//......................
			case 'Schools':
			case 'PottawatomieMission':
			case 'JacksonCounty':
			case 'Joint':
			case 'Adjacent':
			case 'USD':
			case 'College':
				//main menu click to overview page
				if (webStack[webStackIndex].pageParam.path ===""){
					console.log("path is blank");
					menuClick({"category":"Schools","subCat":""}, false );
				}
				//sub selector click to school page
				else {
					console.log("showSchool");
					showSchool(webStack[webStackIndex].pageParam,"",false);
				}
			break;	
			
			//......................
			// References
			//......................
			case 'References':
				menuClick({"category":"References","subCat":""}, false );
			break;	
			
			//......................
			// Source Material
			//......................			
			case 'SourceMatl':
				//main menu click to the source material link list
				if (webStack[webStackIndex].pageParam.path ===""){
					menuClick({"category":"SourceMatl","subCat":""}, false );
				}
				else {
					loadDocPages(webStack[webStackIndex].pageParam.path,webStack[webStackIndex].pageParam.title,false);
				}
			break;	
			
			//......................
			// Contact
			//......................
			case 'Contact':
				menuClick({"category":"Contact","subCat":""}, false );
			break;
			
			//......................
			// SiteSearch
			//......................
			case 'SiteSearch':
				showSiteSearchResults(false);
			break;				
		}
		
	}

	//==========================================================================================
	// addToWebStack
	//==========================================================================================	
	function addToWebStack(pgIn){
		//make sure nothing is stored in the stack "by Reference"
		let pageStckEl = new PageStack();
		pageStckEl.pageParam = JSON.parse(JSON.stringify(pgIn));
		pageStckEl.siteSrchTrmInpt =(' ' + siteSearchTermInput).slice(1);
		pageStckEl.siteSearchRslts = JSON.parse(JSON.stringify(siteSearchResults));
		if (docPagesAreSearched) {
			pageStckEl.docPagesRSrchd=true;
		}
		else {
			pageStckEl.docPagesRSrchd=false;
		}
		pageStckEl.docSrchTrm = (' ' + docSearchTerm).slice(1);
		pageStckEl.docSrchRsltPgs =JSON.parse(JSON.stringify(docSearchResultPages));
		
		//get strings to compare current to previous page on the stack
		let prevElStr = JSON.stringify(webStack[webStack.length-1]);
		let newElStr = JSON.stringify(pageStckEl);
		
		//if its new, add it to the stack
		if (newElStr != prevElStr){
			webStack.splice(webStackIndex+1); //truncate any following pages compared to where we are now
			webStack.push(pageStckEl);
			webStackIndex = webStack.length-1;			
		}
		
		//console.log(webStackIndex,JSON.stringify(webStack[webStackIndex]));
	}
		
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
		
		
		if (inputBoxName==="docPageSearchInput"){
			//reset the search results counter
			document.getElementById("docSearchResultsQty").innerHTML='0/0';
			docSearchResultCurrPg=0;
			
			//clear out the search results
			clearDocumentSearch();
			
			//update webStack by copying the current location and adding results
			addToWebStack(webStack[webStackIndex].pageParam)
		}
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
		
		//update the webStack
		addToWebStack(webStack[webStackIndex].pageParam)
	};

	//==========================================================================================
	// configurePage
	//==========================================================================================
	function configurePage(config,showTitleBar3, showSchoolNavBar){
		//INPUTS:
		//	config can be:
		//		'siteSearchResults' = display the searchResultsHolder div
		//		'document' = display the documentContentHolder div
		//		'subPage' = display the iFrameHolder div
		//		'subSelector' = display the subselector for long lists like schools, maps,....
		//		'test' = change as required for testing
		//======================================================================================
		
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
		let searchRsltsHolder = document.getElementById("searchResultsHolder");	
		let subSelectorHolder = document.getElementById("subSelector");
		
		switch (config){
			//------------------------
			case 'siteSearchResults':
			//------------------------
				subMenuName = '';
				subMenuCat = '';
				subTitle.innerHTML = "Site Search Results";
				iFrameHldr.style.display = "none";
				subSelectorHolder.style.display="none";
				documentContentHolder.style.display = "none";
				subMenu.style.display = "block";
				searchRsltsHolder.style.display = "block";
				docNavBar.style.display = "none";
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';
				contentTitleBar.className = "titleBar3Empty";
			break;

			//------------------------
			case 'document':
			//------------------------
				subMenuName = "";
				subMenuCat = "";
				iFrameHldr.style.display = "block";
				documentContentHolder.style.display = "none";
				subSelectorHolder.style.display="none";
				subMenu.style.display = "block";
				docNavBar.style.display = "none";
				schoolNavBar.style.display = "none"
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';
			break;

			
			//------------------------
			case 'subPage':
			//------------------------
				iFrameHldr.style.display = "block";
				subMenuName = '';
				subMenuCat = ''
				documentContentHolder.style.display = "none";
				subSelectorHolder.style.display="none";
				subMenu.style.display = "block";
				docNavBar.style.display = "none";
				schoolNavBar.style.display = "none"
				searchRsltsHolder.style.display="none";
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';
				
			break;

			//------------------------
			case 'test':
			//------------------------
		  
				subMenuName = '';
				subMenuCat = '';
				subTitle.innerHTML = "Test";
				subMenu.style.display = "block";
				docNavBar.style.display = "block";
				schoolNavBar.style.display = "none"
				subSelectorHolder.style.display="none";
				contentTitleBar.className = "titleBar3Empty";
				iFrameHldr.style.display = "none";
				documentContentHolder.style.display = "block";
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';
				searchRsltsHolder.style.display="none";

			break;			
				

			//------------------------
			case 'subSelector':
			//------------------------
				iFrameHldr.style.display = "none";
				subMenuName = '';
				subMenuCat = ''
				documentContentHolder.style.display = "none";
				subSelectorHolder.style.display="block";
				subMenu.style.display = "block";
				docNavBar.style.display = "none";
				schoolNavBar.style.display = "none"
				searchRsltsHolder.style.display="none";
				docAnnot.innerHTML="";
				docFigCapt.innerHTML="";
				docPgImg.src='';
			break;
		}
		
		if (showTitleBar3){
			contentTitleBar.className = "titleBar3";
		}
		else {
			contentTitleBar.className = "titleBar3Empty";
		}
		if (showSchoolNavBar){
			schoolNavBar.style.display = "block"
		}
		else {
			schoolNavBar.style.display = "none"
		}
	}

	//==========================================================================================
	// showSiteSearchResults
	//==========================================================================================
	function showSiteSearchResults(userClick=true){
		
		//show the search results page
		configurePage('siteSearchResults',false, false);

		//fill in the contents of the results page
		let rsltStr = "<colgroup><col style='width:25%'><col style='width:75%'></colgroup>";
		rsltStr = rsltStr + "<tr><th>Page</th><th>Matches</th></tr>";
		
		for (let i=0;i<=siteSearchResults.length-1;i++){
			//console.log("siteSearchResults=" + JSON.stringify(siteSearchResults));
			//console.log(siteSearchResults[i]['matches'].length);
			let matchingTexts = "";
			for (let j=0;j<=siteSearchResults[i]['phrases'].length-1;j++){
				//console.log(j, JSON.stringify(siteSearchResults[i]['matches'][j]));
				matchingTexts = matchingTexts + siteSearchResults[i]['phrases'][j];
			}
			console.log(siteSearchResults[i]);
			
			//build link with correct type of function call based on category of the page that was found
			let thisFnCall="";
			let param = "";
			//console.log(siteSearchResults[i]['page']['category']);
			switch (siteSearchResults[i]['page']['category']) {
				//......................
				// Home
				//......................
				case 'Welcome':
				case 'Home':
					thisFnCall = "menuClick({'category':'Home','subCat':''}, true)";
				break;
				
				//......................
				// Overview
				//......................
				case 'Overview':
					param = JSON.stringify(siteSearchResults[i]['page']);
					param = param.replace(/"/g,"'");
					thisFnCall="showOverview(" + param + ",true)";
				break;	
				
				//......................
				// maps
				//......................
				case 'Maps':
					param = JSON.stringify(siteSearchResults[i]['page']);
					param = param.replace(/"/g,"'");
					thisFnCall="showMap(" + param + ",true)";
				break;	

				//......................
				// Territorial
				//......................			
				case 'Pre-Org':
					thisFnCall="menuClick({'category':'Pre-Org','subCat':''}, true )";
				break;	
				
				//......................
				// Schools
				//......................
				case 'Schools':
				case 'PottawatomieMission':
				case 'JacksonCounty':
				case 'Joint':
				case 'Adjacent':
				case 'USD':
				case 'College':
					param = JSON.stringify(siteSearchResults[i]['page']);
					param = param.replace(/"/g,"'");
					thisFnCall="showSchool(" + param + ",'',true)";

				break;	
				
				//......................
				// References
				//......................
				case 'References':
					thisFnCall="menuClick({'category':'References','subCat':''}, true )";
				break;	
				
				//......................
				// Source Material
				//......................			
				case 'SourceMatl':
					param = JSON.stringify(siteSearchResults[i]['page']['path']);
					param = param + ", " + JSON.stringify(siteSearchResults[i]['page']['title']);
					param = param.replace(/"/g,"'");
					thisFnCall="loadDocPages(" + param + ",true)";
				break;	
				
				//......................
				// Contact
				//......................
				case 'Contact':
					thisFnCall="menuClick({'category':'Contact','subCat':''}, true )";
				break;				
			}
			
			rsltStr = rsltStr + "<tr><td><a class='link-like' onclick=\"" + thisFnCall + "\">"  ;
			rsltStr = rsltStr + siteSearchResults[i]['title'] + "</a>"
			rsltStr = rsltStr +  "</td><td>" + matchingTexts + "</td></tr>";
		}
		//console.log("rsltStr="+rsltStr);
		document.getElementById("siteSearchResultsList").innerHTML = rsltStr;
		
		//update webStack by copying the current location and adding search results
		if (userClick){
			thisPage = new PageObject();
			thisPage.number="";
			thisPage.title="Site Search";
			thisPage.path="";
			thisPage.category="SiteSearch";
			addToWebStack(thisPage)
		}
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
	}

	//==========================================================================================
	// searchSite
	//==========================================================================================
	async function searchSite(precisionRqd=1.00, userClick=true){  
		//0.82 (very fuzzy) < precisionRqd <= 1.00 (perfect matches only)
	
		// stop user input
		document.getElementById("pauseUserInputContent").innerHTML="Please wait. Searching entire site....0/" + (searchFiles.length-1);
		document.getElementById("pauseUserInput").style.display="block";
		
		//initialize variables
		let foundSomeMatches = false;
		siteSearchResults.length=0;
		siteSearchPrecision = precisionRqd; //save to global variable
		siteSearchTermInput = document.getElementById("siteSearchInput").value;
		
		let startStr = "<colgroup><col style='width:25%'><col style='width:75%'></colgroup>";
		startStr = startStr + "<tr><th>Page</th><th>Matches</th></tr>";
		document.getElementById("siteSearchResultsList").innerHTML =startStr;
		
		if (siteSearchTermInput != null && siteSearchTermInput!=""){
			
			getDocSearchPatterns(siteSearchTermInput);  //this loads the array docSearchPatterns	
					
			//search through all the files with data for a match 
			for (let i=0;i<searchFiles.length-1;i++){
				//loop throught the elements of docSearchPatterns
				let myObject = await fetch(webRootLocation+searchFiles[i]['path']);
				let myText = await myObject.text();
				
				//remove tags from String
				let clnStr = removeTagsFromString(myText);
				clnStr = cleanStringOfPunctuation(clnStr);
				
				//search for each search term
				for (let term=0;term<=docSearchPatterns.length-1;term++){

					//search the string for a match. if match, add it to siteSearchResults
					if (TextHasSearchTerm(clnStr, precisionRqd)){
						
						foundSomeMatches=true;
						let matchSubStrings = FindMatchSubStrings(cleanStringOfPunctuation(clnStr),"weight");
						
						//find matching phrases in the original text
						let matchPhrases = getMatchPhrases(matchSubStrings,myText);
						siteSearchResults.push({title:searchFiles[i]['title'], matches: matchSubStrings, phrases: matchPhrases, page:searchFiles[i], page:searchFiles[i]});
					}
				}
				document.getElementById("pauseUserInputContent").innerHTML="Please wait. Searching entire site...." + i + "/" + (searchFiles.length-1);
			}
		
			if (foundSomeMatches){
				showSiteSearchResults();
			}
			else {
				alert("No matches found.");
			}
			
		} //end of if (docSearchTermInput != null && docSearchTermInput!="")
	
		// renew user input
		document.getElementById("pauseUserInputContent").innerHTML="Calculating....";
		document.getElementById("pauseUserInput").style.display="none";
	}
	
	//==========================================================================================
	// getMatchPhrases
	//==========================================================================================
	function getMatchPhrases(inArr,strIn){
		
		//build matchArr to with unique values of inArr
		let matchArr = [];
		matchArr.push(inArr[0]);
		for (let i=1;i<=inArr.length-1;i++){
			let foundMatch=false;
			for (let j=0;j<=matchArr.length-1;j++){
				if (inArr[i]['text']===matchArr[j]['text']){
					foundMatch=true;
				}
			}
			if (!foundMatch){
				matchArr.push(inArr[i]);
			}
		}

		//remove escaped characters from strIn
		strIn = strIn.replace(/\\n/g, " ");
		strIn = strIn.replace(/\\t/g, " ");
		strIn = strIn.replace(/\\'/g, "'");
		strIn = strIn.replace(/\\"/g, '"');
		strIn = strIn.replace(/\\/g, " ");
		
		let result = [];
		for (let matchNum=0;matchNum<=matchArr.length-1;matchNum++){
			let len = matchArr[matchNum]['text'].length;
			for (let startChar=0; startChar<=strIn.length-len-1; startChar++){
				let subStr = strIn.substring(startChar,startChar+len);

				if (subStr===matchArr[matchNum]['text']){
					//search forwards to start of previous word or punctuation, whichever comes first
					let rtPart = "";
					if (startChar+len<=strIn.length-1){
						let endsFound = 0;
						for (let i=startChar+len-1;i<=strIn.length-1;i++){

							if (charIsPhraseEnder(strIn[i,i+1])){
								endsFound = endsFound+1;
							}
							if (strIn[i,i+1]==="<" || strIn[i,i+1]===">"){
								endsFound=2;
							}
							
							//keep the first phrase ender but not the second  (unless its an HTML tag, then only keep the first)
							if (endsFound<2) {
								rtPart = rtPart + strIn[i,i+1];
							}
							else {
								break;
							};
						}
					}
					
					//search backwards to start of previous word or punctuation, whichever comes first
					let lftPart = "";
					if (startChar>=1){
						endsFound = 0;
						for (let i=startChar-2;i>=0;i--){

							if (charIsPhraseEnder(strIn[i,i+1])){
								endsFound = endsFound+1;
							}
							if (strIn[i,i+1]==="<" || strIn[i,i+1]===">"){
								endsFound=2;
							}

							//keep the first phrase ender but not the second (unless its an HTML tag, then only keep the first)
							if (endsFound<2) {
								lftPart = strIn[i,i+1] + lftPart;
								//console.log("     endsFound="+endsFound+", lftPart=|" + lftPart + "|");
							}
							else if (endsFound>=2) {
								//console.log("     endsFound="+endsFound+", lftPart=|" + lftPart + "| BREAK" );
								break;
							};
						}
					};
					
					//remove any leading or trailing phrase enders
					let needToCheckForRemoval=true;
					if (rtPart.length<=1 && lftPart.length<=1){
						needToCheckForRemoval=false;
					}
					while (needToCheckForRemoval){
						if (rtPart.length>0){
							if (charIsPhraseEnder(rtPart[rtPart.length-1])){
								rtPart = rtPart.substring(0,rtPart.length-1);
								needToCheckForRemoval=true; //cause they could be doubled up
							}
							else {
								needToCheckForRemoval=false;
							}
						}
						if (lftPart.length>0){
							if (charIsPhraseEnder(lftPart[0])){
								lftPart = lftPart.substring(1);
								needToCheckForRemoval=true; //cause they could be doubled up
							}
							else {
								needToCheckForRemoval=false;
							}	
						}
					}

					if (charIsPhraseEnder(lftPart[0])){
						lftPart = lftPart.substring(1);
					}
					if (charIsPhraseEnder(rtPart[rtPart.length-1])){
						rtPart = rtPart.substring(0,rtPart.length-2);
					}		
					
					//add phrase to result array
					let finalPhrase = lftPart + "<MARK>" + matchArr[matchNum]['text'] + "</MARK>" + rtPart;
					finalPhrase = finalPhrase.trim();
					result.push(finalPhrase);
					
				} //end of if (subStr===matchArr[matchNum]['text'])
				
			} //end of for (let startChar
			
		} //end of for (let matchNum
		
		//eliminate duplicates and show qty of each duplicate
		let wkgRslt=[];
		let rsltCountPair= new Object();
		rsltCountPair = {count:1, rslt:result[0]};
		wkgRslt.push(rsltCountPair);

		for (let i=1;i<=result.length-1;i++){
			let foundMatch = false;
			for (let j=0;j<=wkgRslt.length-1;j++){
				//console.log("|"+result[i]+"|","|"+wkgRslt[j]['rslt']+"|");
				if (result[i]===wkgRslt[j]['rslt']){
					wkgRslt[j]['count']=wkgRslt[j]['count']+1;
					foundMatch = true;
				}
			}
			if (!foundMatch){
				rsltCountPair = new Object();
				rsltCountPair={count:1, rslt:result[i]};
				wkgRslt.push(rsltCountPair);
			}

		}
		
		let finalRslt=[];
		for (let j=0;j<=wkgRslt.length-1;j++){
			finalRslt.push("..." + wkgRslt[j]['rslt'] + "(" + wkgRslt[j]['count'] + ")...");
		}

		return finalRslt;
	}
	
	//==========================================================================================
	// charIsPhraseEnder
	//==========================================================================================	
	function charIsPhraseEnder(inChar){
		let rslt=true;
		if (inChar === undefined || inChar ===""){
			rslt=true;
		}
		if (inChar != undefined && inChar !=""){
			let val = inChar.charCodeAt(0);
			if (val >=48 && val <=57) {rslt= false}  //inChar is a digit
			if (val >=65 && val <=90) {rslt= false}  //inChar is a capital letter
			if (val >=97 && val <=122) {rslt= false}  //inChar is a lower case letter
			//console.log("inChar=|" + inChar + "|, val=" + val + " rslt=" + rslt);
		}
		return rslt;
	}
	
	//==========================================================================================
	// getDocSearchPatterns
	//==========================================================================================	
	function getDocSearchPatterns(docSearchTermInput){
		//.................................................
		// load docSearchPatterns
		//.................................................
		//keep anything between quotes as an individual item, otherwise split them up
		let startQuote = false;
		let word = "";
		docSearchPatterns.length = 0;
		for (let i=0;i<=docSearchTermInput.length-1;i++){
			let char = docSearchTermInput[i];
			let charIsQuote = /^[“"']/.test(char);
			
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
		
	}
	
	//==========================================================================================
	// searchDocument
	//==========================================================================================
	function searchDocument(precisionRqd=1.00, userClick=true){  
		//0.82 (very fuzzy) < precisionRqd <= 1.00 (perfect matches only)
	
		//initialize variables
		let foundSomeMatches = false;
		docSearchPrecision = precisionRqd; //save to global variable
		
		// make sure we are in display mode 
		//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
		/*
		let chgDisplayMode = setDocDisplayMode('display');
		if (chgDisplayMode === 'cancel'){
			//if user cancelled changing to display mode, do not perform search
			return;
		}
		*/
		
		//clear out any existing search 
		clearDocumentSearch();
		docSearchPatterns.length = 0;	
		docSearchTermInput = docPageSearchInput.value.toString().trim().toLowerCase();
		
		if (docSearchTermInput != null && docSearchTermInput!=""){
			
			getDocSearchPatterns(docSearchTermInput)

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
					thisPageHasIt = TextHasSearchTerm(thisTxt,precisionRqd);
					
					if (thisPageHasIt){
						break; //out of (let paraNum) loop
					}						

				} //end of of (let paraNum) loop
				
				//check the caption
				if (!thisPageHasIt){
					thisTxt = docPages[pgNum]['caption'].toString();
					thisPageHasIt = TextHasSearchTerm(thisTxt,precisionRqd);
				}

				
				//if found match, add this page to docSearchResultPages array
				if (thisPageHasIt){
					docSearchResultPages.push(pgNum);
					foundSomeMatches = true;
				}

			} //end of pgNum loop
		
			//.........................................................
			// if matches were found then show qty & go to first page
			//.........................................................
			if (foundSomeMatches) {
				docPagesAreSearched=true;			
				document.getElementById("docSearchResultsQty").innerHTML='1/' + docSearchResultPages.length;
				docSearchResultCurrPg=0;
				loadDocPageNum(docSearchResultPages[0]);
			}
			// else reset to 0/0 and do not change pages
			else {
				document.getElementById("docSearchResultsQty").innerHTML='0/0';
				docSearchResultCurrPg=0;
			}
			
			//update webStack by copying the current location and adding results
			if (userClick){
				addToWebStack(webStack[webStackIndex].pageParam)
			}		
			
		} // end if (docSearchTermInput != null && docSearchTermInput!="")
			
	//==========================================================================================		
	} //END OF FUNCTION searchDocument
	
	//==========================================================================================
	// navDocSearchResults
	//==========================================================================================	
	function navDocSearchResults(movement){

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
			
			// make sure we are in display mode
			//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
			/*
			setDocDisplayMode('display');
			*/
			
			//update results quantity curr page number and load the page
			document.getElementById("docSearchResultsQty").innerHTML= (docSearchResultCurrPg +1) + '/' + docSearchResultPages.length;
			docPgNum = docSearchResultPages[docSearchResultCurrPg];
			loadDocPageNum(docPgNum);
		}
	}
	
	//==========================================================================================
	// loadDocPages
	//==========================================================================================
	async function loadDocPages(filePath, docTitle, userClick=true){

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
		
		//reset current page number within document
		docPgNum=0;
		
		//load the first page
		loadDocPageNum(0);

		//add to the web page stack if user navigated here
		if (userClick){
			thisPage = new PageObject();
			thisPage.number="";
			thisPage.title=docTitle;
			thisPage.path=filePath;
			thisPage.category="SourceMatl";
			addToWebStack(thisPage);
		}

	};

	//==========================================================================================
	// loadDocPageNum
	//==========================================================================================	
	function loadDocPageNum(pgNum){
		docPgNum = pgNum;
		
		// update image source path
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
		
		//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
		/*
		document.getElementById('figCaptionEdited').value = figCapt.innerHTML
		*/
		
		//update the annotation HTML
		let thisAnnotation = docPages[pgNum]['description'] ;  //NOTE: thisAnnotation is an array of paragraph texts
		let totalAnnotation = "";
		
		//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
		/*
		let totalEditAnnotation = "";
		*/
		
		for (let paraNum=0; paraNum<=thisAnnotation.length-1; paraNum++){
			thisAnnotation[paraNum] = thisAnnotation[paraNum].toString().replace(/[\r\n]/g,"<br>");
			totalAnnotation = totalAnnotation + thisAnnotation[paraNum] + "<br><br>";

			//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
			/*
			totalEditAnnotation=totalEditAnnotation+thisAnnotation[paraNum] + '\r\n\r\n';
			*/
			
		}
		let docAnnot = document.getElementById("docAnnotation");
		docAnnot.innerHTML=totalAnnotation;

		//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
		/*
		let docAnnotEdited = document.getElementById("docAnnotationEdited");
		docAnnotEdited.value = totalEditAnnotation;
		*/
		
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
				
				//..................................						
				//highlight instances in annotation
				//..................................
				let matchSubStrings = FindMatchSubStrings(cleanStringOfPunctuation(docAnnot.innerHTML),"length");	
				
				/*
				console.log("term#=" + term + ", docSearchPatterns[term]="+ docSearchPatterns[term]);				
				console.log("matchSubStrings =" + JSON.stringify(matchSubStrings));
				console.log("----------------------------------------------------------");
				*/
				if (matchSubStrings[0]!=null){
					for (let i=0;i<=matchSubStrings.length-1;i++){
						//console.log(i, JSON.stringify(matchSubStrings[i]));
						let re = new RegExp(matchSubStrings[i]['text'],"gi");
						//console.log("    re=" + re + ", matchSubStrings[i]['text']=" + matchSubStrings[i]['text'])
						docAnnot.innerHTML = docAnnot.innerHTML.replace(re,'<mark>' + matchSubStrings[i]['text'] + '</mark>');
					}
				}

				//..................................
				//highlight instances in caption
				//..................................
				matchSubStrings = FindMatchSubStrings(cleanStringOfPunctuation(figCapt.innerHTML),"length");
				//console.log("caption matchSubStrings.length=" + matchSubStrings.length);
				//console.log("caption matchSubStrings="+JSON.stringify(matchSubStrings));
				if (matchSubStrings[0]!=null){
					for (let i=0;i<=matchSubStrings.length-1;i++){
						let re = new RegExp(matchSubStrings[i]['text'],"gi");
						figCapt.innerHTML = figCapt.innerHTML.replace(re,'<mark>' + matchSubStrings[i]['text'] + '</mark>');
					}
				}
				
			}
		}
	};
	
	//==========================================================================================
	// cleanStringOfPunctuation
	//==========================================================================================		
	function cleanStringOfPunctuation(inString){
		var punctuationless = inString.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"");
		var finalString = punctuationless.replace(/\s{2,}/g," ");
		return finalString;
	}

	//==========================================================================================
	// removeTagsFromString
	//==========================================================================================		
	function removeTagsFromString(myText){
			let clnStr = "";
			let inTag = false;
			//console.log("rcd myText=" + myText);

			for (let j=0;j<=myText.length-1;j++){
				
				if (myText[j]==="<"){
					inTag=true;
				}
				else if (myText[j]===">"){
					inTag=false;
				}
				else if (!inTag){
					clnStr = clnStr + myText[j];
				}
				//console.log(j, myText[j],inTag, clnStr);
			}

			return clnStr;
	}
	
	//==========================================================================================
	// navDocPage
	//==========================================================================================	
	function navDocPage(movement){

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

		// make sure we are in display mode
		//NOTE: CANNOT EDIT AND SAVE ON gitHub, FUTURE PROJECT ON DIFFERENT SERVICE WITH SERVER-SIDE Database
		/*
		setDocDisplayMode('display');
		*/
		
		//update the page number input box to account for limiting
		let pgNumInput = document.getElementById("docPageNumInput");
		pgNumInput.setAttribute("value",Number(docPgNum)+1); //NOTE: pgNum is zero based, people like 1 based
		pgNumInput.dispatchEvent(new Event('input'));
		pgNumInput.value = Number(docPgNum)+1;
		pgNumInput.focus();
		pgNumInput.dispatchEvent(new Event('input'));
		
		//load the requested page	
		loadDocPageNum(docPgNum);
	};

	//==========================================================================================
	// buildSchoolLinks
	//==========================================================================================	
	function buildSchoolLinks(){
		var subSelContents = "";
		let param = "";
		//............................
		// Pottawatomie Mission
		//............................
		param = JSON.stringify(pottawatomieMissionSchool);
		param = param.replace(/"/g,"'");
		subSelContents = subSelContents + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><b><u>FEDERAL</u></b></a><BR>";
		subSelContents = subSelContents + String.fromCharCode(13) + "<a class='link-like' onclick=\"showSchool(";
		subSelContents = subSelContents + param + ", 'Overview')\">";
		subSelContents = subSelContents + pottawatomieMissionSchool.title + "</a><BR>";
		
		//............................
		// County Districts
		//............................
		var foundJoints = false;
		var foundAdjacents = false;
		
		subSelContents = subSelContents + "<BR><BR>"  + String.fromCharCode(13) + "<a></a>" + String.fromCharCode(13) + "<a><b><u>COUNTY GRADE SCHOOLS</u></b></a><BR>";
		for (var i = 0; i<=countySchoolDistricts.length-1;i++){

			if (countySchoolDistricts[i].category === "Joint" && !foundJoints) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a><BR>";
				foundJoints = true;
			}
			
			if (countySchoolDistricts[i].category === "Adjacent" && !foundAdjacents) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a><BR>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="showSchool({'number':'005','title':'5 Banner','path':'CountyDistricts/005/005_Overview.html','category':'JacksonCounty'})">5 Banner</a>
			param = JSON.stringify(countySchoolDistricts[i]);
			param = param.replace(/"/g,"'");
			subSelContents = subSelContents + String.fromCharCode(13) + "<a class='link-like' onclick=\"showSchool(";
			subSelContents = subSelContents + param + ", 'Overview', true)\">";
			subSelContents = subSelContents + countySchoolDistricts[i].title + "</a><BR>";
		}
		
		//............................
		// County High Schools
		//............................
		foundJoints = false;
		foundAdjacents = false;
		
		subSelContents = subSelContents + "<BR><BR>" + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><b><u>COUNTY HIGH SCHOOLS</u></b></a><BR>";
		for (var i = 0; i<=countyHighSchools.length-1;i++){

			if (countyHighSchools[i].category === "Joint" && !foundJoints) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a><BR>";
				foundJoints = true;
			}

			if (countyHighSchools[i].category === "Adjacent" && !foundAdjacents) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a><BR>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="menuClick({category:'High Schools',subCat:'RHS5', title:'RHS 5 Mayetta'})">RHS 5 Mayetta</a>
			param = JSON.stringify(countyHighSchools[i]);
			param = param.replace(/"/g,"'");
			subSelContents = subSelContents + String.fromCharCode(13) + "<a class='link-like' onclick=\"showSchool(";
			subSelContents = subSelContents + param + ", 'Overview', true)\">";
			subSelContents = subSelContents + countyHighSchools[i].title + "</a><BR>";
				
		}
		
		//............................
		// USDs
		//............................
		foundJoints = false;
		foundAdjacents = false;
		
		subSelContents = subSelContents + "<BR><BR>" + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><b><u>UNIFIED SCHOOL DISTRICTS</u></b></a><BR>";
		for (var i = 0; i<=usdSchools.length-1;i++){

			if (usdSchools[i].category === "Joint" && !foundJoints) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a><BR>";
				foundJoints = true;
			}

			if (usdSchools[i].category === "Adjacent" && !foundAdjacents) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a><BR>";
				foundAdjacents = true;
			}
			// Example:
			//<a onclick="menuClick({category:'UnifiedSchoolDistricts',subCat:'USD337', title:'USD337 Royal Valley'})">USD337 Royal Valley</a>
			param = JSON.stringify(usdSchools[i]);
			param = param.replace(/"/g,"'");
			subSelContents = subSelContents + String.fromCharCode(13) + "<a class='link-like' onclick=\"showSchool(";
			subSelContents = subSelContents + param + ", 'Overview', true)\">";
			subSelContents = subSelContents + usdSchools[i].title + "</a><BR>";
				
		}
		
		//............................
		// Colleges
		//............................
		foundJoints = false;
		foundAdjacents = false;
		
		subSelContents = subSelContents + "<BR><BR>" + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><b><u>COLLEGES</u></b></a><BR>";
		for (var i = 0; i<=colleges.length-1;i++){

			if (colleges[i].category === "Joint" && !foundJoints) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>JOINT DISTRICTS</u></a><BR>";
				foundJoints = true;
			}

			if (colleges[i].category === "Adjacent" && !foundAdjacents) {
				subSelContents = subSelContents + String.fromCharCode(13) + "<BR><a></a>" + String.fromCharCode(13) + "<a><u>ADJACENT DISTRICTS</u></a><BR>";
				foundAdjacents = true;
			}
			param = JSON.stringify(colleges[i]);
			param = param.replace(/"/g,"'");
			subSelContents = subSelContents + String.fromCharCode(13) + "<a class='link-like' onclick=\"showSchool(";
			subSelContents = subSelContents + param + ", 'Overview', true)\">";
			subSelContents = subSelContents + colleges[i].title + "</a><BR>";
				
		}		
		
		return subSelContents;	
		
	
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
	  
	};
	
	//==========================================================================================
	// showMap
	//==========================================================================================
	function showMap(params, userClick=true) {	
		var contentTitleBar = document.getElementById("ContentTitle");
		var subTitle = document.getElementById("SubTitle");
		var contentHolder = document.getElementById("ContentHolder");
		configurePage('subPage', true, false);		  
		subTitle.innerHTML = "Maps";
		contentTitleBar.innerHTML=params['title'];
		contentHolder.src = params['path'];
			
		//add to the web page stack if user navigated here
		if (userClick){ 
			let thisPage = JSON.parse(JSON.stringify(params));
			addToWebStack(thisPage);
		}	
		
	}
	
	//==========================================================================================
	// showSchool
	//==========================================================================================
	function showSchool(params, subMenuSelection="", userClick=true) {
		console.log("params=" + JSON.stringify(params));
		console.log("subMenuSelection=" + subMenuSelection);
		let contentTitleBar = document.getElementById("ContentTitle");
		let subTitle = document.getElementById("SubTitle");
		let contentHolder = document.getElementById("ContentHolder");
		let filePath = "";
		
		//subMenuSelection is only specified when user changes subMenu for a school (e.g. Overview, Location, People, Event) 
		if (subMenuSelection!=""){
			filePath = params['path'].replace('Overview',subMenuSelection);
		}
		else {
			filePath = params['path']
		}

		//show the correct configuration and update titles
		configurePage('subPage', true, true);		  
		subTitle.innerHTML = "School: " + params['title'];
		contentTitleBar.innerHTML = subMenuSelection;
		
		//load the requested page
		contentHolder.src = filePath;
		
		//build and fill the school-specific navbar
		schoolNavBar = document.getElementById("schoolNavBar");
		strParam = JSON.stringify(params);
		strParam = strParam.replace(/"/g,"'");
		let navHTML = "<a onclick=\"showSchool(" + strParam + ",'Overview')\">Overview</a>";
		navHTML = navHTML + "<a onclick=\"showSchool(" + strParam + ",'Locations')\">Location(s) and Bldg(s)</a>";
		navHTML = navHTML + "<a onclick=\"showSchool(" + strParam + ",'People')\">People</a>";
		navHTML = navHTML + "<a onclick=\"showSchool(" + strParam + ",'Events')\">Events</a>";
		schoolNavBar.innerHTML = navHTML;
		
		//add to the web page stack if user navigated here
		if (userClick){	
			//make a new object since we may have modified the filePath above
			let thisPage = JSON.parse(JSON.stringify(params));
			thisPage.path = filePath;
			addToWebStack(thisPage);
		}
	}
	
	//==========================================================================================
	// showOverview
	//==========================================================================================
	function showOverview(params, userClick=true){
		let contentTitleBar = document.getElementById("ContentTitle");
		let subTitle = document.getElementById("SubTitle");
		let contentHolder = document.getElementById("ContentHolder");
		
		//show the correct configuration and update titles
		configurePage('subPage', true, false);	
		subTitle.innerHTML = "Overview";
		contentTitleBar.innerHTML = params['title'];
		
		//load the requested page
		contentHolder.src = params['path'];
		
		//add to the web page stack if user navigated here
		if (userClick){
			addToWebStack(params);
		}
	}

	//==========================================================================================
	// highlightSearchResultsInSubPage
	//==========================================================================================
	function highlightSearchResultsInSubPage(){
		//get current page data from stack
		let thisPage = webStack[webStackIndex];
		console.log("thisPage=" + JSON.stringify(thisPage));
		console.log("thisPage['pageParam']=" + JSON.stringify(thisPage['pageParam']));
		let pgPath = thisPage['pageParam']['path'];

		console.log("|" + siteSearchTermInput + "|", siteSearchResults.length);
		//if there was a search, highlight Matches
		if (siteSearchTermInput !="" && siteSearchResults.length>0){
			
			//find the search match for this page
			for (let i=0;i<=siteSearchResults.length-1;i++){
				console.log(i, pgPath, siteSearchResults[i]['page']['path']);
				console.log("....." + JSON.stringify(siteSearchResults[i]));
				if (siteSearchResults[i]['page']['path'] === pgPath){
					console.log('found matching path');
					for (let j=0;j<=siteSearchResults[i]['matches'].length-1;j++){
						console.log(siteSearchResults[i]['matches'][j]['text']);
						let re=RegExp(siteSearchResults[i]['matches'][j]['text'],"ig");
						console.log("re=" + re);
						var iframe = document.getElementById('ContentHolder');
						console.log("got iframe");
						let iframeDoc=iframe.contentDocument || iframe.contentWindow.document;
						console.log("got iframeDoc");
						var iframeBody = iframeDoc.getElementsByTagName('body')[0];
						console.log("got iframeBody");
						//console.log(iframeBody.innerHTML);
						let txt = iframeBody.innerHTML;
						//console.log("txt=" + txt);
						iframeBody.innerHTML = txt.replace(re,"<MARK>" + siteSearchResults[i]['matches']['text'] + "</MARK>");
					}
				}
			}
		}		
	}

	//==========================================================================================
	// menuClick
	//==========================================================================================
	function menuClick(params, userClick=true) {
		console.log("params=" + JSON.stringify(params));
		
		var category = params.category;
		var subCat = params.subCat;
		var title=``;
		if (params.title) {
			title = params.title;
		}
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
		let searchRsltsHolder = document.getElementById("searchResultsHolder");
		let subSelectorContentHolder = document.getElementById("subSelectorContents");
		let thisPage = new PageObject();		
		let pageStckEl = new PageStack();
		let param = "";
		subMenuName = '';
		subMenuCat = '';
		let subSelectorContents = "";
		
		// SWITCH ON CATEGORY
		switch(category){
			
			//---------------------------
			case 'Test':
			//---------------------------	
				configurePage('test',false, false);

				//load the document pages
				loadDocPages("Test/Test_Files/AnnotatedPhotos_LloydCopeland.json");
				
			break;
			
			//---------------------------
			case 'Home':
			//---------------------------		  
				configurePage('subPage',false, false);
				subTitle.innerHTML = "Welcome";
				contentHolder.src ="Welcome/Welcome.html";
				
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Welcome";
					thisPage.path="Welcome/Welcome.html";
					thisPage.category="Home";
					addToWebStack(thisPage);
				}
				
			break;

			//---------------------------
			case 'Overview':
			//---------------------------	
				configurePage('subSelector', false, false);		  
				subTitle.innerHTML = "Overview";
				
				//build contents of subSelectorContents
				subSelectorContents = "";
				for (var i = 0; i<=overviews.length-1;i++){
					param = JSON.stringify(overviews[i]);
					param = param.replace(/"/g,"'");
					subSelectorContents = subSelectorContents + String.fromCharCode(13) + "<a class='link-like'"
					subSelectorContents = subSelectorContents + "onclick=\"showOverview(" + param + ", true);\">";
					subSelectorContents = subSelectorContents + overviews[i].title + "</a><br><br>";
				}		
				subSelectorContentHolder.style.columnCount=1;
				subSelectorContentHolder.innerHTML=subSelectorContents;		
				
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Overview";
					thisPage.path="";
					thisPage.category="Overview";
					addToWebStack(thisPage);
				}

			break;
			
			//---------------------------
			case 'Maps':
			//---------------------------				
				configurePage('subSelector', false, false);		  
				subTitle.innerHTML = "Maps";
				
				//build contents of subSelectorContents
				subSelectorContents = "";
				for (var i = 0; i<=maps.length-1;i++){
					// Example:
					//<a onclick="showMap({"category":"Maps","subCat":"1878 Jackson Co.","path":"Maps/1878_JacksonCo.html","title":"1878 Jackson Co."})">1878 Jackson Co.</a>
					param = JSON.stringify(maps[i]);
					param = param.replace(/"/g,"'");
					subSelectorContents = subSelectorContents + String.fromCharCode(13) + "<a class='link-like'"
					subSelectorContents = subSelectorContents + "onclick=\"showMap(" + param + ", true)\">";
					subSelectorContents = subSelectorContents + maps[i].title + "</a><br><br>";
				}		
				subSelectorContentHolder.style.columnCount=3;
				subSelectorContentHolder.innerHTML=subSelectorContents;		
								
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Maps";
					thisPage.path="";
					thisPage.category="Maps";
					pageStckEl = new PageStack();
					addToWebStack(thisPage);
				}

			break;

			//---------------------------		  
			case 'Pre-Org':
			//---------------------------	
				configurePage('subPage', false, false);		  
				subTitle.innerHTML = "Territorial Kansas";
				contentHolder.src =	"Pre-Org/Territorial.html";
									
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Pre-Org";
					thisPage.path="";
					thisPage.category="Pre-Org";
					addToWebStack(thisPage);
				}
	
			break;

			//---------------------------		
			case 'Schools':
			//---------------------------
				configurePage('subSelector', false, false);		  
				subTitle.innerHTML = "Schools";
				subSelectorContentHolder.style.columnCount=4;
				subSelectorContentHolder.innerHTML=buildSchoolLinks(); //call subroutine to load the links
				
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Schools";
					thisPage.path="";
					thisPage.category="Schools";
					addToWebStack(thisPage);
				}

			break;
			
			//---------------------------	
			case 'References':
			//---------------------------	
				configurePage('subPage', false, false);		   
				subTitle.innerHTML = "References";	
				contentHolder.src="References/References.html";
				
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="References";
					thisPage.path="";
					thisPage.category="References";
					addToWebStack(thisPage);
				}

			break;
			
			//---------------------------	
			case 'SourceMatl':
			//---------------------------	
				configurePage('document', false, false);			  
				subTitle.innerHTML = "Source Materials";	
				contentHolder.src="SourceMatls/SourceMatls.html";		
				
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="SourceMatl";
					thisPage.path="";
					thisPage.category="SourceMatl";
					addToWebStack(thisPage);
				}
		
			break;

			//---------------------------	
			case 'Contact':
			//---------------------------	
				configurePage('subPage', false, false);	
				subTitle.innerHTML = "Contact";	
				contentHolder.src="Contact/Contact.html";
				//add to the web page stack if user navigated here
				if (userClick){
					thisPage = new PageObject();
					thisPage.number="";
					thisPage.title="Contact";
					thisPage.path="";
					thisPage.category="Contact";
					addToWebStack(thisPage);;
				}

			break;

		} 
	
		window.top.scrollTo(0,0);
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
		
	};
	
	//==========================================================================================
	// FindMatchSubStrings
	//==========================================================================================	
	function FindMatchSubStrings(textIn, sortByChoice){
		//==========================================================================================
		//find unique substrings within textIn that match items in array docSearchPatterns 
		//		with precision docSearchPrecision
		//==========================================================================================
		// INPUTS
		//		docSearchPatterns = a GLOBAL array of search patterns
		//		textIn = text to be searched for matching substrings
		//		sortByChoice='length' returns array sorted by length of 'text' descending
		//		sortByChoice='weight' returns arryay sorted by matching weight descending
		//
		//==========================================================================================
		// RETURNS
		// 		filteredMatches = an array of objects of form {text, score, position} for each matching substring
		//						  in textIn
		//==========================================================================================
		
		let foundMatches= [];
		textIn = removeTagsFromString(textIn); //remove HTML tags from the string so we don't match "Cedar" to ">Ceda"
		
		/*
		console.log("==================================================");
		console.log("textIn=" + textIn);
		console.log("docSearchPatterns=" + JSON.stringify(docSearchPatterns));
		console.log("docSearchPrecision=" + docSearchPrecision);
		console.log("==================================================");
		*/
		for (let termNum=0; termNum<=docSearchPatterns.length-1; termNum++){
			let thisTerm = docSearchPatterns[termNum];
			if (docSearchPrecision>=1){
				let re=new RegExp(thisTerm,"gi");  //do this to get case insensitive search
				let allRslts = textIn.matchAll(re); //returns iterable object with all matches and their indices
				
				for (const match of allRslts) {
					//console.log(match);
					rsltObj = {text: match[0], score: 1, position:match.index};
					foundMatches.push(rsltObj);	
				}
				
			}
			else {	
				//check substrings with lengths between docSearchPrecision*thisTerm.length and 1.precisionRequired*thisTerm.length (e.g. between 0.75 and 1.25)
				let thisStartLen = Math.floor(thisTerm.length*docSearchPrecision);
				let thisEndLen = Math.ceil(thisTerm.length*(1+(1-docSearchPrecision)));
				
				for (let len=thisEndLen; len>=thisStartLen; len--){

					for (let startPos=0;startPos<=textIn.length-1-len;startPos++){
						let subStr = textIn.substring(startPos,startPos+len-1);
						let wt = JaroWinklerDistance(thisTerm,subStr);
						
						if (wt>=docSearchPrecision){
							rsltObj = {text: subStr.trim(), score: wt, position:startPos};
							foundMatches.push(rsltObj);
							//console.log("rsltObj="+JSON.stringify(rsltObj));
						}
					} //end of (let startPos) loop

					
				} //end of (let len) loop

			} //end of else docSearchPrecision<1
		} //end of (let termNum)
		
		//console.log("foundMatches="+JSON.stringify(foundMatches));
		
		//sort by length descending so can eliminate matching substrings for unique values (e.g. keep "Cedar" and don't keep "Ceda" if they have the same startPos)
		foundMatches.sort((a, b) => b['text'].length - a['text'].length); 
		
		//console.log("sorted foundMatches="+JSON.stringify(foundMatches));
		
		//reduce foundMatches to unique values (text and position) only
		let filteredMatches = [];
		filteredMatches.push(foundMatches[0]);
		for (let i=1;i<=foundMatches.length-1;i++){
			let foundMatch = false;
			
			for (let j=0;j<=filteredMatches.length-1;j++){

				if (foundMatches[i]['text']===filteredMatches[j]['text'] && foundMatches[i]['position']===filteredMatches[j]['position']){
					foundMatch = true;
					if (foundMatches[i]['wt']>filteredMatches[j]['wt']){
						filteredMatches[j]['wt']=foundMatches[i]['wt'];
					}
				}
				//keep "Cedar" and don't keep "Ceda" if they have the same starting position
				else if (filteredMatches[j]['text'].indexOf(foundMatches[i]['text'])>=0 && filteredMatches[j]['position']===foundMatches[i]['position']){
					foundMatch=true;
					
				}
			} //end of for j
			if (!foundMatch){
				filteredMatches.push(foundMatches[i]);
			}
		} //end of for i
		//console.log("filteredMatches="+JSON.stringify(filteredMatches));
		
		//sort as requested
		if (sortByChoice==='length'){
			filteredMatches.sort((a, b) => b['text'].length - a['text'].length);
		}
		else if (sortByChoice==='weight'){
			filteredMatches.sort((a, b) => b['wt'] - a['wt']);
		}
		//console.log("sorted filteredMatches="+JSON.stringify(filteredMatches));		
		return filteredMatches;
	}

	//==========================================================================================
	// TextHasSearchTerm
	//==========================================================================================	
	function TextHasSearchTerm(textIn,precisionRqd) {
		//==========================================================================================
		// Returns true if any term in array docSearchPatterns matches any part of 
		//		textIn with precisionRqd
		//==========================================================================================
		docSearchPrecision = precisionRqd;
		
		let thisPageHasIt=false;
		for (let termNum=0; termNum<=docSearchPatterns.length-1; termNum++){
			let thisTerm = docSearchPatterns[termNum];
			
			if (docSearchPrecision>=1){
				let re=new RegExp(thisTerm,"gi");
				let result = textIn.match(re);  //returns array of all matching subtexts

				if (result !=null){
					thisPageHasIt=true;
					break; //out of (let termNum) loop
				}
			}
			else {
				//check substrings with lengths between docSearchPrecision*thisTerm.length and 1.precisionRequired*thisTerm.length (e.g. between 0.75 and 1.25)
				let thisStartLen = Math.floor(thisTerm.length*docSearchPrecision);
				let thisEndLen = Math.ceil(thisTerm.length*(1+(1-docSearchPrecision)));

				for (let len=thisEndLen; len>=thisStartLen; len--){		
					for (let startPos=0;startPos<=textIn.length-1-len;startPos++){
						
						let wt = JaroWinklerDistance(thisTerm,textIn.substring(startPos,startPos+len-1));

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
		
		//make this case insensitive
		s1 = s1.toLowerCase();
		s2 = s2.toLowerCase();
		
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
	
	//---------------------------
	// PageStack
	//---------------------------
	class PageStack{
		pageParam;
		siteSrchTrmInpt;
		siteSearchRslts;
		docPagesRSrchd;
		docSrchTrm;
		docSrchRsltPgs; //array of page numbers containing the searched for text
	};	
