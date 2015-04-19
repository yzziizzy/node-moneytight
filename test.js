
var mt = require('./index.js');
var colors = require('colors');
var bignum = require('bignum');


var a = new mt(-123.456);
var res = a.inspect(); // internally calls toString and formatDollars

console.log(" input: -123.456 \n<MoneyTight -$123.46>");
console.log(res);
console.log("\n")

/* formatting: 

$0.02 $0.12 and negatives
$1.02 $123.00 and negatives
$12,345.67 $1,234,567.89 and negatives

*/

test_format(.02 , '$0.02');
test_format(.12, '$0.12');
test_format(1.02, '$1.02');
test_format(123.00, '$123.00');
test_format(12345.67, '$12,345.67');
test_format(1234567.89, '$1,234,567.89');
test_format(-123.456, '-$123.45');


process.exit();

function test_format(dollars, expected) {
	var a = new mt(dollars);
	var actual = a.formatDollars();
	var color = actual == expected ? 'green' : 'red';
	console.log(('expected: ' + expected)[color]);
	console.log(('actual:   ' + actual)[color]);
	console.log('');
}


console.log("-- div0sum --\n-- problem: 10 / 3 = 3.33 * 3 = 9.99 < 10\n")


var a = new mt(10);
var res = a.div0sum(3);

console.log(" input: 10 / 3\n expected: [3.34, 3.33, 3.33]");
console.log(res);
console.log("\n")

var a = new mt(10.01);
var res = a.div0sum(3);

console.log(" input: 10.01 / 3\n expected: [3.34, 3.34, 3.33]");
console.log(res);
console.log("\n")

console.log("-- divRem --\n")
var a = new mt(10.01);
var res = a.divRem(3);
console.log(" input: 10.01 / 3\n expected: [3.33, .02]");
console.log(res);
console.log("\n")

 


