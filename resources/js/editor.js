function initFrames()
{
	const h = ($(document).height() - 110) + 'px';
	const h2 = ($(document).height() - 69) + 'px'; // without headline (compensate headline's height & border)
	
	$('#imageField'         ).css({ 'height': h2 });
	$('#inputField'         ).css({ 'height': h });
	$('#previewLinesWrapper').css({ 'height': h });
	$('#markupOverview'     ).css({ 'height': h });
	$('#markupDiscussion'   ).css({ 'height': h });
	$('#contributionsList'  ).css({ 'height': h });
	$('#resultsContainer'   ).css({ 'height': h });
	$('#resultLinesWrapper' ).css({ 'height': h });
	
	$('#wysiwygContainer'   ).css({ 'height': h });
	$('#singleSignContainer').css({ 'height': h });
	$('#transformationField').css({ 'height': h });
}

$(document).ready(function()
{
	initServerConnection();
	
	initControlPanel();
	initLoginLogout();
	initQuickMarkups();
	
	initFrames();
	initTabs();
	
	initImages();
	initTextInput();
	initMarkupOverview();
	initDiscussion();
	
	initWysiwygEditor();
	initSingleSignEditor();
	
	initTransformation();
});