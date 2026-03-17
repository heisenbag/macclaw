import { create } from 'zustand';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@renderer/components/ui/tabs';
import {
  Sparkles,
  MessagesSquare,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';
import { Separator } from '@renderer/components/ui/separator';
import { ScrollArea } from '@renderer/components/ui/scroll-area';

import { VLMSettings } from './category/vlm';
import { ChatSettings } from './category/chat';

interface GlobalSettingsStore {
  isOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;
}

export const useGlobalSettings = create<GlobalSettingsStore>((set) => ({
  isOpen: false,
  openSettings: () => set({ isOpen: true }),
  closeSettings: () => set({ isOpen: false }),
  toggleSettings: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const GlobalSettings = () => {
  const { isOpen, toggleSettings } = useGlobalSettings();

  return (
    <Dialog open={isOpen} onOpenChange={toggleSettings}>
      <DialogContent className="min-w-4/5 xl:min-w-3/5 h-4/5 [&>button:last-child]:hidden glass-panel border border-white/10 text-white">
        <DialogHeader className="hidden">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription className="hidden" />
        </DialogHeader>
        <Tabs defaultValue="vlm" className="w-full gap-6 flex-row">
          <div className="w-60 border-r border-border pr-6">
            <TabsList className="flex flex-col h-fit w-full bg-transparent p-0">
              <TabsTrigger
                value="vlm"
                className="w-full justify-start gap-2 px-2 py-1.5 mb-2 !shadow-none font-normal data-[state=active]:font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover:bg-accent/50"
              >
                <Sparkles strokeWidth={2} />
                OpenRouter Settings
              </TabsTrigger>
              <TabsTrigger
                value="chat"
                className="w-full justify-start gap-2 px-2 py-1.5 mb-2 !shadow-none font-normal data-[state=active]:font-medium data-[state=active]:bg-accent data-[state=active]:text-accent-foreground hover:bg-accent/50"
              >
                <MessagesSquare strokeWidth={2} />
                Chat Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1">
            <TabsContent value="vlm" className="mt-0">
              <ScrollArea className="h-[calc(80vh-48px)]">
                <h2 className="text-xl font-semibold mb-3">OpenRouter Settings</h2>
                <Separator className="mb-4" />
                <VLMSettings autoSave={true} />
              </ScrollArea>
            </TabsContent>

            <TabsContent value="chat" className="mt-0">
              <h2 className="text-xl font-semibold mb-3">Chat Settings</h2>
              <Separator className="mb-4" />
              <ChatSettings />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
