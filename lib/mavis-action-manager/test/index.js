
var _TOTAL=200;

describe('ActionManager', function() {
	it("should initialize", function(){
		var length = 30;

		var limit = 30;

			var next = 0;
			var i=0;
			do {
			   	next = runner(limit, next);
			   	i++;
			} while (i < 20);


	});

});


function runner(limit, skip ) {


	var nextSkip = limit * (skip/limit) + limit
	if(nextSkip <= _TOTAL) {
		console.log(skip, 'next', nextSkip)
	}
	if(nextSkip >= _TOTAL) {
	   	console.log(skip,'first', 0)
    }

	return nextSkip;
}
