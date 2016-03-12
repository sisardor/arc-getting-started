/* jshint ignore:start */
// jscs:disable
var chai = require('chai') , expect = chai.expect ,
	FileManager = require('../') , os = require('os') , fs = require('fs');

var tmp = os.tmpdir();
var dir = Math.floor(Math.random() * Math.pow(16, 4)).toString(16);


var testArray = [
	'/path/to/AFG_0001_0002_lr002_v001_1001.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1002.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1003.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1004.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1005.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1006.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1007.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1008.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1009.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1010.exr',
	'/path/to/AFG_0001_0002_lr002_v001_1011.exr', //1

	'/path/to/text11text.exr', //2
	'/path/to/34text.exr', //3
	'/path/to/text34.exr', //4

	'/path/to/text11text',//5
	'/path/to/34text',//6
	'/path/to/text34',//7

	'/path/to/1001',
	'/path/to/1002',
	'/path/to/1003',//8

	'/path/to/.text11text',//9
	'/path/to/.34text',//10
	'/path/to/.text34',//11

	'/path/to/__.exr', //12
	'/path/to/some text.exr',//13
	'/path/to/458.exr',//14
	'/path/to/.text',//15
]
var sar = [
	'/path/to/AFG_0001_0002_lr001_v001_1001.exr',
	'/path/to/AFG_0001_0002_lr001_v001_1002.exr',
]
describe('FileManager', function() {
	// describe('#readdir()', function() {
	// 	before(function(done) {
	// 		FileManager.mkdir(tmp + '/.test/' + dir, function(err) {
	// 			expect(err).to.be.a('null')
	// 			done()
	// 		});
	// 	})


	// 	it('should return true if path is directory (isDirectory)', function() {
	// 		var re = FileManager.isDirectory(tmp + '/.test/' + dir);
	// 		expect(re).to.equal(true);
	// 	});

	// 	it('should validate inclusion');

	// 	after(function() {
	// 		fs.rmdirSync(tmp + '/.test/' + dir)
	// 		fs.rmdirSync(tmp + '/.test')
	// 	})

	// })
	// describe('#mkdir()', function() {
	// 	it("should create a directory recursively", function(done) {
	// 		FileManager.mkdir('.test_dir/foo/bar',  function(err) {
	// 			expect(err).to.equal(null);

	// 			FileManager.readdir('.test_dir', function(err, array) {
	// 				if (err) throw err;
	// 				expect(array).to.deep.equal([
	// 		            "foo"
	// 		        ]);
	// 				done();
	// 			})
	// 		});
	// 	});

	// 	after(function() {
	// 		fs.rmdirSync('.test_dir/foo/bar')
	// 		fs.rmdirSync('.test_dir/foo')
	// 		fs.rmdirSync('.test_dir/')
	// 	})
	// })

	// describe('#move, #copy, #delete', function() {
	// 	it('should move file or directory to new location')
	// 	it('should copy file or directory to new location')
	// 	it('should delete file or directory')
	// });

	// describe("#scan()", function() {
	// 	before(function() {
	// 		if (!fs.existsSync(".test_files")) {
	// 			fs.mkdirSync(".test_files");
	// 			fs.writeFileSync(".test_files/a", "");
	// 			fs.writeFileSync(".test_files/b", "");
	// 			fs.mkdirSync(".test_files/dir");
	// 			fs.writeFileSync(".test_files/dir/c", "");
	// 			fs.mkdirSync(".test_files/dir2");
	// 			fs.writeFileSync(".test_files/dir2/d", "");
	// 		}
	// 	});


	// 	it("should retrieve the files from a path", function(done) {
	// 		FileManager.scan(".test_files", 0, true, function(err, flist) {
	// 			expect(flist).to.deep.equal([
	// 			".test_files/a",
	// 			".test_files/b",
	// 			".test_files/dir/c",
	// 			".test_files/dir2/d"
	// 			]);
	// 			done();
	// 		});
	// 	});
	// 	it("should retrieve the directory names from a path", function(done) {
	// 		FileManager.scan(".test_files", 3, false, function(err, flist) {
	// 			expect(flist).to.deep.equal([
	// 			".test_files/dir",
	// 			".test_files/dir2"
	// 			]);
	// 			done();
	// 		});
	// 	});


	// 	after(function() {
	// 		fs.unlinkSync(".test_files/dir/c");
	// 		fs.rmdirSync(".test_files/dir");
	// 		fs.unlinkSync(".test_files/dir2/d");
	// 		fs.rmdirSync(".test_files/dir2");
	// 		fs.unlinkSync(".test_files/a");
	// 		fs.unlinkSync(".test_files/b");
	// 		fs.rmdirSync(".test_files");
	// 	});
	// });
	describe('#lss()', function() {
		before(function(done) {
			done()
		})

		it('should return true if path is directory (isDirectory)', function(){
			console.log('Array length %s \nShould be: %s\nwithout seq: %s', testArray.length, 15, 0)
			FileManager.lss(testArray, function(err, res) {
				if(err) {
					console.log(err)
				}
				else {
					console.log(res)
					console.log('\ntotal length: %s', res.length)
				}
			})
		});

		it('should validate inclusion');

		after(function() {
		})

	})
});
