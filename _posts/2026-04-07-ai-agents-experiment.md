---
title: "Can We Trust AI Agents? The 'Human-on-Top' Necessity"
date: 2026-04-07 18:00:00 +0200
categories: [AI, Experiments]
tags: [ai-agents, local-llms, backend, claude]
---

Can we truly trust AI agents to work independently? 😃 I recently ran an experiment using **Claude 4.5 Opus** as the architect and local models (**Devstral 2**, **Qwen 3 Coder**) for implementation. 

### The Tech Stack
Python, FastAPI, Supabase, Next.js, Tailwind CSS, Docker, Redis.

### What Worked
Local models are excellent for "self-fixing" loops. Since they are free, I let them repeatedly debug their own code, which saved significant API costs.

### Where it Failed
1. **Strategic Blindspots:** AI approved its own flawed code.
2. **Outdated Knowledge:** It suggested a deprecated travel API.
3. **UI/Rate Limits:** Local models struggled with aesthetics.

**Takeaway:** A "Human-on-Top" approach is essential. AI is a powerful assistant for foundations, but humans must lead the strategy.


## Frontend Results & Dashboard


![Travel Hunter Dashboard](/assets/img/posts/ai-experiment/dashboard.png)


![flight-search](/assets/img/posts/ai-experiment/flight-search-page.png)


![flight-search-page-val](/assets/img/posts/ai-experiment/flight-search-page-val.png)