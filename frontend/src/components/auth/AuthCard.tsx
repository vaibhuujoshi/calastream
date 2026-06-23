import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getUserProfile, SigninUser, SignupUser } from '../../api/auth';
import { useUserStore, type ClientUserProfile } from '../../store/useUserStore';

// Icons to match your video platform vibe
const SparklesIcon = () => <div className="w-8 h-8 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400">✨</div>;
const VideoIcon = () => <div className="w-8 h-8 rounded-xl bg-orange-900/30 border border-orange-500/30 flex items-center justify-center text-orange-400">📹</div>;
const StreamIcon = () => <div className="w-8 h-8 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">⚡</div>;

interface AuthCardProps {
  onSuccess?: () => void;
}

type GenderType = 'Male' | 'Female' | 'Other' | '';

interface FormDataState {
  username: string;
  password: string;
  gender: GenderType;
  channelName: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ onSuccess }) => {
  const setUser = useUserStore((state) => state.setUser);
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<FormDataState>({
    username: '',
    password: '',
    gender: '',
    channelName: '',
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      let authRes;
      if (isSignUp) {
        authRes = await SignupUser(formData.username, formData.password, formData.gender, formData.channelName);
      } else {
        authRes = await SigninUser(formData.username, formData.password);
      }

      if (authRes) {
        // Fetch the user profile details once token is set
        const profileData = await getUserProfile();
        
        // Destructure out the ID field to store clean client data
        const { id, ...clientProfile } = profileData;
        
        setUser(clientProfile as ClientUserProfile);
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      layout
      className={`w-full max-w-250 justify-center flex flex-col md:h-162.5 bg-[#0A0A0A] rounded-2xl md:rounded-3xl overflow-hidden border border-[#1A1A1A] shadow-2xl ${
        isSignUp ? 'md:flex-row-reverse' : 'md:flex-row'
      }`}
    >
      {/* ----------------- Pane A: Branding / Gradient (Left by default) ----------------- */}
      <motion.div
        layout
        className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between relative z-10 min-h-75 md:min-h-full"
        style={{
          // Fixed broken, unclosed xmlns tag and missing filter markup strings
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://w3.org id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"), radial-gradient(120% 120% at 50% 100%, #4c1d95 0%, #050505 80%)`,
          backgroundBlendMode: 'overlay, normal',
        }}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 md:mb-16">
            <div className="w-5 h-5 bg-purple-600 rounded-sm transform rotate-45 shrink-0"></div>
            <span className="text-xl font-bold tracking-widest text-white uppercase">Calastream</span>
          </div>

          <motion.h2 layout className="text-3xl md:text-5xl font-semibold leading-tight text-white mb-6">
            Where Video meets Audience. <br /> No Studio required.
          </motion.h2>

          <motion.p layout className="text-[15px] text-zinc-400 leading-relaxed max-w-sm">
            Generate stunning streams, deploy your channel, and build communities with ease.
          </motion.p>
        </div>

        {/* Feature Icons */}
        <div className="flex items-center gap-3 mt-8">
          <SparklesIcon />
          <VideoIcon />
          <StreamIcon />
        </div>
      </motion.div>

      {/* ----------------- Pane B: Authentication Form (Right by default) ----------------- */}
      <motion.div layout className="w-full md:w-1/2 bg-[#0C0C0C] flex flex-col relative z-20">
        <div className="flex-1 overflow-y-auto px-8 py-10 md:px-14 md:py-16 custom-scrollbar flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto text-center">
            <motion.h3 layout className="text-2xl font-semibold text-white tracking-wide">
              {isSignUp ? 'Create your Channel' : 'Welcome to CALASTREAM'}
            </motion.h3>
            <motion.p layout className="text-sm text-zinc-400 mt-2 mb-8">
              {isSignUp ? 'Register to start broadcasting' : 'Sign in to your account'}
            </motion.p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-500/30 text-red-400 text-xs text-left">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              {/* Core Inputs (Fixed: Re-bound to onChange handler) */}
              <input
                type="text"
                name="username"
                required
                value={formData.username}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 text-white placeholder:text-zinc-600 text-sm transition-colors disabled:opacity-50"
                placeholder="Username"
              />
              
              <input
                type="password"
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 text-white placeholder:text-zinc-600 text-sm transition-colors disabled:opacity-50"
                placeholder="Password"
              />

              {/* Conditional Inputs for SignUp */}
              <AnimatePresence initial={false}>
                {isSignUp && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-4 overflow-hidden"
                  >
                    <select
                      name="gender"
                      required={isSignUp}
                      value={formData.gender}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 text-white text-sm appearance-none disabled:opacity-50"
                    >
                      <option value="" disabled>Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Others</option>
                    </select>
                    
                    <input
                      type="text"
                      name="channelName"
                      required={isSignUp}
                      value={formData.channelName}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 text-white placeholder:text-zinc-600 text-sm transition-colors disabled:opacity-50"
                      placeholder="Channel Name"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-medium py-3.5 px-4 rounded-lg text-sm cursor-pointer disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                {isSubmitting ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              </button>
            </form>

            {/* Mode Switcher Link toggles form state */}
            <div className="mt-6 text-center">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setIsSignUp((prev) => !prev)}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors bg-transparent border-none cursor-pointer focus:outline-none disabled:opacity-50"
              >
                {isSignUp ? 'Already have an account? Sign In' : "Don't have a channel? Sign Up"}
              </button>
            </div>

          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthCard;