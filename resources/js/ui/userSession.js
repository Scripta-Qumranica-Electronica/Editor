var _user = '';

function login()
{
	requestFromServer
	(
		{
			'request': 'login',
			'user': $('#userName').val(),
			'password': $('#userPassword').val()
		},
		function(data)
		{
			if (data == 1)
			{
				_user = $('#userName').val();
				
				$('#currentUser').text('Welcome, ' + $('#userName').val() + '.');
				$('#changeUser').text('Change');
				$('#logout').show();
				
				toggleUserChange();
				
				$('#loginBeforeSaving').hide();
				$('#saveButton').show();
				
				$('#loginBeforeCommenting').hide();
				$('#sendComment').show();
				
				showPreviousContributions();
				
				$('#hidePanel')
				.append($('#contributionsOnlyWhenLoggedIn'))
				.append($('#resultsOnlyWhenLoggedIn'));
				
				// showResults(); // TODO add when done
			}
		}
	);
}

function logout()
{
	requestFromServer
	(
		{
			'request': 'logout',
			'user': $('#userName').val()
		},
		function(data)
		{
			if (data == 1)
			{
				$('#currentUser').text('Not logged in.');
				$('#changeUser').text('Login');
				$('#logout').hide();
				
				_user = '';
				
				$('#loginBeforeSaving').show();
				$('#saveButton').hide();
				
				$('#loginBeforeCommenting').show();
				$('#sendComment').hide();
				
				$('#hidePanel')
				.append($('#noContributionsYet'));
				
				$('#contributionsList')
				.empty()
				.append($('#contributionsOnlyWhenLoggedIn'));
				
				$('#resultsContainer')
				.empty()
				.append($('#resultsOnlyWhenLoggedIn'))
			}
		}
	);
}

function toggleUserChange()
{
	$('#changeUserPanel').toggle();
	
	$('#userPassword').val(''); // for security
}

function initLoginLogout()
{
	
	$('#changeUser')
	.click(toggleUserChange);
	
	$('#confirmUserChange')
	.click(login);
	
	$('#cancelUserChange')
	.click(toggleUserChange);
	
	$('#logout')
	.click(logout);
	
	$('#userName,#userPassword')
	.keydown(function(e)
	{
		if(e.keyCode == 13)
	    {
			$('#confirmUserChange').trigger('click');
	    }
	});
}