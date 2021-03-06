window.onload = function ()	{

var socket = io.connect("http://24.16.255.56:8888");
var canvas = document.getElementById('gameWorld');

function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function Circle(game) {
    this.player = 1;
    this.radius = 20;
    this.visualRadius = 500;
    this.colors = ["Yellow", "Red", "Blue", "Green"];
    this.setHealthy();
	this.infectionTimer = 500;
    Entity.call(this, game, this.radius + Math.random() * (800 - this.radius * 2), this.radius + Math.random() * (800 - this.radius * 2));

    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
};

Circle.prototype = new Entity();
Circle.prototype.constructor = Circle;

	//	Has caught the virus, but not yet infectious
Circle.prototype.setSick = function () {
    this.sick = true;
	this.infectious = false;
	this.doctor = false;
    this.color = 0;
    this.visualRadius = 200;
};

	//	Is now infectious and can infect others
Circle.prototype.setInfectious = function ()	{
	this.infectious = true;
	this.doctor = false;
	this.color = 1;
	this.visualRadius = 500;
};
	
	//	is healthy but susceptable to infection
Circle.prototype.setHealthy = function () {
	this.sick = false;
	this.infectious = false;
	this.doctor = false;
    this.color = 3;
    this.visualRadius = 200;
};

Circle.prototype.setValues = function (infectionTimer, velx, vely, posX, posY) {
	this.infectionTimer = infectionTimer;
	this.velocity.x = velx;
	this.velocity.y = vely;
	this.x = posX;
	this.y = posY;
};


Circle.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Circle.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Circle.prototype.collideRight = function () {
    return (this.x + this.radius) > 800;
};

Circle.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Circle.prototype.collideBottom = function () {
    return (this.y + this.radius) > 800;
};

Circle.prototype.update = function () {
    Entity.prototype.update.call(this);
 //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;
	if (this.sick)	{
				if (this.infectionTimer < 1)	{
					this.setInfectious();
				}	else{
					this.infectionTimer -= 1;
			}
		}

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 800 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x)/dist;
            var difY = (this.y - ent.y)/dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
            
			if (this.doctor && ent.sick)	{
				ent.setHealthy();
			}
			else if (this.sick && ent.doctor)	{
				this.setHealthy();
			}
			
			if (this.infectious) {
                ent.setSick();
            }
            else if (ent.infectious) {
                this.setSick();
            }
        }

        if (ent != this && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (this.infectious && dist > this.radius + ent.radius + 10) {
                var difX = (ent.x - this.x)/dist;
                var difY = (ent.y - this.y)/dist;
                this.velocity.x += difX * acceleration / (dist*dist);
                this.velocity.y += difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x*this.velocity.x + this.velocity.y*this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
            if (ent.infectious && dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                this.velocity.x -= difX * acceleration / (dist * dist);
                this.velocity.y -= difY * acceleration / (dist * dist);
                var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                if (speed > maxSpeed) {
                    var ratio = maxSpeed / speed;
                    this.velocity.x *= ratio;
                    this.velocity.y *= ratio;
                }
            }
        }
    }


    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Circle.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.colors[this.color];
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

function TempCircle(isSick, isInfected, infectionTimer, velx, vely, xPos, yPos)	{
	this.isSick = isSick;
	this.isInfected = isInfected;
	this.infectionTimer = infectionTimer;
	this.velx = velx;
	this.vely = vely;
	this.x = xPos;
	this.y = yPos;
}
	
	TempCircle.prototype = new Entity();
    TempCircle.prototype.constructor = TempCircle;
	



// the "main" code begins here
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

var ASSET_MANAGER = new AssetManager();

ASSET_MANAGER.queueDownload("./img/960px-Blank_Go_board.png");
ASSET_MANAGER.queueDownload("./img/black.png");
ASSET_MANAGER.queueDownload("./img/white.png");

ASSET_MANAGER.downloadAll(function () {
    console.log("starting up da sheild");
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');

	var saveState = [];
    var gameEngine = new GameEngine();
    var circle = new Circle(gameEngine);
    circle.setSick();
    gameEngine.addEntity(circle);
	saveState[0] = circle;
    for (var i = 0; i < 25; i++) {
        circle = new Circle(gameEngine);
		saveState[i + 1] = circle;
        gameEngine.addEntity(saveState[i + 1]);

    }

		
	//	load socket code
	socket.on("load", function (data)	{
		console.log(data);
		console.log(data.data);
		
		
		
		for (var i = 0; i < 26; i++)	{
			saveState[i].removeFromWorld = true;
		}
		var tempArr = [];
		for (var i = 0; i < 26; i++)	{
			tempArr[i] = data.data[i];
		}
		
		for (var i = 0; i < 26; i++)	{
			var circle = new Circle(gameEngine);
			circle.setValues(tempArr[i].infectionTimer, tempArr[i].velx, tempArr[i].vely, tempArr[i].x, tempArr[i].y);
			if (tempArr[i].isInfected)	{				
				circle.setInfectious();
				saveState[i] = circle;
				gameEngine.addEntity(saveState[i]);
			}
			 else if (!tempArr[i].isInfected && tempArr[i].isSick)	{
				circle.setSick();
				saveState[i] = circle;
				gameEngine.addEntity(saveState[i]);
			 }	else	{
				saveState[i] = circle;
				gameEngine.addEntity(saveState[i]);
			 }
				 
				 
		}
	});
	
	var text = document.getElementById("text");
	var saveButton = document.getElementById("save");
	var loadButton = document.getElementById("load");
	
	saveButton.onclick = function ()	{
		console.log("saving");
		var saveArr = [];
		for (var i = 0; i < 26; i++)	{
			console.log(saveState[i].infectionTimer);
			saveArr[i] = new TempCircle(saveState[i].sick, saveState[i].infectious, saveState[i].infectionTimer, saveState[i].velocity.x, saveState[i].velocity.x, saveState[i].x, saveState[i].y);
		}
		console.log(saveArr);
	
		socket.emit("save", {studentname: "Patrick Lauer", statename: "Running", data: saveArr });
		console.log("saved");
	};
	
	loadButton.onclick = function ()	{
		console.log("load");
		socket.emit("load", {studentname: "Patrick Lauer", statename: "Running" });
		console.log("load complete");
	};


    gameEngine.init(ctx);
    gameEngine.start();
});

}
