import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FeedPage } from "./pages/FeedPage";
import UploadPage from "./pages/UploadPage";

// Dummy components to test routing navigation visually
const WatchVideoPlaceholder = () => <div className="p-20 text-white text-2xl">Video Player Page</div>;
const ChannelPlaceholder = () => <div className="p-20 text-white text-2xl">Channel Profile Page</div>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="selection:bg-purple-500/30 selection:text-purple-200">
        <Routes>
          {/* Main Feed Route */}
          <Route path="/" element={<FeedPage />} />
          
          {/* Dynamic Navigation Routes */}
          <Route path="/watch/:videoId" element={<WatchVideoPlaceholder />} />
          <Route path="/channel/:channelId" element={<ChannelPlaceholder />} />
          
          {/* Sidebar Navigation Mock Routes */}
          <Route path="/feed/subscriptions" element={<FeedPage />} />
          <Route path="/feed/history" element={<FeedPage />} />
          <Route path="/upload" element={<UploadPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}