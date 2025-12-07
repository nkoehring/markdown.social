# Custom IDs Test Feed
:author: CustomUser
:description: Testing custom IDs with date fields for sorting
:lang: en
:link: https://customuser.example/feed.md

This feed demonstrates using custom IDs (not timestamps) with explicit date fields for proper timeline sorting.

## About

When you want meaningful IDs but still need chronological sorting, use the :date: field!

**
:id: first-post
:date: 2025-10-20T10:00:00Z
:tags: introduction custom-ids
:mood: excited

This is my first post! I'm using a human-readable ID instead of a timestamp.
The :date: field ensures it's sorted correctly in timelines.

**
:id: second-post
:date: 2025-10-21T14:30:00Z
:tags: timeline sorting
:mood: thoughtful

Here's my second post. Notice the IDs are sequential and readable,
but the dates control the actual chronological order.

**
:id: important-announcement
:date: 2025-10-23T09:15:00Z
:tags: announcement features
:mood: 📢

This post has a custom ID that describes its content rather than when it was posted.
Much easier to reference in conversations!

**
:id: reply-example
:date: 2025-10-25T16:45:00Z
:tags: replies conversation
:mood: friendly

Custom IDs make it super easy to reply to specific posts.
Just reference the ID like #important-announcement!

**
:id: latest-update
:date: 2025-10-27T12:00:00Z
:tags: updates plaintext
:mood: happy

Latest update: Everything works perfectly! Custom IDs + date fields = best of both worlds.