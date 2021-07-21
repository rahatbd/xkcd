const root = document.querySelector(':root');
const title = document.querySelector('title');
const theme = document.querySelector('.theme');
const loader = document.querySelector('.loader');
const section = document.querySelector('section');
const comic = document.querySelector('.comic');
const buttons = document.querySelectorAll('.buttons button');
const form = document.querySelector('form');
const input = form.querySelector('input');
const label = form.querySelector('p');

// const api = 'http://xkcd.com/info.0.json';
// const proxy = 'https://secure-springs-24728.herokuapp.com/';

const month = { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' };
const lightIcon = `<img src="assets/icons/sunny.svg" alt="light theme" title="light theme" id="light" tabindex="0">`;
const darkIcon = `<img src="assets/icons/half-moon.svg" alt="dark theme" title="dark theme" id="dark" tabindex="0">`;
let themeClass;
let currentNum;
let maxNum;

async function fetchComic(num = '') {
    if (num === 404) {
        currentNum = 404;
        comic.innerHTML = `
            <div>
                <img class="${themeClass}" src="assets/not-found.png" alt="404 Not Found"/>
            </div>
        `;
        return;
    }
    loader.classList.remove('hidden');
    section.classList.add('hidden');
    if (num === '') theme.classList.add('hidden');
    window.removeEventListener('keydown', handleEvent);
    const response = await fetch(`https://secure-springs-24728.herokuapp.com/http://xkcd.com/${num}/info.0.json`);
    const data = await response.json();
    currentNum = data.num;
    if (num === '') maxNum = currentNum;
    displayComic(data);
    // comic.innerHTML = `
    //     <div>
    //         <h2>#${data.num}: ${data.title}</h2>
    //         <p>${month[data.month]} ${data.day}, ${data.year}</p>
    //     </div>
    //     <div>
    //         <img src="${data.img}" alt="${data.alt}"/>
    //     </div>
    // `;
    // form.search.setAttribute('max', `${maxNum}`);
    // form.search.setAttribute('placeholder', `#1 \u2014 ${maxNum}`);
    // const img = comic.querySelector('img');
    // img.addEventListener('load', function() {
    //     loader.classList.add('hidden');
    //     section.classList.remove('hidden');
    // })
    // const iconId = theme.querySelector('img');
    // if (iconId.id === 'light') {
    //     img.classList.add('dark');
    //     img.classList.remove('light');
    // }
    // else if (iconId.id === 'dark') {
    //     img.classList.add('light');
    //     img.classList.remove('dark');
    // }
    // if (data.transcript) {
    //     console.info(`#${data.num}: ${data.title} \n\n${data.transcript}`);
    // }
    // title
    // const title = document.querySelector('title');
    // title.textContent = `xkcd: ${data.title}`;
}

function displayComic(data) {
    comic.innerHTML = `
        <div>
            <h2>#${data.num}: ${data.title}</h2>
            <p>${month[data.month]} ${data.day}, ${data.year}</p>
        </div>
        <div>
            <img src="${data.img}" alt="${data.alt}"/>
        </div>
    `;
    form.search.setAttribute('max', `${maxNum}`);
    form.search.setAttribute('placeholder', `#1 \u2014 ${maxNum}`);
    const iconId = theme.querySelector('img');
    const img = comic.querySelector('img');
    //404
    if (iconId.id === 'light') {
        img.classList.add('dark');
        img.classList.remove('light');
        themeClass = 'dark';
    }
    else if (iconId.id === 'dark') {
        img.classList.add('light');
        img.classList.remove('dark');
        themeClass = 'light';
    }
    img.addEventListener('load', function() {
        loader.classList.add('hidden');
        section.classList.remove('hidden');
        if (theme.classList.contains('hidden')) theme.classList.remove('hidden');
        window.addEventListener('keydown', handleEvent);
    })
    if (data.transcript) {
        console.info(`#${data.num}: ${data.title} \n\n${data.transcript}`);
    }
    title.textContent = `xkcd | ${data.title}`;
}

function handleTheme() {
    const iconId = theme.querySelector('img');
    const img = comic.querySelector('img');
    if (iconId.id === 'light') {
        root.style.setProperty('--background-colour-body', '#f2f2f2');
        root.style.setProperty('--background-colour', '#dddddd');
        root.style.setProperty('--font-colour', '#404040');
        img.classList.add('light');
        img.classList.remove('dark');
        theme.innerHTML = darkIcon;
    }
    else if (iconId.id === 'dark') {
        root.style.setProperty('--background-colour-body', '#404040');
        root.style.setProperty('--background-colour', '#202020');
        root.style.setProperty('--font-colour', '#f2f2f2');
        img.classList.add('dark');
        img.classList.remove('light');
        theme.innerHTML = lightIcon;
    }
}

theme.addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
        handleTheme();
    }
})

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function() {
    const iconId = theme.querySelector('img');
    if (window.matchMedia('(prefers-color-scheme: dark)').matches && iconId.id === 'light') return;
    else if (window.matchMedia('(prefers-color-scheme: light)').matches && iconId.id === 'dark') return;
    else handleTheme();
});

function handleEvent(event) {
    if (event.keyCode === 32 || event.keyCode === 37 || event.keyCode === 39) event.preventDefault();
    if (this.id === 'prev' || event.keyCode === 37) {
        currentNum === 1 ? fetchComic() : fetchComic(currentNum - 1);
    }
    else if (this.id === 'random' || event.keyCode === 32) {
        const randomNum = Math.floor(Math.random() * maxNum) + 1;
        fetchComic(randomNum);
    }
    else if (this.id === 'next' || event.keyCode === 39) {
        currentNum === maxNum ? fetchComic(1) : fetchComic(currentNum + 1);
    }
}

input.addEventListener('focus', function() {
    form.submit.style.marginLeft = '1px';
    // font
    label.textContent = `search comic range: #1 \u2014 ${maxNum}`;
    window.removeEventListener('keydown', handleEvent);
})

input.addEventListener('blur', function () {
    form.submit.style.marginLeft = '0';
    label.textContent = 'search comic';
    window.addEventListener('keydown', handleEvent);
})

form.addEventListener('submit', function(event) {
    event.preventDefault();
    fetchComic(parseInt(form.search.value));
    form.reset();
    form.search.blur();
})

buttons.forEach(button => button.addEventListener('click', handleEvent));
window.addEventListener('keydown', handleEvent);
theme.addEventListener('click', handleTheme);
window.matchMedia('(prefers-color-scheme: dark)').matches ? theme.innerHTML = lightIcon : theme.innerHTML = darkIcon;

// DOMContentLoaded 1945
fetchComic();