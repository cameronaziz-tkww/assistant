import { useEffect, useState } from "react";

const useIsHovered: Hooks.UseIsHovered = (config) => {
  const { ref, onChange, ignore } = config;
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(
    () => {
      if (ref.current) {
        ref.current.addEventListener('mouseenter', mouseenter);
        ref.current.addEventListener('mouseleave', mouseout);
      }

      return () => {
        if (ref.current) {
          ref.current.removeEventListener('mouseenter', mouseenter);
          ref.current.removeEventListener('mouseleave', mouseout);
        }
      };
    },
    [ref],
  );

  const mouseenter = () => {
    const ignoreHover = typeof ignore === 'function' ? ignore() : ignore;
    if (!ignoreHover) {
      setIsHovered(true);
      if (onChange) {
        onChange(true);
      }
    }
  };

  const mouseout = () => {
    setIsHovered(false);
    if (onChange) {
      onChange(false);
    }
  };

  return {
    isHovered,
  };
};

export default useIsHovered;
