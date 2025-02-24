import { motion } from "framer-motion";
import { useMediaQuery } from 'react-responsive';
import Head from "next/head";
import { useState, useEffect } from 'react';

const text = "Learn Optimal Blackjack Strategy";

const Intro = () => {
    const isMobile = useMediaQuery({ maxWidth: 768 });
    const [startClicked, setStartClicked] = useState(false);
    const [secondTextVisible, setSecondTextVisible] = useState(false);
    const [thirdTextVisible, setThirdTextVisible] = useState(false);

    useEffect(() => {
        if (thirdTextVisible) {
            setTimeout(() => {
                setShowDivs(true);
            }, 2500);
        }
    }, [thirdTextVisible]);

    const [showDivs, setShowDivs] = useState(false);

    const slideInAnimation = {
        hidden: { y: "100vh" },
        visible: {
            y: 0,

            transition: {
                duration: 0.75,
                ease: "easeInOut"
            }
        },
    };

    const slideInAnimation2 = {
        hidden: { y: "100vh" },
        visible: {
            y: 0,

            transition: {
                delay: 0.2,
                duration: 0.75,
                ease: "easeInOut"
            }
        },
    };


    const slideInAnimation3 = {
        hidden: { y: "100vh" },
        visible: {
            y: 0,

            transition: {
                delay: 0.4,
                duration: 0.75,
                ease: "easeInOut"
            }
        },
    };

    const zoomInAnimation = {
        hidden: { scale: 0.5 },
        visible: {
            scale: 1,
            transition: { duration: 1, ease: "easeOut" },
        },
    };

    const cardAnimation1 = {
        hidden: { rotate: 15, y: -200 },
        visible: {
            rotate: 0,
            y: 0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const cardAnimation2 = {
        hidden: { rotate: 50, y: -200 },
        visible: {
            rotate: 0,
            y: -20,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const cardAnimation3 = {
        hidden: { rotate: 15, y: 200 },
        visible: {
            rotate: 0,
            y: 15,
            transition: { duration: 0.65, ease: "easeOut" },
        },
    };

    const cardAnimation4 = {
        hidden: { rotate: 50, y: 200 },
        visible: {
            rotate: 0,
            y: -20,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const dividerAnimation = {
        hidden: { width: "0%" },
        visible: {
            width: isMobile ? 250 : 475,
            transition: {
                delay: 0.2,
                duration: 1,
                ease: "easeOut"
            },
        },
    };

    const taglineAnimation = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.2,
                ease: "easeOut",
                delayChildren: 0.01,
                staggerChildren: 0.05,
            },
        },
    };

    const characterAnimation = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 25,
                duration: 0.6,
            },
        },
    };



    const handleStartClick = () => {
        if (!startClicked) {
            setStartClicked(true);
        } else if (startClicked && !secondTextVisible) {
            setSecondTextVisible(true);
        } else if (secondTextVisible && !thirdTextVisible) {
            setThirdTextVisible(true);
        }
    };

    return (
        <>
            <Head>
                <title>Optimal Blackjack Strategy</title>
            </Head>
            <div className="pageContainer">
                <div
                    className={`contentWrapper ${startClicked && !thirdTextVisible ? 'alignedStart' : ''}`}
                >
                    {/* Fade Out Initial Content */}
                    {!startClicked && (
                        <>
                            <motion.img
                                className="logo"
                                src="/images/logo.png"
                                alt="Logo"
                                initial="hidden"
                                animate="visible"
                                variants={zoomInAnimation}
                            />
                            <motion.div
                                className="divider"
                                initial="hidden"
                                animate="visible"
                                variants={dividerAnimation}
                            ></motion.div>

                            <motion.h2
                                className="tagline"
                                initial="hidden"
                                animate="visible"
                                variants={{ visible: { transition: { staggerChildren: 0.05 } } }} // Optional stagger timing
                            >
                                {text.split("").map((char, index) => (
                                    <motion.span key={index} variants={characterAnimation}>
                                        {char}
                                    </motion.span>
                                ))}
                            </motion.h2>
                        </>
                    )}

                    {/* First Text Paragraph */}
                    {startClicked && !secondTextVisible && (
                        <motion.div
                            className="newParagraph"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                            style={{ textAlign: 'left', fontSize: '50px' }}
                        >
                            <p>
                                {"Played perfectly, the house only has 0.23599%* edge on Blackjack, making it the "
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation}>{char}</motion.span>
                                    ))}
                                {"most profitable game in a casino."
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation} style={{ color: '#FFA100' }}>
                                            {char}
                                        </motion.span>
                                    ))}
                            </p>
                        </motion.div>
                    )}
                    {/* Second Text Paragraph (Appears after second click) */}
                    {secondTextVisible && !thirdTextVisible && (
                        <motion.div
                            className="newParagraph"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                            style={{ textAlign: 'left', fontSize: '50px' }}
                        >
                            <p className="notEveryone">
                                {"But not everyone plays perfectly."
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation}>{char}</motion.span>
                                    ))}
                            </p>

                            <p>
                                {"Dealers Dilemma is designed to help you master "
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation}>{char}</motion.span>
                                    ))}
                                {"basic blackjack strategy."
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation} style={{ color: '#FFA100' }}>
                                            {char}
                                        </motion.span>
                                    ))}
                            </p>
                        </motion.div>
                    )}


                    {/* Third Text Paragraph (Appears after third click) */}
                    {thirdTextVisible && (
                        <motion.div
                            className="newParagraph"
                            initial="hidden"
                            animate="visible"
                            variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
                            style={{ textAlign: 'center', fontSize: '50px' }}
                        >
                            <p>
                                {"Because, let's face it, the casino’s have too much " 
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation}>{char}</motion.span>
                                    ))}
                            
                            {"f******"
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation} style={{ color: '#FF0400' }}>
                                            {char}
                                        </motion.span>
                                    ))}
                                                                   {" money."
                                    .split("").map((char, index) => (
                                        <motion.span key={index} variants={characterAnimation}>{char}</motion.span>
                                    ))}
                            
                            </p>
                        </motion.div>
                    )}



                    {/* Continue Button */}
                    {!thirdTextVisible && (
                        <button
                            className={`startButton ${startClicked ? 'withMargin' : ''}`}
                            onClick={handleStartClick}
                        >
                            {startClicked ? 'Continue' : 'Start'}
                        </button>
                    )}
                    <div className="version">v1.0</div>
                </div>


                {/* Card Animations */}
                <motion.div
                    className="bottomRightCards"
                    initial="hidden"
                    animate="visible"
                    variants={cardAnimation4}
                >
                    <img
                        id="jack"
                        src="/cards/JD.png"
                        alt="Jack of Diamonds"
                        className="card"
                        style={{
                            position: "absolute",
                            bottom: "-100px",
                            right: "125px",
                        }}
                    />
                </motion.div>

                <motion.div
                    className="bottomRightCards"
                    initial="hidden"
                    animate="visible"
                    variants={cardAnimation3}
                >
                    <img
                        id="ace"
                        src="/cards/AH.png"
                        alt="Ace of Hearts"
                        className="card"
                        style={{
                            position: "absolute",
                            bottom: "-35px",
                            right: "0px",
                        }}
                    />
                </motion.div>

                <motion.div
                    className="topLeftCards"
                    initial="hidden"
                    animate="visible"
                    variants={cardAnimation2}
                >
                    <img
                        id="ace"
                        src="/cards/AS.png"
                        alt="Ace of Spades"
                        className="card"
                        style={{
                            position: "absolute",
                            top: "-100px",
                            left: "100px",
                            zIndex: 3,
                        }}
                    />
                </motion.div>

                <motion.div
                    className="topLeftCards"
                    initial="hidden"
                    animate="visible"
                    variants={cardAnimation1}
                >
                    <img
                        id="back"
                        src="/cards/back.png"
                        alt="Card Back"
                        className="card"
                        style={{
                            position: "absolute",
                            top: "-50px",
                            left: "-50px",
                        }}
                    />
                </motion.div>
            </div>
            {showDivs && (
                <div className="slidingDivs">
                    <motion.div
                        className="slideIn bg-red"
                        initial="hidden"
                        animate="visible"
                        variants={slideInAnimation}
                        transition={{ delay: 0 }}
                    >
                        <div className="slidercontainer">
                            <div>
                            <div className="comingsoon"> <p> Coming Soon </p></div>
                            <div className="description"><p>Master the rules and strategies of Blackjack.
                                
                            </p></div>
                            </div>
                            <div className="title"><h2>How To Play Blackjack
                            </h2></div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="slideIn bg-green"
                        initial="hidden"
                        animate="visible"
                        variants={slideInAnimation2}
                        transition={{ delay: 1 }}
                    >
                        <div className="slidercontainer">

                            <div className="description"><p>Sharpen your skills with interactive hands-on practice.
                            </p></div>
                            <div className="title"><h2>Practice Tool</h2></div>
                        </div>
                    </motion.div>

                    <motion.div
                        className="slideIn bg-blue"
                        initial="hidden"
                        animate="visible"
                        variants={slideInAnimation3}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="slidercontainer">
                        <div>
                            <div className="comingsoon"> <p> Coming Soon </p></div>
                            <div className="description"><p>Master the rules and strategies of Blackjack.
                                
                            </p></div>
                            </div>
                            <div className="title"><h2>Learn Optimal Strategy
                            </h2></div>
                        </div>

                    </motion.div>
                </div>
            )}

        </>
    );
};

export default Intro;
