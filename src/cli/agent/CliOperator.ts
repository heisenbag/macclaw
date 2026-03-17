import { Key, keyboard, screen } from '@computer-use/nut-js';
import {
    type ScreenshotOutput,
    type ExecuteParams,
    type ExecuteOutput,
} from '@ui-tars/sdk/core';
import { NutJSOperator } from '@ui-tars/operator-nut-js';
import screenshot from 'screenshot-desktop';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Reusing log mechanism. Assuming the cli will output direct to console for now
const logger = {
    info: () => { },
    error: console.error,
    debug: () => { }
};

export class CliOperator extends NutJSOperator {
    static MANUAL = {
        ACTION_SPACES: [
            `click(start_box='[x1, y1, x2, y2]')`,
            `left_double(start_box='[x1, y1, x2, y2]')`,
            `right_single(start_box='[x1, y1, x2, y2]')`,
            `drag(start_box='[x1, y1, x2, y2]', end_box='[x3, y3, x4, y4]')`,
            `hotkey(key='')`,
            `type(content='') #If you want to submit your input, use "\\n" at the end of \`content\`.`,
            `scroll(start_box='[x1, y1, x2, y2]', direction='down or up or right or left')`,
            `bash(command='') #Execute a terminal command on the host macOS system.`,
            `wait() #Sleep for 5s and take a screenshot to check for any changes.`,
            `finished()`,
            `call_user() # Submit the task and call the user when the task is unsolvable, or when you need the user's help.`,
        ],
    };

    public async screenshot(): Promise<ScreenshotOutput> {
        try {
            // Create a temporary file path for the screenshot
            const tempImgPath = path.join('/tmp', `macclaw-screenshot-${Date.now()}.png`);

            // Tell screenshot-desktop to output a file
            await screenshot({ filename: tempImgPath });

            const fileBuffer = fs.readFileSync(tempImgPath);
            const base64 = fileBuffer.toString('base64');

            // Get logical width of the screen from nut-js
            const logicalWidth = await screen.width();

            // Get physical width of the image from jimp (to calculate Retina density)
            const Jimp = (await import('jimp')).default as any;
            const img = await Jimp.read(fileBuffer);
            const physicalWidth = img.bitmap.width;

            // Clean up the temp file
            fs.unlinkSync(tempImgPath);

            return {
                base64: base64,
                scaleFactor: physicalWidth / logicalWidth
            };
        } catch (error) {
            logger.error('[screenshot] Failed to grab native screenshot', error);
            // fallback
            return await super.screenshot();
        }
    }

    async execute(params: ExecuteParams): Promise<ExecuteOutput> {
        const { action_type, action_inputs } = params.parsedPrediction;
        const inputs = action_inputs as any;

        // --- RETINA SCALING FIX KEY INSIGHT ---
        // OpenRouter flagship models natively guess physical pixels against the resized screenshot width (e.g. 1265).
        // The internal parser `actionParser.ts` applies `smartResizeFactors` and scales them to `0-1` normalized coordinates perfectly.
        // `NutJSOperator` then calculates `(0-1) * physicalWidth`, resolving the exact physical mouse coordinate.
        // HOWEVER, `NutJSOperator` commands `nut.js` to physically move the mouse without dividing the result down to logical coordinates!
        // This causes the physical coordinate to shoot exponentially past the logical target on Retina Displays (where scale=2).
        // By actively mutating `start_box` values here by dividing them by `scaleFactor`, `NutJSOperator`'s internal resolution logic 
        // mathematically cancels out, naturally commanding `nut.js` to the exact precise logical pixel!

        // The UI-TARS pipeline natively operates on a 1000x1000 grid.
        // It converts 1000x1000 to a 0-1 ratio, which NutJS then multiplies by screenWidth.
        // Since NutJS operates on LOGICAL macOS coordinates but UI-TARS passes the PHYSICAL
        // dimensions of the screenshot, we MUST convert them back to LOGICAL dimensions here.
        if (params.scaleFactor && params.scaleFactor !== 1 && !(params as any)._retinaAdjusted) {
            params.screenWidth = params.screenWidth / params.scaleFactor;
            params.screenHeight = params.screenHeight / params.scaleFactor;
            (params as any)._retinaAdjusted = true;
        }
        // --------------------------
        if (action_type === 'click_element' && inputs?.element_description) {
            try {
                return new Promise<ExecuteOutput>(async (resolve) => {
                    logger.info(`[bridge] Grounding semantic element: "${inputs.element_description}"`);
                
                    // We need a fresh screenshot to ensure UI is up-to-date for the grounding model
                    // The `screenshot` method on this class returns a Promise<ScreenshotOutput>
                    const shot = await this.screenshot();
                    const base64Img = shot.base64;

                    // Attempt to read the OpenRouter API key from the config
                    const homedir = require('os').homedir();
                    const configPath = require('path').join(homedir, '.macclaw_config.json');
                    const fs = require('fs');
                    let apiKey = '';
                    try {
                        if (fs.existsSync(configPath)) {
                            const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
                            apiKey = data['openRouterApiKey'];
                        }
                    } catch(e) {}

                    if (!apiKey) {
                        console.error("[bridge] Missing openRouterApiKey for grounding.");
                        return resolve({ status: 'running', ext: { text: "Error: Missing OpenRouter API Key for click_element grounding." } } as any);
                    }

                    // Fetch specifically from ui-tars 7b to ground the coordinate
                    const groundingPrompt = `You are a GUI grounding model. Find the bounding box for the following element: ${inputs.element_description}. Output ONLY the action: click(start_box='<|box_start|>(x1,y1)<|box_end|>') based on a 1000x1000 scale.`;
                    
                    console.log(`[bridge] Querying bytedance/ui-tars-1.5-7b for exact coordinates...`);
                    try {
                        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                            method: "POST",
                            headers: {
                                "Authorization": `Bearer ${apiKey}`,
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                model: "bytedance/ui-tars-1.5-7b",
                                messages: [
                                    {
                                        role: "user",
                                        content: [
                                            { type: "text", text: groundingPrompt },
                                            { type: "image_url", image_url: { url: `data:image/png;base64,${base64Img}` } }
                                        ]
                                    }
                                ],
                                temperature: 0,
                                max_tokens: 150
                            })
                        });

                        if (!response.ok) {
                            console.error(`[bridge] Grounding request failed: ${response.statusText}`);
                            return resolve({ status: 'running', ext: { text: `Error: Grounding model request failed (${response.statusText})` } } as any);
                        }

                        const data = await response.json();
                        const prediction = data?.choices?.[0]?.message?.content || '';
                        logger.info(`[bridge] Grounded prediction: ${prediction}`);

                        // Extract the start_box from the prediction 
                        // Example prediction: "Action: click(start_box='<|box_start|>(112,55)<|box_end|>')"
                        const boxMatch = prediction.match(/\(([\d.,]+)\)/);
                        if (boxMatch && boxMatch[1]) {
                            const coordsStr = boxMatch[1]; // e.g. "112,55"
                            const parts = coordsStr.split(',');
                            
                            // Because we pass the raw, un-padded base64 image to OpenRouter, UI-TARS
                            // natively predicts coordinates in the exact physical pixel space of that image.
                            // We calculate the physical width of the exact screenshot sent to get the 0-1 ratio.
                            const imgWidth = params.screenWidth * params.scaleFactor;
                            const imgHeight = params.screenHeight * params.scaleFactor;

                            let finalArr = [0, 0, 0, 0];
                            if (parts.length === 2 || parts.length === 4) {
                                // Fallback: if it explicitly followed the 1000x1000 prompt (e.g. due to future provider updates),
                                // it will output exactly 1000 or less, but if the physical screen is large (>1500) and it outputs
                                // something that suspiciously looks like a 1000-scale percentage.
                                let parseX = parseFloat(parts[0]);
                                let parseY = parseFloat(parts[1]);
                                
                                let xRatio = parseX / imgWidth;
                                let yRatio = parseY / imgHeight;
                                
                                // If the model strictly obeyed the 1000x1000 prompt instead of physical pixels
                                if (imgWidth > 1200 && parseX <= 1000 && parseY <= 1000 && !prediction.includes(imgWidth.toString())) {
                                    // It's ambiguous, but if it's < 1000 when physical width is 2880, it might be 1000-scale.
                                    // Wait, if it's actually physical pixel x=500 on a 2880 screen, both math rules overlap.
                                    // Since we tested UI-TARS outputs physical by default, we trust physical first.
                                    // If parseX > 1000, we know for 100% fact it is physical.
                                }

                                finalArr = [xRatio, yRatio, xRatio, yRatio];
                            }

                            // Mutate the command into a standard explicit 'click' string
                            params.parsedPrediction.action_type = 'click';
                            params.parsedPrediction.action_inputs = { start_box: JSON.stringify(finalArr) };
                            
                            // Recursively process this as a native click mathematically now
                            console.log(`[bridge] Grounding complete. Executing native click at ${JSON.stringify(finalArr)}`);
                            const superResult = await this.execute(params);
                            return resolve(superResult);
                        } else {
                            console.error(`[bridge] Could not parse bounding box from: ${prediction}`);
                            return resolve({ status: 'running', ext: { text: `Error: Grounding model failed to locate bounding box for ${inputs.element_description}. Try scrolling or a different description.` } } as any);
                        }
                        
                    } catch (apiErr: any) {
                        console.error(`[bridge] API Error during grounding:`, apiErr);
                        return resolve({ status: 'running', ext: { text: `Error: Grounding API failed: ${apiErr.message}` } } as any);
                    }
                });
            } catch (err: any) {
                console.error(`[bridge] Outer catch error:`, err);
                return { status: 'running', ext: { text: `Error: ${err.message}` } } as any;
            }
        }
        if (action_type === 'bash' && inputs?.command) {
            try {
                logger.info('[device] executing bash command', inputs.command);
                // Use explicit /bin/bash to enable brace expansion and nullglob.
                // nullglob makes unmatched patterns expand to nothing instead of failing.
                const wrappedCommand = `bash -O nullglob -O extglob -c ${JSON.stringify(inputs.command)}`;
                const { stdout, stderr } = await execAsync(wrappedCommand);
                const outputStr = (stdout || '').trim();
                const errStr = (stderr || '').trim();
                
                // Print stdout (primary output) in cyan
                if (outputStr) {
                    console.log(`\n\x1b[36m[Bash Output]:\x1b[0m\n${outputStr}\n`);
                }
                // Print stderr from the command in yellow (warnings, not errors)
                if (errStr) {
                    console.log(`\n\x1b[33m[Bash Info]:\x1b[0m\n${errStr}\n`);
                }

                return { status: 'running', ext: { text: outputStr || errStr || 'Command completed.' } } as any;
            } catch (error: any) {
                // error.stdout and error.stderr may still have useful content
                const stdout = (error.stdout || '').trim();
                const stderr = (error.stderr || '').trim();
                const errorStr = stderr || error.message || String(error);
                // Show stdout even when the exit code was non-zero
                if (stdout) {
                    console.log(`\n\x1b[36m[Bash Output]:\x1b[0m\n${stdout}\n`);
                }
                console.log(`\n\x1b[31m[Bash Error]:\x1b[0m\n${errorStr}\n`);
                return { status: 'running', ext: { text: `${stdout ? stdout + '\n' : ''}Error: ${errorStr}` } } as any;
            }
        }

        // We only need to override type to handle large clipboard injection
        // nut.js doesn't natively handle Mac CMD+V well out of the box so we simulate it
        if (action_type === 'type' && action_inputs?.content) {
            const content = action_inputs.content?.trim();
            const stripContent = content.replace(/\\n$/, '').replace(/\n$/, '');

            // INTERCEPT LOGIC:
            // Since MacClaw runs in a visible terminal, the Vision model often incorrectly tries to physically 
            // type bash commands into its own prompt window rather than using the background `bash` operator.
            // We intercept common bash commands here and forcefully redirect them to child_process execution.
            const bashCommandKeywords = ['sw_vers', 'pwd', 'ls', 'cd', 'echo', 'cat', 'grep', 'npm', 'node', 'npx', 'git', 'system_profiler', 'open'];
            const firstWord = stripContent.split(' ')[0];
            if (bashCommandKeywords.includes(firstWord)) {
                logger.info('[cli-intercept] redirecting typed terminal command to bash executor ->', stripContent);
                try {
                    const { stdout, stderr } = await execAsync(stripContent);
                    const outputStr = (stdout || stderr || '').trim();
                    if (outputStr) {
                        console.log(`\n\x1b[36m[Bash Output (via Intercept)]:\x1b[0m\n${outputStr}\n`);
                    }
                    return { status: 'running', ext: { text: outputStr } } as any;
                } catch (error: any) {
                    const errorStr = error.message || String(error);
                    console.log(`\n\x1b[31m[Bash Error (via Intercept)]:\x1b[0m\n${errorStr}\n`);
                    return { status: 'running', ext: { text: errorStr } } as any;
                }
            }

            logger.info('[device] type via clipboard', content);
            const { default: clipboardy } = await import('clipboardy');

            const originalClipboard = await clipboardy.read();

            await clipboardy.write(stripContent);

            // Simulate CMD/CTRL + V
            // Mac uses 'Super' (Command) for paste, Windows uses 'Control'
            const pasteModifier = process.platform === 'darwin' ? Key.LeftSuper : Key.LeftControl;

            await keyboard.pressKey(pasteModifier, Key.V);
            await new Promise(r => setTimeout(r, 50));
            await keyboard.releaseKey(pasteModifier, Key.V);
            await new Promise(r => setTimeout(r, 50));

            // Restore clipboard
            await clipboardy.write(originalClipboard);

            // If we stripped a newline, we explicitly execute an Enter keypress
            if (content.endsWith('\\n') || content.endsWith('\n')) {
                await keyboard.type(Key.Return);
            }

            // ... the previous hotkey intercept block needs to pass params correctly ...
        } else if (action_type === 'hotkey' || action_type === 'press' || action_type === 'release') {
            const keyStr = action_inputs?.key || action_inputs?.hotkey || '';
            const normalizedKey = keyStr.toLowerCase().trim();

            if (normalizedKey === 'ctrl alt t') {
                logger.info('[cli-intercept] converting linux terminal hotkey to macOS open command');
                try {
                    await execAsync('open -n -a Terminal');
                    return { status: 'running', ext: { text: 'Opened a new macOS Terminal window.' } } as any;
                } catch (e: any) {
                    return { status: 'running', ext: { text: e.message } } as any;
                }
            }

            // Remap Windows/Linux "ctrl c / ctrl v" actions to macOS "cmd c / cmd v"
            if (process.platform === 'darwin' && normalizedKey.includes('ctrl ')) {
                action_inputs.key = normalizedKey.replace('ctrl ', 'cmd ');
                action_inputs.hotkey = normalizedKey.replace('ctrl ', 'cmd ');
            }

            // Let the base NutJSOperator handle the physical keypresses
            params.parsedPrediction.action_inputs = action_inputs;
            const superResult = await super.execute(params);

            // NutJS returns 'END' by default for some logic blocks. 
            // We force 'running' to keep MacClaw looping properly.
            return { status: 'running', ext: (superResult as any)?.ext } as any;
        } else {
            const superResult = await super.execute(params);
            return { status: 'running', ext: (superResult as any)?.ext } as any;
        }
    }
}
