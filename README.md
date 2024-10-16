# HarvestHollowHaul

[Based on ZeroGwafa's Seren Tracker](https://github.com/ZeroGwafa/SerenTracker/tree/master)

For those of you who want to track the loot from Harvest Hollow, I reworked the Seren Tracker to work for several rewards obtained during this seasonal Halloween event.

It tracks the following: 
- Spoils received at Maize Maze
- Loot from spoils and clan goodie bags
- Items found when skilling throughout Gielinor

![example](/assets/example.png)

## How to install - currently in beta, check link in [updates](#updates)

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

## Updates

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

