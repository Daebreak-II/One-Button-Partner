title = "Control";

description = `
`;

characters = [
`
  ll
  ll
ccllcc
ccllcc
ccllcc 
cc  cc
`,`
rr  rr
rrrrrr
rrpprr
rrrrrr
  rr
  rr
`,`
y  y
yyyyyy
 y  y
yyyyyy
 y  y
`
];

const G = {
  WIDTH: 100,
  HEIGHT: 150,
  STAR_SPEED_MIN: 0.5,
  STAR_SPEED_MAX: 1.0,
  
  PLAYER_FIRE_RATE: 10,
  PLAYER_GUN_OFFSET: 3,
  PLAYER_MAG_SIZE: 10,
  PLAYER_MOVE_SPEED: 0.1,
  
  FBULLET_SPEED: 5,
  
  ENEMY_MIN_BASE_SPEED: 1.0,
  ENEMY_MAX_BASE_SPEED: 2.0,
  ENEMY_FIRE_RATE: 45,
  
  EBULLET_SPEED: 3.0,
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 1,
  //isPlayingBgm: true,
  theme: "shapeDark"
}

/**
* @typedef {{
* pos: Vector,
* speed: number
* }} Star
*/
  
/**
* @type  { Star [] }
*/
let stars;

/**
* @typedef {{
* pos: Vector,
* firingCooldown: number,
* drift: number
* }} Enemy
*/
  
/**
* @type { Enemy [] }
*/
let enemies;

/**
* @type { number }
*/
let currentEnemySpeed;

/**
* @typedef {{
* pos: Vector,
* firingCooldown: number,
* currentBullets: number,
* beamFired: boolean;
* movingHorizontal: boolean,
* movingVertical: boolean,
* }} Player
*/
  
/**
* @type { Player }
*/
let player;

/**
 * @typedef {{
 * pos: Vector
 * }} FBullet
 */

/**
 * @typedef {{
 * pos: Vector
 * }} EBullet
 */

/**
 * @type { EBullet []}
 */
let eBullets;

/**
 * @type { FBullet []}
 */
let fBullets;


function update() {
  if (!ticks) {
    stars = times(20, () => {
      // Random number generator function
      // rnd( min, max )
      const posX = rnd(0, G.WIDTH);
      const posY = rnd(0, G.HEIGHT);
      // An object of type Star with appropriate properties
      return {
        // Creates a Vector
        pos: vec(posX, posY),
        // More RNG
       speed: rnd(0.5, 1.0)
      };
    });

    player = {
			pos: vec(G.WIDTH * 0.5, G.HEIGHT * 0.5),
			firingCooldown: G.PLAYER_FIRE_RATE,
			currentBullets: 10,
      beamFired: false,
      movingHorizontal: false,
      movingVertical: false
		};
    enemies = [];
    fBullets = [];
    eBullets = [];
    currentEnemySpeed = 0;

  }
  if(enemies.length == 0){
    currentEnemySpeed = 
      rnd(G.ENEMY_MIN_BASE_SPEED, G.ENEMY_MAX_BASE_SPEED);
    for (let i = 0; i < 5; i++){
      const posX = rnd(0, G.WIDTH);
      const posY = -rnd(i * G.HEIGHT * 0.1);
      enemies.push({pos: vec(posX, posY), firingCooldown: 10, drift: 5})
      
    }

  }

  // Update for Star
  stars.forEach((s) => {
    // Move the star downwards
    s.pos.y += s.speed;
    // Bring the star back to top once it's past the bottom of the screen
    s.pos.wrap(0, G.WIDTH, 0, G.HEIGHT);

    // Choose a color to draw
    color("light_black");
    // Draw the star as a square of size 1
    box(s.pos, 1);
  });

  fBullets.forEach((fb) => {
    fb.pos.y -= G.FBULLET_SPEED;
    color("black");
    box(fb.pos, 2);
  });

  // Updating and drawing the player
  player.pos.x += -G.PLAYER_MOVE_SPEED * (player.pos.x - input.pos.x);
  player.pos.y += -G.PLAYER_MOVE_SPEED * (player.pos.y - input.pos.y);
  // restricting movement to screen
	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  player.firingCooldown--;

  if(player.firingCooldown <= 0){
    fBullets.push({
      pos: vec(player.pos.x, player.pos.y)
    });
    player.firingCooldown = G.PLAYER_FIRE_RATE;
    color("black");
    particle(
      player.pos.x,
      player.pos.y,
      4,
      1,
      -PI/2,
      PI/4
    );
  }

  // drawing character
  color("black");
	char("a", player.pos);

  // adding engine particle effect
  color("yellow");
  particle(
		player.pos.x + G.PLAYER_GUN_OFFSET *2/3, // x coordinate
		player.pos.y + 2, // y coordinate
		1, // The number of particles
		0.5, // The speed of the particles
		PI/2, // The emitting angle
		PI/4  // The emitting width
	);
	particle(
		player.pos.x - G.PLAYER_GUN_OFFSET *2/3, // x coordinate
		player.pos.y + 2, // y coordinate
		1, // The number of particles
		0.5, // The speed of the particles
		PI/2, // The emitting angle
		PI/4  // The emitting width
	);

  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;
    e.firingCooldown--;
    if(e.firingCooldown <= 0){
      eBullets.push({
        pos: vec(e.pos.x, e.pos.y)
      });
      e.firingCooldown = G.ENEMY_FIRE_RATE;
    }
    color("black");
    const isCollidingwithFBullets = char("b", e.pos).isColliding.rect.black
    if(isCollidingwithFBullets){
      color("yellow");
      particle(e.pos);
    }
    //char("b", e.pos);
    return (isCollidingwithFBullets || e.pos.y > G.HEIGHT);
  });

  remove(fBullets, (fb) => {
    const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
    return (isCollidingWithEnemies || fb.pos.y < 0);
  });

  remove(eBullets, (eb) => {
    eb.pos.y += G.EBULLET_SPEED;
    color("black");
    const isCollidingWithPlayer
      = char("c", eb.pos).isColliding.char.a;
    if(isCollidingWithPlayer){
      end();
    }
    return(!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
  });
  

}
