function james2Ingo()
{
	var source = $('#transformationField').val();
	
	var start = source.indexOf('<p class="p1">') + 14;
	var end   = source.indexOf('</p>');
	const scrollAndFragment = source.substr(start, end - start);
	const fragmentStart = scrollAndFragment.indexOf('Fr');
	const scroll = scrollAndFragment.substr(0, fragmentStart - 1);
	const fragment = scrollAndFragment.substr(fragmentStart, scrollAndFragment.indexOf('(') - fragmentStart - 1);
	
	start = source.indexOf('<p dir="rtl" class="p5"');
	end   = source.lastIndexOf('</p>') + 4;
	
	source =
	source.substr(start, end - start)
	.replace(/p6/g, 'p5')
	.replace(/\n/g, '')
	.replace(/\t/g, '')
	.replace(/◦/g, '°')
	.replace(/<p dir="rtl" class="p5" id="/g, '')
	.replace(/<sup>/g, '/aboveLine{')
	.replace(/<\/sup>/g, '}');
	
	const lines = source.split('</p>');
	var signI;
	var isDamaged;
	var isReconstructed;
	
	const digit = /[0-9]/;
	const hebrewLetter = /[\u05d0-\u05ea]/;
	
	var result = '@M=' + scroll + '@F=' + fragment;
	
	for (var iLine = 0; iLine < lines.length - 1; iLine++) // ignore empty string at the end
	{
		lines[iLine] = lines[iLine]
		
		result += '@L=';
		
		signI = 0;
		while (signI < lines[iLine].length
		   &&  lines[iLine].charAt(signI).match(digit)) // get line number
		{
			result += lines[iLine].charAt(signI);
			signI++;
		}
		
		signI += 2; // jump over following ">
		
		isDamaged = false;
		while (signI < lines[iLine].length)
		{
			if (lines[iLine].indexOf('<span class="dam">', signI) == signI)
			{
				isDamaged = true;
				signI += 18;
			}
			else if (lines[iLine].indexOf('<span class="recon">', signI) == signI)
			{
				isReconstructed = true;
				result += '[';
				signI += 20;
			}
			else if (lines[iLine].indexOf('</span>', signI) == signI)
			{
				if (isDamaged)
				{
					isDamaged = false;
				}
				else if (isReconstructed)
				{
					isReconstructed = false;
					result += ']';
				}
				
				signI += 7;
			}
			else if (lines[iLine].charAt(signI).match(hebrewLetter))
			{
				result += lines[iLine].charAt(signI);
				if (isDamaged)
				{
					result += '\u05c4'; // 'damaged but clear' circle
				}
				
				signI++;
			}
			else
			{
				result += lines[iLine].charAt(signI);
				signI++;
			}
		}
		
		if (iLine < lines.length - 2) // not last nonempty line
		{
			result += '\n';
		}
	}
	
	$('#inputField').val(result);
}

function initTransformation()
{
	$('#transformationButton').click(james2Ingo);
}