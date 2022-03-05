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
    const self = this;
    this.socket = io('http://localhost:8080'); 

    this.socket.on("connect", () => {
      if(this.socket)
      console.log('CLIENT CONNECCTED', this.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('currentPlayers', function (players: Player[]) {
      console.log('CURERNET PLAYERS EMIT', players);
       // Add a player sprite that can be moved around.
        if(self.socket) console.log('THIS PLAYER SOCKET ID',self.socket.id);

        Object.keys(players).forEach((playerKey: string) => {
        // match current player
          if (self.socket && playerKey === self.socket.id) {
            console.log('FOUND MATCHING ID');
            self.addPlayer(self, players[self.socket.id]);
          } else {
            self.addOtherPlayers(self, players[playerKey])
          }

        })
      
     
    });

    // Add layout
    this.add
      .image(getGameWidth(this) / 2, getGameHeight(this) / 2, BG)
      .setDisplaySize(getGameWidth(this), getGameHeight(this));
    this.back = this.sound.add(CLICK, { loop: false });
    this.createBackButton();

  }

  private addOtherPlayers(self: this, player: any) {
    console.log('addOtherPlayers')
    this.addPlayer(this, player)
  }

  private addPlayer(self: this, player: any) {
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
  }
}
