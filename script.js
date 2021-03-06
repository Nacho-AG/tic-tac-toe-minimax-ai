"use strict";
const gameController = (function() {
    // Visual representation of cells in the board
    const _cells = document.querySelectorAll(".cell");
    const difficultyInput = document.querySelector("#difficulty");
    const _crossButton = document.querySelector("#cross-button");
    const _circleButton = document.querySelector("#circle-button");

    let _playerSign = 1;
    let _gameEnded = false;
    let _debug = false;

    /**
     * The states:
     *  0 - Not chosen
     *  1 - Cross
     *  2 - Circle
     */
    const _states = [0, 0, 0, 0, 0, 0, 0, 0, 0];

    const _tokens = {
        "1": "Player",
        "0": "Draw",
        "-1": "Computer",
    }

    let _difficulty = 1;
    difficultyInput.addEventListener("change", () => {
        _difficulty = difficultyInput.value;
        console.log(`Difficulty level: ${_difficulty}`);
    });

    const _reset = () => {
        _gameEnded = false;
        _states.forEach((_, index) => _states[index] = 0);
        _gameRenderer.reset();
    };

    const _computer = (function() {
        const _getChilds = function(state, token) {
            let childs = [];
            for(let i=0; i<state.length; i++){
                if (state[i] === 0) {
                    let newChild = [...state];
                    newChild.splice(i, 1, token);
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
                else {
                    if (!state.includes(0)) {
                        // DRAW
                        terminal=true;
                        value=0;
                    } else {
                        // NOT END NODE
                        value = null;
                        terminal = false;
                    }
                };
                return [terminal, value];
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
            if (_debug) console.log("Best Move");
            const childs = _getChilds(_states, _playerSign * -1);
            let bestValue = 100;
            let bestChilds = []
            for (let child of childs) {
                let maxPlayer;
                if (_playerSign === 1) {
                    maxPlayer = true;
                } else {
                    maxPlayer = false;
                }
                const childValue = _minimax(child, maxPlayer);
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
            if (_debug) console.log("Random Move");
            let x = Math.floor(Math.random() * 3);
            let y = Math.floor(Math.random() * 3);
            while(_states[3*x + y] !== 0) {
                x = Math.floor(Math.random() * 3);
                y = Math.floor(Math.random() * 3);
            }
            let index = 3 * x + y;
            _states[index] = _playerSign * -1;
            _gameRenderer.renderCell(index);
        }
        const move = () => {
            const randomMove = Math.random();
            if (randomMove >= (_difficulty * 0.1)) _generateRandomMove();
            else _generateBestMove();
        }
        return {move};
    })();

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
            if (_debug) console.log(`Rendering cell ${index} with ${newImg}`);
        };

        const reset = function() {
            _cells.forEach(cell => {
                const img = cell.querySelector("img");
                img.setAttribute("src", "");
            });
            console.log("All cells cleared");
        }

        return {renderCell, reset};
    })();

    const _checkForWin = function(state) {
        let value = null;
        let terminal = false;
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
        else {
            if (!state.includes(0)) {
                // DRAW
                terminal=true;
                value=0;
            } else {
                // NOT END NODE
                value = null;
                terminal = false;
            }
        };
        return [terminal, value];
    };

    // Add the click event listener in the cells
    _cells.forEach((cell, index) => cell.addEventListener("click", () => {
        // Check if the match is over
        if (!_gameEnded) {
            // Only accept the move if the position is empty
            if (_states[index] === 0) {
                _states[index] = _playerSign;
                _gameRenderer.renderCell(index);
                let [win, winner] = _checkForWin(_states);
                if (win) {
                    console.log(_tokens[winner]);
                    _gameEnded = true;
                } else {
                    if (_states.includes(0)) {
                        _computer.move();
                        let [win, winner] = _checkForWin(_states);
                        if (win) {
                            console.log(_tokens[winner]);
                            _gameEnded = true;
                        }
                    }
                }
            }
        }
    }))

    // Add the button listeners. The player can choose between "cross", the 
    // token that starts the game and "circles".
    _crossButton.addEventListener("click", () => {
        if (_crossButton.classList.contains("selected")) return;
        else {
            _circleButton.classList.remove("selected");
            _crossButton.classList.add("selected");
        }
        _reset();
    });
    _circleButton.addEventListener("click", () => {
        if (_circleButton.classList.contains("selected")) return;
        else {
            _crossButton.classList.remove("selected");
            _circleButton.classList.add("selected");
        }
        _reset();
        _computer.move();
    });
})();