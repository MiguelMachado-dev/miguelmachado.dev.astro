---
title: "Microfrontends: Architecture for Scaling Teams and Applications"
description: "Understand how microfrontends allow multiple teams to work independently on the same application. Learn the main implementation strategies (Module Federation, Single-SPA, Web Components), communication patterns, and when this architecture makes sense for your project."
pubDate: 2025-12-08T10:00:00.000Z
author: Miguel Machado
layout: post
mainClass: architecture
color: "#0ea5e9"
tags: ['microfrontends', 'architecture', 'react', 'webpack', 'module-federation', 'frontend', 'scalability', 'web-components']
slug: "microfrontends-architecture-scaling-teams-applications"
translationId: "microfrontends-arquitetura-para-escalar-times-e-aplicacoes"
draft: false
---

Have you ever worked on a frontend project where deploying a simple fix required coordination with three different teams? Or where the application bundle grew so large that build time went from minutes to tens of minutes? These are classic symptoms of a **frontend monolith** reaching its limits.

Microfrontends emerge as an architectural response to these problems. In this post, we'll explore the fundamentals, the main implementation strategies, and when this approach really makes sense.

## The Problem: Frontend Monoliths

Consider a typical e-commerce application. It has:

- Product catalog
- Shopping cart
- Checkout and payments
- User area (profile, orders, favorites)
- Search and filter system
- Personalized recommendations

In a traditional SPA (Single Page Application) architecture, all of this lives in a single repository, with a single build, resulting in a single JavaScript bundle.

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND MONOLITH                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Catalog  │ │   Cart   │ │ Checkout │ │    User Area     │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘   │
│  ┌──────────┐ ┌──────────────────────┐ ┌──────────────────┐    │
│  │  Search  │ │    Recommendations   │ │  UI Components   │    │
│  └──────────┘ └──────────────────────┘ └──────────────────┘    │
│                                                                 │
│  package.json (100+ dependencies)                               │
│  Build time: 15+ minutes                                        │
│  Bundle size: 2MB+ (gzipped)                                    │
└─────────────────────────────────────────────────────────────────┘
```

This works well at first, but as the application and team grow, problems arise:

### Organizational Problems

- **Team coupling**: The checkout team needs to wait for the catalog team to finish merging before deploying
- **Constant conflicts**: Multiple teams changing the same files (routes, global store, shared components)
- **Diluted ownership**: Who's responsible when something breaks in production?

### Technical Problems

- **Slow build**: Every change requires rebuilding the entire application
- **Giant bundle**: Users download code for features they'll never use
- **Technology coupling**: Upgrading React from 17 to 18 affects the entire application at once
- **Slow tests**: The complete test suite runs on all changes

## What are Microfrontends?

Microfrontends apply microservices principles to the frontend. The idea is to divide the application into smaller, independent parts, each capable of being:

- **Developed** by autonomous teams
- **Tested** in isolation
- **Deployed** independently
- **Built** with different technologies (if necessary)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SHELL / CONTAINER                              │
│   (Orchestrates microfrontends, manages routes and communication)       │
└─────────────────────────────────────────────────────────────────────────┘
         │              │               │              │
         ▼              ▼               ▼              ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│  MF-Catalog │ │   MF-Cart   │ │ MF-Checkout │ │  MF-Account │
│   (React)   │ │   (React)   │ │   (React)   │ │   (Vue)     │
│  Team: A    │ │  Team: B    │ │  Team: C    │ │  Team: D    │
│  Deploy: ✓  │ │  Deploy: ✓  │ │  Deploy: ✓  │ │  Deploy: ✓  │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
     Repo A         Repo B          Repo C          Repo D
```

> **Key concept**: Each microfrontend is a complete vertical unit, from UI component to API communication. Teams own features, not layers.

## Implementation Strategies

There are several ways to implement microfrontends. Let's explore the main ones:

### 1. Module Federation (Webpack 5)

Module Federation is the most modern and powerful approach for microfrontends. It allows Webpack applications to share code at runtime, loading modules from other applications dynamically.

```javascript
// webpack.config.js of SHELL (container application)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        // Loads microfrontends from remote URLs at runtime
        catalog: 'catalog@http://localhost:3001/remoteEntry.js',
        cart: 'cart@http://localhost:3002/remoteEntry.js',
        checkout: 'checkout@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        // Shared dependencies - loaded only once
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-router-dom': { singleton: true, requiredVersion: '^6.0.0' },
      },
    }),
  ],
};
```

### 2. Single-SPA

Single-SPA is a meta-framework that orchestrates multiple SPAs on a single page. Each microfrontend registers its lifecycles (bootstrap, mount, unmount) and Single-SPA manages when each should be activated.

### 3. Web Components

Web Components offer native browser encapsulation through Custom Elements and Shadow DOM. Each microfrontend is packaged as a custom element that can be used anywhere.

## Communication Between Microfrontends

One of the biggest challenges in microfrontends is communication. How does the cart know when a product was added from the catalog?

### Custom Events (Event Bus)

The simplest and most decoupled approach is using the browser's Custom Events:

```typescript
// shared/event-bus.ts
export interface MicrofrontendEvents {
  'cart:item-added': { productId: string; quantity: number; price: number };
  'cart:item-removed': { productId: string };
  'cart:cleared': void;
  'user:logged-in': { userId: string; name: string };
  'user:logged-out': void;
  'navigation:requested': { path: string; params?: Record<string, string> };
}

class EventBus {
  emit<K extends keyof MicrofrontendEvents>(
    event: K,
    data: MicrofrontendEvents[K]
  ): void {
    window.dispatchEvent(
      new CustomEvent(`mf:${String(event)}`, {
        detail: data,
        bubbles: true,
      })
    );
  }

  on<K extends keyof MicrofrontendEvents>(
    event: K,
    callback: (data: MicrofrontendEvents[K]) => void
  ): () => void {
    const handler = ((e: CustomEvent) => callback(e.detail)) as EventListener;
    window.addEventListener(`mf:${String(event)}`, handler);
    return () => window.removeEventListener(`mf:${String(event)}`, handler);
  }
}

export const eventBus = new EventBus();
```

## Trade-offs and When to Use

### Advantages

- **Team autonomy**: Independent deploy, independent technologies
- **Organizational scalability**: Teams can grow without stepping on each other's toes
- **Resilience**: Failure in one MF doesn't bring down the entire application
- **Perceived performance**: Natural code splitting by domain
- **Gradual migration**: Allows modernizing parts of the application incrementally

### Disadvantages

- **Operational complexity**: More repos, more pipelines, more infrastructure
- **Potential duplication**: Without care, you end up with N versions of similar components
- **Initial performance**: Multiple bundles can mean more requests
- **Difficult debugging**: Tracing bugs that cross MF boundaries is more complex
- **UX consistency**: Maintaining consistent design system requires discipline

### When to use

**Use microfrontends when:**
- Multiple teams (3+) work on the same application
- Teams need real deploy autonomy
- The application is large enough to justify the complexity
- You're gradually migrating a legacy
- Different parts of the application have different release cycles

**Don't use when:**
- Small team (< 5 people)
- Simple application or MVP
- No real need for independent deploy
- The coordination overhead is greater than the benefit

## Conclusion

Microfrontends aren't a silver bullet. They're an architectural tool for solving specific scale problems, both technical and organizational. The additional complexity is only justified when the benefits of autonomy and independent deploy outweigh the coordination cost.

If you're starting a new project with a small team, you probably don't need microfrontends. But if you work in an organization where multiple teams need to deliver features independently in the same application, this architecture can be the key to unlocking delivery speed.

The best architecture is one that solves your context's real problems. Understand the trade-offs, evaluate your scenario, and make a conscious decision.

---

**What about you?** Have you worked with microfrontends? What challenges did you encounter?
