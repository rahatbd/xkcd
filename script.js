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
let currentNum;
let maxNum;

async function fetchComic(num = '') {
    if (num === 404) {
        currentNum = 404;
        comic.innerHTML = `
            <div>
                <img src="https://www.explainxkcd.com/wiki/images/9/92/not_found.png" alt="404 Not Found"/>
            </div>
        `;
        return;
    }
    loader.classList.remove('hidden');
    section.classList.add('hidden');
    const response = await fetch(`https://secure-springs-24728.herokuapp.com/http://xkcd.com/${num}/info.0.json`);
    const data = await response.json();
    currentNum = data.num;
    if (num === '') maxNum = currentNum;
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
    const img = comic.querySelector('img');
    img.addEventListener('load', function() {
        loader.classList.add('hidden');
        section.classList.remove('hidden');
    })
    // console.info(data.transcript);
    // title
    const title = document.querySelector('title');
    title.textContent = `xkcd: ${data.title}`;
}

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

// DOMContentLoaded 1945
fetchComic();