# Gator 🐊

gator is a CLI for browsing rss feeds featuring user-based data storage, following of feeds, and nothing else of note.

## What You'll Need

A postgres database to store information.

## Setup Instructions

Download the files. Run the program with `npm run start [commands]`

## Commands

`register [user name]` - register the given user name.

`login [user name]` - login as the given user.

`addfeed [title] [url]` - add the feed from the given url and store it under the given title.

`follow [feed title]` - follow the feed with the current user.

`unfollow [feed title]` - unfollow a feed.

`agg [time interval]` - aggregate saved feeds at a given time interval e.g. `10s`, `5m`, etc.
