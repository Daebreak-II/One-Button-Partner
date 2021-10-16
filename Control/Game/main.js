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
cc  cc
ccllcc
ccllcc
ccllcc 
  ll
  ll
`,`
 yyy
 yyy
  y
`,`
  ppp
 p   p
p  p 
p p p
p   p
 ppp
`,`
pp
pp
`
];

const G = {
  WIDTH: 100,
  HEIGHT: 150,
  STAR_SPEED_MIN: 0.5,
  STAR_SPEED_MAX: 1.0,
  
  PLAYER_FIRE_RATE: 10,
  PLAYER_GUN_OFFSET: 3,
  PLAYER_MAG_SIZE: 20,
  PLAYER_MOVE_SPEED: 0.1,
  
  MBULLET_SPEED: 1,
  MBULLET_DISTANCE: 100,
  FBULLET_SPEED: 5,
  
  ENEMY_MIN_BASE_SPEED: 1,
  ENEMY_MAX_BASE_SPEED: 1.5,
  ENEMY_DRIFT: 0.3,
  ENEMY_MIN_FIRE_RATE: 10,
  ENEMY_MAX_FIRE_RATE: 100,
  
  EBULLET_SPEED: 2,
};

options = {
  viewSize: {x: G.WIDTH, y: G.HEIGHT},
  seed: 1,
  isPlayingBgm: true,
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

/**
* @typedef {{
* pos: Vector,
* travelDistance: number
* }} mBullet
*/
    
/**
* @type { mBullet [] }
*/
let mBullets;
  


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
			currentBullets: G.PLAYER_MAG_SIZE,
      beamFired: false,
		};
    mBullets = [];
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
      enemies.push({pos: vec(posX, posY), firingCooldown: rnd(G.ENEMY_MIN_FIRE_RATE, G.ENEMY_MAX_FIRE_RATE), drift: rnd(-1* G.ENEMY_DRIFT, G.ENEMY_DRIFT)})
      
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
  if (!player.beamFired) {
    player.pos.x += -G.PLAYER_MOVE_SPEED * (player.pos.x - input.pos.x);
    player.pos.y += -G.PLAYER_MOVE_SPEED * (player.pos.y - input.pos.y);
  } else {
    // reduces movement when beam is fired
    player.pos.x += 0.1 * -G.PLAYER_MOVE_SPEED * (player.pos.x - input.pos.x);
    player.pos.y += 0.1 * -G.PLAYER_MOVE_SPEED * (player.pos.y - input.pos.y);
  }
  // restricting movement to screen
	player.pos.clamp(0, G.WIDTH, 0, G.HEIGHT);
  player.firingCooldown--;

  // firing bullets
  if(player.firingCooldown <= 0 && !player.beamFired && player.currentBullets != 0){
    fBullets.push({
      pos: vec(player.pos.x, player.pos.y)
    });
    player.currentBullets--;
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
  
  // firing the mBullet
  if (input.isJustPressed && player.beamFired == false) {
    mBullets.push({pos: vec(player.pos.x, player.pos.y), travelDistance: G.MBULLET_DISTANCE});
    player.beamFired = true;
    play("lucky");
  }

  // drawing character
  color("black");
	char("a", player.pos);
  if (!player.beamFired) {
    color("purple");
    char("e", player.pos);
  }

  // adding engine particle effect
  color("yellow");
  if (!player.beamFired) {
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
  }



  remove(eBullets, (eb) => {
    eb.pos.y += G.EBULLET_SPEED;
    color("black");
    const isCollidingWithPlayer
      = char("c", eb.pos).isColliding.char.a;
    if(isCollidingWithPlayer && !player.beamFired){
      color("red");
      particle(eb.pos);
      play("explosion");
      end();
    }
    return(!eb.pos.isInRect(0, 0, G.WIDTH, G.HEIGHT));
  });

  // updating mBullets
  remove(mBullets, (m) => {
    m.pos.x = player.pos.x;
    if (m.travelDistance >= G.MBULLET_DISTANCE/2) {
      m.pos.y = player.pos.y - (G.MBULLET_DISTANCE - m.travelDistance);
      m.travelDistance--;
    } else {
      m.pos.y = player.pos.y - m.travelDistance;
      m.travelDistance--;
    }
    color("purple");
    char("d", m.pos);

    if (m.travelDistance <= 0) {
      player.beamFired = false;
      player.pos = m.pos;
    }

    return(m.travelDistance <= 0);
  });

  // udpating UI
  color("red");
	text(player.currentBullets.toString(), 3, 10);
  
  // updating enemies
  remove(enemies, (e) => {
    e.pos.y += currentEnemySpeed;
    e.pos.x += e.drift;
    e.firingCooldown--;
    if(e.firingCooldown <= 0){
      eBullets.push({
        pos: vec(e.pos.x, e.pos.y)
      });
      e.firingCooldown = rnd(G.ENEMY_MAX_FIRE_RATE/2, G.ENEMY_MAX_FIRE_RATE);
    }
    color("black");
    const isCollidingwithMBullets = char("b", e.pos).isColliding.char.d
    const isCollidingwithFBullets = char("b", e.pos).isColliding.rect.black
    const isCollidingWithPlayer = char("b", e.pos).isColliding.char.a
    if(isCollidingwithFBullets){
      color("yellow");
      particle(e.pos);
      play("hit");
      addScore(10, e.pos);
    }
    if (isCollidingWithPlayer && !player.beamFired) {
      play("explosion");
      end();
    }
    if (isCollidingwithMBullets) {
      var location = player.pos
      player.pos = e.pos;
      e.pos = location;
      player.beamFired = false;
      player.currentBullets = G.PLAYER_MAG_SIZE;
      mBullets.pop();
      play("powerUp");
      addScore(50, player.pos);
    }
    return (isCollidingwithFBullets || e.pos.y > G.HEIGHT);
  });

  remove(fBullets, (fb) => {
    const isCollidingWithEnemies = box(fb.pos, 2).isColliding.char.b;
    return (isCollidingWithEnemies || fb.pos.y < 0);
  });

}
