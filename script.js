// starfighter game by Anton Demkin
// v 0.0.1
// basic conception
// v 0.0.2
// added graphic for asteroids and player ship
// v 0.0.3
// slight change in bullet logic
// v 0.0.4
// changed asteroid logic
// added global debug mode
// code clean up
// v 0.0.5
// asteroids crack into smaller ones
// added dependence of asteroid ammount and speed on a player score
// v 0.1
// added player lives
// added death
// added background stars
// v 0.1.1
// added collision debug option
// added pixelate effect
// v 0.1.2
// added new star graphics
// removed bug with no stars when player is dead
// improved player graphics when player teleports through screen edge
// v 0.1.3
// added pause function
// created new player draw with correct position and removed player.r1
// created a buttons for menu
// v 0.1.4
// created full cycle game menu's: intro menu, game, death menu
// redesigned stars speed to adjust speed slowly, not momentaly
// v 0.1.5
// minor optimisations
// some code cleanup
// v 0.1.6
// created star parralax effect
// v 0.1.7
// added info text
// v 0.2.0
// public alpha release
// v 0.2.1
// added some notes


// todo: add version identificator in main menu (!)
// todo: add transactions for buttons
// todo: create game states (menu, play, dead)
// todo: animate asteroid destruction
// todo: animate player death
// todo: make optimisations to reduce calculations
// todo: asteroids collision with other asteroids
// todo: add pause tutorial
// todo: refactor
// todo: shake screen when asteroid explodes
// todo: increase initial debree speed and decrease it over time to normal value.

// bug: no asteroids in menu




var player;
var playerScore;
var bullets = [];
var asteroids = [];
var stars = [];
var offset = 150; // let bullet go off screen for this ammount of px, 150px by default
var debug = false; // log a lot of stuff into console and on a scren
var asteroidSpawnRate = 0.1; // difficulty, number of asteroids on a field, depends on score
var playerLives;
var stateMenu;
var stateGame;
var pause = false;
var button = [];
var currentFrame;
var startTimer = false;
var randomHint;




function setup() {
    pixelDensity(1);
    createCanvas(800, 600);

    //create player
    // player = new Player();
    // playerLives = 3;

    /* // create stars
     for (var i = 0; i < 200; i++) {
         stars[i] = new Star();
     }*/

    //new create stars
    for (var i = 0; i < 100; i++) {
        stars[i] = new Star(1);
    }
    for (var i = 100; i < 150; i++) {
        stars[i] = new Star(0.8);
    }
    for (var i = 150; i < 200; i++) {
        stars[i] = new Star(0.6);
    }
    stateMenu = true;

}



function draw() {
    if (stateMenu) {
        menuState();
    }
    if (stateGame) {
        gameState();
    }
}

function menuState() {
    background(240);
    startTimer = true;

    //player is needed for asteroids and stars...
    player = new Player();
    playerLives = 999;
    player.x = width / 2;
    player.y = height / 2;
    player.speed = 0; 

    for (var i = 0; i < stars.length; i++) {
        stars[i].ps = 8; //speed
        stars[i].draw();
    }

    // create asteroids
    while (asteroids.length < 5) {
        createNewAsteroid();
    }
    //update asteroids
    for (i = 0; i < asteroids.length; i++) {
        asteroids[i].show();
        asteroids[i].update();
    }

    button = new Button('PLAY', 400, 400, 240, 80, 12, 0);

    push();
    noStroke();
    textAlign(CENTER);
    textSize(100);
    fill(40);
    text('STARFIGTER', width / 2, 150);
    textSize(30);
    fill(80);
    text('USE Z KEY\n to shoot', 240, 240);
    text('USE ARROWS\n to move', width - 240, 240);

    copyRight();

    pop();
}

function gameState() {
    background(240);

    //draw stars
    for (var i = 0; i < stars.length; i++) {
        stars[i].draw();
    }

    // create asteroids
    while (asteroids.length < Math.floor(playerScore * asteroidSpawnRate) + 3) {
        createNewAsteroid();
    }

    //update player
    if (playerLives <= 0) {
        player = 0;
    }
    if (player) {
        player.control();
        player.move();
        player.show();
    }

    //update bullets
    for (var i = 0; i < bullets.length; i++) {
        bullets[i].show();
    }

    //update asteroids
    for (i = 0; i < asteroids.length; i++) {
        asteroids[i].show();
        asteroids[i].update();

    }

    showScore();
    showText();

    if (debug) {
        showfps();
    }

    if (playerLives == 0) {
        button = new Button('PLAY AGAIN?', 400, 400, 460, 80, 12);

    }

    // show tutorial text if player has not moved yet
    if (currentFrame + 240 >= frameCount) {
        push();
        noStroke();
        var a = frameCount - currentFrame;
        fill(80, 80, 80, 240 - a);
        textAlign(CENTER);
        textSize(30);
        text('USE Z KEY\n to shoot', 240, 240);
        text('USE ARROWS\n to move', width - 240, 240);
        pop();
    }

    // create a timer for timed event in the begining
    if (currentFrame + 120 <= frameCount) {
        startTimer = false;
        if (debug) {
            console.log('Timer = false');
        }
    } else {
        startTimer = true;
        if (debug) {
            console.log('Timer = true');
        }
    }
}


// ***************************************************************************
//      P L A Y E R
// ***************************************************************************

function Player() {
    this.x = width * 0.5; // spawn position
    this.y = height * 0.8; // spawn position
    this.a = -PI / 2; // default angle (up)
    this.r = 24; // length, constant
    this.x1;
    this.y1;
    this.speed = 0; //initial speed should be 0, otherwize no tutorial


    this.move = function() {
        //teleport through screen edges
        if (this.x > 800) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = width;
        }
        if (this.y > height) {
            this.y = 0;
        }
        if (this.y < 0) {
            this.y = height;
        }

        //calculate position and angle
        this.x = this.x + this.speed * cos(this.a);
        this.y = this.y + this.speed * sin(this.a);

        // calculate second vector point
        this.x1 = this.x + this.r * cos(this.a);
        this.y1 = this.y + this.r * sin(this.a);

        //inertion
        this.speed *= 0.95;
    }

    this.show = function() {

        // x & y = current point
        // x1 & y1 = vector point at a direction given by
        // this.a (angle) on a distance given by this.r (radius)
        //one full turn 360 is 2PI

        stroke(40);
        strokeWeight(3);

        // check if player is around edges and redraw on the other side if so
        if (this.x < this.r) {
            //draw second player on the other side of a screen
            playerShip(this.x + width, this.y,
                this.x1 + width, this.y1,
                this.a, this.r);
        }
        if (this.x > width - this.r) {
            //draw second player on the other side of a screen
            playerShip(this.x - width, this.y,
                this.x1 - width, this.y1,
                this.a, this.r);
        }
        if (this.y < this.r) {
            //draw second player on the other side of a screen
            playerShip(this.x, this.y + height,
                this.x1, this.y1 + height,
                this.a, this.r);
        }
        if (this.y > height - this.r) {
            //draw second player on the other side of a screen
            playerShip(this.x, this.y - height,
                this.x1, this.y1 - height,
                this.a, this.r);
        }
        // draw player ship
        playerShip(this.x, this.y, this.x1, this.y1, this.a, this.r);

        if (debug) {
            push();
            noStroke();
            text('speed: ' + (this.speed).toFixed(2), this.x1, this.y1 + 30);
            stroke(220, 0, 220);
            noFill();
            strokeWeight(1);
            ellipse(this.x, this.y, this.r * 2);
            strokeWeight(3);
            stroke(255, 0, 0);
            point(this.x, this.y);
            point(this.x1, this.y1);
            pop()
        }
    }

    this.control = function() {
        if (keyIsDown(LEFT_ARROW)) {
            this.a -= 0.07;
        }
        if (keyIsDown(RIGHT_ARROW)) {
            this.a += 0.07;
        }
        if (keyIsDown(UP_ARROW)) {
            this.speed += 0.5; // forward speed
        }
        if (keyIsDown(DOWN_ARROW)) {
            this.speed -= 0.3; // backward speed
        }

        // shoot the bullets in debug mode
        if (debug) {
            if (keyIsDown(SHIFT)) {
                //create new bullet
                bullets.push(new Bullet(this.x1, this.y1,
                    this.a, this.speed));
            }
        }
    }
}

// draw a player ship
// x,y = current position
// x1 & y1 = vector point at a direction given by
// this.a (angle) on a distance given by this.r (radius)
// this.r is a wing size
//  one full turn 360 is 2PI
function playerShip(x, y, x1, y1, a, r) {
    var wingAngle = PI / 1.27;
    quad(
        //  top
        x1,
        y1,
        //  left wing
        x + r * cos(a + wingAngle),
        y + r * sin(a + wingAngle),
        // back
        x + r * 0.5 * cos(a - PI),
        y + r * 0.5 * sin(a - PI),
        // right wing
        x + r * cos(a - wingAngle),
        y + r * sin(a - wingAngle)
    );
}

// GAME CONTROLS
// create bullet if 'Z' is pressed
// pause game if 'P' is pressed
// create new asteroid if 'o' is pressed and debug is on
// toggle debug mode is '0' is pressed
// todo: add check for game
function keyTyped() {
    // todo: add check if game is on
    if (stateGame) {
        if (key === 'z' || key === 'я') {
            if (player) {
                bullets.push(new Bullet(player.x1, player.y1,
                    player.a, player.speed));
            }
        }
        

        if (key === 'p') {
            pause = !pause;
            if (pause) {
                noLoop();
                console.log('Game is paused');

            }
            if (!pause) {
                loop();
            }
        }
    }
    if (key == '1') {
        debug = !debug;
        if (debug) {
            console.log('Debug mode ON \n NOTE THAT DEBUG SLOW DOWN A GAME!!!');
        }

    }

    if (debug) {
        //increase and decrease player lives
        if (key === '-') {
            if (playerLives > 0) {
                playerLives--;
            }
            console.log('Player lives decreased');
        }
        if (key === '+') {
            playerLives++;
            console.log('Player lives increased');
        }
        // create new asteroid in debug mode
        if (key === 'o') {
            createNewAsteroid();
        }
    }
}
// **************************************************************************
function Bullet(x, y, a, speed) {
    this.x = x;
    this.y = y;
    this.a = a; //angle
    this.s = 5 + speed; //speed + ship speed
    //this.l = 5;       //length of ray
    this.age = frameCount;

    this.show = function() {

        for (var i = 0; i < bullets.length; i++) {
            // delete bullet if it is off screen or older than 5 seconds
            if (bullets[i].x < 0 - offset |
                bullets[i].y < 0 - offset |
                bullets[i].x > width + offset |
                bullets[i].y > height + offset |
                bullets[i].age + 200 < frameCount
            ) {
                bullets.splice(i, 1);
            }
        }

        this.x = this.x + this.s * cos(this.a);
        this.y = this.y + this.s * sin(this.a);

        push();
        strokeWeight(3);
        fill(0);
        ellipse(this.x, this.y, 3);
        //point(this.x, this.y);
        pop();
    }
}
// **************************************************************************
// asteroid object
// paremeters( x, y, angle (optional), speed (optional), radius (optional) )
// **************************************************************************
function Asteroid(x, y, a, s, r) {
    this.x = x;
    this.y = y;
    // angle of movement, a vector force
    if (a == null) {
        this.a = random(-PI, PI);
    } else {
        this.a = a;
    }
    // speed of movement
    if (s == null) {
        this.s = 0.9 + (playerScore + 1) * 0.01; //1.1
    } else {
        this.s = s;
    }
    // radius (also health), a variable
    if (r == null) {
        this.r = 45;
    } else {
        this.r = r;
    }

    this.an = random(-PI, PI); // visual angle
    this.maxr = this.r; //used as maximum health, a constant
    this.minr = this.r / 2; //used as minimum health, a constant
    this.as = random(-PI * this.s * 0.02, PI * this.s * 0.02); //rotation speed
    this.v = Math.round(random(5, 10)); //number of rays

    //  create a large number to store rays lengths
    //  then convert number to string
    //  numbers count should be as this.v maximum
    this.rays = Math.round(random(1111111111, 9999999999)) + '';

    // draw asteroid
    this.show = function() {
            // first we create this.v radiuses that divide whole circle equally
            // then we calculate each ones length depending on this.rays numbers
            // e.g. first number is length of first ray, etc...
            // then we put vertex points in calculated location (angle this.a)
            // and length
            // then we connect them into shape with p5 function shape.
            stroke(40);
            strokeWeight(3);
            var rayLength = [];
            beginShape();
            for (var i = 0; i < this.v; i++) {

                //todo: optimise here!
                rayLength[i] = Math.round(
                    map(this.rays[i],
                        1,
                        9,
                        this.minr,
                        this.maxr) * (this.r / this.maxr)
                );
                var c = this.an + 2 * PI / this.v * i; // little optimisation
                // vertex(

                //     this.x + rayLength[i] * cos(this.an + 2 * PI / this.v * i),
                //     this.y + rayLength[i] * sin(this.an + 2 * PI / this.v * i)
                // );
                vertex(
                    this.x + rayLength[i] * cos(c),
                    this.y + rayLength[i] * sin(c)
                );

            }
            endShape(CLOSE);

            if (debug) {
                push();
                strokeWeight(1);
                noFill();
                stroke(220, 0, 220);
                ellipse(this.x, this.y, this.r * 2);
                stroke(255, 0, 0);
                strokeWeight(3);
                point(this.x, this.y);
                pop();
            }
        }
        // calculate asteroid position
    this.update = function() {
        //if asteroid is low on health (small radius)
        //then increase player score
        //delete current asteroid and create new asteroid
        //

        for (var j = 0; j < asteroids.length; j++) {
            // check if asteroid intersects with player,
            // remove one line from player and destroy asteroid
            if (stateGame)
                if (dist(asteroids[j].x, asteroids[j].y, player.x, player.y) < asteroids[j].r + player.r) {
                    playerLives--;
                    asteroids.splice(j, 1);
                    break;
                }


                // if asteroid is outside of screen edges
                // + offset, then remove it from array
                // and create a new random asteroid
            if (asteroids[j].x < 0 - offset |
                asteroids[j].x > width + offset |
                asteroids[j].y < 0 - offset |
                asteroids[j].y > height + offset) {
                asteroids.splice(j, 1);
                if (debug) {
                    console.log('asteroid removed');
                }
                if (asteroids.length < Math.floor(playerScore * asteroidSpawnRate) + 3) {
                    createNewAsteroid();
                }
                break;
            }
            // if bullet intersects with asteroid, then make
            // radius (health) smaller and remove that bullet
            // or separate it into smaller asteroids
            for (var i = 0; i < bullets.length; i++) {
                if (dist(asteroids[j].x, asteroids[j].y,
                        bullets[i].x, bullets[i].y) < (asteroids[j].r)) {
                    asteroids[j].r -= 10;
                    bullets.splice(i, 1);
                    // split bigger asteroid into smaller ones
                    // if got hit and 50% chance
                    // append(asteroids, new Asteroid(x, y, angle, speed, radius));
                    if (asteroids[j].r < asteroids[j].maxr &&
                        random(2) < 1 &&
                        asteroids[j].maxr > 25) {

                        var newChildAsteroids = Math.round(random(2, 5));
                        for (var t = 0; t < newChildAsteroids; t++) {
                            append(asteroids, new Asteroid(asteroids[j].x + random(-30, 30),
                                asteroids[j].y + random(-30, 30),
                                asteroids[j].a + random(-0.5, 0.5),
                                asteroids[j].s,
                                asteroids[j].r * (2.1 / newChildAsteroids)))
                        }
                        asteroids.splice(j, 1);
                        break;
                    }
                }
            }
            // if asteroid health is below minimum
            // remove it from array and add 1 to player score
            // and create a new random asteroid
            if (asteroids[j].r < asteroids[j].minr) {
                playerScore++;
                asteroids.splice(j, 1);
                // todo change timeout method, this one is not working
                // todo point asteroids towards player
                // replace 10 with offset
                if (debug) {
                    console.log('asteroid destroyed');
                }
                if (asteroids.length < Math.floor(playerScore * asteroidSpawnRate) + 3) {
                    createNewAsteroid();
                }
                break;
            }
        }

        // move position based on x,y, speed and angle
        this.x = this.x + this.s * cos(this.a);
        this.y = this.y + this.s * sin(this.a);

        // asteroid rotation
        this.an += this.as;
    }
}

// create an asteroid that is out of screen edges
// and pointed towards player with random offset
function createNewAsteroid() {
    // create a random x and y off screen but close to edge
    var astRX = randomCoord(width, offset);
    var astRY = randomCoord(height, offset);
    // random offset to detune angle
    var randomOffset = 100;

    // point new asteroid towards player
    var astAngle = getAngle(astRX, astRY,
        player.x + random(-randomOffset, randomOffset),
        player.y + random(-randomOffset, randomOffset)
    );
    append(asteroids, new Asteroid(astRX, astRY, astAngle));
    if (debug) {
        console.log('new asteroid on x:' + astRX + ' y:' + astRY);
    }
}

// STARS FUNCTION
// create stars,  arguments: speed coefficient, player speed, angle
function Star(coefficient, ps, a) {
    this.x = random(0, width);
    this.y = random(0, height);
    if (ps != null) {
        this.ps = ps;
    }

    if (a != null) {
        this.a = a;
    }
    if (coefficient != null) {
        this.c = coefficient;
    }

    this.draw = function() {

        //if player exist then take speed and angle from his movement
        if (player.speed != null) {
            //this.ps = player.speed;

            // if (player.speed < this.ps &
            //     player.x == width * 0.5 &
            //     this.y == height * 0.8) 
            if (startTimer) {
                this.ps *= 0.97;
            } else {
                this.ps = player.speed;
            }
        } else {
            this.ps *= 0.99;
        }
        if (player.a != null) {
            this.a = player.a;
        }

        // this.x += this.ps * cos(this.a) * -0.3 * this.c;
        // this.y += this.ps * sin(this.a) * -0.3 * this.c;
        // little optimisation:
        var v = this.ps * -0.3 * this.c;
        this.x += cos(this.a) * v;
        this.y += sin(this.a) * v;


        if (this.x > width) {
            this.x = 0;
        }
        if (this.x < 0) {
            this.x = width;
        }
        if (this.y > height) {
            this.y = 0;
        }
        if (this.y < 0) {
            this.y = height;
        }
        push();
        strokeWeight(2);
        //stroke(160);
        stroke(255 - 95 * this.c);
        point(this.x, this.y);

        strokeWeight(1);
        //stroke(80);
        stroke(255 - 175 * this.c);
        point(this.x + 1, this.y);
        point(this.x - 1, this.y);
        point(this.x, this.y + 1);
        point(this.x, this.y - 1);
        pop();
    }

}




// **************************************************************************
//  T E X T   A N D   L O G I C    S T U F F ! ! ! ! ! !
// **************************************************************************

function showScore() {
    textSize(15);
    noStroke();
    text('Score: ' + playerScore, width - 100, 20);
}

function showfps() {
    textSize(15);
    noStroke();
    text('FPS: ' + Math.round(frameRate()), 15, 15);
}

// function to show all ingame messages
function showText() {
    //♥︎ ▼ ▼ ▼
    textSize(14);
    noStroke();
    for (var i = 0; i < playerLives; i++) {
        text('▼', width - 120 - 15 * i, 21);

    }

    if (playerLives == 0) {
        push();
        //stroke(3);
        textAlign(CENTER);
        textSize(60);
        text('YOU ARE DEAD\n your score is ' + playerScore, width / 2, 100);
        textSize(30);
        text('Hint: ' + hints[randomHint], width / 2, 270);
        copyRight();
        pop();
    }

    if (pause) {
        push();
        //stroke(3);
        textAlign(CENTER);
        textSize(60);
        text('GAME IS PAUSED', width / 2, 100);
        pop();
    }

    if (debug) {
        push();
        textSize(15);
        noStroke();
        text('DEBUG MODE IS ON', 15, 32);
    }
}



// b = border
function Button(string, x, y, w, h, b) {
    this.mouseover = false;

    if (mouseX > x - (w / 2) & mouseX < x + (w / 2)) {
        if (mouseY > y - (h / 2) & mouseY < x + (h / 2)) {
            this.mouseOver = true;
            //console.log('Mouse is over the button');
        }
    }

    this.cborder;
    this.cfill;
    this.ctext;

    if (!this.mouseOver & !mouseIsPressed | !this.mouseOver & mouseIsPressed) {
        //default state
        this.cborder = color(120);
        this.cfill = color(180);
        this.ctext = color(240);
    }
    if (this.mouseOver & !mouseIsPressed) {
        // if mouse is over button
        this.cborder = color(100);
        this.cfill = color(200);
        this.ctext = color(255);

    }
    if (this.mouseOver & mouseIsPressed) {
        //if button is clicked
        this.cborder = color(80);
        this.cfill = color(140);
        this.ctext = color(220);

    }


    push();
    textAlign(CENTER, CENTER);
    textSize(60);
    rectMode(CENTER);
    fill(this.cfill);
    stroke(this.cborder);
    if (mouseIsPressed & this.mouseOver) {
        strokeWeight(b - 2);
        y += 2;
    } else {
        strokeWeight(b);
    }
    rect(x, y, w, h, b);
    noStroke();
    fill(this.ctext);
    text(string, x, y);
    pop();

    this.clicked = function() {
        /// do smth if clieed
        if (this.mouseOver) {

            if (debug) {
                console.log('button is pressed');
            }
            startNewGame();


        }
    }
}
// check if button is clicked
function mouseClicked() {
    if (button) {
        button.clicked();
    }
}

// reset everything and start a new game
function startNewGame() {
    // remove all objects
    button = null;
    asteroids = 0;
    bullets = 0;

    // todo: make a transfer slower!
    //resetState();
    stateMenu = false;
    stateGame = true;

    //set up player variables
    playerScore = 0;
    playerLives = 3;

    // create game objects
    player = new Player();
    bullets = [];
    asteroids = [];

    currentFrame = frameCount;

    //while new cycle have not started yet and player lives is 0,
    // generate a value for random hint
    randomHint = Math.floor(random(hints.length - 1));
    if (debug) {
        console.log('Hint to show: ' + randomHint + '/' + hints.length);
    }

}

var hints = ['you can travel through screen edges.',
    'the more you shoot \nthe more chances you have',
    'try to move as much as you can',
    'OMG LOL YOU GOT\n 73h $3CR37 M3$$@G3'
];


function copyRight() {
    textSize(14);
    strokeWeight(4);
    stroke(240);
    text('STARFIGHTER (c) 2017 ANTON DEMKIN ALL RIGHTS RESERVED' +
        '\n antondemkin@yandex.ru' +
        '\ncreated with p5.js',
        width / 2, height - 70);
}
// **************************************************************************
// M A T H   G O E S   H E R E ! ! !
// **************************************************************************

// calculates angle between two points in radians (pi)
function getAngle(x1, y1, x2, y2) {
    c = PI / 2 - atan2(x2 - x1, y2 - y1);
    return c;
}

// generate random coordinate out of screen
// but within a border of a given offset
function randomCoord(dimension, offset) {
    var c = Math.round(random(0, 1));
    if (debug) {
        console.log('c = ' + c);
    }
    var a;
    if (c == 0) {
        a = random(-offset, 0);
    }
    if (c == 1) {
        a = random(dimension, dimension + offset);
    }
    return a;
}