I made this 27 May 2013 and haven't done anything with it since. Learned a lot since then, so I might revisit this with more wisdom. Immutability, less JavaScripty, everything a tree structure.

# piecake

Current state of development: **Very Early**; too early to even assign a version number.

## Minimalism

Every code element should be essential to correctness, readability, and/or maintainability.

There is no var keyword. Use the bind operator to create a bind statement whenever you want to create a variable local to the current function.

	someNumber := 15; // equivalent to var someNumber = 15; in JavaScript

There is no function keyword. Piecake uses a backslash to begin a function expression.
The parameter list uses no parentheses.
When the parameter list is empty, it's completely absent.

	doStuff := \{
		return complexManipulations();
	};
	
Parameters are comma-separated, with an optional comma at the end.

	doOtherStuff := \ a, b, {
		return modeComplexStuff();
	};

	someFunction := \ someValue {
		doStuff();
		return doOtherStuff(someValue, someNumber);
	};
	
A function can also be declared by a backslash followed by an expression. That function will evaluate the expression each time it's executed.

	objectFactory := \({});
	arrayFactory := \[5, 6, 7, 8];
	now = \(Date.now());
	
	add := \x\y(x+y); // Expression functions are declared using 
	addFive := add(5);
	twelve := addFive(7);
	eight := addFive(3);

## Flexibility

Must allow behaviors not present in all vanilla JavaScript implementations.

Customizable flow control:

	watch \{ // Paren-free form not yet available.
		doAsynchronousStuff();
	};

Scope-limited extension methods:

	setTimeout(\{
		console.log(15);
	}, 10.seconds()); // Extensions not yet implemented.

## Consistency

Very few constructs should have optional syntax. There are no function declarations, only function expressions, which may or may not be bound to a named variable.

One notable exception: Optional commas are allowed at the end of array and object literals, as well as in parameter lists, with the goal that no code element's structure should be dependent on the code that follows it, while compromising with the principle of minimalism.
