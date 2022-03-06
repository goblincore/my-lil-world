import { GameScene } from "game/scenes/game-scene";
import { Socket } from "socket.io-client";

interface Props {
  id?: string;
  scene: Phaser.Scene;
  oldPosition?: {
    x: number,
    y: number,
  };
  x: number;
  y: number;
  key: string;
  rotation?: string;
  frame?: number;
}


export class Player extends Phaser.GameObjects.Sprite {
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  public speed = 200;
  public id?: number | string;
  public oldPosition = {x: 0, y: 0};


  constructor({ scene, x, y, key, id }: Props) {
    super(scene, x, y, key);

    // sprite
    this.setOrigin(0, 0);
    this.oldPosition.x = x;
    this.oldPosition.y = y;
    this.id = id;
    this.scaleX = 6.4;
    this.scaleY = 6.4;

    // Add animations
    this.anims.create({
      key: 'idle',
      frames: this.anims.generateFrameNumbers(key || '', { start: 0, end: 2 }),
      frameRate: 2,
      repeat: -1,
    });
    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 6, 7 ]}),
    });
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 8, 9 ]}),
    });
    this.anims.create({
      key: 'up',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 3, 4, 5 ]}),
    });

    this.anims.create({
      key: 'down',
      frames: this.anims.generateFrameNumbers(key || '', { frames: [ 0, 1, 2 ]}),
    });

    // physics
    this.scene.physics.world.enable(this);

    // input
    this.cursorKeys = scene.input.keyboard.createCursorKeys();

    this.scene.add.existing(this);
  }

  update(scene: GameScene, socket:Socket): void {

    // Every frame, we create a new velocity for the sprite based on what keys the player is holding down.
    const velocity = new Phaser.Math.Vector2(0, 0);
    // Horizontal movement
    switch (true) {
      case this.cursorKeys?.left.isDown:
        velocity.x -= 1;
        this.anims.play('left', true);
        break;
      case this.cursorKeys?.right.isDown:
        velocity.x += 1;
        this.anims.play('right', true);
        break;
    }

    // Vertical movement
    switch (true) {
      case this.cursorKeys?.down.isDown:
        velocity.y += 1;
        this.anims.play('down', true);
        break;
      case this.cursorKeys?.up.isDown:
        velocity.y -= 1;
        this.anims.play('up', true);
        break;
    }


    if(socket){
      const x = this.x;
      const y = this.y;
      
  
         // emit player movement
         if (
           this.oldPosition &&
           (x !== this.oldPosition.x ||
             y !== this.oldPosition.y)
         ) {
        
           socket.emit("playerMovement", {
             x: this.x,
             y: this.y,
             animKey: this.anims.getName(),
           });
         }
         // save old position data
         this.oldPosition = {
           x: this.x,
           y: this.y,
         };
      }


    // We normalize the velocity so that the player is always moving at the same speed, regardless of direction.
    const normalizedVelocity = velocity.normalize();
    (this.body as Phaser.Physics.Arcade.Body).setVelocity(normalizedVelocity.x * this.speed, normalizedVelocity.y * this.speed);


  }
}
