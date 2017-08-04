//START: setup eseential elements + animation loops + color
window.addEventListener('load', eventWindowLoaded, false);
var canvas = document.querySelector('canvas');
var ctx = canvas.getContext('2d');

 var animation = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.oRequestAnimationFrame ||
              window.msRequestAnimationFrame ||
              function (callback) {
                window.setTimeout(callback, 1000/60);
            };

function eventWindowLoaded() {
	animation(update);
}

//position the player/handle in the middle of the screen horizontally, and near the bottom vertically
var player = {
	w: 180,
	h: 12,
	x: canvas.width/2 - 50,
	y: canvas.height * .92,
}

//create a score variable, that will be displayed in the top right hand corner
var score = 0;
//create a life variable, that it will be displayed in the bottom right hand corner
var playerLives = 3;

//create the ball for the bouncing main element of the game. Start it by the paddle moving towards the top left
//vx: + = right, - = left
//vy: + = up, - = down
var ball = {
	x: player.x + 12, //im adding <12> because THATS THE RADIUS
	y: player.y - 35, //im subtracting <15> because THATS THE RADIUS - 3 so that their isn't an instant collision
	r: 12, //BEFORE CHANGE, THE TWO ABOVE DEPEND ON THIS
	vx: 5,
	vy: 7,
}

function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

//END: essential elements

//START: Mouse Stuff To Move The Player
canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock || document.webkitExitPointerLock;

canvas.onclick = function() {
  canvas.requestPointerLock();
}

//when the status of the lock changes call lockChangeAlert()
document.addEventListener('pointerlockchange', lockChangeAlert, false);
document.addEventListener('mozpointerlockchange', lockChangeAlert, false);
document.addEventListener('webkitpointerlockchange', lockChangeAlert, false);

//When the lock is changed, check to see if it locked, if it is add a listener to call a function when the mouse moves,
function lockChangeAlert() {
  if(document.pointerLockElement === canvas ||
  document.mozPointerLockElement === canvas ||
  document.webkitPointerLockElement === canvas) {
    console.log('The pointer lock status is now locked');
    document.addEventListener("mousemove", mouseMove, false);
  } else {
    console.log('The pointer lock status is now unlocked');  
    document.removeEventListener("mousemove", mouseMove, false);
  }
}

function mouseMove(e) {
  var movementX = e.movementX ||
      e.mozMovementX          ||
      e.webkitMovementX       ||
      0;

  player.x += movementX;
}

//Function to get the mouse position
function getMousePos(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
}

function returnMouseXPos(e) {
	var movementX
}

//END: of mouse stuff
//START: Block Stuff/Barriers/Hittable
//This function receives an empty row array, assigns a random number of blocks per row and sets the width, and other values
function assignBlocksPerRow (row, rowNumber) {
	var numberOfBlocks = Math.floor((Math.random() * 10) + 5);
	var xIncrease = canvas.width / numberOfBlocks;
	var width = canvas.width / numberOfBlocks;
	var yPos = rowNumber * 50; //THE 50 HERE IS EACH ROWS HEIGHT
	row.push({"x": 0, "y": yPos, "w": width, "h": 50, "color": getRandomColor()});
	for(var i = 0; i < numberOfBlocks - 1; i++) {
		row.push({"x": row[i].x + xIncrease, "y": yPos, "w": width, "h": 50, "color": getRandomColor()});
	}
	return row;
}

//Their will ALWAYS be 5 rows, in this case this is the first row, at the top of the screen
var blockRow0 = [];
var blockRow1 = [];
var blockRow2 = [];
var blockRow3 = [];
var blockRow4 = [];
blockRow0 = assignBlocksPerRow(blockRow0, 0);
blockRow1 = assignBlocksPerRow(blockRow1, 1);
blockRow2 = assignBlocksPerRow(blockRow2, 2);
blockRow3 = assignBlocksPerRow(blockRow3, 3);
blockRow4 = assignBlocksPerRow(blockRow4, 4);

function drawBlocks(row) {
	for(var i = 0; i < row.length; i++) {
		var block = row[i];
		//draw each block
		ctx.beginPath();
		ctx.rect(block.x, block.y, block.w, block.h);
		ctx.fillStyle = block.color;
		ctx.stroke();
		ctx.fill();
		ctx.closePath();
	}
}

function checkBlockCollision(row) {
	for(var i = 0; i < row.length; i++) {
		var block = row[i];
		//check for collisions
		//first with the sides of the block
		if(ball.x > block.x - ball.r && ball.x < block.x + block.w + ball.r && ball.y < block.y + block.h + ball.r && ball.y > block.y - ball.r) {
			//check for which side the collision occured
			//left side
			if(ball.x < block.x) {
				ball.vx = -ball.vx;
			}
			//right
			if(ball.x > block.x + block.w) {
				ball.vx = -ball.vx;
			}
			//top
			if(ball.y < block.y) {
				ball.vy = -ball.vy;
			}
			//bottom
			if(ball.y > block.y + block.h) {
				ball.vy = -ball.vy;
			}
			//increase score and destroy the bloc
			score += 5;
			row.splice(i, 1);
		}
	}
}

function checkForBlocksDestroyed() {
	if(blockRow0.length === 0 && blockRow1.length === 0 && blockRow2.length === 0 & blockRow3.length === 0 && blockRow4.length === 0) {
		blockRow0 = assignBlocksPerRow(blockRow0, 0);
		blockRow1 = assignBlocksPerRow(blockRow1, 1);
		blockRow2 = assignBlocksPerRow(blockRow2, 2);
		blockRow3 = assignBlocksPerRow(blockRow3, 3);
		blockRow4 = assignBlocksPerRow(blockRow4, 4);

		ball.vy += 3;
		playerLives += 1;
	}
}

//END: Block Stuff
//START: GAME OVER THINGS

function checkForAndRunGameOver() {
	if(playerLives < 1) {
		//draw game over text
		console.log("GAME OVER! Your score is ...");
		ctx.font="60px Georgia";
		ctx.fillStyle = "black";
		ctx.fillText("GAME OVER!", canvas.width/2 - (canvas.width * .10), canvas.height/2);
		ctx.fillStyle = "red";
		ctx.fillText("Score: " + score, canvas.width/2 - (canvas.width * .055), canvas.height/2 + 55);
		
		//remove the mouse lock
        document.exitPointerLock();

		//positon the ball off the screen
		ball.x = canvas.width + ball.r;
		ball.vx = 0;
		ball.vy = 0;

		//draw the restart button
		ctx.beginPath();
		ctx.rect(restartButton.x, restartButton.y, restartButton.w, restartButton.h);
		ctx.stroke();
		ctx.closePath();

		//draw some restart button text
		ctx.font = "20px Georgia";
		ctx.fillStyle = "black";
		ctx.fillText("Restart", restartButton.x + 45, restartButton.y + 22);

		//check for click on restartButton
		canvas.addEventListener('click', function(evt) {
    		var mousePos = getMousePos(canvas, evt);

    		if (mousePos.x > restartButton.x && mousePos.x < restartButton.x+ restartButton.w && mousePos.y < restartButton.y+restartButton.h && mousePos.y > restartButton.y) {
        		restartGame();
    		}
		}, false);
	}
}

var restartButton = {
	x: (canvas.width/2) - 26,
	y: canvas.height/2 + 85,
	h: 30,
	w: 150
}

//END: GAME OVER STUFF

//START: RESTART FUNCTION
function restartGame() {
	//reset the lives
	playerLives = 3;
	//clear out all previous blocks
	blockRow0.length = 0;
	blockRow1.length = 0;
	blockRow2.length = 0;
	blockRow3.length = 0;
	blockRow4.length = 0;
	//replace the blocks
	blockRow0 = assignBlocksPerRow(blockRow0, 0);
	blockRow1 = assignBlocksPerRow(blockRow1, 1);
	blockRow2 = assignBlocksPerRow(blockRow2, 2);
	blockRow3 = assignBlocksPerRow(blockRow3, 3);
	blockRow4 = assignBlocksPerRow(blockRow4, 4);
	//return the ball to the screen
	ball.x = player.x + 12;
	ball.y = player.y - 35;
	ball.vx = 5;
	ball.vy = 7;
	//reset the score
	score = 0;

	canvas.requestPointerLock();
}
//END: RESTART FUNCTION



////START: meat of the game... update loop
function update() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	//START: Player/Paddle Stuff
	//check borders for player and walls
	if(player.x < 0) {
		player.x = 0;
	}
	if(player.x > canvas.width - player.w) {
		player.x = canvas.width - player.w;
	}
	if(player.y < 0) {
		player.y = 0;
	}
	if(player.y > canvas.height - player.h) {
		player.y = canvas.height - player.h;
	}

	//draw the paddle/player
	ctx.beginPath();
	ctx.rect(player.x, player.y, player.w, player.h);
	ctx.fillStyle = "darkgray";
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
	//END: Player/Paddle Stuff

	//START: Ball Stuff
	//move the ball and draw it/it's a circle
	//This is the initial movement, its aimed towards the top right
	ball.x += ball.vx;
	ball.y -= ball.vy;
	

	//check for wall collisions with the ball, if collision occurs reverse velocity
	if(ball.x > canvas.width - ball.r) {
		ball.vx = -ball.vx;
	}
	if(ball.x < 0 + ball.r) {
		ball.vx = -ball.vx;
	}
	if(ball.y < 0 + ball.r) {
		ball.vy = -ball.vy;
	}
	if(ball.y > canvas.height - ball.r) {
		//***DELETE LATER****
		ball.x = player.x + 12, //im adding <12> because THATS THE RADIUS
		ball.y = player.y - 35,
		ball.vy = -ball.vy;
		ball.vx = 5; //THE ORIGINAL VX VELOCITY
		//decrease the player lives
		if(playerLives > 0) {
			playerLives += -1;
		}
	}
	//BASIC COLLISION
	//check for collisions between ball and paddle
	//check for area of collision
	if(ball.y > player.y - player.h && ball.y < player.y && ball.x > player.x - ball.r && ball.x < player.x + player.w + ball.r) {
		//defines the percentage from the left that the ball hit
		var hitArea = ((ball.x - (player.x - ball.r)) / (player.w + ball.r)) * 100;
		//determine launch angle 
		if(hitArea != 50) {
			if(hitArea < 42 || hitArea > 58) {
				ball.vx = ((hitArea - 50) * 0.23529); //increase the multiplied number to increase speed
			}
		}
		ball.vy = -ball.vy;
	}

	ctx.beginPath();
	ctx.arc(ball.x,ball.y,ball.r,0,2*Math.PI);
	ctx.fillStyle = "red";
	ctx.stroke();
	ctx.fill();
	ctx.closePath();
	//END: Ball Stuff

	//START: Blocks Stuff
	drawBlocks(blockRow0);
	drawBlocks(blockRow1);
	drawBlocks(blockRow2);
	drawBlocks(blockRow3);
	drawBlocks(blockRow4);

	//check for collison
	checkBlockCollision(blockRow0);
	checkBlockCollision(blockRow1);
	checkBlockCollision(blockRow2);
	checkBlockCollision(blockRow3);
	checkBlockCollision(blockRow4);

	checkForBlocksDestroyed();
	//END: Block Stuff
	
	//START: GUI STUFF
	//display the score
	//UPDATE: **CHANGE IT SO THE TEXT EXPANDS LEFT AND NOT THE OTHER WAY
	//check the number of digits in the score to position the text accordingly;
	var xPosScoreText;
	if(score < 10) {
		xPosScoreText = canvas.width - 30;
	} else if(score >= 10 && score < 100) {
		xPosScoreText = canvas.width - 50;
	} else if(score >= 100 && score < 1000) {
		xPosScoreText = canvas.width - 71;
	} 
	ctx.font="40px Arial";
	ctx.fillStyle = "black";
	ctx.fillText(score, xPosScoreText, 40);

	ctx.font="20px Arial";
	ctx.fillStyle = "black"
	ctx.fillText("Lives: " + playerLives, canvas.width - 80, canvas.height - 12);
	//END: GUI STUFF
	//START: GAME OVER STUFF

	checkForAndRunGameOver();
	//END: GAME OVER STUFF
	//repeat
	animation(update);
}