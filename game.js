
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
	this.redo = function () {
		to[action](from);
		gameboard.turn = state.turn == P1 ? P2: P1;
	}
	this.id = from.xy() + action + to.xy();
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
} // HistoryState

window.GameBoard = function(conf, scope)
{
	var history = this.history = [];
	var table = this.iterator = [];
	var redoStack = this.redoStack = [];
	var gameboard = this;
	var confSync = false;
	
	this.allowRedo = true;
	this.turn = P1;
	this.configuration = conf;
//	this.p1_cpu = false;
//	this.p2_cpu = false;
	this.scope = scope;
	
	var p1 = gameboard.p1 = {};
	var p2 = gameboard.p2 ={};
	var scores = this.scores = {p1:0, p2:0};
	var holes_count = 0;

	this.max_scores = {p1:0, p2:0};

	this.invertTurn = function () {
		invertTurn();
	};
	this.calcScores = function () {
		calcScores();
	};
	this.invertTurn = function () {
		invertTurn();
	}
	
	this.nextTurn = function () {
		invertTurn();
//		setTimeout(function () {
//			calcScores();
//		}, 1);
		
		initTurn();
		
		var lastRedo = redoStack.pop();
		if (lastRedo && history.length > 0) {
			var last = history[history.length-1];
//			console.log(last.id, lastRedo.id, last == lastRedo);
			if (last.id != lastRedo.id) {
				redoStack = gameboard.redoStack = [];
			}
		}
		
//		console.log(scope.p1_cpu);
//		console.log(scope.p2_cpu);
		if ((gameboard.turn == P2 && scope.p2_cpu) || (gameboard.turn == P1 && scope.p1_cpu)) {
			internalCpuPlay();
		}
	};
	
	function internalCpuPlay()
	{
		setTimeout(function () {
			cpuPlay(gameboard);
			gameboard.scope.$apply();
		}, 1);
	};
	
	this.cpuPlay = function () {
		internalCpuPlay();
	};
	
	this.undo = function () {
		var last = history.pop();
		if (last) {
			if (gameboard.allowRedo) {
				redoStack.push(last);
//				console.log(last);
			}
			last.revert();
			initTurn();
		}
	};
	
	this.redo = function () {
		var last = redoStack.pop();
		if (last) {
			last.redo();
//			history.push(last);
			initTurn();
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
		holes_count += 2;
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
				holes_count += 2;
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

	setTimeout(function () {
		calcScores();
	}, 1);
	
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
	} // Slot
	
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
	function invertTurn()
	{
		gameboard.turn = gameboard.turn == P1 ? P2: P1;
	}
	function calcScores()
	{
		gameboard.max_scores.p1 = countMaxSlots(p1);
		gameboard.max_scores.p2 = countMaxSlots(p2);
	}
//	var actions = {};
	function initTurn()
	{
		calcScores();
		gameboard.finished = false;
		var max = ((conf.w.length * conf.h.length) - holes_count);
		if (gameboard.max_scores.p1 + gameboard.max_scores.p2 == max) {
			gameboard.finished = true;
			return;
		}
		
//		_.each(actions, function (e) {
//			delete e.to.states.hl_jump;
//			delete e.to.states.hl_duplicate;
//		})
	}
} // window.GameBoard

})();
