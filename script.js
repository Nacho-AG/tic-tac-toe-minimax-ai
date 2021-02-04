"use strict";
const gameController = (function() {
    // Visual representation of cells in the board
    const _cells = document.querySelectorAll(".cell");

    let _playerState = 1;

    /**
     * The states:
     *  0 - Not chosen
     *  1 - Cross
     *  2 - Circle
     */
    const _states = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    let _difficulty = 10;

    const _computer = (function(difficulty) {
        // The level of difficulty will determine the chance of
        // making the best move. Higher the level higher the chances.
        const _level = difficulty * 0.1;
        const _getChilds = function(state, playerSign) {
            let childs = [];
            for(let i=0; i<state.length; i++){
                if (state[i] === 0) {
                    let newChild = [...state];
                    newChild.splice(i, 1, playerSign);
                    childs.push(newChild);
                }
            }
            return childs;
        }
        /**
         * Returns the best child posible and his heuristic value.
         * @param {array} state Current state of the board.
         * @param {boolean} maxPlayer True if the player has started the game.
         */
        const _minimax = function(state, maxPlayer) {
            let _bestValue;
            let playerSign = (maxPlayer)? 1 : -1;
            const _terminalNode = function(state) {
                let terminal = false;
                let value = null;
                if (!state.includes(0)) {
                    //DRAW
                    terminal=true;
                    value=0;
                    return [terminal, value];
                } else {
                    // ROWS WIN
                    if ([state[0], state[1], state[2]].every((item) => {
                        return item === state[0] && item !== 0;
                    })) {value = state[0], terminal = true}
                    else if ([state[3], state[4], state[5]].every((item) => {
                        return item === state[3] && item !== 0;
                    })) {value = state[3], terminal = true}
                    else if ([state[6], state[7], state[8]].every((item) => {
                        return item === state[6] && item !== 0;
                    })) {value = state[6], terminal = true}
                    // COLUMNS WIN
                    else if ([state[0], state[3], state[6]].every((item) => {
                        return item === state[0] && item !== 0;
                    })) {value = state[0], terminal = true}
                    else if ([state[1], state[4], state[7]].every((item) => {
                        return item === state[1] && item !== 0;
                    })) {value = state[1], terminal = true}
                    else if ([state[2], state[5], state[8]].every((item) => {
                        return item === state[2] && item !== 0;
                    })) {value = state[2], terminal = true}
                    //DIAGONALS WIN
                    else if ([state[0], state[4], state[8]].every((item) => {
                        return item === state[0] && item !== 0;
                    })) {value = state[0], terminal = true}
                    else if ([state[2], state[4], state[6]].every((item) => {
                        return item === state[2] && item !== 0;
                    })) {value = state[2], terminal = true}
                    else {value = null, terminal = false};
                    return [terminal, value];
                }
            };

            const [terminal, value] = _terminalNode(state);
            if (terminal === true) {
                return value;
            }
            const childs = _getChilds(state, playerSign);
            if (maxPlayer) {
                _bestValue = -100;
                childs.forEach(child => {
                    const childValue = _minimax(child, false);
                    if (childValue > _bestValue) {
                        _bestValue = childValue;
                    }
                });
            } else {
                _bestValue = 100;
                childs.forEach(child => {
                    const childValue = _minimax(child, true);
                    if (childValue < _bestValue) {
                        _bestValue = childValue;
                    }
                });
            }
            return _bestValue;
        };

        const _generateBestMove = () => {
            const childs = _getChilds(_states, -1);
            let bestValue = 100;
            let bestChilds = []
            for (let child of childs) {
                const childValue = _minimax(child, true);
                console.log(child, childValue);
                if (childValue === bestValue) {
                    bestChilds.push(child);
                } else if (childValue < bestValue){
                    bestValue = childValue;
                    bestChilds = [];
                    bestChilds.push(child);
                }
            }
            let bestChild = bestChilds[Math.floor(Math.random() * bestChilds.length)];
            for (let i=0; i<_states.length; i++){
                if (_states[i] != bestChild[i]) {
                    _states[i] = bestChild[i];
                    _gameRenderer.renderCell(i);
                    break;
                }
            }
        }

        const _generateRandomMove = () => {
            let x = Math.floor(Math.random() * 3);
            let y = Math.floor(Math.random() * 3);
            while(_states[3*x + y] !== 0) {
                x = Math.floor(Math.random() * 3);
                y = Math.floor(Math.random() * 3);
            }
            index = 3 * x + y;
            _states[index] = _playerState * -1;
            _gameRenderer.renderCell(index);
        }
        const move = () => {
            const randomMove = Math.random();
            if (randomMove >= _level) _generateRandomMove();
            else _generateBestMove();
        }
        return {move};
    })(_difficulty);

    const _gameRenderer = (function() {
        // VISUAL IMAGE OF TOKENS
        const CIRCLE = "images/circle.png";
        const CROSS = "images/cross.png";

        /**
         * Show the current state of the game to the user
         */
        const renderCell = function(index) {
            const cell = _cells[index];
            const img = cell.querySelector("img");
            let newImg = "";
            if (_states[index] === 1) newImg = CROSS;
            if (_states[index] === -1) newImg = CIRCLE;
            img.setAttribute("src", newImg);
            console.log(`Rendering cell ${index} with ${newImg}`);
        };

        return {renderCell};
    })();

    // Add the click event listener in the cells
    _cells.forEach((cell, index) => cell.addEventListener("click", () => {
        // Only accept the move if the position is empty
        if (_states[index] === 0) {
            _states[index] = _playerState;
            _gameRenderer.renderCell(index);
        }

        if (_states.includes(0)) _computer.move();
    }))
})();