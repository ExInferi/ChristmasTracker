# ChristmasTracker

[Based on ZeroGwafa's Seren Tracker](https://github.com/ZeroGwafa/SerenTracker/tree/master)

For those of you who want to track the loot from Christmas presents, I reworked the Seren Tracker to work for Christmas presents obtained during the repeatable Christmas events.

![example](/assets/example.png)

It tracks the following:
- Rewards received from Christmas Presents
- Christmas Presents obtained from handing in Christmas wrapping paper

You can change the view of the app by right-clicking the golden bar on top:  
![right click context menu](/assets/contextmenu.png)

The tracking of the presents is done by reading a combination of the tooltip and the chat. Whenever you hover a new type of present, it will update the titlebar to show the image of the currently tracked present:  
![titlebar example](/assets/titlebar.png)

## How to install

Go to [the app](https://exinferi.nl/apps/xmas) in your browser and click the link, or:

1. Go to the browser inside Alt1 toolkit
2. Visit `https://exinferi.nl/apps/xmas`
3. Hit the yellow 'add app' button in the upper right corner.

The app needs the following permissions: Pixel, Gamestate and Overlay.  
**Make sure to turn chatfilter off and turn timestamps on!**

Have fun tracking!

## Known issues  

* May behave odd with different chat sizes than 12.
* Reward history display is a bit funky when there's less than 25 items to display.
* When opened on multiple clients, the toolbar display on all clients shows the most recently detected present from the last used client.

## Updates

**Update 2 December 2024, 20:45 Game Time**:

* Added tracking of christmas papers exchanged.
* Beta testing has officially started! Please report any problems you encounter in Issues with a clear description and preferably a screenshot.

**Update 29 November 2024, 20:45 Game Time**:

* [Beta release!](https://exinferi.github.io/ChristmasTracker/)
  * Reworked HarvestHollowHaul to work for the soon™ christmas presents
  * Adjusted chat comparison for duplicates to hopefully work a bit faster
  * Obviously this beta does nothing at time of release, since the event hasn't started yet >.<

## Special thanks

[ZeroGwafa](https://github.com/ZeroGwafa) for creating the tracker(s) this was based on  
[AuditorVorkosigan](https://github.com/AuditorVorkosigan) for beta testing and debugging  
[Skillbert](https://github.com/skillbert) & [OP Tech](https://github.com/Techpure2013) for leading me towards the needed adjustments  
And of course all my lovely clannies in [Lootbeams](https://runepixels.com/clans/lootbeams/about) that helped spot issues with the beta 💜

## My other apps

[WildyRewards](https://github.com/ExInferi/WildyRewards): Wilderness Flash Event Rewards Tracker  
[HarvestHollowHaul](https://github.com/ExInferi/HarvestHollowHaul): Halloween Event Rewards Tracker  
[BeachTracker](https://github.com/ExInferi/BeachTracker): Beach 2024 Rewards Tracker - archived  
[PumpkinTracker](https://github.com/ExInferi/PumpkinTracker): Halloween 2023 Smashing/Party Pumpkin Rewards Tracker - archived  
[Tax Calculator](https://runeapps.org/forums/viewtopic.php?id=1508): Basic app to calculate the tax you have to pay at any given value  
[DgTracker](https://runeapps.org/forums/viewtopic.php?id=1452): Manual tracking of key doors, gatestones and boss rooms for dungeoneering floors
