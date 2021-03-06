$('#title').css('visibility', 'hidden');
let image = document.getElementById('hanger'),
	h3 = document.querySelector('.h3'),
	lastInput = document.querySelector('.search'),
	instructionsBTN = document.querySelector('#instructions-btn'),
	instructText = document.getElementById('instructions-content'),
	posterImage = document.getElementById('posterImage'),
	wordPlace = document.getElementById('wordPlacer'),
	element=document.getElementById('div1'),
	hintContent = document.querySelector('#hint-content')
	unregisterBTN = document.querySelector('#unregisterBTN');
var right = new Audio();
right.src = 'sounds/rightAnswer.mp3';
var wrong = new Audio();
wrong.src = 'sounds/wrongAnswer.mp3';
var winner = new Audio();
winner.src = 'sounds/win.mp3';
var lose = new Audio();
lose.src = 'sounds/lose.mp3';
instructionsBTN.addEventListener('click', loadInstructions);
let word;
let Ptags;
let category;
let diff;
let totalScore;
let userName;
let userEmail;
let userPass;
let userAvatar;
let newUser;
let localData;
let hiddenPass;
let posterSrc;


/*Upon game loading, if session and local strorage are null, default score to 0. If there is a localstorage item with the name avatar, then update total score to the score from local storage. If there is session storage, then update totalScore from session storage*/
if(sessionStorage.getItem('score') === null && localStorage.getItem('score') === null){
totalScore = 0; 
$('#score').text(`Total Score: ${totalScore}`);
}

if(localStorage.getItem('avatar') !== null){
	totalScore = Number(localStorage.getItem('score'));
	$('#score').text(`Total Score: ${totalScore}`);
}

if(localStorage.getItem('avatar') === null){
	totalScore = Number(sessionStorage.getItem('score'));
	$('#score').text(`Total Score: ${totalScore}`);
}

/*If user registers or reloads the game with localstorage, parse data from local storage and change inner HTML of the user data based on local storage values*/
function setUserInfo(){
	localData = JSON.parse(localStorage.getItem('avatar'));
	if(window.innerWidth < 754){
		$('#userName').css('font-size', '0.8rem');
	}
	$('#settingsName').html(`<span class="main-color">Username:   </span>${localData.userName}`);
	$('#settingsEmail').html(`<span class="main-color">Email:   </span>${localData.userEmail}`);
	hiddenPass = localData.userPass.replace(/(\w|\D)/gi, '*');
	$('#settingsPass').html(`<span class="main-color">Password:   </span>${hiddenPass}`);
	$('#userBTN').css('background',`url(/images/avatars/avatar-${localData.userAvatar}.JPG) no-repeat center/cover`);
	$('#userName').text(`${localData.userName}`);
}

/*If there is data in local storage then perform these functions. Remove register button from DOM display. */
if(localStorage.getItem('avatar') !== null){
	setUserInfo();
	showUser();
	$('#register-btn').addClass('d-none');
}

/*animation to minimize(scale down) hangman image upon game completion on wide screens and then maximize(scale up) the gif. will not autoplay until called*/
let minimize = anime({
  targets: 'img#hanger',
  scale: [
    {delay: 100,value: 0.9},
    {delay: 200,value: 0.6},
    {delay: 300,value: 0.3},
    {delay: 400,value: 0.1},
    {delay: 500,value: 0},
],
  duration: 600,
  loop: false,
  autoplay: false,
})


let maximize = anime({
	targets: 'img#hanger',
  scale: [
		{delay: 0,value: 0},
    {delay: 200,value: 0.1},
    {delay: 400,value: 0.3},
    {delay: 600,value: 0.6},
    {delay: 800,value: 0.9},
    {delay: 1000,value: 1},
],
  duration: 1200,
  loop: false,
  autoplay: false,
})



/*animation of title. add the class of letters to each letter in the title. */
var textWrapper = document.querySelector('#title');
textWrapper.innerHTML = textWrapper.textContent.replace(/\S/g, "<span class='letters'>$&</span>");


setTimeout(() => {
	$('#title').css('visibility', 'visible');
	anime.timeline({loop: false})
  .add({
    targets: '.letters',
    scale: [4,1],
    opacity: [0,1],
    translateZ: 0,
    easing: "easeOutExpo",
    duration: 1500,
    delay: (el, i) => 130*i
	});
}, 2000);


	

/*make items responsive depending on if user is signed in or not*/
function responsive(){
	if(window.innerWidth < 754){
	if(localStorage.getItem('avatar') !== null){
			$('#title').css('text-align', 'left');
			$('#score').css('text-align', 'left');
			$('#title').css('font-size', '1.4rem');
			$('#score').css('font-size', '1.2rem');
			$('#userName').css('font-size', '1rem');
			if(window.innerWidth <= 448){
			$('#userName').css('font-size', '0.8rem');
			$('#title').css('font-size', '1.2rem');
			$('#score').css('font-size', '1rem');
			}
		}
		if(localStorage.getItem('avatar') === null){
			$('#title').css('text-align', 'center');
			$('#score').css('text-align', 'center');
			$('#title').css('font-size', '1.6rem');
			$('#score').css('font-size', '1.4rem');
		}
	}
	if(window.innerWidth >= 754){
		$('#title').css('text-align', 'left');
			$('#score').css('text-align', 'left');
			$('#userName').css('font-size', '1.3rem');
	}
}

responsive();
$(window).resize(function() {
	responsive();
	editLetters();
});

let longMovies = ['avatar','batman','frozen','wanted','grease','scream','tarzan','shazam', 'casper','mowgli','hamlet','selena','skyfall'];
let medMovies = ['rocky', 'shrek', 'signs', 'holes', 'hitch', 'mulan', 'frida', 'bambi' , 'alien','joker', 'venom','logan','blade']
let shortMovies = ['bolt','salt', 'babe', 'hulk', 'juno', 'hook', 'jaws', 'antz', 'bean', 'cars', 'hugo', 'thor', 'next'];
let shortShows = ['lucy', 'lost', 'glee', 'ncis','cops','doug','jag','monk','vera','reba','joey','hung','taxi',];
let medShows = ['angel', 'smash', 'skins','bones', 'weeds','awake','suits','arrow','psych','grimm','chuck','bosch', 'house'];
let longShows = ['friends','scrubs', 'dexter','scandal','survivor','jeopardy', 'rugrats','simpsons','matlock','frasier','castle','charmed', 'smurfs'];

/*fetch data from database depending on category. includes error handling for the hint content if we couldnt retrieve data. Use RegEx to replace astericks with the title name if the name of the title is in the hint description. Retrieve image of poster from title name. The only title that doesnt have a poster image from the database is jeopardy so retrieved that poster image from another source*/
function fetchSumm(word){
	let fetchedLink;
	category=='movie'? fetchedLink = `https://api.themoviedb.org/3/search/movie?api_key=740531471cf0f1058187c583604c0c74&query=${word}`: fetchedLink = `https://api.themoviedb.org/3/search/tv?api_key=740531471cf0f1058187c583604c0c74&query=${word}`;
fetch(fetchedLink, {headers: { Accept: 'application/json'}}).then((res)=>{
	if(res.status !== 200){
		hintContent.innerText = "Could not retrieve hint data";
		return;
	}
	res.json().then((data)=>{
		let str = data.results[0].overview;
		var re = new RegExp(word, 'gi');
		hintContent.innerText = str.replace(re, '*******');
		let posterData = data.results[0].backdrop_path;
		word === 'JEOPARDY'? posterSrc ='/images/jeopardy.jpg': posterSrc = `https://image.tmdb.org/t/p/w500${posterData}`;
	})
	}).catch(function(){
		hintContent.innerText = 'Could not retrieve hint data.';
	}
)};

/*depending on category user clicks, we assign values to category. remove category button and display difficulty button*/

$('#tvBTN').on('click', function(){
	category='tv';
	$('#catBTN').css('display', 'none');
	$('#difficultyBTN').removeClass('d-none');
})

$('#movieBTN').on('click', function(){
	category='movie';
	$('#catBTN').css('display', 'none');
	$('#difficultyBTN').removeClass('d-none');
})
/*set difficulty based on button clicked and initiate game by retrieving a film title(word) from categories chosen*/
$('#easyDiff').on('click', function(){
	diff= 'easy';
	getWord();
startGame(word)

})

$('#medDiff').on('click', function(){
	diff= 'med';
	getWord();
	startGame(word)
})

$('#hardDiff').on('click', function(){
	diff= 'hard';
	getWord();
	startGame(word)
})
/*clicking on unregister button  unregisters user*/
$('#unregisterBTN').on('click', function(){
	unRegister();
})
/*clicking on unregister button in the account details screen hides the modal and unregisters user*/
$('#unregisterBTN-2').on('click', function(){
	$('#accountModal').modal('hide');
	unRegister();
})
/*clicking on register button displays register form*/
$('#register-btn').on('click', function(){
	$('#avatarForm').removeClass('d-none');
})
/*toggle revealing of password. Toggle innertext and tooltip. */
$('#revealBTN').on('click', function(){
	if($('#revealBTN').text() === 'Reveal Password'){
		$('#revealBTN').text('Hide Password');
		$('#settingsPass').html(`<span class="main-color">Password:   </span>${localData.userPass}`);
		$('#revealBTN').attr('title', 'Click to Hide Password');
	}
	else if($('#revealBTN').text() === 'Hide Password'){
		$('#revealBTN').text('Reveal Password');
		$('#settingsPass').html(`<span class="main-color">Password:   </span>${hiddenPass}`);
	$('#revealBTN').attr('title', 'Click to Reveal Password');
	}
})
/*display unregister alert and fadeout. */
function unRegister(){
	$('#unregister-alert').removeClass('d-none');
	window.setTimeout(function() {
    $("#unregister-alert").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
}, 2000);
	ridUser();
	responsive()
}

/*When user unregisters, remove user info from DOM. adds register BTN to DOM. If user has a local storage score, take local storage score and set it to session storage and then clear local storage. */
function ridUser(){
	$('#userName').addClass('d-none');
	$("#userBTN").addClass('d-none');
	$('#title-container').removeClass('d-flex');
	$('#register-btn').removeClass('d-none');
	if(localStorage.getItem('score') !== null){
		totalScore = parseInt(localStorage.getItem('score'));
		localStorage.clear();
		sessionStorage.setItem('score', JSON.stringify(totalScore));
	}
	localStorage.clear();
}

/*When user registers, add username and user image to the DOM */
function showUser(){
	$('#userName').removeClass('d-none');
	$("#userBTN").removeClass('d-none');
	$('#title-container').addClass('d-flex');
}


class Avatar{
	constructor(userName, userEmail, userPass, userAvatar){
		this.name = userName;
		this.email = userEmail;
		this.pass = userPass;
		this.avatar = userAvatar;
	}
	setLocal(){
localStorage.setItem('avatar', JSON.stringify({
	userName: this.name,
	userEmail: this.email,
	userPass: this.pass,
	userAvatar: this.avatar
}))
	}
}

/*when user submits form and doesnt choose an avatar, then display error with settimeout. If user does submit complete form, grab values from forms. Create a new instance of the class newUser and set user data to local storage. Display "user added" message with settimeout and then hide form within 4 seconds. Remove register button from DOM. Reset the form. If user has a session score, then grab that score and set it to local storage and clear session storage.*/
document.querySelector('#avatarForm').addEventListener('submit', function (e) {
e.preventDefault();
userName=document.getElementById('name').value;
userEmail=document.getElementById('email').value;
userPass=document.getElementById('password').value;
if(document.querySelector('input[name="avatar"]:checked') === null){
	$('#register-danger').removeClass('d-none');
	window.setTimeout(function() {
    $("#register-danger").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
}, 2000);
	return false;
}
else{
userAvatar=document.querySelector('input[name="avatar"]:checked').id;
	newUser = new Avatar(userName, userEmail, userPass, userAvatar);
	newUser.setLocal();
	setUserInfo();
	showUser();
	$('#register-alert').removeClass('d-none');
	window.setTimeout(function() {
    $("#register-alert").fadeTo(500, 0).slideUp(500, function(){
        $(this).remove(); 
    });
}, 2000);
window.setTimeout(function() {
	$('#registerModal').modal('hide');
}, 4000);
	$('#register-btn').addClass('d-none')
	document.querySelector('#avatarForm').reset();
	responsive();
	if(sessionStorage.getItem('score') !== null){
		totalScore = parseInt(sessionStorage.getItem('score'));
		sessionStorage.clear();
		localStorage.setItem('score', JSON.stringify(totalScore));
	}
}
})

/*choose a random number between 0 to 12. word(film title) is randomly chosen depending on category user chose from the different arrays of films/shows */
function getWord(){
	let rand = Math.floor(Math.random() * 13) + 1;
	if(category=='tv'){
		diff== 'easy'? word = longShows[rand-1].toUpperCase(): diff== 'med'? word = medShows[rand-1].toUpperCase(): word = shortShows[rand-1].toUpperCase();
		}
	else if(category=='movie'){
		diff== 'easy'? word = longMovies[rand-1].toUpperCase(): diff== 'med'? word = medMovies[rand-1].toUpperCase(): word = shortMovies[rand-1].toUpperCase();
		}
	}

/*After a film title is selected randomly, remove difficulty button and register button from DOM. Add hint BTN to DOM add click event. add input to DOM for user to guess letters. Initiate timer. Take word(film title) and create P tags for each letter. Disable any user account BTN's. */
function startGame(word){
	$('#difficultyBTN').addClass('d-none');
	$('#register-btn').addClass('d-none');
	$('#hint-btn').on('click', fetchSumm(word));
	$('#hint-btn').removeClass("d-none");
	$('#input').removeClass('d-none');
	startTimer();
	createP(word);
	disableBTNS();
}
/*When game starts, account setting buttons are disabled */
function disableBTNS(){
	$('#accountSettings').addClass('disabled');
	$('#accountSettings').addClass('disableClick');
	$('#unregisterBTN').addClass('disabled');
	$('#unregisterBTN').addClass('disableClick');
}

/*When game finishes, account setting buttons are reenabled */
function enableBTNS(){
	$('#accountSettings').removeClass('disabled');
	$('#accountSettings').removeClass('disableClick');
	$('#unregisterBTN').removeClass('disabled');
	$('#unregisterBTN').removeClass('disableClick');
}


/*Make film title letters(p tags) responsive on different screen sizes with bootstrap*/
function editLetters(){
if(word){
if(window.innerWidth > 760){
	if(word.length > 6){
		$('#hang').css('font-size', '0.85rem')}
		else if(word.length <= 6){
			$('#hang').css('font-size', '1.1rem')
		}
}
	else if(window.innerWidth <= 760 && window.innerWidth > 449){
		if(word.length < 6){
		$('#hang').css('font-size', '1.1rem')}
		if(word.length >= 6){
			$('#hang').css('font-size', '0.7rem');
		$('p.letter').css('margin', '0.10em');
		$('p.letter').css('padding', '0.5em');
		}
	}
	else if(window.innerWidth <= 449 && window.innerWidth >= 325){
		if(word.length > 6){
			$('#hang').css('font-size', '0.55rem');
		}
		else if(word.length <= 6){
			$('#hang').css('font-size', '0.65rem');
		}
	}
		else if(window.innerWidth < 325){
			if(word.length <= 6){
				$('#hang').css('font-size', '0.65rem');
			}
			if(word.length > 6){
				$('#hang').css('font-size', '0.45rem');
			}
		}
}
}

/*create an array for the letters correctly guessed */
let correctLetters = [];

/*make an XML HttpRequest to the text file in our project which includes game instructions. Change instructions innerText to instructions text we got from response.*/
function loadInstructions (){
	var xhr = new XMLHttpRequest();
	xhr.open('GET', 'text.txt', true);
	xhr.onload = function (){
		instructText.innerText = this.responseText;
	};
	xhr.send();
}


$('#formID').submit(function(e){
	e.preventDefault();
})

/*When user types a letter and presses enter, assign that input value to variable input and clear the input field. User input will be checked through the checker function. */
function search (letter){
	if (event.key === 'Enter') {
		var input = letter.value.toUpperCase();
		lastInput.value = '';
	}
	checker(input);
}

/*Once game starts and a film title is chosen(the variable word), loop through each letter of the title and create a p tag. Add the letter class to each p tag. Add the text of each index of the film title(each letter) to each p tag created. HTML collection Ptags will be argument for addAttribute function*/
function createP (word){
	for (let i = 0; i <= word.length - 1; i++) {
		let tag = document.createElement('p');
		tag.classList.add('letter');
		let text = document.createTextNode(word[i]);
		tag.appendChild(text);
		element.appendChild(tag);
	}
	Ptags = document.getElementsByClassName('letter');
	addAttribute(Ptags);
	editLetters();
}

/*loop through HTML collection Ptags(film letters) and for each index add a class name of that index. set background color of each Ptag to the same color of the text so that the letters are hidden*/
function addAttribute (Ptags){
	for (let i = 0; i < Ptags.length; i++) {
		Ptags[i].classList.add(i);
		Ptags[i].setAttribute('style', 'background-color: palevioletred;');
	}
}

/*Take the user input(guessed letter) as parameter and do error checking. if user inputs more than 1 character, a nonletter or an already chosen letter then give error message depending on type of user error. If the input letter is not included in the film title(word), play the incorrect guess buzzer and pass that input as the argument for the wrongAnswer function. If the input letter is included in the film title(word), loop through the letters in the film title and if the user input is equal to the letter then push the index of that correct letter to the array. Then loop through the array and take each value and find the index of the Ptags at that value and change the color of the text of that Ptag to black so that the correct letter guessed is visible to the user.*/
function checker (input){
	if (input) {
		if (input.length > 1) {
			error('TOO MANY LETTERS');
		} else if (/[a-z]/gi.test(input) === false) {
			error("THAT'S NOT A LETTER");
			return '';
		} else if (h3.innerText.includes(input) || correctLetters.includes(input)) {
			error('LETTER ALREADY CHOSEN');
			return '';
		} else if (!word.includes(input)) {
			wrong.play();
			wrongAnswer(input);
		} else if (word.includes(input)) {
			Ptags = document.getElementsByClassName('letter');
			let arr = [];
			right.play();
			for (let i = 0; i <= word.length; i++) {
				if (word[i] == input) {
					arr.push(i);
				}
			}
			for (let indx of arr) {
				Ptags[indx].setAttribute('style', 'color: black');
				correctLetters.push(Ptags[indx].innerText);
			}
			winChecker(Ptags);
		}}
	}

/*depending on the user input error(for ex. too many characeters or inputting non letters), change the text of the error message to the parameter passed in and display it on the DOM. remove it from the DOM with setTimeout.*/
function error (errorMsg){
	$('#error').text(errorMsg)
	$('#error').removeClass("d-none");
	setTimeout(clearError, 2000);
}

function clearError (){
	$('#error').addClass('d-none');

}

/*if wide screen, add the poster image into the DOM and set the source of the image to the poster source we fetched from the database earlier. Else if smaller that wide screen, display win(or lost) message and replace the hangman image with the poster image from the database*/
function displayPoster(){
	if(window.innerWidth > 760) {
		posterImage.setAttribute('src', posterSrc);
		posterImage.classList.remove("d-none");
	}
	else if(window.innerWidth <= 760){
		$('.win').css('display', 'block');
		image.setAttribute('src', posterSrc);
	}
}

/*When a user guesses a letter not in the film title, take that input and add it to the h3 element with a dash in between each letter. If there are 7 letters in the h3 element then display last try in the DOM. If the h3 element is not at 8 letters yet, call the hang function. If the h3 element reached 8 letters then run loseGame function*/
function wrongAnswer (input){
	h3.innerText += `${input.toUpperCase()} -`;
	if (h3.innerText.match(/\w/gi).length === 7) {
		$('.win').text('Last try!')
		$('.win').css('display', 'block');
	}
	h3.innerText.match(/\w/gi).length === 8? loseGame():hang();
}

/*When a user loses the game, the interval for the timer stops. Input element is removed from the DOM. Play the lose audio. If screen is wide, the hangman image will scale down in size gradually via anime.js and after 2300 ms the hangman image src will be changed and then the GIF will gradually scale up in size. If app isn't on widescreen then "you lost" text will be displayed. The totalScore will be subtracted by 5 points. If there is no local storage, the totalPoints will be added to session storage, else the totalpoints will be added to local storage. */
function loseGame (){
	clearInterval(myTimer);
	$('#input').addClass('d-none');
	lose.play();
	if(window.innerWidth > 760){
		$('.win').css('display', 'none');
		minimize.play();
		setTimeout(() => {
			image.setAttribute('src', 'https://media.giphy.com/media/bkiBOCL34XzYA/giphy.gif');
		}, 2300);
		setTimeout(() => {
			maximize.play();
		}, 2550);
}
displayPoster();
if(window.innerWidth <= 760){
	$('.win').css('color', 'royalblue');
	$('.win').css('display', 'block');
	$('.win').text('YOU LOST! TRY AGAIN!');
}
	showAnswer(word);
	totalScore-=5;
	if(localStorage.getItem('avatar') !== null){
			localStorage.setItem('score', JSON.stringify(totalScore));
		}
	else if(localStorage.getItem('avatar') === null){
			sessionStorage.setItem('score', JSON.stringify(totalScore));
		}
	$('#score').text(`Total Score: ${totalScore}`);
	refresher();
	loadGameBTN();
	enableBTNS();
}


/*Once game is finished, remove the click event for instructions and change instructions button innerHTML to a link to the trivia game. Adjust spacing. */
function loadGameBTN (){
	instructionsBTN.removeEventListener('click', loadInstructions);
	instructionsBTN.removeAttribute("data-toggle");
	instructionsBTN.innerHTML = '<a class="switcher btn btn-primary" data-tooltip="tooltip" title="Click here to play trivia" href="trivia.html" id="triviaBTN">Trivia</a>';
	instructionsBTN.style.height = '3rem';
	instructionsBTN.style.padding = 0;
	window.innerWidth < 500 ? (instructionsBTN.style.height = '4rem') : (instructionsBTN.style.height = '3rem');
}

/*After a user guesses a letter correctly, loop through all the Ptags(letters) and if all of the letters have a black color:
clear interval timer. If window is wide, don't display win text and then gradually down scale the hangman image, then change the hangman image source to the winning GIF and then gradually up scale the winning GIF via anime.JS 
Then display the title poster image. Increase the totalScore based on difficulty.If there is localstorage, set the totalScore to local storage. If not, set the score to sessionstorage. Remove input. */
function winChecker (Ptags){
	let count = 0;
	for (let i = 0; i < word.length; i++) {
		if (Ptags[i].style.color === 'black') {
			count +=1;
		}}
	if (count === word.length) {
		clearInterval(myTimer);
		if(window.innerWidth <=760){
		$('.win').css('color', 'green')
		$('.win').text('YOU WIN!')
		}
		if(window.innerWidth > 760){
			$('.win').css('display', 'none');
		minimize.play();
  setTimeout(() => {
    image.setAttribute('src', 'https://media.giphy.com/media/cOtvwSHKaFK3Ul1VVu/giphy.gif')}, 2300)
	setTimeout(() => {
		maximize.play()}, 2550)
	}

	displayPoster();

		winner.play();
		refresher();
		diff === 'easy'? totalScore+=5: diff === 'med'? totalScore+=10: totalScore+=15
		if(localStorage.getItem('avatar') !== null){
			localStorage.setItem('score', JSON.stringify(totalScore));
		}
		else if(localStorage.getItem('avatar') === null){
			sessionStorage.setItem('score', JSON.stringify(totalScore));
		}
		$('#score').text(`Total Score: ${totalScore}`);
		$('#input').addClass('d-none');
		loadGameBTN();
		enableBTNS();
}
}
/*When a user guesses a letter incorrectly, check how many incorrect guesses there are(based on the length of h3). Change the source of the hangman image based on the counter we are on.*/
function hang (){
	let counter = h3.innerText.match(/\w/gi).length;
	for (let i = 0; i < counter; i++) {
		image.src = `/images/${i + 1}.JPG`;
	}
}
/*When game finishes, play again button is added to the DOM*/
function refresher (){
 $('#refresh').removeClass('d-none');
}

/*When game finishes, loop through all the Ptags(letters) and change the text color to black to reveal all the letters in the film title.*/
function showAnswer (word){
	if(Ptags.length >0){
		Ptags = document.getElementsByClassName('letter');
	for (let i = 0; i <= word.length - 1; i++) {
		Ptags[i].setAttribute('style', 'color: black;');
	}
}}

/*To get the timer running, convert 2 minutes to seconds. updateCountdown function every second via setInterval method. If seconds are less than 10, add a 0 in front of seconds. Decrement time by 1 until it reaches 0. Once countDown reaches 0, loseGame functions runs. */
function startTimer(){
let startingMinutes = 2;
let time = startingMinutes * 60;

let countDown = $('#countdown');
myTimer = setInterval(updateCountdown, 1000);
function updateCountdown (){
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;
	seconds =
			seconds < 10 ? '0' + seconds :
			seconds;
	countDown.html(`${minutes}:${seconds}`)
		time !== 0 ? time-- :
		time;
	if (countDown.html() === '0:00') {
		loseGame();
	}}
}

