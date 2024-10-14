import * as util from './utility.js';

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
const appColor = A1lib.mixColor(COL[0], COL[1], COL[2]);
const rgbColor = `rgb(${COL[0]}, ${COL[1]}, ${COL[2]})`;
const showTotals = document.getElementById('show-totals');

// Reward history optimization
let currentList = 0;
const itemsPerList = 25;

let debugChat = false;
// Set Chat reader
let reader = new Chatbox.default();
reader.readargs = {
  colors: [
    A1lib.mixColor(30, 255, 0), // Main/very common reward color (green)
    A1lib.mixColor(102, 152, 255), // Common reward color (blue)
    A1lib.mixColor(163, 53, 238), // Uncommon reward color (purple)
    A1lib.mixColor(255, 128, 0), // Rare reward color (orange)
    A1lib.mixColor(5, 103, 174), // Basic spoils (blue)
    A1lib.mixColor(112, 53, 218),// Impressive spoils (purple)
    A1lib.mixColor(248, 181, 23), // Prestigious spoils (gold)
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
let bagsOfSpoils = parseInt(util.getLocalStorage(`${APP_PREFIX}BagsOfSpoils`)) || 0;
let clanGoodieBags = parseInt(util.getLocalStorage(`${APP_PREFIX}ClanGoodieBags`)) || 0;
let maizeMaze = parseInt(util.getLocalStorage(`${APP_PREFIX}MaizeMaze`)) || 0;

// Find all visible chatboxes on screen
if (!window.alt1) {
  $('#item-list').html(`<p style="text-indent:1em">Alt1 not detected. <a href='alt1:// Addapp/${appURL}appconfig.json'>Click here to add the app to Alt1</a></p>`);
} else {
  $('#item-list').html('<p style="text-indent:1em">Searching for chatboxes...</p>');
}
window.addEventListener('load', function () {
  if (window.alt1) {
    reader.find();
    reader.read();
  }
})

let findChat = setInterval(function () {
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
  // CUSTOM: Additional options to ignore adding to coin pouch and removing commas
  const ignoreLine = /\[\d+:\d+:\d+\] \d*,?\d* coins have been added to your money pouch.\s?/g;
  for (let a in opts) {
    chat += opts[a].text.replace(ignoreLine, '').replace(',', '') + ' ';
  }
  // DEBUG: See chat and opts in console
  if (debugChat) {
    if (chat.trim().length > 0) {
      console.log('Chat:', chat);
      console.table(opts);
    }
  }
  // Check if the chat message contains any of the following strings
  const found = [
    chat.indexOf('You open the ') > -1,
    chat.indexOf('While skilling, you find') > -1,
    chat.indexOf('You receive:') > -1,
  ];

  const foundBag = found[0];
  const foundSkilling = found[1];
  const foundSpoils = found[2];
  if (found.includes(true)) {
    if (foundBag) {
      const regex = /(\[\d+:\d+:\d+\]) You open the (clan goodie bag|bag of spoils). and receive: \s?((?:\1 \d+[ x ]?[\w\s()]+ ?)+)/g
      const itemRegex = /\[\d+:\d+:\d+\] (\d+)\s*x?\s*([A-Za-z\s'\-!()\d]*)/g;
      const rewardRegex = new RegExp(regex.source);
      const rewards = chat.match(regex);
      let counter = null;

      rewards.forEach((reward) => {
        const newReward = reward.match(rewardRegex);
        const source = newReward[2];
        const items = newReward[3].match(itemRegex);
        switch (source) {
          case 'bag of spoils':
            counter = `${APP_PREFIX}BagsOfSpoils`;
            break;
          case 'clan goodie bag':
            counter = `${APP_PREFIX}ClanGoodieBags`;
            break;
        }
        saveMultipleItems(items, itemRegex, source, counter);
      });
    } else if (foundSkilling) {
      const regex = /(\[\d+:\d+:\d+\]) While skilling, you find: ((?:[\w\s()]+)*)/;
      const reward = chat.match(regex);
      saveSingleItem(reward[2], regex, 'skilling');
    } else if (foundSpoils) {
      const regex = /(\[\d+:\d+:\d+\]) You receive: ((?:[\w\s()]+))/g;
      const itemRegex = /You receive: ()((?:[\w\s()]+))/;
      const rewards = chat.match(regex);
      const filtered = filterItems(rewards, itemRegex);
      filtered.forEach((reward) => {
        saveSingleItem(reward, itemRegex, 'maize maze', maizeMaze);
      });
    } else {
      console.warn('Unknown source');
      return;
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
      return itemString.replace(/(?: x (\d+))|(?:(\d+) x )/, (match, group1, group2) => {
        const digit = group1 || group2;
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
    if (item.source === source || source === undefined) {
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
  let text = 'Total Opened';
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
      total = getTotal('bag of spoils');
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
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="history" title="Click to show the Reward History">Maize Maze Totals</li>`);
      total = getTotal('maize maze');
      text = 'Maize Maze Completed';
    }
      break;
  }

  if (showTotals.checked) {
    let totalRewards = bagsOfSpoils + clanGoodieBags + maizeMaze;
    // CUSTOM: Additional totals for custom sources
    if (display !== 'total' && display !== 'history') {

      switch (display) {
        case 'bag-of-spoils':
          totalRewards = bagsOfSpoils;
          break;
        case 'clan-goodie-bag':
          totalRewards = clanGoodieBags;
          break;
        case 'maize-maze':
          totalRewards = maizeMaze;
          break;
      }
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
      total = getTotal('bag of spoils');
      break;
    case 'clan-goodie-bag':
      total = getTotal('clan goodie bag');
      break;
    case 'maize-maze':
      total = getTotal('maize maze');
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
      default:
    }

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

// Force read chatbox
A1lib.on('alt1pressed', readChatbox);

// DEBUG: Show chat history
window.toggleChat = () => {
  debugChat = !debugChat;
  console.log('Debug chat:', debugChat);
}
