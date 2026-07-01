import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

const YouTubePlayer = ({ video, open, onClose }) => {
  if (!video) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl border-neutral-800 bg-neutral-950 text-neutral-100">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl text-neutral-100">{video.title}</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full overflow-hidden rounded-md bg-black">
          <iframe
            title={video.title}
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            width="100%"
            height="100%"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <p className="text-sm text-neutral-400">{video.desc}</p>
      </DialogContent>
    </Dialog>
  );
};

export default YouTubePlayer;
