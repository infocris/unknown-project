
	function cpuPlay()
	{
//		actions = crawlActions(gameboard.turn == P1 ? p1: p2);
//		_.each(actions, function (e) {
//			switch (e.action) {
//			case 'jump':
//				e.to.states.hl_jump = true;
//				break;
//			case 'duplicate':
//				e.to.states.hl_duplicate = true;
//				break;
//			}
//		})
		var i = 0;
		var keys = {};
		
		function recursive(curr_turn, depth, callback)
		{
			var key = '';
			_.each(conf.players, function (v, k) {
				key += k + ':' + v[0] + '.';
			})
			if (keys[key]) {
				callback({status: "ALREADY_EXPLORED"});
				return;
			}
			
			if (i < 10000) {
				i ++;
			} else {
				callback({status: "ITERATION_LIMIT"});
				return;
			}
			
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
				moves: [],
				best: null,
				worst: null
			};
			
			keys[key] = result;
			
			result.score = result.max_scores.p2 - result.max_scores.p1;
			
			if (depth > 2) {
				result.status = "DEPTH_LIMIT";
				callback(result);
				return;
			}
			
			var j = 0;
			
//			console.log(curr_turn);
			_.each(crawlActions(curr_turn == P1 ? p1: p2, false), function (e) {
				j ++;
				e.to[e.action](e.from);
				invertTurn();
				calcScores();
				recursive(curr_turn == P1 ? P2: P1, depth + 1, function (currentMove) {
					currentMove.move = e;
					currentMove.parent = result;
					result.moves.push(currentMove);
				});
				minMax(result, depth);
//				invertTurn();
				gameboard.undo();
			})
			callback(result);
		}
		
		recursive(gameboard.turn, 0, function (result) {
			if (result.best) {
//				(function (move) {
//					move.to[move.action](move.from);
//				})(result.best.move);
//				gameboard.nextTurn();
//				return;
				
				var curr = result;
				var stack = [0];
				var d = 0;
				var k = 0;
				var l = 0, n = 0;
				var interval = setInterval(function () {
					var e = curr.moves[stack[d]];
//					console.log(e.status);
					l ++;
					e.move.to[e.move.action](e.move.from);
//					invertTurn();
					e.move.to.i = stack[d];
					e.move.to.depth = d;
					calcScores();
//					console.log(e.move);
					gameboard.scope.$apply();
					if (e.status == "OK") {
//						console.log('a');
						curr = e;
						stack.push(0);
						d ++;
					} else {
//						console.log('b');
//						console.log('b', e, result.moves, d, stack[d]);
						stack[d] ++;
						gameboard.undo();
//						invertTurn();
						n --;
						if (!curr.moves[stack[d]]) {
//							console.log('c');
							stack.pop();
							d --;
//							if (stack.length > 0) {
//							}
							if (stack.length == 0) {
//								gameboard.undo();
//								console.log(l, n);
								clearInterval(interval);
								console.log(result);
								(function (move) {
									move.to[move.action](move.from);
//									invertTurn();
								})(result.best.move);
								gameboard.nextTurn();
								gameboard.scope.$apply();
								return;
							} else {
								curr = e.parent;
								gameboard.undo();
//								invertTurn();
								n --;
							}
						}
					}
					k ++;
//					if (k > 100) {
//						clearInterval(interval);
//					}
				}, 1000);
				
//				(function (move) {
//					move.to[move.action](move.from);
//				})(result.best.move);
//				gameboard.nextTurn();
			}
			console.log(i, result);
		});
		
//		var worst = recursive(gameboard.turn, 0).worst;
//		if (worst) {
//			console.log(worst);
//			worst.move.to[worst.move.action](worst.move.from);
//		}
		
//		console.log("aaaa");
//		console.log(actions);
		
	} // cpuPlay