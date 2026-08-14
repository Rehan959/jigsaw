# JigSaw Web — Components

## UI Component Library

Located in `src/components/ui/`. All components use `forwardRef` for ref forwarding and accept standard HTML attributes.

### Imports

```tsx
import { Button, Card, Input, Badge, Modal } from "@/components/ui";
```

---

## Button

**File**: `src/components/ui/Button.tsx`

Multi-variant button with loading state and icon support.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"primary" \| "secondary" \| "ghost" \| "danger" \| "success"` | `"primary"` | Visual variant |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Button size |
| `loading` | `boolean` | `false` | Shows spinner, disables button |
| `icon` | `React.ReactNode` | — | Icon element before children |
| `disabled` | `boolean` | `false` | Disabled state |

### Variants

| Variant | Styling |
|---|---|
| `primary` | Gradient bg (`#5728f4` → `#5100ff`), white text, inset shadow |
| `secondary` | `bg-surface-tertiary border-border text-text-tertiary` |
| `ghost` | `text-text-muted hover:text-text-primary hover:bg-surface-tertiary` |
| `danger` | `bg-error-bg text-error-text border-error-border` |
| `success` | `bg-success-bg text-success-text border-success-border` |

### Usage

```tsx
<Button variant="primary" size="lg">Start Searching</Button>
<Button variant="danger" loading={deleting}>Delete</Button>
<Button variant="ghost" icon={<PlusIcon />}>Add Item</Button>
```

---

## Card

**File**: `src/components/ui/Card.tsx`

Glassmorphism card container with variant and padding options.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "static" \| "interactive"` | `"default"` | Card behavior |
| `padding` | `"none" \| "sm" \| "md" \| "lg"` | `"md"` | Internal padding |

### Variants

| Variant | CSS Class | Use Case |
|---|---|---|
| `default` | `glass-card` | Standard cards with hover effect |
| `static` | `glass-card-static` | Modals, fixed-position cards |
| `interactive` | `glass-card hover:border-border-focus group` | Clickable cards, list items |

### Usage

```tsx
<Card>Default card with hover</Card>
<Card variant="static">No hover animation</Card>
<Card variant="interactive" padding="lg">Clickable card</Card>
```

---

## Badge

**File**: `src/components/ui/Badge.tsx`

Status indicator pill.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `"default" \| "success" \| "warning" \| "error" \| "primary"` | `"default"` | Color variant |
| `size` | `"sm" \| "md"` | `"sm"` | Badge size |

### Variants

| Variant | CSS Class | Use Case |
|---|---|---|
| `default` | `bg-surface-elevated text-text-muted` | Neutral status |
| `success` | `badge-success` | Completed, active |
| `warning` | `badge-warning` | Pending, queued |
| `error` | `badge-error` | Failed, deleted |
| `primary` | `badge-primary` | Running, in-progress |

### Usage

```tsx
<Badge variant="success">Completed</Badge>
<Badge variant="error" size="md">Failed</Badge>
```

---

## Input

**File**: `src/components/ui/Input.tsx`

Form input with label, error, and hint states.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Label text above input |
| `error` | `string` | — | Error message (red, overrides hint) |
| `hint` | `string` | — | Hint text below input |
| `id` | `string` | auto-generated from label | Input ID for label association |

### Styling

- Base: `input-base` class (`surface-tertiary` bg, `border` border, focus ring `brand-purple-light`)
- Error state: `border-error-text focus:border-error-text focus:ring-error-text/30`
- Label: `text-sm font-medium text-text-muted`
- Error text: `text-sm text-error-text`
- Hint text: `text-sm text-text-muted`

### Usage

```tsx
<Input label="Website URL" placeholder="https://example.com" required />
<Input label="Name" hint="Optional display name" />
<Input label="Email" error="Invalid email address" />
```

---

## Modal

**File**: `src/components/ui/Modal.tsx`

Overlay modal with backdrop blur and scale-in animation.

### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `isOpen` | `boolean` | — | Controls visibility |
| `onClose` | `() => void` | — | Close handler (also fires on Escape + overlay click) |
| `title` | `string` | — | Modal title |
| `description` | `string` | — | Subtitle text |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Max-width constraint |
| `children` | `React.ReactNode` | — | Modal content |

### Behavior

- Escape key closes modal
- Clicking overlay closes modal
- Body scroll locked when open
- Scale-in animation on open
- Backdrop blur: `backdrop-blur-sm`
- Overlay: `bg-black/50`

### Sizes

| Size | Max Width |
|---|---|
| `sm` | `max-w-sm` (384px) |
| `md` | `max-w-md` (448px) |
| `lg` | `max-w-lg` (512px) |

### Usage

```tsx
<Modal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Add Source"
  description="Enter the URL to crawl"
>
  <form>...</form>
</Modal>
```

---

## Layout Components

### Navigation

**File**: `src/components/Navigation.tsx`

Fixed top navigation bar with scroll-aware glassmorphism.

**Features**:
- Scroll detection: transparent → `glass-card-static` after 20px
- Active route highlighting: `text-primary-light` + `bg-primary/10`
- Mobile hamburger menu with slide-down animation
- Auth buttons: Sign In (ghost) + Get Started (primary)

**Routes**: Home, Search, Sources, Jobs

### Footer

**File**: `src/components/Footer.tsx`

Site footer with link columns and social icons.

**Layout**: 5-column grid (brand 2 cols + 3 link columns)

**Links**: Platform, Developers, Legal

**Social**: GitHub, X (Twitter), Discord — each as `w-10 h-10 rounded-xl bg-surface-elevated hover:bg-border`

---

## API Client

**File**: `src/lib/api.ts`

Typed API client class for backend communication. Wraps `fetch` with typed `get`, `post`, `delete` methods.

### Usage

```tsx
import { api } from "@/lib/api";

const results = await api.search("web scraping", 10);
const sources = await api.getSources();
const jobs = await api.getJobs();
await api.createSource({ url: "https://example.com", name: "My Site" });
await api.deleteSource("source-id");
await api.triggerCrawl("source-id");
```

### Environment Variable

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Adding New Components

1. Create file in `src/components/ui/`
2. Use `forwardRef` for ref forwarding
3. Extend base HTML element props
4. Use existing CSS classes from `globals.css` (`glass-card`, `btn-*`, `badge-*`, `input-base`)
5. Use Tailwind color tokens from `tailwind.config.cjs` (`brand-purple`, `surface-*`, `text-*`, `success-*`, `error-*`, `warning-*`)
6. Export from `src/components/ui/index.ts`
7. Support dark mode (default — no light mode)
