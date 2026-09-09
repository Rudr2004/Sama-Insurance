import { Button } from './Button.jsx';
import { TextInput } from './FormField.jsx';

// Editable list of short text items — used for coverage highlights, features,
// exclusions, etc. where the admin adds/removes free-text bullet points.
export function ListEditor({ label, items, onChange, placeholder }) {
  const setItem = (idx, value) => {
    const next = [...items];
    next[idx] = value;
    onChange(next);
  };

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  const addItem = () => onChange([...items, '']);

  return (
    <div>
      <span className="block text-sm font-medium text-slate-700 mb-1.5">{label}</span>
      <div className="space-y-2">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <TextInput value={item} onChange={(e) => setItem(idx, e.target.value)} placeholder={placeholder} />
            <Button variant="ghost" size="sm" onClick={() => removeItem(idx)} title="Remove">
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="subtle" size="sm" className="mt-2" onClick={addItem}>
        + Add item
      </Button>
    </div>
  );
}
