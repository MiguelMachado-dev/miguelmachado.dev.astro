---
title: "Mastering Advanced Hooks: useCallback, useMemo, and useRef in Real React Scenarios"
description: "Go beyond useState and useEffect! Learn how to optimize your React applications with practical examples of useCallback, useMemo, and useRef in TypeScript, understanding when and why to use them to avoid unnecessary re-renders and manage references."
pubDate: 2025-04-09T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: js
color: "#a29330"
image: ../../../assets/img/dominando-hooks-avan-ados-usecallback-usememo-e-useref-em-cen-rios-reais-no-react.png
tags: ['react', 'hooks', 'usecallback', 'usememo', 'useref', 'performance optimization']
slug: "mastering-advanced-hooks-react"
draft: false
---

# Introduction: Beyond Basic Hooks

If you've been working with React for a while, `useState` and `useEffect` are probably your daily companions. They form the foundation of state logic and lifecycle in functional components. However, as applications grow in complexity, performance challenges arise, mainly related to unnecessary re-renders.

This is where the "advanced" Hooks come in: `useCallback`, `useMemo`, and `useRef`. They're not necessarily more complex to use, but their main purpose is **optimization** and managing specific scenarios that basic Hooks don't directly cover.

In this article, we'll explore each of these Hooks with practical TypeScript examples, focusing on real scenarios where they shine and help create more efficient and robust React applications.

## Understanding Re-renders in React

Before diving into optimization Hooks, it's crucial to understand why a React component re-renders:

1. **State Change:** When a component's state (managed by `useState` or `useReducer`) changes.
2. **Props Change:** When props received from a parent component are changed. **Important:** React uses reference comparison (`Object.is`) for objects and functions. This means `{} !== {}` and `() => {} !== () => {}` (always `false`).
3. **Parent Re-render:** When a parent component re-renders, its children also re-render by default, unless optimizations are applied (like `React.memo`).
4. **Context Update:** When a context value that the component consumes is changed.

The problem arises when re-renders occur without real necessity, such as passing a new function instance (even with the same logic) to an optimized child component, or recalculating complex values on every render.

## useCallback: Memoizing Functions

**What does it do?** `useCallback` returns a *memoized* version of the callback function you passed. This memoized function only changes if one of its dependencies (listed in the dependency array) is changed.

**Why use it?**
Mainly to optimize child components that depend on callbacks passed as props. If you pass a function defined directly in the parent component's body to a child wrapped in `React.memo`, the child will re-render on every parent render, since the function will be a new instance each time (fails reference comparison). `useCallback` ensures the same function instance is passed as long as dependencies don't change.

**Real Scenario:** Passing an event handler to a memoized list item component.

```typescript
import React, { useState, useCallback } from 'react';

// Interface for child component props
interface ListItemProps {
  item: { id: number; text: string };
  onRemove: (id: number) => void; // Callback
}

// Memoized child component to avoid unnecessary re-renders
const ListItem = React.memo(({ item, onRemove }: ListItemProps) => {
  console.log(`Rendering Item: ${item.id}`);
  return (
    <li>
      {item.text}
      <button onClick={() => onRemove(item.id)}>Remove</button>
    </li>
  );
});

// Parent Component
const ListComponent: React.FC = () => {
  const [items, setItems] = useState([
    { id: 1, text: 'Item 1' },
    { id: 2, text: 'Item 2' },
  ]);
  const [newItemText, setNewItemText] = useState('');

  // WITHOUT useCallback: A new `handleRemove` function is created on EVERY ListComponent render.
  // This would cause ALL `ListItem`s to re-render when something in the parent changes (e.g., typing in input).
  // const handleRemove = (id: number) => {
  //   setItems(prevItems => prevItems.filter(item => item.id !== id));
  // };

  // WITH useCallback: The `handleRemove` function is only recreated if dependencies change.
  // The same function reference is passed to `ListItem`s, allowing `React.memo` to work correctly.
  const handleRemove = useCallback((id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  }, []); // setItems is stable between renders, so it doesn't need to be here

  const handleAdd = () => {
      if (!newItemText.trim()) return;
      const newItem = { id: Date.now(), text: newItemText };
      setItems(prevItems => [...prevItems, newItem]);
      setNewItemText('');
  }

  console.log("Rendering ListComponent");

  return (
    <div>
      <input
        type="text"
        value={newItemText}
        onChange={(e) => setNewItemText(e.target.value)}
        placeholder="New item"
      />
      <button onClick={handleAdd}>Add</button>
      <ul>
        {items.map(item => (
          <ListItem key={item.id} item={item} onRemove={handleRemove} />
        ))}
      </ul>
    </div>
  );
};

export default ListComponent;
```

**Important notes:**

1. `useState` updater functions (like `setItems(prevItems => ...)`) are guaranteed to be stable by React, so they don't need to be listed in dependencies
2. If a callback needs to access state or prop values, those values need to be included in the dependency array
3. Ideal for avoiding renders in memoized components and reducing garbage collector work

**When not to use:** If the function isn't passed as a prop to a memoized component (`React.memo`), or if it's not used as a dependency in other Hooks (like `useEffect`), the cost of memoization usually outweighs the benefit.

## useMemo: Memoizing Computed Values

**What does it do?** `useMemo` returns a *memoized* value resulting from executing the function you passed. It recomputes the value only when one of the dependencies (listed in the dependency array) changes.

**Why use it?**
To avoid computationally expensive calculations on every render. If a calculation depends on props or state that don't change frequently, `useMemo` can store the result and return it directly on subsequent renders, saving processing time.

**Real Scenario:** Filtering or processing a large list of data that should only be recalculated when raw data or filter criteria change.

```typescript
import React, { useState, useMemo } from 'react';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
}

const initialProducts: Product[] = [
  // Imagine a very large list here (e.g., 1000+ products)
  { id: 1, name: "Gaming Laptop", category: "Electronics", price: 7500 },
  { id: 2, name: "Mouse Pad", category: "Accessories", price: 80 },
  { id: 3, name: "Mechanical Keyboard", category: "Electronics", price: 450 },
  { id: 4, name: "Ultrawide Monitor", category: "Electronics", price: 2200 },
  // ... more products
];

// Simulated "expensive" function (could be complex filtering, sorting, etc.)
const filterAndSortProducts = (products: Product[], categoryFilter: string): Product[] => {
  console.log(`--- Computing Filtered Products (Category: ${categoryFilter || 'All'}) ---`);

  // In a real case, this could be a truly intensive calculation
  const filtered = categoryFilter
    ? products.filter(p => p.category === categoryFilter)
    : products;

  return filtered.sort((a, b) => a.price - b.price); // Sort by price
};

const ProductList: React.FC = () => {
  const [products] = useState<Product[]>(initialProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [theme, setTheme] = useState<'light' | 'dark'>('light'); // State irrelevant to the list

  // WITHOUT useMemo: filterAndSortProducts would be called on EVERY render,
  // even when only `theme` changes, which is unnecessary and costly.
  // const visibleProducts = filterAndSortProducts(products, selectedCategory);

  // WITH useMemo: filterAndSortProducts is only called when `products` or `selectedCategory` change.
  // Changing `theme` won't cause recalculation.
  const visibleProducts = useMemo(() => {
    return filterAndSortProducts(products, selectedCategory);
  }, [products, selectedCategory]);

  // We can also memoize simpler derived values
  const productCount = useMemo(() => {
    return visibleProducts.length;
  }, [visibleProducts]);

  console.log("Rendering ProductList");

  return (
    <div style={{ background: theme === 'light' ? '#fff' : '#333', color: theme === 'light' ? '#000' : '#fff' }}>
      <h2>Product List ({productCount})</h2>
      <button onClick={() => setTheme(t => t === 'light' ? 'dark' : 'light')}>
        Toggle Theme ({theme})
      </button>

      <div>
        <label>Filter by Category: </label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">All</option>
          <option value="Electronics">Electronics</option>
          <option value="Accessories">Accessories</option>
        </select>
      </div>

      <ul>
        {visibleProducts.map(product => (
          <li key={product.id}>
            {product.name} ({product.category}) - ${product.price.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
```

**Additional use cases:**
1. Memoizing objects passed as props to memoized child components
2. Avoiding recreation of complex objects that cause re-renders when passed to other components
3. Preparing data in specific formats for charts or visualizations

**When not to use:** For simple and fast calculations. The overhead of `useMemo` can be greater than the benefit. Use only when the calculation is genuinely expensive or when referential stability is needed.

## useRef: Accessing DOM and Maintaining Mutable References

**What does it do?** `useRef` returns a mutable ref object whose `.current` property is initialized with the passed argument (initialValue). The returned object will persist throughout the component's lifecycle. **Important:** Changing a ref's `.current` property *doesn't* cause a new render.

**Why use it?**
1. **Accessing DOM Elements:** To interact directly with DOM nodes (e.g., focusing an input, measuring dimensions, integrating with non-React libraries).
2. **Maintaining Mutable Values:** To store a value that needs to persist between renders but shouldn't trigger a new render when changed (different from state).

**Real Scenario 1:** Automatically focusing an input field when the component mounts.

```typescript
import React, { useRef, useEffect } from 'react';

const AutoFocusInput: React.FC = () => {
  // Creates a ref. Initially, inputRef.current is null.
  // We specify the type of DOM element the ref will reference.
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Inside useEffect (which runs after DOM mount),
    // inputRef.current will point to the <input> element.
    // We use optional chaining (?.) for safety, in case the ref isn't assigned.
    inputRef.current?.focus();
  }, []); // Empty dependency array means it runs only once, after mount.

  return (
    <div>
      <label htmlFor="myInput">Auto-Focus Input: </label>
      {/* Associates the ref with the DOM input element */}
      <input ref={inputRef} type="text" id="myInput" />
    </div>
  );
};

export default AutoFocusInput;
```

**Real Scenario 2:** Storing the previous value of a prop or state.

```typescript
import React, { useState, useEffect, useRef } from 'react';

interface CounterProps {
    initialCount?: number;
}

const PreviousValueCounter: React.FC<CounterProps> = ({ initialCount = 0 }) => {
  const [count, setCount] = useState<number>(initialCount);
  // Ref to store the previous value of 'count'
  const prevCountRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    // This effect runs *after* render.
    // So we update the ref with the *current* value of 'count'
    // so that on the *next* render, the ref contains the previous value.
    prevCountRef.current = count;
  }, [count]); // Runs whenever 'count' changes

  // During render, prevCountRef.current still contains the value from the previous render.
  const prevCount = prevCountRef.current;

  return (
    <div>
      <p>Current Count: {count}</p>
      <p>Previous Count: {prevCount === undefined ? 'N/A' : prevCount}</p>
      <button onClick={() => setCount(c => c + 1)}>Increment</button>
    </div>
  );
};

export default PreviousValueCounter;
```

**Real Scenario 3:** Storing a reference to an interval (setInterval) to clear it later.

```typescript
import React, { useState, useEffect, useRef } from 'react';

const Timer: React.FC = () => {
  const [seconds, setSeconds] = useState(0);
  // The correct type for timers in TypeScript is NodeJS.Timeout
  // or use number and apply cast when necessary
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Start the timer
    intervalRef.current = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Cleanup function that will be executed when the component unmounts
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Runs only on mount

  const handleReset = () => {
    setSeconds(0);
  };

  return (
    <div>
      <p>Timer: {seconds} seconds</p>
      <button onClick={handleReset}>Reset</button>
    </div>
  );
};

export default Timer;
```

**When not to use:** To manage data that should trigger a visual update on screen when it changes – for that, use `useState` or `useReducer`.

## Correct Type for useRef with TypeScript

A common mistake in TypeScript is defining a ref for a DOM element without the correct type:

```typescript
// ❌ Incorrect - Doesn't allow null initially
const inputRef = useRef<HTMLInputElement>();

// ✅ Correct - The type includes null for the initial value
const inputRef = useRef<HTMLInputElement | null>(null);
```

Or when creating a ref to store a mutable value:

```typescript
// ❌ Incorrect - Doesn't specify undefined
const prevValueRef = useRef<number>();

// ✅ Correct - Correct type with initial value
const prevValueRef = useRef<number | undefined>(undefined);
```

## Beware of Premature Optimization

While `useCallback`, `useMemo`, and `useRef` are powerful tools, it's essential not to fall into the trap of **premature optimization**. React is already quite fast by default.

* **Don't use `useCallback` and `useMemo` everywhere.** They have a cost (creating the memoized function/value, comparing dependencies). Use them only when there's a *real* and measurable performance bottleneck, usually identified with profiling tools (React DevTools Profiler).
* **`React.memo` is often the prerequisite:** `useCallback` and `useMemo` are most effective when used with components optimized via `React.memo` or when `useEffect` dependencies need to be stable.
* **Simplicity first:** Start with the simplest code and optimize only where necessary.

## Recommended Practices and Common Patterns

### useCallback

1. **Avoid unnecessary dependencies**
   ```typescript
   // ❌ Suboptimal - includes unnecessary dependency
   const handleSubmit = useCallback(() => {
     console.log('Submitting...');
     setSubmitting(true);
   }, [setSubmitting]); // setSubmitting is stable, doesn't need to be here

   // ✅ Better - no unnecessary dependencies
   const handleSubmit = useCallback(() => {
     console.log('Submitting...');
     setSubmitting(true);
   }, []);
   ```

2. **Use with React.memo for maximum efficiency**
   ```typescript
   // Child component only re-renders if its props change
   const ChildComponent = React.memo(({ onClick }) => {
     return <button onClick={onClick}>Click me</button>;
   });

   function ParentComponent() {
     // This function maintains the same reference between renders
     const handleClick = useCallback(() => {
       console.log('Clicked!');
     }, []);

     return <ChildComponent onClick={handleClick} />;
   }
   ```

### useMemo

1. **Avoid unnecessary computations**
   ```typescript
   // ❌ Suboptimal - runs filterExpensiveItems on every render
   function ProductList({ products, threshold }) {
     const expensiveItems = products.filter(p => p.price > threshold);
     // ...
   }

   // ✅ Better - only recalculates when products or threshold change
   function ProductList({ products, threshold }) {
     const expensiveItems = useMemo(() => {
       return products.filter(p => p.price > threshold);
     }, [products, threshold]);
     // ...
   }
   ```

2. **Memoize objects passed as props**
   ```typescript
   // ❌ Suboptimal - creates a new object on every render
   function Parent() {
     const options = { sortBy: 'price', limit: 5 };
     return <Child options={options} />;
   }

   // ✅ Better - maintains the same reference if nothing changes
   function Parent() {
     const options = useMemo(() => {
       return { sortBy: 'price', limit: 5 };
     }, []);
     return <Child options={options} />;
   }
   ```

### useRef

1. **Store values without causing re-renders**
   ```typescript
   function ScrollTracker() {
     // Stores scroll position without causing re-renders
     const lastScrollY = useRef(0);

     useEffect(() => {
       const handleScroll = () => {
         const currentScrollY = window.scrollY;
         if (Math.abs(currentScrollY - lastScrollY.current) > 50) {
           console.log('Significant scroll detected');
           lastScrollY.current = currentScrollY;
         }
       };

       window.addEventListener('scroll', handleScroll);
       return () => window.removeEventListener('scroll', handleScroll);
     }, []);

     // ...
   }
   ```

2. **Integrations with third-party libraries**
   ```typescript
   function ChartComponent({ data }) {
     const chartRef = useRef(null);
     const chartInstanceRef = useRef(null);

     useEffect(() => {
       if (chartRef.current) {
         // Creating a chart library instance
         chartInstanceRef.current = new ChartLibrary(chartRef.current);
         chartInstanceRef.current.render(data);
       }

       // Cleanup when component unmounts
       return () => {
         if (chartInstanceRef.current) {
           chartInstanceRef.current.destroy();
         }
       };
     }, [data]);

     return <div ref={chartRef} />;
   }
   ```

## Conclusion

Mastering `useCallback`, `useMemo`, and `useRef` elevates your React skills, allowing you to create more performant applications and handle complex scenarios elegantly.

* **`useCallback`** is your ally for stabilizing function references, crucial for optimizing memoized child components and `useEffect` dependencies.
* **`useMemo`** shines by avoiding expensive recalculations, ensuring heavy operations only occur when their dependencies actually change.
* **`useRef`** offers a bridge to the DOM and a way to maintain mutable values that don't trigger re-renders.

Remember to use them with purpose, focusing on solving real performance problems or the need for stable references, and always measure the impact of your optimizations. With practice and understanding, these Hooks will become valuable tools in your React development arsenal.

---
