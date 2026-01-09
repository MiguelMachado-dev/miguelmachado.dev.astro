---
title: "Golang: Why to Avoid Global Variables with Goroutines"
description: "Discover the hidden dangers of using global variables in concurrent Go programs that use goroutines. Learn about race conditions and explore safer and more idiomatic alternatives for managing shared state."
pubDate: 2025-04-14T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: go
color: "#007d9c"
tags: ['golang', 'goroutines', 'concurrency', 'global variables', 'race condition', 'best practices']
slug: "golang-why-avoid-global-variables-goroutines"
translationId: "golang-por-que-evitar-variaveis-globais-com-goroutines"
draft: false
---

# Introduction: The Power and Danger of Concurrency in Go

Go shines when it comes to concurrency. With its simple syntax and powerful concept of *goroutines* and *channels*, creating programs that execute multiple tasks simultaneously becomes incredibly accessible. Goroutines are functions or methods that run concurrently with other functions or methods. They are lightweight, allowing you to run thousands, even millions of them, in a single application.

However, this ease brings responsibilities. One of the most common and dangerous anti-patterns when working with concurrency in Go is the inappropriate use of global variables shared between multiple goroutines. While they may seem convenient at first glance, they are an almost certain recipe for headaches, hard-to-track bugs, and unpredictable behavior.

In this article, we'll explore why you should think twice (or three times!) before using global variables in your concurrent Go programs and what safer and more robust alternatives exist.

## The Core Problem: Race Conditions

The main villain when sharing global variables between goroutines without proper synchronization is the **race condition**.

A race condition occurs when:

1.  Multiple goroutines access the same shared resource (in this case, a global variable).
2.  At least one of these goroutines is *modifying* the resource.
3.  There is no explicit synchronization to control access to this resource.

The result? The order of read and write operations becomes non-deterministic, depending on how the Go scheduler decides to execute the goroutines. This leads to inconsistent and often incorrect results that may vary with each program execution.

Imagine two goroutines trying to increment a global counter `counter := 0` at the same time:

*   Goroutine A reads `counter` (value 0).
*   Goroutine B reads `counter` (value 0).
*   Goroutine A calculates `0 + 1 = 1`.
*   Goroutine B calculates `0 + 1 = 1`.
*   Goroutine A writes `1` to `counter`.
*   Goroutine B writes `1` to `counter`.

We expected the result to be 2, but due to the race condition, the final result is 1.

### Practical Example (Problematic)

Let's see a code example that demonstrates this problem:

```go
package main

import (
	"fmt"
	"sync"
	"time"
)

// Shared global variable
var globalCounter int

func main() {
	var wg sync.WaitGroup
	numberOfGoroutines := 1000

	wg.Add(numberOfGoroutines)

	for i := 0; i < numberOfGoroutines; i++ {
		go func() {
			defer wg.Done()
			// Non-atomic operation that causes the race condition
			currentValue := globalCounter
			// Small delay to increase the chance of race condition occurring
            time.Sleep(time.Microsecond)
			currentValue++
			globalCounter = currentValue
		}()
	}

	wg.Wait() // Wait for all goroutines to finish

	fmt.Printf("Expected final value (theoretically): %d\n", numberOfGoroutines)
	fmt.Printf("Actual final counter value: %d\n", globalCounter)
}
```

If you run this code (`go run main.go`), you'll notice that the "Actual final counter value" will rarely (or never) be 1000. The value will be inconsistent with each execution.

**Detecting Race Conditions:** Fortunately, Go has a built-in tool to detect race conditions. Run the code with the `-race` flag:

```bash
go run -race main.go
```

You'll probably see a warning like `WARNING: DATA RACE`, indicating exactly where the conflicting reads and writes are occurring.

### Negative Impacts of Using Globals with Goroutines

Besides obvious race conditions, using global variables in concurrent scenarios brings other problems:

1.  **Unpredictable Results:** As we've seen, the final state of the variable is uncertain.
2.  **Difficult Debugging:** Race conditions are notoriously hard to debug because they're timing-sensitive and may not occur consistently.
3.  **Reduced Maintainability:** Global state makes code harder to understand and reason about. It's unclear which parts of the code can modify the variable, making refactoring and adding features riskier.
4.  **Compromised Testability:** Unit tests become more complex, as global state can leak between tests or require complicated setups to isolate the component being tested.

### Safe and Idiomatic Alternatives

Fortunately, Go offers excellent mechanisms for safely managing shared state in concurrent environments.

**1. Explicit Variable Passing (Preferred)**

The most idiomatic and generally safest way is to avoid shared global state whenever possible. Instead, pass the necessary data as parameters to goroutines and return results through channels or other means.

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic" // Package for atomic operations
)

func worker(id int, counter *int64, wg *sync.WaitGroup) {
	defer wg.Done()
	// Safe atomic operation for incrementing
	atomic.AddInt64(counter, 1)
	// fmt.Printf("Worker %d incremented\n", id) // Optional
}

func main() {
	var counter int64 // Using int64 for atomic compatibility
	var wg sync.WaitGroup
	numberOfGoroutines := 1000

	wg.Add(numberOfGoroutines)

	for i := 0; i < numberOfGoroutines; i++ {
		// Passing counter pointer to the goroutine
		go worker(i, &counter, &wg)
	}

	wg.Wait()

	fmt.Printf("Expected final value: %d\n", numberOfGoroutines)
	fmt.Printf("Actual final counter value: %d\n", counter)
}
```

In this example (using `sync/atomic` for safe incrementing), we pass a pointer to the counter, making the dependency explicit. Note that even when passing a pointer, the *operation* itself needs to be concurrency-safe (hence using `atomic.AddInt64`).

**2. Atomic Operations (`sync/atomic`)**

For simple operations like increment, decrement, and value replacement, the `sync/atomic` package offers functions that guarantee atomicity without the need for explicit mutexes:

```go
package main

import (
	"fmt"
	"sync"
	"sync/atomic"
)

func main() {
	var counter int64 // Using int64 for atomic compatibility
	var wg sync.WaitGroup
	numberOfGoroutines := 1000

	wg.Add(numberOfGoroutines)

	for i := 0; i < numberOfGoroutines; i++ {
		go func() {
			defer wg.Done()
			// Atomic operation - safe increment without mutex
			atomic.AddInt64(&counter, 1)
		}()
	}

	wg.Wait()

	fmt.Printf("Expected final value: %d\n", numberOfGoroutines)
	fmt.Printf("Actual final counter value: %d\n", counter)
}
```

This approach is more efficient than using mutexes for simple operations, as it avoids complete blocking, using specific processor instructions to guarantee atomicity.

**3. Channels**

Channels are the preferred way in Go for communication *between* goroutines. They can be used to pass data or synchronize execution.

*"Don't communicate by sharing memory; instead, share memory by communicating."* - Effective Go

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	numberOfGoroutines := 1000
	requests := make(chan bool) // Channel to send "increment requests"
	done := make(chan bool)     // Channel to signal completion
	var wg sync.WaitGroup      // WaitGroup to ensure all worker goroutines finish

	// Goroutine to manage the counter centrally
	go func() {
		counter := 0
		for i := 0; i < numberOfGoroutines; i++ {
			<-requests // Wait for a request
			counter++
		}
		fmt.Printf("Actual final counter value: %d\n", counter)
		done <- true // Signal completion
	}()

	// Launch "worker" goroutines
	wg.Add(numberOfGoroutines)
	for i := 0; i < numberOfGoroutines; i++ {
		go func() {
			defer wg.Done()
			requests <- true // Send an increment request
		}()
	}

	// Wait for all worker goroutines to finish
	wg.Wait()

	// Wait for the manager goroutine to finish
	<-done
	fmt.Printf("Expected final value: %d\n", numberOfGoroutines)
}
```

In this model, only one goroutine modifies the state, and the others communicate with it through a channel, eliminating the race condition.

**4. Synchronization Primitives (`sync` package)**

If you *really* need to share memory (perhaps for performance reasons or complex data structures), use the synchronization primitives from the `sync` package, like `sync.Mutex` or `sync.RWMutex`.

A `Mutex` (Mutual Exclusion) ensures that only one goroutine can access the critical section (the code that modifies the shared variable) at a time.

```go
package main

import (
	"fmt"
	"sync"
)

var globalCounter int
var mutex sync.Mutex // Mutex to protect globalCounter

func incrementCounter() {
	// Lock the mutex before accessing the global variable
	mutex.Lock()
	// --- Critical Section ---
	globalCounter++ // Direct increment
	// --- End of Critical Section ---
	mutex.Unlock() // Release the mutex
}

func main() {
	var wg sync.WaitGroup
	numberOfGoroutines := 1000

	wg.Add(numberOfGoroutines)

	for i := 0; i < numberOfGoroutines; i++ {
		go func() {
			defer wg.Done()
			incrementCounter()
		}()
	}

	wg.Wait()

	fmt.Printf("Expected final value: %d\n", numberOfGoroutines)
	fmt.Printf("Actual final counter value: %d\n", globalCounter)
}
```

This code now produces the correct result (1000), as access to `globalCounter` is protected by the `mutex`. However, excessive use of mutexes can lead to contention and performance bottlenecks, as well as introduce the possibility of *deadlocks* if not used correctly.

### When Global Variables *May* Be Acceptable (With Caution)

There are some situations where global variables can be used with less risk, even in concurrent programs:

1.  **Constants:** Global variables declared as `const` are immutable and, therefore, safe to be read by multiple goroutines.
2.  **Immutable Configuration:** Global variables that are initialized once at the beginning of the program (before any goroutine accesses them) and then treated as *read-only* for the rest of the program's execution. Examples include configurations loaded from files or environment variables. It's crucial to ensure that no goroutine attempts to modify them after initialization.

Even in these cases, it's important to clearly document the immutable or *read-only* nature of these variables.

### Conclusion

Global variables may seem like an easy solution for sharing state between different parts of a program, but when combined with the concurrency of goroutines in Go, they become a significant source of complex and hard-to-track bugs, mainly due to race conditions.

To write robust, safe, and maintainable concurrent Go code:

*   **Prefer explicitly passing data** as parameters to goroutines.
*   **Use channels** for communication and synchronization between goroutines.
*   **Resort to synchronization primitives** (`sync.Mutex`, `sync.RWMutex`, `sync.atomic`) with caution when memory sharing is strictly necessary, carefully protecting access to shared data.
*   **Limit the use of global variables** to true constants or immutable configurations initialized at the beginning of the program.

Adopting these practices will not only avoid the pitfalls of race conditions but will also lead to clearer, more testable, and easier to understand and maintain code in the long run. Think about concurrency safety from the start of your Go design!

---
