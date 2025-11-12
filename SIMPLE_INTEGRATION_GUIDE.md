# Simple Keyword Generator Integration Guide

## Quick Integration (Copy-Paste Ready)

### Step 1: Import the components

```tsx
import { KeywordSimpleList } from '@/components/keywords/KeywordSimpleList';
import { EtsyTagsBuilder } from '@/components/keywords/EtsyTagsBuilder';
import { KeywordDetailsModal } from '@/components/keywords/KeywordDetailsModal';
```

### Step 2: Add state management

```tsx
const [selectedTags, setSelectedTags] = useState<string[]>([]);
const [detailKeyword, setDetailKeyword] = useState<any>(null);
const [showToast, setShowToast] = useState(false);
```

### Step 3: Add handler functions

```tsx
// Toggle keyword selection
function handleToggleKeyword(keyword: string) {
  setSelectedTags((prev) =>
    prev.includes(keyword)
      ? prev.filter((k) => k !== keyword)
      : [...prev, keyword]
  );
}

// Copy all tags to clipboard
function handleCopyAll() {
  navigator.clipboard.writeText(selectedTags.join(', '));
  setShowToast(true);
  setTimeout(() => setShowToast(false), 2000);
}

// Clear all selections
function handleClearAll() {
  if (selectedTags.length > 0 && window.confirm('Remove all tags?')) {
    setSelectedTags([]);
  }
}

// Show details modal
function handleShowDetails(keyword: any) {
  setDetailKeyword(keyword);
}
```

### Step 4: Combine all keywords into single sorted list

```tsx
// Merge primary and secondary keywords, sort by score
const allKeywords = useMemo(() => {
  const combined = [
    ...data.primaryKeywords,
    ...data.secondaryKeywords
  ];
  return combined.sort((a, b) => b.keywordScore - a.keywordScore);
}, [data]);
```

### Step 5: Add the layout

```tsx
<div style={{ 
  display: 'flex', 
  gap: '24px',
  maxWidth: '1400px',
  margin: '0 auto',
  padding: '24px'
}}>
  {/* Main Content - Keyword List */}
  <div style={{ flex: 1 }}>
    <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
      🎯 AI-Recommended Keywords
    </h2>
    
    <KeywordSimpleList
      keywords={allKeywords}
      selectedKeywords={selectedTags}
      onToggleKeyword={handleToggleKeyword}
      onShowDetails={handleShowDetails}
    />
  </div>

  {/* Sidebar - Tags Builder */}
  <div style={{ width: '384px' }}>
    <EtsyTagsBuilder
      selectedTags={selectedTags}
      onRemoveTag={handleToggleKeyword}
      onCopyAll={handleCopyAll}
      onClearAll={handleClearAll}
      isPremium={true} // or {isPremiumUser}
    />
  </div>
</div>

{/* Details Modal */}
<KeywordDetailsModal
  keyword={detailKeyword}
  onClose={() => setDetailKeyword(null)}
/>

{/* Toast Notification */}
{showToast && (
  <div style={{
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: '#10B981',
    color: 'white',
    padding: '16px 24px',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
    zIndex: 9999
  }}>
    ✓ Tags copied to clipboard!
  </div>
)}
```

### Step 6 (Optional): Add mobile responsiveness

```tsx
<style jsx>{`
  @media (max-width: 1024px) {
    .tags-builder-sidebar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      max-height: 60vh;
      z-index: 1000;
      border-radius: 12px 12px 0 0;
    }
  }
`}</style>
```

---

## Complete Example

Here's a complete working example you can drop into your page:

```tsx
'use client';

import { useState, useMemo } from 'react';
import { KeywordSimpleList } from '@/components/keywords/KeywordSimpleList';
import { EtsyTagsBuilder } from '@/components/keywords/EtsyTagsBuilder';
import { KeywordDetailsModal } from '@/components/keywords/KeywordDetailsModal';

export function SimplifiedKeywordGenerator({ data, isPremiumUser = true }) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [detailKeyword, setDetailKeyword] = useState<any>(null);
  const [showToast, setShowToast] = useState(false);

  // Combine and sort all keywords by score
  const allKeywords = useMemo(() => {
    const combined = [...data.primaryKeywords, ...data.secondaryKeywords];
    return combined.sort((a, b) => b.keywordScore - a.keywordScore);
  }, [data]);

  // Limit to 7 for free users
  const displayedKeywords = isPremiumUser 
    ? allKeywords 
    : allKeywords.slice(0, 7);

  function handleToggleKeyword(keyword: string) {
    setSelectedTags((prev) =>
      prev.includes(keyword)
        ? prev.filter((k) => k !== keyword)
        : [...prev, keyword]
    );
  }

  function handleCopyAll() {
    navigator.clipboard.writeText(selectedTags.join(', '));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  }

  function handleClearAll() {
    if (selectedTags.length > 0 && window.confirm('Remove all tags?')) {
      setSelectedTags([]);
    }
  }

  return (
    <>
      <div style={{ 
        display: 'flex', 
        gap: '24px',
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '24px'
      }}>
        {/* Keyword List */}
        <div style={{ flex: 1 }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '16px',
            color: '#F9FAFB'
          }}>
            🎯 AI-Recommended Keywords
          </h2>
          
          <KeywordSimpleList
            keywords={displayedKeywords}
            selectedKeywords={selectedTags}
            onToggleKeyword={handleToggleKeyword}
            onShowDetails={setDetailKeyword}
          />

          {/* Upgrade prompt for free users */}
          {!isPremiumUser && allKeywords.length > 7 && (
            <div style={{
              marginTop: '16px',
              padding: '24px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '2px dashed #3B82F6',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
              <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#60A5FA', marginBottom: '12px' }}>
                🔒 Unlock {allKeywords.length - 7} More Keywords
              </p>
              <button style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #3B82F6, #10B981)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}>
                ⚡ Upgrade to Premium
              </button>
            </div>
          )}
        </div>

        {/* Tags Builder */}
        <div style={{ width: '384px' }}>
          <EtsyTagsBuilder
            selectedTags={selectedTags}
            onRemoveTag={handleToggleKeyword}
            onCopyAll={handleCopyAll}
            onClearAll={handleClearAll}
            isPremium={isPremiumUser}
          />
        </div>
      </div>

      {/* Details Modal */}
      <KeywordDetailsModal
        keyword={detailKeyword}
        onClose={() => setDetailKeyword(null)}
      />

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10B981',
          color: 'white',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          zIndex: 9999,
          fontSize: '16px',
          fontWeight: 600
        }}>
          ✓ Tags copied to clipboard!
        </div>
      )}
    </>
  );
}
```

---

## What This Gives You

**For Users:**
- ☐ Simple checkbox list (no confusing cards)
- One easy-to-understand score per keyword
- Clear workflow: select → see in sidebar → copy all
- Advanced metrics hidden until "Details" is clicked
- Character counter shows Etsy limits

**What Users See:**
```
☐ handmade ceramic coffee mug    92   [Details]
☐ brown leather wallet            85   [Details]
☐ gift for coffee lovers          78   [Details]
```

**In the Sidebar:**
```
Your Etsy Tags (3)
─────────────────
[handmade ceramic mug] ×
[brown leather wallet] ×
[gift for him] ×

Characters: 67 / 260

[📋 Copy All Tags (3)]
[Clear All]
```

That's it. Simple, clean, focused.

---

## Testing Checklist

- [ ] Keywords sorted by score (highest first)
- [ ] Checkboxes select/deselect
- [ ] Selected keywords appear in sidebar
- [ ] Character counter updates
- [ ] Copy All copies comma-separated text
- [ ] Clear All removes all selections
- [ ] Details button opens modal
- [ ] Modal shows all advanced metrics
- [ ] Free users see only 7 keywords
- [ ] Free users see lock on builder
- [ ] Mobile: sidebar becomes bottom sheet
