var _doMouseMove = false;
var _startX, _startY;

function moveWithMouse(event)
{
	$('#imageDisplay')
	.offset
	({
		left: _startX + event.pageX,
		top:  _startY + event.pageY
	});
}

function toggleMouseMove(event)
{
	if (_doMouseMove)
	{
		$('#imageField')
		.off('mousemove');
		
		_doMouseMove = false;
	}
	else // start mouse move
	{
		const dOffset = $('#imageDisplay').offset();
		_startX = dOffset.left - event.pageX;
		_startY = dOffset.top  - event.pageY;
		
		$('#imageField')
		.mousemove(moveWithMouse);

		_doMouseMove = true;
	}
}

const _zoomFactors =
[
	0.03, 0.04, 0.06, 0.1, 0.125, 0.15,  0.25,  0.35,  0.5,   0.65,
	1,
	1.5 ,  2  ,  3  , 4  , 6    , 8   , 11   , 16   , 23   , 32
];

function zoom(zoomIndex)
{
	const f = $('#imageField');
	const d = $('#imageDisplay');
	
	/** move to top left and center within field */
	
	const tX = 0.5 * (f.width() - d.width());
	const tY = 0.5 * (f.height() - d.height());
	
	
	/** apply both movement (translation) and zoom */
	
	const z = _zoomFactors[zoomIndex];
	
	d
	.attr('zoom', zoomIndex)
	.css
	({
		'transform': 'translate(' + tX + 'px,' + tY + 'px) scale(' + z + ')'
	});
	
	$('#zoomFactor').text((z * 100) + '%');
}

function zoomIn()
{
	const zoomIndex = 1 * $('#imageDisplay').attr('zoom');
	if (zoomIndex < _zoomFactors.length - 1)
	{
		zoom(zoomIndex + 1);
	}
}

function zoomOriginalSize()
{
	zoom(Math.round((_zoomFactors.length - 1) / 2));
}

function zoomOut()
{
	const zoomIndex = 1 * $('#imageDisplay').attr('zoom');
	if (zoomIndex > 0)
	{
		zoom(zoomIndex - 1);
	}
}

function fitImageToField()
{
	const imageField = $('#imageField');
	const fw = imageField.width();
	const fh = imageField.height();
	console.log('fw ' + fw + '; fh ' + fh);
	
	const imageDisplay = $('#imageDisplay');
	const iw = imageDisplay.width();
	const ih = imageDisplay.height();
	console.log('iw ' + iw + '; ih ' + ih);
	
	var zoomIndex = 0;
	for (; zoomIndex < _zoomFactors.length; zoomIndex++)
	{
		if (iw * _zoomFactors[zoomIndex] > fw
		||  ih * _zoomFactors[zoomIndex] > fh)
		{
			break; // found lowest zoom factor where image doesn't fit into field 
		}
	}
	if (zoomIndex > 0) // not extremely high amount of pixels
	{
		zoomIndex--;
	}
	
	zoom(zoomIndex);
}

function addImage(source)
{
	const d = $('#imageDisplay');
	d.attr('src', source);
	
    if (d[0].width != 0) // valid image
    {
    	const f = $('#imageField');
    	if (d.width() > f.width()
    	||  d.height() > f.height())
    	{
    		fitImageToField();
    	}
    	else
    	{
    		zoomOriginalSize();
    	}
    }
}

function addIIIFImage()
{
	var id = '' + $('#iiifNumber').val();

	if (id.length > 2
	&&  id.toLowerCase().substring(0, 3) == 'dss') // e.g. DSS16480
	{
		id = id.substring(3); // remove this prefix
	}
	
	if (id <= 0)
	{
		return;
	}
	
	Spider.requestFromServer
	(
		{
			'request': 'getManifest',
			'url': 'http://iiif.nli.org.il/IIIF/DOCID/DSS' + id + '/manifest'
		},
		function(data)
		{
			const response = JSON.parse(data);
			
			if (response != null)
			{
				const imageURL = response['sequences'][0]['canvases'][0]['images'][0]['resource']['@id'];
				addImage(imageURL);
			}
		}
	);
}

function addIAAPreviewImage()
{
	var id = '' + $('#bNumber').val();
	
	if (id.length > 1
	&&  (id.charCodeAt(0) == 66 || id.charCodeAt(0) == 98)
	&&  id.charCodeAt(1) == 45) // B number starting with 'B-' or 'b-' 
	{
		id = id.substring(2); // remove this prefix
	}
	
	if (id <= 0)
	{
		return;
	}
	
	const imageLink = imageMap[id];
	
	if (imageLink == null)
	{
		return;	
	}
	else
	{
		addImage(imageLink);
	}
}

function addLocalImage()
{
	var fileName = $('#localImage').val();
	if (fileName == null)
	{
		return;
	}
	
	addImage('img/' + fileName);
}

function showImageSelection()
{
	const d = $('#imageDisplay');
	const f = $('#imageField');
	if (d.width() > f.width()
	||  d.height() > f.height())
	{
		fitImageToField();
	}
	
	$('#imageSelection').show();
	$('#imageControls').hide();
}

function hideImageSelection()
{
	$('#imageSelection').hide();
	$('#imageControls').show();
	
	fitImageToField();
}

function toggleFilter(filter)
{
	const d = $('#imageDisplay');
	
	var currentFilters = d.css('filter');
	if (currentFilters == 'none')
	{
		currentFilters = '';
	}
	
	if (currentFilters.indexOf(filter) == -1) // filter not applied yet => add it
	{
		d.css
		({
			'filter': currentFilters + filter + ' ' 
		});
	}
	else // already applied => remove it
	{
		d.css
		({
			'filter': currentFilters.replace(filter, '')
		});
	}
}

function initImages()
{
	$('#iiifNumber')
	.val('')
	.keyup(addIIIFImage);
	
	$('#bNumber')
	.val('')
	.keyup(addIAAPreviewImage);
	
	$('#localImage')
	.val('')
	.keyup(addLocalImage);
	
	$('#confirmImageSelectionButton').click
	(
		function()
		{
			const imageDisplay = $('#imageDisplay');
			imageDisplay.attr('previousSrc', imageDisplay.attr('src')); // to be able to cancel afterwards
			
			hideImageSelection();
		}
	);
	$('#cancelImageSelectionButton').click
	(
		function()
		{
			const imageDisplay = $('#imageDisplay');
			imageDisplay.attr('src', imageDisplay.attr('previousSrc'));
			
			hideImageSelection();
		}
	);
	
	$('#otherImageButton')
	.click(showImageSelection);
	
	$('#imageDisplay')
	.attr('previousSrc', '') // cancel before any confirmation leads to empty image
	.click(function(event)
	{
		toggleMouseMove(event)
	});
	
	$('#zoomInButton')
	.click(zoomIn);
	
	$('#zoomOutButton')
	.click(zoomOut);
	
	
	/** filter buttons, inspired by https://developer.mozilla.org/de/docs/Web/CSS/filter */
	
	$('#contrastButton')
	.click(function() { toggleFilter('contrast(300%)') });
	
	$('#grayscaleButton')
	.click(function() { toggleFilter('grayscale(100%)') });
	
	$('#hueRotate90Button')
	.click(function() { toggleFilter('hue-rotate(90deg)') });
	
	$('#hueRotate180Button')
	.click(function() { toggleFilter('hue-rotate(180deg)') });
	
	$('#hueRotate270Button')
	.click(function() { toggleFilter('hue-rotate(270deg)') });
	
	$('#invertButton')
	.click(function() { toggleFilter('invert(100%)') });
	
	$('#saturationButton')
	.click(function() { toggleFilter('saturate(300%)') });
}