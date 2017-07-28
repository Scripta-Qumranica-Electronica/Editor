function showResults() // TODO tooltips for letters
{
	Spider.requestFromServer
	(
		{
			'request': 'getAllResults',
			'user': _user
		},
		function(data)
		{
			const lines = []; // TODO

			const wrapper = $('#resultLinesWrapper');
			wrapper.empty();
			
			var line;
			var element;
			var span;
			var extraSpan;
			
			for (var iLine = 0; iLine < lines.length; iLine++)
			{
				line = addLine(wrapper, lineNumbers[iLine]); // text displaying part
				
				for (var iAlternative in lines[iLine])
				{
					for (var iSign in lines[iLine][iAlternative])
					{
						element = lines[iLine][iAlternative][iSign];
						
						if (iSign != 0)
						{
							span =
							$('<span></span>')
							.addClass('alternative')
							.text('|');
							
							line.append(span);
						}
						
						span = $('<span></span>');
						
						switch (element['sign']) // TODO replace font-size with font-stretch / transform:scale / svg scaling (on the long run)
						{
							// 3
							case 'space':
								
								createMarkerSpan('.', element['width'], span);
								
							break;
							
							// 3
							case 'vacat':
								
								createMarkerSpan('v', element['width'], span);
								
							break;
							
							// 3
							case 'damage':
								
								createMarkerSpan('x', element['width'], span);
								
							break;
							
							// 3
							case 'paragraphMarker':
							
								createMarkerSpan('¶', 1, span);
								
							break;
							
							// 10
							case 'lacuna':
								
								createMarkerSpan('?', element['width'], span);
								
							break;
							
							default: // TODO refine
								
								span
								.text(element['sign'])
								.css
								({
									'font-size': Math.ceil(14 * element['width']) + 'px'
								});
							
								// 5
								if (element['position'] == 'aboveLine')
								{
									extraSpan = $('<sup>' + element['sign'] + '</sup>');
									
									span
									.text('')
									.append(extraSpan);
								}
								else if (element['position'] == 'belowLine')
								{
									extraSpan = $('<sub>' + element['sign'] + '</sub>');
									
									span
									.text('')
									.append(extraSpan);
								}
								else if (element['position'] == 'leftMargin')
								{
									extraSpan =
									$('<span>' + element['sign'] + '</span>')
									.css
									({
									   'float': 'left',
									   'border-right': '1px solid black',
									   'background-color': 'lightgrey'
									});
									
									span
									.text('')
									.append(extraSpan);
								}
								else if (element['position'] == 'rightMargin')
								{
									extraSpan =
									$('<span>' + element['sign'] + '</span>')
									.css
									({
									   'float': 'right',
									   'border-left': '1px solid black',
									   'background-color': 'lightgrey'
									});
									
									span
									.text('')
									.append(extraSpan);
								}
								
								// 6.2
								if (element['retraced'] == 'true')
								{
									span.css
									({
										'font-weight': 'bold'
									});
								}
								
								// 9
								if (element['damagedAreas'] != null
								&&  element['damagedAreas'].length > 0)
								{
									extraSpan =
									$('<span>' + element['damagedAreas'] + '</span>')
									.addClass('unobstrusive')
									.css
									({
									   'font-size': '7px'
									});
									
									span
									.append(extraSpan);
								}
								
								// 10
								if (element['reconstructed'] == 'true')
								{
									span.css
									({
										'color': 'darkblue'
									});
								}
								
								// 13.1
								if (element['suggested'] != null)
								{
									extraSpan =
									$('<span>' + element['suggested'] + '</span>')
									.css
									({
										'color': 'darkred'
									});
									
									span
									.append(extraSpan);
								}
								
							break;
						}
						
						line.append(span);
					}
				}
			}
		}
	);
}

function initLoad()
{
	$('#confirmLoad').click(function()
	{
		const scroll = $('#scrollChoice').val();
		const column = $('#columnChoice').val();
		
		Spider.requestFromServer
		(
			{
				'request': 'load',
				'scroll' : scroll,
				'column' : column
			},
			function(data)
			{
				if (data == 0)
				{
					return;
				}
				
				Spider.notifyChangedText(JSON.parse(data));
			}
		);
	});
}