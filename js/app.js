import data from './data/preguntas.json' assert { type: 'json' };

// Variables
// -----------------------------------------------------------------------------

let words = []

function $(elementId) {
    return document.getElementById(elementId);
}

function defaultWords() {
    loadWords(data);
    createCircle();
}

function createWords(loadedJson = null, startGame) {
    removeCircle();
    words = [];
    loadWords(loadedJson || data);
    createCircle();

    if (startGame) {
        showControls();
    }
}

function showDefinitionWords(termino) {
    const numDefenitionWords = termino.split(" ").length;
    $("js--wordsNumber").innerHTML = "El término está formado por " + numDefenitionWords + " palabras.";    
}

function loadWords(jsonData) {
    for (const { questionId, letter, introduction, description, solutions } of jsonData.preguntas) {
        let palabra = new Word(questionId, letter, introduction, description, solutions);
        words.push(palabra);
    }
}

function showControls() {
    $("js--ng-controls").classList.add("hidden");
    $("js--question-controls").classList.remove("hidden");
    $("js--close").classList.remove("hidden");
    showDefinition(count);
    countdown();
}

// Functions
// -----------------------------------------------------------------------------
function Word(idNumber, letter, hint, definition, word, correct) {
	this.idNumber = idNumber;
	this.letter = letter;
	this.hint = hint;
	this.definition = definition;
	this.word = word;
	this.correct = null;
}

function createCircle() {
    const circle = $("circle");

    words.forEach(({ letter }) => {
        const li = document.createElement("li");
        li.className = "item";
        li.textContent = letter;

        circle.appendChild(li);
    });
}

function removeCircle() {
    const circle = $("circle");

    // Remove all childs form "circle" element
    while (circle.firstChild) {
        circle.removeChild(circle.firstChild);
    }
}

function showDefinition(pos) {

    $("js--hint").innerHTML = words[pos].hint;
    $("js--definition").innerHTML = words[pos].definition;
    showDefinitionWords(words[pos].word[0]);
}

let correctWords = 0;

function checkAnswer(pos) {
    const userAnswer = $("js--user-answer").value;

    const arrayPalabras = words[pos].word;
    
    if (arrayPalabras.includes(userAnswer.trim().toLowerCase())) {
        words[pos].correct = true;
        document.querySelectorAll(".circle .item")[words[pos].idNumber].classList.add("item--success");
        correctWords++;
        $("js--score").innerHTML = correctWords;
    } else {
        words[pos].correct = false;
        document.querySelectorAll(".circle .item")[words[pos].idNumber].classList.add("item--failure");
    }

    return count++;
}

function pasafrase(pos) {
	const w = words.splice(pos, 1)[0];
	words.push(w);
}

function continuePlaying() {
    if (count !== 25) {
        $("js--user-answer").value = "";
        showDefinition(count);
    } else {
        endGame();
    }
}

let seconds;
let temp;
let timeoutMyOswego;

function countdown() {
    seconds = $('js--timer').innerHTML;
    seconds = parseInt(seconds, 10);
    
    if (seconds == 1) {
        temp = $('js--timer');
        temp.innerHTML = 0;
        endGame();
        return;
    }
    
    seconds--;
    temp = $('js--timer');
    temp.innerHTML = seconds;

    timeoutMyOswego = setTimeout(countdown, 1000);
}

function endGame() {
	clearTimeout(timeoutMyOswego); // Detiene el temporizador

	$('js--question-controls').classList.add('hidden');
	$('js--pa-controls').classList.remove('hidden');
	$('js--end-title').innerHTML = 'Fin de partida!';
	$('js--end-subtitle').innerHTML = showUserScore();
	$('js--close').classList.add('hidden');
}

function showUserScore() {
	let counter = 0;
	for (let i = 0; i < words.length; i++) {
		if (words[i].correct == true) {
			counter++;
		}
	}

	return "Has conseguido un total de " + counter + " acierto" + (counter == 1 ? '' : 's') + '.';
}

// Main Program
// ----------------------------------------------------------------------------- */

// New game
let count = 0; // Counter for answered words

defaultWords();

// Prerender game
$("jsonFileInput").addEventListener("change", function() {
    loadJsonFile();
});

// Prepare game
$("js--new-game").addEventListener("click", function() {
    loadJsonFile(true);
});

// Send the answer
$("js--send").addEventListener("click", function() {
	checkAnswer(count);
	continuePlaying();
});  

// Key bindings for send the answer
$("js--question-controls").addEventListener("keypress", function(event) {
    let key = event.key;
    if (key === "Enter") {
        checkAnswer(count);
        continuePlaying();
    }
});

// Skip the word
$("js--pasafrase").addEventListener("click", function() {
    pasafrase(count);
    continuePlaying();
});

// Key bindings for skip the word
$("js--question-controls").addEventListener("keydown", function(event) {
    let key = event.key;
    if (key === " ") {
        pasafrase(count);
        continuePlaying();
    }
});

// Play again
$("js--pa").addEventListener("click", function() {
    location.reload();
});

// End the game
$("js--close").addEventListener("click", function() {
    endGame();
});

function loadJsonFile(startGame = false) {
    const fileInput = $('jsonFileInput');
    const JsonInput = $('textoJSON');
    
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        const reader = new FileReader();

        reader.onload = function(e) {
            const content = e.target.result;
            JsonInput.innerText = file.name;

            try {
                const jsonData = JSON.parse(content);
                createWords(jsonData, startGame);
            } catch (error) {
                console.error('Error al analizar el archivo JSON:', error);
            }
        };

        reader.readAsText(file);
    } else {
        // If no file was selected, use the JSON you already had by default
        createWords(null, startGame);
        console.warn('Se está utilizando los datos por defecto, ya que no se ha seleccionado un archivo JSON.');
    }
}