'use strict'

const Gameboard = function() {
    let board = [];
    const cells = 9;

    const populateBoard = function() {
        for (let i = 0; i < cells; i++) {
            board.push(Cell());
        };
        getNumberForEach();
    };
    populateBoard();

    function getNumberForEach() { board.map((cell, i) => cell.num = i+1)};

    const getBoard = () => board;

    const printBoard = () => board.forEach(cell => console.log(cell.getMark()));

    const getAvailableCells = () => board.filter(cell => cell.getMark() === '');

    const appendMark = (cell, mark) => {
        const availableCells = getAvailableCells();
        const cellAvailability = board[cell-1].getMark();
        if (!availableCells || cellAvailability !== '') return;
        board[cell-1].addMark(mark);
    };

    const resetBoard = () => {
        board = [];
        populateBoard();
    };

    return {getBoard, appendMark, printBoard, resetBoard, getAvailableCells};
};

function Cell() {
    let mark = '';
    let num = '';

    const addMark = (playerMark) => {
        mark = playerMark;
    };

    const getMark = () => mark;

    return {addMark, getMark, num};
};

function Player (name = 'Player 1', mark = 'X', victories = 0, active = false) {
    function setName() {
        let customName = prompt("What's your name?");
        if (customName === null || customName === '') return;
        this.name = customName;
        return customName;          
    };

    return {name, mark, victories, active, setName};
};

function GameController() {
    const board = Gameboard();
    const playerOne = Player('Player 1', 'X', 0, true);
    const playerTwo = Player('Player 2', 'O', 0, false);
    const aiPlayer = Player('Computer', 'O', 0, false);
    const players = [playerOne, playerTwo, aiPlayer];
    let activePlayer = players[0];
    const winningCombinations = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];

    const changeActivePlayer = () => {
            activePlayer = activePlayer === players[0] ? players[1] : players[0];
            playerOne.active ? playerOne.active = false : playerOne.active = true;
            playerTwo.active ? playerTwo.active = false : playerTwo.active = true;
    };

    const getActivePlayer = () => activePlayer;
    const getPlayerOneName = () => playerOne.name;
    const getPlayerTwoName = () => playerTwo.name;
    
    const playRound = (cell, againstAI = false) => {
        if(againstAI) {
            board.appendMark(cell, playerOne.mark);
            if (checkWinner(playerOne.mark)) {
                playerOne.victories++;
                board.resetBoard();
            };
            if ((board.getBoard().every(cell => cell.getMark() !== ''))) {
                alert("It's a draw");
                board.resetBoard();
            };

            board.appendMark(bestMove(), playerTwo.mark);
            if (checkWinner(playerTwo.mark)) {
                playerTwo.victories++;
                board.resetBoard();
            };
            if ((board.getBoard().every(cell => cell.getMark() !== ''))) {
                alert("It's a draw");
                board.resetBoard();
            };
        } else {
            board.appendMark(cell, activePlayer.mark);
            changeActivePlayer();
            if (checkWinner(playerOne.mark)) {
                playerOne.victories++;
                board.resetBoard();
            };
            if (checkWinner(playerTwo.mark)) {
                playerTwo.victories++;
                board.resetBoard();
            };
            if ((board.getBoard().every(cell => cell.getMark() !== ''))) {
                alert("It's a draw");
                board.resetBoard();
            };
        };
    };

    const checkWinner = (mark) => {
        const boardMap = board.getBoard();
        return winningCombinations.some(combination => {
            return combination.every(index => {
                 return (boardMap[index].getMark().includes(mark));
            });
        });
    };

    function setPlayerOneName() {
        let customName = prompt("What's your name?");
        if (customName === null || customName === '' || customName === playerTwo.name) return;
        playerOne.name = customName;
    };

    function setPlayerTwoName() {
        let customName = prompt("What's your name?");
        if (customName === null || customName === '' || customName === playerOne.name) return;
        playerTwo.name = customName; 
    };

    function printVictories(player) {
        if (player === 'Player1') return playerOne.victories;
        if (player === 'Player2') return playerTwo.victories;
    };

    function resetGame() {
        board.resetBoard();
        playerOne.victories = 0;
        playerTwo.victories = 0;
        activePlayer = players[0];
    };

    // Best move for AI (AI will be Player2) 
    function bestMove(){
        let bestSpotToGo;
        let copy = Array(9);
        for (let i = 0; i < copy.length; i++) {
            board.getBoard()[i].getMark() === '' ? copy[i] = i : copy[i] = board.getBoard()[i].getMark();
        };
        const availableSpots = (board) => {return board.filter(s => s != "O" && s != "X");};
        
        const checkWinner = (mark) => {
            const boardMap = copy;
            return winningCombinations.some(combination => {
                return combination.every(index => {
                     return (boardMap[index] === mark);
                });
            });
        };
        
        function minimax(newBoard, player) {
            let moves = [];
            let bestMove;
            let availSpots = availableSpots(newBoard);
            
            if (checkWinner(playerOne.mark)){
                return {score:-10};
            } else if (checkWinner(playerTwo.mark)){
                return {score:10};
            } else if (availSpots.length === 0){
                return {score:0};
            };

            for (let i = 0; i < availSpots.length; i++){
                let move = {};

                move.index = newBoard[availSpots[i]];
                newBoard[availSpots[i]] = player.mark;
                
                if (player.mark == playerTwo.mark) {
                    let result = minimax(newBoard, playerOne);
                    move.score = result.score;
                } else {
                    let result = minimax(newBoard, playerTwo);
                    move.score = result.score;
                };

                newBoard[availSpots[i]] = move.index;
                moves.push(move);
            };

            if (player.mark === playerTwo.mark) {
                let bestScore = -Infinity;
                for(let i = 0; i < moves.length; i++) {
                    if(moves[i].score > bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    };
                };
            } else {
                let bestScore = Infinity;
                for(let i = 0; i < moves.length; i++) {
                    if(moves[i].score < bestScore) {
                        bestScore = moves[i].score;
                        bestMove = i;
                    };
                };
            };

            return moves[bestMove];
    };

        bestSpotToGo = minimax(copy, playerTwo).index + 1;
        return bestSpotToGo;
    };

    return {playRound, getActivePlayer, playerOne, playerTwo, getPlayerOneName, getPlayerTwoName, getBoard: board.getBoard, 
            setPlayerOneName, setPlayerTwoName, printVictories, resetGame, checkWinner};
};

const DisplayController = (function() {
    const game = GameController();
    const boardEl = document.querySelector('.board');
    const squareEl = document.querySelectorAll('.square'); 
    const pl1Score = document.querySelector('#pl-1-score');
    const pl2Score = document.querySelector('#pl-2-score');
    const messageContainerEl = document.querySelector('#message-container');
    const switchGameContEl = document.querySelector('.switch-game');
    const playerVsPlayerEl = document.querySelector('#plVSpl');
    const playerVsCompEl = document.querySelector('#plVScomp');
    const resetEl = document.querySelector('#btn-reset');
    const setNumOfRoundsEl = document.querySelector('#btn-set-rounds');
    const roundsNumEl = document.querySelector('#rounds-number');
    const name1El = document.querySelector('#name1');
    const name2El = document.querySelector('#name2');
    let numOfRounds = 3;
    let gameAgainstAI = false;

    function toggleBtnVisibility(e) {
        if (e.target.contains(playerVsPlayerEl)) {
            playerVsPlayerEl.classList.add('active-btn');
            playerVsCompEl.classList.remove('active-btn');
        };
        if (e.target.contains(playerVsCompEl)) {
            playerVsCompEl.classList.add('active-btn');
            playerVsPlayerEl.classList.remove('active-btn');
        };
    };
    
    const updateDisplay = () => {
        let board = game.getBoard();
        squareEl.forEach((el, i) => {
            if (+el.dataset.num === board[i].num) {
                el.textContent = board[i].getMark();
            };
        });

        displayActivePlayer();
        displayScore();
        displayWinner();
    };
    
    function displayActivePlayer() {
        const activePlayer = game.getActivePlayer();
        if (!gameAgainstAI) {
            if (activePlayer.name === game.getPlayerOneName()) {
                name1El.classList.add('active-player');
                name2El.classList.remove('active-player');
            } else {
                name1El.classList.remove('active-player');
                name2El.classList.add('active-player'); 
            };
        };
    };
    
    function clickOnBoard(e) {
        const selectCell = +e.target.dataset.num;

        if (!selectCell) return;
        if (e.target.textContent !== '') return;
        if (gameAgainstAI) {
            game.playRound(selectCell, true);
        } else {
            game.playRound(selectCell);
        };

        updateDisplay();
    };

    function displayPlayerName(e) {
        if (e.target === name1El) {
            game.setPlayerOneName();
            name1El.textContent = game.getPlayerOneName();
        } else if (e.target === name2El && gameAgainstAI === false) {
            game.setPlayerTwoName();
            name2El.textContent = game.getPlayerTwoName();
        } else return; 
    };

    function displayScore() {
        pl1Score.textContent = game.printVictories('Player1');
        pl2Score.textContent = game.printVictories('Player2');
    };

    function displayWinner() {
        const playerOneName = game.getPlayerOneName();
        const playerTwoName = game.getPlayerTwoName();
        const message = document.createElement('p');
        message.classList.add('message');

        if (game.printVictories('Player1') === numOfRounds) {
            boardEl.classList.add('hidden');
            message.textContent = `Overall winner is ${playerOneName} 🎉`;
            messageContainerEl.append(message);
        };
        if (game.printVictories('Player2') === numOfRounds) {
            boardEl.classList.add('hidden');
            message.textContent = `Overall winner is ${playerTwoName} 🎉`;
            messageContainerEl.append(message);
        };
    };

    function reset() {
        game.resetGame();
        boardEl.classList.remove('hidden');
        messageContainerEl.innerHTML = '';
        updateDisplay();
    };

    function setNumOfRounds() {
        let num = +(prompt('Set winner after how many rounds? (1-100)', '3'));
        if (num === 0) return;
        if (num > 0 && num < 101 && typeof num === 'number' && !isNaN(num)) {
            numOfRounds = num;
            roundsNumEl.textContent = num;
            return;
        } else {
            alert('Please input a valid number');
            num = setNumOfRounds();
        };
    };

    function switchToGame(e) {
        if (e.target.contains(playerVsPlayerEl)) {
            if (!gameAgainstAI) return;
            gameAgainstAI = false;
            reset();
            game.playerOne.name = 'Player 1';
            game.playerTwo.name = 'Player 2';
            name1El.textContent = 'Player 1';
            name2El.textContent = 'Player 2';
        };
        if (e.target.contains(playerVsCompEl)) {
            if (gameAgainstAI) return;
            gameAgainstAI = true;
            reset();
            name1El.classList.remove('active-player');
            name2El.classList.remove('active-player');
            game.playerOne.name = 'Human';
            game.playerTwo.name = 'Computer';
            name1El.textContent = 'Human';
            name2El.textContent = 'Computer';
        };
    };

    switchGameContEl.addEventListener('click', toggleBtnVisibility);
    switchGameContEl.addEventListener('click', switchToGame);
    resetEl.addEventListener('click', reset);
    setNumOfRoundsEl.addEventListener('click', setNumOfRounds);
    name1El.addEventListener('click', displayPlayerName);
    name2El.addEventListener('click', displayPlayerName);
    boardEl.addEventListener('click', clickOnBoard);
})();


