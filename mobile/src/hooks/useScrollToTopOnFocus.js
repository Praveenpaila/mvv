import { useCallback } from "react";
import { useFocusEffect, useScrollToTop } from "@react-navigation/native";

export const useScrollToTopOnFocus = (scrollRef) => {
  // Also supports "tap active tab to scroll top" behavior.
  useScrollToTop(scrollRef);

  useFocusEffect(
    useCallback(() => {
      const node = scrollRef?.current;

      const scrollToTop = () => {
        if (!node) return;

        if (typeof node.scrollTo === "function") {
          node.scrollTo({ y: 0, animated: false });
          return;
        }

        if (typeof node.scrollToOffset === "function") {
          node.scrollToOffset({ offset: 0, animated: false });
          return;
        }

        if (typeof node.scrollToIndex === "function") {
          node.scrollToIndex({ index: 0, animated: false });
        }
      };

      const frame = requestAnimationFrame(scrollToTop);
      const timer = setTimeout(scrollToTop, 0);

      return () => {
        cancelAnimationFrame(frame);
        clearTimeout(timer);
      };
    }, [scrollRef]),
  );
};
