import React, { useState, type ChangeEvent, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SigninUser, SignupUser } from '../../api/auth';

// Icons to match your video platform vibe
const SparklesIcon = () => <div className="w-8 h-8 rounded-xl bg-purple-900/30 border border-purple-500/30 flex items-center justify-center text-purple-400">✨</div>;
const VideoIcon = () => <div className="w-8 h-8 rounded-xl bg-orange-900/30 border border-orange-500/30 flex items-center justify-center text-orange-400">📹</div>;
const StreamIcon = () => <div className="w-8 h-8 rounded-xl bg-emerald-900/30 border border-emerald-500/30 flex items-center justify-center text-emerald-400">⚡</div>;

interface AuthCardProps {
  onSuccess?: () => void;
}

type GenderType = 'male' | 'female' | 'others' | '';

interface FormDataState {
  username: string;
  password: string;
  gender: GenderType;
  channelName: string;
}

const AuthCard: React.FC<AuthCardProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSignUp) {
      // console.log('Signing Up with:', formData);
      SignupUser(formData.username, formData.password, formData.gender, formData.channelName);
    } else {
      // console.log('Signing In with:', { username: formData.username, password: formData.password });
      SigninUser(formData.username, formData.password);
    }
    onSuccess?.();
  };

  return (
    <motion.div
      layout
      // Responsive constraints & Fixed Height: Stacks on mobile, fixed 650px height on desktop
      className={`w-full max-w-250 justify-center flex flex-col md:h-162.5 bg-[#0A0A0A] rounded-2xl md:rounded-3xl overflow-hidden border border-[#1A1A1A] shadow-2xl ${isSignUp ? 'md:flex-row-reverse' : 'md:flex-row'
        }`}
    >
      {/* ----------------- Pane A: Branding / Gradient (Left by default) ----------------- */}
      <motion.div
        layout
        className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-between relative z-10 min-h-75 md:min-h-full"
        style={{
          // Combines an SVG noise filter with a deep radial gradient for that exact Web3/AI texture
          backgroundImage: `
            url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E"),
            radial-gradient(120% 120% at 50% 100%, #4c1d95 0%, #050505 80%)
          `,
          backgroundBlendMode: 'overlay, normal',
        }}
      >
        <div>
          {/* Logo Section */}
          <div className="flex items-center gap-3 mb-8 md:mb-16">
            <div className="w-5 h-5 bg-purple-600 rounded-sm transform rotate-45"></div>
            <span className="text-xl font-bold tracking-widest text-white uppercase">Calastream</span>
          </div>

          <motion.h2 layout className="text-3xl md:text-5xl font-semibold leading-tight text-white mb-6">
            Where Video meets Audience. <br />
            No Studio required.
          </motion.h2>

          <motion.p layout className="text-[15px] text-zinc-400 leading-relaxed max-w-sm">
            Generate stunning streams, deploy your channel, and build communities. All with the confidence of modern creator tools.
          </motion.p>
        </div>

        {/* Floating Feature Icons matching the screenshot */}
        <div className="flex items-center gap-3 mt-8">
          <SparklesIcon />
          <VideoIcon />
          <StreamIcon />
        </div>
      </motion.div>

      {/* ----------------- Pane B: Authentication Form (Right by default) ----------------- */}
      <motion.div
        layout
        className="w-full md:w-1/2 bg-[#0C0C0C] flex flex-col relative z-20"
      >
        {/* We use an internal scrollable container so the parent height stays fixed even if signup inputs take up space */}
        <div className="flex-1 overflow-y-auto px-8 py-10 md:px-14 md:py-16 custom-scrollbar flex flex-col justify-center">
          <div className="w-full max-w-sm mx-auto text-center">
            <motion.h3 layout className="text-2xl font-semibold text-white tracking-wide">
              {isSignUp ? 'Create your Channel' : 'Welcome to CALASTREAM'}
            </motion.h3>
            <motion.p layout className="text-sm text-zinc-400 mt-2 mb-8">
              {isSignUp ? 'Register to start broadcasting' : 'Sign in to your account'}
            </motion.p>

            <form onSubmit={handleSubmit} className="text-left space-y-4">
              {/* Core Inputs */}
              <div>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm"
                  placeholder="Username"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm"
                  placeholder="Password"
                />
              </div>

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
                    <div>
                      <select
                        name="gender"
                        required={isSignUp}
                        value={formData.gender}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white transition-colors text-sm appearance-none"
                      >
                        <option value="" disabled className="text-zinc-600">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Others</option>
                      </select>
                    </div>

                    <div>
                      <input
                        type="text"
                        name="channelName"
                        required={isSignUp}
                        value={formData.channelName}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 border border-[#222] rounded-lg bg-[#111] focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder:text-zinc-600 transition-colors text-sm"
                        placeholder="Channel Name"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                layout
                type="submit"
                className="w-full bg-white text-black font-semibold py-3.5 px-4 rounded-lg hover:bg-zinc-200 transition-colors mt-2 text-sm"
              >
                {isSignUp ? 'Create Account' : 'Sign In'}
              </motion.button>
            </form>

            <motion.p layout className="text-center text-sm text-zinc-500 mt-6">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-white hover:underline focus:outline-none transition-all"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </motion.p>
          </div>

          {/* Legal Footer pinned at the bottom of the scroll view */}
          <div className="mt-auto pt-8 text-center text-xs text-zinc-600">
            By signing in, you agree to our <br />
            <a href="#" className="text-purple-400 hover:text-purple-300 transition">Terms & Service</a> and <a href="#" className="text-purple-400 hover:text-purple-300 transition">Privacy Policy</a>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default AuthCard;