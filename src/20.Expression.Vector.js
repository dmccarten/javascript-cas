Expression.Vector = function (e) {
	e.__proto__ = Expression.Vector.prototype;
	return e;
};

Expression.Vector.prototype = Object.create(Expression.prototype);
Expression.Vector.prototype.constructor = Expression.Vector;
Expression.Vector.prototype[','] = function (x) {
	this[this.length] = x;
	return this;
};
Expression.Vector.prototype.differentiate = function (x) {
	return Expression.Vector(Array.prototype.map.call(this, function (c) {
		return c.differentiate(x);
	}));
};
Expression.Vector.prototype.cross = function (x) {
	if (this.length !== 3 || x.length !== 3) {
		throw('Cross product only defined for 3D vectors.');
	}
	/*
	i   j    k
	x   y    z
	a   b    c
	
	= (yc - zb, za - xc, xb - ya)
	*/
	
	return new Expression.Vector([
		this[1]['*'](x[2])['-'](this[2]['*'](x[1])),
		this[2]['*'](x[0])['-'](this[0]['*'](x[2])),
		this[0]['*'](x[1])['-'](this[1]['*'](x[0]))
	]);
};
Expression.Vector.prototype.default = function (x) {
	var l = this.length;
	if (x instanceof Expression.Vector) {
		// Dot product
		if(l !== x.length) {
			throw('Vector Dimension mismatch.');
		}
		var i;
		var sum = Global.Zero;
		for (i = 0; i < l; i++) {
			sum = sum['+'](
				(this[i]) ['*'] (x[i])
			);
		}
		return sum;
	} else if (x instanceof Expression.Matrix) {
		
	} else {
		return Expression.Vector(Array.prototype.map.call(this, function (c) {
			return c['*'](x);
		}));
	}
};
Expression.Vector.prototype['*'] = Expression.Vector.prototype.default;
Expression.Vector.prototype['+'] = function (x, op) {
	var l = this.length;
	if(l != x.length) {
		throw('Vector Dimension mismatch.');
	}
	var i;
	var n = new Array(l);
	for (i = 0; i < l; i++) {
		n[i] = this[i][op || '+'](e[i]);
	}
	return Expression.Vector(n);
};
Expression.Vector.prototype['-'] = function (x) {
	return Expression.Vector.prototype.call(this, x, '-');
};
Expression.Vector.prototype['/'] = function (x) {
	if (x instanceof Expression.Vector) {
		throw('Vector division not defined');
	}
	return Expression.Vector(Array.prototype.map.call(this, function (c) {
		return c['/'](x);
	}));
	
};
Expression.Vector.prototype['^'] = function (x) {
	if(x instanceof Expression.Integer) {
		if(x.a === 0) {
			throw('Raised to zero power');
		}
		if(x.a === 1) {
			return this;
		}
		if (x.a === 2) {
			var S = Global.Zero;
			var i, l = this.length;
			for (i = 0; i < l; i++) {
				S = S['+'](this[i]['^'](x));
			}
			return S;
		} else {
			return this['^'](new Expression.Integer(x.a - 1))['*'](this);
		}
	} else if(x instanceof Expression.Rational){
		return this['^'](x.a)['^'](Global.One['/'](x.b));
	} else if (x.constructor === Expression.NumericalComplex) {
		return new Expression.Complex(this.value + x._real, x._imag);
	} else if(x.constructor === Expression.List.ComplexCartesian) {
		// commute
		return (x)['+'](this);
	} else if(x.constructor === Expression.List.ComplexPolar) {	
		return (x)['+'](this);
	} else if(x.constructor === Expression.List.Real) {
		return (x)['+'](this);
	} else if(x.constructor === Expression.Symbol.Real) {
		return (x)['+'](this);
	} else if(x.constructor === Expression.List) {
		return (x)['+'](this);
	} else {
		throw ('Unknown Type for Vector ^');
	}
	return this.default(this['^'](x['-'](Global.One)));
};
Expression.Vector.prototype.apply = function(operator, e) {
	var l = this.length;
	switch (operator) {
		case ',':
			//Array.prototype.push.apply(this, [e]);
			//Faster:
			//MODIFIES!!!!!!!!!
			this[l] = e;
			return this;
		case undefined:
		case '*':
			if(l != e.length) {
				throw('Vector Dimension mismatch.');
			}
			var i;
			var sum = M.Global.Zero;
			for (i = 0; i < l; i++) {
				sum = sum.apply('+', this[i].apply('*', e[i]));
			}
			return sum;
		case '+':
		case '-':
			if(l != e.length) {
				throw('Vector Dimension mismatch.');
			}
			var i;
			var n = new Array(l);
			for (i = 0; i < l; i++) {
				n[i] = this[i].apply(operator, e[i]);
			}
			return Expression.Vector(n);
		case '/':
		case '^':
		default:
			throw('Vector operation not allowed.');
	}
};

Expression.Vector.prototype.realimag = function(){
	var l = this.length;
	var _x = new Array(l);
	var _y = new Array(l);
	var i;
	for(i = 0; i < l; i++) {
		var ri = this[i].realimag();
		_x[i] = ri[0];
		_y[i] = ri[1];
	}
	return Expression.List.ComplexCartesian([
		Expression.Vector(_x),
		Expression.Vector(_y)
	]);
};
