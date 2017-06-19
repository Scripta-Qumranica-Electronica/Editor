function toggleControlPanel()
{
	$('#userPanel').toggle();
	$('#quickMarkupPanel').toggle();
	
	const toggleButton = $('#controlPanelToggleButton');
	if (toggleButton.text() == '<')
	{
		toggleButton.text('>');
		
		$('.mainPanel').css
		({
			'max-width': '47%',
			'min-width': '47%'
		});
	}
	else
	{
		toggleButton.text('<');
		
		$('.mainPanel').css
		({
			'max-width': '40%',
			'min-width': '40%'
		});
	}
}

function initControlPanel()
{
	$('#controlPanelToggleButton')
	.click(toggleControlPanel);
}