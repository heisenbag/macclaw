import { keyboard, Key } from '@computer-use/nut-js';

async function test() {
    console.log("Typing hello...");
    try {
        await keyboard.type("hello");
        console.log("Done typing");
    } catch (err) {
        console.error("Failed to type", err);
    }
}

test();
