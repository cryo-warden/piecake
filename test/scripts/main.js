(function (global) {
	requirejs.config({
		paths: {
			'piecake': '../..'
		}
	});

	requirejs([
		'./jquery',
		'piecake/lib/keenUtils', 'piecake/lib/main'
	], function (
		$,
		keen, piecake
	) {
		global.keen = keen;
		global.piecake = piecake;
		global.test = function (piecakeCode) {
			console.log(piecakeCode);
			var jsCode = piecake(piecakeCode); 
			console.log(jsCode);
			return jsCode;
		};
		global.testEval = function (piecakeCode) {
			var jsCode = test(piecakeCode);
			var $newJS = $('<script>')
			.attr('type', 'text/javascript')
			.html(jsCode);
			$('head').append($newJS);
		};
		
		var $source = $('#piecakeCodeSource');
		var $target = $('#jsCodeTarget');
		var $time = $('#buildTime');
		$('body').on('click', '#doTest', function () {
			var source = $source.val();
			var start = +new Date;
			var jsCode = piecake(source)
			var end = +new Date;
			$target.html(jsCode);
			$time.text(end - start);
		});
	});
}(this));
