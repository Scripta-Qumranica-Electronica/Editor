// TODO better name space in CSS (less 'wysiwyg')

function addFragmentName(name)
{
	$('<span></span>') // TODO id?
	.attr('contentEditable', 'true') // TODO worth the trouble?
	.addClass('fragmentName')
	.text(name)
	.appendTo('#wysiwygContainer');
}

function addWysiwygLine(number) // TODO name
{
	const line =
	$('<tr></tr>')
	.addClass('line')
	.appendTo('#wysiwygContainer');
	
	$('<td></td>')
	.attr('id', 'lineNumber' + number)
	.addClass('wysiwygTextLineNumber')
	.text(number)
	.appendTo(line);

	$('<td></td>')
	.attr('id', 'rightMargin' + number)
	.attr('contentEditable', 'true')
	.addClass('lineSection')
	.addClass('coyBottomBorder')
	.appendTo(line);

	$('<td></td>')
	.attr('id', 'regularLinePart' + number)
	.attr('contentEditable', 'true')
	.addClass('lineSection')
	.addClass('normalBottomBorder')
	.appendTo(line);
	
	$('<td></td>')
	.attr('id', 'leftMargin' + number)
	.attr('contentEditable', 'true')
	.addClass('lineSection')
	.addClass('coyBottomBorder')
	.appendTo(line);
}

function addSign(sign, attributes, lineNumber, iAlternative, iSign)
{
	var span = $('<span></span');
	span.attr('id', 'span' + iAlternative + '_' + iSign);
	
	const classList = [];
	
	/** TODO remaining attributes
	 * alternative (6.1, 7, 9)	-> TODO written behind each other? just mark signs with alternatives?
	 * vocalization (8)			-> TODO
	 */
	
	// chapter 2 & 3
	if (attributes['signType'] == null) // letter
	{
		span.text(sign);
		
		const w = attributes['width'];
		if (w != null
		&&  w != 1)
		{
			span.css
			({
				'font-size': Math.ceil(14 * w) + 'px'
			});
		}
	}
	else // not a letter
	{
		sign = _signType2Visualisation[attributes['signType']];
		if (sign == null)
		{
			sign = '?';
		}
		else
		{
			span.attr('title', 'Sign type: ' + attributes['signType']); // tooltip			
			
			if (attributes['width'] != null) // TODO get rid of fractional width?
			{
				var markers = sign;
				for (var iSpace = 1; iSpace < Math.floor(attributes['width']); iSpace++)
				{
					markers += sign;
				}
				sign = markers;
				
				span
				.text(markers)
				.css
				({
					'font-size': Math.ceil((14 * attributes['width']) / markers.length) + 'px'
				});
			}
		}
	}
	
	var destination;
	if (attributes['position'] == null) // chapter 5
	{
		destination = $('#regularLinePart' + lineNumber);
	}
	else // TODO stacking positions
	{
		switch (attributes['position'])
		{
			case 'aboveLine':
			{
				span.html('<sup>' + span.html() + '</sup>');
				destination = $('#regularLinePart' + lineNumber);
			}
			break;
			
			case 'belowLine':
			{
				span.html('<sub>' + span.html() + '</sub>');
				destination = $('#regularLinePart' + lineNumber);
			}
			break;
			
			case 'leftMargin':
			{
				destination = $('#leftMargin' + lineNumber);
			}
			break;
			
			case 'rightMargin':
			{
				destination = $('#rightMargin' + lineNumber);
			}
			break;
		}
	}
	span.appendTo(destination);
	
	
	if ((attributes['retraced']) == 'true') // 6.2
	{
		classList.push('retraced');
	}
	
	if ((attributes['damaged']) != null) // 9
	{
		if ((attributes['damaged']) == 'ambiguous')
		{
			span.text(span.text() + '\u05af');
		}
		else if ((attributes['damaged']) == 'clear')
		{
			span.text(span.text() + '\u05c4');
		}
	}
	
	if ((attributes['reconstructed']) == 'true') // 10
	{
		classList.push('reconstructed');
	}
	
	if ((attributes['corrected']) != null) // 11
	{
		classList.push('corrected'); // TODO differentiate by different corrections?
	}
	
	if ((attributes['suggested']) != null) // 13.1
	{
		classList.push('suggested');
	}
	
	if ((attributes['comment']) != null) // 13.2
	{
		span.attr('title', 'Comment: ' + attributes['comment']);
	}
	
	for (var i in classList)
	{
		span.addClass(classList[i]);
	}
	
	span.dblclick(function(event)
	{
		$('#wysiwygContainer').appendTo('#hidePanel');
		$('#singleSignContainer').appendTo('#WysiwygPanel');
		
		displaySingleSignSpan(event.target['id'], _model);
	});
}

function displayModel()
{
	var sign;
	var attributes;
	var lineNumber;
	
	var highestLineIndex = 0;
	
	for (var iAlternative in _model)
	{
		for (var iSign in _model[iAlternative]) // TODO dont display alternatives in a row
		{
			sign = _model[iAlternative][iSign]['sign'];
			if (sign == null)
			{
				sign = '?';
			}
			
			attributes = {};
			for (var a in _model[iAlternative][iSign])
			{
				if (a != 'sign'
				&&  a != 'line')
				{
					attributes[a] = _model[iAlternative][iSign][a];
				}
			}
			
			lineNumber = _model[iAlternative][iSign]['line'];
			if (lineNumber == null)
			{
				lineNumber = 1;
			}
			while (lineNumber > highestLineIndex)
			{
				addWysiwygLine(highestLineIndex + 1);
				highestLineIndex++;
			}

			addSign
			(
				sign,
				attributes,
				lineNumber,
				iAlternative,
				iSign
			);
		}
	}
}

// TODO add context menus based on example of fragmentPuzzle.js

var _model;
var _signType2Visualisation;

function initWysiwygEditor()
{
	$('#wysiwygContainer').empty(); // TODO move it into displayModel(), with addFragmentName() afterwards
	
	addFragmentName('Frag. 3');
	
	const json = // TODO remove line layer in general, cover it by attribute
	'[' +
	'[{"sign": "ע", "width": 1, "line": 1}],' +
	'[{"sign": "ך", "width": 1, "position": "leftMargin", "line": 1}],' +
	'[{"sign": "ט", "width": 1, "line": 2, "comment": "i am pretty sure"}],' +
	'[{"signType": "vacat", "width": 3.9, "line": 3}],' +
	'[{"signType": "damage", "width": 4, "line": 4}],' +
	'[{"sign": "ט", "width": 1, "line": 4, "position": "aboveLine"}],' +
	'[{"sign": "ט", "width": 1, "line": 4, "position": "belowLine"}],' +
	'[{"sign": "ם", "width": 1, "line": 5, "reconstructed": "true", "retraced": "true"}],' +
	'[{"sign": "ט", "width": 1, "line": 5, "damaged": "ambiguous"}],' +
	'[{"sign": "ט", "width": 1, "line": 5, "damaged": "clear"}],' +
	'[{"sign": "ט", "width": 1, "line": 5, "corrected": "overwritten"}],' +
	'[{"sign": "ט", "width": 1, "line": 5, "position": "leftMargin"}],' +
	'[{"sign": "ט", "width": 1, "line": 5, "position": "leftMargin", "suggested": "true", "comment": "i am pretty sure"}]' +
	']';
	
	_model = JSON.parse
	(
		json.replace(/\n/g, '\\n')
	);
	
	_signType2Visualisation =
	{
		'space':			' ',
		'possibleVacat':	'.',
		'vacat':			'_',
		'damage':			'#',
		'blankLine':		'¬',
		'paragraphMarker':	'¶',
		'lacuna':			'?'
	}
	
	displayModel();

	



}