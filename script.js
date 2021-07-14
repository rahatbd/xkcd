const comic = document.querySelector('.comic');
const buttons = document.querySelectorAll('button');
const form = document.querySelector('form');
const input = document.querySelector('input[type="search"]');

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
    const response = await fetch(`https://secure-springs-24728.herokuapp.com/http://xkcd.com/${num}/info.0.json`);
    const data = await response.json();
    currentNum = data.num;
    if (num === '') maxNum = currentNum;
    form.search.setAttribute('placeholder', `# 1 \u2014 ${maxNum}`);
    // form.search.setAttribute('pattern', `/^[1-9][0-9]?$|^${maxNum}$/`);
    form.search.setAttribute('title', `# 1 -- ${maxNum}`);
    comic.innerHTML = `
        <div>
            <h2>#${data.num}: ${data.title}</h2>
            <p>${month[data.month]} ${data.day}, ${data.year}</p>
        </div>
        <div>
            <img src="${data.img}" alt="${data.alt}"/>
        </div>
    `;
    // transcript
    console.log(data);
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

function handleSubmit(event) {
    event.preventDefault();
    fetchComic(parseInt(form.search.value));
    form.reset();
}

// input.addEventListener('focus', function() {
//     form.search.setAttribute('value', '# ');
// })

buttons.forEach(button => button.addEventListener('click', handleEvent));
window.addEventListener('keydown', handleEvent);
form.addEventListener('submit', handleSubmit);

// DOMContentLoaded 1945
fetchComic();