/** TODO
 * enforce https via forward
 * 
 * on error show error message
 * on login forward to actual page, with session id
 * 
 */ 

$(document).ready(function()
{
	$('#notification')
	.hide();
	
	$('#confirm').click
	(
		function()
		{
			$.post
			(
				'cgi/server.pl', // connection to perl works only if same server ('same origin')
				{
					'request':	'login',
					'user':		$('#userNameInput').val(),
					'password': $('#passwordInput').val()
				}
			)
			.done
			(
				function(response)
				{
					console.log(response);
					
					if (response == 0)
					{
						$('#notification')
						.text('Invalid user and / or password.')
						.show();
					}
					else if (response > 0)
					{
						window.location = 'comfyEditor.html?session=' + response;
					}
				}
			)
			.fail
			(
				function(response)
				{
					$('#notification')
					.text('Could not connect to server.')
					.show();
					
					console.log(response);
				}
			);
		}
	);
});