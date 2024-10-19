# HarvestHollowHaul

[Based on ZeroGwafa's Seren Tracker](https://github.com/ZeroGwafa/SerenTracker/tree/master)

For those of you who want to track the loot from Harvest Hollow, I reworked the Seren Tracker to work for several rewards obtained during this seasonal Halloween event.

It tracks the following: 
- Spoils received at Maize Maze
- Loot from spoils and clan goodie bags
- Items found when skilling throughout Gielinor

![example](/assets/example.png)

When the app detects spoils by reading the tooltip, it updates the Alt1 Toolbar with icons representing the detected type of spoils.
You can hover over these icons to see a descriptive text:  
![toolbar example](/assets/toolbar.png)

**Legend for spoils icons:** 
|Left to right |=>|![x](/assets/toolbar-icons.png)|
|:---: | :---: | :---: |
| Basic | Impressive | Prestigious |
| Phosphosseus | Skaraxxi | Solak-o'-lantern

## How to install

Go to [the app](https://exinferi.nl/apps/hhh) in your browser and click the link, or:

1. Go to the browser inside Alt1 toolkit
2. Visit `https://exinferi.nl/apps/hhh`
3. Hit the yellow 'add app' button in the upper right corner.

The app needs the following permissions: Pixel, Gamestate and Overlay.  
**Make sure to turn chatfilter off and turn timestamps on!**

Have fun tracking!

## Known issues  

* May behave odd with different chat sizes than 12.
* Reward history display is a bit funky when there's less than 25 items to display.
* When opened on multiple clients, the toolbar display on all clients shows the most recently detected spoils from the last used client.

## Updates

**Update 19 Oct 2024, 13:30 Game Time**:

* Fixed the total bag of spoils rewards display not being updated live when opening spoils.
* Fixed an [issue](/../../issues/3) with Weapon Poison++ breaking capture.
* Fixed an [issue](/../../issues/4) with edge case of having the same skilling reward in the same tick.
* Fixed an [issue](/../../issues/5) with rewards other than spoils being logged as Maize Maze rewards.

**Update 17 Oct 2024, 20:00 Game Time**:

* Official release! If new issues are discovered, the beta version will still be used for testing potential fixes.

**Update 17 Oct 2024, 17:30 Game Time**:

* Fixed double spooky token drops not being properly added together.
* Added an Alt1 toolbar message of which spoils it has detected (requires overlay permission).

**Update 16 Oct 2024, 20:00 Game Time**:

* **Breaking change**: Introduced source tracking for each individual type of spoils:
  * This works by tracking the tooltip when opening the bags with the mouse. So please, click the bags and don't keybind them 😇
  * The tracked source is being displayed on screen if overlay is enabled for the app. Don't open until you see this display, otherwise the source may be wrong!
  * You can check the data for the sources by using the right-click context-menu on the header:
  ![context menu](/assets/contextmenu.png)
* Fixed a lot of minor processing bux yesterday.

**Update 14 Oct 2024, 14:00 Game Time**:

* [Beta release!](https://exinferi.github.io/HarvestHollowHaul/)

## Special thanks

[ZeroGwafa](https://github.com/ZeroGwafa) for creating the tracker(s) this was based on  
[AuditorVorkosigan](https://github.com/AuditorVorkosigan) for beta testing and debugging  
[Skillbert](https://github.com/skillbert) & [OP Tech](https://github.com/Techpure2013) for leading me towards the needed adjustments  
And of course all my lovely clannies in [Lootbeams](https://runepixels.com/clans/lootbeams/about) that helped spot issues with the beta 💜

## My other apps

[WilyRewards](https://github.com/ExInferi/WildyRewards): Wilderness Flash Event Rewards Tracker  
[BeachTracker](https://github.com/ExInferi/BeachTracker): Beach 2024 Rewards Tracker - archived  
[PumpkinTracker](https://github.com/ExInferi/PumpkinTracker): Halloween 2023 Smashing/Party Pumkin Rewards Tracker  
[Tax Calculator](https://runeapps.org/forums/viewtopic.php?id=1508): Basic app to calculate the tax you have to pay at any given value  
[DgTracker](https://runeapps.org/forums/viewtopic.php?id=1452): Manual tracking of key doors, gatestones and boss rooms for dungeoneering floors
