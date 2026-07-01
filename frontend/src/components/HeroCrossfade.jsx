import React, { useEffect, useState } from "react";

/**
 * HeroCrossfade
 * Smooth Ken-Burns + crossfade slideshow for authentic Mising Ali-Ai-Ligang photos.
 * `images` is an array of { src, alt }.
 */
const HeroCrossfade = ({ images = [], interval = 5000, className = "" }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images.length, interval]);

  return (
    <div className={`relative aspect-[16/10] w-full overflow-hidden rounded-lg bg-neutral-800 ${className}`}>
      {images.map((img, i) => (
        <div
          key={img.src}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out ${
            i === index ? "opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <img
            src={img.src}
            alt={img.alt || "Mising Ali-Ai-Ligang festival"}
            className={`h-full w-full object-cover ${
              i === index ? "hero-kenburns" : ""
            }`}
            loading={i === 0 ? "eager" : "lazy"}
          />
        </div>
      ))}
      {/* Progress dots */}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-amber-400" : "w-2.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HeroCrossfade;
