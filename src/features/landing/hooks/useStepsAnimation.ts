// src/hooks/useStepsAnimation.ts
import { useEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// تسجيل إضافة ScrollTrigger مع GSAP
gsap.registerPlugin(ScrollTrigger);

/**
 * خطاف مخصص لتطبيق تأثير الظهور المتتابع على قسم "كيف يعمل".
 * @param sectionRef - مرجع (ref) للعنصر الحاوي للقسم بأكمله.
 */
export const useStepsAnimation = (sectionRef: RefObject<HTMLElement>) => {
  useEffect(() => {
    const sectionElement = sectionRef.current;
    if (!sectionElement) return;

    // استخدام gsap.utils.context لتسهيل عملية التنظيف (cleanup)
    const ctx = gsap.context(() => {
      // 1. اختيار جميع العناصر التي سنقوم بتحريكها
      const title = sectionElement.querySelector(".steps-title");
      const subtitle = sectionElement.querySelector(".steps-subtitle");
      const steps = gsap.utils.toArray<HTMLElement>(".step-box-item");

      // 2. إنشاء 타임라인 (Timeline) لتنظيم الحركات بشكل متسلسل
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionElement, // العنصر الذي يفعل الحركة عند ظهوره
          start: "top 80%", // تبدأ الحركة عندما يصل أعلى العنصر إلى 80% من الشاشة
          end: "bottom 20%", // (اختياري) يمكن استخدامه لتأثيرات معقدة
          toggleActions: "play none none none", // تشغيل الحركة مرة واحدة فقط
        },
      });

      // 3. إضافة الحركات إلى الـ Timeline
      // حركة العنوان الرئيسي والفرعي
      tl.from([title, subtitle], {
        opacity: 0,
        y: 50,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.2, // تأخير بسيط بين حركة العنوان والعنوان الفرعي
      });

      // حركة بطاقات الخطوات وخطوط الربط
      steps.forEach((step, index) => {
        const stepCard = step.querySelector(".step-box-animated");
        const connector = step.querySelector(".connector-line");

        // حركة ظهور البطاقة
        tl.from(
          stepCard,
          {
            opacity: 0,
            scale: 0.9,
            y: 60,
            duration: 0.8,
            ease: "power4.out",
          },
          ">-0.4"
        ); // تداخل بسيط مع الحركة السابقة لتبدو أكثر سلاسة

        // حركة "رسم" خط الربط (إذا كان موجودًا)
        if (connector) {
          tl.from(
            connector,
            {
              scaleX: 0, // يبدأ بعرض 0
              transformOrigin: "left center", // ينمو من اليسار
              duration: 0.7,
              ease: "power2.inOut",
            },
            "<"
          ); // يبدأ مع حركة البطاقة
        }
      });
    }, sectionElement);

    // دالة التنظيف لإزالة كل الحركات عند إزالة المكون
    return () => ctx.revert();
  }, [sectionRef]);
};
