
var app = angular.module('bacteria', [])

app.run(['$rootScope', function (scope) {
	scope.gameboards = [];
	scope.build = false;
	var list = [
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{"10":[2,1],"17":[1,2],"18":[2,2],"41":[1,5],"42":[2,5],"50":[2,6]},"players":{"0":[1,0,0],"1":[1,1,0],"2":[2,2,0],"3":[1,3,0],"4":[1,4,0],"5":[1,5,0],"8":[1,0,1],"9":[1,1,1],"11":[1,3,1],"12":[1,4,1],"16":[2,0,2],"19":[1,3,2],"20":[1,4,2],"24":[2,0,3],"25":[2,1,3],"26":[2,2,3],"27":[1,3,3],"28":[1,4,3],"29":[1,5,3],"33":[2,1,4],"34":[2,2,4],"35":[1,3,4],"36":[1,4,4],"43":[1,3,5],"54":[1,6,6],"58":[1,2,7],"60":[1,4,7],"61":[1,5,7],"62":[1,6,7],"63":[1,7,7]}},
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{"10":[2,1],"17":[1,2],"18":[2,2],"41":[1,5],"42":[2,5],"50":[2,6]},"players":{"0":[1,0,0],"1":[1,1,0],"2":[2,2,0],"3":[2,3,0],"4":[2,4,0],"5":[2,5,0],"8":[1,0,1],"9":[1,1,1],"11":[2,3,1],"16":[2,0,2],"19":[2,3,2],"24":[2,0,3],"25":[2,1,3],"26":[2,2,3],"27":[2,3,3],"29":[2,5,3],"32":[2,0,4],"34":[2,2,4],"35":[2,3,4],"36":[2,4,4],"37":[2,5,4],"38":[2,6,4],"39":[2,7,4],"43":[1,3,5],"44":[2,4,5],"47":[2,7,5],"49":[1,1,6],"51":[1,3,6],"52":[1,4,6],"54":[1,6,6],"55":[1,7,6],"58":[1,2,7],"59":[1,3,7],"60":[1,4,7],"61":[1,5,7],"62":[1,6,7],"63":[1,7,7]}},
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{"10":[2,1],"17":[1,2],"18":[2,2],"41":[1,5],"42":[2,5],"50":[2,6]},"players":{"0":[1,0,0],"1":[1,1,0],"2":[2,2,0],"3":[2,3,0],"4":[2,4,0],"5":[2,5,0],"9":[1,1,1],"11":[2,3,1],"58":[1,2,7],"59":[1,3,7],"60":[1,4,7],"61":[1,5,7],"62":[2,6,7],"63":[2,7,7]}},
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{},"players":{"27":[1,3,3],"36":[2,4,4]}},
{"w":{"length":8,"sym_offset":0},"h":{"length":8,"sym_offset":0},"holes":{"9":[1,1],"17":[1,2],"19":[3,2],"21":[5,2],"22":[6,2],"23":[7,2],"25":[1,3],"27":[3,3],"43":[3,5],"45":[5,5],"51":[3,6],"53":[5,6],"61":[5,7]},"players":{"8":[1,0,1],"16":[1,0,2],"24":[1,0,3],"46":[2,6,5],"54":[2,6,6],"62":[2,6,7]}},
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{"1":[1,0],"9":[1,1],"17":[1,2],"25":[1,3],"33":[1,4],"35":[3,4],"41":[1,5],"44":[4,5],"50":[2,6],"51":[3,6]},"players":{"0":[1,0,0],"27":[2,3,3],"36":[1,4,4],"63":[2,7,7]}},
{"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8},"holes":{"9":[1,1],"18":[2,2],"20":[4,2],"22":[6,2],"29":[5,3]},"players":{"17":[1,1,2],"46":[2,6,5]}},
{"matrix":{"1":[0,1,0],"5":[0,5,0],"10":[0,2,1],"12":[0,4,1],"19":[0,3,2],"26":[0,2,3],"27":[1,3,3],"34":[0,2,4]},"w":{"length":8,"sym_offset":7},"h":{"length":8,"sym_offset":8}},
{"matrix":{"9":[0,1,1],"10":[1,2,1],"18":[0,2,2],"34":[0,2,4],"43":[0,3,5],"50":[0,2,6]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
{"matrix":{"0":[1,0,0],"1":[0,1,0],"9":[0,1,1],"17":[0,1,2],"25":[0,1,3],"27":[1,3,3],"33":[0,1,4],"35":[0,3,4],"41":[0,1,5],"44":[0,4,5],"50":[0,2,6],"51":[0,3,6]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
{"matrix":{"17":[0,1,2],"18":[0,2,2],"19":[0,3,2],"25":[0,1,3],"26":[1,2,3],"27":[0,3,3],"33":[0,1,4],"35":[1,3,4],"41":[0,1,5]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
{"matrix":{"18":[1,2,2],"19":[0,3,2],"26":[0,2,3],"35":[0,3,4],"42":[0,2,5]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
{"matrix":{"0":[1,0,0],"10":[0,2,1],"17":[0,1,2],"18":[0,2,2],"41":[0,1,5],"42":[0,2,5],"50":[0,2,6],"56":[1,0,7]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
{"matrix":{"0":[1,0,0],"35":[0,3,4],"42":[0,2,5]},"w":{"length":8,"sym_offset":8},"h":{"length":8,"sym_offset":8}},
	];
	_.each(list, function (e) {
		scope.gameboards.push(new GameBoard(e, scope));
	})
	
	scope.configuration = {
		matrix:{},
		w:{length:8, sym_offset:8},
		h:{length:8, sym_offset:8}
	};
	scope.reset = function () {
		scope.configuration.holes = {};
		scope.configuration.players = {};
		scope.gameboard.selected = false;
		scope.gameboard = new GameBoard(scope.configuration);
	}
	
	scope.gameboard = new GameBoard(scope.configuration);
	
//	scope.reset();
	
	scope.load = function () {
		scope.configuration = JSON.parse(scope.configuration_textarea);
		scope.gameboard = new GameBoard(scope.configuration);
	}
}])

app.directive('gameboard', ['$rootScope', function ($rootScope) {
	return {
		restrict: 'E',
		link: function(scope, element) {
			scope.selectGameboard = function (gameboard) {
//				gameboard.selected = true;
				$rootScope.gameboard.selected = false;
				$rootScope.configuration = gameboard.configuration;
				$rootScope.gameboard = gameboard;
				gameboard.selected = true;
//				$rootScope.gameboard = new GameBoard(gameboard.configuration);
			}
		}
	}
}])


app.directive('slot', function () {
	var previous_slot, previous_action;
	return {
		restrict: 'E',
		link: function (scope, element) {
			link_slot(scope, element);
		}
	}
	function link_slot(scope, element)
	{
		scope.clickSlot = function(slot)
		{
			if (scope.build) {
//				console.log(slot.type.id, TRANSITIONS[slot.type.id]);
				slot.changeType(TRANSITIONS[slot.type.id], true);
				return;
			}
			if (slot.states.duplicate) {
				slot.duplicate(previous_slot);
				previous_slot.reset();
				scope.gameboard.nextTurn();
				return;
			}
			if (slot.states.jump) {
				slot.jump(previous_slot);
				previous_slot.reset();
				scope.gameboard.nextTurn();
				return;
			}
		} // clickSlot
		
		scope.mouseoverSlot = function(slot)
		{
			if (slot.type == scope.gameboard.turn) {
				if (previous_slot) {
					previous_slot.reset();
				}
				previous_slot = slot;
				slot.states.selected = true;
				hlPossibilities(slot);
				return;
			}
			if (slot.action) {
//				console.log('action');
				if (previous_action) {
					previous_action.reset();
				}
				previous_action = slot.action;
				hlActions(slot.action);
				return;
			}
		} // mouseoverSlot
		
		scope.mouseleaveSlot = function(slot)
		{
			if (previous_action) {
				previous_action.reset();
			}
		} // mouseleaveSlot
		
		function hlActions(action)
		{
			var propagate = [];
			action.to.states['action_'+ action.type] = true;
			action.from.states['action_'+ action.type] = true;
			action.to.states['from_'+ action.from.type.id] = true;
			action.to.eachAround(function (e) {
				if (e.type == REVERSE[scope.gameboard.turn.id]) {
					e.states.propagate = true;
					propagate.push(e);
				}
			});
			previous_action.reset = function ()
			{
				delete action.to.states['action_'+ action.type];
				delete action.from.states['action_'+ action.type];
				delete action.to.states['from_'+ action.from.type.id];
				previous_action = null;
				_.each(propagate, function (e) {
					delete e.states.propagate;
				});
			}
		} // hlActions
	}
	
	function hlPossibilities(slot)
	{
		var actions = [];
		slot.reset = function ()
		{
			delete slot.states.selected;
			_.each(actions, function (e) {
				delete e.to.states[e.type];
				delete e.to.action;
			});
			previous_slot = null;
		}
		switch (slot.type) {
		case P1:
		case P2:
			slot.eachAround(function (e) {
				if (e.type == EMPTY) {
					e.states.duplicate = true;
					e.action = {type: "duplicate", to: e, from: slot};
					actions.push(e.action);
				}
			});
			slot.eachJump(function (e) {
				if (e.type == EMPTY) {
					e.states.jump = true;
					e.action = {type: "jump", to: e, from: slot};
					actions.push(e.action);
				}
			});
			break;
		}
	} // hlPossibilities
})
