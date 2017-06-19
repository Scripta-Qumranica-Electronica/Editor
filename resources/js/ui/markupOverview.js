function toggleMarkupDescription(id)
{
	const markupSwitch = $('#' + id);

	if (markupSwitch.text().charAt(1) == '+')
	{
		const previousWidth = markupSwitch.width();
		markupSwitch.html('\&nbsp;-\&nbsp;');
		markupSwitch.css
		({
			'min-width': previousWidth
		});
	}
	else
	{
		markupSwitch.html('\&nbsp;+\&nbsp;');
	}
	
	$('#' + id.replace('Switch', 'Explanation')).toggle();
}

function searchMarkup()
{
	const field = $('#searchMarkupField');
	const searchText = field.val().toLowerCase();
	
	const explanations = $('.explanation');
	var switchButton;
	
	for (var i = 0; i < explanations.length; i++)
	{
		switchButton = $('#' + explanations[i]['id'].replace('Explanation', 'Switch'));
		
		if (switchButton.text().charAt(1) == '+') // not open yet, open if string found
		{
			if (explanations[i].innerHTML.toLowerCase().indexOf(searchText) != -1)
			{
				toggleMarkupDescription(switchButton.attr('id'));
			}
		}
		else // already open, close if string not found
		{
			if (explanations[i].innerHTML.toLowerCase().indexOf(searchText) == -1)
			{
				toggleMarkupDescription(switchButton.attr('id'));
			}
		}
	}
}

function initMarkupOverview()
{
	$('#searchMarkupButton').click(searchMarkup);
	
	const overviewList =
	[
	 	[
	 	 	'introduction',
	 	 	'Introduction',
	 	 	'\n' +
	 	 	'This editor allows to enter text and markup into the SQE database.\n' +
	 	 	'At the upper left you can login to save and access your data.\n' +
	 	 	'The left side also offers customizable quick markup.\n' +
	 	 	'It allows you add your favourite markup commands quickly.\n' +
	 	 	'\n' +
	 	 	'Image tab: View an image from the IAA or your local harddisk.\n' +
	 	 	'Input tab: Enter / paste your texts and add markup.\n' +
	 	 	'They will be interpreted and saved when pressing the button below.\n' +
	 	 	'Preview tab: Shows the interpretation of the markup.\n' +
	 	 	'Discussion tab: When logged in, you can add comments.\n' +
	 	 	'If you are not, you can still read them - they are public.\n' +
	 	 	'Contributions tab: When logged in, it shows your saved texts.\n'
	 	],
	 	[
	 	 	'general',
	 	 	'General',
	 	 	'\n' +
	 	 	'Letters can be entered directly: אב\n' +
	 	 	'Sign (!) specific comment: א&<That\'s weird.>\n' +
	 	 	'\n' +
	 	 	'Brackets for commands which need them: {} or <>\n' +
	 	 	'Both versions are equivalent, choose freely.\n' +
	 	 	'The following entries use <> brackets.'
	 	],
	 	[
	 	 	'space',
	 	 	'Space',
	 	 	'\n' +
	 	 	'Vacat: === or =3.5 or ===.5 or /vacat<3.5>\n' +
	 	 	'Vacat which might be wider: =>3.5\n' +
	 	 	'Vacat or space: ?=3.5 or /possibleVacat<3.5>\n' +
	 	 	'Space:     (3 spaces) or /space<3.5>\n' +
	 	 	'Material damage: ### or #3.5 or /damage<3.5>\n' +
	 	 	'Blank line:  ₪ or  ∞ (each with 1 space ahead) or /blankLine<>\n' +
	 	 	'Paragraph marker: =₪ or =∞ or /vacat<₪> or /vacat<∞>\n' +
	 	 	'\n' +
	 	 	'You can use any positive number to define length.'
	 	],
	 	[
	 	 	'position',
	 	 	'Position',
	 	 	'\n' +
	 	 	'Above line: ^א or ^<אב> or /aboveLine<אב>\n' +
	 	 	'Below line: _א or _<אב> or /belowLine<אב>\n' +
	 	 	'Left margin: «א or «<אב> or /leftMargin<אב>\n' +
	 	 	'Right margin: »א or »<אב> or /rightMargin<אב>\n' +
	 	 	'\n' +
	 	 	'Brackets are necessary for more than one sign.\n' +
	 	 	'You can stack two position tags.'
	 	],
	 	[
	 	 	'doubleMeaning',
	 	 	'Alternatives',
	 	 	'\n' +
	 	 	'Multiple possible chars: <א,ב>\n' +
	 	 	'Context letter that could be final (or vice versa): $כ or $ך'
	 	],
	 	[
	 	 	'vowelsMetasigns',
	 	 	'Vowels & metasigns',
	 	 	'\n' +
	 	 	'Tiberian: ~0\n' +
	 	 	'Babylonian: ~1\n' +
	 	 	'Palestinian: ~2\n' +
	 	 	'\n' +
	 	 	'The chosen vocalization system applies to all signs till changed.\n' +
	 	 	'Specific forms will be supported later.\n' +
	 	 	'Scribe\'s meta-signs will also be supported later.'
	 	],
	 	[
	 	 	'readability',
	 	 	'Readability',
	 	 	'\n' +
	 	 	'Completely unreadable: °\n' +
	 	 	'Unclear reading: °<א,ב> or /damaged<א,ב>\n' +
	 	 	'Unclear, destroyed parts specified: °<1:0,א,ב> or /damaged<1:0,1:2,א,ב>\n' +
	 	 	'\n' +
	 	 	'Damaged but clear (traditional way): טׄ (dot above)\n' +
	 	 	'Damaged and unclear (traditional way): ח֯ (masora)'
	 	],
	 	[
	 	 	'reconstruction',
	 	 	'Reconstruction',
	 	 	'\n' +
	 	 	'Reconstructed letters: [אב]\n' +
	 	 	'Lacunae: [°°°] or [3°]\n' +
	 	 	'\n' +
	 	 	'You can mix letters and lacunae within [] brackets.'
	 	],
	 	[
	 	 	'correction',
	 	 	'Correction',
	 	 	'\n' +
	 	 	'Correction: !<א,ב> or /corrected<א,ב>\n' +
	 	 	'Horizontal line through: !-א or !-<א,ב> or /horizonalLine<א,ב>\n' +
	 	 	'Diagonal left line through: !/א or !/<א,ב> or /diagonalLeftLine<א,ב>\n' +
	 	 	'Diagonal right line through: !\א or !\<א,ב> or /diagonalRightLine<א,ב>\n' +
	 	 	'Dot below: !.א or !.<א,ב> or /dotBelow<א,ב>\n' +
	 	 	'Dot above: !˙א or !˙<א,ב> or /dotAbove<א,ב>\n' +
	 	 	'Line below: !_א or !_<א,ב> or /lineBelow<א,ב>\n' +
	 	 	'Line above: !‾א or !‾<א,ב> or /lineAbove<א,ב>\n' +
	 	 	'Box drawn: !0א or !0<א,ב> or /boxed<א,ב>\n' +
	 	 	'Erasure: !0א or !0<א,ב> or /boxed<א,ב>\n' +
	 	 	'\n' +
	 	 	'The second letter (if existent) marks the replacement.\n' +
	 	 	'You can stack multiple corrections.'
	 	],
	 	[
	 	 	'scribalHand',
	 	 	'Scribal hand',
	 	 	'\n' +
	 	 	'Scribal number x: §1 or scribalHand<1>\n' +
	 	 	'The default scribe is 0.\n' +
	 	 	'If there is only one, there is usually no need for § .'
	 	],
	 	[
	 	 	'conjecture',
	 	 	'Conjecture',
	 	 	'\n' +
	 	 	'Scribe wrote letter, scholar assumes another: *<א,ב> or /conjecture<א,ב>\n' +
	 	 	'Scholar assumes forgotten letter: *<,ב> or /conjecture<,ב>\n' +
	 	 	'Scholar assumes letter should be skipped: *<א,> or /conjecture<א,>'
	 	],
	 	[
	 	 	'manuscriptStructure',
	 	 	'Manuscript structure',
	 	 	'\n' +
	 	 	'Set manuscript: @M=1QS or /manuscript<1QS>\n' +
	 	 	'Set fragment or column: @F=10 or /fragment<10> or /column<10> or /chapter<10>\n' +
	 	 	'Set line or verse: @L=3 or @L=3a or /line<3a> or /verse<3a>\n' +
	 	 	'Start auto line numbering: @AL or /startAutomaticLineNumbering\n' +
	 	 	'Stop auto line numbering: @NAL or /stopAutomaticLineNumbering\n' +
	 	 	'\n' +
	 	 	'Automatic line numbering is activated by default.'
	 	]
	];
	
	var hr, toggle, name, explanation;
	const overviewDiv = $('#markupOverview');
	
	for (var i in overviewList)
	{
		hr =
		$('<hr>')
		.addClass('discreetLine');
		
		toggle =
		$('<span></span>')
		.addClass('bordered')
		.addClass('explanationSwitch')
		.attr('id', overviewList[i][0] + 'Switch')
		.html('\&nbsp;+\&nbsp;');
		
		name =
		$('<span></span>')
		.addClass('bold')
		.text(' ' + overviewList[i][1]);
		
		explanation =
		$('<div></div>')
		.addClass('hidden')
		.addClass('protectedLineBreaks')
		.addClass('explanation')
		.attr('id', overviewList[i][0] + 'Explanation')
		.text(overviewList[i][2])
		
		overviewDiv
		.append(hr)
		.append(toggle)
		.append(name)
		.append(explanation);
	}
	
	$('.explanationSwitch').click
	(
		function(event)
		{
			toggleMarkupDescription(event.currentTarget.id);
		}
	);
}