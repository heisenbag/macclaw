import { Shield, Zap, Terminal, Sparkles, Code, Copy, Check, Crosshair, RefreshCcw, PowerOff } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  const [copied, setCopied] = useState(false);

  const copyInstallCommand = () => {
    navigator.clipboard.writeText('npx macclaw chat');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen font-sans text-white overflow-x-hidden selection:bg-fuchsia-500/30 bg-[#050505]">

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-fuchsia-500 blur-md opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
            <img src="/logo.png" alt="MacClaw Logo" className="w-8 h-8 relative z-10" />
          </div>
          <span className="font-bold text-xl tracking-tight font-mono text-white">MacClaw</span>
        </Link>
        <div className="flex items-center gap-6">
          <a href="#features" className="text-sm font-medium text-white/50 hover:text-fuchsia-300 transition-colors">Features</a>
          <a href="#how-it-works" className="text-sm font-medium text-white/50 hover:text-teal-300 transition-colors">Workflow</a>
          <Link to="/docs" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Docs</Link>
          <a href="https://github.com" className="text-sm font-medium text-white/50 hover:text-white transition-colors">GitHub</a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center min-h-[90vh]">
        {/* Decorative elements - ultra premium vibrant orbs */}
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-fuchsia-600/20 rounded-full blur-[120px] pointer-events-none mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-teal-500/20 rounded-full blur-[100px] pointer-events-none mix-blend-screen animate-pulse duration-[6000ms] delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="z-10 text-center max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-fuchsia-500/30 bg-fuchsia-500/10 backdrop-blur-md text-fuchsia-300 text-sm font-medium mb-4 shadow-[0_0_15px_rgba(217,70,239,0.15)]">
            <Sparkles className="w-4 h-4 text-fuchsia-400" />
            <span className="font-mono tracking-wide">v0.3.3 — The Voice & Robustness Update</span>
          </div>

          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter leading-tight drop-shadow-2xl">
            Complex Workflows.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-indigo-400 to-teal-400 animate-gradient">
              One simple command.
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/60 max-w-3xl mx-auto font-medium leading-relaxed">
            No heavy installs. No complex setup. Just <code className="text-fuchsia-300 bg-fuchsia-500/10 px-2 rounded font-mono">npx macclaw chat</code>. The lightweight way to command your macOS GUI and browser through the power of AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            {/* Install Command Snippet */}
            <div className="flex items-center bg-black/60 border border-white/10 rounded-lg p-1.5 shadow-2xl backdrop-blur-xl group hover:border-fuchsia-500/50 transition-colors duration-300">
              <div className="flex items-center px-4 py-3 font-mono text-fuchsia-400">
                <span className="text-white/30 mr-3">$</span>
                npx macclaw chat
              </div>
              <button
                onClick={copyInstallCommand}
                className="ml-2 p-3 hover:bg-white/10 rounded-md transition-colors border-l border-white/10"
              >
                {copied ? <Check className="w-5 h-5 text-teal-400" /> : <Copy className="w-5 h-5 text-white/50 group-hover:text-white" />}
              </button>
            </div>
            <Link to="/docs" className="flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 rounded-lg font-bold text-lg hover:bg-white/10 hover:shadow-[0_0_20px_rgba(255,255,255,0.05)] transition-all duration-300 h-full">
              Explore Docs
            </Link>
          </div>
        </div>

        {/* Terminal App Preview */}
        <div className="w-full max-w-4xl mt-24 relative group animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 text-left perspective-1000">
          <div className="absolute -inset-1 bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-teal-500 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative w-full rounded-xl bg-[#0f0f11] overflow-hidden flex flex-col font-mono text-[13px] leading-relaxed text-gray-300 shadow-2xl border border-white/10 transform-gpu transition-all duration-500 hover:scale-[1.01]">
            {/* macOS Terminal Header */}
            <div className="h-10 bg-[#1a1a1c] flex items-center px-4 gap-2 border-b border-black/50">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]/80 hover:bg-[#FF5F56] transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/80 hover:bg-[#FFBD2E] transition-colors"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]/80 hover:bg-[#27C93F] transition-colors"></div>
              </div>
              <div className="flex-1 text-center text-xs font-semibold text-gray-500 bg-[#0f0f11] mx-4 py-1.5 rounded-md border border-white/5">mac@MacBook-Pro ~ macclaw</div>
            </div>
            {/* Terminal Body */}
            <div className="p-6 relative min-h-[480px] bg-gradient-to-b from-[#0f0f11] to-[#0a0a0c]">
              <div className="text-white/40 mb-3">mac@MacBook-Pro ~ % <span className="text-fuchsia-400 font-medium">macclaw chat</span></div>

              <div className="text-white/80 space-y-1">
                <span className="text-white/30">┌</span>  MacClaw CLI is active (google/gemini-2.5-pro).<br />
                <span className="text-white/30">│</span><br />
                <span className="text-white/30">◇</span>  What would you like me to do on your Mac?<br />
                <span className="text-white/30">│</span>  <span className="text-white font-medium">/tts</span><br />
                <span className="text-white/30">│</span><br />
                <span className="text-fuchsia-400">◆</span>  <span className="text-fuchsia-300">TTS 🔊 enabled.</span><br />
                <span className="text-white/30">│</span><br />
                <span className="text-white/30">◇</span>  What would you like me to do on your Mac?<br />
                <span className="text-white/30">│</span>  <span className="text-teal-300 font-medium">Play the newest song on Spotify</span><br />
                <span className="text-white/30">│</span><br />
                <span className="text-indigo-400/80">[TTS] Loading Kokoro model (first run downloads ~300MB)...</span><br />
                <span className="text-indigo-400/80">[TTS] Ready.</span><br />
              </div>

              <div className="mt-4 border-l-2 border-teal-500/40 pl-4 py-3 bg-teal-500/5 rounded-r-md backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                <div className="text-teal-400 font-bold mb-2 flex items-center gap-2">
                  <span className="bg-teal-500/20 px-2 rounded text-[10px] tracking-wider uppercase">Gemini 2.5 Pro</span>
                </div>
                <div className="text-white/70 space-y-2">
                  <p><span className="text-white/40">Thought:</span> I see the Spotify widget on the screen, but it's currently paused. I need to click the play button. Since I am a reasoning model without a strict pixel grid, I will leverage the grounding bridge.</p>
                  <p className="font-medium text-teal-200"><span className="text-white/40">Action:</span> click_element(element_description='Spotify play button')</p>
                </div>
              </div>

              <div className="mt-3 border-l-2 border-fuchsia-500/40 pl-4 py-2 bg-fuchsia-500/5 rounded-r-md opacity-80 backdrop-blur-sm">
                <div className="text-white/50 text-xs italic tracking-wide">
                  [Bridge] Querying bytedance/ui-tars-1.5-7b for exact coordinates...<br/>
                  [Bridge] Mutated to: click(start_box=[0.45,0.89,0.45,0.89])
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3 text-fuchsia-400/80 pb-4">
                <div className="w-4 h-4 rounded-full border-2 border-fuchsia-500/30 border-t-fuchsia-400 animate-spin shadow-[0_0_10px_rgba(217,70,239,0.3)]"></div>
                MacClaw is taking action...
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-32 px-4 sm:px-6 lg:px-8 relative z-10 bg-black/40 border-t border-white/5">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">The <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Next-Gen</span> Architecture</h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-medium">How MacClaw bridges semantic reasoning with pixel-perfect accuracy.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative items-start">
            <div className="hidden md:block absolute top-[60px] left-32 right-32 h-px bg-gradient-to-r from-fuchsia-500/0 via-fuchsia-500/50 to-teal-500/0 z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center mb-8 border border-white/5 shadow-xl group-hover:scale-110 group-hover:border-indigo-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Terminal className="w-10 h-10 text-indigo-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">1. Semantic Intent</h3>
              <p className="text-white/50 leading-relaxed">
                Connect your OpenRouter key to ultra-smart reasoning models like <span className="text-indigo-300 font-medium whitespace-nowrap">Claude 3.5 Sonnet</span>. Let them analyze the screen and decide what needs to happen.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center mb-8 border border-white/5 shadow-xl group-hover:scale-110 group-hover:border-fuchsia-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Crosshair className="w-10 h-10 text-fuchsia-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">2. Grounding Bridge</h3>
              <p className="text-white/50 leading-relaxed">
                When Claude says "Click the checkout button", MacClaw intercepts the action and queries <span className="text-fuchsia-300 font-medium">UI-TARS 7B</span> to calculate the exact physical pixel coordinates natively.
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-b from-[#1a1a1a] to-[#0f0f0f] flex items-center justify-center mb-8 border border-white/5 shadow-xl group-hover:scale-110 group-hover:border-teal-500/30 transition-all duration-300">
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity"></div>
                  <Zap className="w-10 h-10 text-teal-400 relative z-10" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 tracking-tight">3. Native Execution</h3>
              <p className="text-white/50 leading-relaxed">
                The coordinates are scaled for Retina displays and injected back into the NutJS OS-level operator, generating flawless, un-stoppable automated mouse clicks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Built for Power Users</h2>
            <p className="text-white/50 text-xl max-w-2xl mx-auto font-medium">No graphical wrappers. No Electron overhead. Just pure terminal speed.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-emerald-500/50 transition-colors shadow-lg">
                <Code className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Zero Installation</h3>
              <p className="text-white/50 leading-relaxed text-base">Run via <code className="bg-white/5 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">npx</code> from any directory and start automating instantly without cluttering your Applications folder. Clean execution, every time.</p>
            </div>

            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-fuchsia-500/50 transition-colors shadow-lg">
                <RefreshCcw className="w-6 h-6 text-fuchsia-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Mid-Flight Hot Swapping</h3>
              <p className="text-white/50 leading-relaxed text-base">Use <code className="bg-white/5 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">/model</code> or <code className="bg-white/5 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">/key</code> directly in the prompt. MacClaw will dynamically hot-reload your API credentials without killing your current chat context.</p>
            </div>

            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-rose-500/50 transition-colors shadow-lg">
                <PowerOff className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Graceful Loop Abort</h3>
              <p className="text-white/50 leading-relaxed text-base">Model caught in an infinite loop? The custom SIGINT interceptor monitors <code className="bg-white/5 px-2 py-1 rounded text-rose-300 font-mono text-sm border border-rose-500/20">Ctrl+C</code> keystrokes mid-execution to safely halt actions without crashing Node.</p>
            </div>

            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-indigo-500/50 transition-colors shadow-lg">
                <Shield className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">On-Device Voice</h3>
              <p className="text-white/50 leading-relaxed text-base">Hear the agent's reasoning in real-time with integrated <code className="bg-white/5 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">Kokoro TTS</code>. Zero API cost, zero lag, 100% local synthesis.</p>
            </div>

            <div className="bg-gradient-to-br from-[#121212] to-[#0a0a0a] border border-white/5 p-10 rounded-[2rem] hover:border-white/10 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-black flex items-center justify-center mb-6 border border-white/10 group-hover:border-teal-500/50 transition-colors shadow-lg">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Robust Bash Engine</h3>
              <p className="text-white/50 leading-relaxed text-base">Advanced shell execution handles complex globs and expansions without crashing. <code className="bg-white/5 px-2 py-1 rounded text-white font-mono text-sm border border-white/10">nullglob</code> enabled by default for zero-failure automation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-10 bg-[#020202] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-white/40 tracking-tight font-mono">MacClaw</span>
          </div>
          <div className="text-white/30 text-sm font-medium">
            &copy; {new Date().getFullYear()} MacClaw OSS.
          </div>
          <div className="flex gap-8">
            <a href="https://github.com" className="text-white/40 hover:text-white transition-colors text-sm font-medium">GitHub</a>
            <a href="https://www.npmjs.com/package/macclaw" target="_blank" rel="noopener noreferrer" className="text-white/40 hover:text-white transition-colors text-sm font-medium">NPM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
