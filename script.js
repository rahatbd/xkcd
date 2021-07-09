const comic = document.querySelector('.comic');
const buttons = document.querySelectorAll('button');

// const api = 'http://xkcd.com/info.0.json';
// const proxy = 'https://secure-springs-24728.herokuapp.com/';

const month = { 1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec' };
let currentNum;
let maxNum;

async function fetchComic(num = '') {
    if (num === 404) {
        comic.innerHTML = `
            <div class="image">
                <img src="https://www.explainxkcd.com/wiki/images/9/92/not_found.png" alt="404 Not Found"/>
            </div>
        `;
        return;
    }
    const response = await fetch(`https://secure-springs-24728.herokuapp.com/http://xkcd.com/${num}/info.0.json`);
    const data = await response.json();
    currentNum = data.num;
    if (num === '') maxNum = currentNum;
    comic.innerHTML = `
        <div>
            <h2>#${data.num}: ${data.title}</h2>
            <p>${month[data.month]} ${data.day}, ${data.year}</p>
        </div>
        <div class="image">
            <img src="${data.img}" alt="${data.alt}"/>
        </div>
    `;
    console.log(data);
}

buttons.forEach(button => button.addEventListener('click', function() {
    if (this.id === 'prev') {
        currentNum === 1 ? fetchComic() : fetchComic(currentNum - 1);
    }
    else if (this.id === 'random') {
        const randomNum = Math.floor(Math.random() * maxNum) + 1;
        fetchComic(randomNum);
    }
    else if (this.id === 'next') {
        currentNum === maxNum ? fetchComic(1) : fetchComic(currentNum + 1);
    }
}))

fetchComic(2485);