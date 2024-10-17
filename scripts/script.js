import * as util from './utility.js';
import TTReader from './tooltip.js';
// Enable "Add App" button for Alt1 Browser
A1lib.identifyApp('appconfig.json');

// Set up main constants
const APP_PREFIX = 'harvestHollowHaul';

const SELECTED_CHAT = `${APP_PREFIX}Chat`;
const DATA_STORAGE = `${APP_PREFIX}Data`;
const CHAT_SESSION = `${APP_PREFIX}ChatHistory`;
const TOTALS_PREFIX = `${APP_PREFIX}Totals_`;
const DISPLAY_MODE = `${APP_PREFIX}Display`;

// Themed app color
const COL = [255, 102, 0];

// Additional constants
const appURL = window.location.href.replace('index.html', '');
const appColor = A1lib.mixColor(...COL);
const rgbColor = `rgb(${COL[0]}, ${COL[1]}, ${COL[2]})`;
const showTotals = document.getElementById('show-totals');

// CUSTOM: Tier colors
const blueColor = A1lib.mixColor(5, 103, 174);
const purpleColor = A1lib.mixColor(112, 53, 218);
const goldColor = A1lib.mixColor(248, 181, 23);

// Reward history optimization
let currentList = 0;
const itemsPerList = 25;

// CUSTOM: Source tracking for spoils through tooltips
const ttReader = new TTReader;
ttReader.farTooltip = true;
ttReader.trackinactive = true;
ttReader.tracking = true;
ttReader.maxw = 500;
ttReader.offsetx = 10;
let delay = alt1.captureInterval < 300 ? alt1.captureInterval : 300;

const spoils = [
  { id: 'basic-phosphosseous', text: 'Basic Phosphosseous Totals', storage: `${APP_PREFIX}Basic_Phosphosseous_spoils` },
  { id: 'basic-skaraxxi', text: 'Basic Skaraxxi Totals', storage: `${APP_PREFIX}Basic_Skaraxxi_spoils` },
  { id: 'basic-solak-o-lantern', text: 'Basic Solak-o\'-lantern Totals', storage: `${APP_PREFIX}Basic_Solak-o'-lantern_spoils` },
  { id: 'impressive-phosphosseous', text: 'Impressive Phosphosseous Totals', storage: `${APP_PREFIX}Impressive_Phosphosseous_spoils` },
  { id: 'impressive-skaraxxi', text: 'Impressive Skaraxxi Totals', storage: `${APP_PREFIX}Impressive_Skaraxxi_spoils` },
  { id: 'impressive-solak-o-lantern', text: 'Impressive Solak-o\'-lantern Totals', storage: `${APP_PREFIX}Impressive_Solak-o'-lantern_spoils` },
  { id: 'prestigious-phosphosseous', text: 'Prestigious Phosphosseous Totals', storage: `${APP_PREFIX}Prestigious_Phosphosseous_spoils` },
  { id: 'prestigious-skaraxxi', text: 'Prestigious Skaraxxi Totals', storage: `${APP_PREFIX}Prestigious_Skaraxxi_spoils` },
  { id: 'prestigious-solak-o-lantern', text: 'Prestigious Solak-o\'-lantern Totals', storage: `${APP_PREFIX}Prestigious_Solak-o'-lantern_spoils` }
];

const spoilsRegex = /Open\s(.*?\sspoils)/;
let currentSpoils = 'bag of spoils';
let overlayColor = appColor;
// Default titlebar state
util.setTitleBar('Currently not tracking any spoils.', 'icon', 'icon', 'No spoils detected');
// Clear titlebar on reload/exit
$(window).bind('beforeunload', () => {
  util.setTitleBar('', null, null, '');
});

function startTrack() {
  ttReader.track((state) => {
    if (state) {
      let tooltip = state.readInteraction();
      let text = tooltip.text;
      if (debugChat) {
        console.log('Tooltip:', text);
      }
      const match = text.match(spoilsRegex);
      if (match) {
        if (currentSpoils === match[1].trim()) {
          return;
        }
        alt1.overLayClearGroup('tracking');
        currentSpoils = match[1].trim();
        const width = Math.round(alt1.rsWidth / 2);
        // Set overlay color and titlebar based on the type of spoils
        const spoilsType = /(B.*|I.*|P.*)\s(Ph.*|Sk.*|So.*)\sspoils/;
        const typeMatch = currentSpoils.match(spoilsType);
        if (typeMatch[1] === 'Basic') overlayColor = blueColor;
        else if (typeMatch[1] === 'Impressive') overlayColor = purpleColor;
        else if (typeMatch[1] === 'Prestigious') overlayColor = goldColor;
        // Update the titlebar with current spoils type icons
        util.setTitleBar(`Tracking: ${currentSpoils}`, typeMatch[1], typeMatch[2]);
        // Set overlay text and rectangle for tooltip
        alt1.overLaySetGroup('tracking');
        alt1.overLayTextEx(`Tracking: ${currentSpoils}`, overlayColor, 24, width, 100, 1000, 'Arial', true, true);
        alt1.overLayRect(overlayColor, state.area.x - 2, state.area.y - 2, state.area.width + 4, state.area.height + 4, 1000, 2);
      }
    }
  }, delay);
}
A1lib.on('alt1pressed', () => {
  // Toggle tooltip reading in debug mode
  if (debugChat) {
  ttReader.tracking ? ttReader.stopTrack() : startTrack();
  }
});
// TODO: Titlebar img + title. function?
let debugChat = false;
// Set Chat reader
let reader = new Chatbox.default();
reader.readargs = {
  colors: [
    A1lib.mixColor(30, 255, 0), // Main/very common reward color (green)
    A1lib.mixColor(102, 152, 255), // Common reward color (blue)
    A1lib.mixColor(163, 53, 238), // Uncommon reward color (purple)
    A1lib.mixColor(255, 128, 0), // Rare reward color (orange)
    blueColor, // Basic spoils (blue)
    purpleColor,// Impressive spoils (purple)
    goldColor, // Prestigious spoils (gold)
    appColor, // Dark orange text
  ],
  backwards: true,
};

// Setup main storage variables
util.createLocalStorage(DATA_STORAGE);
let saveData = util.getLocalStorage(DATA_STORAGE) || [];
util.createSessionStorage(CHAT_SESSION);
let saveChatHistory = util.getSessionStorage(CHAT_SESSION) || [];
if (!util.getLocalStorage(DISPLAY_MODE)) util.setLocalStorage(DISPLAY_MODE, 'history');

// CUSTOM: Setup additional storage variables
let clanGoodieBags = parseInt(util.getLocalStorage(`${APP_PREFIX}ClanGoodieBags`)) || 0;
let maizeMaze = parseInt(util.getLocalStorage(`${APP_PREFIX}MaizeMaze`)) || 0;

// CUSTOM: Setup storage variables for spoils - reworked
let basic1 = parseInt(util.getLocalStorage(spoils[0].storage)) || 0;
let basic2 = parseInt(util.getLocalStorage(spoils[1].storage)) || 0;
let basic3 = parseInt(util.getLocalStorage(spoils[2].storage)) || 0;
let impressive1 = parseInt(util.getLocalStorage(spoils[3].storage)) || 0;
let impressive2 = parseInt(util.getLocalStorage(spoils[4].storage)) || 0;
let impressive3 = parseInt(util.getLocalStorage(spoils[5].storage)) || 0;
let prestigious1 = parseInt(util.getLocalStorage(spoils[6].storage)) || 0;
let prestigious2 = parseInt(util.getLocalStorage(spoils[7].storage)) || 0;
let prestigious3 = parseInt(util.getLocalStorage(spoils[8].storage)) || 0;

let bagsOfSpoils = basic1 + basic2 + basic3 + impressive1 + impressive2 + impressive3 + prestigious1 + prestigious2 + prestigious3;

// Find all visible chatboxes on screen
if (!window.alt1) {
  $('#item-list').html(`<p style="padding-inline:1em">Alt1 not detected. <a href='alt1://addapp/${appURL}appconfig.json'>Click here to add the app to Alt1</a></p>`);
} else {
  $('#item-list').html('<p style="padding-inline:1em">Searching for chatboxes...</p>');
}
window.addEventListener('load', function () {
  if (window.alt1) {
    reader.find();
    reader.read();
    startTrack();
  }
})


let findChat = setInterval(function () {
  // Check if localStorage for bagsOfSpoils exist, return if it does
  if (localStorage.getItem(`${APP_PREFIX}BagsOfSpoils`) !== null) {
    console.log('reset?')
    $('#item-list').html(
      '<p style="padding-inline:1rem;font-size:1.2rem">There have been breaking changes! Please click settings, optionally export to csv, and then hit factory reset.</p>'
    );
    util.setLocalStorage(DISPLAY_MODE, 'history')
    return 
  }
  if (!window.alt1) {
    clearInterval(findChat);
    return;
  }
  if (reader.pos === null)
    reader.find();
  else {
    clearInterval(findChat);
    reader.pos.boxes.map((box, i) => {
      $('.chat').append(`<option value=${i}>Chat ${i}</option>`);
    });
    const selectedChat = localStorage.getItem(SELECTED_CHAT);
    if (selectedChat) {
      reader.pos.mainbox = reader.pos.boxes[selectedChat];
    } else {
      // If multiple boxes are found, this will select the first, which should be the top-most chat box on the screen
      reader.pos.mainbox = reader.pos.boxes[0];
      localStorage.setItem(SELECTED_CHAT, 0);
    }
    showSelectedChat(reader.pos);
    // Build table from saved data, start tracking
    showItems();
    setInterval(function () {
      readChatbox();
    }, 300);
  }
}, 1000);

function showSelectedChat(chat) {
  // Attempt to show a temporary rectangle around the chatbox, skip if overlay is not enabled
  try {
    alt1.overLaySetGroup('chatbox');
    alt1.overLayRect(
      appColor,
      chat.mainbox.rect.x,
      chat.mainbox.rect.y,
      chat.mainbox.rect.width,
      chat.mainbox.rect.height,
      2000,
      5
    );
  } catch { }
}

// Reading and parsing info from the chatbox
function readChatbox() {
  let opts = reader.read() || [];
  let chat = '';
  // CUSTOM: Ignore currency pouch
  const ignoreLine = /\[\d+:\d+:\d+\] The following has been added to your currency pouch: \d+ x Spooky tokens\.\s?/g;
  for (let a in opts) {
    chat += opts[a].text.replace(',', '') + ' ';
  }
  chat = chat.replace(ignoreLine, '');
  // DEBUG: See chat and opts in console
  if (debugChat) {
    if (chat.trim().length > 0) {
      console.log('Chat:', chat);
      console.table(opts);
    }
  }
  // Check if the chat message contains any of the following strings
  const found = [
    chat.indexOf('You open the clan goodie bag') > -1,
    chat.indexOf('You open the bag of spoils') > -1,
    chat.indexOf('While skilling you find') > -1,
    chat.indexOf('You receive:') > -1,
  ];

  const foundBag = found[0] || found[1];
  const foundSkilling = found[2];
  const foundSpoils = found[3];
  if (found.includes(true)) {
    if (foundBag) {
      const regex = /(\[\d+:\d+:\d+\]) You open the (clan goodie bag|bag of spoils)\.? and receive: \s?((?:\1 \d+[ x ]?[\w\s'\-!()\d]+ ?)+)/g
      const itemRegex = /\[\d+:\d+:\d+\] (\d+)\s*x?\s*([\w\s'\-!()\d]*)/g;
      const rewardRegex = new RegExp(regex.source);
      const rewards = chat.match(regex);
      let counter = null;

      rewards.forEach((reward) => {
        const newReward = reward.match(rewardRegex);
        let source = newReward[2];
        const items = newReward[3].match(itemRegex);
        switch (source) {
          case 'bag of spoils':
            counter = `${APP_PREFIX}${currentSpoils.replace(/ /g, '_')}`;
            source = currentSpoils;
            break;
          case 'clan goodie bag':
            counter = `${APP_PREFIX}ClanGoodieBags`;
            break;
        }
        saveMultipleItems(items, itemRegex, source, counter);
      });
    } 
    if (foundSkilling) {
      const regex = /\[\d+:\d+:\d+\] While skilling you find: (\d+ x )?((?:[\w\s()]+)*)/g;
      const rewards = chat.match(regex);
      rewards.forEach((reward) => {
      saveSingleItem(reward, regex, 'skilling');
      });
    } 
    if (foundSpoils) {
      const regex = /\[\d+:\d+:\d+\] You receive: (\d x )?((?:[\w\s()]+))/g;
      const rewards = chat.match(regex);
      let counter = `${APP_PREFIX}MaizeMaze`;
         
      const addCount = rewards.map((reward) => {
        return reward.replace(/You receive: /, 'You receive: 1 x ');
      });
   
      saveMultipleItems(addCount, regex, 'maize maze', counter);
    }
  }
}

// Save single item
function saveSingleItem(match, regex, source, counter) {
  if (counter && !saveChatHistory.includes(match.trim())) {
    increaseCounter(counter);
  }

  saveItem(regex, match, source);
}

// In case of possible multiple items, save them all
function saveMultipleItems(match, regex, source, counter) {
  const filtered = filterItems(match, regex);
  const alreadySaved = filtered.some(item => saveChatHistory.includes(item.trim()));

  if (counter && !alreadySaved) {
    increaseCounter(counter);
  }
  filtered.forEach((item) => {
    saveItem(regex, item, source)
  });
}

// Add together all items of the same type
function filterItems(items, regex) {
  // Adjust regex to remove any flags
  const cleanRegex = new RegExp(regex.source);
  const filteredItemsMap = items.reduce((acc, itemString) => {
    const match = itemString.match(cleanRegex);
    if (match) {
      const itemName = match[2].trim();
      const quantityMatch = match[1] ? match[1].match(/\d+/) : ['1'];
      const quantity = parseInt(quantityMatch[0], 10);

      if (acc[itemName]) {
        acc[itemName] += quantity;
      } else {
        acc[itemName] = quantity;
      }
    }
    return acc;
  }, {});

  // Then, create a new array with updated quantities for each item
  const updatedItemsArray = items.map(itemString => {
    const match = itemString.match(cleanRegex);
    if (match) {
      const itemName = match[2].trim();
      const totalQuantity = filteredItemsMap[itemName];
      // Replace the quantity in the original string
      return itemString.replace(/(?: x (\d+))|(?:(\d+) x )|(\d+)\s+/, (match, group1, group2, group3) => {
        const digit = group1 || group2 || group3;
        if (debugChat) {
          console.debug('group1', group1, 'group2', group2, 'group3', group3);
          console.log('Replaced:',digit, totalQuantity, match.replace(digit, totalQuantity));
        }
        return match.replace(digit, totalQuantity);
      });
    }
    return itemString;
  });
  // Update the saveChatHistory with the original item that was modified
  items.forEach(item => {
    if (!updatedItemsArray.includes(item) && !saveChatHistory.includes(item.trim())) {
      saveChatHistory.push(item.trim());
    }
  });
  return updatedItemsArray;
}

// Function to increase the counter in local storage
function increaseCounter(counter) {
  let num = parseInt(localStorage.getItem(counter)) || 0;
  num += 1;
  localStorage.setItem(counter, num);
  // Trigger event to update the counter variable -> see bottom part of the script
  const options = {
    key: counter,
    oldValue: JSON.stringify(num - 1),
    newValue: JSON.stringify(num)
  }
  dispatchEvent(new StorageEvent('storage', options));
}

function saveItem(regex, item, src) {
  // Adjust regex to remove any flags
  const cleanRegex = new RegExp(regex.source);
  if (saveChatHistory.includes(item.trim())) {
    console.debug('Duplicate:', item.trim());
    return;
  }
  saveChatHistory.push(item.trim());
  util.setSessionStorage(CHAT_SESSION, saveChatHistory);

  const reward = item.match(cleanRegex);
  const date = new Date();

  const itemName = reward[2].trim();
  const itemAmount = !reward[1] ? 1 : reward[1].match(/\d+/);
  const itemSource = src || APP_PREFIX;
  const itemTime = date.toISOString();

  const getItem = {
    item: `${itemAmount} x ${itemName}`,
    source: itemSource,
    time: itemTime
  };
  console.log(getItem);
  saveData.push(getItem);
  util.setLocalStorage(DATA_STORAGE, saveData);
  // Trigger event to update the saveData and trigger showItems() -> see bottom part of the script
  const options = {
    key: DATA_STORAGE,
    oldValue: JSON.stringify(saveData.slice(-1)),
    newValue: JSON.stringify(saveData)
  }
  dispatchEvent(new StorageEvent('storage', options));
}

// Function to determine the total of all items recorded
function getTotal(source) {
  let total = {};
  saveData.forEach(item => {
    if (item.source.includes(source) || source === undefined) {
      const data = item.item.split(' x ');
      total[data[1]] = parseInt(total[data[1]]) + parseInt(data[0]) || parseInt(data[0])
    }
  })
  return total;
}


// Function to display totals on top of the list
function displayTotal(text, total) {
  $('#item-list').append(`<li style="color:${rgbColor}">${text}: <strong>${total}</strong></li>`);
}
// Function to append items to the list below
function appendItems(items) {
  // Remove the load more button if it exists to prevent it floating in the middle of the list
  if ($('#load-more').length !== 0) {
    $('#load-more').remove();
  }

  items.forEach(item => {
    $('#item-list').append(`<li title="From: ${item.source} @ ${util.formatDateTime(item.time)}">${item.item}</li>`);
  });

}
// Function to create a list of all items and their totals
function createList(total, type) {
  if (type === 'history') {
    const start = currentList * itemsPerList;
    const end = start + itemsPerList;
    const itemsToShow = [...saveData].reverse().slice(start, end);

    if (end < saveData.length) {
      appendItems(itemsToShow);

      // Create the load more button (again)
      $('#item-list').append('<button id="load-more" class="nisbutton nissmallbutton" type="button">Load More</button>');
      $('#load-more').on('click', function () {
        currentList++;
        createList(total, type);
      });
    } else {
      const remaining = saveData.length - start;
      if (remaining > 0) {
        const remainingItems = saveData.reverse().slice(start, start + remaining);
        appendItems(remainingItems);
      }
    }
  } else {
    Object.keys(total).sort().forEach(item => {
      $('#item-list').append(`<li>${item}: ${total[item].toLocaleString()}</li>`);
    });
  }
}

function showItems() {
  let display = util.getLocalStorage(DISPLAY_MODE) || 'history';
  let total = getTotal();
  let text = 'Total Rewards';
  let type = null;

  if (display !== 'history') {
    $('#item-list').empty();
    currentList = 0;
  } else if (currentList === 0) {
    $('#item-list').empty();
  }

  // TODO: Change layout with tabs, so this code can be removed
  switch (display) {
    case 'total': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="bag-of-spoils" title="Click to show all Bag of Spoils Totals">Reward Item Totals</li>`);
    }
      break;
    case 'history': {
      if (currentList === 0) {
        $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Reward History</li>`);
      }
      type = 'history';
    }
      break;
    // CUSTOM: Additional displays for custom sources
    case 'bag-of-spoils': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="clan-goodie-bag" title="Click to show all Clan Goodie Bag Totals">Bag of Spoils Reward Totals</li>`);
      total = getTotal('spoils');
      text = 'Bags of Spoils Opened';
    }
      break;
    case 'clan-goodie-bag': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="maize-maze" title="Click to show all Maize Maze Totals">Clan Goodie Bag Drop Totals</li>`);
      total = getTotal('clan goodie bag');
      text = 'Clan Goodie Bags Opened';
    }
      break;
    case 'maize-maze': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="skilling" title="Click to show all Skilling Totals">Maize Maze Totals</li>`);
      total = getTotal('maize maze');
      text = 'Maize Maze Completed';
    }
      break;
    case 'skilling': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="history" title="Click to show the Reward History">Skilling Totals</li>`);
      total = getTotal('skilling');
      text = 'Skilling Rewards Found';
    }
      break;
    // CUSTOM: Additional displays for all individual spoils
    case 'basic-phosphosseous': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Basic Phosphosseous');
      text = 'Basic Phosphosseous Totals';
    }
      break;
    case 'basic-skaraxxi': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Basic Skaraxxi');
      text = 'Basic Skaraxxi Totals';
    }
      break;
    case 'basic-solak-o-lantern': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Basic Solak-o\'-lantern');
      text = 'Basic Solak-o\'-lantern Totals';
    }
      break;
    case 'impressive-phosphosseous': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Impressive Phosphosseous');
      text = 'Impressive Phosphosseous Totals';
    }
      break;
    case 'impressive-skaraxxi': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Impressive Skaraxxi');
      text = 'Impressive Skaraxxi Totals';
    }
      break;
    case 'impressive-solak-o-lantern': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Impressive Solak-o\'-lantern');
      text = 'Impressive Solak-o\'-lantern Totals';
    }
      break;
    case 'prestigious-phosphosseous': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Prestigious Phosphosseous');
      text = 'Prestigious Phosphosseous Totals';
    }
      break;
    case 'prestigious-skaraxxi': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Prestigious Skaraxxi');
      text = 'Prestigious Skaraxxi Totals';
    }
      break;
    case 'prestigious-solak-o-lantern': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="total" title="Click to show all Reward Totals">Right-click to switch display</li>`);
      total = getTotal('Prestigious Solak-o\'-lantern');
      text = 'Prestigious Solak-o\'-lantern Totals';
    }
      break;
  }

  if (showTotals.checked) {
    let totalRewards = 0;
       
    switch (display) {
      case "total":
      case "history":
        totalRewards = saveData.length;
        break;
      // CUSTOM: Additional totals for custom sources
      case "bag-of-spoils":
        totalRewards = bagsOfSpoils;
        break;
      case "clan-goodie-bag":
        totalRewards = clanGoodieBags;
        break;
      case "maize-maze":
        totalRewards = maizeMaze;
        break;
      case "skilling":
        let skillingRewards = saveData.filter(item => item.source === 'skilling');
        totalRewards = skillingRewards.length;
        break;
      // CUSTOM: Additional totals for all individual spoils
      case "basic-phosphosseous":
        totalRewards = basic1;
        break;
      case "basic-skaraxxi":
        totalRewards = basic2;
        break;
      case "basic-solak-o-lantern":
        totalRewards = basic3;
        break;
      case "impressive-phosphosseous":
        totalRewards = impressive1;
        break;
      case "impressive-skaraxxi":
        totalRewards = impressive2;
        break;
      case "impressive-solak-o-lantern":
        totalRewards = impressive3;
        break;
      case "prestigious-phosphosseous":
        totalRewards = prestigious1;
        break;
      case "prestigious-skaraxxi":
        totalRewards = prestigious2;
        break;
      case "prestigious-solak-o-lantern":
        totalRewards = prestigious3;
        break;
    }

    displayTotal(text, totalRewards);
  }

  createList(total, type);
}

// Create content for CSV
function createExportData(type) {
  let str = 'Item,Qty\n';
  let total = getTotal();
  switch (type) {
    case 'total':
      break;
    case 'history':
      str = 'Item,Source,Date,Time\n';
      break;
    // CUSTOM: Additional exports for custom sources
    case 'bag-of-spoils':
      total = getTotal('spoils');
      break;
    case 'clan-goodie-bag':
      total = getTotal('clan goodie bag');
      break;
    case 'maize-maze':
      total = getTotal('maize maze');
      break;
    case 'skilling':
      total = getTotal('skilling');
      break;
    // CUSTOM: Additional exports for all individual spoils
    case 'basic-phosphosseous':
      total = getTotal('Basic Phosphosseous');
      break;
    case 'basic-skaraxxi':
      total = getTotal('Basic Skaraxxi');
      break;
    case 'basic-solak-o-lantern':
      total = getTotal('Basic Solak-o\'-lantern');
      break;
    case 'impressive-phosphosseous':
      total = getTotal('Impressive Phosphosseous');
      break;
    case 'impressive-skaraxxi':
      total = getTotal('Impressive Skaraxxi');
      break;
    case 'impressive-solak-o-lantern':
      total = getTotal('Impressive Solak-o\'-lantern');
      break;
    case 'prestigious-phosphosseous':
      total = getTotal('Prestigious Phosphosseous');
      break;
    case 'prestigious-skaraxxi':
      total = getTotal('Prestigious Skaraxxi');
      break;
    case 'prestigious-solak-o-lantern':
      total = getTotal('Prestigious Solak-o\'-lantern');
      break;
    // End custom
    default: {
      console.warn('Display mode:', util.getLocalStorage(DISPLAY_MODE));
      throw new Error('Unknown display mode');
    }
  }

  if (type === 'history') {
    saveData.forEach((item) => {
      str += `${item.item},${item.source},${util.formatDateTime(item.time)}\n`;
    });
  } else {
    Object.keys(total).sort().forEach(item => str += `${item},${total[item]}\n`);
  }
  return str;
}

// Event listeners

$(function () {

  // Changing which chatbox to read
  $('.chat').change(function () {
    reader.pos.mainbox = reader.pos.boxes[$(this).val()];
    showSelectedChat(reader.pos);
    localStorage.setItem(SELECTED_CHAT, $(this).val());
    $(this).val('');
  });

  // Export current overview to CSV-file
  $('.export').click(function () {
    const exportDate = new Date();
    const downloadDate = util.formatDownloadDate(exportDate);
    const display = util.getLocalStorage(DISPLAY_MODE);
    const csv = createExportData(display);
    let fileName;

    switch (display) {
      case 'total':
        fileName = `${APP_PREFIX}TotalExport_${downloadDate}.csv`;
        break;
      case 'history':
        fileName = `${APP_PREFIX}HistoryExport_${downloadDate}.csv`;
        break;
      // CUSTOM: Additional exports names for custom sources
      case 'bag-of-spoils':
        fileName = `${APP_PREFIX}BagOfSpoilsTotalExport_${downloadDate}.csv`;
        break;
      case 'clan-goodie-bag':
        fileName = `${APP_PREFIX}ClanGoodieBagTotalExport_${downloadDate}.csv`;
        break;
      case 'maize-maze':
        fileName = `${APP_PREFIX}MaizeMazeTotalExport_${downloadDate}.csv`;
        break;
      case 'skilling':
        fileName = `${APP_PREFIX}SkillingRewardsTotalExport_${downloadDate}.csv`;
        break;
      default:
    }
    // CUSTOM: Additional export names for all individual spoils
    spoils.forEach(spoil => {
      if (display === spoil.id) {
        fileName = `${APP_PREFIX}${spoils[0].text.replace(/ /g, '_')}TotalExport_${downloadDate}.csv`;
      }
    });
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;'
    });

    util.downloadFile(blob, fileName);
  });

  // Factory reset
  $('.clear').click(function () {
    util.deleteLocalStorage(DATA_STORAGE, SELECTED_CHAT, DISPLAY_MODE, `${TOTALS_PREFIX}hide`, `${TOTALS_PREFIX}show`);
    util.deleteSessionStorage(CHAT_SESSION);
    // CUSTOM: Additional storage keys to clear
    util.deleteLocalStorage(`${APP_PREFIX}BagsOfSpoils`, `${APP_PREFIX}ClanGoodieBags`, `${APP_PREFIX}MaizeMaze`);
    spoils.forEach(spoil => {
      util.deleteLocalStorage(spoil.storage);
    });
    $('#show-totals').prop('checked', true);

    location.reload();
  })

  // Toggle display mode
  $(document).on('click', '#switch-display', function () {
    util.setLocalStorage(DISPLAY_MODE, `${$(this).data('show')}`);
    showItems()
  })

  // Right-click to change display mode
  const $displaySelect = $('#switch-menu');
  // Add display options
  $displaySelect.find('ul').append(`
    <li data-show="history" title="Show reward history">Reward History</li>
    <li data-show="total" title="Show reward totals">Reward Totals</li>
    <li data-show="bag-of-spoils" title="Show bag of spoils totals">Bag of Spoils Totals</li>
    <li data-show="clan-goodie-bag" title="Show clan goodie bag totals">Clan Goodie Bag Totals</li>
    <li data-show="maize-maze" title="Show maize maze totals">Maize Maze Totals</li>
    <li data-show="skilling" title="Show skilling totals">Skilling Totals</li>
  `);
  spoils.forEach(spoil => {
    $displaySelect.find('ul').append(`<li data-show="${spoil.id}" title="Show ${spoil.text}">${spoil.text}</li>`);
  });

  $(document).on('contextmenu', '#switch-display', function (e) {
    e.preventDefault();

    $displaySelect.css({
      display: 'block',
    });
  });

  $('html').click(function () {
    $displaySelect.hide();
  });

  $('#switch-menu li').click(function (e) {
    util.setLocalStorage(DISPLAY_MODE, `${$(this).data('show')}`);
    showItems()
  });
});


$(function () {


});
// Toggle totals display
$(function () {
  $('[data-totals]').each(function () {
    $(this).click(showItems);
  });

  $('[data-totals]').each(function () {
    let state = util.getLocalStorage(`${TOTALS_PREFIX}${$(this).data('totals')}`);
    if (state) this.checked = state.checked;
  });
});


$(window).bind('unload', function () {
  $('[data-totals]').each(function () {
    const key = `${TOTALS_PREFIX}${$(this).data('totals')}`;
    const value = { checked: this.checked };

    util.setLocalStorage(key, value);
  });
});

// Event listener to check if data has been altered
window.addEventListener('storage', function (e) {
  let dataChanged = false;
  switch (e.key) {
    case DATA_STORAGE: {
      let changedData = util.getLocalStorage(DATA_STORAGE);
      let lastChange = changedData[changedData.length - 1];
      let lastSave = [saveData[saveData.length - 1]]
      if (lastChange != lastSave) {
        saveData = changedData;
        dataChanged = true;
      }
    }
      break;
    // CUSTOM: Additional storage keys to check for changes in count
    case `${APP_PREFIX}BagsOfSpoils`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}BagsOfSpoils`));
      if (bagsOfSpoils != changedItems) {
        bagsOfSpoils = changedItems;
        dataChanged = true;
      }
    }
      break;
    case `${APP_PREFIX}ClanGoodieBags`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}ClanGoodieBags`));
      if (clanGoodieBags != changedItems) {
        clanGoodieBags = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}MaizeMaze`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}MaizeMaze`));
      if (maizeMaze != changedItems) {
        maizeMaze = changedItems;
        dataChanged = true;
      }
      break;
    }
    // CUSTOM: Additional tracking for all individual spoils
    case spoils[0].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[0].storage));
      if (basic1 != changedItems) {
        basic1 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[1].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[1].storage));
      if (basic2 != changedItems) {
        basic2 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[2].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[2].storage));
      if (basic3 != changedItems) {
        basic3 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[3].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[3].storage));
      if (impressive1 != changedItems) {
        impressive1 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[4].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[4].storage));
      if (impressive2 != changedItems) {
        impressive2 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[5].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[5].storage));
      if (impressive3 != changedItems) {
        impressive3 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[6].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[6].storage));
      if (prestigious1 != changedItems) {
        prestigious1 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[7].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[7].storage));
      if (prestigious2 != changedItems) {
        prestigious2 = changedItems;
        dataChanged = true;
      }
    }
      break;
    case spoils[8].storage: {
      let changedItems = parseInt(util.getLocalStorage(spoils[8].storage));
      if (prestigious3 != changedItems) {
        prestigious3 = changedItems;
        dataChanged = true;
      }
    }
      break;
  }

  if (dataChanged) {
    const types = typeof (JSON.parse(e.oldValue)) === typeof (JSON.parse(e.newValue)) ? typeof (JSON.parse(e.newValue)) : 'mismatch';
    switch (types) {
      case 'mismatch':
        throw new Error('Data type mismatch');
      case 'object':
        const oldV = e.oldValue !== 'null' ? Object.values(JSON.parse(e.oldValue)).slice(-1)[0] : null;
        const newV = Object.values(JSON.parse(e.newValue)).slice(-1)[0];
        console.debug('Local Storage changed:', `${e.key}`, '\nLast item: ', oldV, '->', newV);
        break;
      default:
        console.debug('Local Storage changed:', `${e.key}, ${e.oldValue} -> ${e.newValue}`);
    }
    currentList = 0;
    showItems();
  }
});

// DEBUG: Show chat history
window.toggleChat = () => {
  debugChat = !debugChat;
  console.log('Debug chat:', debugChat);
}
