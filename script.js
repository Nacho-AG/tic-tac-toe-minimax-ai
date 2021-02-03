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

    let _difficulty = 1;

    const _computer = (function(difficulty) {
        const _level = difficulty * 0.1;
        const _generateBestMove = () => {

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