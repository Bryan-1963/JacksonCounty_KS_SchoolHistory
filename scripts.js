
	
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
	var docPages = []; //array of AnnotatedPhotoObject, loaded by loadDocPages
	var docPgNum = 0;
	var webRootLocation = "https://bryan-1963.github.io/Sandbox/";
	var subMenuName = '';
	var subMenuCat = '';
	
	//==========================================================================================
	// EVENT LISTENERS
	//==========================================================================================	
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
	var docPageNumInput = document.getElementById("docPageNumInput");
	docPageNumInput.addEventListener("keydown", function (e) {
		if (e.code === "Enter" || e.code === "NumpadEnter") //checks whether the pressed key is "Enter"
		{  
			docPgNum = Math.floor(e.target.value)-1; //eliminate any decimal and change user 1-based input to 0-based input
			if (docPgNum>docPages.length-1) {docPgNum=docPages.length-1}
			if (docPgNum<0){docPgNum=0};
			loadDocPageNum(docPgNum);
		}
	});

	
	//==========================================================================================
	// loadDocPages
	//==========================================================================================
	async function loadDocPages(filePath, docTitle){
		console.log("in loadDocPages, rcd filePath=|" + filePath + "|");
		
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
		let docPage = document.getElementById("docPage");
		docPage.innerHTML = "";
		
		//fetch the data about the document
		docPages.length = 0;	
		console.log("webRootLocation+filePath=|" + webRootLocation+filePath + "|");
		let myObject = await fetch(webRootLocation+filePath);
		let myText = await myObject.text();
		docPages = JSON.parse(myText);
		let totDocPgs = document.getElementById("totalDocPages");
		totalDocPages.innerHTML = " of " + docPages.length;
		//console.log("docPages.length=" + docPages.length);
		loadDocPageNum(0);
	}
	
	//==========================================================================================
	// loadDocPageNum
	//==========================================================================================	
	function loadDocPageNum(pgNum){
		console.log("in loadDocPageNum, rcd pgNum=" + pgNum);
		// build & update HTML for this page
		let myHTML = "";
		myHTML=myHTML + "<figure class='myFigure'>";
		myHTML=myHTML + "<img src='" + webRootLocation + docPages[pgNum]['photoFilePath'].toString() + "' style='max-height: 600px;'>";
		if (docPages[pgNum]['caption'].length>0) {
			myHTML=myHTML + "<figcaption>" + docPages[pgNum]['caption'] + "</figcaption>";
		}
		myHTML=myHTML + "</figure>";
		document.getElementById("docPage").innerHTML=myHTML;
		
		//update the annotation page HTML
		let thisAnnotation = docPages[pgNum]['description'] ;
		//console.log("this annotation=|" + thisAnnotation + "|");
		thisAnnotation=thisAnnotation.replace(/[\r\n]/g,"<br>");
		thisAnnotation=thisAnnotation.replace(/<br><br>/g,"<br>");
		//console.log("now this annotation=|" + thisAnnotation + "|");
		myHTML="<p class='docPageAnnotation'>" + thisAnnotation + "</p><br>";
		document.getElementById("docAnnotationHolder").innerHTML=myHTML;
		
		//update the page number input box
		console.log("pgNum="+pgNum);
		let pgNumInput = document.getElementById("docPageNumInput");
		console.log("pgNumInput.value=" + pgNumInput.value);
		pgNumInput.setAttribute("value",pgNum+1); //NOTE: pgNum is zero based, people like 1 based
		console.log("NOW pgNumInput.value=" + pgNumInput.value);
	}
	
	//==========================================================================================
	// navDocPage
	//==========================================================================================	
	function navDocPage(movement){
		console.log("in navDocPage, rcd movement=" + movement);
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
		console.log("calling loadDocPage, sending docPgNum=" + docPgNum);
		loadDocPageNum(docPgNum);
	}
	
	
	//==========================================================================================
	// startup
	//==========================================================================================
	function startup(){
		//console.log("in startup");
		countySchoolDistricts.length =0;
		countyHighSchools.length = 0;
		initVars(); //load global variables
		buildMenus(); //build dropdowns based on contents of countySchoolDistricts and countyHighSchools
		sizeBars(); //size and place the menu bars
		//console.log("countySchoolDistricts.length=" + countySchoolDistricts.length);
	}

	//==========================================================================================
	// buildMenus
	//==========================================================================================	
	function buildMenus(){
		// County Districts
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
		
		// County High Schools
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
		
				
		// Maps
		dropDown = document.getElementById("MapsDropdown");
		dropDownContents = dropDown.innerHTML;

		for (var i = 0; i<=maps.length-1;i++){
			// Example:
			//<a onclick="menuClick({category:'Maps',subCat:'1878 Jackson Co.'})">1878 Jackson Co.</a>
			dropDownContents = dropDownContents + String.fromCharCode(13) + "<a onclick=\"menuClick({category:'Maps', subCat:'" + maps[i].number 
			dropDownContents = dropDownContents + "', title:'" + maps[i].title + "'})\">"+ maps[i].title + "</a>";
				
		}
		dropDown.innerHTML = dropDownContents;	
	}
	
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
	}
	
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
		let docPage = document.getElementById("docPage");
		let docNavBar = document.getElementById("docNavBar");
		let schoolNavBar = document.getElementById("schoolNavBar");
			
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
			
			//show the document content
			documentContentHolder.style.display = "block";
			docPage.innerHTML = "";
			
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
			docPage.innerHTML = "";
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
			docPage.innerHTML = "";
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
			docPage.innerHTML = "";
			
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
			docPage.innerHTML = "";
			
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
				docPage.innerHTML = "";

				// LOAD SUBMENU click parameters
				subMenuName = "CountyDistricts";
				subMenuCat = subCat;

				contentSource= category + "/" + subCat + "/" + subCat + "_Overview.html";
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
			docPage.innerHTML = "";
			
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
			docPage.innerHTML = "";
						
						
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
			docPage.innerHTML = "";
									
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
			docPage.innerHTML = "";

						
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
			docPage.innerHTML = "";
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
			docPage.innerHTML = "";
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
			docPage.innerHTML = "";
			break;

		} 
	
		// CHANGE THE SOURCE FOR THE iFrame
		contentHolder.src =contentSource;
		window.top.scrollTo(0,0);
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
		
	}
	
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
		
	} // end of function subMenuClick 
		
	//==========================================================================================
	// initVars
	//==========================================================================================
	function initVars(){
		//-----------------------------
		// load maps array
		//-----------------------------
		var thisMap = new PageObject();
		thisMap.number = "1878 Jackson Co.";
		thisMap.title = "1878 Jackson Co.";
		thisMap.path = "Maps\1878_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);
		
		thisMap = new PageObject();
		thisMap.number = "1881 Jackson Co.";
		thisMap.title = "1881 Jackson Co.";
		thisMap.path = "Maps\1881_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1883 Jackson Co.";
		thisMap.title = "1883 Jackson Co.";
		thisMap.path = "Maps\1883_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1885 Holton";
		thisMap.title = "1885 Holton";
		thisMap.path = "Maps\1885_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1887 Jackson Co.";
		thisMap.title = "1887 Jackson Co.";
		thisMap.path = "Maps\1887_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1887 Brown Co.";
		thisMap.title = "1887 Brown Co.";
		thisMap.path = "Maps\1887_BrownCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1887 Nemaha Co.";
		thisMap.title = "1887 Nemaha Co.";
		thisMap.path = "Maps\1887_NemahaCo.html";
		thisMap.category = ""
		maps.push(thisMap);
		
		thisMap = new PageObject();
		thisMap.number = "1889 Holton";
		thisMap.title = "1889 Holton";
		thisMap.path = "Maps\1889_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1896 Holton";
		thisMap.title = "1896 Holton";
		thisMap.path = "Maps\1896_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1899 Pottawatamie Co.";
		thisMap.title = "1899 Pottawatamie Co.";
		thisMap.path = "Maps\1899_PottawatamieCo.html";
		thisMap.category = ""
		maps.push(thisMap);
		
		thisMap = new PageObject();
		thisMap.number = "1903 Jackson Co.";
		thisMap.title = "1903 Jackson Co.";
		thisMap.path = "Maps\1903_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1905 Holton";
		thisMap.title = "1905 Holton";
		thisMap.path = "Maps\1905_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1908 Nemaha Co.";
		thisMap.title = "1908 Nemaha Co.";
		thisMap.path = "Maps\1908_NemahaCo.html";
		thisMap.category = ""
		maps.push(thisMap);
		
		thisMap = new PageObject();
		thisMap.number = "1911 Holton";
		thisMap.title = "1911 Holton";
		thisMap.path = "Maps\1911_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1912 Jackson Co. School Dist.";
		thisMap.title = "1912 Jackson Co. School Dist.";
		thisMap.path = "Maps\1912_JacksonCoSchoolDistricts.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1918 Pottawatamie Reservation";
		thisMap.title = "1918 Pottawatamie Reservation";
		thisMap.path = "Maps\1918_PottawatomieReservation.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1919 Brown Co.";
		thisMap.title = "1919 Brown Co.";
		thisMap.path = "Maps\1919_BrownCo.html";
		thisMap.category = ""
		maps.push(thisMap);
		
		thisMap = new PageObject();
		thisMap.number = "1921 Jackson Co.";
		thisMap.title = "1921 Jackson Co.";
		thisMap.path = "Maps\1921_JacksonCo.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1922 Holton";
		thisMap.title = "1922 Holton";
		thisMap.path = "Maps\1922_Holton.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1938 Jackson Co. Schl Dir";
		thisMap.title = "1938 Jackson Co. Schl Dir. (partial)";
		thisMap.path = "Maps\1938_JacksonCoSchlDir.html";
		thisMap.category = ""
		maps.push(thisMap);	
		
		thisMap = new PageObject();
		thisMap.number = "1963 Jackson Co. Rural Dir";
		thisMap.title = "1963 Jackson Co. Rural Dir.";
		thisMap.path = "Maps\1963_JacksonCoRuralDir.html";
		thisMap.category = ""
		maps.push(thisMap);	

		
		//-----------------------------
		// load countySchoolDistricts array
		//-----------------------------
		var thisDist = new PageObject();
		thisDist.number = "001";
		thisDist.title = "1 Brick";
		thisDist.path = "CountyDistricts\001\001_Overview.html";
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "002"
		thisDist.title = "2 Holton"
		thisDist.path = "CountyDistricts\002\002_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "003"
		thisDist.title = "3 Denison"
		thisDist.path = "CountyDistricts\003\003_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "004"
		thisDist.title = "4 Center"
		thisDist.path = "CountyDistricts\004\004_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "005"
		thisDist.title = "5 Banner"
		thisDist.path = "CountyDistricts\005\005_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "006"
		thisDist.title = "6 Liberty"
		thisDist.path = "CountyDistricts\006\006_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "007"
		thisDist.title = "7 Philo"
		thisDist.path = "CountyDistricts\007\007_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "008"
		thisDist.title = "8 Pleasant Valley"
		thisDist.path = "CountyDistricts\008\008_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "009"
		thisDist.title = "9 Lawnridge"
		thisDist.path = "CountyDistricts\009\009_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "010"
		thisDist.title = "10 Mulinax"
		thisDist.path = "CountyDistricts\010\010_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "011"
		thisDist.title = "11 Cedar Hill"
		thisDist.path = "CountyDistricts\011\011_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "012"
		thisDist.title = "12 North Star"
		thisDist.path = "CountyDistricts\012\012_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "013"
		thisDist.title = "13 Point Pleasant"
		thisDist.path = "CountyDistricts\013\013_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "014"
		thisDist.title = "14 Cedar Vale"
		thisDist.path = "CountyDistricts\014\014_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "015"
		thisDist.title = "15 Oak Hill (Pleasant Grove)"
		thisDist.path = "CountyDistricts\015\015_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "016"
		thisDist.title = "16 Circleville"
		thisDist.path = "CountyDistricts\016\016_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "017"
		thisDist.title = "17 Cedar Grove (Tutt)"
		thisDist.path = "CountyDistricts\017\017_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "018"
		thisDist.title = "18 Eureka"
		thisDist.path = "CountyDistricts\018\018_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "019"
		thisDist.title = "19 Rose Bud"
		thisDist.path = "CountyDistricts\019\019_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "020"
		thisDist.title = "20 Winding Vale"
		thisDist.path = "CountyDistricts\020\020_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "021"
		thisDist.title = "21 Fairview"
		thisDist.path = "CountyDistricts\021\021_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "022"
		thisDist.title = "22 Sylvian Grove"
		thisDist.path = "CountyDistricts\022\022_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "023"
		thisDist.title = "23 Soldier Valley"
		thisDist.path = "CountyDistricts\023\023_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "024"
		thisDist.title = "24 Rock"
		thisDist.path = "CountyDistricts\024\024_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "025"
		thisDist.title = "25 Ray"
		thisDist.path = "CountyDistricts\025\025_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "026"
		thisDist.title = "26 Soldier"
		thisDist.path = "CountyDistricts\026\026_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "027"
		thisDist.title = "27 Woodworth"
		thisDist.path = "CountyDistricts\027\027_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "028"
		thisDist.title = "28 Carmel"
		thisDist.path = "CountyDistricts\028\028_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "029"
		thisDist.title = "29 Lower Banner"
		thisDist.path = "CountyDistricts\029\029_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "030"
		thisDist.title = "30 Dodson Hill"
		thisDist.path = "CountyDistricts\030\030_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "031"
		thisDist.title = "31 Oak Grove"
		thisDist.path = "CountyDistricts\031\031_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "032"
		thisDist.title = "32 Slattery"
		thisDist.path = "CountyDistricts\032\032_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "033"
		thisDist.title = "33 Carbon"
		thisDist.path = "CountyDistricts\033\033_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "034"
		thisDist.title = "34 Netawaka"
		thisDist.path = "CountyDistricts\034\034_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "035"
		thisDist.title = "35 South Cedar"
		thisDist.path = "CountyDistricts\035\035_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "036"
		thisDist.title = "36 Maple Grove"
		thisDist.path = "CountyDistricts\036\036_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "037"
		thisDist.title = "37 Wobourn"
		thisDist.path = "CountyDistricts\037\037_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "038"
		thisDist.title = "38 Parallel"
		thisDist.path = "CountyDistricts\038\038_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "039"
		thisDist.title = "39 Harrison"
		thisDist.path = "CountyDistricts\039\039_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "040"
		thisDist.title = "40 Hoyt"
		thisDist.path = "CountyDistricts\040\040_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "041"
		thisDist.title = "41 Bucks Grove"
		thisDist.path = "CountyDistricts\041\041_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "042"
		thisDist.title = "42 Spring Dale"
		thisDist.path = "CountyDistricts\042\042_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "043"
		thisDist.title = "43 Walnut"
		thisDist.path = "CountyDistricts\043\043_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "044"
		thisDist.title = "44 Banks"
		thisDist.path = "CountyDistricts\044\044_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "045"
		thisDist.title = "45 Little Cross Creek"
		thisDist.path = "CountyDistricts\045\045_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "046"
		thisDist.title = "46 Browne"
		thisDist.path = "CountyDistricts\046\046_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "047"
		thisDist.title = "47 Whiting"
		thisDist.path = "CountyDistricts\047\047_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "048"
		thisDist.title = "48 Brightside"
		thisDist.path = "CountyDistricts\048\048_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "049"
		thisDist.title = "49 Drake"
		thisDist.path = "CountyDistricts\049\049_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "050"
		thisDist.title = "50 Holligan"
		thisDist.path = "CountyDistricts\050\050_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "051"
		thisDist.title = "51 Avoca"
		thisDist.path = "CountyDistricts\051\051_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "052"
		thisDist.title = "52 Beauty Heights"
		thisDist.path = "CountyDistricts\052\052_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "053"
		thisDist.title = "53 Capital View"
		thisDist.path = "CountyDistricts\053\053_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "054"
		thisDist.title = "54 Delia"
		thisDist.path = "CountyDistricts\054\054_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "055"
		thisDist.title = "55 Hazel Row"
		thisDist.path = "CountyDistricts\055\055_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "056"
		thisDist.title = "56 Hazel Grove"
		thisDist.path = "CountyDistricts\056\056_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "057"
		thisDist.title = "57 Ball"
		thisDist.path = "CountyDistricts\057\057_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "058"
		thisDist.title = "58 Cedar Center"
		thisDist.path = "CountyDistricts\058\058_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "059"
		thisDist.title = "59 Stach"
		thisDist.path = "CountyDistricts\059\059_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "060"
		thisDist.title = "60 Sunrise"
		thisDist.path = "CountyDistricts\060\060_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "061"
		thisDist.title = "61 Holton View"
		thisDist.path = "CountyDistricts\061\061_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "062"
		thisDist.title = "62 Olive Hill"
		thisDist.path = "CountyDistricts\062\062_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "063"
		thisDist.title = "63 Pea Ridge"
		thisDist.path = "CountyDistricts\063\063_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "064"
		thisDist.title = "64 Lawndale"
		thisDist.path = "CountyDistricts\064\064_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "065"
		thisDist.title = "65 Adrian"
		thisDist.path = "CountyDistricts\065\065_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "066"
		thisDist.title = "66 Rising Sun"
		thisDist.path = "CountyDistricts\066\066_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "067"
		thisDist.title = "67 Reddy"
		thisDist.path = "CountyDistricts\067\067_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "068"
		thisDist.title = "68 Bateman"
		thisDist.path = "CountyDistricts\068\068_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "069"
		thisDist.title = "69 South Hoyt"
		thisDist.path = "CountyDistricts\069\069_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "070"
		thisDist.title = "70 Anderson"
		thisDist.path = "CountyDistricts\070\070_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "071"
		thisDist.title = "71 Gray"
		thisDist.path = "CountyDistricts\071\071_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "072"
		thisDist.title = "72 Aurora"
		thisDist.path = "CountyDistricts\072\072_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "073"
		thisDist.title = "73 Prairie View"
		thisDist.path = "CountyDistricts\073\073_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "074"
		thisDist.title = "74 Wigwam"
		thisDist.path = "CountyDistricts\074\074_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "075"
		thisDist.title = "75 Pleasant View"
		thisDist.path = "CountyDistricts\075\075_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "076"
		thisDist.title = "76 South Star"
		thisDist.path = "CountyDistricts\076\076_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "077"
		thisDist.title = "77 Christenson"
		thisDist.path = "CountyDistricts\077\077_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "078"
		thisDist.title = "78 Clover Hill"
		thisDist.path = "CountyDistricts\078\078_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "079"
		thisDist.title = "79 Mayetta"
		thisDist.path = "CountyDistricts\079\079_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "080"
		thisDist.title = "80 Lone Star"
		thisDist.path = "CountyDistricts\080\080_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "081"
		thisDist.title = "81 Stoney Point"
		thisDist.path = "CountyDistricts\081\081_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "082"
		thisDist.title = "82 Renwood"
		thisDist.path = "CountyDistricts\082\082_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "083"
		thisDist.title = "83 Columbia"
		thisDist.path = "CountyDistricts\083\083_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "084"
		thisDist.title = "84 High Prairie"
		thisDist.path = "CountyDistricts\084\084_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "085"
		thisDist.title = "85 Sunflower"
		thisDist.path = "CountyDistricts\085\085_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "086"
		thisDist.title = "86 Glenwood"
		thisDist.path = "CountyDistricts\086\086_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "087"
		thisDist.title = "87 Goldenrod"
		thisDist.path = "CountyDistricts\087\087_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "088"
		thisDist.title = "88 Birmingham"
		thisDist.path = "CountyDistricts\088\088_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "089"
		thisDist.title = "89 Excelsior"
		thisDist.path = "CountyDistricts\089\089_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "090"
		thisDist.title = "90 Rock Brook"
		thisDist.path = "CountyDistricts\090\090_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "091"
		thisDist.title = "91 Nieve"
		thisDist.path = "CountyDistricts\091\091_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "092"
		thisDist.title = "92 Miller"
		thisDist.path = "CountyDistricts\092\092_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "093"
		thisDist.title = "93 Sunny Brook"
		thisDist.path = "CountyDistricts\093\093_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "094"
		thisDist.title = "94 Brewer"
		thisDist.path = "CountyDistricts\094\094_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "095"
		thisDist.title = "95 Sunny Slope"
		thisDist.path = "CountyDistricts\095\095_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "096"
		thisDist.title = "96 Blandin"
		thisDist.path = "CountyDistricts\096\096_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "097"
		thisDist.title = "97 Witchewa"
		thisDist.path = "CountyDistricts\097\097_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "098"
		thisDist.title = "98 Kewanka"
		thisDist.path = "CountyDistricts\098\098_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "099"
		thisDist.title = "99 Grand Prairie"
		thisDist.path = "CountyDistricts\099\099_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "100"
		thisDist.title = "100 New Century"
		thisDist.path = "CountyDistricts\100\100_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "101"
		thisDist.title = "101 Birmingham"
		thisDist.path = "CountyDistricts\101\101_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "102"
		thisDist.title = "102 Big Four (Grant Union)"
		thisDist.path = "CountyDistricts\102\102_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "103"
		thisDist.title = "103 Carwood"
		thisDist.path = "CountyDistricts\103\103_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "104"
		thisDist.title = "104 South Holton"
		thisDist.path = "CountyDistricts\104\104_Overview.html"
		thisDist.category = "JacksonCounty"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&A6"
		thisDist.title = "J&A6 Larkinburg"
		thisDist.path = "CountyDistricts\J&A6\J&A6_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&B1"
		thisDist.title = "J&B1 East Powhattan"
		thisDist.path = "CountyDistricts\J&B1\J&B1_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&B2"
		thisDist.title = "J&B2 ????"
		thisDist.path = "CountyDistricts\J&B2\J&B2_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&B3"
		thisDist.title = "J&B3 ????"
		thisDist.path = "CountyDistricts\J&B3\J&B3_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&B4"
		thisDist.title = "J&B4 ????"
		thisDist.path = "CountyDistricts\J&B4\J&B4_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&N1"
		thisDist.title = "J&N1 Wetmore"
		thisDist.path = "CountyDistricts\J&N1\J&N1_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&N2"
		thisDist.title = "J&N2 Ontario"
		thisDist.path = "CountyDistricts\J&N2\J&N2_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&N4"
		thisDist.title = "J&N4 ????"
		thisDist.path = "CountyDistricts\J&N4\J&N4_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&P3"
		thisDist.title = "J&P3 Buckeye Ridge"
		thisDist.path = "CountyDistricts\J&P3\J&P3_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&P4"
		thisDist.title = "J&P4 Long Branch"
		thisDist.path = "CountyDistricts\J&P4\J&P4_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "J&P7"
		thisDist.title = "J&P7 English Ridge"
		thisDist.path = "CountyDistricts\J&P7\J&P7_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "NJ&P1"
		thisDist.title = "NJ&P1 America City"
		thisDist.path = "CountyDistricts\NJ&P1\NJ&P1_Overview.html"
		thisDist.category = "Joint"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "B&N5"
		thisDist.title = "B&N5 West Powhattan"
		thisDist.path = "CountyDistricts\B&N5\B&N5_Overview.html"
		thisDist.category = "Adjacent"
		countySchoolDistricts.push(thisDist);
		
		thisDist = new PageObject()
		thisDist.number = "Nx"
		thisDist.title = "Nx Bancroft"
		thisDist.path = "CountyDistricts\Nx\Nx_Overview.html"
		thisDist.category = "Adjacent"
		countySchoolDistricts.push(thisDist);

		//-----------------------------
		// load countyHighSchools array
		//-----------------------------
		var thisDist = new PageObject();
		thisDist.number = "002";
		thisDist.title = "002 Holton";
		thisDist.path = "CountyHighSchools\002\002_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS1";
		thisDist.title = "RHS 1 Soldier";
		thisDist.path = "CountyHighSchools\RHS1\RHS1_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS2";
		thisDist.title = "RHS 2 Denison";
		thisDist.path = "CountyHighSchools\RHS2\RHS2_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS3";
		thisDist.title = "RHS 3 Whiting";
		thisDist.path = "CountyHighSchools\RHS3\RHS3_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS4";
		thisDist.title = "RHS 4 Hoyt";
		thisDist.path = "CountyHighSchools\RHS4\RHS4_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS5";
		thisDist.title = "RHS 5 Mayetta";
		thisDist.path = "CountyHighSchools\RHS5\RHS5_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS6";
		thisDist.title = "RHS 6 Circleville";
		thisDist.path = "CountyHighSchools\RHS6\RHS6_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS7";
		thisDist.title = "RHS 7 Delia";
		thisDist.path = "CountyHighSchools\RHS7\RHS7_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS8";
		thisDist.title = "RHS 8 Netawaka";
		thisDist.path = "CountyHighSchools\RHS8\RHS8_Overview.html";
		thisDist.category = "JacksonCounty"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHSJt2";
		thisDist.title = "RHS Jt2 Havensville";
		thisDist.path = "CountyHighSchools\RHSJt2\RHSJt2_Overview.html";
		thisDist.category = "Joint"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS Jt3";
		thisDist.title = "RHS Jt3 Emmett";
		thisDist.path = "CountyHighSchools\RHSJt3\RHSJt3_Overview.html";
		thisDist.category = "Joint"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHSJt4";
		thisDist.title = "RHS Jt4 Wetmore";
		thisDist.path = "CountyHighSchools\RHSJt4\RHSJt4_Overview.html";
		thisDist.category = "Joint"
		countyHighSchools.push(thisDist);

		var thisDist = new PageObject();
		thisDist.number = "RHS Jt93";
		thisDist.title = "RHS Jt93 Meriden";
		thisDist.path = "CountyHighSchools\RHSJt93\RHSJt93_Overview.html";
		thisDist.category = "Joint"
		countyHighSchools.push(thisDist);

	}	


	
	
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
	}
	
	//---------------------------
	// AnnotatedPhotoObject
	//---------------------------	
	class AnnotatedPhotoObject{
		sortNum;
		photoFilePath;
		caption;
		annotation;
	}
	
	
