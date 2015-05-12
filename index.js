
var bignum = require('bignum');



var MoneyTight = function(opts) {
	
	var n = 0;
	
	// checks for opts being a bignum or moneytight 
	if(typeof opts == 'object') {
		if(opts instanceof bignum) {
			this.amt = bignum(opts);
			return this;
		};
		
		if(opts instanceof MoneyTight) {
			this.amt = bignum(opts.amt);
			return this;
		};
	}
	else {
		// tricks to aviod rounding errors: try -123.456
		n = bignum(opts * 1000).div(10);
	}
	// need to include option of how many decimals are stored internally
	
	
	
	this.amt = bignum(n, 10); // stored in cents, for now
	

	
	return this;
	
};




MoneyTight.prototype.roundUp = function(int) {
};
MoneyTight.prototype.roundDown = function(int) {
};
MoneyTight.prototype.roundNearest = function(int) {
};

MoneyTight.prototype.fromInt = function(int) {
	this.amt = bignum(int, 10).mul(100);
	return this;
};
MoneyTight.prototype.toInt = function(int) {
	return parseInt(this.amt.div(100));
};


MoneyTight.prototype.formatDollars = function() {
	var $ = this.toString();
	if(this.amt.lt(0)) {
		$ = '-$' + $.substr(1, $.length);
	}
	else {
		$ = '$' + $;
	}
	return $;
};


MoneyTight.prototype.toString = function(base) { // base is ignored; money is always decimal.
	var str = this.amt.toString();
	var x = 3 - str.length;
	if(x > 0) {
		str = (x > 1 ? '00' : '0') + str ;
	}
	return str.replace(/\B(\d\d)$/, '.$1').replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


MoneyTight.prototype.inspect = function () {
	return '<MoneyTight ' + this.formatDollars() + '>';
};

MoneyTight.prototype.add = function(n) { // for now, assumes in cents
	this.amt = this.amt.add(n);
	return this;
};

MoneyTight.prototype.sub = function(n) { // for now, assumes in cents
	this.amt = this.amt.sub(n);
	return this;
};


// ratio is for dividing two monetary values to arrive at a unitless floating point number
MoneyTight.prototype.ratio = function(n) { // for now, assumes in cents
	return parseFloat(this.amt) / parseFloat(n);
};

// ratio is for dividing two monetary values to arrive at a unitless floating point number
// return value is in percentage points
MoneyTight.prototype.ratioPercent = function(n) { // for now, assumes in cents
	return this.ratio(n) / 100;
};

// div is for dividing money with a number resulting in money
// this version is not zero-sum, eg: 10 / 3 = 3.33 * 3 = 9.99 != 10
MoneyTight.prototype.div = function(n) { // in units not cents
	
	
};

// this version of division does not leak cents. the remainder is distributed
// among the divided parts which are returned as an array. largest ones first.
// you probably shouldn't divide by large numbers since an array of that length is created.
// integer divisors only. the divisor is rounded automatically.
MoneyTight.prototype.div0sum = function(divisor) { // in units not cents
	divisor = Math.round(divisor);
	var part = this.amt.div(divisor);
	var rem = this.amt.mod(divisor);
	
	var ret = [];
	for(var i = 0; i < divisor; i++) {
		var n = new MoneyTight(part);
		if(rem-- > 0) {
			n.add(1);
		}
		ret.push(n);
	};
	
	return ret;
};

// this version returns the remainder too. [quotient, remainder]
MoneyTight.prototype.divRem = function(divisor) { // in units not cents
	var quotient = this.amt.div(divisor);
	var remainder = this.amt.mod(divisor);
	
	return [new MoneyTight(quotient), new MoneyTight(remainder)];
};



// sums an array of values. cuts out all the needless conversions.
// can handle MoneyTight and BigNum instances, as well as ints, strings, and floats
// bignums are treated as cents. floats and strings are dollars.
MoneyTight.prototype.sum = function(arr) { // in units not cents
	
	var sum = bignum(0);
	
	var len = arr.length;
	for(var i = 0; i < len; i++) {
		sum = sum.add(getNum(arr[i]));
	};
	
	return new MoneyTight(sum);
};



function monthlyPayment(loan_amount, monthly_interest, num_payments) {
	return (loan_amount * monthly_interest) / (1 - Math.pow(1 + monthly_interest, -num_payments) );
}
function piRatios(balance, monthly_interest, payment_amount) {
	var i_p = balance * monthly_interest;
	return {
		principle: payment_amount - i_p,
		interest: i_p,
		new_balance: balance - payment_amount + i_p,
	};
}


// calculate an amortization table without losing any cents 
// currently, there might be rounding errors on very large numbers internally. don't calculate the national debt with this.
MoneyTight.prototype.amortTable = function(loanAmount, APR, months) {
	
	// BUG need to sanitize and convert inputs
	
	
	var o = {
		principle: [],
		interest: [],
		payment: [],
		starting_balance: [],
		ending_balance: [],
	};
	
	APR /= 12; // you can do this with APR's
	
	var payment = monthlyPayment(loanAmount, APR, months);
	
	var plow = Math.floor(payment);
	var phigh = Math.ceil(payment);
	
	var acc = 0;
	
	for(var i = 0; i < months; i++) {
		
		var p_i = piRatios(loanAmount, APR, payment);
		
		o.starting_balance[i] = loanAmount;
		loanAmount = p_i.new_balance;
		
		o.payment[i] = payment;
		o.principle[i] = p_i.principle;
		o.interest[i] = p_i.interest;
		o.ending_balance[i] = p_i.new_balance;
		o.period[i] = i;
	}
	
	return o;
	
};


function forceNum(x) {
	if(typeof x == 'object') {
		if(x instanceof bignum) {
			return x;
		};
		if(x instanceof MoneyTight) {
			return x.amt;
		}
	}
	
	return bignum(parseFloat(x) * 100);
}



module.exports = MoneyTight;




