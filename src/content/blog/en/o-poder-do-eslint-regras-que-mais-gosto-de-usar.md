---
title: The Power of ESLint - Rules I Like to Use
description: ESLint helps us maintain a code standard and check for errors.
pubDate: 2022-09-22T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: js
color: "#a29330"
image: ../../../assets/img/1_3adbbrn3gotbz72xqfo96g.png
tags: ['ESLint', 'rules']
slug: "the-power-of-eslint"
draft: false
---
## Introduction

> [ESLint](https://eslint.org/) is an open source project that helps you find and fix problems in your JavaScript code. Whether you're writing code in the browser or on the server, with or without a framework, ESLint can help make your code more consistent and robust.

*Excerpt from ESLint documentation.*

---

Besides checking for problems, we can enforce a standard and rules in the code. What we want to be an error, warning, checked, or ignored.

### Naming Convention

With typescript-eslint, we can define a prefix for variables with **boolean** types.
Following this convention, a boolean variable named "open" would throw an error in the code, and we would need to change it to `isOpen` or something similar!

```json
// .eslintrc.json

{
  ...
  "rules": {
    ...
    "@typescript-eslint/naming-convention": [
      "error",
      {
        "selector": "variable",
        "types": ["boolean"],
        "format": ["PascalCase"],
        "prefix": ["is", "should", "has", "can", "did", "will"]
      }
    ]
  }
}
```

### Import Order

With Import Order we can, as the name suggests, organize the order of our imports.

In the example below, whatever comes from react would always be at the top, followed by our components, templates, types, etc... We can define whether we want a blank line between each one or not. And the best part, all of this will always be fixed on file save! So we don't need to worry about fixing it and we'll always have a standardized file!

```json
// .eslintrc.json
"import/order": [
      "error",
      {
        "newlines-between": "always",
        "pathGroups": [
          {
            "pattern": "react",
            "group": "builtin",
            "position": "before"
          },
          {
            "pattern": "components/**",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "templates/**",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "types/**",
            "group": "external",
            "position": "after"
          },
          {
            "pattern": "utils/**",
            "group": "external",
            "position": "after"
          }
        ],
        "pathGroupsExcludedImportTypes": ["builtin"],
        "groups": [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
          "object"
        ],
        "alphabetize": {
          "order": "asc"
        }
      }
    ],
```

### Default Export

With this rule, we define that all exports will be named exports and not default, thus using the given name and also ensuring that we'll have unique names in the application, and the file itself defines its name, not whoever imports it, making refactoring work even better!

```json
"import/prefer-default-export": "off",
"import/no-default-export": "error",
```

## Conclusion

These are some rules I like to use in my projects to maintain a better standard, since each person tends to organize imports differently, or sometimes doesn't give a very clear name to a variable. With this, it's easier to find things and even generate clean code!

I'll soon bring a second part of this article, and don't forget to contact me on LinkedIn or Twitter if you have any questions or recommendations!
