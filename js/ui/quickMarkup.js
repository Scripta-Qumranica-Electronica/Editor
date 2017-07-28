const _quickMarkupMap = {};

function insertQuickMarkup(id)
{
	const button = $('#' + id);
	if (button == null)
	{
		console.log('button not found: ' + '#' + id);
		return;
	}
	
	const toInsert = _quickMarkupMap[id];
	if (toInsert == null)
	{
		return;
	}
	
	const inputField = document.getElementById('inputField');
	const inputFieldJQ = $('#inputField'); 
	
	const content = inputFieldJQ.val();
	const cursorPosition = inputField.selectionStart;
	const newContent = content.substr(0, cursorPosition) + toInsert + content.substr(cursorPosition);
	
	inputFieldJQ.val(newContent);
	inputField.focus();
};

function toggleAddQuickMarkup()
{
	$('#newQMNameField'    ).toggle();
	$('#newQMCodeField'    ).toggle();
	$('#confirmNewQMButton').toggle();
	$('#cancelNewQMButton' ).toggle();
}

function defineNewQuickMarkup(name, code)
{
	const id = 'qm' + name.replace(/ /g, '') // remove spaces to ensure identification via browser
			   + ('' + Math.random()).replace('.', ''); // add random number for unique ids (despite equal names) 
	
	const qmButton =
	$('<input type="button" value="' + name + '" />')
	.addClass('quickMarkupButton')
	.attr('id', id);
	
	qmButton.click
	(
		function(event)
		{
			insertQuickMarkup(event.currentTarget.id);
		}
	);
	
	const removeQMButton =
	$('<input type="button" value="X" />')
	.addClass('hidden')
	.addClass('removeQMButton')
	.attr('id', 'remove' + id);
	
	removeQMButton.click
	(
		function(event)
		{
			removeQuickMarkup(event.currentTarget.id);
		}
	);
	
	const paragraph =
	$('<p />')
	.append(qmButton)
	.append(removeQMButton);
	
	$('#manageQMText').before(paragraph);
	
	_quickMarkupMap[id] = code;
}

var _showRemovalButtons = false;

// improvement over simple toggle() because new quick markups could be added while in removal mode
function toggleQMRemoval()
{
	if (_showRemovalButtons)
	{
		$('.removeQMButton').hide();
	}
	else
	{
		$('.removeQMButton').show();
	}
	
	_showRemovalButtons = !_showRemovalButtons;
}

function removeQuickMarkup(id)
{
	console.log('id ' + id);
	
	$('#' + id).remove();
	$('#' + id.replace('remove', '')).remove();
}

function initQuickMarkups()
{
	_quickMarkupMap['Vacat'       ] = '/vacat{1.0}';
	_quickMarkupMap['Blank line'  ] = '/blankLine{}';
	_quickMarkupMap['Left margin' ] = '/leftMargin{xyz}';
	_quickMarkupMap['Right margin'] = '/rightMargin{xyz}';
	_quickMarkupMap['Scribal hand'] = '§xyz';
	
	for (var name in _quickMarkupMap)
	{
		defineNewQuickMarkup(name, _quickMarkupMap[name]);
	}
	
	$('#newQuickMarkupButton').click(toggleAddQuickMarkup);
	
	$('#confirmNewQMButton').click
	(
		function()
		{
			defineNewQuickMarkup($('#newQMNameField').val(), $('#newQMCodeField').val()); 
		}
	);
	
	$('#cancelNewQMButton')
	.click(toggleAddQuickMarkup); // effectively a hide function, you can only press it if visible
	
	$('#removeQuickMarkupButton')
	.click(toggleQMRemoval);
}