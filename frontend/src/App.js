import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { PostsProvider } from "./context/PostsContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Articles, { ArticleDetail } from "./pages/Articles";
import { Manuscripts, ManuscriptDetail, Folktales, FolktaleDetail } from "./pages/Manuscripts";
import Videos from "./pages/Videos";
import Community from "./pages/Community";
import Login from "./pages/Login";
import About from "./pages/About";
import Tools from "./pages/Tools";
import AuthCallback from "./pages/AuthCallback";
import { Toaster } from "./components/ui/toaster";

// Detect OAuth callback fragment during render and route to AuthCallback
function AppRouter() {
  const location = useLocation();
  if (location.hash?.includes("session_id=")) {
    return <AuthCallback />;
  }
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/articles" element={<Articles />} />
        <Route path="/article/:id" element={<ArticleDetail />} />
        <Route path="/manuscripts" element={<Manuscripts />} />
        <Route path="/manuscript/:id" element={<ManuscriptDetail />} />
        <Route path="/folktales" element={<Folktales />} />
        <Route path="/folktale/:id" element={<FolktaleDetail />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/community" element={<Community />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/tools/:toolId" element={<Tools />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <PostsProvider>
          <BrowserRouter>
            <AppRouter />
          </BrowserRouter>
          <Toaster />
        </PostsProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
