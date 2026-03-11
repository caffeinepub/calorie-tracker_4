# Calorie Tracker

## Current State
New project with no existing code.

## Requested Changes (Diff)

### Add
- Meal logging: user takes or uploads a photo of their meal
- Calorie estimation: photo is sent to an AI vision API (via HTTP outcall) which returns estimated calories and a meal name
- Meal history: list of all logged meals with photo, name, calories, and timestamp
- Daily summary: total calories consumed today
- Delete meal: remove a logged meal from history

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend (Motoko):
   - Data model: `Meal { id, userId, imageUrl, mealName, calories, timestamp }`
   - `addMeal(imageData: Blob, mimeType: Text) -> async Result<Meal, Text>` -- stores image, calls HTTP outcall to Google Gemini Vision API to estimate calories and meal name, saves and returns meal record
   - `getMeals() -> async [Meal]` -- returns all meals for the calling user
   - `deleteMeal(id: Nat) -> async Result<(), Text>` -- deletes a meal by id
   - `getDailySummary() -> async { totalCalories: Nat; mealCount: Nat }` -- returns today's totals for the calling user

2. Components:
   - `camera` -- for capturing meal photos in-browser
   - `blob-storage` -- for storing meal images
   - `http-outcalls` -- for calling Gemini Vision API to analyze meal photos
   - `authorization` -- for per-user meal tracking

3. Frontend:
   - Home screen with daily calorie summary ring/progress
   - "Log Meal" button opens camera or file upload
   - After capture, shows loading state while AI estimates calories
   - Displays result (meal name + calories) with confirm/cancel
   - Scrollable meal history list with photo thumbnail, name, calories, time
   - Delete meal from history
