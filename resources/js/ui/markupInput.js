function addLine(wrapper, number)
{
	const line =
	$('<div></div>')
	.addClass('textLine');
	
	const numbering =
	$('<div></div>')
	.addClass('textLineNumber')
	.text(number);
 
	const content =
	$('<div></div>')
	.addClass('textLineContent')
	.addClass('protectedLineBreaks');
	
	line.append(numbering, content);
	wrapper.append(line);
	
	return content;
}

function notifyKey(event)
{
	positionChange(event);
	
//	console.log('event.keyCode ' + event.keyCode);
}

function positionChange(event)
{
	const inputField = document.getElementById('inputField');
	const inputFieldJQ = $('#inputField');
	
	const textContent = inputFieldJQ.val();
	const cursorPosition = inputField.selectionEnd;

	var linesTillCursor = 1; // line numbering starts with 1
	var lastLineFeed = -1; // fixes first column being 0 for first line 
	for (var i = 0; i < cursorPosition; i++)
	{
		if (textContent.charCodeAt(i) == 10) // \n
		{
			linesTillCursor++;
			lastLineFeed = i;
		}
	}
	
	$('#textPosition').text
	(
		'Ln '
		+ linesTillCursor
		+ ', Col '
		+ (cursorPosition - lastLineFeed)
	);
}

function saveMarkup()
{
	const markupText = getInputText();
	var contributionId;
	Spider.requestFromServer
	(
		{
			'request': 'saveMarkup',
			'markup': markupText,
			'user': _user
		}
	);
	
	const lines = parse(markupText)[1];
	var toCheck = [lines[0]];
	for (var i = 0; i < toCheck.length; i++)
	{
		console.log(toCheck[i]);
		for (var k in toCheck[i])
		{
			if (typeof toCheck[i][k] != 'function')
			{
				console.log('* ' + k + ' ' + toCheck[i][k]);
			}
		}
		console.log('-------------');
	}
	
	Spider.requestFromServer
	(
		{
			'request': 'saveSigns',
			'signs': JSON.stringify(lines),
			'user': _user
		},
		function()
		{
			showPreviousContributions(); // show newest contribution
		}
	);
	
	console.log('JSON.stringify(lines):');
	console.log(JSON.stringify(lines));
}

function initTextInput()
{
	$('#inputField')
	.keyup(notifyKey)
	.click(positionChange);
	
	$('#showPreviewButton')
	.click(showPreview);
	
	$('#saveButton')
	.click(saveMarkup);
}