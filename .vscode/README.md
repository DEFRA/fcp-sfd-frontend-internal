# VSCode Tasks for Frontend Development

This project includes a set of predefined VSCode tasks to streamline common frontend development operations using Docker.

To use them, open the VSCode command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) and select **"Run Task"**.

---

## 🧰 Available Tasks

| Label | Description |
|-------|-------------|
| ⬆️ **Up Frontend** | Start up the local Docker dev environment. |
| ⬇️ **Down Frontend** | Stop and remove running containers. |
| 🪵 **Log Frontend** | View real-time logs for all frontend containers. |
| ✅ **Test Frontend** | Run the full test suite in a clean Docker container. |
| ‼️ **Only Test Frontend** | Run tests for the currently open file using Vitest. |
| 🔍 **Lint Frontend** | Run linting (`standard` and `stylelint`). |
| 🧹 **Clean Frontend** | Stop containers, remove local images and volumes. |
| ⏯️ **Restart Frontend** | Restart all running frontend containers. |

---

## 📝 Notes

- These tasks live in `.vscode/tasks.json` and can be shared across the team via Git.
- Ensure you have Docker Desktop running before starting tasks.
