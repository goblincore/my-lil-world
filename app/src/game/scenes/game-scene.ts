/* eslint-disable @typescript-eslint/no-unused-vars */
import { LEFT_CHEVRON, BG, CLICK } from "game/assets";
import { AavegotchiGameObject } from "types";
import { getGameWidth, getGameHeight, getRelative } from "../helpers";
import { Player } from "game/objects";
import { io, Socket } from "socket.io-client";

const sceneConfig: Phaser.Types.Scenes.SettingsConfig = {
  active: false,
  visible: false,
  key: "Game",
};

/**
 * Scene where gameplay takes place
 */
export class GameScene extends Phaser.Scene {
  private player?: Player;
  private otherPlayers?: any;
  private selectedGotchi?: AavegotchiGameObject;
  private socket?: Socket;
  // Sounds
  private back?: Phaser.Sound.BaseSound;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
    this.selectedGotchi = data.selectedGotchi;
  };




  public create(): void {

   
   
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scene = this;
    this.socket = io('http://localhost:8080'); 
   
    scene.otherPlayers = this.physics.add.group();

    this.socket.on("connect", () => {
      if(this.socket)
      console.log('CLIENT CONNECCTED', this.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('currentPlayers', function (players: Player[]) {
      console.log('CURERNET PLAYERS EMIT', players);
       // Add a player sprite that can be moved around.
        if(scene.socket) console.log('THIS PLAYER SOCKET ID',scene.socket.id);

        Object.keys(players).forEach((playerKey: string) => {
        // match current player
          if (scene.socket && playerKey === scene.socket.id) {
            console.log('FOUND MATCHING ID');
            scene.addPlayer(scene, players[playerKey]);
          } else {
            scene.addOtherPlayers(scene, players[playerKey])
          }

        })
    });

    this.socket.on("newPlayer", function (playerInfo) {
      console.log('socket on new player')
      scene.addOtherPlayers(scene, playerInfo);
    });

    this.socket.on("playerMoved", function (playerInfo) {
      console.log('playerMoved', playerInfo);
      scene?.otherPlayers && scene.otherPlayers.getChildren().forEach(function (otherPlayer: { id: any; x: any; y: any; setPosition: (arg0: any, arg1: any) => void; }) {
        console.log('Other player Moved', otherPlayer);
        if (playerInfo.id === otherPlayer.id) {
          const oldX = otherPlayer.x;
          const oldY = otherPlayer.y;
          console.log('otherPlayerSetPposition');
          otherPlayer.setPosition(playerInfo.x, playerInfo.y);
        }
      });
    });



    this.socket.on("disconnected", function (playerId){
      const { id } = playerId;

      console.log('user disconnected', playerId);
      scene.otherPlayers.getChildren().forEach(function (otherPlayer: Player) {
        if (id === otherPlayer.id) {
          otherPlayer.destroy();
        }
      });
    });

    // Add layout
    this.add
      .image(getGameWidth(this) / 2, getGameHeight(this) / 2, BG)
      .setDisplaySize(getGameWidth(this), getGameHeight(this));
    this.back = this.sound.add(CLICK, { loop: false });
    this.createBackButton();

  }

  private addOtherPlayers(scene: this, player: any) {
    console.log('addOtherPlayers', player);
    const otherPlayer= new Player({
      scene: this,
      id: player.id,
      x: getGameWidth(this) / 2,
      y: getGameHeight(this) / 2,
      key: this.selectedGotchi?.spritesheetKey || '',
    })
    this.otherPlayers?.add(otherPlayer);
  }

  private addPlayer(scene: this, player: any) {
    console.log('ADD PLAYER');
      this.player = new Player({
        scene: this,
        x: getGameWidth(this) / 2,
        y: getGameHeight(this) / 2,
        key: this.selectedGotchi?.spritesheetKey || "",
      });
    
  }



  private createBackButton = () => {
    this.add
      .image(getRelative(54, this), getRelative(54, this), LEFT_CHEVRON)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(getRelative(94, this), getRelative(94, this))
      .on("pointerdown", () => {
        this.back?.play();
        window.history.back();
      });
  };

  public update(): void {
    // Every frame, we update the player
    this.player?.update();

    if(this.player && this.socket){
    const x = this.player?.x;
    const y = this.player?.y;

       // emit player movement
       if (
         this.player.oldPosition &&
         (x !== this.player.oldPosition.x ||
           y !== this.player.oldPosition.y)
       ) {
      
         this.socket.emit("playerMovement", {
           x: this.player.x,
           y: this.player.y,
         });
       }
       // save old position data
       this.player.oldPosition = {
         x: this.player.x,
         y: this.player.y,
       };
    }


  }
}
