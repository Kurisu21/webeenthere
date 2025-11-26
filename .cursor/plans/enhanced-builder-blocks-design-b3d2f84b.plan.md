<!-- b3d2f84b-80c5-4f3f-ae37-c02e06bd28ff 8447b194-48ac-4673-8480-603b377f3662 -->
# Fix Image Placeholder Public View Display

## Problem Analysis

The image-placeholder component works in the builder but not in the public view because:

1. The component's `src` is stored as an attribute on the `div` element
2. The view renders the `img` tag with `src` dynamically using `innerHTML`
3. When saving, `buildHtmlFromComponent` in `useGrapesJS.ts` uses the component's default `content`, which doesn't include the `src` on the `img` tag
4. The public view normalization tries to copy `src` from div to img, but the logic may not be working correctly

## Solution

### 1. Add `toHTML` method to image-placeholder component model

**File**: `client/src/app/_components/builder/GrapesJSEditor.tsx`

Add a `toHTML` method to the image-placeholder component model (around line 1066, after `updateObjectFit` method) that generates the correct HTML structure:

```typescript
toHTML() {
  const src = this.get('src') || this.getAttributes()?.src || '';
  const placeholderText = this.get('placeholder-text') || 'Add Image';
  const objectFit = this.get('object-fit') || 'cover';
  const attrs = this.getAttributes() || {};
  const classes = this.getClasses() || [];
  const styles = this.getStyle() || {};
  const id = this.getId();
  
  // Build attributes string
  let divAttrs = '';
  if (id) divAttrs += ` id="${id}"`;
  if (classes.length > 0) divAttrs += ` class="${classes.join(' ')}"`;
  if (attrs['data-gjs-type']) divAttrs += ` data-gjs-type="${attrs['data-gjs-type']}"`;
  if (attrs['data-gjs-placeholder-text']) divAttrs += ` data-gjs-placeholder-text="${attrs['data-gjs-placeholder-text']}"`;
  if (src) divAttrs += ` src="${src.replace(/"/g, '&quot;')}"`;
  
  // Build style string
  const styleStr = Object.keys(styles).map(key => {
    const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
    return `${cssKey}: ${styles[key]}`;
  }).join('; ');
  if (styleStr) divAttrs += ` style="${styleStr}"`;
  
  if (src) {
    // Render with image
    return `<div${divAttrs}>
      <div class="image-placeholder-content" style="display: none;"></div>
      <img class="image-placeholder-img" src="${src.replace(/"/g, '&quot;')}" style="width: 100%; height: 100%; object-fit: ${objectFit}; border-radius: 6px;" alt="" />
    </div>`;
  } else {
    // Render placeholder
    return `<div${divAttrs}>
      <div class="image-placeholder-content" style="text-align: center; padding: 1rem; display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 200px;">
        <svg class="image-placeholder-icon" style="width: 3rem; height: 3rem; color: #9ca3af; margin-bottom: 0.75rem;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <button class="image-placeholder-button" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: transform 0.2s;">${placeholderText}</button>
        <p class="image-placeholder-hint" style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">Click to add image</p>
      </div>
      <img class="image-placeholder-img" style="display: none; width: 100%; height: 100%; object-fit: cover; border-radius: 6px;" alt="" />
    </div>`;
  }
},
```

### 2. Update `buildHtmlFromComponent` to use `toHTML` if available

**File**: `client/src/app/_components/builder/hooks/useGrapesJS.ts`

Modify the `buildHtmlFromComponent` function (around line 57) to check if the component has a custom `toHTML` method:

```typescript
const buildHtmlFromComponent = (comp: any): string => {
  try {
    // Check if component has custom toHTML method (for image-placeholder, etc.)
    if (comp.toHTML && typeof comp.toHTML === 'function') {
      try {
        return comp.toHTML();
      } catch (e) {
        console.warn('[useGrapesJS] Error calling component.toHTML():', e);
        // Fall through to default behavior
      }
    }
    
    // ... rest of existing code
```

### 3. Improve public view normalization as fallback

**File**: `client/src/app/sites/[slug]/page.tsx`

Enhance the normalization logic (around line 330) to be more robust. The current logic should work, but we'll add additional fallback patterns:

- After the existing image-placeholder handling, add a final pass that finds any `img` tag with `image-placeholder-img` class that still doesn't have `src` and tries to find the nearest parent `div` with `src` attribute
- Use a more reliable method to match parent-child relationships

### 4. Ensure component updates content when src changes

**File**: `client/src/app/_components/builder/GrapesJSEditor.tsx`

In the `updateImage` method (around line 1077), ensure that when `src` is set, we also update the component's children or content to include the img tag with src. However, since we're adding `toHTML`, this may not be necessary, but we should ensure the component model reflects the current state.

## Testing

After implementation:

1. Add an image to an image-placeholder component in the builder
2. Save the website
3. Check the saved HTML in the database - the `img` tag should have the `src` attribute
4. View the public site at `/sites/[slug]` - images should display correctly
5. Verify that both the div and img tags have the normalized URL

## Files to Modify

1. `client/src/app/_components/builder/GrapesJSEditor.tsx` - Add `toHTML` method to image-placeholder model
2. `client/src/app/_components/builder/hooks/useGrapesJS.ts` - Update `buildHtmlFromComponent` to use `toHTML` if available
3. `client/src/app/sites/[slug]/page.tsx` - Enhance normalization as fallback (optional, but recommended)

### To-dos

- [x] Fix image-placeholder component to ensure img tag gets src in public view
- [x] Check how business/content blocks use image placeholders in headers
- [x] Create general image placeholder block for all sections
- [x] Remove component blocks section from LeftPanel