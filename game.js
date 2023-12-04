const svg = document.getElementById("gameSVG");
const scoreDisplay = document.getElementById("score");
const lifeDisplay = document.getElementById("life");
const displayHighScore = document.getElementById("highScore")
const gameOverDisplay = document.getElementById("gameOver");

const player = {
    x: svg.getAttribute("width") / 2,
    y: svg.getAttribute("height") - 30,
    width: 50,
    height: 10,
    speed: 80,
    life: 0,
};

let blocks = [];
let score = 0;
let life = 1;
let gameRunning = false;
let highScore = 0;



function createBlock() {
    const blockWidth = 30 + Math.random() * 20;
    const blockX = Math.random() * (svg.getAttribute("width") - blockWidth);
    const block = { x: blockX, y: 0, width: blockWidth, height: 20 };
    blocks.push(block);
    
}

function moveBlocks() {
    
    for (let block of blocks) {
        if(score < 20) {
        block.y += 5;
        }
        if(score >= 20 && score < 40) {
            block.y += 7;
        }
        if(score >= 40 && score < 60) {
            block.y += 9;
        }
        if(score >= 60 && score < 80) {
            block.y += 11;
        }
        if(score >= 80 && score < 100) {
            block.y += 13;
        }
        if(score >= 100 && score < 120) {
            block.y += 15;
        }
        if(score >= 120 && score < 140) {
            block.y += 17;
        }
        if(score >= 140 && score < 160) {
            block.y += 19;
        }
        if(score >= 160 && score < 180) {
            block.y += 21;
        }
        if(score >= 180) {
            block.y += 23;
        }
        if (block.y > svg.getAttribute("height")) {
            blocks.shift();
            score += 1;
            if(score % 25 === 0) {
                player.life++;
            }
            
            scoreDisplay.innerHTML = `Score: ${score}`;
            lifeDisplay.innerHTML = `Bonus-Life: ${player.life}`;

        }
        if (gameRunning && block.y + block.height > player.y &&
            block.y < player.y + player.height &&
            block.x + block.width > player.x &&
            block.x < player.x + player.width) {
            if (player.life >= 1) {
                blocks.shift();
                player.life = player.life - 1; // Decrease life if more than 1 life
                lifeDisplay.innerHTML = `Bonus-Life: ${player.life}`;
            } else {
                gameRunning = false;
                player.y = svg.getAttribute("height") - 30;
                updateScore(score);
                
            }
        }
        
    }
}

function draw() {
    if (!gameRunning) {
        
        return;
    }

    svg.innerHTML = "";

    const playerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    playerRect.setAttribute("x", player.x);
    playerRect.setAttribute("y", player.y);
    playerRect.setAttribute("width", player.width);
    playerRect.setAttribute("height", player.height);
    playerRect.setAttribute("fill", "#000");
    svg.appendChild(playerRect);

    for(let block of blocks) {
        const blockRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        blockRect.setAttribute("x", block.x);
        blockRect.setAttribute("y", block.y);
        blockRect.setAttribute("width", block.width);
        blockRect.setAttribute("height", block.height);
        blockRect.setAttribute("fill", "#FF0000");
        svg.appendChild(blockRect);
    }

    moveBlocks();
    requestAnimationFrame(draw);
}

document.addEventListener("keydown", (event) => {
    if (gameRunning) {
        if (event.key === "ArrowLeft" && player.x > 0) {
            player.x -= player.speed;
        } else if (event.key === "ArrowRight" && player.x < svg.getAttribute("width") - player.width) {
            player.x += player.speed;
        }
    }
});



function updateScore(score) {
    if (player.name) {
        fetch('/update_score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player_name: player.name,
                score: score,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Score updated:', data);
            const playerListDiv = document.getElementById("playerList");
            const ul = playerListDiv.querySelector("ul");
            const liList = ul.querySelectorAll("li");
            liList.forEach(li => {
                if (li.textContent === player.name) {
                    li.classList.remove("now-playing");
                }
            });
        });
    }
}
const highestScorerDisplay = document.getElementById("highScorer");

function updateHighestScorer() {
    fetch('/highest_scorer')
        .then(response => response.json())
        .then(data => {
            if (data.highest_scorer) {
                highestScorerDisplay.textContent = `Highest Scorer: ${data.highest_scorer}`;
            } else {
                highestScorerDisplay.textContent = "Highest Scorer: No one yet!";
            }
        })
        .catch(error => {
            console.error('Error fetching highest scorer:', error);
            highestScorerDisplay.textContent = "Highest Scorer: Error";
        });
}

const allTimeHighestDisplay = document.getElementById("highScore");

function updateAllTimeHighestScore() {
    fetch('/highest_score')
        .then(response => response.json())
        .then(data => {
            console.log('Response data:', data);
            const allTimeHighestScore = data.highest_score;
            if (allTimeHighestScore !== null) {
                allTimeHighestDisplay.textContent = `Highest Score: ${allTimeHighestScore}`;
            } else {
                allTimeHighestDisplay.textContent = "Highest Score: 0";
            }
        })
        .catch(error => {
            console.error('Error fetching Highest Score:', error);
            allTimeHighestDisplay.textContent = "Highest Score: Error";
        });
}

const playButton = document.getElementById("play-button");
const playerNameInput = document.getElementById("playerNameInput");
const nameInput = document.getElementById("nameInput");
const nameSubmitButton = document.getElementById("nameSubmitButton");

playButton.addEventListener("click", () => {
    if (!gameRunning) { 
        scoreDisplay.innerHTML = `Score: 0`;   
        updateAllTimeHighestScore();
        updateHighestScorer();
        playerNameInput.style.display = "flex"; // Display the input area
    }  
    
});

nameSubmitButton.addEventListener("click", () => {
    const playerName = nameInput.value.trim();
    if (playerName) {
        const playerListDiv = document.getElementById("playerList");
        const ul = playerListDiv.querySelector("ul");
        const liList = ul.querySelectorAll("li");

        // Remove displaying previous player name
        ul.innerHTML = "";

        // New player name, add it to the player list
        player.name = playerName;
        playerNameInput.style.display = "none";
        score = 0;
        gameRunning = true;
        blocks = [];
        startGame();

        // Add the player's name to the list
        const li = document.createElement("li");
        li.textContent = playerName;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", () => {
            // Remove the player's data from the database and the player list
            fetch(`/delete_player/${playerName}`, {
                 method: 'DELETE',
            })
            .then(response => response.json())
            .then(data => {
                console.log('Player deleted:', data);
                ul.removeChild(li); // Remove the player's name from the list
            });
        });
        li.appendChild(deleteButton);
        ul.appendChild(li);
        li.classList.add("now-playing");
    
        
        // Save player name to the server
        fetch('/update_player_name', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                player_name: player.name,
            }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Player name saved:', data);
        });
    }
});


document.addEventListener("DOMContentLoaded", () => {
    // Display the current player's name
    const currentPlayerName = localStorage.getItem("playerName");
    if (currentPlayerName) {
        const playerListDiv = document.getElementById("playerList");
        playerListDiv.innerHTML = `<h2>Player List</h2><ul><li>${currentPlayerName}</li></ul>`;
    }
});


let blockInterval;
function startGame() {
    clearInterval(blockInterval);
    blockInterval = setInterval(createBlock, 400);
    draw();
}

