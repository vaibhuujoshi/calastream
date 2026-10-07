import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage";
import UploadPage from "./pages/UploadPage";
import WatchPage from "./pages/WatchPage";
import ChannelPage from "./pages/ChannelPage";
import { Toaster } from "sonner";
import { SubscriptionsFeedPage } from "./pages/SubscriptionsFeedPage";
import HistoryPage from "./pages/HistoryPage";

export default function App(): React.JSX.Element {
  return (
    <>
      <BrowserRouter>
        <div className="selection:bg-purple-500/30 selection:text-purple-200">
          <Routes>
            {/* Main Feed Route */}
            <Route path="/" element={<FeedPage />} />

            {/* Dynamic Navigation Routes */}
            <Route path="/watch/:videoId" element={<WatchPage />} />
            <Route path="/channel/:channelId" element={<ChannelPage />} />

            {/* Sidebar Navigation Mock Routes */}
            <Route path="/feed/subscriptions" element={<SubscriptionsFeedPage />} />
            <Route path="/feed/history" element={<HistoryPage />} />
            <Route path="/upload" element={<UploadPage />} />
          </Routes>
        </div>
      </BrowserRouter>
      
      {/* Global Notification Layer */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "bg-zinc-900/95 border border-zinc-800/80 text-zinc-100 rounded-xl font-sans shadow-2xl backdrop-blur-md px-4 py-3",
        }}
      />
    </>
  );
}
