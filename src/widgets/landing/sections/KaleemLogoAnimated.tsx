// KaleemLogoAnimated.tsx
import { ReactSVG } from "react-svg";
import { motion } from "framer-motion";

type Props = { src?: string; size?: number; float?: boolean };

export default function KaleemLogoAnimated({
  src = "/kaleem2.svg", // الآن في public folder
  size = 180,
  float = true,
}: Props) {
  return (
    <motion.div
      style={{ width: size, height: size, display: "inline-block" }}
      animate={float ? { y: [0, -6, 0] } : undefined}
      transition={float ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      <ReactSVG
        src={src}
        beforeInjection={(svg) => {
          svg.classList.add("kaleem-svg");
          // وسوم ذكية:
          // 1) كل المسارات البنفسجية (حدود/أطراف)
          svg.querySelectorAll('path[fill="#502E91"]').forEach((el) => {
            el.classList.add("outline");
          });
          // 2) ظل أرضي (ellipse الوحيد)
          svg.querySelectorAll("ellipse").forEach((el) => el.classList.add("shadow"));

          // 3) اكتشاف العينين: أشكال بيضاء صغيرة (قُطر < ~40px)
          Array.from(svg.querySelectorAll('path[fill="white"], path[fill="#ffffff"]')).forEach(
            (p) => {
              const bb = (p as SVGGraphicsElement).getBBox();
              if (bb.width < 40 && bb.height < 40) p.classList.add("eye");
            }
          );

          // 4) محاولة تعليم اليد اليسرى: مسار بنفسجي كبير في أقصى اليسار
          let handCandidate: SVGGraphicsElement | null = null;
          svg.querySelectorAll('path[fill="#502E91"]').forEach((p) => {
            const bb = (p as SVGGraphicsElement).getBBox();
            if (!handCandidate || bb.x < (handCandidate as any).getBBox().x) {
              // نفضّل العنصر الأعـرض قليلًا
              if (bb.width > 40 && bb.height > 60) handCandidate = p as any;
            }
          });
          if (handCandidate) (handCandidate as any).classList.add("hand");
        }}
        loading={() => null}
      />
      {/* أنماط وحركات داخلية */}
      <style>{`
        .kaleem-svg { width: 100%; height: 100%; display:block; }
        .kaleem-svg .outline { filter: drop-shadow(0 0 6px #7C4DFF) drop-shadow(0 0 12px #7C4DFF); }
        .kaleem-svg .shadow { animation: shadowPulse 3s ease-in-out infinite; opacity:.85; }
        .kaleem-svg .eye     { transform-box: fill-box; transform-origin: 50% 50%; animation: blink 3.6s infinite; }
                 .kaleem-svg .hand    { 
           transform-box: fill-box; 
           transform-origin: 85% 85%; 
           animation: wave 4s ease-in-out infinite;
           animation-delay: 1s;
         }

        @keyframes blink {
          0%, 92%, 100% { transform: scaleY(1); }
          94%, 96%      { transform: scaleY(0.1); }
        }
        @keyframes wave {
          0% { transform: rotate(0deg); }
          5% { transform: rotate(-5deg); }
          10% { transform: rotate(10deg); }
          15% { transform: rotate(-8deg); }
          20% { transform: rotate(12deg); }
          25% { transform: rotate(-6deg); }
          30% { transform: rotate(8deg); }
          35% { transform: rotate(-3deg); }
          40% { transform: rotate(5deg); }
          45% { transform: rotate(0deg); }
          50%, 100% { transform: rotate(0deg); }
        }
        @keyframes shadowPulse {
          0%,100% { transform: scaleX(1); opacity:.85; }
          50%     { transform: scaleX(1.06); opacity:.7; }
        }
      `}</style>
    </motion.div>
  );
}
