import { browser } from '../browser';

/**
 * 
 * @param {String} text 
 * @param {(suggestResult: chrome.omnibox.SuggestResult[])=>void} suggest 
 */
export const handleTextChanged = (text, suggest) => {
    console.log('Text is', text);
    suggest([{
        content: "http://google.com",
        description: `Hello <match>${text}</match>`,
    }])
}
