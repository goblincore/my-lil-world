import { useCallback, useEffect, useState } from "react";
import {
  Layout,
  GotchiSelector,
  DetailsPanel,
  Modal,
  GotchiSVG,
} from "components";
import { Link } from "react-router-dom";
import globalStyles from "theme/globalStyles.module.css";
import { useServer } from "server-store";
import { useWeb3, updateAavegotchis } from "web3/context";
import { getDefaultGotchi, getPreviewGotchi, gotchi1, gotchi2, gotchi3 } from "helpers/aavegotchi";
import gotchiLoading from "assets/gifs/loading.gif";
import { playSound } from "helpers/hooks/useSound";
import styles from "./styles.module.css";
import { RotateIcon } from "assets";


const Home = () => {
  const {
    state: {
      usersAavegotchis,
      address,
      selectedAavegotchiId,
      networkId,
      provider,
    },
    dispatch,
  } = useWeb3();
  const { highscores } = useServer();
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [gotchiSide, setGotchiSide] = useState<0 | 1 | 2 | 3>(0);

  const useDefaultGotchi = () => {
    dispatch({
      type: "SET_USERS_AAVEGOTCHIS",
      usersAavegotchis: [getDefaultGotchi()],
    });
  };

 

  const rotateGotchi = () => {
    const currentPos = gotchiSide;
    switch (currentPos) {
      case 0:
        setGotchiSide(1);
        break;
      case 1:
        setGotchiSide(3);
        break;
      case 2:
        setGotchiSide(0);
        break;
      case 3:
        setGotchiSide(2);
        break;
      default:
        setGotchiSide(0);
        break;
    }
  }

  /**
   * Updates global state with selected gotchi
   */
  const handleSelect = useCallback(
    (gotchiId: string) => {
      dispatch({
        type: "SET_SELECTED_AAVEGOTCHI",
        selectedAavegotchiId: gotchiId,
      });
    },
    [dispatch]
  );

  useEffect(() => {
    return useDefaultGotchi();

  
  }, [address]);



  return (
    <Layout>
      {showRulesModal && (
        <Modal onHandleClose={() => setShowRulesModal(false)}>
          <div className={styles.modalContent}>
            <h1>Minigame Template</h1>
            <p>Just a modal example. You can put your game rules in here.</p>
          </div>
        </Modal>
      )}
      <div className={globalStyles.container}>
        <div className={styles.homeContainer}>
          <div className={styles.selectorContainer}>
            <GotchiSelector
              initialGotchiId={selectedAavegotchiId}
              gotchis={usersAavegotchis}
              selectGotchi={handleSelect}
            />
          </div>
          <div className={styles.gotchiContainer}>
            <button className={styles.rotateButton}>
              <RotateIcon width={32} height={24} onClick={rotateGotchi} />
            </button>
            {selectedAavegotchiId ? (
              <GotchiSVG
                side={gotchiSide}
                tokenId={selectedAavegotchiId}
                options={{ animate: true, removeBg: true }}
              />
            ) : (
              <img src={gotchiLoading} alt="Loading Aavegotchi" />
            )}
            <h1 className={styles.highscore}>
              Highscore:{" "}
              {(usersAavegotchis &&
                highscores?.find(
                  (score) => score.tokenId === selectedAavegotchiId
                )?.score) ||
                0}
            </h1>
            <div className={styles.buttonContainer}>
              <Link
                to="/play"
                className={`${globalStyles.primaryButton} ${
                  !usersAavegotchis ? globalStyles.disabledLink : ""
                }`}
                onClick={() => playSound("send")}
              >
                Start
              </Link>
              <button
                onClick={() => {
                  playSound("click");
                  setShowRulesModal(true);
                }}
                className={`${globalStyles.secondaryButton} ${globalStyles.circleButton}`}
              >
                ?
              </button>
            </div>
          </div>
          <div className={styles.detailsPanelContainer}>
            <DetailsPanel
              selectedGotchi={usersAavegotchis?.find(
                (gotchi) => gotchi.id === selectedAavegotchiId
              )}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
