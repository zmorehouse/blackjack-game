import { useState } from "react";
import Image from "next/image";
import CheatSheetTables from "@/components/trainer/CheatSheetTables";
import styles from "@/styles/Home.module.css";

function Accordion({ title, open, onToggle, children }) {
  return (
    <div className={styles.accordion}>
      <button
        type="button"
        className={`${styles.accordionTrigger} ${open ? styles.accordionTriggerOpen : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span>{title}</span>
        <span className={styles.accordionIcon} aria-hidden="true">
          {open ? "−" : "+"}
        </span>
      </button>
      {open && <div className={styles.accordionPanel}>{children}</div>}
    </div>
  );
}

export default function TrainerInfoPane({
  id,
  infoTab,
  setInfoTab,
  handsWon,
  handsLost,
  handsDrawn,
  profit,
  correctMoves,
  incorrectMoves,
  resetStats,
}) {
  const [showRules, setShowRules] = useState(false);
  const [houseProfitsOpen, setHouseProfitsOpen] = useState(true);
  const [resourcesOpen, setResourcesOpen] = useState(true);

  return (
    <aside id={id} className={styles.infoPane}>
      <div className={styles.navLinks} role="tablist" aria-label="Trainer sections">
        <button
          type="button"
          role="tab"
          aria-selected={infoTab === "home"}
          className={`${styles.navButton} ${infoTab === "home" ? styles.navButtonActive : ""}`}
          onClick={() => setInfoTab("home")}
        >
          Home
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={infoTab === "cheatsheet"}
          className={`${styles.navButton} ${infoTab === "cheatsheet" ? styles.navButtonActive : ""}`}
          onClick={() => setInfoTab("cheatsheet")}
        >
          Cheatsheet
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={infoTab === "moreinfo"}
          className={`${styles.navButton} ${infoTab === "moreinfo" ? styles.navButtonActive : ""}`}
          onClick={() => setInfoTab("moreinfo")}
        >
          More Info
        </button>
      </div>

      <div
        className={`${styles.infoPaneInner} ${
          infoTab === "cheatsheet" ? styles.infoPaneInnerCheat : ""
        }`}
      >
        {infoTab === "home" ? (
          <>
            <div className={styles.brandLogoWrap}>
              <Image
                src="/images/logo.png"
                alt="Blackjack basic strategy trainer"
                width={280}
                height={96}
                className={styles.brandLogo}
                priority
              />
            </div>
            <div className={styles.tooltipContainer}>
              <p>
                Played perfectly, the house only has
                <button
                  type="button"
                  className={styles.tooltipTrigger}
                  onClick={() => setShowRules((prev) => !prev)}
                  aria-expanded={showRules}
                  aria-controls="trainer-rules-list"
                >
                  {" "}
                  0.23599%*
                </button>{" "}
                edge on Blackjack, making it the most profitable game in a casino.
              </p>
              <p className={styles.subheader}>
                This website is designed to help you master basic blackjack strategy.
              </p>

              {showRules && (
                <div id="trainer-rules-list" className={styles.tooltipContent}>
                  Assuming the following :
                  <ul>
                    <li>4 decks are used</li>
                    <li>Dealer stands on soft 17</li>
                    <li>Players can double on any cards</li>
                    <li>Players can split any cards</li>
                    <li>Players can resplit to 4 hands</li>
                    <li>Cards are auto-shuffled</li>
                    <li>Blackjack pays 3 to 2</li>
                    <li>No surrender is offered</li>
                    <li>Insurance is never taken</li>
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.stats}>
              <h2 className={styles.statsTitle}>
                <span>Your Statistics</span>
              </h2>

              <div className={styles.statRow}>
                <span>Your Win %</span>
                <span>
                  {handsWon + handsLost + handsDrawn > 0
                    ? ((handsWon / (handsWon + handsLost + handsDrawn)) * 100).toFixed(2)
                    : "0"}
                  %
                </span>
              </div>

              <div className={styles.statRow}>
                <span>Your W/L/D</span>
                <span>
                  {handsWon} - {handsLost} - {handsDrawn}
                </span>
              </div>

              <div className={styles.statRow}>
                <span>$25 Hands, Your Profit</span>
                <span>${profit}</span>
              </div>

              <div className={styles.statRow}>
                <span>Correct Moves </span>
                <span>{correctMoves}</span>
              </div>

              <div className={styles.statRow}>
                <span>Incorrect Moves</span>
                <span>{incorrectMoves}</span>
              </div>

              <div className={styles.statRow}>
                <span>Strategy Accuracy</span>
                <span>
                  {correctMoves + incorrectMoves > 0
                    ? ((correctMoves / (correctMoves + incorrectMoves)) * 100).toFixed(2)
                    : "0"}
                  %
                </span>
              </div>

              <div className={styles.toggleResetContainer}>
                <button type="button" className={styles.resetButton} onClick={resetStats}>
                  Reset Stats
                </button>
              </div>
            </div>
          </>
        ) : infoTab === "cheatsheet" ? (
          <div className={styles.cheatsheetTabLayout}>
            <h2 className={styles.title}>Cheatsheet</h2>
            <div className={styles.cheatsheets}>
              <CheatSheetTables />
            </div>
          </div>
        ) : infoTab === "moreinfo" ? (
          <>
            <h2 className={styles.title}>More info</h2>
            <p className={styles.resourcesCopy}>
              Blackjack is the most profitable game in the casino when played correctly. With optimal
              strategy, you can reduce the house edge to 0.23599%—making it the best bet on the floor.
            </p>

            <Accordion
              title="How The House Profits"
              open={houseProfitsOpen}
              onToggle={() => setHouseProfitsOpen((prev) => !prev)}
            >
              <p className={styles.resourcesCopyList}>
                Even so, theres plenty of ways the casino&apos;s look to screw you :{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Offering / Taking Insurance <br /> Insurance is never worthwhile, don&apos;t get
                suckered into it!{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Offering Side Bets <br /> (Think betting on pairs, betting on dealer blackjack, etc.)
              </p>
              <p className={styles.resourcesCopyList}>
                6:5 Blackjack <br /> Some casinos payout 6:5 instead of 3:2. House edge jumps nearly
                1.4%{" "}
              </p>
              <p className={styles.resourcesCopyList}>
                Dealer Hits on Soft 17 <br /> A small rule but one that fundamentally changes basic
                strategy.
              </p>
              <p className={styles.resourcesCopyList}>
                Blackjack Plus (Australia) <br /> For the Aussies out there. Avoid Blackjack Plus at
                Star &amp; Crown. The dealer pushes on 22 which throws basic strategy out the window.
              </p>
            </Accordion>

            <Accordion
              title="Some Useful Resources"
              open={resourcesOpen}
              onToggle={() => setResourcesOpen((prev) => !prev)}
            >
              <div className={styles.resourcesStack}>
                <a
                  className={styles.resources}
                  href="https://www.blackjackapprenticeship.com/blackjack-calculator/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  House Edge Calculator
                </a>
                <a
                  className={styles.resources}
                  href="https://www.theplaidhorse.com/2025/01/23/how-to-spot-and-avoid-unfavorable-blackjack-tables/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Avoiding Dodgy Tables
                </a>
                <a
                  className={styles.resources}
                  href="https://wizardofodds.com/gambling/house-edge/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  House Edge of ALL Casino Games
                </a>
                <a
                  className={styles.resources}
                  href="https://www.shs-conferences.org/articles/shsconf/pdf/2022/18/shsconf_icprss2022_03038.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Additional Sources
                </a>
              </div>
            </Accordion>

            <p className={styles.moreInfoFooter}>
              A{" "}
              <a
                href="https://zmorehouse.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.pageFooterLink}
              >
                zmorehouse.com
              </a>{" "}
              project
            </p>
          </>
        ) : null}
      </div>
    </aside>
  );
}
