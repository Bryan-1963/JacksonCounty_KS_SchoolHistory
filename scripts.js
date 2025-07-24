	
	//==========================================================================================
	// GLOBAL VARIABLES
	//==========================================================================================
	var topTitleHeight = 46;
	var topMenuHeight=51;
	var subTitleHeight=46;
	var subMenuHeight=51;	
	var contentTitleHeight=46;
	
	//==========================================================================================
	// EVENT LISTENERS
	//==========================================================================================	
	window.addEventListener("resize", sizeBars());
	document.getElementById("MainMenu").addEventListener("load", sizeBars());
	document.getElementById("SubMenu").addEventListener("load", sizeBars());
	document.getElementById("iFrameHolder").addEventListener("load", sizeBars());
	document.getElementById("SubTitle").addEventListener("load", sizeBars());
	document.getElementById("ContentTitle").addEventListener("load", sizeBars());
	
	// ELEMENT RESIZE OBSERVER
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
		var subMenuHTML = ``;
		var contentTitleBar = document.getElementById("ContentTitle");
		
		// SWITCH ON CATEGORY
		switch(category){

		  //---------------------------
		  case 'Home':
		  //---------------------------		  
			contentSource="Welcome/Welcome.html"
			subTitle.innerHTML = "Welcome";
			subMenu.innerHTML="&nbsp";
			contentTitleBar.className = "titleBar3Empty";
			break;

		  //---------------------------
		  case 'Overview':
		  //---------------------------		  
			subMenu.innerHTML="&nbsp";
			subTitle.innerHTML = "Overview";
			contentTitleBar.className = "titleBar3Empty";
			
			if (subCat==='Overview'){
				contentSource="Overview/CountyOverview.html"
			}
			if (subCat==='CoDistrictSumm'){
				contentSource="Overview/CountyDistrictsSummary.html"
			}
			if (subCat==='CoHSSumm'){
				contentSource="Overview/CountyHighSchoolSummary.html";
			}
			if (subCat==='TeachersInst'){
				contentSource="Overview/TeachersInstitute.html";
			}
			if (subCat==='DeedsLists'){
				contentSource="Overview/RegisterOfDeedLists.html";
			}
			if (subCat==='TreasurerAndTaxRpts'){
				contentSource="Overview/CountyTreasurerAndTaxReports.html";
			}
			if (subCat==='GradRpts'){
				contentSource="Overview/CommonSchoolGraduateReports.html";
			}
			if (subCat==='TeachersRpts'){
				contentSource="Overview/TeachersReports.html";
			}
			if (subCat==='OtherRpts'){
				contentSource="Overview/OtherReports.html";
			}					
			break;
			
		  //---------------------------
		  case 'Maps':
		  //---------------------------
			subMenu.innerHTML="&nbsp";
			subTitle.innerHTML = "Maps";
			contentTitleBar.className = "titleBar3Empty";
			
			if (subCat==='1878 Jackson Co.'){
				contentSource="Maps/1878_JacksonCo.html";
			}
			else if (subCat==='1881 Jackson Co.'){
				contentSource="Maps/1881_JacksonCo.html";
			}
			else if (subCat==='1883 Jackson Co.'){
				contentSource="Maps/1883_JacksonCo.html";
			}
			else if (subCat==='1885 Holton'){
				contentSource="Maps/1885_Holton.html";
			}			
			else if (subCat==='1887 Jackson Co.'){
				contentSource="Maps/1887_JacksonCo.html";
			}
			else if (subCat==='1887 Brown Co.'){
				contentSource="Maps/1887_BrownCo.html";
			}
			else if (subCat==='1887 Nemaha Co.'){
				contentSource="Maps/1887_NemahaCo.html";
			}
			else if (subCat==='1889 Holton'){
				contentSource="Maps/1889_Holton.html";
			}
			else if (subCat==='1896 Holton'){
				contentSource="Maps/1896_Holton.html";
			}						
			else if (subCat==='1899 Pottawatamie Co.'){
				contentSource="Maps/1899_PottawatomieCo.html";
			}				
			else if (subCat==='1903 Jackson Co.'){
				contentSource="Maps/1903_JacksonCo.html";
			}			
			else if (subCat==='1905 Holton'){
				contentSource="Maps/1905_Holton.html";
			}				
			else if (subCat==='1908 Nemaha Co.'){
				contentSource="Maps/1908_NemahaCo.html";
			}		
			else if (subCat==='1911 Holton'){
				contentSource="Maps/1911_Holton.html";
			}
			else if (subCat==='1912 Jackson Co. School Dist.'){
				contentSource="Maps/1912_JacksonCoSchoolDistricts.html";
			}
			else if (subCat==='1918 Pottawatamie Reservation'){
				contentSource="Maps/1918_PottawatomieReservation.html";
			}
			else if (subCat==='1919 Brown Co.'){
				contentSource="Maps/1919_BrownCo.html";
			}
			else if (subCat==='1921 Jackson Co.'){
				contentSource="Maps/1921_JacksonCo.html";
			}	
			else if (subCat==='1922 Holton'){
				contentSource="Maps/1922_Holton.html";
			}	
			else if (subCat==='1922 Holton'){
				contentSource="Maps/1922_Holton.html";
			}	
			else if (subCat==='1938 Jackson Co. Schl Dir'){
				contentSource="Maps/1938_JacksonCoSchlDir.html";
			}	
			else if (subCat==='1963 Jackson Co. Rural Dir'){
				contentSource="Maps/1963_JacksonCoRuralDir.html";
			}			
			else {
				console.log("NO MENU MATCH FOR " + subCat);
			}
			break;

		  //---------------------------		  
		  case 'Pre-Org':
		  //---------------------------		  
			subMenu.innerHTML="&nbsp";
			subTitle.innerHTML = "Territorial Kansas";
			contentTitleBar.className = "titleBar3Empty";
			
			if (subCat==='Frontier'){
				contentSource="Pre-Org/Frontier.html";
			}
			if (subCat==='Territorial'){
				contentSource="Pre-Org/Territorial.html";
			}
			break;

		  //---------------------------		  
		  case 'County Districts':
		  //---------------------------	
			// LOAD SUB TITLE
			var subTitleHTML = `County District ` + title;
			subTitle.innerHTML = subTitleHTML;
			
			// LOAD SUBMENU html
			subMenuHTML = ``;

			subMenuHTML=subMenuHTML + `<a onclick="subMenuClick('CountyDistricts','Overview','` + subCat + `')">Overview</a>`;
			subMenuHTML=subMenuHTML + `<a onclick="subMenuClick('CountyDistricts','Location(s)','` + subCat + `')">Location(s) and Bldgs</a>`;
			subMenuHTML=subMenuHTML + `<a onclick="subMenuClick('CountyDistricts','People','` + subCat + `')">People</a>`;
			subMenuHTML=subMenuHTML + `<a onclick="subMenuClick('CountyDistricts','Events','` + subCat + `')">Events</a>`;

			subMenu.innerHTML=subMenuHTML;
			contentSource="CountyDistricts/" + subCat + "/" + subCat + "_Overview.html";
			contentTitleBar.className = "titleBar3";
			contentTitleBar.innerHTML="Overview";
			break;
			
		  //---------------------------		
		  case 'Pottawatomie Mission':
		  //---------------------------		
			subTitle.innerHTML = "Pottawatomie Mission";
			contentTitleBar.className = "titleBar3Empty";
			break;

		  //---------------------------				
		  case 'High Schools':
		  //---------------------------	
			subTitle.innerHTML = "High Schools";	
			contentTitleBar.className = "titleBar3";	
			contentTitleBar.innerHTML="Overview";			
			break;

		  //---------------------------				
		  case 'USD':
		  //---------------------------	
			subTitle.innerHTML = "Unified School Districts";
			contentTitleBar.className = "titleBar3Empty";
			break;	  

		  //---------------------------	
		  case 'Colleges':
		  //---------------------------	
			subTitle.innerHTML = "Colleges";	
			contentTitleBar.className = "titleBar3Empty";
			break;

		  //---------------------------	
		  case 'References':
		  //---------------------------			  
			subMenu.innerHTML="&nbsp";
			subTitle.innerHTML = "References";	
			contentTitleBar.className = "titleBar3Empty";
			contentSource="References/References.html";

			break;

		  //---------------------------	
		  case 'Contact':
		  //---------------------------			  
			subMenu.innerHTML="&nbsp";
			subTitle.innerHTML = "Contact";	
			contentTitleBar.className = "titleBar3Empty";
			contentSource="Contact/Contact.html";
			break;

		} 

		// CLONE AND REPLACE CONTENT
		//var content=document.getElementById("Content");
		//var clone=content.cloneNode(true);
		//clone.setAttribute('src', contentSource);
		//content.parentNode.replaceChild(clone,content)
		
		// CHANGE THE SOURCE FOR THE iFrame
		contentHolder.src =contentSource;
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
		
	}
	
	//==========================================================================================
	// subMenuClick
	//==========================================================================================
	function subMenuClick(subMenuName, category, subCat) {
	  console.log("subMenuClick: subMenuName=" + subMenuName + ", category=" + category + ", subCat=" + subCat);
	  var source = '';
	  var contentTitleBar = document.getElementById("ContentTitle");
	  var contentHolder = document.getElementById("ContentHolder");
	  
	  //---------------------------
	  // SWITCH ON SUBMENU NAME
	  //---------------------------
	  switch(subMenuName){
		case 'CountyDistricts':
			  //---------------------------
			  // SWITCH ON CATEGORY
			  //---------------------------
			switch(category){
			  case 'Overview':
				source="CountyDistricts/" + subCat + "/" + subCat + "_Overview.html";
				contentTitleBar.innerHTML="Overview";
			  break;
			  
			  case 'Location(s)':
				source="CountyDistricts/" + subCat + "/" + subCat + "_Locations.html";
				contentTitleBar.innerHTML="Location(s) and Buildings";
			  break;
			  
			  case 'People':
				source="CountyDistricts/" + subCat + "/" + subCat + "_People.html";
				contentTitleBar.innerHTML="People";
			  break;
			  
			  case 'Events':
				source="CountyDistricts/" + subCat + "/" + subCat + "_Events.html";
				contentTitleBar.innerHTML="Events";
			  break;
			  
			  }
		break;
	    }

		// CHANGE THE SOURCE FOR THE iFrame
		contentHolder.src =source;
		
		// ADJUST LOCATIONS OF BARS
		sizeBars()
	}
	
