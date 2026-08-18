---
title: MAScan
description: Multi-agent AI system for strategic market analysis. Six specialist
  LLM agents, one per PESTEL dimension, each with its own evidence source.
repo: https://github.com/aimanalhazmi/MAScan
cover: /img/uploads/mascan-architecture.png
tags:
  - Agents
  - FinTech
  - Python
  - React
featured: true
started: 2026-07-22
---
Strategic business decisions depend on evidence from many different places: news, market data, regulation, scientific research, and internal company documents. Collecting that evidence and keeping track of where each claim came from is slow and easy to get wrong.

MAScan analyses a business question along the six PESTEL dimensions: political, economic, social, technological, environmental, and legal. Each dimension is owned by one specialist LLM agent, and each agent has its own evidence source: official legislative registers such as EUR-Lex and the U.S. Federal Register for the legal agent, financial market data for the economic agent, scientific publications for the technological agent, World Bank indicators for the environmental agent, and Reddit and X as sentiment signals for the social agent.

A planner splits the request into tasks, asks one clarifying question when the request is too vague, and starts only the agents that are needed. A synthesizer merges their reports into one. A separate validation agent then re-opens every cited source and checks whether it really supports the claim.

\## Retrieval over internal documents

Uploaded company documents are searched by a pipeline that judges its own results. It first runs one cheap vector search, and a grader decides whether the retrieved passages really answer the question. Only if they do not does the system split the question into sub-questions, rewrite each one into several phrasings, search again, and re-rank what comes back. Charts and figures are described by a vision model and stored as separate passages, so a chart can be found through what it shows and not only through the text next to it. Every answer carries inline citations that name the document, the page, and whether the source was a figure.

\## My role

I was the lead architect. I designed the system architecture and agent contracts, and implemented the RAG pipeline, the LangGraph orchestration, the FastAPI backend and user interface, the Docker setup, and the Environmental Agent.

\## Evaluation

We tested MAScan on 25 published business case studies against two baselines using the same model: one without tools, and one with built-in web search. MAScan produced significantly deeper analyses than both, which suggests that specialised agents improve reasoning quality. On overall quality, it only matched the web baseline because our own search tool was weaker than a commercial one that ranks and filters pages before the model sees them, and because the system traded factor coverage for depth.

The takeaway: specialisation alone is not enough without strong evidence retrieval.
