const switchContainer = document.getElementById('switch-container');
const letterContainer = document.getElementById('letter-container');
const wordContainer = document.getElementById('word-container');

document.addEventListener('DOMContentLoaded', async () => {
  /*   Getting Letters Json
   ********************************************* */

  let lettersJson = {};
  document.documentElement.classList = 'dark';

  // Fetch the JSON file
  await fetch('lettersJson.json')
    .then((response) => response.json())
    .then((data) => {
      lettersJson = data;
    })
    .catch((error) => {
      console.error('Error loading JSON:', error);
    });

  /*   Menu Functions
   ********************************************* */
  const clearSelectedMenu = () => {
    for (const child of switchContainer.children) {
      child.classList.remove('active');
    }
  };
  // Listening for menu Click and change container accordingly
  for (const child of switchContainer.children) {
    child.addEventListener('click', (e) => {
      clearSelectedMenu();
      e.target.classList.add('active');

      if (e.target.innerText == 'WORDS') {
        wordContainer.style.display = 'block';
        letterContainer.style.display = 'none';
      } else if (e.target.innerText == 'LETTERS') {
        wordContainer.style.display = 'none';
        letterContainer.style.display = 'block';
      }
    });
  }

  let themeButton = document.getElementById('theme-change');
  themeButton.addEventListener('click', (e) => {
    if (document.documentElement.classList[0] == 'dark') {
      document.documentElement.classList = 'light';
      document.documentElement.classList = 'light';
    } else {
      document.documentElement.classList = 'dark';
    }
  });

  /*   Select Letters
   ********************************************* */
  const getLetters = (lettersJson) => {
    let letters = {};
    let hiragana = {};
    let katakana = {};
    for (var [key, value] of Object.entries(lettersJson.hiragana)) {
      hiragana = Object.assign({}, hiragana, value);
    }
    for (var [key, value] of Object.entries(lettersJson.katakana)) {
      katakana = Object.assign({}, katakana, value);
    }

    letters = Object.assign({}, hiragana, katakana);

    return shuffle(letters);
  };

  /*   Display Letters Selection Group
   ********************************************* */

  const toggleLetter = (e) => {
    e.target.classList.toggle('selected');
    let letter = getLetters(lettersJson);

    letter[e.target.innerHTML].show = !letter[e.target.innerHTML].show;
    displayLetterContent(letter);
  };

  const clearAll = (e) => {
    mainGroup = e.target.previousElementSibling.innerText;
    let letters = getLetters(lettersJson);
    for (var [key, value] of Object.entries(lettersJson[mainGroup.toLowerCase()])) {
      for (var [item, ans] of Object.entries(value)) {
        letters[item].show = false;
      }
    }

    const allLetterContainer = Array.from(e.target.parentNode.parentNode.children);
    const group = allLetterContainer.slice(1, allLetterContainer.length);
    group.map((item) => {
      let newArr = Array.from(item.children);
      newArr.map((el) => {
        el.classList.remove('selected');
      });
    });

    displayLetterContent(letters);
  };

  const checkAllGroup = (mainGroup, e) => {
    let letter = getLetters(lettersJson);

    let allSelected = true;
    for (let [key, value] of Object.entries(mainGroup)) {
      if (value.show == false) {
        allSelected = false;
      }
    }

    if (!allSelected) {
      for (var child of e.target.parentNode.children) {
        child.classList.add('selected');
        for (var [key, value] of Object.entries(mainGroup)) {
          letter[key].show = true;
          displayLetterContent(letter);
        }
      }
    } else {
      for (var child of e.target.parentNode.children) {
        child.classList.remove('selected');
        for (var [key, value] of Object.entries(mainGroup)) {
          letter[key].show = false;
          displayLetterContent(letter);
        }
      }
    }

    return mainGroup;
  };

  const displaySelectedLetter = () => {
    for (var type of Object.keys(lettersJson)) {
      const mainGroupContainer = document.getElementById('all-letter-container');

      const mainGroup = document.createElement('div');
      mainGroup.classList.add('main-group');

      const groupTitleContainer = document.createElement('div');
      groupTitleContainer.classList.add('group-title-container');

      const clearButton = document.createElement('div');
      clearButton.classList.add('clear-button');
      clearButton.innerText = 'Clear';
      clearButton.addEventListener('click', clearAll);

      const groupTitle = document.createElement('h3');
      groupTitle.classList.add('group-title');
      groupTitle.innerHTML = type;

      groupTitleContainer.append(groupTitle);
      groupTitleContainer.append(clearButton);

      mainGroupContainer.append(mainGroup);
      mainGroup.append(groupTitleContainer);

      for (var [key, value] of Object.entries(lettersJson[type])) {
        const groupContainer = document.createElement('div');
        groupContainer.classList.add('group-container');
        mainGroup.append(groupContainer);

        const groupName = document.createElement('div');
        groupName.classList.add('group-name');
        groupName.classList.add('selected-letter');
        groupName.classList.add('selected');
        groupName.style.textAlign = 'center';
        groupName.innerHTML = key;

        groupName.addEventListener('click', (e) => {
          let groupType = e.target.parentNode.parentNode.children[0].children[0].innerHTML;
          let groupName = e.target.innerHTML;
          let mainGroup = lettersJson[groupType][groupName];

          checkAllGroup(mainGroup, e);
        });

        groupContainer.append(groupName);

        for (var [key, value] of Object.entries(value)) {
          const selectedLetter = document.createElement('div');
          selectedLetter.classList.add('selected-letter');
          selectedLetter.setAttribute('data-test', value.ans);

          if (value.show) {
            selectedLetter.classList.add('selected');
          }
          selectedLetter.innerHTML = key;
          groupContainer.append(selectedLetter);

          selectedLetter.addEventListener('click', toggleLetter);
        }
      }
    }
  };

  /*  Display Letter Content
   ********************************************* */

  function shuffle(array) {
    // Convert the object to an array of key-value pairs
    const entries = Object.entries(array);

    // Shuffle the array using Fisher-Yates algorithm
    for (let i = entries.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [entries[i], entries[j]] = [entries[j], entries[i]];
    }

    // Convert the shuffled array back to an object
    const shuffledDictionary = Object.fromEntries(entries);

    return shuffledDictionary;
  }

  const addListenerToInputs = (selectedLetters) => {
    let lettersItemContainer = document.getElementById('letter-content');
    const all = Array.from(lettersItemContainer.children);

    all.map((item) => {
      const key = item.children[0].innerText;
      const value = selectedLetters[key].ans;

      item.children[1].addEventListener('input', (e) => {
        if (e.target.value.trim(' ') == value) {
          e.target.classList.add('correct');
          e.target.parentNode.classList.add('correct');
          e.target.parentNode.classList.remove('error');
          e.target.classList.remove('error');
        } else {
          e.target.classList.add('error');
          e.target.parentNode.classList.add('error');
          e.target.parentNode.classList.remove('correct');
          e.target.classList.remove('correct');
        }
        if (e.target.value == '') {
          e.target.classList.remove('error');
          e.target.classList.remove('correct');
          e.target.parentNode.classList.remove('error');
          e.target.parentNode.classList.remove('correct');
        }
      });
    });
  };
  const displayLetterContent = async (shuffledArray) => {
    const letterContent = document.getElementById('letter-content');
    letterContent.innerHTML = '';

    const addLetter = (name, index) => {
      let itemContainer = document.createElement('div');
      itemContainer.classList.add('item-container');
      let key = document.createElement('h3');
      key.innerText = name;

      let inputAns = document.createElement('input');
      inputAns.classList.add('form-input');
      inputAns.size = 1;
      inputAns.type = 'text';

      itemContainer.append(key);
      itemContainer.append(inputAns);
      letterContent.append(itemContainer);
    };

    for (var [key, value] of Object.entries(shuffledArray)) {
      const index = Object.keys(shuffledArray).indexOf(key);
      if (value.show) {
        addLetter(key, index);
      }
    }
    addListenerToInputs(shuffledArray);
  };

  /*   Call Starter Function
   ********************************************* */

  displaySelectedLetter();

  const letters = getLetters(lettersJson);
  displayLetterContent(letters);

  /*   END
   ********************************************* */
});
