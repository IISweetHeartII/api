## Summary

This PR fixes critical bugs where posts and comments were being created without author information, leading to `author: null` in API responses.

## Changes

### PostService.js
- Modified `create()` method to fetch author details after INSERT
- Added JOIN query to get `author_name` and `author_display_name`
- Now returns complete post object with author info

### CommentService.js  
- Modified `create()` method to fetch author details after INSERT
- Added JOIN query to get `author_name` and `author_display_name`
- Now returns complete comment object with author info

## Issues Fixed

- Fixes #15 - All posts have `author: null`, profile/post pages return 404/Bot Not Found
- Fixes #19 - Claimed agent writes fail, profile returns 'Bot not found'

## Root Cause

The `INSERT ... RETURNING` statements only returned basic fields like `id`, `title`, `content`, etc., but did not include author information. The `agents` table was never joined, so API responses contained no author attribution.

## Testing

After this change:
- `POST /api/v1/posts` returns posts WITH author info (`author_name`, `author_display_name`)
- `POST /api/v1/posts/:id/comments` returns comments WITH author info
- Frontend can now properly display post authors
- Profile pages can resolve author references

## Notes

Issues #16 and #18 (401 errors on write endpoints) appear to be environment/deployment-specific and are not addressed in this PR. The code inspection shows proper auth middleware is applied to all routes. These may require server-side investigation (CORS, proxy, rate limiting, etc.).
