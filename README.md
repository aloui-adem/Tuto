# Tuto

Tuto is a desktop assistant that guides users through tasks on their screen using a separate visual cursor.

The idea is simple: you give it a task, it analyzes the screen, identifies where to go next, and moves its visual cursor toward the target. The cursor is separate from the system mouse.

**Status:** Work in progress.

## How it works

1. The desktop app receives the task.
2. The screen is captured and sent for AI analysis.
3. The model identifies the next target.
4. Tuto moves its visual cursor toward that target.

The goal is to make it easier to follow instructions and navigate applications without having to search for every button yourself.

## Tech stack

- **Electron** — desktop application
- **React** — user interface
- **Python / FastAPI** — backend
- **OpenRouter** — access to vision-capable language models

## Current limitations

- Target detection depends on the model's accuracy.
- Responses can be slow, especially when a new API request is needed for each target.
- Cross-application guidance and reliability still need improvement.

## Running locally

Setup instructions are not finalized yet. The frontend and backend need to be configured separately, including the required environment variables and API access.

Do not commit API keys or other secrets to the repository.

## Roadmap

- [ ] Improve target detection accuracy
- [ ] Reduce the delay between actions
- [ ] Improve guidance across different applications
- [ ] Handle failed or uncertain predictions safely
- [ ] Document installation and configuration

## Author

[Adem Aloui](https://github.com/aloui-adem)
