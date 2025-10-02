---
title: 'Golang: Por que evitar variáveis globais com goroutines'
description: 'Descubra os perigos ocultos de usar variáveis globais em programas Go concorrentes que utilizam goroutines. Aprenda sobre race conditions e explore alternativas mais seguras e idiomáticas para gerenciar estado compartilhado.'
pubDate: 2025-08-28T00:00:00.000Z
author: 'Miguel Machado'
layout: 'post'
mainClass: 'go'
color: '#007d9c'
tags: ['go', 'concurrency']
draft: false
---

# Golang: Por que evitar variáveis globais com goroutines

Concorrência é um dos pontos fortes de Go, mas também pode ser uma fonte de bugs difíceis de detectar quando não usamos as práticas corretas.

## O Problema com Variáveis Globais

### Exemplo Problemático

```go
package main

import (
    "fmt"
    "sync"
)

var counter int // ⚠️ Variável global!

func increment() {
    counter++ // Race condition!
}

func main() {
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            increment()
        }()
    }

    wg.Wait()
    fmt.Println(counter) // Resultado imprevisível!
}
```

## Por que isso é um problema?

### Race Conditions

Quando múltiplas goroutines acessam e modificam a mesma variável simultaneamente:

1. **Goroutine A** lê `counter = 5`
2. **Goroutine B** lê `counter = 5`
3. **Goroutine A** incrementa para 6
4. **Goroutine B** incrementa para 6

Resultado: Duas incrementações, mas `counter = 6` (deveria ser 7)!

## Detectando Race Conditions

Use a flag `-race` do Go:

```bash
go run -race main.go
```

Output:

```
==================
WARNING: DATA RACE
Read at 0x... by goroutine 7:
  main.increment()
Previous write at 0x... by goroutine 6:
  main.increment()
==================
```

## Soluções Idiomáticas

### 1. Mutexes

Use `sync.Mutex` para proteger acesso:

```go
package main

import (
    "fmt"
    "sync"
)

type Counter struct {
    mu    sync.Mutex
    value int
}

func (c *Counter) Increment() {
    c.mu.Lock()
    defer c.mu.Unlock()
    c.value++
}

func (c *Counter) Value() int {
    c.mu.Lock()
    defer c.mu.Unlock()
    return c.value
}

func main() {
    var wg sync.WaitGroup
    counter := &Counter{}

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            counter.Increment()
        }()
    }

    wg.Wait()
    fmt.Println(counter.Value()) // 1000 (correto!)
}
```

### 2. Atomic Operations

Para operações simples, use `sync/atomic`:

```go
package main

import (
    "fmt"
    "sync"
    "sync/atomic"
)

func main() {
    var counter int64
    var wg sync.WaitGroup

    for i := 0; i < 1000; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            atomic.AddInt64(&counter, 1)
        }()
    }

    wg.Wait()
    fmt.Println(atomic.LoadInt64(&counter)) // 1000
}
```

### 3. Channels (Recomendado!)

A forma mais idiomática em Go:

```go
package main

import "fmt"

func worker(jobs <-chan int, results chan<- int) {
    for j := range jobs {
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // Inicia workers
    for w := 1; w <= 3; w++ {
        go worker(jobs, results)
    }

    // Envia trabalho
    for j := 1; j <= 5; j++ {
        jobs <- j
    }
    close(jobs)

    // Coleta resultados
    for a := 1; a <= 5; a++ {
        fmt.Println(<-results)
    }
}
```

### 4. Context para Estado da Requisição

```go
package main

import (
    "context"
    "fmt"
)

type userKeyType string

const userKey userKeyType = "user"

func ProcessRequest(ctx context.Context) {
    user := ctx.Value(userKey).(string)
    fmt.Printf("Processing request for: %s\n", user)
}

func main() {
    ctx := context.WithValue(context.Background(), userKey, "john")
    ProcessRequest(ctx)
}
```

## Padrões Comuns

### Worker Pool

```go
func workerPool(numWorkers int, jobs <-chan int, results chan<- int) {
    var wg sync.WaitGroup

    for i := 0; i < numWorkers; i++ {
        wg.Add(1)
        go func() {
            defer wg.Done()
            for j := range jobs {
                results <- process(j)
            }
        }()
    }

    wg.Wait()
    close(results)
}
```

### Fan-out, Fan-in

```go
func fanOut(in <-chan int, numWorkers int) []<-chan int {
    channels := make([]<-chan int, numWorkers)

    for i := 0; i < numWorkers; i++ {
        ch := make(chan int)
        channels[i] = ch

        go func(c chan<- int) {
            defer close(c)
            for val := range in {
                c <- process(val)
            }
        }(ch)
    }

    return channels
}

func fanIn(channels ...<-chan int) <-chan int {
    out := make(chan int)
    var wg sync.WaitGroup

    wg.Add(len(channels))
    for _, ch := range channels {
        go func(c <-chan int) {
            defer wg.Done()
            for val := range c {
                out <- val
            }
        }(ch)
    }

    go func() {
        wg.Wait()
        close(out)
    }()

    return out
}
```

## Checklist de Boas Práticas

- ✅ Use channels para comunicação
- ✅ Proteja estado compartilhado com mutexes
- ✅ Prefira atomic para operações simples
- ✅ Sempre rode testes com `-race`
- ✅ Evite variáveis globais mutáveis
- ✅ Use context para valores de requisição
- ✅ Documente decisões de concorrência

## Conclusão

Variáveis globais e goroutines não combinam bem! Go oferece ferramentas excelentes para concorrência segura:

- **Channels** para comunicação
- **Mutexes** para proteção de estado
- **Atomic** para operações simples
- **Context** para valores por requisição

Lembre-se: **"Don't communicate by sharing memory; share memory by communicating."**
