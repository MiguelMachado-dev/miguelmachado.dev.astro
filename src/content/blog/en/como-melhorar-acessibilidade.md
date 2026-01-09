---
title: How to Improve Accessibility on Your Websites
description: Best practices in accessibility!
pubDate: 2021-07-27T00:00:00.000Z
author: Miguel Machado
layout: post
mainClass: a11y
color: "#009e66"
image: ../../../assets/img/acessibilidade-medium.png
tags: ['accessibility', 'a11y', 'web']
slug: "improve-website-accessibility"
draft: false
---

## Introduction

Accessibility is a widely discussed topic, but I often see it being overlooked.

Since this is a fairly broad topic, today I'll cover some points that are easy to start with and easy to remember during development.

### Outline

Have you noticed that in Chromium-based browsers and Firefox, some interactions have default browser behavior?
For example, the selection of a button or input. Like in the examples below:

![Image showing examples of button focus in Chrome, Safari, and Firefox.](../../../assets/img/outline-chrome.png)

Many times I see sites where the outline is completely removed in CSS Reset. This directly impacts accessibility.

People who use keyboard navigation or cannot identify color changes cannot detect what's happening if this property is removed. Okay, I understand it might not match the layout well, but **don't remove it** - you can change the browser's default behavior and apply your own style.

Just follow this article for a better idea: [Copy the Browser's Native Focus Styles](https://css-tricks.com/copy-the-browsers-native-focus-styles/)

### Alternative Text

Alternative texts are super important!

Whether for SEO, accessibility, or even performance.
The alternative text, or `alt`, of an image, for example, when the image doesn't load, the text will be displayed as a placeholder. Additionally, screen readers will use this text, so remember to write text that makes sense and helps those who really need it. **Try to describe the image as much as possible!**

### ESLint

ESLint is your best friend during development. Besides helping you maintain good code, it can help with accessibility too!

[**eslint-plugin-jsx-a11y**](https://www.npmjs.com/package/eslint-plugin-jsx-a11y)

This plugin will help you with many important accessibility points, such as ensuring alternative texts, including `aria` in your components, verifying if anchor tags are valid, if emojis are correct and have access to screen readers, among many other features. It's worth checking out!


So that's it, we managed to go through the topic quickly, and if this post helped you in any way, share it and comment if you already knew any of this information - maybe I'll write more posts about accessibility. We could even dive deeper into some of the topics mentioned in this post!

Thank you for reading!
