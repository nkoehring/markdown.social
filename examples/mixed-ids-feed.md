# Mixed IDs Feed
:author: MixedUser
:description: Testing mixed ID formats - timestamps and custom IDs
:lang: en
:link: https://mixeduser.example/feed.md
:follow: CustomUser file:///var/home/n/src/koehr/plaintext.casa/examples/custom-ids-feed.md

This feed mixes different ID styles to test the sorting logic.

## About

Some posts use RFC 3339 timestamps as IDs (traditional style), 
others use custom IDs with explicit date fields.

**
:id: 2025-10-19T08:00:00Z
:tags: timestamp-id traditional
:mood: 🕰️

This post uses a timestamp as its ID. No date field needed - 
the ID itself is parseable as a date.

**
:id: my-custom-id-1
:date: 2025-10-22T11:00:00Z
:tags: custom-id with-date
:mood: ✨

This post uses a custom ID with an explicit date field for sorting.

**
:id: 2025-10-24T15:30:00Z
:tags: timestamp-id another-one
:mood: ⏰

Another timestamp ID post. These work great when you don't need 
memorable identifiers.

**
:id: no-date-field
:tags: custom-id fallback-test
:mood: 🤔

This post has a custom ID but NO date field. It should be sorted 
using the fetch time as fallback.

**
:id: descriptive-title
:date: 2025-10-26T09:00:00Z
:tags: custom-id semantic
:mood: 😊

Custom IDs are great for semantic meaning and easy referencing in replies!

**
:id: 2025-10-28T18:00:00Z
:tags: timestamp-id newest
:mood: 🎉

Latest post with a timestamp ID. Should appear last in the timeline 
(when sorted oldest-first in the feed, newest-last).