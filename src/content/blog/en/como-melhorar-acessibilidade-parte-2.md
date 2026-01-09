---
title: How to Improve Accessibility on Your Websites - Part 2
description: Best practices in accessibility!
pubDate: 2022-03-16T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: a11y
color: "#009e66"
image: ../../../assets/img/acessibilidade-parte-2.jpeg
tags: ['accessibility', 'a11y', 'web']
slug: "improve-website-accessibility-part-2"
draft: false
---

## Introduction

Some time ago I wrote a brief introduction about accessibility, you can check out the other article [here](/en/improve-website-accessibility).

In this post I'll continue talking about the subject, aiming to improve more points about improving accessibility on our websites.

### Skip Links

Skip links are shortcuts that take the user to a specific point on the page, skipping a long menu, for example.

Imagine that you are trying to access a website's login link through screen reading, and on this website there's a gigantic main navigation. You would have to wait until the end of reading the entire navigation to access what you need.

With skip links, you can add shortcuts that take the user directly to the main content of that page, skipping a menu for example.

How to use it? Simple! We'll put as the first element in our `body` an anchor tag (`a`) and inside it a link that we'll define later. For example:
`<a class="skip-link" href="#main">Skip to main content</a>`.

In this case, I put the link to `#main` which we'll create now.

Preferably, in your `main` tag (yes, using semantic tags is super important!), add the `id` attribute `id="main"`, you can also add `tabindex="-1"`.

Now your `main` tag should look more or less like this:
`<main id="main" tabindex="-1">`

And the last step is to style this `skip-link` using CSS. We want to hide it from the page by default because we only want it visible when the user is navigating with the keyboard.

To do this, add the following CSS:
```css
.skip-link {
  position: absolute;
  left: -9999px;
  z-index: 99;
}
```

Good! Now our skip-link should be hidden.

To make it visible again when the user is navigating using focus:
```css
.skip-link:focus {
  left: 0;
}
```

Now, when the user hits the first `Tab` on the page, this will be the first option shown. When they hit `Enter`, they'll skip the entire menu and go straight to the first available element inside the `main` tag!

Done! You've implemented something extremely simple but that will help a lot of people!

### Modals, Dialogs... Focus Trapping

Often on websites, we have areas where we need to restrict the user from going to a different area than the one they're in.

For example, when clicking on a button and a modal opens. In this modal we have a title, description and a close button.

In terms of accessibility, there's something called [Focus Trap](https://www.w3.org/TR/UNDERSTANDING-WCAG20/keyboard-operation-trapping.html).

Whenever a person is inside this modal, using keyboard navigation, they should stay within this modal. Hitting `Tab` inside this modal shouldn't take the focus outside of it, which means that internally, when the focus goes to the last element, it should go back to the first element of that modal, never leaving to the elements behind.

To do this we use focus trap! Try it in your next project, you won't regret it!

Do you want to learn more about accessibility? Let me know in the comments and don't forget to share this post!
