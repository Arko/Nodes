/*
    Nodes – Arko's Experiment with HTML5 canvas element
    Author: Loïc Cattani (Arko) <loic.cattani@gmail.com>
    Date: December 2010
*/

var canvas;
var context;
var mouse = { x: 0, y: 0, down: false };
var framerate = 60;
var intervalId; // Will hold the loop reference

function initialize() {
  
  // Get the canvas element
  canvas = document.getElementById('world');
  
  if (canvas && canvas.getContext) {
    
    // Get 2D context
    context = canvas.getContext('2d');
    
    // Register Event Listeners
    canvas.addEventListener('mousedown', mouseDown, false);
    document.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
    document.addEventListener('keydown', keyDown, false);
    document.addEventListener('keyup', keyUp, false);
    window.addEventListener('resize', centerCanvas, false);
    
    // Initiate Nodes World
    NodesWorld.initialize();
    
    // Override canvas CSS positioning and center canvas on screen
    centerCanvas();
    
    // Initiate the loop
    start();
  }
}

// Event handler for mouseDown
function mouseDown() {
  mouse.down = true;
  mouseMove();
  NodesWorld.repel();
}

// Event handler for mouseUp
function mouseUp() {
  mouse.down = false;
  mouseMove();
}

// Event handler for mouseMove
function mouseMove() {
  mouse.x = event.clientX - (window.innerWidth - canvas.width) / 2;
  mouse.y = event.clientY - (window.innerHeight - canvas.height) / 2;
}

// Event handler for keyDown
function keyDown(event) {
  switch(event.keyCode){
    case 80: // "p" for pause
      toggleLoop();
      event.preventDefault();
      break;
  }
  // console.log("KeyCode: " + event.keyCode)
}

// Event handler for keyUp
function keyUp() {
}

// Center the canvas in the window's body
//   (Needed for mouse position to be accurate)
function centerCanvas() {
  canvas.style.position = 'absolute';
  canvas.style.top = Math.round((window.innerHeight - canvas.height - 12) / 2) + 'px'; // 12 = 2 * 6 pixels border
  canvas.style.left = Math.round((window.innerWidth - canvas.width - 12) / 2) + 'px';
}

// Initiate the loop
function start() {
  intervalId = setInterval(loop, 1000/framerate);
}

// Clear the loop
function pause() {
  clearInterval(intervalId);
  intervalId = null;
}

// Toggle loop interval
function toggleLoop() {
  (intervalId) ? pause() : start();
}

// The loop
function loop() {
  NodesWorld.update();
  NodesWorld.draw();
}

var NodesWorld = new function () {
  // Physics
  this.boundaries = { x: 0, y: 0, width: 940, height: 660 };
  this.drag = 0.002; // Good val: 0.002
  this.gravity = { force: 0.0, direction: Math.PI/2 }; // Good force: 0.2 Direction: Math.PI/2 rad => 90° from +x axis CW
  
  // Content
  this.node_count = 100;
  this.nodes = new Array();
  
  this.initialize = function() {
    // Transform gravity to a force vector
    this.gravity = new Vector(this.gravity.force, this.gravity.direction);
  
    // Fill world with randomly positionned nodes
    for (var i = this.node_count - 1; i >= 0; i--){
      node = new Node(Math.random() * this.boundaries.width, Math.random() * this.boundaries.height);
      this.nodes.push(node);
    }
  }
  
  // Update world's objects
  this.update = function () {
    // Update nodes
    for( var i = 0, len = this.nodes.length; i < len; i++ ) {
      node = this.nodes[i];
      node.update(this.drag, this.gravity);
    }
  }
  
  // Draw world
  this.draw = function () {
    
    // Clear world
    context.fillStyle = "rgba(0,0,8,1)";
    context.fillRect(this.boundaries.x, this.boundaries.y, this.boundaries.width, this.boundaries.height);
    
    // Draw nodes
    for( var i = 0, len = this.nodes.length; i < len; i++ ) {
      node = this.nodes[i];
      context.beginPath();
      context.arc( node.x, node.y, node.radius, 0, Math.PI*2, true );
      context.fillStyle = node.fillcolor;
      context.strokeStyle = node.strokecolor;
      context.lineWidth = 2;
      context.fill();
      context.stroke();
    }
  }
  
  // Blast away all nodes close to the mouse position
  this.repel = function () {
    mouse_pos = new Point(mouse.x, mouse.y);
    for( var i = 0, len = this.nodes.length; i < len; i++ ) {
      node = this.nodes[i];
      node_dist = mouse_pos.distanceTo(node);
      blast_magnitude = 800 * 1/(node_dist);
      blast_angle = mouse_pos.angleTo(node);
      f = new Vector(blast_magnitude, blast_angle);
      node.applyForce(f);
    }
  }
}

/* Defines a point in a 2D space */
function Point (x, y) {
  this.x = x || 0;
  this.y = y || 0;
}

/* Returns the distance between this and a given point */
Point.prototype.distanceTo = function (point) {
  a = point.x - this.x;
  b = point.y - this.y;
  return Math.sqrt(a*a + b*b);
}

/* Returns the angle between this and a given point */
Point.prototype.angleTo = function (point) {
  x = point.x - this.x;
  y = point.y - this.y;
  return Math.atan2(y, x);
}

/* Defines a vector in a 2D space */
function Vector (m, a) {
  this.magnitude = m || 0;
  this.angle = a || 0;
  this.x = 0;
  this.y = 0;
  this.updateXY();
}

Vector.prototype.setX = function (x) {
  this.x = x || 0;
  this.updateMA();
}

Vector.prototype.setY = function (y) {
  this.y = y || 0;
  this.updateMA();
}

Vector.prototype.setMagnitude = function (m) {
  this.magnitude = m || 0;
  this.updateXY();
}

Vector.prototype.setAngle = function (a) {
  this.angle = a || 0;
  this.updateXY();
}

Vector.prototype.updateMA = function () {
  x = this.x;
  y = this.y;
  this.magnitude = Math.sqrt(x*x + y*y);
  this.angle = Math.atan2(y,x);
}

Vector.prototype.updateXY = function () {
  this.x = this.magnitude * Math.cos(this.angle);
  this.y = this.magnitude * Math.sin(this.angle);
}

/* Defines a node */
Node.prototype = new Point;
Node.prototype.constructor = Node;
function Node (x, y) {
  Point.call(this, x, y);
  this.velocity = new Vector();
  this.mass = 1; // Can't be 0!
  this.bounce_damp = 0.6;
  this.radius = 8;
  this.fillcolor = 'rgba(0,160,255,0.3)';
  this.strokecolor = 'rgba(0,160,255,1)';
}

/* Update a node's position, optionally applying a drag and a force */
Node.prototype.update = function (d, f) {
  this.drag(d);
  this.applyForce(f);
  this.x += this.velocity.x;
  this.y += this.velocity.y;
  this.checkCollisions();
}

/* Apply the given drag as a coefficient */
Node.prototype.drag = function (d) {
  d = d || 0;
  this.velocity.setMagnitude(this.velocity.magnitude * ( 1 - d ));
}

/* Apply the given force as a vector */
Node.prototype.applyForce = function (f) {
  f = f || new Vector();
  this.velocity.setX( this.velocity.x + f.x / this.mass );
  this.velocity.setY( this.velocity.y + f.y / this.mass );
}

/* Returns the speed in pixels per time interval */
Node.prototype.speed = function () {
  return this.velocity.magnitude;
}

/* Check World's Boundaries Collisions */
Node.prototype.checkCollisions = function () {
  bx = NodesWorld.boundaries.x + this.radius;
  bw = NodesWorld.boundaries.width - this.radius;
  by = NodesWorld.boundaries.y + this.radius;
  bh = NodesWorld.boundaries.height - this.radius;
  
  // Check if the node's position is outside the x-axis boundaries
  if (this.x < bx || this.x > bw) {
     // Reverse and damp x velocity
    this.velocity.setX(this.velocity.x * -this.bounce_damp);
    // Reposition the node in the x axis minus the damp effect
    if (this.x < bx)
      this.x += (1 + this.bounce_damp) * (bx - this.x)
    if (this.x > bw)
      this.x += (1 + this.bounce_damp) * (bw - this.x)
  }
  
  if (this.y < by || this.y > bh) {
     // Reverse and damp y velocity
    this.velocity.setY(this.velocity.y * -this.bounce_damp);
    // Reposition the node in the y axis minus the damp effect
    if (this.y < by)
      this.y += (1 + this.bounce_damp) * (by - this.y)
    if (this.y > bh)
      this.y += (1 + this.bounce_damp) * (bh - this.y)
  }
}

initialize();
