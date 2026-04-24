# Agentic-Office: Setup & Hackathon Demonstration Guide

Welcome to the **Agentic-Office** demonstration setup guide. This document will walk you through the precise steps to run the spatialized AI environment and demonstrate the collaborative capabilities of your digital staff.

## 🛠️ Prerequisites

1.  **Node.js & PNPM**: Ensure you have Node.js installed, along with `pnpm` (`npm install -g pnpm`).
2.  **Ollama**: Ensure Ollama is installed and running on your system with the `qwen3.5:cloud` model available.
3.  **OpenClaw**: The OpenClaw CLI must be installed globally (`npm install -g openclaw` or equivalent).

---

## 🚀 Step 1: Starting the AI Engine (OpenClaw)

Before starting the office, you must boot up the underlying agent network.

1.  Open a dedicated terminal window.
2.  Launch the OpenClaw gateway and agent network with the specific model you intend to use for the hackathon:
    ```bash
    ollama launch openclaw --model qwen3.5:cloud
    ```
    *(Keep this terminal running in the background).*

---

## 🏢 Step 2: Starting the Spatial Office

Once the OpenClaw gateway is live on port `18789`, you can start the Agentic-Office interface.

1.  Open a **new** terminal window.
2.  Navigate to the `Agentic-Office` root directory:
    ```bash
    cd /Users/gauravkarthik/Developer/tester/Agentic-Office
    ```
3.  Execute the unified startup script. This script automatically builds the shared packages, starts the backend data broker, and launches the Vite frontend:
    ```bash
    ./start.sh
    ```
4.  Wait for the startup sequence to complete. You should see `Agentic-Office started successfully.`
5.  Open your browser and navigate to: **[http://localhost:3000](http://localhost:3000)**

---

## 🧪 Step 3: Hackathon Demonstration (Building a Vanilla JS Calculator)

To impress the hackathon judges, follow this script to demonstrate real-time AI collaboration through the Tasks UI.

### 1. Observe the Roster
*   When the office loads, navigate to the **👥 Staff** tab on the left sidebar.
*   Verify that your team is online: `Clawdie` (CEO), `Kevin` (Frontend), `Mark` (Backend), `Ronny` (Architecture), etc.

### 2. Issue the Command
*   Switch to the **📋 Tasks** tab.
*   Select your primary agent (e.g., **Clawdie** or **Ronny**).
*   In the **Task Assigner** panel, enter the following prompt:
    > "Coordinate with the team to build a complete vanilla JavaScript calculator app. Include HTML structure, CSS styling for a modern look, and the underlying JS logic. Divide the work appropriately."
*   Set Priority to **High** and click **Assign Task**.

### 3. Watch the Magic Happen
*   **The Spatial View**: Switch back to the **🏢 Office** tab. You will see the agents physically moving to conference tables or whiteboards as they begin to communicate with one another via the OpenClaw gateway.
*   **Real-time Observability**: Switch to the **⚙️ Engine** tab. Here, you can show the judges the live system traces, CPU/Memory telemetry, and the "Brain Activity" of the agents as they process the task.
*   **Task Logs**: Return to the **📋 Tasks** tab and select individual agents (like `Kevin` or `Mark`) to view their direct chat logs and see the exact code they are generating and sharing with each other.

---

## 🛑 Troubleshooting

*   **Agents Not Connecting?** If the UI loads but no agents appear, ensure the OpenClaw gateway is running. You can completely reset the connection by running `./stop.sh`, then starting OpenClaw, and finally running `./start.sh` again.
*   **Port Conflicts?** If you see `EADDRINUSE` for port 3000, simply run `./stop.sh` to cleanly kill orphaned processes before starting again.
