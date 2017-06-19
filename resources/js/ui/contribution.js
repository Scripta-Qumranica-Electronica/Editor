function loadContribution(index)
{
	$('#inputField').val($('#contribution' + index).text());
}

function warnBeforeContributionDeletion(index)
{
	$('#reallyDeleteContribution' + index).toggle();
}

function deleteContribution(id)
{
	requestFromServer
	(
		{
			'request': 'deleteContribution',
			'user': _user,
			'contributionId': id
		},
		function(data)
		{
			$('#contributionContainer' + id).remove();
			
			if ($('#contributionsList').children('div').length == 0)
			{
				$('#contributionsList')
				.append($('#noContributionsYet'));
			}
		}
	);
}

function showContribution(contribution)
{
	const id = contribution[0];
	const time = contribution[1];
	const markupText = contribution[2];
	
	const timeSpan =
	$('<span></span>')
	.attr('id', 'contributionTime' + id)
	.text(time);
	
	const contributionDiv =
	$('<div></div>')
	.attr('id', 'contribution' + id)
	.addClass('greyBordered')
	.addClass('scrollable')
	.addClass('protectedLineBreaks')
	.addClass('contribution')
	.text(markupText);
	
	const loadButton =
	$('<button></button>')
	.attr('id', 'loadContribution' + id)
	.text('Load')
	.click(function(event)
	{
		loadContribution(id);
	});
	
	const deleteButton =
	$('<button></button>')
	.attr('id', 'deleteContribution' + id)
	.text('Delete')
	.click(function(event)
	{
		warnBeforeContributionDeletion(id);
	});
	
	const reallyDeleteButton =
	$('<button></button>')
	.attr('id', 'reallyDeleteContribution' + id)
	.addClass('hidden')
	.addClass('warning')
	.text('Really delete')
	.click(function(event)
	{
		deleteContribution(id);
	});
	
	const hr =
	$('<hr>')
	.addClass('discreetLine');
	
	const contributionContainer =
	$('<div></div>')
	.attr('id', 'contributionContainer' + id)
	.append(timeSpan)
	.append(contributionDiv)
	.append(loadButton)
	.append(deleteButton)
	.append(reallyDeleteButton)
	.append(hr);
	
	$('#contributionsList')
	.append(contributionContainer);
}

function showPreviousContributions()
{
	requestFromServer
	(
		{
			'request': 'getAllContributions',
			'user': _user
		},
		function(data) // show all contributions, from most current to oldest
		{
			$('#hidePanel')
			.append($('#noContributionsYet')); // avoids deletion
			
			$('#contributionsList')
			.empty();
			
			const contributions = JSON.parse
			(
				data.replace(/\n/g, '\\n')
			);
			for (var i = contributions.length - 1; i >= 0; i--)
			{
				showContribution(contributions[i]);
			}
			
			if (contributions.length == 0)
			{
				$('#contributionsList')
				.append($('#noContributionsYet'));
			}
		}
	);
}