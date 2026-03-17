#!/usr/bin/env node
import { Command } from 'commander';
import { intro, outro, text, spinner, select, confirm, isCancel, log } from '@clack/prompts';
import { CliOperator } from './agent/CliOperator';
import { KokoroSpeaker } from './tts';
import fs from 'fs';
import path from 'path';
import os from 'os';

// Use a simple local JSON file for configuration since `conf` broke under ES compilation
const configPath = path.join(os.homedir(), '.macclaw_config.json');

const config = {
    get: (key: string) => {
        try {
            if (fs.existsSync(configPath)) {
                const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                return data[key];
            }
        } catch (e) {
            return undefined;
        }
        return undefined;
    },
    set: (key: string, value: string) => {
        try {
            let data: any = {};
            if (fs.existsSync(configPath)) {
                data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            }
            data[key] = value;
            fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('Failed to save configuration', e);
        }
    }
};

const program = new Command();

program
    .name('macclaw')
    .description('MacClaw CLI - Drive your Mac from the terminal')
    .version('0.1.0');

async function getApiKey() {
    let apiKey = config.get('openRouterApiKey');
    if (!apiKey) {
        intro(`Welcome to MacClaw CLI 🐾`);

        const key = await text({
            message: 'Please enter your OpenRouter API Key to continue:',
            placeholder: 'sk-or-v1-...',
            validate(value) {
                if (value === undefined || value.length === 0) return `Key is required!`;
            },
        });

        if (isCancel(key)) {
            process.exit(0);
        }

        if (key) {
            config.set('openRouterApiKey', key);
            apiKey = key;
        }
    }
    return apiKey;
}

async function getModel() {
    let model = config.get('macclawModel');
    if (!model) {
        const selectedModel = await select({
            message: 'Which vision model would you like MacClaw to use?',
            options: [
                { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet (Recommended - Best Logic)' },
                { value: 'google/gemini-2.5-pro', label: 'Gemini 2.5 Pro (Extremely Fast & Smart)' },
                { value: 'bytedance/ui-tars-1.5-7b', label: 'UI-TARS 7B (Original Local Source)' },
            ],
        });

        if (isCancel(selectedModel)) {
            process.exit(0);
        }

        if (selectedModel) {
            config.set('macclawModel', selectedModel as string);
            model = selectedModel as string;
        }
    }
    return model;
}

program
    .command('chat')
    .description('Start an interactive chat session with MacClaw')
    .action(async () => {
        try {
            let apiKey = await getApiKey();
            if (!apiKey) {
                console.error('API Key is required.');
                process.exit(1);
            }

            let modelName = await getModel();
            if (!modelName) {
                console.error('Model choice is required.');
                process.exit(1);
            }

            intro(`MacClaw CLI is active (${modelName}). Press Ctrl+C to exit.`);

            // Initialize the Operator 
            const operator = new CliOperator();

            // Helper function to dynamically initialize the agent
            let guiAgent: any = null;
            const createAgent = (currentModel: string, currentKey: string, sdk: any) => {
                const modelConfig = {
                    baseURL: 'https://openrouter.ai/api/v1',
                    apiKey: currentKey,
                    model: currentModel,
                    useResponsesApi: false,
                    timeout: 300000
                };

                // Import the system prompt based on V1.5
                // This is a direct inline from src/main/agent/prompts.ts to keep CLI lean
                let systemPrompt = "You are MacClaw, a GUI agent operating on a macOS system via a Command Line Interface (CLI). You are given a task and your action history, with screenshots. You need to perform the next action to complete the task.\n\n" +
                    "## Output Format\n" +
                    "```\n" +
                    "Thought: ...\n" +
                    "Action: ...\n" +
                    "```\n\n" +
                    "## Action Space\n\n" +
                    "click_element(element_description='xxx') # ALWAYS USE THIS action when clicking semantic elements, icons, buttons, or links.\n" +
                    "click(start_box='<|box_start|>(x1,y1)<|box_end|>') # ONLY use this if `click_element` fails or you are clicking empty space.\n" +
                    "left_double(start_box='<|box_start|>(x1,y1)<|box_end|>')\n" +
                    "right_single(start_box='<|box_start|>(x1,y1)<|box_end|>')\n" +
                    "drag(start_box='<|box_start|>(x1,y1)<|box_end|>', end_box='<|box_start|>(x3,y3)<|box_end|>')\n" +
                    "hotkey(key='ctrl c')\n" +
                    "type(content='xxx')\n" +
                    "scroll(start_box='<|box_start|>(x1,y1)<|box_end|>', direction='down or up or right or left')\n" +
                    "bash(command='xxx')\n" +
                    "wait()\n" +
                    "finished()\n" +
                    "call_user()\n\n\n" +
                    "## Note\n" +
                    "- Use English in `Thought` part.\n" +
                    "- Generate a well-defined and practical strategy in the `Thought` section, summarizing your next move and its objective.\n" +
                    "- IMPORTANT: You are running as a CLI tool (`macclaw`) inside a visible terminal window on the user's screen. DO NOT click, type, or interact physically with this terminal window.\n" +
                    "- CRITICAL SELF-AWARENESS: If you see a terminal window on the screen showing 'MacClaw CLI is active' or 'What would you like me to do', that is YOUR OWN PROCESS. Do not attempt to use `type()` or `click()` inside it, as your input will collide with the chat interface. Do not close it either.\n" +
                    "- CRITICAL: When the user asks you to run a terminal command, check a system property, or execute a script, ALWAYS use the `bash(command='')` action. NEVER use `type()` to type commands into the macOS terminal.\n" +
                    "- RUN HEADLESSLY: The `bash` action runs commands implicitly in the background. It returns the `stdout`/`stderr` securely to you in the next step. Do not try to physically open the Terminal app to type commands.\n" +
                    "- DO NOT GUESS COORDINATES for buttons or icons. You are a reasoning model without a grounding grid. ALWAYS use `click_element(element_description='xxx')` to resolve the click location natively.\n";

                try {
                    // Inform Claude of the underlying UI-TARS 1000x1000 coordinate system.
                    // ActionParser explicitly divides by 1000 before mapping to screen dimensions.
                    systemPrompt += `- CRITICAL DISPLAY DIMENSIONS: If you absolutely MUST use standard \`click()\`, your \`start_box\` and \`end_box\` coordinates MUST be exact integers within a 1000x1000 grid boundary.\n`;
                } catch (e) {
                    // Fallback gracefully
                }
                systemPrompt += "\n## User Instruction\n";

                let lastPrintedText = '';

                const agent = new sdk.GUIAgent({
                    model: modelConfig,
                    systemPrompt: systemPrompt,
                    logger: { info: () => { }, error: console.error, warn: () => { } } as any, // Cast to any to silence strict typing on Logger
                    operator: operator,
                    onData: async ({ data }: any) => {
                        const status = data.status === 'runing' ? 'running' : data.status;

                        if (status === 'running') {
                            if (data.conversations && data.conversations.length > 0) {
                                const lastConv = data.conversations[data.conversations.length - 1];
                                if (lastConv && lastConv.from === 'gpt' && lastConv.value && lastConv.value !== lastPrintedText) {
                                    lastPrintedText = lastConv.value;
                                    log.step(`🤖 MacClaw:\n${lastConv.value.trim()}`);

                                    // Extract and speak the Thought section
                                    const thoughtMatch = lastConv.value.match(/Thought:\s*([\s\S]*?)(?=Action:|$)/i);
                                    if (thoughtMatch && thoughtMatch[1]) {
                                        KokoroSpeaker.getInstance().speak(thoughtMatch[1].trim());
                                    }
                                }
                            }
                            s.message('MacClaw is taking action...');
                        } else if (status === 'finished') {
                            s.stop('Task finished.');
                        } else if (status === 'error') {
                            s.stop('Error occurred: ' + (data?.error?.message || 'Unknown error'));
                            console.error(data?.error);
                        } else if (status === 'call_user') {
                            s.stop('MacClaw needs your input.');
                        }
                    },
                    onError: (params: any) => {
                        s.stop('An error occurred. ' + (params?.error?.message || ''));
                        console.error(params?.error);
                    },
                    retry: { model: { maxRetries: 3 }, screenshot: { maxRetries: 3 }, execute: { maxRetries: 1 } },
                    maxLoopCount: 15,
                    loopIntervalInMs: 2000,
                    uiTarsVersion: 'UI-TARS-1.5' as any,
                });

                // Monkey patch the model
                if (agent.model) {
                    const originalInvoke = agent.model.invoke.bind(agent.model);
                    agent.model.invoke = async (params: any) => {
                        const result = await originalInvoke(params);
                        if (result && result.prediction) {
                            // 🐛 HOTFIX: @ui-tars/action-parser has a brittle regex that fails if there
                            // is an immediate newline before OR after `Action:`.
                            // This aggressive normalization ensures the Action block is predictably formatted.
                            result.prediction = result.prediction.replace(/[\s\n]*Action[:：][\s\n]*/g, '\nAction: ');
                        }
                        return result;
                    };

                    // 🐛 HOTFIX: @ui-tars/sdk has a hardcoded 30-second timeout in invokeModelProvider
                    // We override it to use a 10-minute timeout for OpenRouter.
                    const originalInvokeModelProvider = agent.model.invokeModelProvider.bind(agent.model);
                    agent.model.invokeModelProvider = async (uiTarsVersion: any, params: any, options: any, headers: any) => {
                        return originalInvokeModelProvider(uiTarsVersion, params, { ...options, timeout: 600000 }, headers);
                    };
                }

                return agent;
            };

                const sdk = await import('@ui-tars/sdk');
                const s = spinner();
                guiAgent = createAgent(modelName.toString(), apiKey, sdk);

            // Main Interaction Loop
            let running = true;
            while (running) {
                let input = await text({
                    message: 'What would you like me to do on your Mac?',
                    placeholder: 'e.g., Open the calculator and type 55 (type /model, /key or /tts to switch settings)',
                });

                if (isCancel(input)) {
                    running = false;
                    break;
                }

                const trimmedInput = typeof input === 'string' ? input.trim() : '';

                if (trimmedInput.toLowerCase() === 'exit') {
                    running = false;
                    break;
                }
                
                if (trimmedInput.toLowerCase() === '/model') {
                    // Temporarily unset the local config variable to force the prompt to appear
                    const originalModel = config.get('macclawModel');
                    config.set('macclawModel', '');
                    
                    const newModel = await getModel();
                    if (newModel) {
                        modelName = newModel;
                        const sdk = await import('@ui-tars/sdk');
                        guiAgent = createAgent(modelName.toString(), apiKey, sdk);
                        log.success(`Successfully switched vision model to: ${newModel}`);
                    } else if (originalModel) {
                        config.set('macclawModel', originalModel as string);
                    }
                    continue;
                }

                if (trimmedInput.toLowerCase() === '/tts') {
                    const speaker = KokoroSpeaker.getInstance();
                    speaker.enabled = !speaker.enabled;
                    log.success(`TTS ${speaker.enabled ? '🔊 enabled' : '🔇 disabled'}.`);
                    continue;
                }

                if (trimmedInput.toLowerCase() === '/key' || trimmedInput.toLowerCase() === '/api') {
                    const originalKey = config.get('openRouterApiKey');
                    config.set('openRouterApiKey', '');
                    
                    const newKey = await getApiKey();
                    if (newKey) {
                        apiKey = newKey;
                        const sdk = await import('@ui-tars/sdk');
                        guiAgent = createAgent(modelName.toString(), apiKey, sdk);
                        log.success(`Successfully updated OpenRouter API token.`);
                    } else if (originalKey) {
                        config.set('openRouterApiKey', originalKey as string);
                    }
                    continue;
                }

                if (!trimmedInput) {
                    continue; // Skip execution and ask again
                }

                s.start('MacClaw is analyzing your screen...');

                let isExecuting = true;
                const handleSigInt = () => {
                    if (isExecuting && guiAgent) {
                        try {
                            // Try to stop the spinner gracefully
                            s.stop('Action cancelled by user.');
                        } catch (e) {}
                        
                        // Instruct UI-TARS SDK to abort the current loop explicitly
                        try {
                            guiAgent.stop();
                        } catch (e) {}
                        
                        isExecuting = false;
                    }
                };
                
                // Intercept Ctrl+C strictly during execution to avoid crashing the Node process
                process.on('SIGINT', handleSigInt);

                try {
                    await guiAgent.run(trimmedInput, [], {});
                } catch (e: any) {
                    s.stop("Execution stopped: " + e.message);
                } finally {
                    isExecuting = false;
                    process.removeListener('SIGINT', handleSigInt);
                    
                    // Safety check to clear the spinner if the SDK swallowed the error event
                    if (s) {
                        try {
                            s.stop();
                        } catch (e) { }
                    }
                }
            }

            outro('Goodbye!');
        } catch (error) {
            console.error(error);
        }
    });

program.parse();
