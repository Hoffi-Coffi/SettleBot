# SettleBot
SettleBot is the moderation bot for The Settlement Discord server.

## Features
Currently, SettleBot provides the following features;
* Scanning incoming text messages in all text channels for banned words
    * Tiered response if a banned word is found - lesser words are automatically deleted and worse ones result in an automatic mute.
* Ability to track infractions
    * Mutes users if they reach 4 infractions.
* Allows for easy spoiler-chat setup. Deletes potential spoilers posted in channels that aren't designated as spoiler zones.
* Offers the ability to run Skill-Of-The-Week competitions through Crystal Math Labs
    * Automatically assigns players an "Athlete" role to designate them as competitors
    * Pings that role when a new competition begins
    * Pings that role when 30 minutes is left on the competition
    * Pings that role when the competition is over.
    * Easy to set-up a new SOTW from the previous one - all handled by the bot!
* Allows players to register their RSN with the bot to automatically include their RSN in future commands
    * Automatically adds registered players to the CML tracker
* Statistics!

## Roadmap
SettleBot is constantly evolving. The next features to add are;
* A help command!
* A stats-lookup command
* Event tracking and management
* Automatically update SOTW competitors based on certain rules to prevent XP hiding
* More competition types (clue scrolls, loot trackers, boss kills, etc.)

## Technology
SettleBot is written in TypeScript and runs on Node. It's tested using Jest and ts-jest. SettleBot uses travis to continuously build and validate itself.

## Want to help?
Currently, SettleBot is not open for contributions. Watch this space!