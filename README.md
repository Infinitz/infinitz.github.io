# Dota 2 Attribute Guesser

A simple static guessing game for Dota 2 hero attributes.

## What it does

- shows one hero at a time
- displays the hero portrait and name
- lets the player guess among **Universal**, **Intellect**, **Agility**, and **Strength**
- tracks how many heroes have been answered, how many are left, and how many guesses were correct
- shows a full summary table at the end with the player's guess and the correct answer for every hero
- supports restarting the game after finishing the full roster

## Why this works well on GitHub Pages

This project is plain **HTML + CSS + JavaScript**.

- no backend
- no database
- no build step
- hero data is stored locally in `./data/heroes.json`

That means you can host it directly on GitHub Pages.

## File structure

```text
.
├── index.html
├── script.js
├── styles.css
└── data/
    └── heroes.json
```

## Deploy on GitHub Pages

### Option 1: user site

1. Create a repository named `<your-github-username>.github.io`
2. Upload the files from this project to the repository root
3. Push to the `main` branch
4. Open `https://<your-github-username>.github.io`

### Option 2: project site

1. Create any repository
2. Upload the files
3. In GitHub, open **Settings → Pages**
4. Set the source to **Deploy from a branch**
5. Choose `main` and the root folder
6. GitHub will publish the site under the repository's Pages URL

Because the app uses relative paths, it works for both user pages and project pages.

## Data

The app reads hero records from `data/heroes.json` in this format:

```json
[
  {
    "id": 1,
    "name": "Anti-Mage",
    "attribute": "agility",
    "image": "https://..."
  }
]
```

## Notes

- Hero images are loaded from Valve's public Dota 2 CDN.
- Dota 2 and related art/assets are property of Valve.
