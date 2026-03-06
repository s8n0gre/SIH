# Production-Grade Motion Design System

## Motion Philosophy

This motion system follows principles from industry-leading platforms:

1. **Purposeful**: Every animation communicates state or guides attention
2. **Performant**: GPU-accelerated (transform/opacity only)
3. **Subtle**: Enhances without overwhelming
4. **Responsive**: Instant feedback to user actions
5. **Accessible**: Respects prefers-reduced-motion

## Easing Curves

- `--ease-out-expo`: cubic-bezier(0.16, 1, 0.3, 1) - Smooth deceleration
- `--ease-out-quint`: cubic-bezier(0.22, 1, 0.36, 1) - Quick interactions
- `--ease-spring`: cubic-bezier(0.34, 1.56, 0.64, 1) - Playful bounce

## Component Animations

### Page Transitions
```tsx
import { PageTransition } from './components/PageTransition';

<PageTransition trigger={activeTab}>
  <YourContent />
</PageTransition>
```

### Scroll Reveals
```tsx
import { ScrollReveal } from './components/ScrollReveal';

<ScrollReveal animation="up" delay={100}>
  <Card />
</ScrollReveal>
```

### Animated Cards
```tsx
import { AnimatedCard } from './components/AnimatedCard';

<AnimatedCard enableTilt enableGlow>
  <Content />
</AnimatedCard>
```

## CSS Classes

### Micro-Interactions
- `.btn-micro` - Button with hover lift and active press
- `.card-interactive` - Card with hover elevation
- `.icon-hover` - Icon scale and rotate on hover

### Navigation
- `.nav-underline` - Animated underline on hover/active
- `.dropdown-menu` - Smooth dropdown expansion

### Forms
- `.input-animated` - Focus ring animation
- `.input-error` - Shake animation for validation

### Loading States
- `.skeleton-shimmer` - Shimmer loading effect
- `.spinner` - Rotating loader
- `.pulse-loader` - Pulsing animation

### Scroll Animations
- `.reveal-up` - Fade up from bottom
- `.reveal-scale` - Scale in
- `.stagger-1` through `.stagger-6` - Stagger delays

## Performance

All animations use:
- `transform` and `opacity` (GPU-accelerated)
- `will-change` for complex animations
- Intersection Observer for scroll triggers
- Automatic reduced-motion support

## Accessibility

System automatically respects `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  * { animation-duration: 0.01ms !important; }
}
```
