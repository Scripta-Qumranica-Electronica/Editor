var _stack; // changes to signs during parsing process
var _singleSignStack; // changes that affect only the following sign
var _permanentStack; // changes that apply to the rest of the text or until changed again 

const Markup = function(input, output) // constructor
{
	this.input = input;
	this.output = output;
}

Markup.prototype.match = function(code) // test code vs. pattern 
{
	var foundInstance;
	const result = {};
	result.posChange = 0;
	
	for (var iSection in this.input)
	{
		if (this.input[iSection][0] == 'condition')
		{
			console.log('condition ' + this.input[iSection][1]);
			
			if (!eval(this.input[iSection][1])) // condition not met
			{
				console.log('not met');
				return false;
			}
			console.log('met');
		}
		else
		{
			if (code.search(this.input[iSection][1]) == 0)
			{
				foundInstance = code.match(this.input[iSection][1])[0]; // if regex is purely optional, result can be empty string
				console.log('found ' + this.input[iSection][1] + ': ' + foundInstance);
				
				this[this.input[iSection][0]] = foundInstance; // save matches
				
				code = code.substr(foundInstance.length);
				result.posChange += foundInstance.length;
			}
			else
			{
				return false; // some part not found => doesn't match
			}
		}
	}
	
	for (var iVar in this.output)
	{
		result[iVar] =
		(
			this.output[iVar].charAt(0) == '§'	
			? eval(this.output[iVar].substr(1)) // TODO eval problematic as soon as users can add custom code
			: this.output[iVar]
		);
		
		console.log('=> ' + iVar + ' ' + this.output[iVar] + ' ' + result[iVar]);
	}
	
	return result;
};


/** helper functions */

const correctionsReversed = {};

function combineShortCorrections(markup)
{
	var options = '';
	
	for (var iMarkup = 0; iMarkup < markup.length; iMarkup++)
	{
		if (iMarkup != 0)
		{
			options += '&';
		}
		
		options += correctionsReversed[markup.charAt(iMarkup)]; // e.g. lineBelow
	}
	
	return options;
}

function incrementLineNumber()
{
	if (Number.isInteger(1 * _lineNumber))
	{
		_lineNumber++;
	}
	else
	{
		var nonDigitIndex = -1;
		
		for (var i = 0; i < _lineNumber.length; i++)
		{
			if (_lineNumber.charCodeAt(i) < 48
			||  _lineNumber.charCodeAt(i) > 57) // not a digit
			{
				nonDigitIndex = i;
				
				break;
			}
		}
		
		if (nonDigitIndex == -1) // no number at begin
		{
			return; // no change
		}
		
		_lineNumber = (1 * _lineNumber.substr(0, nonDigitIndex)) + 1;
	}
}

function char2Unicode(char)
{
	if (char == null || char.length == null || char.length == 0)
	{
		return '';
	}
	
    var code = char.charCodeAt(0);
    var hexDigit;
    var codeHex = '';
    
    for (var i = 0; i < 4; i++)
    {
    	hexDigit = code % 16;
    	if (hexDigit > 9)
    	{
    		switch (hexDigit) // simple but reliable implementation
    		{
    			case 10: hexDigit = 'A'; break;
    			case 11: hexDigit = 'B'; break;
    			case 12: hexDigit = 'C'; break;
    			case 13: hexDigit = 'D'; break;
    			case 14: hexDigit = 'E'; break;
    			case 15: hexDigit = 'F'; break;
    		}
    	}
    	
    	codeHex = hexDigit + codeHex;
    	
    	code = Math.floor(code / 16); // shift right to remove extracted number
    }
    
    return '\\u' + codeHex;
}

function stackTop()
{
	if (_stack.length == 0)
	{
		return '';
	}
	
	return _stack[_stack.length - 1][0]; // e.g. position
}

function cloneArray(array)
{
	const copy = {};
	
	for (var key in array)
	{
		copy[key] = array[key];
	}
	
	return copy;
}


const bracketPairs = {};
var _posShort2Long; // needed for eval() later
const _vocalizationMap = {};

function definePatterns()
{
	/** brackets */
	
	// 2.6.1, 10.1
	const brackets = // each bracket sign should only be used once
	[
		['{', '}', true],
		['<', '>', true],
		['[', ']', false] // just for reconstruction
	];
	
	var oBracket = '';
	var cBracket = ''; 
	for (var i in brackets)
	{
		bracketPairs[brackets[i][0]] = brackets[i][1]; // e.g. { -> }
		bracketPairs[brackets[i][1]] = brackets[i][0]; // e.g. } -> {
		
		if (brackets[i][2]) // used for markup in general
		{
			if (oBracket.length > 0) // already added a bracket version
			{
				oBracket += '|';
				cBracket += '|';
			}

			oBracket += brackets[i][0]; // e.g. { or <
			cBracket += brackets[i][1]; // e.g. } or >
		}
	}
	oBracket = new RegExp(oBracket);
	cBracket = new RegExp(cBracket);
	
	
	/** helper patterns */

	const hebrewLetter = /[\u05d0-\u05ea]/;
	// TODO everything beside , and brackets ? exclude vocalized letters then
	// supposed vocalization system: tiberian
	
	const realNumberOptional = /\d*(\.\d+)?/;
	const realNumberMandatory = /\d+(\.\d+)?|\d*(\.\d+)/; 

	/* hebrew in unicode
	
	0591 .. 05ae		accents: etnahta .. zinor
	05af				asora
	05b0 .. 05c7		dots / interpunctations: sheva .. meteg .. qamats qatan
	05d0 .. 05ea		aleph .. tav (including final versions: kaf (05da), mem (05dd), nun (05df), pe (05e3), tsadi (05e5))
	
	fb1d				yod with hiriq
	fb1e				dot varika
	fb1f				ligature yod yod patah
	fb20				ayin (alternative)
	fb21 .. fb28		broad letters (including final mem fb26)
	fb29				plus (alternative)
	fb2a .. fb2b		shin with dot
	fb2c .. fb2d		shin with dot & dagesh
	fb2e .. fb30		aleph with patah / qamats / mapiq
	fb31 .. fb33		bet .. dalet with dagesh
	fb34				he with mapiq
	fb35 .. fb4a		vav .. tav mit dagesh (including final kaf fb3a & final pe fb43)
	fb4b				vav with holam
	fb4c .. fb4e		bet / kaf / pe with rafe
	fb4f				ligature alef lamed
	
	buchstaben mit vokalisation nicht? (fb2a .. fb4e)
	
	*/
	

	/** letter */

	// 2.3, 4.1
	const letter =
	[
	 	new Markup // aleph .. tav, probably with manual width
	 	(
	 		[
	 		 	['sign', hebrewLetter],
	 		 	['width', realNumberOptional]
	 		],
	 		{
	 			'type': 'sign',
	 			'sign': '§this.sign',
	 			'width': '§(this.width=="" ? 1 : this.width)'
	 		}
	 	)
	];
	
	
	/** separator (for alternative, correction etc.) */

	// 11.1
	const separators =
	{
		'\u002c': ['alternative', 'corrected', 'damaged'] // \u002c being ,
	};
	const separatorKeys = Object.keys(separators);

	var separatorRegExp = '(';
	for (var i in separatorKeys)
	{
		separatorRegExp += separatorKeys[i];
		
		if (i < separatorKeys.length - 1)
		{
			separatorRegExp += '|';
		}
	}
	separatorRegExp += ')';
	separatorRegExp = new RegExp(separatorRegExp);

	const separator =
	[
	 	new Markup // e.g. ,
	 	(
	 		[
	 		 	['separator', separatorRegExp],
	 		 	['condition', 'separators[this.separator].includes(stackTop())'] // fitting separator for most current modification, also checks whether there is something on the stack at all
	 		],	
	 		{
	 			'type': 'separator' 
	 		}
	 	)
	];	

	
	/** blank areas */

	// 3.5.4, 3.6.1
	const vacat =
	[
		new Markup // e.g. ===3.5
		(
			[
			 	['a', /=+/],
			 	['atLeast', />?/],
			 	['b', realNumberOptional]
			],
			{
				'type': 'sign',
				'sign': 'vacat',
				'width': '§this.a.length + (this.b=="" ? 0 : 1*this.b) - (this.a.length==1&&this.b!="" ? 1 : 0)',
				'atLeast': '§""+(this.atLeast!="")' // 'true' if > included
			}
		),
		new Markup // e.g. /vacat{2.5}
		(
			[
			 	['id', /\/vacat/],
			 	['open', oBracket],
			 	['atLeast', />?/],
			 	['width', realNumberOptional],
			 	['close', cBracket]
			],
			{
				'type': 'sign',
				'sign': 'vacat',
				'width': '§(this.width!="" ? this.width*1 : 1)',
				'atLeast': '§""+(this.atLeast!="")'
			}
		)
	];

	// 3.5.4.3, 3.6.1
	const possibleVacat =
	[
		new Markup // e.g. ?===3.5
		(
			[
			 	['id', /\?/],
			 	['a', /=+/],
			 	['atLeast', />?/],
			 	['b', realNumberOptional]
			],
			{
				'type': 'sign',
				'sign': 'possibleVacat',
				'width': '§this.a.length + (this.b!="" ? 1*this.b : 0) - (this.a.length==1&&this.b!="" ? 1 : 0)',
				'atLeast': '§""+(this.atLeast!="")' // 'true' if > included
			}
		),
		new Markup // e.g. /possibleVacat{2.5}
		(
			[
			 	['id', /\/possibleVacat/],
			 	['open', oBracket],
			 	['atLeast', />?/],
			 	['pl', realNumberOptional],
			 	['close', cBracket]
			],
			{
				'type': 'sign',
				'sign': 'possibleVacat',
				'width': '§(this.pl!="" ? this.pl*1 : 1)',
				'atLeast': '§""+(this.atLeast!="")' // 'true' if > included
			}
		)
	];

	// 3.5.3, 3.6.1
	const space =
	[
	 	new Markup // e.g. 2.5 with two spaces afterwards
	 	(
	 		[
	 		 	['a', realNumberOptional],
	 		 	['b', /\u0020+/] // common space
	 		],	
	 		{
	 			'type': 'sign',
	 			'sign': 'space',
	 			'width': '§(this.a=="" ? 0 : 1*this.a) + this.b.length - (this.b.length==1&&this.a!="" ? 1 : 0)'
	 		}
	 	),
	 	new Markup // e.g. /space{1.5}
	 	(
			[
	 		 	['id', /\/space/],
	 		 	['open', oBracket],
	 		 	['pl', realNumberOptional],
	 		 	['close', cBracket]
	 		],
	 		{
	 			'type': 'sign',
	 			'sign': 'space',
	 			'width': '§(this.pl!="" ? this.pl*1 : 1)'
	 		}
	 	)
	];
	
	// 3.5.7, 3.6.1
	const damage =
	[
	 	new Markup // e.g. ###2.5
	 	(
	 		[
			 	['a', /#+/],
			 	['b', realNumberOptional]
	 		],	
	 		{
	 			'type': 'sign',
	 			'sign': 'damage',
	 			'width': '§this.a.length + (this.b=="" ? 0 : 1*this.b) - (this.a.length==1&&this.b!="" ? 1 : 0)'
	 		}
	 	),
	 	new Markup // e.g. /damage{1.5}
	 	(
			[
	 		 	['id', /\/damage/],
	 		 	['open', oBracket],
	 		 	['a', realNumberOptional],
	 		 	['close', cBracket]
	 		],
	 		{
	 			'type': 'sign',
	 			'sign': 'damage',
	 			'width': '§(this.a=="" ? 1 : this.a*1)'
	 		}
	 	)
	];
	
	// 3.5.5, 3.6.2
	const blankLine =
	[
		new Markup // ' ₪' or ' ∞'
		(
			[
			 	['id', / (₪|∞)/]
			],
			{
				'type': 'sign',
				'sign': 'blankLine'
			}
		),
		new Markup // /blankLine{}  (brackets might differ)
		( // TODO changed from being a shortcut for vacat<ue>
			[
			 	['id', /\/blankLine/],
			 	['open', oBracket],
			 	['close', cBracket]
			],
			{
				'type': 'sign',
				'sign': 'blankLine',
				'width': '0'
			}
		)
	];
	
	// 3.5.5, 3.6.2
	const paragraphMarker =
	[
		new Markup // '=₪' or '=∞'
		(
			[
			 	['id', /=(₪|∞)/]
			],
			{
				'type': 'sign',
				'sign': 'paragraphMarker',
				'width': '0'
			}
		),
		new Markup // /vacat{₪} or /vacat{∞}  (brackets might differ)
		(
			[
			 	['id', /\/vacat/],
			 	['open', oBracket],
			 	['infinite', /₪|∞/],
			 	['close', cBracket]
			],
			{
				'type': 'sign',
				'sign': 'paragraphMarker',
				'width': '0'
			}
		)
	];
	

	/** position */
	
	// 5.1, 5.3
	_posShort2Long =
	{
		'\\^': 'aboveLine',
		'_': 'belowLine',
		'«': 'leftMargin',
		'»': 'rightMargin'
	};
	
	const posKeys = Object.keys(_posShort2Long);
	var posShort = '';
	var posLong = '';
	for (var i in posKeys)
	{
		if (posShort.length != 0) // already added something to the string
		{
			posShort += '|';
			posLong += '|';
		}
		
		posShort += posKeys[i];
		posLong += _posShort2Long[posKeys[i]];
	}
	posShort = new RegExp(posShort);
	posLong = new RegExp(posLong);
	
	// 5.2
	const position =
	[
		new Markup // e.g. /belowLine{
		(
			[
			 	['slash', /\//],
			 	['id', posLong],
			 	['bracket', oBracket]
			],
			{
				'type': 'modification',
				'modification': 'position',
				'detail': '§this.id',
				'bracket': '§this.bracket'
			}
		),
		new Markup // e.g. _{
		(
			[
			 	['id', posShort],
			 	['bracket', oBracket]
			],
			{
				'type': 'modification',
				'modification': 'position',
				'detail': '§_posShort2Long[this.id]==null ? _posShort2Long["\\\\"+this.id] : _posShort2Long[this.id]',
				'bracket': '§this.bracket'
			}
		),
		new Markup // e.g. _ (must be checked after _{ pattern)
		(
			[
			 	['id', posShort]
			],
			{
				'type': 'modification',
				'scope': 'single sign',
				'modification': 'position',
				'detail': '§_posShort2Long[this.id]==null ? _posShort2Long["\\\\"+this.id] : _posShort2Long[this.id]'
			}
		)
	];
	
	
	/** double-meaning or retraced */
	
	// 6.1, 6.2
	const doubleMeaningOrRetraced =
	[
		new Markup // e.g. {
		(
			[
			 	['open', oBracket]
			],
			{
				'type': 'modification',
				'modification': 'doubleMeaningOrRetraced'
			}
		)
	];
	
	// 6.1
	const doubleMeaning = // part within brackets
	[
		new Markup // e.g. ו,י}
		(
			[
			 	['condition', '(stackTop() == "doubleMeaningOrRetraced")'],
			 	['a', hebrewLetter],
			 	['separator', separatorRegExp],
			 	['b', hebrewLetter],
			 	['condition', '(this.a != this.b)']
			],
			{
				'type': 'modification',
				'modification': 'alternative',
				'alternative': 'doubleMeaning',
				'posChange': '0' // to find first sign in next iteration 
			}
		)
	];
	
	// 6.2
	const retraced = // part within brackets
	[
		new Markup // e.g. א,א}
		(
			[
			 	['condition', '(stackTop() == "doubleMeaningOrRetraced")'],
			 	['a', hebrewLetter],
			 	['separator', separatorRegExp],
			 	['b', hebrewLetter],
			 	['condition', '(this.a == this.b)']
			],
			{
				'type': 'sign',
				'sign': '§this.a',
				'retraced': 'true'
			}
		)
	];
		
	
	/** context or final */

	// 7.1
	const contextFinalUnclear =
	[
		new Markup
		(
			[
			 	['id', /\$/]
			],
			{
				'type': 'modification',
				'scope': 'single sign',
				'modification': 'contextFinalUnclear',
				'detail': 'true'
			}
		)
	];
	
	
	/** vowels & meta-signs */
	
	_vocalizationMap[0] = 'Tiberian';
	_vocalizationMap[1] = 'Babylonian';
	_vocalizationMap[2] = 'Palestinian';
	
	// 8.1.1  // TODO changed (added ~ for easier parsing)
	const vocalization =
	[
	 	new Markup // e.g. ~0 for Tiberian
	 	(
	 		[
	 		 	['id', /~/],
	 		 	['digits', /\d+/]
	 		],
	 		{
	 			'type': 'modification',
	 			'modification': 'vocalization',
	 			'scope': 'permanent',
	 			'detail': '§(_vocalizationMap[this.digits]!=null ? _vocalizationMap[this.digits] : "undefined")'
	 		}
	 	)
	];
	
	// 8.3
	const metaSign =
	[
	 	new Markup
	 	(
	 		[
	 		 	['id', /%/],
	 		 	['digits', /\d+/]
	 		],
	 		{
	 			'type': 'modification',
	 			'modification': 'metaSign',
	 			'detail': '§this.digits'
	 		}
	 	)
	];
	
	
	/** readability */
	
	// 9.2.2.1, 9.2.2.2
	const traditionalReadability =
	[
		new Markup
		(
			[
			 	['dotAbove', /\u05c4/] // e.g. טׄ
			],
			{
				'type': 'modification',
				'scope': 'single sign',
				'application': 'retroactive',
				'modification': 'damaged',
				'detail': 'clear'
			}
		),
		new Markup
		(
			[
			 	['masora', /\u05af/] // e.g ח֯
			],
			{
				'type': 'modification',
				'scope': 'single sign',
				'application': 'retroactive',
				'modification': 'damaged',
				'detail': 'ambiguous'
			}
		)
	];
	
	const damagedAreas = /([0-3]:[0-2],)*/; // e.g. 2:1,1:2,
	
	// 2.6.3, 9.2.1, 9.3.5
	const damaged =
	[
		new Markup // e.g °{0:0,1:0,ע,ל or /damaged<ע,ל or /ambiguous{ ...
		(
			[
			 	['id', /°|\/damaged|\/ambiguous/],
			 	['bracket', oBracket],
			 	['areas', damagedAreas]
			],
			{
				'type': 'modification',
				'modification': 'alternative',
				'alternative': 'damaged',
				'damagedAreas': '§this.areas',
				'bracket': '§this.bracket'
			}
		)
	];
	

	/** reconstruction */

	// 10.1
	const reconstruction =
	[
		new Markup
		(
			[
			 	['bracket', /\[/]
			],
			{
				'type': 'modification',
				'modification': 'reconstructed',
				'detail': 'true',
				'bracket': '['
			}
		)
	];

	// 9.1, 10.1.1, 10.1.2
	const lacuna =
	[
	 	new Markup // e.g. 4°
	 	(
	 		[
	 		 	['a', realNumberMandatory],
	 		 	['b', /°/]
	 		],	
	 		{
	 			'type': 'sign',
	 			'sign': 'lacuna',
	 			'width': '§1*this.a'
	 		}
	 	),
	 	new Markup // e.g. °°°°
	 	(
	 		[
	 		 	['a', /°+/],
	 		],	
	 		{
	 			'type': 'sign',
	 			'sign': 'lacuna',
	 			'width': '§this.a.length'
	 		}
	 	)
	];

	const reconstructionEnd =
	[
		new Markup
		(
			[
			 	['id', /\]/]
			],
			{
				'type': 'modification',
				'modification': 'reconstructed',
				'detail': 'false'
			}
		)
	];


	/** correction */

	// 11.2
	const corrections =
	{
		'horizontalLine'   :  '-',
		'diagonalLeftLine' :  '/', // TODO 'raisingLine'?
		'diagonalRightLine': '\\', // TODO 'fallingLine'?
		'dotBelow'         : '\.',
		'dotAbove'         :  '˙',
		'lineBelow'        :  '_',
		'lineAbove'        :  '‾',
		'boxed'            :  '0',
		'erased'           :  '≠'
	};

	var correctionOptionsShort = '(';
	var correctionOptionsLong  = '(';
	for (var c in corrections)
	{
		if (correctionOptionsShort.length > 1) // already added something to the reg exp
		{
			correctionOptionsShort += '|';
			correctionOptionsLong  += '|';
		}
		correctionOptionsShort += corrections[c];
		correctionOptionsLong  += c;
		
		correctionsReversed[corrections[c]] = c; // e.g. _ -> lineBelow
	}
	correctionOptionsShort += ')';
	correctionOptionsLong  += ')';
	

	// 11.1
	const correction = // TODO only main sign should have corrected entry?
	[
	 	new Markup // overwritten, e.g. !{ or /corrected<
	 	(
	 		[
	 		 	['id', /\!|\/corrected/],
	 		 	['bracket', oBracket]
	 		],
	 		{
	 			'type': 'modification',
	 			'modification': 'corrected',
	 			'detail': 'overwritten',
	 			'bracket': '§this.bracket'
	 		}
	 	),
	 	new Markup // short form (potentially multiple), e.g. !_-{
	 	(
	 		[
	 		 	['id', /\!/],
	 		 	['options', new RegExp(correctionOptionsShort + '+')],
	 		 	['bracket', oBracket] // combination needs brackets
	 		],
	 		{
	 			'type': 'modification',
	 			'modification': 'corrected',
	 			'detail': '§combineShortCorrections(this.options)', // e.g. lineBelow&lineAbove
	 			'bracket': '§this.bracket'
	 		}
	 	),
	 	new Markup // long form (one by one), e.g. /lineBelow{
	 	(
	 		[
	  		 	['id', /\//],
	  		 	['option', new RegExp(correctionOptionsLong)],
	  		 	['bracket', oBracket]
	  		],	
	  		{
	  			'type': 'modification',
	  			'modification': 'corrected',
	  			'detail': '§this.option', // add this correction to probably existing ones in stack, result e.g. lineBelow&lineAbove
	  			'bracket': '§this.bracket'
	  		}
	 	),
	 	new Markup // short form for single sign, e.g. !_ (must be put after !_-{ entry)
	 	(
	 		[
	  		 	['id', /\!/],
	  		 	['option', new RegExp(correctionOptionsShort)]
	  		],	
	  		{
	  			'type': 'modification',
	  			'scope': 'single sign',
	  			'modification': 'corrected',
	  			'detail': '§this.option'
	  		}
	 	)
	];
	

	/** scribal hand */
	
	// 12.1
	const scribalHand =
	[
	 	new Markup // e.g. §1
	 	(
	 		[
	 		 	['id', /§\d+/]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'scribalHand',
	 			'detail': '§this.id.substr(1)'
	 		}
	 	),
	 	new Markup // e.g. /scribalHand{0}
	 	(
	 		[
	 		 	['id', /\/scribalHand/],
	 		 	['open', oBracket],
	 		 	['number', /\d+/],
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'scribalHand',
	 			'detail': '§this.number'
	 		}
	 	)
	];

	
	/** conjecture */
	
	const hebrewLetterOrNothing = new RegExp(hebrewLetter.source + '?');
	
	// 13.1
	const conjecture = // TODO create secondary sign
	[
	 	new Markup // e.g. *{ד,ה} or /conjecture<ד,>
	 	(
	 		[
	 		 	['id', /\/conjecture|\*/],
	 		 	['open', oBracket],
	 		 	['a', hebrewLetterOrNothing],
	 		 	['separator', separatorRegExp],
	 		 	['b', hebrewLetterOrNothing],
	 		 	['condition', '(this.a != "" || this.b != "")']
	 		],	
	 		{
	 			'type': 'sign',
	 			'sign': '§this.a',
	 			'suggested': '§this.b'
	 		}
	 	)
	];
	
	
	/** comment */
	
	var notClosingBracket = '[^';
	var bracketString;
	
	for (var iBracket in brackets)
	{
		if (notClosingBracket.length > 2) // already added a possible bracket
		{
			notClosingBracket += '|';
		}
		
		bracketString = brackets[iBracket][1]; // e.g. } or >
		for (var iBS = 0; iBS < bracketString.length; iBS++)
		{
			notClosingBracket += char2Unicode(bracketString.charAt(iBS)); // e.g. \u007D for }	
		}
	};
	notClosingBracket += ']*';
	notClosingBracket = new RegExp(notClosingBracket);
	
	
	// 13.2
	const comment =
	[
	 	new Markup // e.g. &{This is a bet} or /comment<A bet here!> 
	 	(
	 		[
	 		 	['id', /&|\/comment/],
	 		 	['open', oBracket],
	 		 	['comment', notClosingBracket],
	 		 	['close', cBracket]
	 		],
	 		{
	 			'type': 'modification',
	 			'application': 'retroactive',
	 			'modification': 'comment',
	 			'detail': '§this.comment'
	 		}
	 	)
	];
	
	
	/** structure */
	
	const name = /(\d|[a-zA-Z])+/;
	
	// 14.1.1, 14.3.1
	const manuscript =
	[
	 	new Markup // e.g. @M=CD
	 	(
	 		[
	 		 	['id', /@M=/],
	 		 	['name', name]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'manuscript',
	 			'detail': '§this.name'
	 		}
	 	),
	 	new Markup // e.g. \manuscript{1QS}
	 	(
	 		[
	 		 	['id', /\\manuscript/],
	 		 	['open', oBracket],
	 		 	['name', name],
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'manuscript',
	 			'detail': '§this.name'
	 		}
	 	)
	];
	
	// 14.1.1, 14.3.2
	const fragment =
	[
	 	new Markup // e.g. @F=10, frg. 3
	 	(
	 		[
	 		 	['id', /@F=/],
	 		 	['name', name] // TODO support more than name pattern
	 		],
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'fragment',
	 			'detail': '§this.name'
	 		}
	 	),
	 	new Markup // e.g. \chapter{10 extension}
	 	(
	 		[
	 		 	['id', /(\\fragment)|(\\column)|(\\chapter)/],
	 		 	['open', oBracket],
	 		 	['name', name], // TODO support more than name pattern
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'fragment',
	 			'detail': '§this.name'
	 		}
	 	)
	];
	
	const lineNumberRegExp = /\d+[a-zA-Z]*/;
	
	// 14.1.1, 14.3.3
	const line =
	[
	 	new Markup // e.g. @L=3a
	 	(
	 		[
	 		 	['id', /@L=/],
	 		 	['number', lineNumberRegExp]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'lineNumber',
	 			'detail': '§this.number'
	 		}
	 	),
	 	new Markup // e.g. \verse{3a}
	 	(
	 		[
	 		 	['id', /(\\line)|(\\verse)/],
	 		 	['open', oBracket],
	 		 	['number', lineNumberRegExp],
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'modification',
	 			'scope': 'permanent',
	 			'modification': 'lineNumber',
	 			'detail': '§this.number'
	 		}
	 	)
	];
	
	// 14.2.3, 14.3.4, 14.3.5
	const automaticLineNumberingPattern =
	[
	 	new Markup // @AL
	 	(
	 		[
	 		 	['id', /@AL/],
	 		],	
	 		{
	 			'type': 'lineNumbering',
	 			'automatic': 'true'
	 		}
	 	),
	 	new Markup // e.g. \startAutomaticLineNumbering{} 
	 	(
	 		[
	 		 	['id', /\\startAutomaticLineNumbering/],
	 		 	['open', oBracket],
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'lineNumbering',
	 			'automatic': 'true'
	 		}
	 	),
	 	new Markup // @NAL
	 	(
	 		[
	 		 	['id', /@NAL/],
	 		],	
	 		{
	 			'type': 'lineNumbering',
	 			'automatic': 'false'
	 		}
	 	),
	 	new Markup // e.g. \stopAutomaticLineNumbering{} 
	 	(
	 		[
	 		 	['id', /\\stopAutomaticLineNumbering/],
	 		 	['open', oBracket],
	 		 	['close', cBracket]
	 		],	
	 		{
	 			'type': 'lineNumbering',
	 			'automatic': 'false'
	 		}
	 	),
	];
	
	
	// 2.6.1, 10.1
	const tagEnd =
	[
	 	new Markup // e.g. }
	 	(
	 		[
	 		 	['id', cBracket],
	 		],	
	 		{
	 			'type': 'tagEnd',
	 			'bracket': '§this.id'
	 		}
	 	)
	];	

	const patterns = // defines what's searched and in which order
	[
	 	doubleMeaning,			// 6.1 (must be before letter)
	 	retraced,				// 6.2 (must be before letter)
	 
	 	letter,					// 2
	 	tagEnd,					// 2.6.1
	 	
	 	possibleVacat,			// 3
	 	damage,					// 3
	 	blankLine,				// 3
	 	paragraphMarker,		// 3
	 	vacat,					// 3 (must be after paragraphMarker)
	 	space,					// 3 (must be after blankLine)
	 	
	 	position,				// 5
	 	
	 	doubleMeaningOrRetraced,// 6
	 	
	 	contextFinalUnclear,	// 7
	 	
	 	vocalization,			// 8
	 	
	 	traditionalReadability,	// 9
	 	damaged,				// 9

	 	reconstruction,			// 10
	 	lacuna,					// 10
	 	reconstructionEnd,		// 10
	 	
	 	correction,				// 11
	 	
	 	scribalHand,			// 12
	 	
	 	conjecture,				// 13.1
	 	comment,				// 13.2
	 	
	 	manuscript,				// 14
	 	fragment,				// 14
	 	line,					// 14
	 	automaticLineNumberingPattern, // 14
	]; // TODO optimize sort order based on probability & effort; maybe cover ambiguous markup
	
	/* ambiguous cases
	 * 
	 * ' ' vs. ' ₪'
	 * TODO
	 * 
	*/
	
	return patterns;
}

const patterns = definePatterns();


/** parse */

function nextMarkup(code)
{
	var result;
	for (var i in patterns)
	{
		for (var j in patterns[i])
		{
			result = patterns[i][j].match(code);
			if (result != false)
			{
				break;
			}
		}
		
		if (result != false)
		{
			break;
		}
	}
	
	if (result == false) // found no match
	{
		result = {};
	}
	
	return result;
}

function rememberModification(result, line)
{
	if (result.application == 'retroactive')
	{
		console.log('result.modification ' + result.modification);
		console.log('result.detail ' + result.detail);
		
		if (alternatives.length > 0) // alternative in the making
		{
			alternatives[alternatives.length - 1][result.modification] = result.detail;
		}
		else if (line.length > 0) // already 1+ built sign
		{
			line[line.length - 1][0][result.modification] = result.detail;
		}
		
		console.log('line[line.length - 1][result.modification] ' + line[line.length - 1][result.modification]);
	}
	else
	{
		if (result.scope == 'single sign') // bracketless shortcuts for position etc.
		{
			_singleSignStack.push([result.modification, result.detail]); // e.g. [position, aboveLine]
		}
		else if (result.scope == 'permanent')
		{
			_permanentStack.push([result.modification, result.detail]);
		}
		else // scope is till closed by bracket
		{
			_stack.push([result.modification, result.detail]);
		}
	}
	
	if (result.modification == 'lineNumber')
	{
		_lineNumber = result.detail;
	}
}

function addSeparator()
{
	if (_stack.length == 0)
	{
		return;
	}
	
	_stack[_stack.length - 1][3]++; // increase separator counter
}

const contextFinalMap =
{
	'\u05db': '\u05da', // kaf כ -> final kaf ך
	'\u05da': '\u05db', // final kaf -> kaf
	
	'\u05de': '\u05dd', // mem מ -> ם
	'\u05dd': '\u05de',
	
	'\u05e0': '\u05df', // nun נ -> ן
	'\u05df': '\u05e0',
	
	'\u05e4': '\u05e3', // pe פ -> ף
	'\u05e3': '\u05e4',
	
	'\u05e6': '\u05e5', // tsadi צ -> ץ
	'\u05e5': '\u05e6',
};

var alternatives = [];

function buildSign(result)
{
	/** copy attributes */
	
	const sign = {};
	
	for (var i in result)
	{
		if (i != 'type'
		&&  i != 'posChange') // skip type (it's always sign in the result) and posChange (relevant only for moving through the text)
		{
			sign[i] = result[i];
		}
	}
	
	
	/** add modifications from stacks */ 
	
	const combinedStack = _stack.concat(_singleSignStack, _permanentStack);
	
	console.log('combined stack:');
	var toCheck = [combinedStack];
	for (var i = 0; i < toCheck.length; i++)
	{
		console.log(toCheck[i]);
		for (var k in toCheck[i])
		{
			if (typeof toCheck[i][k] != 'function')
			{
				console.log('* ' + k + ' ' + toCheck[i][k]);
			}
		}
		console.log('-------------');
	}
	
	const combinedMods =
	{
		'position': '',
		'corrected': ''
	};
	var combination;
	
	for (var i in combinedStack)
	{
		if (combinedStack[i][0] == 'position'
		||  combinedStack[i][0] == 'corrected')
		{
			combination = combinedMods[combinedStack[i][0]]; // position / correction
			
			if (combination.length == 0) // first 
			{
				combination = combinedStack[i][1];
			}
			else
			{
				combination = combination + '&' + combinedStack[i][1];
			}
			
			sign[combinedStack[i][0]] = combination;
			combinedMods[combinedStack[i][0]] = combination;
		}
		else if (combinedStack[i][0] != 'doubleMeaningOrRetraced')
		{
			sign[combinedStack[i][0]] = combinedStack[i][1]; // e.g. 'width: 3'	
		}
	}
	
	_singleSignStack.length = 0; // clear array to apply these modifications only once
	
	
	/** special cases resulting in multiple alternatives */
	
	if (sign['contextFinalUnclear'] == 'true'
	&&  contextFinalMap[sign['sign']] != null) // final or context version
	{
		delete sign['contextFinalUnclear']; // redundant now
		
		const otherVersion = cloneArray(sign);
		otherVersion['sign'] = contextFinalMap[sign['sign']];
		
		return [sign, otherVersion];
	}
	
	if (stackTop() == 'alternative')
	{
		delete sign['alternative']; // redundant now
		alternatives.push(sign);
		
		return null; // signal to not add right now
	}
	
	return [sign]; // package it as array without alternatives
}

function removeLatestStackEntry(bracket)
{
	var index = -1;
	for (var i = _stack.length - 1; i >= 0; i--)
	{
		if (bracket == bracketPairs[_stack[i][0]])
		{
			index = i;
			break;
		}
	}
	
	var wasAlternative = false;
	if (index != -1) // entry with this bracket found
	{
		wasAlternative = (_stack[index][1] == 'alternative');
		
		for (var i = index; i < _stack.length - 1; i++) // not executed for index == stack.length - 1
		{
			_stack[i] = _stack[i + 1]; // overwrite found instance, move everything afterwards to one index lower
		}
		
		_stack.pop(); // remove found instance or other youngest element (existing twice because of movement in previous loop)
	}
}

function parseLine(markupLine) 
{
	var pos = 0;
	var result;
	var nextLine;
	var sign;
	const line = [];
	var wasAlternativeOnTop = false;
	
	while (pos < markupLine.length)
	{
		result = nextMarkup(markupLine.substr(pos));
		nextLine = false;
		
		switch (result.type) // TODO change alternative system to subcheck of sign?
		{
			case 'sign': // letter, vacat, lacuna, conjecture etc.
				
				if (result.sign == 'blankLine')
				{
					nextLine = true;
					
					if (line.length == 0) // add dummy sign if otherwise no signs in this line
					{
						line.push(buildSign(
						{
							'sign': 'blankLine'
						}));
					}
				}
				else if ((sign = buildSign(result)) != null) // sign successfully built
				{
					line.push(sign);
				}
				
			break;
			
			case 'modification': // position, reconstruction, alternative etc.
				
				rememberModification(result, line);
				
			break;
			
			case 'separator': // e.g. ,
				
				// addSeparator(); // TODO currently not necessary
			
			break;
			
			case 'tagEnd':
				
				_stack.pop();
				/* removeLatestStackEntry(result.bracket) */
				
			break;
			
			case 'lineNumbering':
			
				_automaticLineNumbering = (result.automatic == 'true');
			
			break;
		}
		
		if (stackTop() == 'alternative')
		{
			wasAlternativeOnTop = true;
		}
		else if (wasAlternativeOnTop) // was, but is no longer
		{
			line.push(alternatives);
			alternatives = [];
			
			wasAlternativeOnTop = false;
		}
		
		if (nextLine)
		{
			break;
		}
		
		if (result != null
		&&  result.posChange != null
		&&  !isNaN(result.posChange))
		{
			pos += parseInt(result.posChange);
		}
		else // no interpretation available
		{
			console.log('no interpretation available');
			pos++;
		}
	}
	
	return line;
}

var _lineNumber; // or verse, e.g. 3a
var _automaticLineNumbering;

function parse(markupText)
{
	/** initialize / reset global variables */
	
	_stack = []; // changes to signs during parsing process
	_singleSignStack = []; // changes that affect only the following sign
	_permanentStack = []; // changes that apply to the rest of the text or until changed again 
	
	_lineNumber = 1;
	_automaticLineNumbering = true;
	
	
	/** split and parse text */
	
	const lineTexts = markupText.split('\n'); // line breaks have been normalized to \n before
	const lineNumbers = [];
	const lines = [];
	
	for (var i in lineTexts)
	{
		console.log('------');
		console.log('LINE ' + _lineNumber);
		
		lines.push(parseLine(lineTexts[i]));
		lineNumbers.push(_lineNumber);
		
		if (_automaticLineNumbering)
		{
			incrementLineNumber();
		}
	}

	return [lineNumbers, lines];
}