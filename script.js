//----------------------------------------------------------------------------------------------------------------------------//
//                                                         VARIABLES                                                          //
//----------------------------------------------------------------------------------------------------------------------------//

const html = document.querySelector('html');
const theme = document.querySelector('.theme');
const main = document.querySelector('main');
const comic = document.querySelector('.comic');
const form = document.querySelector('form');
const label = document.querySelector('label');
const input = document.querySelector('input');

const colourScheme = window.matchMedia('(prefers-color-scheme: light)');
const proxy = 'https://proxy.junocollege.com/';
let loading, debounce, currentTheme, currentNum, maxNum;

//----------------------------------------------------------------------------------------------------------------------------//
//                                                         UTILITIES                                                          //
//----------------------------------------------------------------------------------------------------------------------------//

/**
 * Sanitize an HTML string
 * @author Chris Ferdinandi <chris@gomakethings.com>
 * @copyright Chris Ferdinandi 2021
 * @license MIT
 * {@link https://vanillajstoolkit.com/helpers/cleanhtml cleanHTML.js}
 * @param   {String}            str   The HTML string to sanitize
 * @param   {Boolean}           nodes If true, returns HTML nodes instead of a string
 * @returns {(String|NodeList)}       The sanitized string or nodes
 */
function cleanHTML(str, nodes) {
    /**
     * Convert the string to an HTML document
     * @returns {Node} An HTML document
     */
    function stringToHTML() {
        let parser = new DOMParser();
        let doc = parser.parseFromString(str, 'text/html');
        return doc.body || document.createElement('body');
    }

    /**
     * Remove <script> elements
     * @param {Node} html The HTML
     */
    function removeScripts(html) {
        let scripts = html.querySelectorAll('script');
        for (let script of scripts) {
            script.remove();
        }
    }

    /**
     * Check if the attribute is potentially dangerous
     * @param   {String}  name  The attribute name
     * @param   {String}  value The attribute value
     * @returns {Boolean}       If true, the attribute is potentially dangerous
     */
    function isPossiblyDangerous(name, value) {
        let val = value.replace(/\s+/g, '').toLowerCase();
        if (['src', 'href', 'xlink:href'].includes(name)) {
            if (val.includes('javascript:') || val.includes('data:')) return true;
        }
        if (name.startsWith('on')) return true;
    }

    /**
     * Remove potentially dangerous attributes from an element
     * @param {Node} elem The element
     */
    function removeAttributes(elem) {
        // Loop through each attribute
        // If it's dangerous, remove it
        let atts = elem.attributes;
        for (let {name, value} of atts) {
            if (!isPossiblyDangerous(name, value)) continue;
            elem.removeAttribute(name);
        }
    }

    /**
     * Remove dangerous stuff from the HTML document's nodes
     * @param {Node} html The HTML document
     */
    function clean(html) {
        let nodes = html.children;
        for (let node of nodes) {
            removeAttributes(node);
            clean(node);
        }
    }

    // Convert the string to HTML
    let html = stringToHTML();

    // Sanitize it
    removeScripts(html);
    clean(html);

    // If the user wants HTML nodes back, return them
    // Otherwise, pass a sanitized string back
    return nodes ? html.childNodes : html.innerHTML;
}

/**
 * Convert month number to its short name
 * @param   {Number} monthNum Month number
 * @returns {String}          Month short name
 */
function getMonthName(monthNum) {
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-CA', {month: 'short'});
}

//----------------------------------------------------------------------------------------------------------------------------//
//                                                         METHODS                                                            //
//----------------------------------------------------------------------------------------------------------------------------//

/**
 * Fetch xkcd comic from API (unless 404)
 * @param   {Number} num xkcd comic number to fetch
 * @throws               Throws an error if fetch fails
 * @returns {Void}
 */
async function fetchComic(num) {
    /**
     * {@link https://www.explainxkcd.com/wiki/index.php/404:_Not_Found explain xkcd | 404: Not Found}
     * @see displayComic
     */
    if (num === 404) {
        const data = {
            num: num,
            title: 'Not Found',
            month: '4',
            day: '1',
            year: '2008',
            img: 'assets/images/not-found.png',
            alt: '404 Not Found',
            transcript: '[Instead of the regular xkcd site layout, just a white page that states on top center:]\n404 Not Found\n\n[Page-wide divider line]\n\n[Below that in a smaller font:]\nnginx'
        };
        displayComic(data);
        return;
    }

    try {
        loading = true;
        main.dataset.loading = 'true';
        const response = !num
            ? await fetch(`${proxy}https://xkcd.com/info.0.json`)
            : await fetch(`${proxy}https://xkcd.com/${num}/info.0.json`);
        if (!response.ok) throw `Status: ${response.status} \u2014 ${response.statusText}.`;
        const data = await response.json();
        if (!data) throw 'No xkcd comic found!';
        displayComic(data);
    } catch(error) {
        console.error(error);
        main.innerHTML = `
            <div class="error centre" aria-live="polite">
                <h2>Error</h2>
                <p>${cleanHTML(error)}</p>
                <p>Visit the official <a href="https://xkcd.com" target="_blank" rel="noopener noreferrer">xkcd</a> site.</p>
            </div>
        `;
    }
}

/**
 * Render xkcd comic into the DOM
 * @param {Object} data            xkcd comic data
 * @param {Number} data.num        xkcd comic number
 * @param {String} data.title      xkcd comic title
 * @param {String} data.month      xkcd comic post month
 * @param {String} data.day        xkcd comic post day
 * @param {String} data.year       xkcd comic post year
 * @param {String} data.img        xkcd comic img url
 * @param {String} data.alt        xkcd comic alt text
 * @param {String} data.transcript xkcd comic transcript (when available)
 */
function displayComic(data) {
    let {num, title, month, day, year, img: src, alt, transcript} = data;
    if (month.length === 1) month = `0${month}`;
    comic.innerHTML = cleanHTML(`
        <h2>${num}: ${title}</h2>
        <time datetime="${year}-${month}-${day}">${getMonthName(parseInt(month))} ${day}, ${year}</time>
        <div>
            <img src="${src}" alt="${alt}">
        </div>
    `);

    if (!currentNum) {
        maxNum = num;
        input.max = maxNum;
        input.placeholder = `1 \u2014 ${maxNum}`;
        input.title = `Enter a number between 1 \u2014 ${maxNum}`;
    }

    input.blur();
    form.reset();
    currentNum = num;

    comic.querySelector('img').addEventListener('load', function() {
        loading = false;
        main.dataset.loading = 'false';
        document.title = `xkcd | ${title}`;
        if (transcript) console.info(`${num}: ${title}\n\n${transcript}`);
    })
}

/**
 * Handle Prev button click
 */
function handlePrev() {
    const prevNum = currentNum === 1 ? maxNum : currentNum - 1;
    fetchComic(prevNum);
}

/**
 * Handle Random button click
 */
function handleRandom() {
    const randomNum = Math.floor(Math.random() * maxNum) + 1;
    fetchComic(randomNum);
}

/**
 * Handle Next button click
 */
function handleNext() {
    const nextNum = currentNum === maxNum ? 1 : currentNum + 1;
    fetchComic(nextNum);
}

/**
 * Handle theme switch and set theme icon
 * @param {Event} event The event object
 */
function handleTheme(event) {
    const isClickEvent = typeof event?.target.matches === 'function' && event.target.closest('#icon');
    if (isClickEvent) currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    else currentTheme = colourScheme.matches ? 'light' : 'dark';
    const icon = currentTheme === 'light' ? 'moon' : 'sun';
    const tooltip = icon === 'sun' ? 'Light' : 'Dark';
    html.dataset.theme = currentTheme;
    theme.innerHTML = `
        <button aria-labelledby="tooltip" aria-live="polite" id="icon">
            <img src="assets/icons/${icon}.svg" alt="${icon} icon">
        </button>
        <p id="tooltip">${tooltip} theme</p>
    `;
}

//----------------------------------------------------------------------------------------------------------------------------//
//                                                     EVENT LISTENERS                                                        //
//----------------------------------------------------------------------------------------------------------------------------//

colourScheme.addEventListener('change', handleTheme);

document.addEventListener('click', function(event) {
    if (event.target.closest('#icon')) handleTheme(event);
    else if (event.target.matches('#prev')) handlePrev();
    else if (event.target.matches('#random')) handleRandom();
    else if (event.target.matches('#next')) handleNext();
});

document.addEventListener('keydown', function(event) {
    clearTimeout(debounce);
    debounce = setTimeout(function() {
        if (!loading) {
            if (document.activeElement !== input) {
                if (event.getModifierState('Meta') || event.getModifierState('Control')) return;
                if (event.key === 'c') fetchComic(maxNum); //undocumented
                else if (event.key === 'p') handlePrev();
                else if (event.key === 'r') handleRandom();
                else if (event.key === 'n') handleNext();
            }
        }
    }, 200);
});

input.addEventListener('focus', function() {
    label.textContent = `Search Comic: 1 \u2014 ${maxNum}`;
});

input.addEventListener('blur', function() {
    label.textContent = 'Search Comic';
});

form.addEventListener('submit', function(event) {
    event.preventDefault();
    const searchNum = parseInt(input.value);
    fetchComic(searchNum);
});

//----------------------------------------------------------------------------------------------------------------------------//
//                                                           INITS                                                            //
//----------------------------------------------------------------------------------------------------------------------------//

(function() {
    handleTheme();
    fetchComic();
}());