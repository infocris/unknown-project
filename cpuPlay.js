
function cpuPlay(gameboard)
{
	var i = 0;
	var l = 0;
	var keys = {};
	var stack = [];
	var async = false;
	var sync = false;
	var timeout = 10;
	var maxdepth, max_actions;
	
	var turn = gameboard.turn;
	
//	maxdepth = 2;
//	max_actions = 120;
	
//	maxdepth = 5;
//	max_actions = 10;
	
	timeout = 5;
//	maxdepth = 8;
//	maxdepth = 25;
	maxdepth = 63;
	max_actions = 63;
	max_actions = 64;
	
	maxdepth = 5;
	max_actions = 5000;

	gameboard.calcScores();
	
	if (gameboard.max_scores.p1 == gameboard.scores.p1) {
		return;
	}
	if (gameboard.max_scores.p2 == gameboard.scores.p2) {
		return;
	}
	
	var crawl = {
//		result: createResult(gameboard),
		turn: gameboard.turn,
		depth: 0,
		crawl: true
	};
	stack.push(crawl);
	
	var loop = true;
	sync = true;
	
	if (sync) {
		while (loop) {
			step(function () {
				loop = false;
				console.log(i, crawl);
				
//				return;
				(function (move) {
					move.to[move.action](move.from);
				})(crawl.result.best.move);
				gameboard.calcScores();
				gameboard.nextTurn();
			});
		}
		return;
		
		crawl = {
			turn: gameboard.turn,
			depth: 0,
			crawl: true
		};
		i = 0;
		keys = {};
		stack.push(crawl);
	}
	
	async = true;
	var interval = setInterval(function () {
		step(function () {
			clearInterval(interval);
			console.log(i, crawl);
			
			return;
			(function (move) {
				move.to[move.action](move.from);
				if (async) {
					gameboard.scope.$apply();
				}
			})(crawl.result.best.move);
			gameboard.nextTurn();
		});
	}, timeout);
	
	function step(onFinish)
	{
		var context = stack.pop();
		if (!context) {
			return;
		}
		if (context.endloop) {
			minMax(context);
			if (context.depth == 0) {
				onFinish();
				return;
			}
			return;
		}
		if (context.undo) {
//			console.log("undo", context);
			gameboard.undo();
			if (async) {
				gameboard.scope.$apply();
			}
			return;
		}
		
		if (context.crawl) {
//			console.log("depth", context.depth);
			if (i > max_actions) {
				context.leaf = true;
				context.scoring = createScoring(gameboard, turn);
				return;
			}
			if (context.depth > maxdepth) {
				context.leaf = true;
				context.scoring = createScoring(gameboard, turn);
//				console.log("hit depth", context);
				return;
			}
//			var next_turn = context.turn == P1 ? P2: P1;
			
			var j = 0;
			_.each(crawlActions(context.turn == P1 ? gameboard.p1: gameboard.p2, false), function (e) {
				if (i > max_actions) {
					return;
				}
				var action = ({
					parent: context,
					turn: context.turn,
					to: e.to,
					action: e.action,
					from: e.from,
					depth: context.depth
				});
				if (j == 0) {
					context.moves = [];
					context.endloop = true;
					stack.push(context);
				}
				context.moves.push(action);
				stack.push(action);
				i ++;
				j ++;
			})
			
			if (j == 0) {
				context.noMoves = true;
				context.scoring = createScoring(gameboard, turn);
//				console.log("no moves", context);
			}
			
			return;
		}
		if (context.action) {
//			if (context.undo) {
//				gameboard.undo();
//				gameboard.scope.$apply();
//				minMax(context);
//				return;
//			}
			
			var key = '';
			
			l ++;
//			console.log("play move", l, context);
			context.to[context.action](context.from);
			
			if (async) {
				gameboard.scope.$apply();
			}
			
//			context.undo = true;
//			stack.push(context);
			stack.push({undo: true, l: l});
//			i ++;
			
			_.each(gameboard.configuration.players, function (v, k) {
				key += k + ':' + v[0] + '.';
			})
			if (keys[key]) {
				context.alreadyExplored = keys[key];
//				if (keys[key].result) {
//					context.result = keys[key].result;
//				} else {
//					context.result = {status: "ALREADY_EXPLORED"};
//				}
//				callback({status: "ALREADY_EXPLORED"});
				return;
			}
			
//			var result = context.scoring = createScoring(gameboard);
			
			keys[key] = context;
			
			stack.push(context.child = {
//				result: result,
				parent: context,
				turn: context.turn == P1 ? P2: P1,
				depth: context.depth + 1,
				crawl: true
			});
		}
	}
}

function createScoring(gameboard, turn)
{
	gameboard.calcScores();
	var result = {
		max_scores: {
			p1: gameboard.max_scores.p1,
			p2: gameboard.max_scores.p2
		},
		scores: {
			p1: gameboard.scores.p1,
			p2: gameboard.scores.p2
		}
	};
	if (turn == P2) {
		result.score = result.max_scores.p2 - result.max_scores.p1;
	} else {
		result.score = result.max_scores.p1 - result.max_scores.p2;
	}
//	console.log(result);
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
	var result, score, scoring;
//	console.log(context);
	_.each(context.moves, function (currentMove) {
		if (!currentMove.scoring) {
			if (currentMove.alreadyExplored) {
				if (!currentMove.alreadyExplored.scoring) {
//					console.log("b", currentMove);
					return;
				} else {
					scoring = currentMove.scoring = currentMove.alreadyExplored.scoring;
				}
			} else if (!currentMove.child.scoring) {
				console.log("a", currentMove);
				return;
			} else {
				scoring = currentMove.scoring = currentMove.child.scoring;
			}
		} else {
			scoring = currentMove.scoring;
		}
		score = scoring.score;
//		console.log(scoring);
		
		if (!currentMove.parent.result) {
			result = currentMove.parent.result = {
				best: {
					move: currentMove,
					score: score
				},
				worst: {
					move: currentMove,
					score: score
				}
			}
			currentMove.parent.scoring = scoring;
			return;
		}
		
		result = currentMove.parent.result;
		
		if (context.depth % 2 == 0) {
			if (result.best.score < score) {
				result.best.move = currentMove;
				result.best.score = score;
				currentMove.parent.scoring = scoring;
//				console.log(score);
			}
			if (result.worst.score > score) {
				result.worst.move = currentMove;
				result.worst.score = score;
			}
		} else {
			if (result.best.score > score) {
				result.best.move = currentMove;
				result.best.score = score;
				currentMove.parent.scoring = scoring;
//				console.log(score);
			}
			if (result.worst.score < score) {
				result.worst.move = currentMove;
				result.worst.score = score;
			}
		}
		
		return;
		
		if (currentMove.child.result) {
			console.log(currentMove);
			currentMove.result = currentMove.child.result;
			score = currentMove.result.score;
			if (typeof score != "number") {
				console.log(typeof score);
				console.log(currentMove);
				return;
			}
			if (!context.result) {
				result = context.result = {
					best: {
						move: currentMove,
						score: score
					},
					worst: {
						move: currentMove,
						score: score
					},
					score: score
				}
			} else {
				if (context.depth % 2 == 0) {
					if (result.best.score < score) {
						result.best.move = currentMove;
						result.best.score = score;
						result.score = score;
					}
					if (result.worst.score > score) {
						result.worst.move = currentMove;
						result.worst.score = score;
					}
				} else {
					if (result.best.score > score) {
						result.best.move = currentMove;
						result.best.score = score;
						result.score = score;
					}
					if (result.worst.score < score) {
						result.worst.move = currentMove;
						result.worst.score = score;
					}
				}
			}
		} else {
			console.log(currentMove);
		}
//		return;
//		
//		if (!result.best) {
//			result.best = currentMove;
//			result.worst = currentMove;
//		} else {
////			console.log(context.depth,
////					result.best.result.score,
////					result.worst.result.score,
////					currentMove.result.score);
//			
//			if (context.depth % 2 == 1) {
//				if (result.best.result.score < currentMove.result.score) { result.best = currentMove; }
//				if (result.worst.result.score > currentMove.result.score) { result.worst = currentMove; }
//			} else {
//				if (result.best.result.score > currentMove.result.score) { result.best = currentMove; }
//				if (result.worst.result.score < currentMove.result.score) { result.worst = currentMove; }
//			}
//		}
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