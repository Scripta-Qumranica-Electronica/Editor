function activateTab(id)
{
	/** determine side */
	
	var side, otherSide;
	if (id.indexOf('Left') != -1)
	{
		side = 'Left';
		otherSide = 'Right';
	}
	else if (id.indexOf('Right') != -1)
	{
		side = 'Right';
		otherSide = 'Left';
	}
	else
	{
		return;
	}
	
	
	/** deactivate all tabs on this side, activate the chosen */
	
	const previouslyActiveTabs = $('#' + side + 'TabsContainer > .active');
	$('#' + side + 'TabsContainer > div').removeClass('active');
	
	$('#hidePanel').append($('#' + side + 'Panel > .frame'));
	$('#' + side + 'Panel').append($('#' + id.replace(side + 'Tab', '') + 'Panel'));
	$('#' + id).addClass('active');
	
	
	/** show the tab on the other side, if it's selected there (and invisible so far) */
	
	const previouslyActive =
	(
		previouslyActiveTabs.length > 0
		? previouslyActiveTabs[0]
		: null
	);
	
	if (previouslyActive != null
	&&  previouslyActive['id'] != id) // avoids endless recursion
	{
		const counterpart = $('#' + previouslyActive['id'].replace(side, otherSide));
		if (counterpart.hasClass('active')) // before same tab was selected for both sides
		{
			activateTab(counterpart.attr('id')); // show it on the other side
		}
	}
}

function initTabs()
{
	const leftTabs = $('#LeftTabsContainer');
	const rightTabs = $('#RightTabsContainer');
	
	const tabNames =
	[
	 	'Image',
	 	'Input',
	 	'Preview',
	 	'Overview',
	 	'Discussion',
	 	'Contributions',
	 	'Results',
	 	
	 	'Wysiwyg',
	 	'T'
	];
	for (var i in tabNames)
	{
		leftTabs.append
		(
			$('<div></div>')
			.attr('id', tabNames[i] + 'LeftTab')
			.addClass('greyBordered tab')
			.text(tabNames[i])
			.click(function(event) { activateTab(event.currentTarget.id) })
		);
		
		rightTabs.append
		(
			$('<div></div>')
			.attr('id', tabNames[i] + 'RightTab')
			.addClass('greyBordered tab')
			.text(tabNames[i])
			.click(function(event) { activateTab(event.currentTarget.id) })
		);
	}
	
	activateTab('ImageLeftTab');
	activateTab('InputRightTab');
}