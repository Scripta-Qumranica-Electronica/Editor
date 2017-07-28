function showComment(author, text, time)
{
	$('#commentBox')
	.before
	(
		$('<span></span>')
		.addClass('bold')
		.text(author)
	)
	.before
	(
		$('<span></span>')
		.text(' (' + time + '): ')
	)
	.before
	(
		$('<div></div>')
		.addClass('protectedLineBreaks')
		.text(text)
	)
	.before
	(
		$('<hr>')
		.addClass('discreetLine')
	);
}

function showPreviousComments()
{
	Spider.requestFromServer
	(
		{
			'request': 'getAllComments'
		},
		function(data)
		{
			const comments = JSON.parse
			(
				data.replace(/\n/g, '\\n')
			);
			for (var i in comments)
			{
				showComment
				(
					comments[i]['name'   ],
					comments[i]['comment'],
					comments[i]['time'   ]
				);
			}
		}
	);
}

function saveComment()
{
	const box = $('#commentBox');
	
	const text = box.val();
	if (text == '')
	{
		return;
	}
	
	Spider.requestFromServer
	(
		{
			'request': 'saveComment',
			'user': _user,
			'comment': text
		}
	);
	
	const displayedUser =
	(
		_user == ''	
		? 'Anonymous'
		: _user
	);
	showComment(displayedUser, text, 'this session');
	
	box.val('');
}

function initDiscussion()
{
	showPreviousComments();
	
	$('#sendComment').click(saveComment);
}