
# 🛡️ Agentic AI Hackathon – 42Beirut x Teknologiia

Welcome to Lebanon’s first Agentic AI Hackathon! Below are the complete rules, expectations, and step-by-step tasks you must follow to succeed in this event.

---

## 🎯 Objective

Build a **cybersecurity automation pipeline** that:

1. Parses a provided CSV of firewall/network logs.
2. Enriches the logs using **external threat intelligence APIs**.
3. Uses **AI models (e.g., ChatGPT, DeepSeek)** to determine whether each log entry is a **True Positive** or **False Positive**.
4. Exports the results to CSV.
5. Visualizes the outcome using your tool of choice.
6. Submits a short screen recording and a 2-page report.

---

## 📦 Setup Requirements

- **OS**: Linux VM (setup via VirtualBox)
- **Specs**: Minimum 16 GB RAM, 100 GB storage
- **Tools**:
  - Docker
  - n8n (installed via Docker)
  - Python (optional for visualization)
  - APIs: VirusTotal, AbuseIPDB, Shodan, OpenAI, DeepSeek (some keys provided)

---

## 🔧 Step-by-Step Project Breakdown

### Phase 1 – Setup
- Install VirtualBox, create Ubuntu VM
- Install Docker
- Install and run n8n inside Docker
- Ensure n8n has access to your log file directory

### Phase 2 – Log Parsing
- Load the provided CSV (`cybersecurity_attacks.csv`) into n8n
- Parse it to JSON using the “Read Binary File” and “CSV” nodes

### Phase 3 – Enrichment
- Use threat intelligence APIs to enrich log entries
- APIs can include:
  - VirusTotal
  - AbuseIPDB
  - Shodan
- Store fields like `IP_Reputation`, `Malicious`, etc.

### Phase 4 – AI Classification
- Send enriched logs to AI agents (e.g., GPT-4, DeepSeek)
- Prompt the AI to classify logs as:
  - `TP` – True Positive
  - `FP` – False Positive
- Store the AI's decision + explanation

### Phase 5 – CSV Export & Visualization
- Export the enriched and labeled logs to CSV
- Visualize insights like:
  - Number of TP/FP
  - Most malicious IPs
  - Attack types or port usage
- Use any platform (Python, JavaScript, Streamlit, Excel)

### Phase 6 – Submission
- Submit:
  - A screen recording (max 5 minutes)
  - A 2-page Word document explaining:
    - What you built
    - Tools used
    - Challenges and solutions
    - Insights from data

---

## 📜 Hackathon Rules

- Use only provided workstations or personal laptops in allowed areas
- No food/drinks in cluster zones; water bottles on floor only
- Don’t block workstations or move setups
- Be polite, respectful, and professional
- Do not access forbidden areas or tamper with infrastructure
- Breaking rules may lead to disqualification or point loss

---

## 📡 Communication

- Slack is the main channel — join all public rooms
- Set your full name as display name
- Turn on notifications for announcements
- Ask mentors for help anytime — look for the **HACKATHON** badge

---

## 🏆 Prizes

- 🥇 Winning team earns a **trip to Istanbul** + museum tour
- 🏅 Recognition for creativity, usefulness, and technical quality

---

## Good luck, hackers! Show us your agentic AI brilliance.
