# Premium Typography System

## Design Philosophy

The typography system follows principles from modern technology products:

1. **Fluid Scaling**: Text sizes adapt proportionally across devices
2. **Clear Hierarchy**: 9 distinct levels from hero to micro text
3. **Artistic Treatments**: Gradients, glows, and animated effects
4. **Motion Integration**: Scroll-triggered reveals and hover interactions
5. **Accessibility First**: High contrast support and reduced motion

## Typography Hierarchy

### Primary Impact
- **Hero** (`.text-hero`): 36-48px, weight 800, gradient effect
  - Use for: Landing page headlines, major announcements
  
- **Display** (`.text-display`): 30-36px, weight 700
  - Use for: Section headers, feature titles

### Section Organization
- **H1** (`.text-h1`): 24-30px, weight 700
  - Use for: Page titles, major sections
  
- **H2** (`.text-h2`): 20-24px, weight 600
  - Use for: Subsections, card groups
  
- **H3** (`.text-h3`): 18-20px, weight 600
  - Use for: Card titles, list headers

### Content & Description
- **Body Large** (`.text-body-lg`): 16-18px, weight 400
  - Use for: Feature descriptions, important content
  
- **Body** (`.text-body`): 14-16px, weight 400
  - Use for: Standard paragraphs, main content
  
- **Body Small** (`.text-body-sm`): 12-14px, weight 400
  - Use for: Supporting text, secondary info

### Metadata & Details
- **Caption** (`.text-caption`): 10-12px, weight 500, uppercase
  - Use for: Labels, categories, timestamps
  
- **Micro** (`.text-micro`): 10-12px, weight 400
  - Use for: Disclaimers, helper text, tooltips

## Artistic Treatments

### Gradient Text
```tsx
<h1 className="text-hero text-gradient">
  Premium Headline
</h1>
```

### Animated Gradient
```tsx
<h1 className="text-display text-gradient-animate">
  Dynamic Title
</h1>
```

### Underline Reveal
```tsx
<h2 className="text-h2 text-underline-reveal">
  Hover Me
</h2>
```

### Highlight Effect
```tsx
<span className="text-highlight">Important</span>
```

### Glow Effect
```tsx
<h1 className="text-hero text-glow">
  Glowing Text
</h1>
```

## Motion Animations

### Scroll-Triggered Reveal
```tsx
import { useTextReveal } from '../hooks/useTextReveal';

const Component = () => {
  const { ref } = useTextReveal();
  
  return (
    <h1 ref={ref} className="text-h1">
      Reveals on scroll
    </h1>
  );
};
```

### Staggered Children
```tsx
const { ref } = useTextReveal({ stagger: true, staggerDelay: 100 });

<div ref={ref}>
  <p>Line 1</p>
  <p>Line 2</p>
  <p>Line 3</p>
</div>
```

### Hover Animations
```tsx
<h2 className="text-h2 text-hover-scale">
  Scales on hover
</h2>

<h3 className="text-h3 text-hover-expand">
  Letter spacing expands
</h3>
```

## Interactive Text

### Links
```tsx
<a href="#" className="text-link">
  Animated Link
</a>
```

### Buttons
```tsx
<button className="text-button">
  Button Text
</button>
```

### Badges
```tsx
<span className="text-badge">
  New
</span>
```

## Contextual Colors

- `.text-emphasis` - Bold primary color
- `.text-muted` - Muted secondary color
- `.text-faint` - Very light tertiary color
- `.text-success` - Green for success states
- `.text-warning` - Yellow for warnings
- `.text-error` - Red for errors

## Spacing & Layout

### Prose Container
```tsx
<div className="text-prose">
  <h1>Title</h1>
  <p>Paragraph with proper spacing</p>
  <ul>
    <li>List item</li>
  </ul>
</div>
```

## Utility Classes

- `.text-balance` - Balanced text wrapping
- `.text-pretty` - Pretty text wrapping
- `.text-truncate` - Single line with ellipsis
- `.text-clamp-2` - Clamp to 2 lines
- `.text-clamp-3` - Clamp to 3 lines

## Responsive Behavior

All text sizes use `clamp()` for fluid scaling:
- Mobile: Minimum size
- Tablet: Proportional scaling
- Desktop: Maximum size

Line heights automatically adjust on mobile for better readability.

## Accessibility

### High Contrast
Gradients automatically convert to solid colors in high contrast mode.

### Reduced Motion
All animations respect `prefers-reduced-motion` and disable automatically.

### Color Contrast
All text colors meet WCAG AA standards for contrast ratios.

## Implementation Examples

### Hero Section
```tsx
<section>
  <h1 className="text-hero text-gradient-animate">
    Transform Your City
  </h1>
  <p className="text-body-lg text-muted">
    Report issues, track progress, engage with your community
  </p>
</section>
```

### Feature Card
```tsx
<div className="card">
  <h3 className="text-h3 text-underline-reveal">
    Real-time Updates
  </h3>
  <p className="text-body text-muted">
    Get instant notifications when your reports are addressed
  </p>
  <span className="text-caption">
    Feature
  </span>
</div>
```

### Chat Message
```tsx
<div className="message">
  <p className="text-body">
    Message content here
  </p>
  <span className="text-micro text-faint">
    2:30 PM
  </span>
</div>
```
