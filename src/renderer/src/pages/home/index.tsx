/**
 * Copyright (c) 2025 Bytedance, Inc. and its affiliates.
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Send, Monitor, Globe } from 'lucide-react';

import { Operator } from '@main/store/types';
import { useSession } from '../../hooks/useSession';
import {
  checkVLMSettings,
  LocalSettingsDialog,
} from '@renderer/components/Settings/local';
import { sleep } from '@ui-tars/shared/utils';
import { DragArea } from '../../components/Common/drag';
import { Textarea } from '@renderer/components/ui/textarea';
import { Button } from '@renderer/components/ui/button';

const Home = () => {
  const navigate = useNavigate();
  const { createSession } = useSession();
  const [localConfig, setLocalConfig] = useState({
    open: false,
    operator: Operator.LocalComputer,
  });

  const [promptData, setPromptData] = useState('');
  const [activeMode, setActiveMode] = useState<Operator>(
    Operator.LocalComputer,
  );

  /** local click logic start */
  const toLocal = async (operator: Operator) => {
    const session = await createSession(
      promptData ? promptData.slice(0, 50) + '...' : 'New Session',
      {
        operator: operator,
      },
    );

    navigate('/local', {
      state: {
        operator: operator,
        sessionId: session?.id,
        initialPrompt: promptData,
        from: 'home',
      },
    });
  };

  const handleStartRun = async () => {
    if (!promptData.trim()) return;

    const hasVLM = await checkVLMSettings();

    if (hasVLM) {
      toLocal(activeMode);
    } else {
      setLocalConfig({ open: true, operator: activeMode });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey && !e.metaKey && promptData.trim()) {
      e.preventDefault();
      handleStartRun();
    }
  };

  const handleLocalSettingsSubmit = async () => {
    setLocalConfig({ open: false, operator: localConfig.operator });
    await sleep(200);
    await toLocal(localConfig.operator);
  };

  const handleLocalSettingsClose = () => {
    setLocalConfig({ open: false, operator: localConfig.operator });
  };
  /** local click logic end */

  return (
    <div className="w-full h-full flex flex-col relative text-white">
      <DragArea></DragArea>
      <div className="w-full h-full flex flex-col items-center justify-center -mt-20 px-4">
        {/* Animated App Title */}
        <div className="mb-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-br from-white to-white/60 bg-clip-text text-transparent drop-shadow-md">
            MacClaw
          </h1>
          <p className="mt-4 text-white/70 text-lg font-medium">
            AI-powered automation for your entire digital workspace
          </p>
        </div>

        {/* Unified Chat Interface */}
        <div className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150 fill-mode-both">
          {/* Mode Toggle */}
          <div className="flex items-center gap-2 mb-4 ml-2">
            <button
              onClick={() => setActiveMode(Operator.LocalComputer)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeMode === Operator.LocalComputer
                  ? 'bg-white/20 shadow-lg border border-white/30 text-white backdrop-blur-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <Monitor className="w-4 h-4" />
              Computer
            </button>
            <button
              onClick={() => setActiveMode(Operator.LocalBrowser)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activeMode === Operator.LocalBrowser
                  ? 'bg-white/20 shadow-lg border border-white/30 text-white backdrop-blur-md'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
            >
              <Globe className="w-4 h-4" />
              Browser
            </button>
          </div>

          {/* Chat Input Container */}
          <div className="relative w-full glass-panel-heavy rounded-2xl p-1 transition-all duration-300 focus-within:shadow-[0_0_30px_rgba(255,255,255,0.15)] focus-within:border-white/40">
            <Textarea
              placeholder={`What would you like MacClaw to do on your ${activeMode === Operator.LocalComputer ? 'computer' : 'browser'} today?`}
              className="min-h-[140px] w-full resize-none border-0 bg-transparent text-lg placeholder:text-white/40 focus-visible:ring-0 p-4 text-white"
              value={promptData}
              onChange={(e) => setPromptData(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            <div className="absolute right-4 bottom-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition-all duration-300 hover:scale-105"
                onClick={handleStartRun}
                disabled={!promptData.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Suggestions (Optional visual enhancement) */}
          <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-none px-2 opacity-80">
            {activeMode === Operator.LocalComputer ? (
              <>
                <div
                  onClick={() =>
                    setPromptData(
                      'Open system settings and check display resolution',
                    )
                  }
                  className="whitespace-nowrap cursor-pointer text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Open system settings
                </div>
                <div
                  onClick={() =>
                    setPromptData('Open calculator and compute 15% of 850')
                  }
                  className="whitespace-nowrap cursor-pointer text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Calculate a percentage
                </div>
              </>
            ) : (
              <>
                <div
                  onClick={() =>
                    setPromptData(
                      "Search Google for 'latest tech news' and summarize the top 3 articles",
                    )
                  }
                  className="whitespace-nowrap cursor-pointer text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Summarize news
                </div>
                <div
                  onClick={() =>
                    setPromptData(
                      'Go to github.com and search for popular UI frameworks',
                    )
                  }
                  className="whitespace-nowrap cursor-pointer text-xs px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors backdrop-blur-sm"
                >
                  Search GitHub repositories
                </div>
              </>
            )}
          </div>
        </div>

        <LocalSettingsDialog
          isOpen={localConfig.open}
          onSubmit={handleLocalSettingsSubmit}
          onClose={handleLocalSettingsClose}
        />
      </div>
      <DragArea></DragArea>
    </div>
  );
};

export default Home;
