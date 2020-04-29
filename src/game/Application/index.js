import * as Pixi from 'pixi.js';
import playerImage from '../../assets/images/craft_spritesheet.png';
import planetGreenImage from '../../assets/images/planet_green.png';
import planetSandImage from '../../assets/images/planet_blue_sand.png';
import sunImage from '../../assets/images/planet_sun.png';
import bulletImage from '../../assets/images/bullet_scaled.png';
import parallax0Image from '../../assets/images/grid_128_pink.png';
import parallax1Image from '../../assets/images/grid_64_pink.png';
import parallax2Image from '../../assets/images/starfield-background.png';

const debugMode = true;

import {
  isKeyDown,
  isKeyUp,
  keyPressedElapsedMS,
  keys as keyboard,
  onUpdateKeys,
  subscribe as keyboardSubscribe,
  unsubscribe as keyboardUnsubscribe,
} from './keyboard';
import {
  addSprite,
  createSpriteSheetTexture,
  movePlayer,
  thrust,
  updateActors,
  updateTexture,
  updateTilePosition,
} from './sprite';
import { getResource, getResourceTexture } from './loader';
import { getSpriteRadius, isCollision } from './collision';

const createTile = (pixiGame) => (tile) => {
  const getTexture = getResourceTexture(pixiGame.app);
  const sprite = new Pixi.TilingSprite(
    getTexture(tile.key),
    pixiGame.app.screen.width,
    pixiGame.app.screen.height
  );
  sprite.position.set(0, 0);
  sprite.alpha = tile.alpha || 1;
  pixiGame.containers.background.addChild(sprite);
  return {
    data: {
      ...tile,
    },
    sprite,
  };
};

const createSprite = (pixiGame) => (actor) => {
  const getTexture = getResourceTexture(pixiGame.app);
  return addSprite(pixiGame.containers.world, getTexture(actor.key), actor);
};

const updateTime = (pixiGame, delta) => {
  const prevSession = pixiGame.time.session;
  const elapsedMS = prevSession.elapsedMS + pixiGame.app.ticker.elapsedMS;
  const elapsedS = Math.floor(elapsedMS / 1000);

  if (elapsedS !== prevSession.elapsedS && elapsedS % 5 === 0) {
    console.log('every 5 sec save');
    // onSaveGame(state);
  }

  if (elapsedS !== prevSession.elapsedS && elapsedS === 22) {
    console.log('time up - to save and exit');
    // onSaveAndExitGame(state);
  }

  return {
    ...pixiGame.time,
    session: {
      elapsedMS,
      elapsedS,
    },
  };
};

const updateState = (pixiGame, delta) => {
  // 1. Update Actors position
  updateActors(pixiGame.bullets, delta);
  updateActors(pixiGame.actors, delta);
  updateActors(pixiGame.passiveActors, delta);

  // 2. Handle user interactions (Keyboard / mouse / touch)
  // & Move Player position etc

  if (isKeyUp('q')) {
    pixiGame.handlers.onQuit();
    return;
  }

  const firePower = Math.min(1, keyPressedElapsedMS(' ') / 500);

  const hardTurnMs = 150;
  const isTurning = isKeyDown('ArrowLeft') || isKeyDown('ArrowRight');

  if (isTurning) {
    if (isKeyDown('ArrowLeft')) {
      const hardTurn = keyPressedElapsedMS('ArrowLeft') > hardTurnMs;
      updateTexture(pixiGame.player, hardTurn ? 'hardLeft' : 'left');
      pixiGame.player.data.rotation -= (hardTurn ? 0.06 : 0.02) * delta;
    } else {
      // isKeyDown('ArrowRight')
      const hardTurn = keyPressedElapsedMS('ArrowRight') > hardTurnMs;
      updateTexture(pixiGame.player, hardTurn ? 'hardRight' : 'right');
      pixiGame.player.data.rotation += (hardTurn ? 0.06 : 0.02) * delta;
    }
    pixiGame.player.sprite.rotation = pixiGame.player.data.rotation;
  } else {
    updateTexture(pixiGame.player, 'straight');
  }

  if (isKeyDown('ArrowUp')) {
    thrust(pixiGame.player, delta);
  } else {
    //  todo - remove thrust?
  }
  if (isKeyDown('ArrowDown')) {
    thrust(pixiGame.player, delta, 'reverse');
  }

  movePlayer(pixiGame.player, delta);

  if (isKeyUp(' ')) {
    // console.log('Fire', keyPressedElapsedMS(' '), firePower);
    const newBullet = createSprite(pixiGame)({
      key: 'bullet',
      x: pixiGame.player.sprite.x,
      y: pixiGame.player.sprite.y,
      direction: pixiGame.player.sprite.rotation,
      speed: 10 + firePower * 10 + pixiGame.player.data.speed,
      life: 2 + firePower,
      mass: firePower * 10,
      power: firePower * 10,
      scale: 0.25 + firePower * 0.75,
    });

    newBullet.sprite.scale.set(newBullet.data.scale);

    pixiGame.bullets.push(newBullet);
  }

  // 3. update keys
  onUpdateKeys(pixiGame.app.ticker.elapsedMS);

  // 4. Move parallax backgrounds
  pixiGame.tiles.forEach(({ data, sprite }) => {
    updateTilePosition({
      data,
      sprite,
      offsetPoint: pixiGame.player.sprite.position,
    });
  });

  // 5. Collision detection
  pixiGame.player.data.isCollision = false;
  pixiGame.actors.forEach((actor) => {
    const collision = isCollision(actor, pixiGame.player);
    actor.sprite.tint = collision ? 0xffaaaa : 0xffffff;
    if (collision) {
      pixiGame.player.data.isCollision = true;
    }
  });

  pixiGame.bullets.forEach((bullet) => {
    pixiGame.actors.forEach((actor) => {
      const collision = isCollision(actor, bullet);
      if (collision) {
        const bulletPower = bullet.data.power * Math.min(1, bullet.data.life);
        console.log('hit', bulletPower, actor.data.life);
        actor.data.life -= bulletPower;
        bullet.data.life = 0;
      }
    });
  });

  pixiGame.player.sprite.tint = pixiGame.player.data.isCollision
    ? 0xffaaaa
    : 0xffffff;

  if (debugMode) {
    if (!pixiGame.player.debug) {
      pixiGame.player.debug = new Pixi.Graphics();
      pixiGame.containers.world.addChild(pixiGame.player.debug);
      // pixiGame.player.debug.anchor.set(0.5);
      // pixiGame.player.debug.position.copyFrom(pixiGame.player);
    }
  }

  if (pixiGame.player.debug) {
    const spriteRadius = getSpriteRadius(pixiGame.player.sprite);
    const lineWidth = firePower * spriteRadius;
    pixiGame.player.debug.clear();
    pixiGame.player.debug.lineStyle(lineWidth, 0x00aaff, firePower * 0.3);
    pixiGame.player.debug.beginFill(0xffffff, 0);
    pixiGame.player.debug.drawCircle(
      pixiGame.player.data.x,
      pixiGame.player.data.y,
      spriteRadius * 1.6 + lineWidth
    );
    pixiGame.player.debug.endFill();
  }

  // 6. Move camera to follow Player
  pixiGame.containers.world.pivot.x = pixiGame.player.data.x;
  pixiGame.containers.world.pivot.y = pixiGame.player.data.y;

  // LERP it
  // pixiGame.containers.world.pivot.x =
  //   (pixiGame.player.data.x - pixiGame.containers.world.pivot.x) * 0.2 +
  //   pixiGame.containers.world.pivot.x;
  // pixiGame.containers.world.pivot.y =
  //   (pixiGame.player.data.y - pixiGame.containers.world.pivot.y) * 0.2 +
  //   pixiGame.containers.world.pivot.y;

  // // const alwaysFaceFrontMode = false;
  // const alwaysFaceFrontMode = true;
  // if (alwaysFaceFrontMode) {
  //   // keep the player facing up
  //   pixiGame.containers.world.rotation = 0 - pixiGame.player.sprite.rotation;
  // }
};

const addInitialActors = (pixiGame) => {
  const getAppResource = getResource(pixiGame.app);

  pixiGame.containers.background = new Pixi.Container();
  pixiGame.app.stage.addChild(pixiGame.containers.background);
  pixiGame.containers.world = new Pixi.Container();
  pixiGame.app.stage.addChild(pixiGame.containers.world);

  pixiGame.tiles = pixiGame.tiles.map(createTile(pixiGame));
  pixiGame.passiveActors = pixiGame.passiveActors.map(createSprite(pixiGame));
  pixiGame.actors = pixiGame.actors.map(createSprite(pixiGame));

  // Player

  pixiGame.player = {
    sheet: {
      sheet: new Pixi.BaseTexture.from(getAppResource('playerShip').url),
      width: 32,
      height: 32,
    },
    data: {
      x: pixiGame.app.screen.width / 2,
      y: pixiGame.app.screen.height / 2,
      rotation: 0,
      direction: 0,
      life: 3,
      mass: 5,
      power: 3,
      speed: 0,
      maxSpeed: 10,
      acceleration: 0.13,
      deceleration: 0.2,
      reverseAcceleration: 0.02,
      reverseMaxSpeed: -4,
      isCollision: true,
    },
  };

  pixiGame.player.textures = {
    hardLeft: createSpriteSheetTexture({ ...pixiGame.player.sheet, index: 0 }),
    left: createSpriteSheetTexture({ ...pixiGame.player.sheet, index: 1 }),
    straight: createSpriteSheetTexture({ ...pixiGame.player.sheet, index: 2 }),
    right: createSpriteSheetTexture({ ...pixiGame.player.sheet, index: 3 }),
    hardRight: createSpriteSheetTexture({ ...pixiGame.player.sheet, index: 4 }),
  };

  pixiGame.player.sprite = new Pixi.Sprite(pixiGame.player.textures.straight);

  pixiGame.player.sprite.anchor.set(0.5);
  pixiGame.player.sprite.position.set(
    pixiGame.player.data.x,
    pixiGame.player.data.y
  );
  pixiGame.containers.world.addChild(pixiGame.player.sprite);
  pixiGame.containers.world.position.set(
    pixiGame.app.screen.width / 2,
    pixiGame.app.screen.height / 2
  );
  pixiGame.containers.world.pivot.copyFrom(pixiGame.player.sprite.position);
};

export const initPixi = ({
  view,
  gameState,
  onSaveGame,
  onSaveAndExitGame,
  onQuitGame,
}) => {
  // const store = { ...gameState }; // initial state (perhaps from a loaded game)

  // Mutable game objects
  const pixiGame = {
    app: new Pixi.Application({
      view,
      width: window.innerWidth / window.devicePixelRatio,
      height: window.innerHeight / window.devicePixelRatio,
      resolution: window.devicePixelRatio,
    }),
    keyboard, // keyboard info
    containers: {},
    player: {},
    bullets: [],
    tiles: [
      {
        key: 'parallax2',
        parallax: 0.15, // 1 will move at same speed as camera,
        alpha: 1,
      },
      {
        key: 'parallax1',
        parallax: 0.5, // 1 will move at same speed as camera,
        alpha: 0.25,
      },
      {
        key: 'parallax0',
        parallax: 1, // 1 will move at same speed as camera,
        alpha: 0.8,
      },
    ],
    actors: [
      {
        key: 'planetGreen',
        x: 100,
        y: 25,
        direction: Math.PI * 0.75,
        rotationSpeed: -0.01,
        speed: 1,
        life: 5,
      },
      {
        key: 'planetSandy',
        x: 25,
        y: 125,
        direction: 0,
        speed: 0.15,
        rotationSpeed: 0.025,
        life: 15,
      },
    ],
    passiveActors: [
      {
        key: 'starSun',
        x: 150,
        y: 250,
        direction: Math.PI * 0.3,
        speed: 2,
        alpha: 0.85,
      },
    ],
    time: {
      session: {
        elapsedMS: 0,
        elapsedS: 0,
      },
    },
    handlers: {
      onQuit: () => {
        // onSaveGame(data);

        // remove event listeners
        keyboardUnsubscribe();

        // clean up Pixi
        pixiGame.app.destroy();

        // update the react app
        onQuitGame();
      },
    },
  };

  const gameLoop = (delta) => {
    pixiGame.time = updateTime(pixiGame, delta);
    updateState(pixiGame, delta);
  };

  pixiGame.app.loader
    .add({ name: 'parallax0', url: parallax0Image })
    .add({ name: 'parallax1', url: parallax1Image })
    .add({ name: 'parallax2', url: parallax2Image })
    .add({ name: 'playerShip', url: playerImage })
    .add({ name: 'bullet', url: bulletImage })
    .add({ name: 'planetGreen', url: planetGreenImage })
    .add({ name: 'planetSandy', url: planetSandImage })
    .add({ name: 'starSun', url: sunImage });

  pixiGame.app.loader.load(() => {
    keyboardSubscribe();
    addInitialActors(pixiGame);
    pixiGame.app.ticker.add(gameLoop);
  });
};
