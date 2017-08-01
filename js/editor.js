$(document).ready(function()
{
	initServerConnection();
	
	initControlPanel();
	initLoginLogout();
	initQuickMarkups();
	
	initTabs();
	
	initImages();
	initTextInput();
	initMarkupOverview();
	initDiscussion();
	initLoad();
	
	initRichTextEditor();
	initSingleSignEditor();
	
	initTransformation();
	
	Spider.requestFromServer
	(
		{
			'request': 'saveSingleSignChange',
			'user': 'test',
			'signs': JSON.stringify([{"sign": "ל", "sign_id": 2, "width": 2},{"sign": "ך", "sign_id": 3, "commentary": "commy"}])
		}	
	);
	
	
	
	
	
	
});