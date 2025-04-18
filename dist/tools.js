"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tools = void 0;
const plot_1 = require("./commands/plot");
let timers = new Map();
const tools = {
    calculate: async (expression) => {
        const sanitizedExpression = expression.replace(/[^0-9+\-*/().]/g, '');
        if (sanitizedExpression !== expression) {
            throw new Error('Invalid characters in expression');
        }
        try {
            return eval(sanitizedExpression);
        }
        catch (error) {
            throw new Error('Invalid mathematical expression');
        }
    },
    // translate: async (text: string, targetLanguage: string): Promise<Object> => {  //hello :"", I will proceed with implementing some commands
    //     const resultDetect = await libreTranslate.detect(text) as string;
    //     return await libreTranslate.translate('Do you speak Russian?', resultDetect, targetLanguage);
    // },
    // search: async (query: string) => {
    //     const options = {
    //         page: 0, 
    //         safe: false, // Safe Search
    //         parse_ads: false, // If set to true sponsored results will be parsed
    //         // additional_params: { 
    //         //     // add additional parameters here, see https://moz.com/blog/the-ultimate-guide-to-the-google-search-parameters and https://www.seoquake.com/blog/google-search-param/
    //         //     hl: 'en' 
    //         // }
    //     }
    //     const response = await googlethis.search(query, options);
    //     return response.knowledge_panel?.description || response.results;
    // },
    executeCode: async (code) => {
        // Implement code execution with proper safety measures
        throw new Error('Not implemented');
    },
    generateImage: async (prompt) => {
        // Implement image generation
        throw new Error('Not implemented');
    },
    sendManual: (topic) => {
        // Implement manual sending
        throw new Error('Not implemented');
    },
    memorySet: (key, value) => {
        // Implement memory storage
        throw new Error('Not implemented');
    },
    memoryRemove: (key) => {
        // Implement memory removal
        throw new Error('Not implemented');
    },
    startTimer: (duration, callback) => {
        const timer = setTimeout(callback, duration);
        const timerId = timers.size + 1; // Simple ID generation
        timers.set(timerId, timer);
        return timer;
    },
    listTimers: () => {
        return Array.from(timers.keys());
    },
    cancelTimer: (timerId) => {
        const timer = timers.get(timerId);
        if (timer) {
            clearTimeout(timer);
            timers.delete(timerId);
        }
    },
    addLink: (url) => {
        // Implement link 
        throw new Error('Not implemented');
    },
    plot: async (data) => {
        // Implement plotting
        return await (0, plot_1.generatePlotImage)([...data.xData], [...data.yData], data.title);
    }
};
exports.tools = tools;
