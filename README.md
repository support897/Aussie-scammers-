# Aussie Scammers — Reported Stories

A white and peach warning website sharing personal reported stories about Valeria Hacket (also written Valeria Hackett, Valeria Hojem, Valeria Gallardo) and Joshua Hacket (Hackett) in Australia, plus a separate section for other reported scams.

**Hashtag: #AussieScammers**

## Important wording rule
Every story on this site is a **personal report, not a court finding**. Stories use reported / alleged language only. Nothing is stated as a proven fact about any person. Stories are checked by a person before publishing — there is no auto-posting.

## Pages
- `index.html` — home, story list
- `case-1.html` to `case-4.html` — one page per reported story
- `names.html` — other names and spellings as reported (both Hacket and Hackett appear)
- `other-stories.html` — separate section for reports about other people
- `share-your-story.html` — story form (see note below)
- `right-of-reply.html` — reply / correction / removal requests (see note below)

## Deploy notes
- Static site, no build step. Deploy the folder as-is (Vercel).
- **Check the live address after deploy:** `sitemap.xml`, `robots.txt`, every page's `og:url` and canonical link all say `https://hackettfamilyscam.com/`. If Vercel gives a different address, update all of those in the same commit, or Google will be pointed at the wrong place.
- After the address is confirmed, submit `sitemap.xml` in Google Search Console.

## Forms are NOT live yet
Both forms (`share-your-story.html`, `right-of-reply.html`) are switched off on purpose: submitting shows a clear "not sent or saved" message and nothing is stored. They must be connected to a real inbox before the site is shared publicly, and the "not live yet" notes removed at the same time.
