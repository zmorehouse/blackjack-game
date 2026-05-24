import { motion, useReducedMotion } from "framer-motion";
import styles from "@/styles/Home.module.css";

/**
 * @param {"deal" | "flip"} variant
 * - deal: fly in from above (new card / new round)
 * - flip: 3D-style flip-in (hole card revealed — remount with new key from parent)
 */
export default function AnimatedTableCard({
  src,
  alt,
  className = "",
  delay = 0,
  variant = "deal",
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <div className={styles.cardContainer}>
        <img src={src} alt={alt} className={className} />
      </div>
    );
  }

  const transition =
    variant === "flip"
      ? { delay, duration: 0.42, ease: [0.22, 1, 0.36, 1] }
      : { delay, type: "spring", stiffness: 420, damping: 28, mass: 0.78 };

  const initial =
    variant === "flip"
      ? { opacity: 0, rotateY: -88, scale: 0.94 }
      : { opacity: 0, y: -24, rotate: -5, scale: 0.92 };

  const animate =
    variant === "flip"
      ? { opacity: 1, rotateY: 0, scale: 1 }
      : { opacity: 1, y: 0, rotate: 0, scale: 1 };

  return (
    <div className={styles.cardContainer} style={{ perspective: 1100 }}>
      <motion.img
        src={src}
        alt={alt}
        className={className}
        initial={initial}
        animate={animate}
        transition={transition}
        style={{ transformOrigin: "center center", transformStyle: "preserve-3d" }}
      />
    </div>
  );
}
