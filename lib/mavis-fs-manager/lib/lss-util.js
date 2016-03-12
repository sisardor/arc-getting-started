
var Table = require('cli-table');

var table = new Table({
	chars: { 'top': '' , 'top-mid': '' , 'top-left': '' , 'top-right': ''
         , 'bottom': '' , 'bottom-mid': '' , 'bottom-left': '' , 'bottom-right': ''
         , 'left': '' , 'left-mid': '' , 'mid': '' , 'mid-mid': ''
         , 'right': '' , 'right-mid': '' , 'middle': ' ' },
  	style: { 'padding-left': 0, 'padding-right': 0},
    head: ['#','original', 'fileName', 'sequence',  'mix', 'extension']
});

var regex = /[0-9]+((\w|_\w+)|).exr$/gm;
var reA = /[^a-zA-Z]/g;
var reN = /[^0-9]/g;

function getGroupedFileName(list, ext) {
	if(!ext) ext = '.exr';
	console.log('Total files: ' + list.length)

	list.sort(sortAlphaNum);

	var fileGroup = {};

	for (var i = 0; i < list.length; i++) {
		var file = list[i]


		var extension = gatExtension(file);

		var regex = /[0-9]+((\w|\w+)|)\.[0-9a-z]+$/igm;

		var match = file.match(regex);
		if (match && extension) {

			var fileName 	= getFileName(file, extension);		// a123Sequence.3434
			var seqAndExt 	= getSeqAndExt(file, match);		// 0019.exr
			var sequenceMix = getSeqMix(seqAndExt, extension);	// 0019, 0018_x
			var mix 		= getMixPart(sequenceMix)[0];
			var sequence 	= getSequence(sequenceMix);
			var fileNameText = getFileNameText(fileName, sequenceMix)
			table.push([i+1,file, fileNameText, sequence,  mix, extension ])
			// var sequenceMix = getSeqMix(seqAndExt, ext);
			// var sequence 	= getSequence(sequenceMix); 	// 0019, 0018
			// var mix 		= getMixPart(sequenceMix)[0];	// _x, _xds
			// //var extension  	= gatExtension(seqAndExt);

			// var sequences = fileGroup[fileName + '{seq}' + mix] || [];
			// sequences.push(
			// 	{
			// 		sequence: sequence,
			// 		mix: mix,
			// 		fileName: fileName,
			// 		original: file
			// 	}
			// );
			// fileGroup[fileName + '{seq}' + mix] = sequences;
		}
		else {
			table.push([i+1,file, '', '', ''])
		}
	}
	console.log(table.toString());
	// return getFinalResult(fileGroup)
}

function getFileNameText(fileName, sequenceMix) {
	var str = fileName.substr(0, fileName.indexOf(sequenceMix))
	return str;
}

function getFileName (file, ext) {
	var str = file.substr(0, file.indexOf(ext));
	return str;
}

function getSeqAndExt(file, match) {

	var res = file.substr(file.indexOf(match[0]), file.length);
	// console.log(file, res, match);
	return res
}

function getSeqMix(seqAndExt, ext) {
	return seqAndExt.substr(0, seqAndExt.indexOf(ext));
}

function getSequence(sequenceMix) {
	return sequenceMix.match(/\d+/g)[0];
}

function getMixPart(sequenceMix) {
	return sequenceMix.match(/(?!\d)+\w+/g) || [''];
}

function getSequenceLength(array) {
	var longest = array.sort(function (a, b) { return b.sequence.length - a.sequence.length; })[0];
	return longest
}

function gatExtension(file) {
	var re = /\.[0-9a-z]+$/i
	var str = file;
	var ext = file.match(re);
	str += '             ' + ext
	// console.log(str)
	return ext
}

function sortAlphaNum(a, b) {
	var aA = a.replace(reA, "");
	var bA = b.replace(reA, "");
	if (aA === bA) {
		var aN = parseInt(a.replace(reN, ""), 10);
		var bN = parseInt(b.replace(reN, ""), 10);
		return aN === bN ? 0 : aN > bN ? 1 : -1;
	}
	else {
		return aA > bA ? 1 : -1;
	}
}

function getFinalResult(fileGroup) {
	console.log('\n-------------- Result')
	var array = [];
	for (var key in fileGroup) {
		if(fileGroup[key].length === 1) {
			console.log(fileGroup[key][0].original)
		} else {


			var _seqObj = getSequenceLength(fileGroup[key])
			console.log(_seqObj.fileName +'%0' + _seqObj.sequence.length + 'd' + _seqObj.mix + '.exr')
		}
	}

	//console.log(fileGroup)
}


// module.exports = getGroupedFileName;

// for (var key in fileGroup) {
// 	var _seqObj = getSequenceLength(fileGroup[key])
// 	console.log(_seqObj.fileName +'%0' + _seqObj.sequence.length + 'd' + _seqObj.extension + '.exr')
// }


var list = [
'AFG_0025_0140_lr02_v001_1022.exr', 'AFG_0025_0140_lr02_v001_1038.exr', 'AFG_0025_0140_lr02_v001_1037.exr', 'AFG_0025_0140_lr02_v001_1007.exr', 'AFG_0025_0140_lr02_v001_1008.exr', 'AFG_0025_0140_lr02_v001_1012.exr', 'AFG_0025_0140_lr02_v001_1014.exr', 'AFG_0025_0140_lr02_v001_1001.exr', 'AFG_0025_0140_lr02_v001_1031.exr', 'AFG_0025_0140_lr02_v001_1024.exr', 'AFG_0025_0140_lr02_v001_1100.exr', 'AFG_0025_0140_lr02_v001_1041.exr', 'AFG_0025_0140_lr02_v001_1090.exr', 'AFG_0025_0140_lr02_v001_1085.exr', 'AFG_0025_0140_lr02_v001_1054.exr', 'AFG_0025_0140_lr02_v001_1115.exr', 'AFG_0025_0140_lr02_v001_1125.exr', 'AFG_0025_0140_lr02_v001_1064.exr', 'AFG_0025_0140_lr02_v001_1071.exr', 'AFG_0025_0140_lr02_v001_1130.exr', 'AFG_0025_0140_lr02_v001_1077.exr', 'AFG_0025_0140_lr02_v001_1123.exr', 'AFG_0025_0140_lr02_v001_1062.exr', 'AFG_0025_0140_lr02_v001_1078.exr', 'AFG_0025_0140_lr02_v001_1099.exr', 'AFG_0025_0140_lr02_v001_1052.exr', 'AFG_0025_0140_lr02_v001_1113.exr', 'AFG_0025_0140_lr02_v001_1109.exr', 'AFG_0025_0140_lr02_v001_1083.exr', 'AFG_0025_0140_lr02_v001_1048.exr', 'AFG_0025_0140_lr02_v001_1096.exr', 'AFG_0025_0140_lr02_v001_1106.exr', 'AFG_0025_0140_lr02_v001_1047.exr', 'AFG_0025_0140_lr02_v001_1108.exr', 'AFG_0025_0140_lr02_v001_1082.exr', 'AFG_0025_0140_lr02_v001_1049.exr', 'AFG_0025_0140_lr02_v001_1098.exr', 'AFG_0025_0140_lr02_v001_1053.exr', 'AFG_0025_0140_lr02_v001_1112.exr', 'AFG_0025_0140_lr02_v001_1107.exr', 'AFG_0025_0140_lr02_v001_1046.exr', 'AFG_0025_0140_lr02_v001_1097.exr', 'AFG_0025_0140_lr02_v001_1076.exr', 'AFG_0025_0140_lr02_v001_1079.exr', 'AFG_0025_0140_lr02_v001_1122.exr', 'AFG_0025_0140_lr02_v001_1063.exr', 'AFG_0025_0140_lr02_v001_1124.exr', 'AFG_0025_0140_lr02_v001_1065.exr', 'AFG_0025_0140_lr02_v001_1070.exr', 'AFG_0025_0140_lr02_v001_1131.exr', 'AFG_0025_0140_lr02_v001_1091.exr', 'AFG_0025_0140_lr02_v001_1101.exr', 'AFG_0025_0140_lr02_v001_1040.exr', 'AFG_0025_0140_lr02_v001_1055.exr', 'AFG_0025_0140_lr02_v001_1114.exr', 'AFG_0025_0140_lr02_v001_1084.exr', 'AFG_0025_0140_lr02_v001_1030.exr', 'AFG_0025_0140_lr02_v001_1025.exr', 'AFG_0025_0140_lr02_v001_1015.exr', 'AFG_0025_0140_lr02_v001_1006.exr', 'AFG_0025_0140_lr02_v001_1013.exr', 'AFG_0025_0140_lr02_v001_1009.exr', 'AFG_0025_0140_lr02_v001_1023.exr', 'AFG_0025_0140_lr02_v001_1039.exr', 'AFG_0025_0140_lr02_v001_1036.exr', 'AFG_0025_0140_lr02_v001_1011.exr', 'AFG_0025_0140_lr02_v001_1004.exr', 'AFG_0025_0140_lr02_v001_1034.exr', 'AFG_0025_0140_lr02_v001_1021.exr', 'AFG_0025_0140_lr02_v001_1027.exr', 'AFG_0025_0140_lr02_v001_1032.exr', 'AFG_0025_0140_lr02_v001_1028.exr', 'AFG_0025_0140_lr02_v001_1002.exr', 'AFG_0025_0140_lr02_v001_1018.exr', 'AFG_0025_0140_lr02_v001_1017.exr', 'AFG_0025_0140_lr02_v001_1068.exr', 'AFG_0025_0140_lr02_v001_1129.exr', 'AFG_0025_0140_lr02_v001_1133.exr', 'AFG_0025_0140_lr02_v001_1072.exr', 'AFG_0025_0140_lr02_v001_1067.exr', 'AFG_0025_0140_lr02_v001_1126.exr', 'AFG_0025_0140_lr02_v001_1116.exr', 'AFG_0025_0140_lr02_v001_1057.exr', 'AFG_0025_0140_lr02_v001_1086.exr', 'AFG_0025_0140_lr02_v001_1119.exr', 'AFG_0025_0140_lr02_v001_1058.exr', 'AFG_0025_0140_lr02_v001_1093.exr', 'AFG_0025_0140_lr02_v001_1042.exr', 'AFG_0025_0140_lr02_v001_1089.exr', 'AFG_0025_0140_lr02_v001_1103.exr', 'AFG_0025_0140_lr02_v001_1044.exr', 'AFG_0025_0140_lr02_v001_1105.exr', 'AFG_0025_0140_lr02_v001_1095.exr', 'AFG_0025_0140_lr02_v001_1080.exr', 'AFG_0025_0140_lr02_v001_1110.exr', 'AFG_0025_0140_lr02_v001_1051.exr', 'AFG_0025_0140_lr02_v001_1061.exr', 'AFG_0025_0140_lr02_v001_1120.exr', 'AFG_0025_0140_lr02_v001_1074.exr', 'AFG_0025_0140_lr02_v001_1060.exr', 'AFG_0025_0140_lr02_v001_1121.exr', '.DS_Store', 'AFG_0025_0140_lr02_v001_1134.exr', 'AFG_0025_0140_lr02_v001_1075.exr', 'AFG_0025_0140_lr02_v001_1094.exr', 'AFG_0025_0140_lr02_v001_1045.exr', 'AFG_0025_0140_lr02_v001_1104.exr', 'AFG_0025_0140_lr02_v001_1111.exr', 'AFG_0025_0140_lr02_v001_1050.exr', 'AFG_0025_0140_lr02_v001_1081.exr', 'AFG_0025_0140_lr02_v001_1087.exr', 'AFG_0025_0140_lr02_v001_1117.exr', 'AFG_0025_0140_lr02_v001_1056.exr', 'AFG_0025_0140_lr02_v001_1043.exr', 'AFG_0025_0140_lr02_v001_1088.exr', 'AFG_0025_0140_lr02_v001_1102.exr', 'AFG_0025_0140_lr02_v001_1118.exr', 'AFG_0025_0140_lr02_v001_1059.exr', 'AFG_0025_0140_lr02_v001_1092.exr', 'AFG_0025_0140_lr02_v001_1132.exr', 'AFG_0025_0140_lr02_v001_1073.exr', 'AFG_0025_0140_lr02_v001_1069.exr', 'AFG_0025_0140_lr02_v001_1128.exr', 'AFG_0025_0140_lr02_v001_1066.exr', 'AFG_0025_0140_lr02_v001_1127.exr', 'AFG_0025_0140_lr02_v001_1019.exr', 'AFG_0025_0140_lr02_v001_1003.exr', 'AFG_0025_0140_lr02_v001_1016.exr', 'AFG_0025_0140_lr02_v001_1026.exr', 'AFG_0025_0140_lr02_v001_1029.exr', 'AFG_0025_0140_lr02_v001_1033.exr', 'AFG_0025_0140_lr02_v001_1035.exr', 'AFG_0025_0140_lr02_v001_1020.exr', 'AFG_0025_0140_lr02_v001_1010.exr', 'AFG_0025_0140_lr02_v001_1005.exr',
	'a123Sequence.0001.exr',
	'b124Sequence.0015.exr',
	'b124Sequence.0018.exr',
	'b124Sequence.0019.exr',

	'123Sequence.0001.exr',
	'124Sequence.0002.exr',
	'124Sequence.0003.exr',

	'a123Sequence.00002.exr',
	'c124Sequence.00116_xwe.exr',
	'c124Sequence.00117_xf.exr',
	'c124Sequence.00115_x.exr',
	'c124Sequence.00116_x.exr',
	'a123Sequence.0003.exr',
	'a123Sequence.0004.exr',
	'a123Sequence.0005.exr',
	'f123Sequence.10004_four.exr',
	'f123Sequence.10005_four.exr',
	'a123Sequence0006.exr',

	'noDigitsInFilename.exr',
	'0001.exr',
	'0002.exr',
	'file_Name_0001',
	'file_Name_0002',
	'file_no_extension',
	'file_no_extension',
	'lutfile.exr',
	'lut111.lut',
	'lut_file.00001.lut',
	'lut_file.00002.lut',
	'somefile.txt',
	'FileName0001segueance.exr',
	'FileName0002segueance.exr',
	'FileName0003segueance.exr',

	'xxSequence.9999.exr',
	'xxSequence.10000.exr',
];

getGroupedFileName(list)


