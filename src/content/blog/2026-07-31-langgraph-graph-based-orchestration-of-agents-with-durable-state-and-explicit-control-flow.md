---
title: "LangGraph: Graph-Based Orchestration of Agents with Durable State and
  Explicit Control Flow"
date: 2026-08-01
description: "What I learned while building an agentic retrieval pipeline with
  LangGraph: why an explicit control flow is more reliable than agent autonomy,
  and why the recursion limit is not a loop counter."
tags:
  - LangGraph
  - LLM Agents
  - Agentic Systems
  - LangChain
  - RAG
  - Python
categories:
  - AI Agents
draft: false
---
A simple retrieval pipeline runs in one direction only. The system retrieves documents, generates an answer, and stops. This design works until the retrieved documents are not relevant. In that case, the system should first check the quality of the evidence. If the evidence is weak, it should return to the retrieval step with a better query. [Corrective retrieval](https://arxiv.org/abs/2401.15884) follows exactly this idea.

This step backwards is the technical problem. A chain is an acyclic structure, so it cannot express a cycle. Corrective retrieval needs three things that a chain does not offer: a cycle, a routing decision made at runtime, and a state that survives between iterations.

This post describes how [LangGraph](https://docs.langchain.com/oss/python/langgraph/overview) solves this problem, what the solution costs, and which detail cost me the most time. It is based on my work for the seminar "LLM-based Agentic Systems" at TU Berlin, where I built an agentic retrieval pipeline with the framework.

## Why not let the model decide

One obvious alternative is to give control to the model. A developer could give an agent a retriever and a prompt that tells it to search again when the results are poor.

There is evidence against this approach. [Cemri et al.](https://arxiv.org/abs/2503.13657) analysed more than 1,600 execution traces of systems with several agents. They report that most failures follow from the design of the system and not from the ability of the model. Typical causes are unclear specifications, unclear termination conditions, and agents that ignore each other. The bottleneck is therefore the orchestration layer.

LangGraph reacts to this observation. It moves the control flow out of the prompt and into code that a developer can read and test. Frameworks that are organised by roles, such as [CrewAI](https://docs.crewai.com/en/concepts/flows), hide the control flow behind roles and tasks. LangGraph asks the developer to write it down.

## Three parts of a LangGraph application

The [graph API](https://docs.langchain.com/oss/python/langgraph/graph-api) defines three building blocks.

**Nodes are ordinary Python functions.** There is no base class and no agent interface that a developer must implement. A node receives the state and returns an update. The content of the function is not restricted. It can be deterministic code, a single call to a model, a database query, or a complete agent that is wrapped as a [subgraph](https://docs.langchain.com/oss/python/langgraph/use-subgraphs). For this reason, deterministic steps and steps that are driven by an agent can live in the same graph.

**All communication passes through one typed state.** LangGraph does not send messages between agents. Instead, all nodes read from and write to one object. The developer declares this object as a TypedDict or as a Pydantic model. A node returns a partial update instead of changing the object in place, and every key is merged by its own reducer function.

```python
from typing import Annotated, TypedDict
from operator import add

class GraphState(TypedDict):
    question: str
    documents: Annotated[list[str], add]   # new documents are appended
    retry_count: int                       # value is replaced
    answer: str
```

The annotation on the second field is the interesting part. The merge behaviour is declared once in the schema. It does not have to be implemented again in every node that writes to the field. In a framework that is organised around a conversation, such as [AutoGen](https://arxiv.org/abs/2308.08155), the context grows implicitly with the message history. Here the developer decides for each field whether a write appends or replaces.

**Edges define what runs next.** A static edge fixes the successor at build time. A conditional edge gives this decision to a function that inspects the state.

```python
def route_after_grading(state: GraphState) -> str:
    if state["relevant"]:
        return "generate"
    if state["retry_count"] >= 3:
        return "generate"          # answer with the available evidence
    return "rewrite_query"         # go back and try again

builder.add_conditional_edges("grade", route_after_grading)
```

Two properties of this function deserve attention. First, the retry limit is a comparison of two integers in Python and not an instruction inside a prompt, so the model can not ignore it. Second, the decision to answer or to search again is application logic, and this is where such a decision belongs.

The compiled graph then runs in discrete supersteps. This execution model follows the [Pregel](https://doi.org/10.1145/1807167.1807184) system that Google published.

## The design decision behind most features

A checkpointer writes the complete state to storage after every step. At first this looks like an implementation detail. In practice it is the decision from which most features of the framework follow, as the documentation on [persistence](https://docs.langchain.com/oss/python/langgraph/persistence) shows.

1. **Replay and inspection.** A developer can read the state as it was after step seven.
2. **Recovery.** A run that failed in step twelve continues from step eleven and not from the beginning.
3. **A review gate that can be resumed.** An [interrupt](https://docs.langchain.com/oss/python/langgraph/interrupts) pauses the thread, and a resume command continues it later, possibly in a different process. This is not a blocking call that waits for input, because the state is stored on disk.
4. **Two kinds of memory.** Checkpoints hold the state of one run, which LangGraph calls a thread. A separate store holds information across several runs.

One mechanism therefore produces four capabilities. In CrewAI, by comparison, [persistence is optional](https://docs.crewai.com/en/concepts/flows) and is added through a decorator, so these features are not available by default.

The cost is symmetric. Every intermediate value is stored, so both the size of the state and the effort of debugging grow when graphs are nested or when runs take a long time.

## The use case

My use case was a whale tracker. The system identifies Ethereum wallets with unusually large or unusually frequent transfers and drafts reports that are supported by evidence. The retrieval of news follows the corrective pattern that was described above. The graph retrieves documents, grades them, rewrites the query and retries up to a fixed limit, and then generates the report. A checkpoint is written after every step, and a human reviewer approves the report before it becomes final. The complete graph contains 19 nodes.

The pattern itself is not new. It appears throughout the literature on agentic retrieval, for example in [Corrective RAG](https://arxiv.org/abs/2401.15884) and in the [graph based RAG system of Jeong](https://arxiv.org/abs/2407.19994). The contribution of the framework was to make the loop explicit and the retry limit enforceable.

## A costly lesson: the recursion limit is not a loop counter

This was my most expensive misunderstanding, so it deserves its own section.

The [recursion limit](https://docs.langchain.com/oss/python/langgraph/graph-api) bounds the number of supersteps in one invocation of the graph. It does not bound the iterations of one loop. Every cycle in the graph draws on the same shared budget.

The consequence is important. An agent that calls tools and legitimately needs twenty iterations does not stop at its own limit. It consumes the shared budget and the complete run is aborted. The retrieval loop, the drafting step, and every later step are lost as well. Raising the limit for this one agent reduces the protection in the whole graph.

Two changes solved the problem.

1. **Wrap every agent in its own [subgraph](https://docs.langchain.com/oss/python/langgraph/use-subgraphs).** A subgraph is called like a node and receives its own budget. A loop that does not terminate is then contained in the place where it occurs instead of stopping the parent graph.
2. **Give every loop that is driven by a model its own counter in the state.** The retry counter in the schema above is not redundant. The recursion limit is a global emergency brake, while the counter is the real termination condition of this specific loop. Only the counter allows the system to end the loop in a controlled way, for example by answering with weak evidence and writing a log entry, instead of failing.

If a reader takes only one practical result from this post, it should be this one.

## Three further observations from practice

**The history of checkpoints is the most underrated feature.** A wrong answer can be analysed by reading the stored state of each step. It is not necessary to run the graph again with print statements and to hope that the model behaves in the same way twice.

**The autonomy of prebuilt agents is overrated.** I used a prebuilt agent that follows the [ReAct](https://arxiv.org/abs/2210.03629) pattern early in the project and replaced it step by step. In the final system the graph decided what ran and when, and the system became more reliable during this change.

**The granularity of nodes is a decision about observability.** Work that is merged into one node cannot be traced separately afterwards. The runtime [streams](https://docs.langchain.com/oss/python/langgraph/streaming) state updates and task events, and their aggregation into traces is delegated to [LangSmith](https://docs.langchain.com/oss/python/langgraph/observability), but no tool can separate work that was never split. Splitting a node is cheap before traces matter and expensive afterwards.

## Limits of the framework

The most stable part of the system was the topology. I replaced models, retrievers, and the data source without changing a single edge, because a node is an interface that hides its implementation.

The other side of this property is that the graph and the state schema must be designed completely before the first run. This is an advantage when the process is known in advance, because later changes stay inside the nodes. It is a disadvantage when the process is not yet clear. In addition, the set of nodes is fixed at build time, so workflows whose steps are only known at run time are not well supported.

[Pearson et al.](https://arxiv.org/abs/2607.19297) argue that the abstraction is not justified for a single prompt with one tool call, where a state schema and routing functions add concepts without making the application clearer. [Sapkota et al.](https://www.techrxiv.org/doi/abs/10.36227/techrxiv.175695645.52670060/v1) point to a related cost, because every intermediate value is persisted and the debugging effort grows once graphs are nested or run for a long time.

## Conclusion

LangGraph exchanges the autonomy of agents for control and durability. It fixes the graph and the state before the first run and stores that state after every step. Bounded self correction, replay, recovery, and a review gate that can be resumed all follow from this single decision, and so does the overhead.

The framework is a good choice when control, auditability, and recovery are requirements. It is not a good choice for prototypes, and it is not a good first framework for developers who are new to agentic systems, because the design effort has to be paid before the design is understood.

## References

**Documentation** (accessed 31 July 2026)

* LangChain. [LangGraph Documentation: Overview](https://docs.langchain.com/oss/python/langgraph/overview)
* LangChain. [Graph API Overview](https://docs.langchain.com/oss/python/langgraph/graph-api)
* LangChain. [Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
* LangChain. [Interrupts](https://docs.langchain.com/oss/python/langgraph/interrupts)
* LangChain. [Subgraphs](https://docs.langchain.com/oss/python/langgraph/use-subgraphs)
* LangChain. [Streaming](https://docs.langchain.com/oss/python/langgraph/streaming)
* LangChain. [LangSmith Observability](https://docs.langchain.com/oss/python/langgraph/observability)
* CrewAI. [Flows](https://docs.crewai.com/en/concepts/flows)

**Publications**

* Malewicz, G. et al. (2010). [Pregel: A System for Large-Scale Graph Processing](https://doi.org/10.1145/1807167.1807184). ACM SIGMOD, 135 to 146.
* Yao, S. et al. (2023). [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629). ICLR.
* Jeong, C. (2024). [A Study on the Implementation Method of an Agent-Based Advanced RAG System Using Graph](https://arxiv.org/abs/2407.19994). arXiv:2407.19994.
* Yan, S.-Q. et al. (2024). [Corrective Retrieval Augmented Generation](https://arxiv.org/abs/2401.15884). arXiv:2401.15884.
* Cemri, M. et al. (2025). [Why Do Multi-Agent LLM Systems Fail?](https://arxiv.org/abs/2503.13657). arXiv:2503.13657.
* Wu, Q. et al. (2023). [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155). arXiv:2308.08155.
* Pearson, D. et al. (2026). [Graph-Based Agentic AI with LangGraph: Workflow Pathways for Long-Running Stateful Business Processes](https://arxiv.org/abs/2607.19297). arXiv:2607.19297.
* Sapkota, R. et al. (2025). [LangChain vs. LangGraph vs. LangSmith: Taxonomies of Agentic AI Toolchains for End-to-End Orchestration](https://www.techrxiv.org/doi/abs/10.36227/techrxiv.175695645.52670060/v1). TechRxiv.
