var AM = new AssetManager();

function Animation(spriteSheet, frameWidth, frameHeight, sheetWidth, frameDuration, frames, loop, scale) {
    this.spriteSheet = spriteSheet;
    this.frameWidth = frameWidth;
    this.frameDuration = frameDuration;
    this.frameHeight = frameHeight;
    this.sheetWidth = sheetWidth;
    this.frames = frames;
    this.totalTime = frameDuration * frames;
    this.elapsedTime = 0;
    this.loop = loop;
    this.scale = scale;
}

Animation.prototype.drawFrame = function (tick, ctx, x, y) {
    this.elapsedTime += tick;
    if (this.isDone()) {
        if (this.loop) this.elapsedTime = 0;
    }
    var frame = this.currentFrame();
    var xindex = 0;
    var yindex = 0;
    xindex = frame % this.sheetWidth;
    yindex = Math.floor(frame / this.sheetWidth);

    ctx.drawImage(this.spriteSheet,
                 xindex * this.frameWidth, yindex * this.frameHeight,  // source from sheet
                 this.frameWidth, this.frameHeight,
                 x, y,
                 this.frameWidth * this.scale,
                 this.frameHeight * this.scale);
}

Animation.prototype.currentFrame = function () {
    return Math.floor(this.elapsedTime / this.frameDuration);
}

Animation.prototype.isDone = function () {
    return (this.elapsedTime >= this.totalTime);
}

// no inheritance
function Background(game, spritesheet) {
    this.x = 0;
    this.y = 0;
    this.spritesheet = spritesheet;
    this.game = game;
    this.ctx = game.ctx;
};

Background.prototype.draw = function () {
    this.ctx.drawImage(this.spritesheet,
                   this.x, this.y);
};

Background.prototype.update = function () {
};

// inheritance 
function Todd(game, spritesheet) {
    this.animation = new Animation(spritesheet, 401, 137, 5, 0.05, 60, true, 2);
    this.speed = 350;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 250);
}

Todd.prototype = new Entity();
Todd.prototype.constructor = Todd;

Todd.prototype.update = function () {
    //this.x += this.game.clockTick * this.speed;
    //if (this.x > 800) this.x = -230;
    Entity.prototype.update.call(this);
}

Todd.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}

function ScottPilgrim(game, spritesheet) {
    this.runRight = new Animation(spritesheet, 108, 140, 8, 0.1, 8, true, 2);
	this.runLeft = new Animation(spritesheet, 108, 140, 8, 0.1, 8, true, 2)
    this.x = 0;
    this.y = 400;
    this.speed = 500;
    this.game = game;
    this.ctx = game.ctx;
}

ScottPilgrim.prototype.draw = function () {
    this.runRight.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
	this.runLeft.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
}

ScottPilgrim.prototype.update = function () {
    if (this.runRight.elapsedTime)
        this.x += this.game.clockTick * this.speed;
    if (this.x > 800) 
		this.x = -230;//resets animation to left side
}

// inheritance 
function Guy(game, spritesheet) {
    this.animation = new Animation(spritesheet, 154, 215, 4, 0.15, 8, true, 0.5);
    this.speed = 100;
    this.ctx = game.ctx;
    Entity.call(this, game, 0, 450);
}

Guy.prototype = new Entity();
Guy.prototype.constructor = Guy;

Guy.prototype.update = function () {
    this.x += this.game.clockTick * this.speed;
    if (this.x > 800) this.x = -230;
    Entity.prototype.update.call(this);
}

Guy.prototype.draw = function () {
    this.animation.drawFrame(this.game.clockTick, this.ctx, this.x, this.y);
    Entity.prototype.draw.call(this);
}


AM.queueDownload("./img/Todd.png");
AM.queueDownload("./img/guy.jpg");
AM.queueDownload("./img/scottpilgrim.png");
AM.queueDownload("./img/runningcat.png");
AM.queueDownload("./img/background.jpg");

AM.downloadAll(function () {
    var canvas = document.getElementById("gameWorld");
    var ctx = canvas.getContext("2d");

    var gameEngine = new GameEngine();
    gameEngine.init(ctx);
    gameEngine.start();

    gameEngine.addEntity(new Background(gameEngine, AM.getAsset("./img/background.jpg")));  
    gameEngine.addEntity(new Todd(gameEngine, AM.getAsset("./img/Todd.png")));
	gameEngine.addEntity(new ScottPilgrim(gameEngine, AM.getAsset("./img/scottpilgrim.png")));
    //gameEngine.addEntity(new Guy(gameEngine, AM.getAsset("./img/guy.jpg")));

    console.log("All Done!");
});