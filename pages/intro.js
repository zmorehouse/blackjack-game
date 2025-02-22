import { motion } from "framer-motion";
import { useMediaQuery } from 'react-responsive';
import Head from "next/head";


const Intro = () => {
    const isMobile = useMediaQuery({ maxWidth: 768 }); 

    const zoomInAnimation = {
        hidden: { scale: 0.5 },
        visible: {
            scale: 1,
            transition: { duration: 1, ease: "easeOut" },
        },
    };

    const cardAnimation1 = {
        hidden: { rotate: 15, y:-200 },
        visible: {
            rotate: 0,
            y:0,
            transition: { duration: 0.7, ease: "easeOut" },
        },
    };

    const cardAnimation2 = {
        hidden: { rotate: 50, y:-200  },
        visible: {
            rotate: 0,
            y:-20,
            transition: { duration: 0.8, ease: "easeOut" },
        },
    };

    const cardAnimation3 = {
        hidden: { rotate: 15, y:200 },
        visible: {
            rotate: 0,
            y:15,
            transition: { duration: 0.65, ease: "easeOut" },
        },
    };

    const cardAnimation4 = {
        hidden: { rotate: 50, y:200  },
        visible: {
            rotate: 0,
            y:-20,
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
                delayChildren: 0.15, 
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


    return (
        <>
            <Head>
                <title>Optimal Blackjack Strategy</title>
            </Head>
            <div className="pageContainer">
                <div className="contentWrapper">
                    {/* Zoom-in Image Animation */}
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

                    {/* Tagline Character-by-Character Animation */}
                    <motion.h2
                        className="tagline"
                        initial="hidden"
                        animate="visible"
                        variants={taglineAnimation}
                    >
                        <motion.span variants={characterAnimation}>L</motion.span>
                        <motion.span variants={characterAnimation}>e</motion.span>
                        <motion.span variants={characterAnimation}>a</motion.span>
                        <motion.span variants={characterAnimation}>r</motion.span>
                        <motion.span variants={characterAnimation}>n</motion.span>
                        <motion.span variants={characterAnimation}> </motion.span>
                        <motion.span variants={characterAnimation}>O</motion.span>
                        <motion.span variants={characterAnimation}>p</motion.span>
                        <motion.span variants={characterAnimation}>t</motion.span>
                        <motion.span variants={characterAnimation}>i</motion.span>
                        <motion.span variants={characterAnimation}>m</motion.span>
                        <motion.span variants={characterAnimation}>a</motion.span>
                        <motion.span variants={characterAnimation}>l</motion.span>
                        <motion.span variants={characterAnimation}> </motion.span>
                        <motion.span variants={characterAnimation}>B</motion.span>
                        <motion.span variants={characterAnimation}>l</motion.span>
                        <motion.span variants={characterAnimation}>a</motion.span>
                        <motion.span variants={characterAnimation}>c</motion.span>
                        <motion.span variants={characterAnimation}>k</motion.span>
                        <motion.span variants={characterAnimation}>j</motion.span>
                        <motion.span variants={characterAnimation}>a</motion.span>
                        <motion.span variants={characterAnimation}>c</motion.span>
                        <motion.span variants={characterAnimation}>k</motion.span>
                        <motion.span variants={characterAnimation}> </motion.span>
                        <motion.span variants={characterAnimation}>S</motion.span>
                        <motion.span variants={characterAnimation}>t</motion.span>
                        <motion.span variants={characterAnimation}>r</motion.span>
                        <motion.span variants={characterAnimation}>a</motion.span>
                        <motion.span variants={characterAnimation}>t</motion.span>
                        <motion.span variants={characterAnimation}>e</motion.span>
                        <motion.span variants={characterAnimation}>g</motion.span>
                        <motion.span variants={characterAnimation}>y</motion.span>
                    </motion.h2>

                    <button className="startButton">Start</button>
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
        </>
    );
};

export default Intro;
