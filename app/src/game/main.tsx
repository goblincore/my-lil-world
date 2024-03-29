import Phaser from "phaser";
import { useState, useEffect } from "react";
import { IonPhaser, GameInstance } from "@ion-phaser/react";
import { useWeb3 } from "web3/context";
import { Redirect } from "react-router";
import Scenes from "./scenes";
import io, { Socket } from "socket.io-client";
import { AavegotchiObject, Tuple } from "types";
import { useDiamondCall } from "web3/actions";
import styles from "./styles.module.css";

const Main = () => {
  const {
    state: { usersAavegotchis, selectedAavegotchiId, provider },
  } = useWeb3();
  const [initialised, setInitialised] = useState(true);
  const [config, setConfig] = useState<GameInstance>();

  const startGame = async (
    socket: Socket,
    selectedGotchi: AavegotchiObject
  ) => {
    const width = window.innerHeight;
    const height = window.innerHeight;

    console.log("selecetdGotchi", selectedGotchi);

    if (!selectedGotchi.svg) {
      try {
        if (!provider) throw "Not connected to web3";
        const svg = await useDiamondCall<Tuple<string, 4>>(provider, {
          name: "getAavegotchiSideSvgs",
          parameters: [selectedGotchi.id],
        });
        selectedGotchi.svg = svg;
      } catch (err) {
        console.error(err);
      }
    }

    setConfig({
      parent: 'game-parent',
      dom: {
        createContainer: true,
      },
      type: Phaser.AUTO,
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 0 },
          debug: process.env.NODE_ENV === "development",
        },
      },
      scale: {
        mode: Phaser.Scale.NONE,
        width,
        height,
      },
      scene: Scenes,
      fps: {
        target: 60,
      },
      callbacks: {
        preBoot: (game) => {
          // Makes sure the game doesnt create another game on rerender
          setInitialised(false);
          game.registry.merge({
            selectedGotchi,
            socket,
          });
        },
      },
    });
  };

  useEffect(() => {
    if (usersAavegotchis && selectedAavegotchiId) {
      // Socket is called here so we can take advantage of the useEffect hook to disconnect upon leaving the game screen
      const socket = io(
        process.env.REACT_APP_SERVER_PORT || "http://localhost:8080"
      );
      console.log("userAavegotchis", usersAavegotchis);
      const selectedGotchi = usersAavegotchis.find(
        (gotchi) => gotchi.id === selectedAavegotchiId
      );
      if (!selectedGotchi) return;

      startGame(socket, selectedGotchi);

      return () => {
        socket.emit("handleDisconnect");
      };
    }
  }, []);

  if (!usersAavegotchis) {
    return <Redirect to="/" />;
  }

  return (
    <main className={styles.mainContainer}>
      <article className={styles.roomWindow} id="game-parent">
        <IonPhaser initialize={initialised} game={config} id="phaser-app" />
      </article>
      <aside className={styles.rightSidebar}>
        <section className={styles.mainChat}>


        
        </section>

        <section className={styles.inputContainer}>
          <input className={styles.chatInput}></input>
        </section>


      </aside>
    </main>
  );
};

export default Main;
