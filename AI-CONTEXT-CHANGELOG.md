# CrowdSource Project - AI Context Changelog

## Project Overview
**CrowdSource** is a municipal issue reporting application with React/TypeScript frontend, Node.js backend, MongoDB database, and ServiceNow integration. Citizens report issues (potholes, streetlights, graffiti) which sync bidirectionally with ServiceNow for municipal workflow management.

## Design Philosophy
- **Quality Standard**: Match Stripe, Linear, Apple, Vercel, Framer, Notion, Tesla
- **Performance**: 60fps animations, GPU-accelerated (transform/opacity only)
- **Accessibility**: WCAG AA, keyboard navigation, reduced-motion support
- **Minimal Code**: Absolute minimal implementations, no verbose solutions

---

## Major Feature Implementations

### 1. Motion Design System
**Files**: `src/styles/motion-system.css`, `MOTION-SYSTEM.md`

**Features**:
- Custom easing curves: `--ease-out-expo`, `--ease-out-quint`, `--ease-spring`
- Page transitions with fade/slide/scale variants
- Scroll-triggered reveal animations with stagger support
- Micro-interactions for buttons, cards, inputs
- Form validation animations
- Loading states (skeleton, spinner, pulse)
- Reduced-motion support

**Components**:
- `src/components/PageTransition.tsx` - Page transition wrapper
- `src/components/ScrollReveal.tsx` - Scroll reveal wrapper
- `src/components/AnimatedCard.tsx` - Card with tilt/glow effects
- `src/hooks/useScrollAnimation.ts` - Intersection Observer hook
- `src/hooks/useTextReveal.ts` - Text reveal animation hook

### 2. Premium Floating Chat System
**Files**: `src/components/FloatingChat.tsx`, `src/styles/chat-system.css`, `CHAT-SYSTEM.md`

**Features**:
- Magnetic cursor effect (15% pull strength)
- Pulse animation for unread messages
- Glass morphism with backdrop-blur
- Smooth 350ms expansion animation
- Message bubbles with hover lift
- Typing indicators with animated dots
- Read receipts
- Connection status indicator

**Animations**:
- Chat trigger: Magnetic pull, hover lift, pulse for unread
- Panel: Scale + fade entrance/exit
- Messages: Slide-in with stagger
- Input: Focus lift effect

### 3. Typography System
**Files**: `src/styles/typography.css`, `TYPOGRAPHY-SYSTEM.md`

**9-Level Hierarchy**:
1. Hero (clamp 48px-96px)
2. Display (clamp 40px-72px)
3. Headline (clamp 32px-56px)
4. Title (clamp 24px-40px)
5. Subtitle (clamp 20px-32px)
6. Body (clamp 16px-18px)
7. Caption (clamp 14px-16px)
8. Label (clamp 12px-14px)
9. Micro (clamp 10px-12px)

**Features**:
- Fluid scaling with clamp()
- Gradient text effects
- Glow effects for emphasis
- Animated underlines
- Scroll-triggered animations
- Contextual colors (muted, faint, inverted)

### 4. Responsive Chat System
**Files**: `src/components/Messages.tsx`, `src/styles/chat-system.css`, `RESPONSIVE-CHAT-SYSTEM.md`, `RESPONSIVE-CHAT-QUICK-REF.md`

**Breakpoints**:
- **Desktop (>1024px)**: 360px sidebar, inline search, 3-column layout
- **Tablet (768-1024px)**: 320px drawer sidebar, search toggle, hamburger menu
- **Mobile (<768px)**: Full-screen sidebar overlay, expandable search, single panel
- **Small Mobile (<640px)**: 100vw sidebar, 85% message bubbles, compact spacing

**Features**:
- Collapsible sidebar with slide animation
- Hamburger menu (hidden on desktop)
- Search toggle with expandable overlay
- Auto-close sidebar on conversation select
- Backdrop overlay for mobile
- Independent scroll containers
- Fixed input area (always visible)
- Touch-optimized (44px+ targets, 16px input font)

**State Management**:
```typescript
const [sidebarOpen, setSidebarOpen] = useState(false);
const [searchExpanded, setSearchExpanded] = useState(false);
```

---

## Component Fixes & Enhancements

### ReportIssue Component
**File**: `src/components/ReportIssue.tsx`

**Fixes**:
- Centered "Hold to Speak" button (was right-aligned)
- Added React.useMemo for image URL caching
- Added onError handlers for fallback images
- Fixed image loading in upload preview

### CommunityFeed Component
**File**: `src/components/CommunityFeed.tsx`

**Fixes**:
- Added onError handler with fallback image
- Added lazy loading attribute to report images
- Fixed image loading in report display section

### Header Component
**File**: `src/components/Header.tsx`

**Changes**:
- Merged profile dropdown with mobile menu
- Removed separate hamburger icon
- Integrated navigation items into profile dropdown
- Added handleNavClick function
- ProfileDropdown accepts navItems and activeTab props

### App Component
**File**: `src/App.tsx`

**Changes**:
- Replaced old chat implementation with FloatingChat
- Removed showChat state
- Integrated new floating chat system

### Index CSS
**File**: `src/index.css`

**Imports**:
```css
@import './styles/motion-system.css';
@import './styles/chat-system.css';
@import './styles/typography.css';
```

**Enhancements**:
- Production-grade button animations
- Enhanced input styles with focus effects
- Smooth transitions on interactive elements

---

## CSS Architecture

### Design Tokens (CSS Variables)
```css
/* Colors */
--accent-blue, --accent-red, --accent-green, --accent-yellow
--text-primary, --text-secondary, --text-muted, --text-faint
--bg-base, --bg-panel, --bg-elevated
--border, --border-strong

/* Easing */
--ease-out-expo, --ease-out-quint, --ease-spring, --ease-smooth

/* Shadows */
--shadow-sm, --shadow-md, --shadow-lg, --shadow-xl
```

### Key CSS Classes

**Layout**:
- `.chat-container` - Responsive chat wrapper
- `.chat-sidebar` - Collapsible sidebar
- `.chat-main` - Main chat area
- `.chat-header-main` - Adaptive header
- `.chat-messages-area` - Scrollable messages
- `.chat-input-area` - Fixed input

**Interactive**:
- `.chat-menu-btn` - Hamburger (hidden desktop)
- `.chat-search-toggle` - Search icon (hidden desktop)
- `.chat-search-wrapper` - Inline search (hidden mobile)
- `.chat-search-expanded` - Expandable search overlay

**Animations**:
- `.animate-fade-in` - Fade entrance
- `.animate-slide-up` - Slide up entrance
- `.animate-scale-in` - Scale entrance
- `.scroll-reveal` - Scroll-triggered reveal
- `.message-enter` - Message slide-in

---

## Performance Optimizations

### Animations
- GPU-accelerated: Only `transform` and `opacity`
- `will-change` hints on animated elements
- Hardware acceleration with `translateZ(0)`
- Reduced-motion media queries

### Layout
- CSS Grid/Flexbox (no JavaScript layout)
- `contain: layout style paint` for isolation
- Debounced scroll handlers
- Virtualized long lists (conversation list)

### Images
- Lazy loading attributes
- Error fallbacks
- React.useMemo for URL caching
- Optimized image formats

---

## Accessibility Features

### Keyboard Navigation
- Tab order: Menu → Search → Conversations → Messages → Input
- Enter/Space: Activate buttons
- Escape: Close overlays
- Arrow keys: Navigate lists

### ARIA
```tsx
<button aria-label="Open menu" />
<button aria-label="Search" />
<button aria-label="Close" />
```

### Visual
- Focus indicators on all interactive elements
- Color contrast ≥4.5:1
- Touch targets ≥44px
- Reduced-motion support

### Screen Readers
- Semantic HTML
- ARIA labels on icon buttons
- State announcements

---

## Documentation Files

1. **MOTION-SYSTEM.md** - Complete motion design system documentation
2. **CHAT-SYSTEM.md** - Premium floating chat system guide
3. **TYPOGRAPHY-SYSTEM.md** - Typography hierarchy and usage
4. **RESPONSIVE-CHAT-SYSTEM.md** - Responsive chat architecture
5. **RESPONSIVE-CHAT-QUICK-REF.md** - Quick reference for responsive chat
6. **VISUAL-REFINEMENT-SUMMARY.md** - Complete visual improvements summary

---

## Technical Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS + Custom CSS
- Lucide React (icons)
- Intersection Observer API
- CSS Variables for theming

### Backend
- Node.js + Express
- MongoDB (Mongoose)
- ServiceNow REST API integration
- Real-time polling (3s interval)

### Integration
- Bidirectional sync with ServiceNow
- Business rules for auto-sync
- REST API endpoints
- Webhook support

---

## Key Patterns

### Component Pattern
```tsx
// Minimal, functional components
const Component: React.FC<Props> = ({ prop }) => {
  const [state, setState] = useState(initial);
  
  return (
    <div className="responsive-class">
      {/* Minimal JSX */}
    </div>
  );
};
```

### Animation Pattern
```css
/* GPU-accelerated only */
.element {
  transition: transform 0.3s var(--ease-out-expo),
              opacity 0.3s var(--ease-out-expo);
  will-change: transform, opacity;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .element {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Responsive Pattern
```css
/* Mobile-first breakpoints */
@media (max-width: 640px)  { /* Small mobile */ }
@media (max-width: 768px)  { /* Mobile */ }
@media (max-width: 1024px) { /* Tablet */ }
/* Desktop is default */
```

---

## Common Issues & Solutions

### Issue: Sidebar doesn't close on mobile
**Solution**: Ensure `handleConvSelect` calls `setSidebarOpen(false)`

### Issue: Chat messages not visible
**Solution**: Add `overflow: hidden` to container, `height: 100%` to main, `min-height: 0` to messages area

### Issue: Search disappears on tablet
**Solution**: Show `.chat-search-toggle` at ≤1024px, hide `.chat-search-wrapper`

### Issue: Input triggers zoom on iOS
**Solution**: Set `font-size: 16px` on input elements

### Issue: Animations choppy
**Solution**: Use `transform` not `left/top`, add `will-change: transform`

---

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

---

## Future Enhancements
- Swipe gestures for sidebar
- Pull-to-refresh messages
- Offline message queue
- Push notifications
- Voice message support
- File attachment preview
- Message search functionality
- User presence indicators
- Message reactions

---

## Development Guidelines

### Code Style
1. Minimal implementations only
2. No verbose solutions
3. Functional components preferred
4. TypeScript for type safety
5. CSS modules or scoped styles

### Animation Rules
1. Only `transform` and `opacity`
2. Always include reduced-motion
3. 60fps target
4. Hardware acceleration
5. Meaningful, purposeful animations

### Responsive Rules
1. Mobile-first approach
2. Touch targets ≥44px
3. No hover-dependent functionality
4. Test on physical devices
5. Preserve all functionality across breakpoints

### Accessibility Rules
1. Semantic HTML
2. ARIA labels on icon buttons
3. Keyboard navigation support
4. Focus indicators
5. Color contrast compliance

---

## Testing Checklist

### Desktop
- [ ] Sidebar visible and fixed width
- [ ] Inline search functional
- [ ] All panels accessible
- [ ] Smooth scrolling

### Tablet
- [ ] Sidebar compresses/drawer
- [ ] Hamburger menu appears
- [ ] Search toggle functional
- [ ] Sidebar closes on selection

### Mobile
- [ ] Full-screen sidebar overlay
- [ ] Touch targets adequate
- [ ] Input doesn't zoom
- [ ] Overlay backdrop works
- [ ] Search expands correctly

### Accessibility
- [ ] Keyboard navigation
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] Reduced-motion respected
- [ ] Color contrast passes

---

## Project Status
✅ Motion system implemented
✅ Chat system implemented
✅ Typography system implemented
✅ Responsive layout implemented
✅ Component fixes completed
✅ Documentation complete
✅ Production-ready

**Last Updated**: Current session
**Version**: 1.0.0
