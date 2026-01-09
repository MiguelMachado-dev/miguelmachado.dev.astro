---
title: "Clean Architecture and Hexagonal Architecture: Building Software That Stands the Test of Time"
description: "Understand the principles behind Clean Architecture and Hexagonal Architecture (Ports and Adapters). Learn how these approaches isolate business rules from technical details, facilitate testing, and allow your software to evolve without complete rewrites."
pubDate: 2025-12-04T10:00:00.000Z
author: Miguel Machado
layout: post
mainClass: architecture
color: "#6366f1"
tags: ['architecture', 'clean-architecture', 'hexagonal', 'ports-and-adapters', 'ddd', 'golang', 'software-design', 'solid']
slug: "clean-architecture-hexagonal-architecture"
translationId: "clean-architecture-e-arquitetura-hexagonal"
draft: false
---

Have you ever worked on a project where switching the database seemed like an impossible task? Or where tests were so coupled to infrastructure that running the complete suite took forever? These are classic symptoms of an architecture that mixes business rules with technical details.

Clean Architecture and Hexagonal Architecture are approaches that tackle this problem head-on. In this post, we'll explore the fundamentals, understand the differences and similarities, and see in practice how to apply these concepts in Go.

## The Problem: Coupling to Details

Consider a common scenario: you have an application that uses PostgreSQL, exposes a REST API, and sends emails via SendGrid. Everything works fine until:

- The infrastructure team decides to migrate to MongoDB
- Marketing wants to use Mailchimp instead of SendGrid
- A new client needs a gRPC interface

If your business code is scattered between controllers, repositories, and services that directly know about Postgres, SendGrid, and HTTP, each of these changes becomes a nightmare. You're no longer evolving software; you're rewriting it.

```go
// Example of coupled code - DON'T DO THIS
func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req CreateUserRequest
    json.NewDecoder(r.Body).Decode(&req)

    // Business rule mixed with HTTP
    if len(req.Password) < 8 {
        http.Error(w, "password too short", http.StatusBadRequest)
        return
    }

    // Direct database access - strong coupling
    hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(req.Password), 12)
    _, err := h.db.Exec(`
        INSERT INTO users (email, password, created_at)
        VALUES ($1, $2, NOW())
    `, req.Email, hashedPassword)

    if err != nil {
        // Business rule knows Postgres details
        if strings.Contains(err.Error(), "unique constraint") {
            http.Error(w, "email already exists", http.StatusConflict)
            return
        }
        http.Error(w, "internal error", http.StatusInternalServerError)
        return
    }

    // Email sending coupled to HTTP handler
    h.sendgrid.Send(req.Email, "Welcome!", "...")

    w.WriteHeader(http.StatusCreated)
}
```

The code above works, but it's a house of cards. The rule "password needs 8 characters" is trapped inside an HTTP handler. The "duplicate email" logic depends on knowing Postgres error messages. And if we want to test user creation without spinning up a real database?

## Hexagonal Architecture: Ports and Adapters

Hexagonal Architecture, proposed by Alistair Cockburn in 2005, also known as "Ports and Adapters", solves this problem with an elegant idea: **the application core should know nothing about the external world**.

### The Hexagon

Imagine your application as a hexagon (the shape is arbitrary, what matters is the concept):

```
                    ┌─────────────────────────────────────┐
                    │           ADAPTERS (Driving)        │
                    │   HTTP Handler    gRPC Server       │
                    │   CLI Command     Message Consumer  │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │           PORTS (Input)             │
                    │   UserService    OrderService       │
                    │   (interfaces the core exposes)     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │                                     │
                    │        APPLICATION CORE             │
                    │     (Pure Business Rules)           │
                    │        Entities, UseCases           │
                    │                                     │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │           PORTS (Output)            │
                    │   UserRepository  EmailSender       │
                    │   (interfaces the core needs)       │
                    └──────────────┬──────────────────────┘
                                   │
                                   ▼
                    ┌─────────────────────────────────────┐
                    │          ADAPTERS (Driven)          │
                    │   PostgresRepo    SendGridAdapter   │
                    │   MongoRepo       InMemoryRepo      │
                    └─────────────────────────────────────┘
```

**Ports** are interfaces. Contracts that define how the external world can interact with the core (input ports) and how the core can interact with external services (output ports).

**Adapters** are concrete implementations of these interfaces. An HTTP adapter transforms HTTP requests into calls to input ports. A PostgreSQL adapter implements the repository port using SQL.

### Dependency Inversion in Practice

The secret lies in the **direction of dependencies**. The application core **defines** the interfaces (ports), and the adapters **implement** these interfaces. The core never imports anything from adapters.

```go
// domain/user.go - Domain Entity (core)
package domain

import (
    "errors"
    "time"
)

var (
    ErrInvalidEmail    = errors.New("invalid email")
    ErrWeakPassword    = errors.New("password must have at least 8 characters")
    ErrUserExists      = errors.New("user already exists")
    ErrUserNotFound    = errors.New("user not found")
)

type User struct {
    ID             string
    Email          string
    HashedPassword string
    CreatedAt      time.Time
    UpdatedAt      time.Time
}

// Business rule in the entity - where it belongs
func NewUser(email, hashedPassword string) (*User, error) {
    if !isValidEmail(email) {
        return nil, ErrInvalidEmail
    }

    return &User{
        Email:          email,
        HashedPassword: hashedPassword,
        CreatedAt:      time.Now(),
        UpdatedAt:      time.Now(),
    }, nil
}

func isValidEmail(email string) bool {
    // Simplified validation
    return len(email) > 3 && strings.Contains(email, "@")
}
```

```go
// ports/repositories.go - Output Port (interface defined by the core)
package ports

import (
    "context"
    "myapp/domain"
)

// The core DEFINES this interface
// External adapters IMPLEMENT it
type UserRepository interface {
    Save(ctx context.Context, user *domain.User) error
    FindByEmail(ctx context.Context, email string) (*domain.User, error)
    FindByID(ctx context.Context, id string) (*domain.User, error)
}

type PasswordHasher interface {
    Hash(password string) (string, error)
    Compare(hashedPassword, password string) error
}

type EmailSender interface {
    SendWelcomeEmail(ctx context.Context, to, userName string) error
}
```

```go
// application/user_service.go - Use Case (orchestrates the domain)
package application

import (
    "context"
    "myapp/domain"
    "myapp/ports"
)

type CreateUserInput struct {
    Email    string
    Password string
}

type CreateUserOutput struct {
    UserID string
    Email  string
}

type UserService struct {
    userRepo     ports.UserRepository
    hasher       ports.PasswordHasher
    emailSender  ports.EmailSender
}

func NewUserService(
    repo ports.UserRepository,
    hasher ports.PasswordHasher,
    sender ports.EmailSender,
) *UserService {
    return &UserService{
        userRepo:    repo,
        hasher:      hasher,
        emailSender: sender,
    }
}

func (s *UserService) CreateUser(ctx context.Context, input CreateUserInput) (*CreateUserOutput, error) {
    // Business rule: password validation
    if len(input.Password) < 8 {
        return nil, domain.ErrWeakPassword
    }

    // Check if user already exists
    existing, err := s.userRepo.FindByEmail(ctx, input.Email)
    if err != nil && err != domain.ErrUserNotFound {
        return nil, err
    }
    if existing != nil {
        return nil, domain.ErrUserExists
    }

    // Hash password through abstraction
    hashedPassword, err := s.hasher.Hash(input.Password)
    if err != nil {
        return nil, err
    }

    // Create domain entity
    user, err := domain.NewUser(input.Email, hashedPassword)
    if err != nil {
        return nil, err
    }

    // Persist through abstraction
    if err := s.userRepo.Save(ctx, user); err != nil {
        return nil, err
    }

    // Notify through abstraction (fire-and-forget or with handling)
    _ = s.emailSender.SendWelcomeEmail(ctx, user.Email, user.Email)

    return &CreateUserOutput{
        UserID: user.ID,
        Email:  user.Email,
    }, nil
}
```

Notice: `UserService` doesn't know if it's using PostgreSQL, MongoDB, or a mock. It doesn't know if emails go via SendGrid or are just logged to console. It only knows interfaces.

## Clean Architecture: Uncle Bob's Circles

Robert C. Martin (Uncle Bob) formalized similar concepts in 2012 with Clean Architecture. The central idea is the same: **dependencies point inward**.

```
┌───────────────────────────────────────────────────────────────┐
│                     FRAMEWORKS & DRIVERS                      │
│  (Web, UI, DB, Devices, External Interfaces)                  │
│  ┌───────────────────────────────────────────────────────┐   │
│  │               INTERFACE ADAPTERS                       │   │
│  │  (Controllers, Gateways, Presenters)                   │   │
│  │  ┌───────────────────────────────────────────────┐    │   │
│  │  │           APPLICATION BUSINESS RULES           │    │   │
│  │  │  (Use Cases)                                   │    │   │
│  │  │  ┌───────────────────────────────────────┐    │    │   │
│  │  │  │     ENTERPRISE BUSINESS RULES         │    │    │   │
│  │  │  │     (Entities)                        │    │    │   │
│  │  │  └───────────────────────────────────────┘    │    │   │
│  │  └───────────────────────────────────────────────┘    │   │
│  └───────────────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────────────┘
```

### The Four Circles

1. **Entities**: Enterprise business rules. They would exist even without software.

2. **Use Cases**: Application business rules. They orchestrate entities to perform specific tasks.

3. **Interface Adapters**: Convert data between the format of use cases and the format of external frameworks.

4. **Frameworks & Drivers**: Technical details. Database, web framework, UI.

### The Dependency Rule

**Code in inner circles cannot mention anything from outer circles.** This includes classes, functions, variables, or any software entity.

In practice, this means your entities don't import anything from your web framework. Your use cases don't know SQL. All communication with the external world happens through abstractions (interfaces) defined in the inner layers.

## Complete Adapter Implementation

Now let's see how adapters implement the interfaces:

```go
// adapters/postgres/user_repository.go
package postgres

import (
    "context"
    "database/sql"
    "myapp/domain"
    "myapp/ports"

    "github.com/google/uuid"
)

// Compile-time guarantee that PostgresUserRepository implements the interface
var _ ports.UserRepository = (*PostgresUserRepository)(nil)

type PostgresUserRepository struct {
    db *sql.DB
}

func NewPostgresUserRepository(db *sql.DB) *PostgresUserRepository {
    return &PostgresUserRepository{db: db}
}

func (r *PostgresUserRepository) Save(ctx context.Context, user *domain.User) error {
    if user.ID == "" {
        user.ID = uuid.New().String()
    }

    query := `
        INSERT INTO users (id, email, hashed_password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email) DO UPDATE SET
            hashed_password = EXCLUDED.hashed_password,
            updated_at = EXCLUDED.updated_at
    `

    _, err := r.db.ExecContext(ctx, query,
        user.ID,
        user.Email,
        user.HashedPassword,
        user.CreatedAt,
        user.UpdatedAt,
    )

    return err
}

func (r *PostgresUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
    query := `SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE email = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, email).Scan(
        &user.ID,
        &user.Email,
        &user.HashedPassword,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err == sql.ErrNoRows {
        return nil, domain.ErrUserNotFound
    }
    if err != nil {
        return nil, err
    }

    return &user, nil
}

func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
    query := `SELECT id, email, hashed_password, created_at, updated_at FROM users WHERE id = $1`

    var user domain.User
    err := r.db.QueryRowContext(ctx, query, id).Scan(
        &user.ID,
        &user.Email,
        &user.HashedPassword,
        &user.CreatedAt,
        &user.UpdatedAt,
    )

    if err == sql.ErrNoRows {
        return nil, domain.ErrUserNotFound
    }
    if err != nil {
        return nil, err
    }

    return &user, nil
}
```

```go
// adapters/bcrypt/hasher.go
package bcrypt

import (
    "myapp/ports"

    "golang.org/x/crypto/bcrypt"
)

var _ ports.PasswordHasher = (*BcryptHasher)(nil)

type BcryptHasher struct {
    cost int
}

func NewBcryptHasher(cost int) *BcryptHasher {
    return &BcryptHasher{cost: cost}
}

func (h *BcryptHasher) Hash(password string) (string, error) {
    hashedBytes, err := bcrypt.GenerateFromPassword([]byte(password), h.cost)
    return string(hashedBytes), err
}

func (h *BcryptHasher) Compare(hashedPassword, password string) error {
    return bcrypt.CompareHashAndPassword([]byte(hashedPassword), []byte(password))
}
```

```go
// adapters/http/user_handler.go
package http

import (
    "encoding/json"
    "errors"
    "net/http"

    "myapp/application"
    "myapp/domain"
)

type UserHandler struct {
    userService *application.UserService
}

func NewUserHandler(service *application.UserService) *UserHandler {
    return &UserHandler{userService: service}
}

type createUserRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type createUserResponse struct {
    ID    string `json:"id"`
    Email string `json:"email"`
}

type errorResponse struct {
    Error   string `json:"error"`
    Message string `json:"message,omitempty"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req createUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.respondWithError(w, http.StatusBadRequest, "invalid_json", "invalid request body")
        return
    }

    output, err := h.userService.CreateUser(r.Context(), application.CreateUserInput{
        Email:    req.Email,
        Password: req.Password,
    })

    if err != nil {
        h.handleDomainError(w, err)
        return
    }

    h.respondWithJSON(w, http.StatusCreated, createUserResponse{
        ID:    output.UserID,
        Email: output.Email,
    })
}

func (h *UserHandler) handleDomainError(w http.ResponseWriter, err error) {
    switch {
    case errors.Is(err, domain.ErrWeakPassword):
        h.respondWithError(w, http.StatusBadRequest, "weak_password", err.Error())
    case errors.Is(err, domain.ErrInvalidEmail):
        h.respondWithError(w, http.StatusBadRequest, "invalid_email", err.Error())
    case errors.Is(err, domain.ErrUserExists):
        h.respondWithError(w, http.StatusConflict, "user_exists", err.Error())
    default:
        h.respondWithError(w, http.StatusInternalServerError, "internal_error", "internal server error")
    }
}

func (h *UserHandler) respondWithJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    json.NewEncoder(w).Encode(data)
}

func (h *UserHandler) respondWithError(w http.ResponseWriter, status int, errCode, message string) {
    h.respondWithJSON(w, status, errorResponse{Error: errCode, Message: message})
}
```

## Tests: The Great Benefit

Here's where the architecture really shines. We can test our business logic **without any real infrastructure**:

```go
// application/user_service_test.go
package application_test

import (
    "context"
    "testing"

    "myapp/application"
    "myapp/domain"
)

// Repository mock - implements interface without database
type mockUserRepository struct {
    users map[string]*domain.User
}

func newMockUserRepository() *mockUserRepository {
    return &mockUserRepository{users: make(map[string]*domain.User)}
}

func (m *mockUserRepository) Save(ctx context.Context, user *domain.User) error {
    m.users[user.Email] = user
    return nil
}

func (m *mockUserRepository) FindByEmail(ctx context.Context, email string) (*domain.User, error) {
    if user, ok := m.users[email]; ok {
        return user, nil
    }
    return nil, domain.ErrUserNotFound
}

func (m *mockUserRepository) FindByID(ctx context.Context, id string) (*domain.User, error) {
    for _, user := range m.users {
        if user.ID == id {
            return user, nil
        }
    }
    return nil, domain.ErrUserNotFound
}

// Hasher mock - simple implementation for tests
type mockHasher struct{}

func (m *mockHasher) Hash(password string) (string, error) {
    return "hashed_" + password, nil
}

func (m *mockHasher) Compare(hashedPassword, password string) error {
    if hashedPassword == "hashed_"+password {
        return nil
    }
    return errors.New("password mismatch")
}

// Email sender mock - just records that it was called
type mockEmailSender struct {
    sentEmails []string
}

func (m *mockEmailSender) SendWelcomeEmail(ctx context.Context, to, userName string) error {
    m.sentEmails = append(m.sentEmails, to)
    return nil
}

func TestCreateUser_Success(t *testing.T) {
    repo := newMockUserRepository()
    hasher := &mockHasher{}
    emailSender := &mockEmailSender{}

    service := application.NewUserService(repo, hasher, emailSender)

    output, err := service.CreateUser(context.Background(), application.CreateUserInput{
        Email:    "test@example.com",
        Password: "securepassword123",
    })

    if err != nil {
        t.Fatalf("expected success, got error: %v", err)
    }

    if output.Email != "test@example.com" {
        t.Errorf("incorrect email: %s", output.Email)
    }

    // Verify welcome email was sent
    if len(emailSender.sentEmails) != 1 {
        t.Errorf("expected 1 email sent, got %d", len(emailSender.sentEmails))
    }
}

func TestCreateUser_WeakPassword(t *testing.T) {
    repo := newMockUserRepository()
    hasher := &mockHasher{}
    emailSender := &mockEmailSender{}

    service := application.NewUserService(repo, hasher, emailSender)

    _, err := service.CreateUser(context.Background(), application.CreateUserInput{
        Email:    "test@example.com",
        Password: "123", // Password too short
    })

    if !errors.Is(err, domain.ErrWeakPassword) {
        t.Errorf("expected ErrWeakPassword, got: %v", err)
    }
}

func TestCreateUser_DuplicateEmail(t *testing.T) {
    repo := newMockUserRepository()
    hasher := &mockHasher{}
    emailSender := &mockEmailSender{}

    // Pre-populate with existing user
    existingUser, _ := domain.NewUser("existing@example.com", "hashed")
    repo.users["existing@example.com"] = existingUser

    service := application.NewUserService(repo, hasher, emailSender)

    _, err := service.CreateUser(context.Background(), application.CreateUserInput{
        Email:    "existing@example.com",
        Password: "securepassword123",
    })

    if !errors.Is(err, domain.ErrUserExists) {
        t.Errorf("expected ErrUserExists, got: %v", err)
    }
}
```

These tests run in **milliseconds**, don't need Docker, don't need a database, don't make network calls. They are pure unit tests of your business logic.

## Directory Structure

A common structure for Go projects following these principles:

```
myapp/
├── cmd/
│   └── api/
│       └── main.go              # Composition and initialization
├── internal/
│   ├── domain/                  # Entities and business rules
│   │   ├── user.go
│   │   ├── order.go
│   │   └── errors.go
│   ├── application/             # Use cases
│   │   ├── user_service.go
│   │   └── order_service.go
│   ├── ports/                   # Interfaces (contracts)
│   │   ├── repositories.go
│   │   └── services.go
│   └── adapters/                # Concrete implementations
│       ├── http/
│       │   ├── handlers.go
│       │   └── middleware.go
│       ├── grpc/
│       │   └── server.go
│       ├── postgres/
│       │   └── user_repository.go
│       ├── redis/
│       │   └── cache.go
│       └── sendgrid/
│           └── email_sender.go
├── pkg/                         # Code reusable between projects
│   └── logger/
├── migrations/
├── go.mod
└── go.sum
```

## Composition: Where Everything Connects

The application entry point is where we wire all dependencies:

```go
// cmd/api/main.go
package main

import (
    "database/sql"
    "log"
    "net/http"
    "os"

    "myapp/internal/application"
    bcryptAdapter "myapp/internal/adapters/bcrypt"
    httpAdapter "myapp/internal/adapters/http"
    "myapp/internal/adapters/postgres"
    "myapp/internal/adapters/sendgrid"

    _ "github.com/lib/pq"
)

func main() {
    // Database configuration
    db, err := sql.Open("postgres", os.Getenv("DATABASE_URL"))
    if err != nil {
        log.Fatal(err)
    }
    defer db.Close()

    // Instantiate adapters (concrete implementations)
    userRepo := postgres.NewPostgresUserRepository(db)
    hasher := bcryptAdapter.NewBcryptHasher(12)
    emailSender := sendgrid.NewSendGridEmailSender(os.Getenv("SENDGRID_API_KEY"))

    // Instantiate application services (use cases)
    userService := application.NewUserService(userRepo, hasher, emailSender)

    // Instantiate HTTP handlers
    userHandler := httpAdapter.NewUserHandler(userService)

    // Configure routes
    mux := http.NewServeMux()
    mux.HandleFunc("POST /users", userHandler.CreateUser)

    log.Println("Server started on port 8080")
    log.Fatal(http.ListenAndServe(":8080", mux))
}
```

All the "dirty work" of instantiating concrete things stays in one place. If tomorrow we want to swap PostgreSQL for MongoDB, we create a new adapter and only change this file.

## Trade-offs and When to Use

### Advantages

- **Testability**: Fast unit tests without infrastructure
- **Flexibility**: Swapping implementations is trivial
- **Maintainability**: Code organized by responsibility
- **Onboarding**: New developers understand where each thing belongs

### Disadvantages

- **Initial boilerplate**: More code and files to set up
- **Indirection**: Sometimes you need to navigate through several layers
- **Overhead for simple projects**: A basic CRUD doesn't need all this

### When to use

**Use when:**
- The project has a long expected lifespan
- Multiple developers work on the code
- You need to support multiple "drivers" (different databases, protocols, etc.)
- Testability is a priority

**You might not need it when:**
- It's a prototype or throwaway MVP
- Extremely simple application (a script, a lambda)
- Single-person team with very limited scope

## Conclusion

Clean Architecture and Hexagonal Architecture are not about creating nice folder structures or following dogmatic rules. They're about **protecting what's valuable** — your business logic — from the volatility of the technical world.

Frameworks change. Databases get swapped. Protocols evolve. But your business rules? Those tend to be more stable. By isolating these rules in an independent core, you create software that can evolve without being rewritten.

The key is finding the right balance for your context. Not every project needs all layers. But understanding these principles gives you the tools to make conscious architectural decisions, instead of simply copying folder structures from tutorials.

---

**What about you?** Have you applied Clean Architecture or Hexagonal in your projects? Found any specific challenges? Share your experiences in the comments!
