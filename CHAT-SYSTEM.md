# Premium Floating Chat System

## Design Philosophy

The redesigned chat system follows modern interaction patterns from premium products:

1. **Magnetic Interaction**: Cursor-responsive floating trigger
2. **Fluid Motion**: Spring-based animations with motion continuity
3. **Contextual Feedback**: Real-time status indicators and typing animations
4. **Glass Morphism**: Translucent surfaces with depth layering
5. **Minimal by Default**: Advanced features hidden until needed

## Key Features

### Floating Trigger
- **Soft elevation** with dynamic shadows
- **Magnetic cursor** interaction (15% pull strength)
- **Pulse animation** when unread messages exist
- **Smooth expansion** on click with scale transition
- **Badge counter** with pop animation

### Chat Panel
- **Glass header** with backdrop blur
- **Spring animation** entrance (0.35s ease-out-expo)
- **Smooth exit** animation (0.25s)
- **Adaptive sizing** based on viewport
- **Transform origin** from bottom-right for natural expansion

### Message Interactions
- **Staggered appearance** (50ms delay per message)
- **Hover lift** effect on message bubbles
- **Read receipts** fade in on hover
- **Smooth scroll** behavior with custom scrollbar
- **Typing indicators** with animated dots

### Input System
- **Focus lift** animation (2px translateY)
- **Ring expansion** on focus (4px glow)
- **Send button** with scale feedback
- **Disabled state** with opacity transition

### Status Indicators
- **Connection dot** with pulse animation
- **Typing animation** (3 dots, staggered)
- **Read receipts** (✓ single, ✓✓ read)
- **Delivery status** with color coding

## Animation Specifications

### Timing Functions
- `--ease-out-expo`: cubic-bezier(0.16, 1, 0.3, 1)
- `--ease-out-quint`: cubic-bezier(0.22, 1, 0.36, 1)
- `--ease-spring`: cubic-bezier(0.34, 1.56, 0.64, 1)

### Key Animations
- **Panel Enter**: 350ms scale + translateY
- **Panel Exit**: 250ms scale + translateY
- **Message Slide**: 300ms translateY + scale
- **Pulse**: 2s infinite ease-in-out
- **Badge Pop**: 300ms spring with overshoot

## Component Structure

```tsx
<FloatingChat unreadCount={number}>
  ├── Trigger Button (magnetic + pulse)
  └── Chat Panel (conditional)
      ├── Glass Header (status + minimize)
      └── Messages Component
          ├── Conversation List
          ├── Message Thread (animated)
          └── Input System (focus animations)
```

## CSS Classes

### Trigger
- `.chat-trigger` - Base floating button
- `.has-unread` - Adds pulse animation
- `.chat-badge` - Notification counter

### Panel
- `.chat-panel` - Container with glass effect
- `.chat-panel-enter` - Entrance animation
- `.chat-panel-exit` - Exit animation
- `.chat-header` - Glass morphism header

### Messages
- `.message-bubble` - Base message style
- `.message-bubble.own` - Sent messages
- `.message-bubble.other` - Received messages
- `.message-enter` - Slide-in animation
- `.message-status` - Read receipts

### Input
- `.chat-input-wrapper` - Container with lift
- `.chat-input` - Input field with focus ring
- `.chat-send-btn` - Send button with scale

### Indicators
- `.typing-indicator` - Container for dots
- `.typing-dot` - Animated dot (3x)
- `.status-dot` - Connection indicator
- `.connection-status` - Status text

## Performance

All animations use:
- `transform` and `opacity` (GPU-accelerated)
- `will-change` for complex animations
- `backdrop-filter` for glass effects
- Smooth 60fps on modern devices

## Accessibility

- Keyboard navigation support
- `prefers-reduced-motion` respected
- ARIA labels on interactive elements
- Focus visible states
- Screen reader friendly

## Mobile Responsive

- Full-screen on mobile (<768px)
- Touch-optimized trigger size (52px)
- Swipe-friendly interactions
- Safe area insets respected

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS 14+, Android 10+)
