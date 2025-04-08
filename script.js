//----------------------------------------------------------------------------------------------------------------------------//
//                                                         VARIABLES                                                          //
//----------------------------------------------------------------------------------------------------------------------------//

const html = document.querySelector('html');
const favicon = document.querySelector('link[type="image/svg+xml"]');
const theme = document.querySelector('.theme');
const main = document.querySelector('main');
const comic = document.querySelector('.comic');
const form = document.querySelector('form');
const label = document.querySelector('label');
const input = document.querySelector('input');

/**
 * Comic data for 404: Not Found
 * {@link https://www.explainxkcd.com/wiki/index.php/404:_Not_Found explain xkcd | 404: Not Found}
 * @see displayComic
 */
const notFound = {
    num: 404,
    title: 'Not Found',
    month: '4',
    day: '1',
    year: '2008',
    img: 'assets/images/not-found.png',
    safe_title: 'Not Found',
    alt: 'Randall has stated that he considers 404 an official, actual comic, albeit a rather avant-garde one, and that for a time he made it possible to find it using the "random" button on xkcd.com.',
    transcript: '[Instead of the regular xkcd site layout, just a white page that states on top center:]\n404 Not Found\n\n[Page-wide divider line]\n\n[Below that in a smaller font:]\nnginx'
};
const colourScheme = window.matchMedia('(prefers-color-scheme: light)');
let isLoading, debounce, currentTheme, currentNum, maxNum;

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
 * Fetch xkcd comic data from API
 * @param   {Number} num xkcd comic number to fetch
 * @throws               Throws an error if fetch fails
 */
async function fetchComic(num) {
    try {
        let data;
        main.dataset.loading = isLoading = true;
        if (num === 404) data = notFound;
        else {
            // https://github.com/Smile4ever/xkcd-api
            const response = !num
                ? await fetch('https://xkcd.now.sh/?comic=latest')
                : await fetch(`https://xkcd.now.sh/?comic=${num}`);
            if (!response.ok) throw `Status: ${response.status} ${response.statusText}`;
            data = await response.json();
            if (!data) throw 'No xkcd comic found!';
        }
        displayComic(data);
    } catch(error) {
        console.error(error);
        main.innerHTML = `
            <div class="error centre" aria-live="polite">
                <h2 class="underline">Error</h2>
                <p>Unable to fetch xkcd comic</p>
                <p>${cleanHTML(error)}</p>
                <div class="new-tab">
                    <a href="https://xkcd.com" target="_blank" rel="noopener noreferrer">xkcd.com</a>
                    <!-- Yandex UI Icons | MPL License | https://iconduck.com/icons/256946/in-new-tab -->
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-label="open in a new tab" role="img" fill="none">
                        <title>New Tab</title>
                        <path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M20 14a1 1 0 0 0-1 1v3.077c0 .459-.022.57-.082.684a.363.363 0 0 1-.157.157c-.113.06-.225.082-.684.082H5.923c-.459 0-.571-.022-.684-.082a.363.363 0 0 1-.157-.157c-.06-.113-.082-.225-.082-.684L4.999 5.5a.5.5 0 0 1 .5-.5l3.5.005a1 1 0 1 0 .002-2L5.501 3a2.5 2.5 0 0 0-2.502 2.5v12.577c0 .76.083 1.185.32 1.627.223.419.558.753.977.977.442.237.866.319 1.627.319h12.154c.76 0 1.185-.082 1.627-.319.419-.224.753-.558.977-.977.237-.442.319-.866.319-1.627V15a1 1 0 0 0-1-1zm-2-9.055v-.291l-.39.09A10 10 0 0 1 15.36 5H14a1 1 0 1 1 0-2l5.5.003a1.5 1.5 0 0 1 1.5 1.5V10a1 1 0 1 1-2 0V8.639c0-.757.086-1.511.256-2.249l.09-.39h-.295a10 10 0 0 1-1.411 1.775l-5.933 5.932a1 1 0 0 1-1.414-1.414l5.944-5.944A10 10 0 0 1 18 4.945z"/>
                    </svg>
                </div>
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
 * @param {String} data.safe_title xkcd comic alt text
 * @param {String} data.alt        xkcd comic img title
 * @param {String} data.transcript xkcd comic transcript (when available)
 */
function displayComic(data) {
    let {num, title: name, month, day, year, img: src, safe_title: alt, alt: title, transcript} = data;
    if (month.length === 1) month = `0${month}`;
    title = title.replaceAll('"', '&quot;');
    comic.innerHTML = cleanHTML(`
        <h2>${num}: ${name}</h2>
        <time datetime="${year}-${month}-${day}" class="underline">${getMonthName(parseInt(month))} ${day}, ${year}</time>
        <div>
            <img src="${src}" alt="${alt}" title="${title}">
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
        main.dataset.loading = isLoading = false;
        document.title = `xkcd | ${name}`;
        if (transcript) console.info(`${num}: ${name}\n\n${transcript}`);
    });
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
 * Handle theme switch and set theme switch icon
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
        <button aria-label="change to ${tooltip} theme" aria-live="polite" id="icon">
            <img src="assets/icons/${icon}.svg" alt="${icon} icon">
        </button>
        <p aria-hidden="true" class="tooltip">${tooltip} theme</p>
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
        if (!isLoading) {
            if (document.activeElement !== input) {
                // ignore if Command or Control key is pressed
                if (event.getModifierState('Meta') || event.getModifierState('Control')) return;
                if (event.key === 'c') fetchComic(maxNum); //undocumented
                else if (event.key === 'p') handlePrev();
                else if (event.key === 'r') handleRandom();
                else if (event.key === 'n') handleNext();
            }
        }
    }, 200);
});

document.addEventListener('visibilitychange', function() {
    const href = document.hidden ? './assets/favicons/x-inactive.svg' : './assets/favicons/x.svg';
    favicon.setAttribute('href', href);
})

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