/* eslint-disable @typescript-eslint/no-unused-vars */
import { LEFT_CHEVRON, BG, CLICK, PLAYER } from "game/assets";
import { AavegotchiGameObject } from "types";
import { getGameWidth, getGameHeight, getRelative } from "../helpers";
import { Player } from "game/objects";
import { io, Socket } from "socket.io-client";
import {  LilYoutubePlayer } from "game/objects/youtubePlayer";

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
  private youtubePlayer?: LilYoutubePlayer;

  constructor() {
    super(sceneConfig);
  }

  init = (data: { selectedGotchi: AavegotchiGameObject }): void => {
    console.log('GAME SCENE init data', data);
    this.selectedGotchi = data.selectedGotchi;
  };


  public create(): void {

    const youtubePlayerProps = {
      scene: this,
      x: getGameWidth(this) - 250,
      y: 200,
      width: 320,
      height: 240,
    }
    this.youtubePlayer = new LilYoutubePlayer({...youtubePlayerProps});
    this.youtubePlayer.load('Csev9IUatzc', false);
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const scene = this;
    this.socket = io('http://localhost:8080/game'); 


    scene.otherPlayers = this.physics.add.group();

    this.socket.on("connect", () => {
      if(this.socket)
      console.log('CLIENT CONNECCTED', this.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    // When a new player joins, add the current players
    this.socket.on('currentPlayers', function (players: Player[]) {
      console.log('CURERNET PLAYERS EMIT', players);
       // Add a player sprite that can be moved around.
        if(scene.socket) console.log('THIS PLAYER SOCKET ID',scene.socket.id);

        Object.keys(players).forEach((playerKey: string) => {
        // match current player
          if (scene.socket && playerKey === scene.socket.id) {
            console.log('FOUND MATCHING ID for currentUser');
            scene.addPlayer(scene, players[playerKey]);
          } else {
            scene.addOtherPlayers(scene, players[playerKey])
          }

        })
    });

    // For everyone already connected, alert them of the new player
    this.socket.on("newPlayer", (playerInfo) =>  {
      console.log('socket on new player')
      scene.addOtherPlayers(scene, playerInfo);
    });

    this.socket.on("playerMoved", (playerInfo) => {
      console.log('playerMoved', playerInfo);
      scene?.otherPlayers && scene.otherPlayers.getChildren().forEach(function (otherPlayer: Player) {
        console.log('other player', otherPlayer);
        if (playerInfo.id === otherPlayer.id) {
          const {x, y, animKey} = playerInfo;
          otherPlayer.anims.play(animKey, true);
          otherPlayer.setPosition(x, y);
        }
      });
    });

    // youtube player handle
    this.socket.on("playYoutube", (value) => {
      console.log('YOUTUBE PLAYER START', value);
      this.youtubePlayer?.setPlaybackTime(0); // todo pass this in from emitted event
      this.youtubePlayer?.play();
    })

    this.socket.on("youtubePlayerStop", (value) => {
      console.log('YOUTUBE PLAYER STOP', value);
      this.youtubePlayer?.pause();
    })


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


  // Adds a player instance for other users
  private addOtherPlayers(scene: this, player: any) {
    console.log('addOtherPlayers', player);
    const otherPlayer= new Player({
      scene: this,
      id: player.id,
      x: player.x,
      y: player.y,
      rotation: player.rotation,
      key: PLAYER || '',
    })
    this.otherPlayers?.add(otherPlayer);
  }

  // Adds current user instance
  private addPlayer(scene: this, player: any) {
    console.log('ADD PLAYER');
      this.player = new Player({
        scene: this,
        x: getGameWidth(this) / 2,
        y: getGameHeight(this) / 2,
        key: PLAYER || "",
      });
    
  }



  private createBackButton = () => {
    this.add
      .image(getRelative(54, this), getRelative(54, this), LEFT_CHEVRON)
      .setOrigin(0)
      .setInteractive({ useHandCursor: true })
      .setDisplaySize(getRelative(94, this), getRelative(94, this))
      .on("pointerdown", () => {

        this.socket?.emit("youtubePlayerStart", true);
        this.youtubePlayer?.setPlaybackTime(0);
        this.youtubePlayer?.play();
        // this.back?.play();
        // window.history.back();
      });
  };

  public update(): void {
    // Every frame, we update the player
    this.player?.update(this, this.socket);


  }
}
