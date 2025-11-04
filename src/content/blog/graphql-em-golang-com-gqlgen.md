---
title: "GraphQL em Go com gqlgen: Construindo APIs de Forma Robusta e Tipada"
description: 'Aprenda a construir APIs GraphQL modernas em Go usando a biblioteca gqlgen. Explore a abordagem schema-first, a geração automática de código e como criar resolvers desacoplados para um código limpo e manutenível.'
pubDate: 2025-04-25T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: go
color: "#e10098"
tags: ['golang', 'go', 'graphql', 'gqlgen', 'api', 'schema-first', 'resolvers']
slug: "graphql-em-golang-com-gqlgen"
draft: false
---

# Introdução: Além do REST com GraphQL e a Performance de Go

No mundo do desenvolvimento de APIs, o REST reinou soberano por muito tempo. No entanto, com o crescimento de aplicações front-end complexas (como Single Page Applications e mobile apps), seus limites se tornaram mais evidentes: o problema de *over-fetching* (buscar dados desnecessários) e *under-fetching* (necessidade de múltiplas requisições para uma única tela).

É aqui que o **GraphQL** entra como uma alternativa poderosa. Desenvolvido pelo Facebook, ele permite que o cliente solicite exatamente os dados de que precisa, em uma única requisição. Quando combinamos a flexibilidade do GraphQL com a performance e simplicidade da linguagem **Go**, obtemos uma dupla imbatível para construir APIs de alto desempenho.

E para tornar essa união ainda mais produtiva, existe uma biblioteca que se destaca: a **gqlgen**. Ela abraça a filosofia "schema-first", que coloca o contrato da sua API como a peça central do desenvolvimento. Vamos desvendar como usar gqlgen para criar APIs robustas, tipadas e com uma arquitetura limpa.

## O que é gqlgen e por que "Schema-First"?

**gqlgen** é uma biblioteca Go para criar servidores GraphQL. Sua principal característica, e a razão de sua popularidade, é a abordagem **schema-first**.

Isso significa que você primeiro define o "contrato" da sua API em um arquivo `.graphql`. Este arquivo descreve todos os tipos de dados, consultas (queries), mutações (mutations) e inscrições (subscriptions) que sua API oferecerá. A partir desse arquivo, o gqlgen gera automaticamente o código Go "boilerplate" que corresponde ao seu schema.

**Por que essa abordagem é tão poderosa?**

1.  **Contrato Claro:** O schema é a fonte da verdade. Ele é independente de linguagem e serve como documentação viva para a equipe de front-end e back-end.
2.  **Desenvolvimento Paralelo:** Com o schema definido, as equipes podem trabalhar em paralelo. O front-end pode usar o schema para construir a UI (usando ferramentas como o GraphQL Code Generator) enquanto o back-end implementa a lógica.
3.  **Segurança de Tipos:** O gqlgen gera tipos Go fortemente tipados que correspondem ao seu schema GraphQL. Isso reduz drasticamente erros em tempo de execução e melhora a autocompletação no seu editor de código.

### Analogia: A Planta de uma Casa

Pense no processo de construir uma API com gqlgen como construir uma casa:

  * **O Schema (`.graphqls`)**: É a **planta da casa**. Define quantos quartos (tipos) haverá, onde ficarão as portas (campos), e como os cômodos se conectam. Tanto o cliente (quem vai morar) quanto o construtor (você) concordam com esta planta antes de começar.
  * **O gqlgen**: É a **equipe de construção que lê a planta**. Eles erguem as fundações, levantam as paredes e instalam a estrutura elétrica e hidráulica (o código Go gerado em `generated.go`).
  * **Os Resolvers**: São os **designers de interiores e eletricistas**. Eles não constroem a estrutura, mas a preenchem com funcionalidade. Um resolver define *como* obter os dados para um campo específico (como "ligar a luz do quarto"), conectando a estrutura à lógica de negócio real.

## Mão na Massa: Configurando o Projeto

Vamos criar uma API simples de um blog para ver o gqlgen em ação.

**1. Inicie o seu módulo Go:**

```bash
mkdir go-graphql-blog
cd go-graphql-blog
go mod init github.com/seu-usuario/go-graphql-blog
```

**2. Inicialize o projeto gqlgen:**

Vamos usar `go run` para baixar e executar o comando de inicialização do gqlgen de uma só vez. Este comando cria a estrutura inicial de arquivos.

```bash
# Este comando busca o pacote (se necessário) e o executa
go run github.com/99designs/gqlgen init
go mod tidy
```

Após a execução, você terá uma estrutura semelhante a esta:

```
.
├── go.mod
├── go.sum
├── gqlgen.yml            # Arquivo de configuração do gqlgen
├── graph/
│   ├── generated.go      # Código Go gerado (NÃO EDITE!)
│   ├── model_gen.go      # Modelos Go gerados (NÃO EDITE!)
│   ├── resolver.go       # Onde implementaremos nossa lógica
│   └── schema.graphqls   # O nosso schema!
└── server.go             # Servidor HTTP de exemplo
```

## Definindo o Schema: O Coração da sua API

Abra o arquivo `graph/schema.graphqls` e substitua o conteúdo pelo nosso schema de blog:

```graphql
# graph/schema.graphqls

type User {
  id: ID!
  name: String!
  email: String!
  posts: [Post!]!
}

type Post {
  id: ID!
  title: String!
  content: String!
  published: Boolean!
  author: User!
}

type Query {
  posts: [Post!]!
  post(id: ID!): Post
}

type Mutation {
  createPost(title: String!, content: String!): Post!
}
```

Este schema define dois tipos (`User`, `Post`), uma query para listar todos os posts e buscar um post por ID, e uma mutation para criar um novo post.

## Gerando o Código e Implementando Resolvers

Agora, peça para o gqlgen ler o schema e gerar o código correspondente:

```bash
go run github.com/99designs/gqlgen generate
```

Se você abrir o arquivo `graph/resolver.go`, verá que o gqlgen adicionou "stubs" para os métodos que precisamos implementar:

```go
// graph/resolver.go

func (r *queryResolver) Posts(ctx context.Context) ([]*model.Post, error) {
    panic(fmt.Errorf("not implemented: posts - posts"))
}

func (r *queryResolver) Post(ctx context.Context, id string) (*model.Post, error) {
    panic(fmt.Errorf("not implemented: post - post"))
}

func (r *mutationResolver) CreatePost(ctx context.Context, title string, content string) (*model.Post, error) {
    panic(fmt.Errorf("not implemented: createPost - createPost"))
}
```

É aqui que a mágica acontece! Vamos substituir esses `panic`s pela nossa lógica. Para manter o exemplo simples, usaremos dados em memória.

Primeiro, vamos criar uma estrutura para armazenar nossos dados e injetá-la no resolver. Edite `graph/resolver.go`:

```go
package graph

import (
    "context"
    "fmt"
    "sync"
    // "time" // Note: O import "time" não é usado neste arquivo após a remoção dos stubs

    "github.com/seu-usuario/go-graphql-blog/graph/model"
)

type InMemoryDB struct {
    mu    sync.RWMutex
    posts map[string]*model.Post
    users map[string]*model.User
}

func NewInMemoryDB() *InMemoryDB {
    db := &InMemoryDB{
        posts: make(map[string]*model.Post),
        users: make(map[string]*model.User),
    }
    
    user1 := &model.User{ID: "1", Name: "Miguel Machado", Email: "miguel@example.com"}
    db.users["1"] = user1

    post1 := &model.Post{ID: "1", Title: "Primeiro Post", Content: "Conteúdo do primeiro post...", Published: true, Author: user1}
    db.posts["1"] = post1
    
    return db
}

type Resolver struct {
    DB *InMemoryDB
}

// Nota: As implementações dos resolvers (Posts, Post, CreatePost)
// serão movidas para seu próprio arquivo.
```

Agora, vamos implementar os resolvers. Crie um novo arquivo `graph/post.resolvers.go` para manter o código organizado (falaremos mais sobre isso a seguir).

```go
package graph

import (
    "context"
    "fmt"
    "strconv"
    // "time" // Note: O import "time" não é usado aqui

    "github.com/seu-usuario/go-graphql-blog/graph/model"
)

func (r *queryResolver) Posts(ctx context.Context) ([]*model.Post, error) {
    r.DB.mu.RLock()
    defer r.DB.mu.RUnlock()

    allPosts := make([]*model.Post, 0, len(r.DB.posts))
    for _, post := range r.DB.posts {
        allPosts = append(allPosts, post)
    }
    return allPosts, nil
}

func (r *queryResolver) Post(ctx context.Context, id string) (*model.Post, error) {
    r.DB.mu.RLock()
    defer r.DB.mu.RUnlock()

    post, ok := r.DB.posts[id]
    if !ok {
        return nil, fmt.Errorf("post com ID %s não encontrado", id)
    }
    return post, nil
}

func (r *mutationResolver) CreatePost(ctx context.Context, title string, content string) (*model.Post, error) {
    r.DB.mu.Lock()
    defer r.DB.mu.Unlock()

    author, ok := r.DB.users["1"]
    if !ok {
        return nil, fmt.Errorf("autor não encontrado")
    }

    newID := strconv.Itoa(len(r.DB.posts) + 1)
    newPost := &model.Post{
        ID:        newID,
        Title:     title,
        Content:   content,
        Published: true,
        Author:    author,
    }

    r.DB.posts[newID] = newPost
    return newPost, nil
}

func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }
func (r *Resolver) Query() generated.QueryResolver       { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
```

Finalmente, atualize o `server.go` para injetar nosso banco de dados na estrutura do Resolver:

```go
// server.go
package main

import (
    "log"
    "net/http"
    "os"

    "github.com/99designs/gqlgen/graphql/handler"
    "github.com/99designs/gqlgen/graphql/playground"
    "github.com/seu-usuario/go-graphql-blog/graph"
    "github.com/seu-usuario/go-graphql-blog/graph/generated"
)

const defaultPort = "8080"

func main() {
    port := os.Getenv("PORT")
    if port == "" {
        port = defaultPort
    }

    db := graph.NewInMemoryDB()

    resolverConfig := generated.Config{Resolvers: &graph.Resolver{DB: db}}
    srv := handler.NewDefaultServer(generated.NewExecutableSchema(resolverConfig))

    http.Handle("/", playground.Handler("GraphQL playground", "/query"))
    http.Handle("/query", srv)

    log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
    log.Fatal(http.ListenAndServe(":"+port, nil))
}
```

## A Mágica dos Resolvers Desacoplados

Note que criamos um arquivo `post.resolvers.go` em vez de colocar tudo em `resolver.go`. O gqlgen é inteligente: ele escaneia todos os arquivos `.go` no diretório `graph` em busca de implementações dos resolvers.

Isso nos permite **desacoplar** a lógica. Poderíamos ter um `user.resolvers.go` para resolvers relacionados ao usuário, um `comment.resolvers.go` para comentários, e assim por diante.

**Benefícios dessa abordagem:**

  * **Organização:** O código fica muito mais fácil de navegar e entender.
  * **Escalabilidade:** Conforme a API cresce, cada arquivo permanece gerenciável.
  * **Colaboração:** Múltiplos desenvolvedores podem trabalhar em diferentes arquivos de resolver sem causar conflitos constantes de `merge`.

## Executando e Testando a API

Com tudo no lugar, vamos rodar nosso servidor:

```bash
go run server.go
```

Abra seu navegador e acesse `http://localhost:8080`. Você verá o **GraphQL Playground**, uma interface interativa para testar sua API.

**Tente esta query para listar todos os posts:**

```graphql
query {
  posts {
    id
    title
    author {
      name
    }
  }
}
```

**E esta mutation para criar um novo post:**

```graphql
mutation {
  createPost(title: "Meu Segundo Post", content: "Mais conteúdo interessante...") {
    id
    title
    published
    author {
      email
    }
  }
}
```

Você acabou de construir uma API GraphQL tipada, performática e bem estruturada!

## Cuidados e Boas Práticas

1.  **Mantenha os Resolvers "Magros":** A responsabilidade de um resolver é orquestrar a chamada para a camada de serviço ou de dados, não conter toda a lógica de negócio. Delegue a lógica complexa para services (ex: `postService.CreatePost(...)`).
2.  **Tratamento de Erros:** Retorne erros descritivos. O GraphQL permite que você retorne erros parciais, onde uma query pode falhar em um campo, mas ter sucesso em outros. Use isso a seu favor.
3.  **Cuidado com o Problema N+1:** Se você tiver um campo como `user.posts` que busca posts para cada usuário em uma lista, você pode acabar fazendo N+1 consultas ao banco de dados. A solução padrão para isso é usar **Data Loaders**, que agrupam e cacheiam as requisições de dados. Existem excelentes bibliotecas para isso no ecossistema Go.

### Conclusão

A combinação de Go e gqlgen oferece uma experiência de desenvolvimento de API GraphQL de primeira classe. A abordagem **schema-first** garante clareza e alinhamento entre equipes, enquanto a **geração de código** automática nos dá a segurança de tipos que amamos em Go, sem o trabalho manual.

Ao adotar uma arquitetura de **resolvers desacoplados**, você garante que seu projeto permaneça limpo, organizado e escalável, pronto para crescer com as demandas do seu negócio. Se você está buscando construir APIs modernas, robustas e eficientes, essa é, sem dúvida, uma stack a ser seriamente considerada.
