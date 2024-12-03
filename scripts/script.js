import * as util from './utility.js';
import TTReader from './tooltip.js';
// Enable "Add App" button for Alt1 Browser
A1lib.identifyApp('appconfig.json');

// Set up main constants
const APP_PREFIX = 'XMAS_';

const SELECTED_CHAT = `${APP_PREFIX}Chat`;
const DATA_STORAGE = `${APP_PREFIX}Data`;
const CHAT_SESSION = `${APP_PREFIX}ChatHistory`;
const TOTALS_PREFIX = `${APP_PREFIX}Totals_`;
const DISPLAY_MODE = `${APP_PREFIX}Display`;

// Themed app color
const COL = [206, 165, 0];

// Additional constants
const appURL = window.location.href.replace('index.html', '');
const appColor = A1lib.mixColor(...COL);
const rgbColor = `rgb(${COL[0]}, ${COL[1]}, ${COL[2]})`;
const showTotals = document.getElementById('show-totals');
const _ = undefined;

// CUSTOM: Present colors
const whiteColor = A1lib.mixColor(224, 220, 219);
const blueColor = A1lib.mixColor(5, 103, 174);
const purpleColor = A1lib.mixColor(112, 53, 218);
const goldColor = A1lib.mixColor(248, 181, 23);
const greenColor = A1lib.mixColor(107, 165, 48);

// Reward history optimization
let currentList = 0;
const itemsPerList = 25;

// CUSTOM: Source tracking for present through tooltips
const ttReader = new TTReader;
ttReader.farTooltip = true;
ttReader.trackinactive = true;
ttReader.tracking = true;
ttReader.maxw = 500;
ttReader.offsetx = 10;
let delay = 300;

// CUSTOM: presents tracking
const presentRegex = /Open\s(.*?\sChristmas\sPresent)/;
let currentPresent = _;
let overlayColor = appColor;

function startTrack() {
  ttReader.track((state) => {
    if (state) {
      let tooltip = state.readInteraction();
      let text = tooltip.text;
      if (debugChat) {
        console.log('Tooltip:', text);
      }
      const match = text.match(presentRegex);
      if (match) {
        if (currentPresent === match[1].trim()) {
          return;
        }
        alt1.overLayClearGroup('tracking');
        currentPresent = match[1].trim();
        const width = Math.round(alt1.rsWidth / 2);
        // Set overlay color and titlebar based on the type of present
        const presentType = /(W.*|B.*|P.*|G.*|S.*)\sChristmas\sPresent/;
        const typeMatch = currentPresent.match(presentType);
        switch (typeMatch[1]) {
          case 'White':
            overlayColor = whiteColor;
            break;
          case 'Blue':
            overlayColor = blueColor;
            break;
          case 'Purple':
            overlayColor = purpleColor;
            break;
          case 'Gold':
            overlayColor = goldColor;
            break;
          case "Santa's":
            overlayColor = greenColor;
            break;
        }
        // Update the titlebar with current present type icons
        util.setTitleBar(`Tracking: ${currentPresent}`, _, typeMatch[1]);
        // Set overlay text and rectangle for tooltip
        alt1.overLaySetGroup('tracking');
        alt1.overLayTextEx(`Tracking: ${currentPresent}`, overlayColor, 24, width, 100, 1000, 'Arial', true, true);
        alt1.overLayRect(
          overlayColor,
          state.area.x - 2,
          state.area.y - 2,
          state.area.width + 4,
          state.area.height + 4,
          1000,
          2
        );
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

let debugChat = false;
// Set Chat reader
let reader = new Chatbox.default();
reader.readargs = {
  colors: [
    A1lib.mixColor(30, 255, 0), // Main/very common reward color (green)
    A1lib.mixColor(102, 152, 255), // Common reward color (blue)
    A1lib.mixColor(163, 53, 238), // Uncommon reward color (purple)
    A1lib.mixColor(255, 128, 0), // Rare reward color (orange)
    whiteColor, // White Christmas Present
    blueColor, // Blue Christmas Present
    purpleColor, // Purple Christmas Present
    goldColor, // Gold Christmas Present
    greenColor, // Santa's Christmas Present
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
let whites = parseInt(util.getLocalStorage(`${APP_PREFIX}WhiteChristmasPresent`)) || 0;
let blues = parseInt(util.getLocalStorage(`${APP_PREFIX}BlueChristmasPresent`)) || 0;
let purples = parseInt(util.getLocalStorage(`${APP_PREFIX}PurpleChristmasPresent`)) || 0;
let golds = parseInt(util.getLocalStorage(`${APP_PREFIX}GoldChristmasPresent`)) || 0;
let santas = parseInt(util.getLocalStorage(`${APP_PREFIX}SantasChristmasPresent`)) || 0;
let exchanged = parseInt(util.getLocalStorage(`${APP_PREFIX}Exchanged`)) || 0;
let mysterygifts = parseInt(util.getLocalStorage(`${APP_PREFIX}MysteryGifts`)) || 0;

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
});

// Default titlebar state
if (window.alt1 && alt1.permissionInstalled) {
  util.setTitleBar('Currently not tracking any presents.', 'No presents detected', 'icon', 'icon');
} else if (window.alt1 && !alt1.permissionInstalled) {
  // Tell the user to install the app
  $('#item-list').html('<p style="padding-inline:1em">Click the "ADD APP" button above to install the app.</p>');
}
// Clear titlebar on reload/exit
$(window).bind('beforeunload', () => {
  util.setTitleBar('');
  window.alt1?.clearBinds();
});

let findChat = setInterval(function () {
  if (!window.alt1) {
    clearInterval(findChat);
    return;
  }
  if (reader.pos === null) reader.find();
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
  const ignoreLine = /\[\d+:\d+:\d+\] \d*,?\d* coins have been added to your money pouch.\s?/g;
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
    chat.indexOf('You open the Christmas present and receive') > -1,
    chat.indexOf('Christmas wrapping paper and receive') > -1,
    chat.indexOf('You unwrap your mystery gift and receive') > -1,
  ];

  const foundPresent = found[0];
  const foundExchange = found[1];
  const foundMystery = found[2];

  if (foundPresent) {
    const regex =
      /(\[\d+:\d+:\d+\]) You open the Christmas present and receive: \s?((?:\1 \d+[ x ]?[\w\s':+\-!()\d]+ ?)+)/g;
    const itemRegex = /\[\d+:\d+:\d+\] (\d+)\s*x?\s*([\w\s'+:\-!()\d]*)/g;
    const rewardRegex = new RegExp(regex.source);
    const rewards = chat.match(regex);
    let counter = null;

    rewards.forEach((reward) => {
      if (isLogged(reward)) return;
      const newReward = reward.match(rewardRegex);
      const source = currentPresent ?? 'Unknown';
      counter = `${APP_PREFIX}${source.replace(/[\s']/g, '')}`;
      const items = newReward[2].match(itemRegex);
      if (items.length === 1) {
        saveSingleItem(items[0], itemRegex, source, counter);
      } else {
        saveMultipleItems(items, itemRegex, source, counter);
      }
    });
  }
  if (foundExchange) {
    const regex =
      /(\[\d+:\d+:\d+\]) You exchange (\d+) Christmas wrapping paper and receive: \s?((?:\1 \d+[ x ][\w\s'\d]+ ?)+)/g;
    const itemRegex = /\[\d+:\d+:\d+\] (\d+)\s*x\s*([\w\s']*)/g;
    const rewardRegex = new RegExp(regex.source);
    const rewards = chat.match(regex);
    const counter = `${APP_PREFIX}Exchanged`;
    rewards.forEach((reward) => {
      if (isLogged(reward)) return;
      const newReward = reward.match(rewardRegex);
      const source = 'Exchanged';
      const items = newReward[3].match(itemRegex);
      const amount = parseInt(newReward[2]);

      saveCustomAmount(items, itemRegex, source, counter, amount);
    });
  }
  if (foundMystery) {
    const regex = /(\[\d+:\d+:\d+\]) You unwrap your mystery gift and receive: \s?((?:\1 \d+[ x ][\w\s':+\-!()\d]+ ?)+)/g;
    const itemRegex = /\[\d+:\d+:\d+\] (\d+)\s*x?\s*([\w\s'+:\-!()\d]*)/g;
    const rewardRegex = new RegExp(regex.source);
    const rewards = chat.match(regex);
    const counter = `${APP_PREFIX}MysteryGifts`;
    const source = 'Mystery Gift';

    rewards.forEach((reward) => {
      if (isLogged(reward)) return;
      const newReward = reward.match(rewardRegex);
      const items = newReward[2].match(itemRegex);
      saveMultipleItems(items, itemRegex, source, counter);
    });
  }
}
// Save single item
function saveSingleItem(match, regex, source, counter = null) {
  if (counter) {
    increaseCounter(counter);
  }
  saveItem(regex, match, source);
}

// In case of possible multiple items, save them all
function saveMultipleItems(match, regex, source, counter = null) {
  const filtered = filterItems(match, regex);

  if (counter) {
    increaseCounter(counter);
  }
  filtered.forEach((item) => {
    saveItem(regex, item, source);
  });
}

// Special case for custom amount
function saveCustomAmount(items, regex, source, counter, amount) {
  increaseCounter(counter, amount);

  items.forEach((item) => {
    saveItem(regex, item, source);
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
  const updatedItemsArray = items.map((itemString) => {
    const match = itemString.match(cleanRegex);
    if (match) {
      const itemName = match[2].trim();
      const totalQuantity = filteredItemsMap[itemName];
      // Replace the quantity in the original string
      return itemString.replace(/(?: x (\d+))|(?:(\d+) x )|(\d+)\s+/, (match, group1, group2, group3) => {
        const digit = group1 || group2 || group3;
        if (debugChat) {
          console.debug('group1', group1, 'group2', group2, 'group3', group3);
          console.log('Replaced:', digit, totalQuantity, match.replace(digit, totalQuantity));
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

// Function to check session storage for chat log
function isLogged(chat) {
  if (saveChatHistory.includes(chat.trim())) {
    console.debug('Duplicate:', chat.trim());
    return true;
  } else {
    saveChatHistory.push(chat.trim());
    util.setSessionStorage(CHAT_SESSION, saveChatHistory);
  }
  return false;
}

// Function to increase the counter in local storage
function increaseCounter(counter, add = 1) {
  let num = parseInt(localStorage.getItem(counter)) || 0;
  num += add;
  localStorage.setItem(counter, num);
  // Trigger event to update the counter variable -> see bottom part of the script
  const options = {
    key: counter,
    oldValue: JSON.stringify(num - add),
    newValue: JSON.stringify(num),
  };
  dispatchEvent(new StorageEvent('storage', options));
}

function saveItem(regex, item, src) {
  // Adjust regex to remove any flags
  const cleanRegex = new RegExp(regex.source);
  // Check if the item has already been saved
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
    time: itemTime,
  };
  console.log(getItem);
  saveData.push(getItem);
  util.setLocalStorage(DATA_STORAGE, saveData);
  // Trigger event to update the saveData and trigger showItems() -> see bottom part of the script
  const options = {
    key: DATA_STORAGE,
    oldValue: JSON.stringify(saveData.slice(-1)),
    newValue: JSON.stringify(saveData),
  };
  dispatchEvent(new StorageEvent('storage', options));
}

// Function to determine the total of all items recorded
function getTotal(source) {
  let total = {};
  saveData.forEach((item) => {
    // CUSTOM: Exclude Papers Exchanged
    if (item.source.includes('Exchanged') && source !== 'Exchanged') {
      return;
    }
    if (item.source.includes(source) || source === undefined) {
      const data = item.item.split(' x ');
      total[data[1]] = parseInt(total[data[1]]) + parseInt(data[0]) || parseInt(data[0]);
    }
  });
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

  items.forEach((item) => {
    $('#item-list').append(`<li title="From: ${item.source} @ ${util.formatDateTime(item.time)}">${item.item}</li>`);
  });
}
// Function to create a list of all items and their totals
function createList(total, type) {
  if (type === 'history') {
    const start = currentList * itemsPerList;
    const end = start + itemsPerList;
    // const itemsToShow = [...saveData].reverse().slice(start, end);
    //CUSTOM: Filter out items with source 'Exchanged'
    const filteredData = saveData.filter(item => !item.source.includes('Exchanged'));

    const itemsToShow = [...filteredData].reverse().slice(start, end);
    // if (end < saveData.length) {
    // CUSTOM: Filter out items with source 'Exchanged'
    if (end < filteredData.length) {
      appendItems(itemsToShow);

      // Create the load more button (again)
      $('#item-list').append('<button id="load-more" class="nisbutton nissmallbutton" type="button">Load More</button>');
      $('#load-more').on('click', function () {
        currentList++;
        createList(total, type);
      });
    } else {
      // const remaining = saveData.length - start;
      // CUSTOM: Filter out items with source 'Exchanged'
      const remaining = filteredData.length - start;
      if (remaining > 0) {
        // const remainingItems = saveData.reverse().slice(start, start + remaining);
        // CUSTOM: Filter out items with source 'Exchanged'
        const remainingItems = filteredData.reverse().slice(start, start + remaining);
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
  let text = 'Total Presents Opened';
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
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="white-present" title="Click to show all White Present Totals">Reward Item Totals</li>`);
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
    case 'white-present': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="blue-present" title="Click to show Blue Present Totals">White Present Totals</li>`);
      total = getTotal('White Christmas Present');
      text = 'White Presents Opened';
    }
      break;
    case 'blue-present': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="purple-present" title="Click to show Purple Present Totals">Blue Present Totals</li>`);
      total = getTotal('Blue Christmas Present');
      text = 'Blue Presents Opened';
    }
      break;
    case 'purple-present': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="gold-present" title="Click to show Gold Present Totals">Purple Present Totals</li>`);
      total = getTotal('Purple Christmas Present');
      text = 'Purple Presents Opened';
    }
      break;
    case 'gold-present': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="santas-present" title="Click to show Santa's Present Totals">Gold Present Totals</li>`);
      total = getTotal('Gold Christmas Present');
      text = 'Gold Presents Opened';
    }
      break;
    case 'santas-present': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="history" title="Click to show the Reward History">Santa's Present Totals</li>`);
      total = getTotal('Santa\'s Christmas Present');
      text = 'Santa\'s Presents Opened';
    }
      break;
    case 'exchanged': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="history" title="Click to show the Reward History">Papers Exchanged</li>`);
      total = getTotal('Exchanged');
      text = 'Papers Exchanged';
    }
      break;
    case 'mystery-gift': {
      $('#item-list').append(`<li id="switch-display" class="nisbutton nissmallbutton" data-show="history" title="Click to show the Reward History">Mystery Gift Totals</li>`);
      total = getTotal('Mystery Gift');
      text = 'Mystery Gifts Opened';
    }
      break;
  }

  if (showTotals.checked) {
    let totalRewards = 0;
       
    switch (display) {
      case 'total':
      case 'history':
        totalRewards = whites + blues + purples + golds + santas;
        break;
      // CUSTOM: Additional totals for custom sources
      case 'white-present':
        totalRewards = whites;
        break;
      case 'blue-present':
        totalRewards = blues;
        break;
      case 'purple-present':
        totalRewards = purples;
        break;
      case 'gold-present':
        totalRewards = golds;
        break;
      case 'santas-present':
        totalRewards = santas;
        break;
      case 'exchanged':
        totalRewards = exchanged;
        break;
      case 'mystery-gift':	
        totalRewards = mysterygifts;	
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
  let totalRewards = whites + blues + purples + golds + santas;
  switch (type) {
    case 'total':
      break;
    case 'history':
      str = 'Item,Source,Date,Time\n';
      break;
    // CUSTOM: Additional exports for custom sources
    case 'white-present':
      total = getTotal('White Christmas Present');
      totalRewards = whites;
      break;
    case 'blue-present':
      total = getTotal('Blue Christmas Present');
      totalRewards = blues;
      break;
    case 'purple-present':
      total = getTotal('Purple Christmas Present');
      totalRewards = purples;
      break;
    case 'gold-present':
      total = getTotal('Gold Christmas Present');
      totalRewards = golds;
      break;
    case 'santas-present':
      total = getTotal("Santa's Christmas Present");
      totalRewards = santas;
      break;
    case 'exchanged':
      total = getTotal('Exchanged');
      totalRewards = exchanged;
      break;
    case 'mystery-gift':
      total = getTotal('Mystery Gift');
      totalRewards = mysterygifts;
      break;
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
    Object.keys(total)
      .sort()
      .forEach((item) => (str += `${item},${total[item]}\n`));
      str += `Total rewards,${totalRewards}\n`;
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
      case 'white-present':
        fileName = `${APP_PREFIX}WhitePresentTotalExport_${downloadDate}.csv`;
        break;
      case 'blue-present':
        fileName = `${APP_PREFIX}BluePresentTotalExport_${downloadDate}.csv`;
        break;
      case 'purple-present':
        fileName = `${APP_PREFIX}PurplePresentTotalExport_${downloadDate}.csv`;
        break;
      case 'gold-present':
        fileName = `${APP_PREFIX}GoldPresentTotalExport_${downloadDate}.csv`;
        break;
      case 'santas-present':
        fileName = `${APP_PREFIX}SantasPresentTotalExport_${downloadDate}.csv`;
        break;
      case 'exchanged':
        fileName = `${APP_PREFIX}PapersExchangedExport_${downloadDate}.csv`;
        break;
      case 'mystery-gift':
        fileName = `${APP_PREFIX}MysteryGiftsExport_${downloadDate}.csv`;
        break
      default:
    }
    const blob = new Blob([csv], {
      type: 'text/csv;charset=utf-8;',
    });

    util.downloadFile(blob, fileName);
  });

  // Factory reset
  $('.clear').click(function () {
    util.deleteLocalStorage(DATA_STORAGE, SELECTED_CHAT, DISPLAY_MODE, `${TOTALS_PREFIX}hide`, `${TOTALS_PREFIX}show`);
    util.deleteSessionStorage(CHAT_SESSION);
    // CUSTOM: Additional storage keys to clear
    util.deleteLocalStorage(
      `${APP_PREFIX}WhiteChristmasPresent`,
      `${APP_PREFIX}BlueChristmasPresent`,
      `${APP_PREFIX}PurpleChristmasPresent`,
      `${APP_PREFIX}GoldChristmasPresent`,
      `${APP_PREFIX}SantasChristmasPresent`,
      `${APP_PREFIX}Exchanged`,
      `${APP_PREFIX}MysteryGifts`
    );
    $('#show-totals').prop('checked', true);

    location.reload();
  });

  // Toggle display mode
  $(document).on('click', '#switch-display', function () {
    util.setLocalStorage(DISPLAY_MODE, `${$(this).data('show')}`);
    showItems();
  });

  // Right-click to change display mode
  const $displaySelect = $('#switch-menu');
  // Add display options
  $displaySelect.find('ul').append(`
    <li data-show="history" title="Show reward history">Reward History</li>
    <li data-show="total" title="Show reward totals">Reward Totals</li>
    <li data-show="white-present" title="Show White Present Totals">White Present Totals</li>
    <li data-show="blue-present" title="Show Blue Present Totals">Blue Present Totals</li>
    <li data-show="purple-present" title="Show Purple Present Totals">Purple Present Totals</li>
    <li data-show="gold-present" title="Show Gold Present Totals">Gold Present Totals</li>
    <li data-show="santas-present" title="Show Santa's Present Totals">Santa's Present Totals</li>
    <li data-show="exchanged" title="Show presents received from papers">Papers Exchanged</li>
    <li data-show="mystery-gift" title="Show Mystery gift Totals">Mystery Gift Totals</li>
  `);

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
    showItems();
  });
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
        let lastSave = [saveData[saveData.length - 1]];
        if (lastChange != lastSave) {
          saveData = changedData;
          dataChanged = true;
        }
      }
      break;
    // CUSTOM: Additional storage keys to check for changes in count
    case `${APP_PREFIX}WhiteChristmasPresent`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}WhiteChristmasPresent`));
      if (whites != changedItems) {
        whites = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}BlueChristmasPresent`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}BlueChristmasPresent`));
      if (blues != changedItems) {
        blues = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}PurpleChristmasPresent`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}PurpleChristmasPresent`));
      if (purples != changedItems) {
        purples = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}GoldChristmasPresent`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}GoldChristmasPresent`));
      if (golds != changedItems) {
        golds = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}SantasChristmasPresent`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}SantasChristmasPresent`));
      if (santas != changedItems) {
        santas = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}Exchanged`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}Exchanged`));
      if (exchanged != changedItems) {
        exchanged = changedItems;
        dataChanged = true;
      }
      break;
    }
    case `${APP_PREFIX}MysteryGifts`: {
      let changedItems = parseInt(util.getLocalStorage(`${APP_PREFIX}MysteryGifts`));
      if (mysterygifts != changedItems) {
        mysterygifts = changedItems;
        dataChanged = true;
      }
      break;
    }
  }

  if (dataChanged) {
    const types =
      typeof JSON.parse(e.oldValue) === typeof JSON.parse(e.newValue) ? typeof JSON.parse(e.newValue) : 'mismatch';
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
};
