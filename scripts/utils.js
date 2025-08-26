/* ==================== UTILITY FUNCTIONS ==================== */

/* ==================== STRING UTILITIES ==================== */

/**
 * Generate a UUID v4
 */
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Escape HTML characters
 */
function escapeHtml(unsafe) {
    if (typeof unsafe !== 'string') return unsafe;
    
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Unescape HTML characters
 */
function unescapeHtml(safe) {
    if (typeof safe !== 'string') return safe;
    
    return safe
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
}

/**
 * Truncate text to specified length
 */
function truncateText(text, maxLength, suffix = '...') {
    if (typeof text !== 'string') return text;
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - suffix.length).trim() + suffix;
}

/**
 * Capitalize first letter of string
 */
function capitalize(str) {
    if (typeof str !== 'string' || str.length === 0) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert string to kebab-case
 */
function toKebabCase(str) {
    if (typeof str !== 'string') return str;
    
    return str
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[\s_]+/g, '-')
        .toLowerCase();
}

/**
 * Convert string to camelCase
 */
function toCamelCase(str) {
    if (typeof str !== 'string') return str;
    
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+/g, '');
}

/**
 * Remove Persian/Arabic diacritics
 */
function removePersianDiacritics(str) {
    if (typeof str !== 'string') return str;
    
    // Persian/Arabic diacritics unicode range
    return str.replace(/[\u064B-\u0652\u0670\u0640]/g, '');
}

/**
 * Convert Persian/Arabic digits to English
 */
function persianToEnglishDigits(str) {
    if (typeof str !== 'string') return str;
    
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
    const englishDigits = '0123456789';
    
    let result = str;
    
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(persianDigits[i], 'g'), englishDigits[i]);
        result = result.replace(new RegExp(arabicDigits[i], 'g'), englishDigits[i]);
    }
    
    return result;
}

/**
 * Convert English digits to Persian
 */
function englishToPersianDigits(str) {
    if (typeof str !== 'string') return str;
    
    const englishDigits = '0123456789';
    const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
    
    let result = str;
    
    for (let i = 0; i < 10; i++) {
        result = result.replace(new RegExp(englishDigits[i], 'g'), persianDigits[i]);
    }
    
    return result;
}

/* ==================== NUMBER UTILITIES ==================== */

/**
 * Format number with thousands separator
 */
function formatNumber(num, locale = 'fa-IR') {
    if (typeof num !== 'number') return num;
    
    return new Intl.NumberFormat(locale).format(num);
}

/**
 * Format file size in human readable format
 */
function formatFileSize(bytes, locale = 'fa-IR') {
    if (bytes === 0) return '۰ بایت';
    
    const k = 1024;
    const sizes = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    const size = parseFloat((bytes / Math.pow(k, i)).toFixed(2));
    const formattedSize = locale === 'fa-IR' ? englishToPersianDigits(size.toString()) : size;
    
    return `${formattedSize} ${sizes[i]}`;
}

/**
 * Generate random number between min and max
 */
function randomBetween(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Clamp number between min and max
 */
function clamp(num, min, max) {
    return Math.min(Math.max(num, min), max);
}

/**
 * Round number to specified decimal places
 */
function roundTo(num, decimals = 2) {
    return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/* ==================== DATE AND TIME UTILITIES ==================== */

/**
 * Format date in Persian
 */
function formatPersianDate(date, options = {}) {
    if (!(date instanceof Date)) date = new Date(date);
    
    const defaultOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        ...options
    };
    
    return new Intl.DateTimeFormat('fa-IR', defaultOptions).format(date);
}

/**
 * Get relative time in Persian
 */
function getRelativeTime(date, locale = 'fa-IR') {
    if (!(date instanceof Date)) date = new Date(date);
    
    const now = new Date();
    const diff = now - date;
    
    const minute = 60 * 1000;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    const month = day * 30;
    const year = day * 365;
    
    if (diff < minute) {
        return 'همین الان';
    } else if (diff < hour) {
        const minutes = Math.floor(diff / minute);
        return `${englishToPersianDigits(minutes.toString())} دقیقه پیش`;
    } else if (diff < day) {
        const hours = Math.floor(diff / hour);
        return `${englishToPersianDigits(hours.toString())} ساعت پیش`;
    } else if (diff < week) {
        const days = Math.floor(diff / day);
        return `${englishToPersianDigits(days.toString())} روز پیش`;
    } else if (diff < month) {
        const weeks = Math.floor(diff / week);
        return `${englishToPersianDigits(weeks.toString())} هفته پیش`;
    } else if (diff < year) {
        const months = Math.floor(diff / month);
        return `${englishToPersianDigits(months.toString())} ماه پیش`;
    } else {
        const years = Math.floor(diff / year);
        return `${englishToPersianDigits(years.toString())} سال پیش`;
    }
}

/**
 * Convert Gregorian to Persian (Jalali) date
 */
function gregorianToPersian(gYear, gMonth, gDay) {
    const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
    
    if (gMonth > 2) {
        const gy2 = (gYear + 1);
        const days = 365 * gYear + ((gy2 / 4) | 0) - ((gy2 / 100) | 0) + ((gy2 / 400) | 0) - 80 + gDay + g_d_m[gMonth - 1];
    } else {
        const days = 365 * gYear + (((gYear) / 4) | 0) - (((gYear) / 100) | 0) + (((gYear) / 400) | 0) - 80 + gDay + g_d_m[gMonth - 1];
    }
    
    const jYear = -14 + 33 * ((days / 12053) | 0);
    let jDays = days % 12053;
    
    jDays += 1029983 * (((jDays / 1029983) | 0));
    
    if (jDays >= 366) {
        jYear += ((jDays / 365) | 0);
        jDays = jDays % 365;
        if (jDays >= 186) {
            jMonth = 1 + (((jDays - 186) / 30) | 0);
            jDay = 1 + ((jDays - 186) % 30);
        } else {
            jMonth = 1 + ((jDays / 31) | 0);
            jDay = 1 + (jDays % 31);
        }
    }
    
    return {
        year: jYear,
        month: jMonth,
        day: jDay
    };
}

/**
 * Get current Persian date
 */
function getCurrentPersianDate() {
    const now = new Date();
    return gregorianToPersian(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/* ==================== ARRAY UTILITIES ==================== */

/**
 * Remove duplicates from array
 */
function unique(array) {
    return [...new Set(array)];
}

/**
 * Shuffle array using Fisher-Yates algorithm
 */
function shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}

/**
 * Chunk array into smaller arrays
 */
function chunk(array, size) {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
        chunks.push(array.slice(i, i + size));
    }
    return chunks;
}

/**
 * Get random item from array
 */
function randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sort array of objects by property
 */
function sortBy(array, property, direction = 'asc') {
    return array.sort((a, b) => {
        const aValue = getNestedProperty(a, property);
        const bValue = getNestedProperty(b, property);
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

/* ==================== OBJECT UTILITIES ==================== */

/**
 * Deep clone an object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj);
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Get nested property value
 */
function getNestedProperty(obj, path) {
    return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Set nested property value
 */
function setNestedProperty(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((current, key) => {
        if (!(key in current)) current[key] = {};
        return current[key];
    }, obj);
    target[lastKey] = value;
}

/**
 * Check if object is empty
 */
function isEmpty(obj) {
    if (obj == null) return true;
    if (Array.isArray(obj) || typeof obj === 'string') return obj.length === 0;
    return Object.keys(obj).length === 0;
}

/**
 * Merge objects deeply
 */
function deepMerge(target, ...sources) {
    if (!sources.length) return target;
    const source = sources.shift();
    
    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) Object.assign(target, { [key]: {} });
                deepMerge(target[key], source[key]);
            } else {
                Object.assign(target, { [key]: source[key] });
            }
        }
    }
    
    return deepMerge(target, ...sources);
}

/**
 * Check if value is object
 */
function isObject(item) {
    return item && typeof item === 'object' && !Array.isArray(item);
}

/* ==================== FUNCTION UTILITIES ==================== */

/**
 * Debounce function calls
 */
function debounce(func, wait, immediate = false) {
    let timeout;
    
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(this, args);
        };
        
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        
        if (callNow) func.apply(this, args);
    };
}

/**
 * Throttle function calls
 */
function throttle(func, limit) {
    let inThrottle;
    
    return function executedFunction(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Sleep function
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry function with exponential backoff
 */
async function retry(fn, options = {}) {
    const {
        retries = 3,
        delay = 1000,
        backoff = 2,
        maxDelay = 10000
    } = options;
    
    let currentDelay = delay;
    
    for (let i = 0; i <= retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries) throw error;
            
            await sleep(Math.min(currentDelay, maxDelay));
            currentDelay *= backoff;
        }
    }
}

/* ==================== DOM UTILITIES ==================== */

/**
 * Wait for element to exist in DOM
 */
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) return resolve(element);
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

/**
 * Check if element is in viewport
 */
function isInViewport(element, threshold = 0) {
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    return (
        rect.top >= -threshold &&
        rect.left >= -threshold &&
        rect.bottom <= windowHeight + threshold &&
        rect.right <= windowWidth + threshold
    );
}

/**
 * Smooth scroll to element
 */
function scrollToElement(element, options = {}) {
    if (typeof element === 'string') {
        element = document.querySelector(element);
    }
    
    if (!element) return;
    
    const defaultOptions = {
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest',
        ...options
    };
    
    element.scrollIntoView(defaultOptions);
}

/**
 * Get scroll position
 */
function getScrollPosition() {
    return {
        x: window.pageXOffset || document.documentElement.scrollLeft,
        y: window.pageYOffset || document.documentElement.scrollTop
    };
}

/**
 * Set scroll position
 */
function setScrollPosition(x, y, smooth = false) {
    if (smooth) {
        window.scrollTo({
            left: x,
            top: y,
            behavior: 'smooth'
        });
    } else {
        window.scrollTo(x, y);
    }
}

/* ==================== STORAGE UTILITIES ==================== */

/**
 * Enhanced localStorage with JSON support and error handling
 */
const storage = {
    set(key, value, ttl = null) {
        try {
            const item = {
                value: value,
                timestamp: Date.now(),
                ttl: ttl
            };
            localStorage.setItem(key, JSON.stringify(item));
            return true;
        } catch (error) {
            console.error('Storage set error:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return defaultValue;
            
            const parsed = JSON.parse(item);
            
            // Check TTL
            if (parsed.ttl && Date.now() - parsed.timestamp > parsed.ttl) {
                localStorage.removeItem(key);
                return defaultValue;
            }
            
            return parsed.value;
        } catch (error) {
            console.error('Storage get error:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Storage remove error:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Storage clear error:', error);
            return false;
        }
    },
    
    keys() {
        return Object.keys(localStorage);
    },
    
    size() {
        return localStorage.length;
    }
};

/* ==================== VALIDATION UTILITIES ==================== */

/**
 * Validate email address
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL
 */
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Validate API key format
 */
function isValidApiKey(apiKey) {
    // OpenAI API key format: sk-...
    return typeof apiKey === 'string' && apiKey.startsWith('sk-') && apiKey.length >= 20;
}

/**
 * Validate phone number (Persian format)
 */
function isValidPersianPhoneNumber(phone) {
    const phoneRegex = /^(\+98|0)?9\d{9}$/;
    return phoneRegex.test(persianToEnglishDigits(phone));
}

/* ==================== CLIPBOARD UTILITIES ==================== */

/**
 * Copy text to clipboard with fallback
 */
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return true;
        } else {
            // Fallback for older browsers or non-secure contexts
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            
            const result = document.execCommand('copy');
            document.body.removeChild(textArea);
            return result;
        }
    } catch (error) {
        console.error('Copy to clipboard failed:', error);
        return false;
    }
}

/**
 * Read from clipboard
 */
async function readFromClipboard() {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            return await navigator.clipboard.readText();
        }
        return null;
    } catch (error) {
        console.error('Read from clipboard failed:', error);
        return null;
    }
}

/* ==================== FILE UTILITIES ==================== */

/**
 * Read file as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsText(file);
    });
}

/**
 * Read file as data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
    });
}

/**
 * Download data as file
 */
function downloadAsFile(data, filename, mimeType = 'application/octet-stream') {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    URL.revokeObjectURL(url);
}

/**
 * Get file extension
 */
function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
}

/**
 * Get file mime type by extension
 */
function getMimeTypeByExtension(extension) {
    const mimeTypes = {
        'txt': 'text/plain',
        'html': 'text/html',
        'css': 'text/css',
        'js': 'text/javascript',
        'json': 'application/json',
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'svg': 'image/svg+xml',
        'mp3': 'audio/mpeg',
        'mp4': 'video/mp4',
        'zip': 'application/zip'
    };
    
    return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
}

/* ==================== TOKEN ESTIMATION ==================== */

/**
 * Estimate tokens for OpenAI API (rough estimation)
 */
function estimateTokens(text, model = 'gpt-3.5-turbo') {
    if (!text || typeof text !== 'string') return 0;
    
    // Different models have different token calculations
    const tokenMultipliers = {
        'gpt-4': 0.75,  // GPT-4 is more efficient
        'gpt-4-turbo': 0.75,
        'gpt-4o': 0.75,
        'gpt-4o-mini': 0.75,
        'gpt-3.5-turbo': 1.0,
        'o1-preview': 0.75,
        'o1-mini': 0.75
    };
    
    const multiplier = tokenMultipliers[model] || 1.0;
    
    // Persian text typically uses more tokens than English
    // Rough estimation: 1 token ≈ 3-4 characters for Persian text
    const baseTokens = Math.ceil(text.length / 3.5);
    
    // Apply model-specific multiplier
    return Math.ceil(baseTokens * multiplier);
}

/* ==================== ERROR HANDLING ==================== */

/**
 * Create a custom error class
 */
class AppError extends Error {
    constructor(message, code, statusCode = 500, isOperational = true) {
        super(message);
        this.name = this.constructor.name;
        this.code = code;
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Safe JSON parse
 */
function safeJsonParse(jsonString, defaultValue = null) {
    try {
        return JSON.parse(jsonString);
    } catch (error) {
        console.warn('JSON parse error:', error);
        return defaultValue;
    }
}

/**
 * Safe JSON stringify
 */
function safeJsonStringify(obj, defaultValue = '{}') {
    try {
        return JSON.stringify(obj);
    } catch (error) {
        console.warn('JSON stringify error:', error);
        return defaultValue;
    }
}

/* ==================== PERFORMANCE UTILITIES ==================== */

/**
 * Measure execution time
 */
function measureTime(label) {
    const start = performance.now();
    
    return {
        end() {
            const end = performance.now();
            const duration = end - start;
            console.log(`${label}: ${duration.toFixed(2)}ms`);
            return duration;
        }
    };
}

/**
 * Check if code is running in development mode
 */
function isDevelopment() {
    return location.hostname === 'localhost' || 
           location.hostname === '127.0.0.1' ||
           location.protocol === 'file:';
}

/* ==================== BROWSER DETECTION ==================== */

/**
 * Get browser information
 */
function getBrowserInfo() {
    const userAgent = navigator.userAgent;
    const browsers = [
        { name: 'Chrome', pattern: /Chrome\/(\d+)/ },
        { name: 'Firefox', pattern: /Firefox\/(\d+)/ },
        { name: 'Safari', pattern: /Safari\/(\d+)/ },
        { name: 'Edge', pattern: /Edge\/(\d+)/ },
        { name: 'IE', pattern: /MSIE (\d+)/ }
    ];
    
    for (const browser of browsers) {
        const match = userAgent.match(browser.pattern);
        if (match) {
            return {
                name: browser.name,
                version: parseInt(match[1]),
                userAgent: userAgent
            };
        }
    }
    
    return {
        name: 'Unknown',
        version: 0,
        userAgent: userAgent
    };
}

/**
 * Check if browser supports specific features
 */
function checkBrowserSupport() {
    return {
        webSpeech: 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window,
        clipboard: navigator.clipboard && window.isSecureContext,
        serviceWorker: 'serviceWorker' in navigator,
        webWorker: typeof Worker !== 'undefined',
        localStorage: typeof Storage !== 'undefined',
        indexedDB: 'indexedDB' in window,
        fetch: 'fetch' in window,
        promises: typeof Promise !== 'undefined',
        modules: 'noModule' in HTMLScriptElement.prototype
    };
}

/* ==================== EXPORT ALL UTILITIES ==================== */

// Make all functions globally available
if (typeof window !== 'undefined') {
    // String utilities
    window.generateUUID = generateUUID;
    window.escapeHtml = escapeHtml;
    window.unescapeHtml = unescapeHtml;
    window.truncateText = truncateText;
    window.capitalize = capitalize;
    window.toKebabCase = toKebabCase;
    window.toCamelCase = toCamelCase;
    window.removePersianDiacritics = removePersianDiacritics;
    window.persianToEnglishDigits = persianToEnglishDigits;
    window.englishToPersianDigits = englishToPersianDigits;
    
    // Number utilities
    window.formatNumber = formatNumber;
    window.formatFileSize = formatFileSize;
    window.randomBetween = randomBetween;
    window.clamp = clamp;
    window.roundTo = roundTo;
    
    // Date utilities
    window.formatPersianDate = formatPersianDate;
    window.getRelativeTime = getRelativeTime;
    window.gregorianToPersian = gregorianToPersian;
    window.getCurrentPersianDate = getCurrentPersianDate;
    
    // Array utilities
    window.unique = unique;
    window.shuffle = shuffle;
    window.chunk = chunk;
    window.randomItem = randomItem;
    window.sortBy = sortBy;
    
    // Object utilities
    window.deepClone = deepClone;
    window.getNestedProperty = getNestedProperty;
    window.setNestedProperty = setNestedProperty;
    window.isEmpty = isEmpty;
    window.deepMerge = deepMerge;
    window.isObject = isObject;
    
    // Function utilities
    window.debounce = debounce;
    window.throttle = throttle;
    window.sleep = sleep;
    window.retry = retry;
    
    // DOM utilities
    window.waitForElement = waitForElement;
    window.isInViewport = isInViewport;
    window.scrollToElement = scrollToElement;
    window.getScrollPosition = getScrollPosition;
    window.setScrollPosition = setScrollPosition;
    
    // Storage utilities
    window.storage = storage;
    
    // Validation utilities
    window.isValidEmail = isValidEmail;
    window.isValidUrl = isValidUrl;
    window.isValidApiKey = isValidApiKey;
    window.isValidPersianPhoneNumber = isValidPersianPhoneNumber;
    
    // Clipboard utilities
    window.copyToClipboard = copyToClipboard;
    window.readFromClipboard = readFromClipboard;
    
    // File utilities
    window.readFileAsText = readFileAsText;
    window.readFileAsDataURL = readFileAsDataURL;
    window.downloadAsFile = downloadAsFile;
    window.getFileExtension = getFileExtension;
    window.getMimeTypeByExtension = getMimeTypeByExtension;
    
    // Token utilities
    window.estimateTokens = estimateTokens;
    
    // Error handling
    window.AppError = AppError;
    window.safeJsonParse = safeJsonParse;
    window.safeJsonStringify = safeJsonStringify;
    
    // Performance utilities
    window.measureTime = measureTime;
    window.isDevelopment = isDevelopment;
    
    // Browser utilities
    window.getBrowserInfo = getBrowserInfo;
    window.checkBrowserSupport = checkBrowserSupport;
}

// Export for Node.js/modules if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // String utilities
        generateUUID,
        escapeHtml,
        unescapeHtml,
        truncateText,
        capitalize,
        toKebabCase,
        toCamelCase,
        removePersianDiacritics,
        persianToEnglishDigits,
        englishToPersianDigits,
        
        // Number utilities
        formatNumber,
        formatFileSize,
        randomBetween,
        clamp,
        roundTo,
        
        // Date utilities
        formatPersianDate,
        getRelativeTime,
        gregorianToPersian,
        getCurrentPersianDate,
        
        // Array utilities
        unique,
        shuffle,
        chunk,
        randomItem,
        sortBy,
        
        // Object utilities
        deepClone,
        getNestedProperty,
        setNestedProperty,
        isEmpty,
        deepMerge,
        isObject,
        
        // Function utilities
        debounce,
        throttle,
        sleep,
        retry,
        
        // Storage utilities
        storage,
        
        // Validation utilities
        isValidEmail,
        isValidUrl,
        isValidApiKey,
        isValidPersianPhoneNumber,
        
        // File utilities
        readFileAsText,
        readFileAsDataURL,
        downloadAsFile,
        getFileExtension,
        getMimeTypeByExtension,
        
        // Token utilities
        estimateTokens,
        
        // Error handling
        AppError,
        safeJsonParse,
        safeJsonStringify,
        
        // Performance utilities
        measureTime,
        isDevelopment
    };
}
