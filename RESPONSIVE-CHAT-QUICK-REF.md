# Responsive Chat - Quick Reference

## File Changes

### Modified Files
1. **src/components/Messages.tsx**
   - Added responsive state: `sidebarOpen`, `searchExpanded`
   - Added `handleConvSelect()` with auto-close
   - Replaced layout classes with responsive system
   - Added hamburger menu button
   - Added expandable search overlay
   - Added mobile backdrop overlay

2. **src/styles/chat-system.css**
   - Added responsive layout system
   - Added breakpoint definitions (1024px, 768px, 640px)
   - Added sidebar drawer animations
   - Added search expansion animations
   - Added mobile-specific adjustments

3. **src/components/FloatingChat.tsx**
   - Enhanced mobile responsiveness
   - Full-screen on mobile devices
   - Adjusted trigger button sizing

## Responsive Breakpoints

```css
/* Desktop: >1024px */
- Sidebar: 360px fixed width
- Search: Inline in sidebar
- Menu: Hidden

/* Tablet: 768px-1024px */
- Sidebar: 320px drawer
- Search: Toggle icon + expandable
- Menu: Visible

/* Mobile: <768px */
- Sidebar: Full-screen overlay
- Search: Expandable overlay
- Menu: Visible
- Input: 16px font (no zoom)

/* Small Mobile: <640px */
- Sidebar: 100vw
- Messages: 85% max-width
- Compact spacing
```

## Key CSS Classes

### Layout
- `.chat-container` - Main wrapper
- `.chat-sidebar` - Responsive sidebar
- `.chat-main` - Chat area
- `.chat-overlay` - Mobile backdrop

### Interactive
- `.chat-menu-btn` - Hamburger (hidden desktop)
- `.chat-search-toggle` - Search icon (hidden desktop)
- `.chat-search-wrapper` - Inline search (hidden mobile)
- `.chat-search-expanded` - Expandable search

### State
- `.chat-sidebar-open` - Sidebar visible

### Areas
- `.chat-header-main` - Adaptive header
- `.chat-messages-area` - Scrollable messages
- `.chat-input-area` - Fixed input

## State Management

```typescript
// Sidebar control
const [sidebarOpen, setSidebarOpen] = useState(false);

// Search control
const [searchExpanded, setSearchExpanded] = useState(false);

// Auto-close on selection
const handleConvSelect = (convId: string) => {
  setSelectedConvId(convId);
  setSidebarOpen(false); // Close on mobile
};
```

## Component Structure

```tsx
<div className="chat-container">
  {/* Mobile overlay */}
  {sidebarOpen && <div className="chat-overlay" onClick={close} />}
  
  {/* Sidebar */}
  <div className={`chat-sidebar ${sidebarOpen ? 'chat-sidebar-open' : ''}`}>
    {/* Header with inline search (desktop) */}
    {/* Conversation list */}
  </div>
  
  {/* Main chat */}
  <div className="chat-main">
    {/* Header with menu + search toggle (mobile) */}
    <div className="chat-header-main">
      <button className="chat-menu-btn" onClick={openSidebar} />
      {/* User info */}
      <button className="chat-search-toggle" onClick={toggleSearch} />
    </div>
    
    {/* Expandable search (mobile) */}
    {searchExpanded && <div className="chat-search-expanded" />}
    
    {/* Messages */}
    <div className="chat-messages-area" />
    
    {/* Input (always visible) */}
    <div className="chat-input-area" />
  </div>
</div>
```

## Animations

```css
/* Sidebar slide */
transform: translateX(-100%); /* Hidden */
transform: translateX(0);     /* Visible */
transition: transform 0.3s var(--ease-out-expo);

/* Search expand */
@keyframes slide-down {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Overlay fade */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
```

## Testing Commands

### Desktop Test
1. Open at >1024px width
2. Verify sidebar visible
3. Verify inline search works
4. Verify no menu button

### Tablet Test
1. Resize to 768px-1024px
2. Click hamburger → sidebar slides in
3. Click search icon → search expands
4. Select conversation → sidebar closes

### Mobile Test
1. Resize to <768px
2. Verify full-screen sidebar
3. Verify search overlay
4. Verify input stays visible
5. Test touch targets (44px+)

## Common Issues & Fixes

### Issue: Sidebar doesn't close on mobile
**Fix:** Ensure `handleConvSelect` calls `setSidebarOpen(false)`

### Issue: Search disappears on tablet
**Fix:** Check media query - inline search hidden, toggle should appear

### Issue: Input triggers zoom on iOS
**Fix:** Set `font-size: 16px` on input (prevents auto-zoom)

### Issue: Overlay not blocking clicks
**Fix:** Ensure `z-index: 999` and `position: fixed`

### Issue: Sidebar animation choppy
**Fix:** Use `transform` not `left`, add `will-change: transform`

## Performance Tips

1. Use `transform` for animations (GPU-accelerated)
2. Add `will-change: transform` to animated elements
3. Avoid layout thrashing (batch DOM reads/writes)
4. Use CSS containment: `contain: layout style paint`
5. Debounce scroll handlers

## Accessibility Checklist

- [ ] Keyboard navigation works
- [ ] Focus visible on all interactive elements
- [ ] ARIA labels on icon buttons
- [ ] Escape closes overlays
- [ ] Tab order logical
- [ ] Touch targets ≥44px
- [ ] Color contrast ≥4.5:1
- [ ] Screen reader announces state changes

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Flexbox | ✓ | ✓ | ✓ | ✓ |
| Transform | ✓ | ✓ | ✓ | ✓ |
| Backdrop-filter | ✓ | ✓ | ✓ | ✓ |
| CSS Variables | ✓ | ✓ | ✓ | ✓ |

## Deployment Checklist

- [ ] Test on physical devices
- [ ] Test landscape/portrait
- [ ] Test with keyboard only
- [ ] Test with screen reader
- [ ] Verify no console errors
- [ ] Check bundle size impact
- [ ] Validate all breakpoints
- [ ] Test slow network conditions
