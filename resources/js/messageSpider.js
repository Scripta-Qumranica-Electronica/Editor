function Spider() // singleton central component communication system
{  
    if (typeof Spider.instance === 'object') // instance already exists
    {
        return Spider.instance;
    }
    
    this.doShowServerErrors = true;
}

Spider.prototype.requestFromServer = function(parameters, onSuccess)
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
			if (this.doShowServerErrors)
			{
				console.log('failure:');
				console.log(data);
			}
		}
	);
}

Spider.prototype.doShowServerErrors = function(doShowServerErrors)
{
	this.doShowServerErrors = doShowServerErrors;
}

var Spider = new Spider();