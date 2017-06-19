const _showServerErrors = true;

function requestFromServer(parameters, onSuccess)
{
	parameters['timeStamp'] = Date.now(); // TODO replace now() entries in DB bei this time, retry connection regularly
	
	$.post
	(
		'cgi-bin/server.pl', // connection to perl works only if same server ('same origin')
		parameters
	)
	.done
	(
		function(data)
		{
			console.log('success at ' + parameters['request'] + ':');
			console.log(data);
			
			if (onSuccess != null)
			{
				onSuccess(data);
			}
		}
	)
	.fail
	(
		function(data)
		{
			if (_showServerErrors)
			{
				console.log('failure:');
				console.log(data);
			}
		}
	);
}

function initServerConnection()
{
	$(document).ajaxError // log server connection errors to console
	(
		function(event, request, settings)
		{
			if (_showServerErrors)
			{
				console.log('Connection error');
				console.log('* target: ' + settings.url);
				console.log('* parameters: ' + settings.data);
				console.log('* error type: ' + event.type);
				console.log('* request status: ' + request.status + ' (' + request.statusText + ')');
			}
		}
	);
}