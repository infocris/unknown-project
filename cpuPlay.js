
function cpuPlay(gameboard)
{
	var i = 0;
	var keys = {};
	var stack = [];
	var async = false;
	var crawl = {
		turn: gameboard.turn,
		depth: 0,
		crawl: true,
		result: createResult(gameboard)
	};
	stack.push(crawl);
//	console.log(crawl.result);
//	recursive(gameboard.turn, 0, function (result) {
//	});
	var loop = true;
//	while (loop) {
//		step(function () {
//			loop = false;
//			(function (move) {
//				move.to[move.action](move.from);
//			})(crawl.result.best);
//			gameboard.nextTurn();
//		});
//	}
//	return;
	
	async = true;
	var interval = setInterval(function () {
		step(function () {
			clearInterval(interval);
			(function (move) {
				move.to[move.action](move.from);
				if (async) {
					gameboard.scope.$apply();
				}
			})(crawl.result.best);
			gameboard.nextTurn();
		});
	}, 10);
	
	function step(onFinish)
	{
		var context = stack.pop();
		if (!context) {
			return;
		}
		if (context.endloop) {
//			console.log('aaa');
			minMax(context);
//			console.log(context);
			if (context.depth == 0) {
				onFinish();
				return;
			}
			return;
		}
		if (context.done) {
			gameboard.undo();
			if (async) {
				gameboard.scope.$apply();
			}
			return;
		}
		
//		console.log(context);
//		console.log(context.depth);
		if (context.crawl) {
//			console.log(context);
			if (context.depth > 1) {
				return;
			}
//			var next_turn = context.turn == P1 ? P2: P1;
			context.moves = [];
			context.endloop = true;
			stack.push(context);
			_.each(crawlActions(context.turn == P1 ? gameboard.p1: gameboard.p2, false), function (e) {
				var action = ({
					parent: context,
					turn: context.turn,
					to: e.to,
					action: e.action,
					from: e.from,
					depth: context.depth
				});
				context.moves.push(action);
				stack.push(action);
			})
			
			return;
		}
		if (context.action) {
//			if (context.done) {
//				gameboard.undo();
//				gameboard.scope.$apply();
//				minMax(context);
//				return;
//			}
			
			var key = '';
			
			context.to[context.action](context.from);
			
			_.each(gameboard.configuration.players, function (v, k) {
				key += k + ':' + v[0] + '.';
			})
			if (keys[key]) {
//				callback({status: "ALREADY_EXPLORED"});
				return;
			}
			
			var result = context.result = createResult(gameboard);
			
			keys[key] = context;
			
			if (async) {
				gameboard.scope.$apply();
			}
			
			context.done = true;
			stack.push(context);
			
			stack.push({
				parent: context,
				turn: context.turn == P1 ? P2: P1,
				depth: context.depth + 1,
				crawl: true,
				result: result
			});
		}
	}
}

function createResult(gameboard)
{
	gameboard.calcScores();
	var result = {
		status: "OK",
		max_scores: {
			p1: gameboard.max_scores.p1,
			p2: gameboard.max_scores.p2
		},
		scores: {
			p1: gameboard.scores.p1,
			p2: gameboard.scores.p2
		},
		best: null,
		worst: null
	};
	result.score = result.max_scores.p2 - result.max_scores.p1;
	return result;
}
function crawlActions(items, arg1)
{
	var res = {};
	_.each(items, function (from) {
		if (!arg1) {
			from.eachJump(function (slot) {
				if (slot.type == EMPTY) {
					res[slot.xy()] = {action: "jump", to: slot, from: from};
				}
			});
		}
		from.eachAround(function (slot) {
			if (slot.type == EMPTY) {
				res[slot.xy()] = {action: "duplicate", to: slot, from: from};
			}
		});
	})
//	console.log(res);
	return res;
}
function minMax(context)
{
	var result = context.result;
	_.each(context.moves, function (currentMove) {
//		console.log(currentMove);
		if (!result.best) {
			result.best = currentMove;
			result.worst = currentMove;
		} else {
//			console.log(context.depth,
//					result.best.result.score,
//					result.worst.result.score,
//					currentMove.result.score);
			
			if (context.depth % 2 == 1) {
				if (result.best.result.score < currentMove.result.score) { result.best = currentMove; }
				if (result.worst.result.score > currentMove.result.score) { result.worst = currentMove; }
			} else {
				if (result.best.result.score > currentMove.result.score) { result.best = currentMove; }
				if (result.worst.result.score < currentMove.result.score) { result.worst = currentMove; }
			}
		}
	})
}
//function minMax(result, depth)
//{
//	_.each(result.moves, function (currentMove) {
//		if (!result.best) {
//			result.best = currentMove;
//			result.worst = currentMove;
//		} else {
//			if (depth % 2 == 0) {
//				if (result.best.score < currentMove.score) { result.best = currentMove; }
//				if (result.worst.score > currentMove.score) { result.worst = currentMove; }
//			} else {
//				if (result.best.score > currentMove.score) { result.best = currentMove; }
//				if (result.worst.score < currentMove.score) { result.worst = currentMove; }
//			}
//		}
//	})
//}