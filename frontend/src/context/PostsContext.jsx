import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../lib/api";

const PostsContext = createContext(null);

export const PostsProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/posts");
      setPosts(res.data || []);
    } catch (e) {
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const addPost = async (payload) => {
    const res = await api.post("/posts", payload);
    setPosts((prev) => [res.data, ...prev]);
    return res.data;
  };

  const removePost = async (id) => {
    await api.delete(`/posts/${id}`);
    setPosts((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <PostsContext.Provider value={{ posts, loading, addPost, removePost, refresh: fetchPosts }}>
      {children}
    </PostsContext.Provider>
  );
};

export const usePosts = () => {
  const ctx = useContext(PostsContext);
  if (!ctx) throw new Error("usePosts must be used inside PostsProvider");
  return ctx;
};
