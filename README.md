# Dota 2 Attribute Guesser

Dota 2 Attribute Guesser is a simple browser game where the player is shown Dota 2 heroes one by one and must guess each hero's main attribute.

The game shows the hero's portrait and name, gives four answer choices, tracks progress throughout the run, and displays a full summary when all heroes have been answered.

## Technical overview

This project is a small static web application built with plain HTML, CSS, and JavaScript. It does not use a backend, database, or external framework.

Hero data is stored in a local JSON file in the repository, and the application reads that data directly in the browser. The game logic handles hero order, answer checking, progress tracking, score counting, and the final results view.
