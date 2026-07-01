import React, { createContext, useContext, useEffect, useState } from "react";

const PostsContext = createContext(null);

const seedPosts = [
  {
    id: "seed-1",
    title: "Memories of Ali-Ai-Ligang in my village",
    category: "Festival",
    imageUrl: "https://images.unsplash.com/photo-1759738102034-fe5a4f21bd94",
    description:
      "Every February my grandmother wakes before dawn to sow the first seed. The G\u00fcmr\u00e1g dance starts at sunset and the whole Chang-Ghar shakes to its rhythm.",
    author: { name: "Rimi Pegu", email: "rimi@example.com", picture: "https://api.dicebear.com/7.x/initials/svg?seed=Rimi%20Pegu" },
    createdAt: "2025-02-19T04:22:00.000Z",
  },
  {
    id: "seed-2",
    title: "Learning to weave the Ege from my mother",
    category: "Craft",
    imageUrl: "https://images.pexels.com/photos/24738158/pexels-photo-24738158.jpeg",
    description:
      "The backstrap loom is unforgiving. Every wrong pick shows on the cloth. But when you finally get the Miri red-black pattern right, it feels like the loom is singing back.",
    author: { name: "Junmoni Doley", email: "junmoni@example.com", picture: "https://api.dicebear.com/7.x/initials/svg?seed=Junmoni%20Doley" },
    createdAt: "2025-05-08T09:00:00.000Z",
  },
];

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const raw = localStorage.getItem("tani_posts");
    if (raw) {
      try {
        setPosts(JSON.parse(raw));
        return;
      } catch (e) { /* ignore */ }
    }
    setPosts(seedPosts);
    localStorage.setItem("tani_posts", JSON.stringify(seedPosts));
  }, []);

  const persist = (next) => {
    setPosts(next);
    localStorage.setItem("tani_posts", JSON.stringify(next));
  };

  const addPost = (post) => {
    const next = [post, ...posts];
    persist(next);
  };

  const removePost = (id) => {
    persist(posts.filter((p) => p.id !== id));
  };

  return (
    <PostsContext.Provider value={{ posts, addPost, removePost }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
};
