import { useEffect } from "react";

const usePreloadImages = (imageUrls: string[]) => {
  useEffect(() => {
    if (imageUrls && imageUrls.length > 0) {
      imageUrls.forEach((url) => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [imageUrls]);
};

export default usePreloadImages;
