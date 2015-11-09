
var P1 = {id: 'p1', serialize: 1};
var P2 = {id: 'p2', serialize: 2};
var EMPTY = {id: 'empty'};
var HOLE = {id: 'hole', serialize: 0};

(function () {

window.TRANSITIONS = {};
TRANSITIONS[EMPTY.id] = HOLE;
TRANSITIONS[HOLE.id] = P1;
TRANSITIONS[P1.id] = EMPTY;
//TRANSITIONS[P1.id] = P2;
TRANSITIONS[P2.id] = EMPTY;

window.REVERSE = {};
REVERSE[EMPTY.id] = EMPTY;
REVERSE[HOLE.id] = HOLE;
REVERSE[P1.id] = P2;
REVERSE[P2.id] = P1;

var SERIALIZED_TYPE = {};
SERIALIZED_TYPE[HOLE.serialize] = HOLE;
SERIALIZED_TYPE[P1.serialize] = P1;

function HistoryState(action, from, to, gameboard)
{
	var state = this;
//	this.action = action;
	this.type = from.type;
	this.turn = gameboard.turn;
	this.propagation = [];
	this.revert = function () {
		switch (action) {
		case "duplicate":
			to.changeType(EMPTY);
			break;
		case "jump":
			from.changeType(state.type);
			to.changeType(EMPTY);
			break;
		}
		_.each(state.propagation, function (slot, key) {
			var rev = REVERSE[state.type.id];
			slot.changeType(rev);
		})
		gameboard.turn = state.turn;
	}
}
window.GameBoard = function(conf, scope)
{
	var history = this.history = [];
	var table = this.iterator = [];
	var gameboard = this;
	var confSync = false;
	
	this.turn = P1;
	this.configuration = conf;
	this.p2_cpu = true;
	this.scope = scope;
	
	var p1 = {};
	var p2 = {};
	var scores = this.scores = {p1:0, p2:0};
	
	this.max_scores = {p1:0, p2:0};
	
	this.nextTurn = function () {
		gameboard.turn = gameboard.turn == P1 ? P2: P1;
		calcScores();
		initTurn();
		if (gameboard.turn == P2 && gameboard.p2_cpu) {
			cpuPlay();
		}
		if (gameboard.turn == P1 && gameboard.p1_cpu) {
			cpuPlay();
		}
	};
	
	this.undo = function () {
		var last = history.pop();
		if (last) {
			last.revert();
		}
	};
	
	(function () {
		var i, j, slot;
		for (i = 0; i < conf.w.length; i++) {
			for (j = 0; j < conf.h.length; j++) {
				slot = new Slot(i, j, EMPTY);
				table[slot.xy()] = slot;
			}
		}
	})();
	
	conf.holes = conf.holes || {};
	conf.players = conf.players || {};
	
	_.each(conf.holes, function (e) {
		setType(e[0], e[1], HOLE, true);
	})
	_.each(conf.players, function (value, key) {
		switch (value[0]) {
		case P1.serialize:
			setType(value[1], value[2], P1);
			break;
		case P2.serialize:
			setType(value[1], value[2], P2);
			break;
		}
	})
	
	_.each(table, function (slot) {
		slot.eachAround(function (e) {
			if (e.type != HOLE) {
				slot.availables.around.push(e);
			}
		}, true);
		slot.eachJump(function (e) {
			if (e.type != HOLE) {
				slot.availables.jump.push(e);
			}
		}, true);
	})
	
	if (conf.matrix) {
		confSync = true;
		_.map(conf.matrix, function (value, key) {
			switch (value[0]) {
			case HOLE.serialize:
				setType(value[1], value[2], HOLE, true);
				break;
			case P1.serialize:
			case P2.serialize:
				setType(value[1], value[2], P1, true);
				break;
			}
		})
		confSync = false;
	}
	
	delete conf.matrix;
	
//	conf.matrix = {};
//	
//	_.each(conf.matrix, function (e) {
//		setType(e[1], e[2], SERIALIZED_TYPE[e[0]], true);
//	})
	
	confSync = true;
	
	calcScores();
	
	
	
	
	function Slot(x, y, type)
	{
		var slot = this;
		this.availables = {jump: [], around: []};
		this.states = {};
		this.x = x;
		this.y = y;
//		this.type = type;
		this.xy = function () {
			return xy(x, y);
		}
		this.xy_sym = function () {
			return xy_sym(x, y);
		}
		this.createsym = function () {
			return new Slot(sym(x, conf.w), sym(y, conf.h));
		}
		this.sym = function () {
			return table[xy_sym(x, y)];
		}
		this.changeType = function (type, symetric) {
			setType(x, y, type, symetric);
		}
		this.setType = function (type) {
			if (slot.type) {
				delete slot.states[slot.type.id];
			}
			slot.previous_type = slot.type;
			slot.type = type;
			if (type) {
				slot.states[type.id] = true;
			}
		}
		this.setType(type);
		
		this.serialize = function () {
			return [slot.type.serialize, x, y];
		}
		this.eachAround = function (fn, arg1) {
			if (!arg1) {
				_.each(slot.availables.around, function (e) {
					fn(e);
				})
				return;
			}
			_.each([[1,1],[0,1],[1,0],[-1,-1],[0,-1],[-1,0],[1,-1],[-1,1]], function (e) {
				var i = xy(x + e[0], y + e[1]);
				if (table[i]) {
					fn(table[i]);
				}
			})
		}
		this.eachJump = function (fn, arg1) {
			if (!arg1) {
				_.each(slot.availables.jump, function (e) {
					fn(e);
				})
				return;
			}
			_.each([[2,0],[0,2],[0,-2],[-2,0]], function (e) {
				var i = xy(x + e[0], y + e[1]);
				if (table[i]) {
					fn(table[i]);
				}
			})
		}
		var historyState;
		this.propagate = function () {
			var rev = REVERSE[slot.type.id];
			slot.eachAround(function (e) {
				if (e.type == rev) {
					e.changeType(slot.type);
					historyState.propagation.push(e);
				}
			});
		}
		this.jump = function (from) {
			historyState = new HistoryState("jump", from, slot, gameboard);
			slot.changeType(from.type);
			slot.propagate();
			from.changeType(EMPTY);
			history.push(historyState);
			return historyState;
		}
		this.duplicate = function (from) {
			historyState = new HistoryState("duplicate", from, slot, gameboard);
			slot.changeType(from.type);
			slot.propagate();
			history.push(historyState);
			return historyState;
		}
		this.explored = 0;
	}
	function xy(x, y)
	{
		if (x < 0 || x >= conf.w.length || y < 0 || y >= conf.h.length) {
			return "outofbound";
		}
		return x + (y * conf.w.length);
	}
	function sym(value, params)
	{
		return (((params.sym_offset) / 2) - value) * 2 + value - 1;
	}
	function xy_sym(x, y)
	{
		return xy(sym(x, conf.w), sym(y, conf.h));
	}
	function syncConfWithSlot(slot)
	{
		switch (slot.previous_type) {
		case HOLE:
			delete conf.holes[slot.xy()];
			break;
		case P1:
		case P2:
			delete conf.players[slot.xy()];
			break;
		}
		
		//console.log(slot.xy(), slot.serialize());
		switch (slot.type) {
		case HOLE:
			conf.holes[slot.xy()] = [slot.x, slot.y];
			break;
		case P1:
		case P2:
			conf.players[slot.xy()] = slot.serialize();
			break;
		}
	}
	function syncArrays(slot)
	{
		switch (slot.type) {
		case P1:
			p1[slot.xy()] = slot;
			scores[P1.id] ++;
			break;
		case P2:
			p2[slot.xy()] = slot;
			scores[P2.id] ++;
			break;
		}
		
		switch (slot.previous_type) {
		case P1:
			delete p1[slot.xy()];
			scores[P1.id] --;
			break;
		case P2:
			delete p2[slot.xy()];
			scores[P2.id] --;
			break;
		}
	}
	function setType(x, y, type, symetric)
	{
		var slot = table[xy(x, y)];
		slot.setType(type);
		syncArrays(slot);
		if (confSync) {
			syncConfWithSlot(slot);
		}
		if (symetric) {
			var sym = slot.sym();
			if (sym) {
				sym.setType(REVERSE[slot.type.id]);
				syncArrays(sym);
				if (confSync && sym.type != HOLE) {
					syncConfWithSlot(sym);
				}
			}
		}
		return slot;
	}

	var explored = 1;
	function countMaxSlots(p1)
	{
		var i = 0;
		(function (j) {
			var each2 = function (e) {
				if (e.type == EMPTY) {
					each(e);
				}
			}
			var each = function (e) {
				if (e.explored == j) {
					return;
				}
				e.states.explored = true;
				e.explored = j;
				i ++;
				e.eachAround(each2)
				e.eachJump(each2)
			}
			_.each(p1, each)
		})(explored ++);
		return i;
	}
	function calcScores()
	{
		setTimeout(function () {
			gameboard.max_scores.p1 = countMaxSlots(p1);
			gameboard.max_scores.p2 = countMaxSlots(p2);
		}, 1);
	}
//	var actions = {};
	function initTurn()
	{
//		_.each(actions, function (e) {
//			delete e.to.states.hl_jump;
//			delete e.to.states.hl_duplicate;
//		})
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
//		console.log(res);
		return res;
	}
	function minMax(result, depth)
	{
		_.each(result.moves, function (currentMove) {
			if (!result.best) {
				result.best = currentMove;
				result.worst = currentMove;
			} else {
				if (depth % 2 == 0) {
					if (result.best.score < currentMove.score) { result.best = currentMove; }
					if (result.worst.score > currentMove.score) { result.worst = currentMove; }
				} else {
					if (result.best.score > currentMove.score) { result.best = currentMove; }
					if (result.worst.score < currentMove.score) { result.worst = currentMove; }
				}
			}
		})
	}
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
			
			_.each(crawlActions(curr_turn == P1 ? p1: p2, false), function (e) {
				j ++;
				e.to[e.action](e.from);
				calcScores();
				recursive(curr_turn, depth + 1, function (currentMove) {
					currentMove.move = e;
					currentMove.parent = result;
					result.moves.push(currentMove);
				});
				minMax(result, depth);
				gameboard.undo();
			})
			callback(result);
		}
		
		recursive(gameboard.turn, 0, function (result) {
			if (result.best) {
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
								})(result.best.move);
								gameboard.nextTurn();
								gameboard.scope.$apply();
								return;
							} else {
								curr = e.parent;
								gameboard.undo();
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
	}
}

})();
