
var FINAL = {};



function process (files) {
	var keys = {};
	var lets = {};
	for (var jj = 0, len = files.length; jj < len; jj++) {


		var stringArray = files[jj].split(/\d+/);
		var numberArray = files[jj].match(/(\d+)/g);
		if(!numberArray) {
			continue;
		}

		var uid = stringArray.join() + numberArray.toString().length;
		var template = '';

		var innerKeys = keys[uid] || {};

		// loop [ '0025', '0140', '02', '001', '1096' ]
		for (var i = 0; i < stringArray.length; i++) {
		    template += stringArray[i];

		    if(i < numberArray.length) {
		    	var _index = i
		    	var uniqueInnerKey = _index + uid;
		    	var sequence = lets[uniqueInnerKey] || [];
		      	template +='{' + _index + '}';

		      	if(sequence.indexOf(numberArray[i]) == -1)
					sequence.push(numberArray[i]);

				lets[uniqueInnerKey] = sequence;
		      	innerKeys[_index] = lets[uniqueInnerKey];
		      	innerKeys.position = i
		      	innerKeys.length = numberArray.length
		    }
		}

		innerKeys.template = template;
		innerKeys.orignal = files[jj]
		keys[uid] = innerKeys;

	}


	for(k in keys) {
		parseSequence(keys[k], 0);
	}


	var TEST = [];
	for(_key in FINAL) {
		TEST.push(_key)
	}

	// TEST.sort(sortAlphaNum)
	// console.log(TEST);
	FINAL = {};
	return TEST;
}


function parseSequence(_key_k, index) {

	var template = _key_k.template;
	var length = _key_k.length;
	var position =	 _key_k.position;
	var val = _key_k

	var indent = '';
	switch(index) {
	    case 1:
	        indent+='|   '
	        break;
	    case 2:
	        indent+='|   |   '
	        break;
	    case 3:
	        indent+='|   |   |   '
	        break;
	    case 4:
	        indent+='|   |   |   |   '
	        break;
	   	case 5:
	        indent+='|   |   |   |   |   '
	        break;
	    default:
	        indent+='';
	}

	// console.log(indent+'/-------------Start----------------',index, length-1);
	var i = length;
	while (i--) {
		function debugLog(tik) {
			console.log(indent+'|'+(position-i)+' pos:%s  i:%s  (position-i):%s  '+tik+' {`%s`:[%s]}', position, (i), (position - i), (i), val[i]);
		}
		function forkThis() {
			var copy = JSON.parse(JSON.stringify(_key_k))
			copy[i].splice(0,1)
			index++
			parseSequence(copy, index)
			index--
		}
		var x = (position-i) + 4
		// // console.log(x)
		// if( x === position && val[i].length >= 2) {
		// 	debugLog('√')
		// 	forkThis()
		// }
		if(i+4 === position && val[i].length >= 2) {
			// debugLog('√')
			forkThis()
		}
		else if (i+3 === position && val[i].length>=2) {
			// debugLog('√')
			forkThis()
		}
		else if (i+2 === position && val[i].length>=2) {
			// debugLog('√')
			forkThis()
		}
		else if (i+1 === position && val[i].length>=2) {
			// debugLog('√')
			forkThis()
		}
		else {
			// debugLog(' ')
		}




		if(val[i].length >= 2 && position === i) {
			template = generate(position, val[i], template) // {1} => %04d
		}
		else {
			template = replace(i, val[i][0], template) // {1} => 0077
		}
	}


	// console.log(indent+ '\\-------------End------------------',index,template);
	FINAL[template]=1;
}

function generate(key, sequences, file) {
	var digitLength = sequences[sequences.length-1].length
	return file.replace('{'+key+'}', '%0'+digitLength+'d');
}

function replace(key, num, file) {
	return file.replace('{'+key+'}', num);
}



function sortAlphaNum(a, b) {
	var aA = a.replace(/[^a-zA-Z]/g, '');
	var bA = b.replace(/[^0-9]/g, '');
	if (aA === bA) {
		var aN = parseInt(a.replace(reN, ''), 10);
		var bN = parseInt(b.replace(reN, ''), 10);
		return aN === bN ? 0 : aN > bN ? 1 : -1;
	}
	else {
		return aA > bA ? 1 : -1;
	}
}


function main(array, callback) {

	array.sort(sortAlphaNum);
	callback(null, process(array))
}
module.exports = main
