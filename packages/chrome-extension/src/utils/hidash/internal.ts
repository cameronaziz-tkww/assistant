// export const calculateStartScale = <T extends HTMLElement, U extends HTMLElement>(startElement: T, endElement: U) => {
//   const start= startElement.getBoundingClientRect();
//   const end= endElement.getBoundingClientRect();
//   return {
//     x: start.width / end.width,
//     y: start.height / end.height
//   };
// };

// const clamp = (value: number, min: number, max: number) => {
//   return Math.max(min, Math.min(max, value));
// }

// export const ease = (v: number, pow = 4) => {
//   const value = clamp(v, 0, 1);
//   return 1 - Math.pow(1 - value, pow);
// }
// export const easedStep = (step: number, frame = 60) =>  ease(step / frame);
// export const steps = (milliseconds: number) => {
//   const length = Math.ceil((milliseconds / 1000) * 60)
//   return Array
//     .from({ length })
//     .map((_, index) => ease(index))
// }

// 'use strict';

// class Menu {
//   constructor () {
//     this._menu = document.querySelector('.js-menu');
//     this._menuContents = this._menu.querySelector('.js-menu-contents');
//     this._menuToggleButton = this._menu.querySelector('.js-menu-toggle');
//     this._menuTitle = this._menu.querySelector('.js-menu-title');

//     this._expanded = true;
//     this._animate = false;
//     this._collapsed;

//     this.expand = this.expand.bind(this);
//     this.collapse = this.collapse.bind(this);
//     this.toggle = this.toggle.bind(this);

//     this._calculateScales();
//     this._createEaseAnimations();
//     this._addEventListeners();

//     this.collapse();
//     this.activate();
//   }

//   activate () {
//     this._menu.classList.add('menu--active');
//     this._animate = true;
//   }

//   collapse () {
//     if (!this._expanded) {
//       return;
//     }
//     this._expanded = false;

//     const {x, y} = this._collapsed;
//     const invX = 1 / x;
//     const invY = 1 / y;

//     this._menu.style.transform = `scale(${x}, ${y})`;
//     this._menuContents.style.transform = `scale(${invX}, ${invY})`;

//     if (!this._animate) {
//       return;
//     }

//     this._applyAnimation({expand: false});
//   }

//   expand () {
//     if (this._expanded) {
//       return;
//     }
//     this._expanded = true;

//     this._menu.style.transform = `scale(1, 1)`;
//     this._menuContents.style.transform = `scale(1, 1)`;

//     if (!this._animate) {
//       return;
//     }

//     this._applyAnimation({expand: true});
//   }

//   toggle () {
//     if (this._expanded) {
//       this.collapse();
//       return;
//     }

//     this.expand();
//   }

//   _addEventListeners () {
//     this._menuToggleButton.addEventListener('click', this.toggle);
//   }

//   _applyAnimation ({expand}=opts) {
//     this._menu.classList.remove('menu--expanded');
//     this._menu.classList.remove('menu--collapsed');
//     this._menuContents.classList.remove('menu__contents--expanded');
//     this._menuContents.classList.remove('menu__contents--collapsed');

//     // Force a recalc styles here so the classes take hold.
//     window.getComputedStyle(this._menu).transform;

//     if (expand) {
//       this._menu.classList.add('menu--expanded');
//       this._menuContents.classList.add('menu__contents--expanded');
//       return;
//     }

//     this._menu.classList.add('menu--collapsed');
//     this._menuContents.classList.add('menu__contents--collapsed');
//   }

//   _calculateScales () {
//     const collapsed = this._menuTitle.getBoundingClientRect();
//     const expanded = this._menu.getBoundingClientRect();

//     this._collapsed = {
//       x: collapsed.width / expanded.width,
//       y: collapsed.height / expanded.height
//     }
//   }

//   _createEaseAnimations () {
//     let menuEase = document.querySelector('.menu-ease');
//     if (menuEase) {
//       return menuEase;
//     }

//     menuEase = document.createElement('style');
//     menuEase.classList.add('menu-ease');

//     const menuExpandAnimation = [];
//     const menuExpandContentsAnimation = [];
//     const menuCollapseAnimation = [];
//     const menuCollapseContentsAnimation = [];
//     for (let i = 0; i <= 100; i++) {
//       const step = this._ease(i/100);
//       const startX = this._collapsed.x;
//       const startY = this._collapsed.y;
//       const endX = 1;
//       const endY = 1;

//       // Expand animation.
//       this._append({
//         i,
//         step,
//         startX: this._collapsed.x,
//         startY: this._collapsed.y,
//         endX: 1,
//         endY: 1,
//         outerAnimation: menuExpandAnimation,
//         innerAnimation: menuExpandContentsAnimation
//       });

//       // Collapse animation.
//       this._append({
//         i,
//         step,
//         startX: 1,
//         startY: 1,
//         endX: this._collapsed.x,
//         endY: this._collapsed.y,
//         outerAnimation: menuCollapseAnimation,
//         innerAnimation: menuCollapseContentsAnimation
//       });
//     }

//     menuEase.textContent = `
//       @keyframes menuExpandAnimation {
//         ${menuExpandAnimation.join('')}
//       }

//       @keyframes menuExpandContentsAnimation {
//         ${menuExpandContentsAnimation.join('')}
//       }

//       @keyframes menuCollapseAnimation {
//         ${menuCollapseAnimation.join('')}
//       }

//       @keyframes menuCollapseContentsAnimation {
//         ${menuCollapseContentsAnimation.join('')}
//       }`;

//     document.head.appendChild(menuEase);
//     return menuEase;
//   }

//   _append ({
//         i,
//         step,
//         startX,
//         startY,
//         endX,
//         endY,
//         outerAnimation,
//         innerAnimation}=opts) {

//     const xScale = startX + (endX - startX) * step;
//     const yScale = startY + (endY - startY) * step;

//     const invScaleX = 1 / xScale;
//     const invScaleY = 1 / yScale;

//     outerAnimation.push(`
//       ${i}% {
//         transform: scale(${xScale}, ${yScale});
//       }`);

//     innerAnimation.push(`
//       ${i}% {
//         transform: scale(${invScaleX}, ${invScaleY});
//       }`);
//   }

//   _clamp (value, min, max) {
//     return Math.max(min, Math.min(max, value));
//   }

//   _ease (v, pow=4) {
//     v = this._clamp(v, 0, 1);

//     return 1 - Math.pow(1 - v, pow);
//   }
// }

// new Menu()