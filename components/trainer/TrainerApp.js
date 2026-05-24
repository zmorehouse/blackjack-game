import { motion } from "framer-motion";
import { useBlackjackTrainer } from "@/hooks/useBlackjackTrainer";
import TrainerHead from "@/components/trainer/TrainerHead";
import TrainerTable from "@/components/trainer/TrainerTable";
import TrainerInfoPane from "@/components/trainer/TrainerInfoPane";
import styles from "@/styles/Home.module.css";

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
};

export default function TrainerApp() {
  const trainer = useBlackjackTrainer();

  return (
    <>
      <TrainerHead />
      <motion.div
        className={styles.container}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className={styles.trainerLayout}>
          <motion.div variants={itemVariants} className={styles.tableColumn}>
            <TrainerTable
              dealEpoch={trainer.dealEpoch}
              dealerHand={trainer.dealerHand}
              playerHands={trainer.playerHands}
              currentHandIndex={trainer.currentHandIndex}
              playerTurn={trainer.playerTurn}
              gameOver={trainer.gameOver}
              message={trainer.message}
              revealDealer={trainer.revealDealer}
              lastMoveCorrect={trainer.lastMoveCorrect}
              showOptimalMove={trainer.showOptimalMove}
              setShowOptimalMove={trainer.setShowOptimalMove}
              getOptimalMove={trainer.getOptimalMove}
              hit={trainer.hit}
              stand={trainer.stand}
              splitHand={trainer.splitHand}
              doubleDown={trainer.doubleDown}
              canSplit={trainer.canSplit}
              canDoubleDown={trainer.canDoubleDown}
              startGame={trainer.startGame}
            />
            <footer className={styles.tableFooter}>
              <p className={styles.pageFooterInline}>
                Win big? Slide a chip my way and{" "}
                <a
                  href="https://buymeacoffee.com/zmorehouse"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.pageFooterLink}
                >
                shout me a coffee
              </a>
            </p>
          </footer>
          </motion.div>

          <div className={styles.sidebarColumn}>
            <TrainerInfoPane
              id="trainer-sidebar"
              infoTab={trainer.infoTab}
              setInfoTab={trainer.setInfoTab}
              handsWon={trainer.handsWon}
              handsLost={trainer.handsLost}
              handsDrawn={trainer.handsDrawn}
              profit={trainer.profit}
              correctMoves={trainer.correctMoves}
              incorrectMoves={trainer.incorrectMoves}
              resetStats={trainer.resetStats}
            />
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}
