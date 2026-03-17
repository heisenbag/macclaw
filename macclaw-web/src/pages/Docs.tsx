import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  Terminal, 
  Book, 
  Cpu, 
  Music, 
  FileText, 
  Settings,
  Menu,
  X,
  Sparkles,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const docSections = [
  {
    title: 'Getting Started',
    links: [
      { id: 'introduction', label: 'Introduction', icon: Book },
      { id: 'quick-start', label: 'Quick Start', icon: Terminal },
    ]
  },
  {
    title: 'Core Features',
    links: [
      { id: 'grounding', label: 'Grounding Architecture', icon: Cpu },
      { id: 'bash', label: 'Robust Bash Engine', icon: FileText },
      { id: 'voice', label: 'On-Device Voice (TTS)', icon: Music },
    ]
  },
  {
    title: 'Reference',
    links: [
      { id: 'commands', label: 'Slash Commands', icon: Sparkles },
      { id: 'config', label: 'Configuration', icon: Settings },
    ]
  }
];

function Docs() {
  const [activeSection, setActiveSection] = useState('introduction');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      {/* Docs Header */}
      <header className="fixed top-0 w-full z-50 px-6 h-16 flex items-center justify-between bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <img src="/logo.png" alt="MacClaw Logo" className="w-6 h-6" />
            <span className="font-bold text-lg tracking-tight font-mono">MacClaw Docs</span>
          </Link>
          <div className="hidden md:flex h-4 w-px bg-white/10"></div>
          <span className="hidden md:inline text-white/30 text-sm font-medium">v0.3.3</span>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/" className="text-sm font-medium text-white/50 hover:text-white transition-colors">Back to Site</Link>
          <button 
            className="md:hidden p-2 text-white/50 hover:text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="flex-1 flex pt-16">
        {/* Sidebar */}
        <aside className={`
          fixed md:sticky top-16 h-[calc(100vh-64px)] w-72 border-r border-white/5 bg-[#080808] z-40 transition-transform duration-300
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <nav className="p-6 space-y-8 overflow-y-auto h-full selection:bg-fuchsia-500/30">
            {docSections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h4 className="text-[11px] font-bold text-white/20 uppercase tracking-[0.2em] px-3">{section.title}</h4>
                <div className="space-y-1">
                  {section.links.map((link) => (
                    <button
                      key={link.id}
                      onClick={() => {
                        setActiveSection(link.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group
                        ${activeSection === link.id 
                          ? 'bg-fuchsia-500/10 text-fuchsia-300 border border-fuchsia-500/20 shadow-[0_0_15px_rgba(217,70,239,0.1)]' 
                          : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'}
                      `}
                    >
                      <link.icon className={`w-4 h-4 ${activeSection === link.id ? 'text-fuchsia-400' : 'text-white/20 group-hover:text-white/40'}`} />
                      {link.label}
                      {activeSection === link.id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0 px-6 py-12 md:px-20 overflow-y-auto selection:bg-fuchsia-500/30">
          <div className="max-w-3xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeSection === 'introduction' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Introduction</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      MacClaw is a 100% native CLI autonomous agent for macOS. Unlike other agents that require a heavy Electron wrapper or a browser extension, MacClaw operates directly in your terminal, leveraging local system APIs for zero-latency execution.
                    </p>
                    <div className="p-6 rounded-2xl bg-gradient-to-br from-fuchsia-500/10 to-transparent border border-fuchsia-500/20">
                      <h3 className="text-fuchsia-300 font-bold mb-2">Designed for Power Users</h3>
                      <p className="text-sm text-white/40">MacClaw is built for developers and automation enthusiasts who want a scriptable, lightweight companion that can handle the heavy lifting of UI interaction without the baggage.</p>
                    </div>
                  </div>
                )}

                {activeSection === 'quick-start' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Quick Start</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      Getting started is as simple as running a single command. No installation required.
                    </p>
                    <div className="space-y-4">
                      <div className="bg-black/40 rounded-xl p-6 border border-white/10 font-mono text-sm group relative">
                         <div className="absolute top-4 right-4 text-white/10 group-hover:text-white/20 transition-colors uppercase text-[10px] font-bold tracking-widest">Command</div>
                         <span className="text-fuchsia-400">$</span> npx macclaw chat
                      </div>
                      <p className="text-sm text-white/40">
                        This command will prompt you for your API key on the first run and store it safely in your keychain.
                      </p>
                    </div>
                  </div>
                )}

                {activeSection === 'grounding' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-indigo-400">Grounding Architecture</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      Native execution requires extreme precision. While high-level reasoning models like Claude 3.5 Sonnet are great at planning, they don't understand your screen's exact pixel grid.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-fuchsia-400" />
                          The Reasoning Layer
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed">Models like Gemini or Claude analyze screenshot descriptions to identify semantic targets (e.g., "The blue login button").</p>
                      </div>
                      <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                        <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-teal-400" />
                          The Action Layer
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed">MacClaw uses <span className="text-teal-300 font-medium whitespace-nowrap">UI-TARS 7B</span> to bridge that intent to physical X/Y coordinates, accounting for Retina scaling and high-DPI displays.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'bash' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Robust Bash Engine</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      MacClaw isn't just a UI agent; it's a powerful shell automation tool. We've reinforced the bash execution engine to handle complex real-world workflows.
                    </p>
                    <ul className="space-y-4">
                      <li className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
                          <Zap className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <h4 className="font-bold">Nullglob & Extglob</h4>
                          <p className="text-sm text-white/40">Wildcards like <code className="text-emerald-300">*.{'{'}jpg,png{'}'}</code> are handled gracefully. If no files match, the command continues instead of crashing the agent loop.</p>
                        </div>
                      </li>
                      <li className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                          <Terminal className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <h4 className="font-bold">Real-time Echo</h4>
                          <p className="text-sm text-white/40">Standard output and error streams are piped directly to your terminal while the agent is running, providing 100% visibility into file operations.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                )}

                {activeSection === 'voice' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-fuchsia-400">On-Device Voice (TTS)</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      Experience the agent's reasoning process through sound. MacClaw features a built-in Text-to-Speech system for complete hands-eyes-free interaction.
                    </p>
                    <div className="p-8 rounded-3xl bg-gradient-to-br from-indigo-500/10 via-fuchsia-500/5 to-transparent border border-white/10 relative overflow-hidden group">
                      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-700"></div>
                      <h3 className="text-2xl font-bold mb-4 flex items-center gap-3">
                        <Music className="w-6 h-6 text-indigo-400" />
                        Powered by Kokoro-82M
                      </h3>
                      <p className="text-white/50 mb-6 leading-relaxed">
                        We use the <span className="text-white font-medium">Kokoro v1.0 ONNX</span> model for 100% local, on-device synthesis. No data ever leaves your machine, and there are zero API costs for speech.
                      </p>
                      <div className="flex items-center gap-3 text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 w-fit px-3 py-1 rounded-full border border-indigo-500/20">
                        TOGGLE WITH /tts
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'commands' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Slash Commands</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      Control the agent's behavior mid-session using lightweight slash commands.
                    </p>
                    <div className="divide-y divide-white/5 border-t border-b border-white/5">
                      <div className="py-6 flex flex-col md:flex-row md:items-center gap-4">
                        <code className="text-fuchsia-400 font-bold text-lg min-w-[120px]">/model</code>
                        <p className="text-white/50 flex-1">Hot-swap the current LLM provider (e.g., switch from GPT-4o to Claude 3.5 Sonnet instantly).</p>
                      </div>
                      <div className="py-6 flex flex-col md:flex-row md:items-center gap-4">
                        <code className="text-teal-400 font-bold text-lg min-w-[120px]">/key</code>
                        <p className="text-white/50 flex-1">Update your OpenRouter API key without restarting the chat session.</p>
                      </div>
                      <div className="py-6 flex flex-col md:flex-row md:items-center gap-4">
                        <code className="text-indigo-400 font-bold text-lg min-w-[120px]">/tts</code>
                        <p className="text-white/50 flex-1">Toggle text-to-speech feedback. Useful for multitasking or accessibility.</p>
                      </div>
                      <div className="py-6 flex flex-col md:flex-row md:items-center gap-4">
                        <code className="text-rose-400 font-bold text-lg min-w-[120px]">/exit</code>
                        <p className="text-white/50 flex-1">Gracefully shut down the agent and save your current configuration.</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === 'config' && (
                  <div className="space-y-6">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8">Configuration</h1>
                    <p className="text-lg text-white/60 leading-relaxed">
                      MacClaw stores your settings locally in a standard JSON format for easy manual adjustment if needed.
                    </p>
                    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded bg-white/10 flex items-center justify-center">
                           <Settings className="w-4 h-4 text-white/40" />
                         </div>
                         <h4 className="font-bold">Configuration Path</h4>
                      </div>
                      <code className="block bg-black px-4 py-3 rounded-lg border border-white/5 text-teal-300">~/.macclaw_config.json</code>
                    </div>
                    <p className="text-sm text-white/30 italic">
                      Note: Your API keys are encrypted at rest using system-default security protocols when possible.
                    </p>
                  </div>
                )}

                {/* Catch-all for missing sections */}
                {!['introduction', 'quick-start', 'grounding', 'bash', 'voice', 'commands', 'config'].includes(activeSection) && (
                  <div className="py-20 text-center space-y-4">
                     <Sparkles className="w-12 h-12 text-white/10 mx-auto" />
                     <h2 className="text-2xl font-bold text-white/40">Documentation in Progress</h2>
                     <p className="text-white/20">This section is being updated for v0.3.3. Check back soon!</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      {/* Docs Footer */}
      <footer className="border-t border-white/5 bg-[#020202] py-8 z-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-white/20 text-xs font-medium font-mono">
            &copy; {new Date().getFullYear()} MacClaw OSS.
          </div>
          <div className="flex gap-6">
            <a href="https://github.com" className="text-white/30 hover:text-white transition-colors text-xs font-medium">GitHub</a>
            <a href="https://www.npmjs.com/package/macclaw" target="_blank" rel="noopener noreferrer" className="text-white/30 hover:text-white transition-colors text-xs font-medium">NPM</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Docs;
