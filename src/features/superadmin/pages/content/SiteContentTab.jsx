import { useEffect, useState } from 'react';
import contentService from '../../../../shared/api/contentService';

const DEFAULT_KEYS = ['hero', 'about', 'features', 'footer', 'contact_info'];

export default function SiteContentTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openKey, setOpenKey] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [saving, setSaving] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await contentService.listSiteContent();
      setItems(res || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(item) {
    setOpenKey(item.key);
    setDrafts((d) => ({ ...d, [item.key]: JSON.stringify(item.content, null, 2) }));
  }

  async function save(key) {
    setSaving(true);
    try {
      const content = JSON.parse(drafts[key] || '{}');
      await contentService.updateSiteContent(key, content);
      await load();
      setOpenKey(null);
    } catch (e) {
      alert(e.message || 'Invalid JSON');
    } finally {
      setSaving(false);
    }
  }

  // أنشئ كارت لمفاتيح مش موجودة في الباك عشان تقدر تعملها
  const existingKeys = new Set(items.map((i) => i.key));
  const missingKeys = DEFAULT_KEYS.filter((k) => !existingKeys.has(k));

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-800">Site Content</h2>
        <p className="text-xs text-slate-500">
          Key-value JSON content shown on the public landing page
        </p>
      </div>

      {loading ? (
        <div className="py-10 text-center text-sm text-slate-400">Loading...</div>
      ) : (
        <div className="space-y-3">
          {/* existing keys */}
          {items.map((item) => (
            <SiteItem
              key={item.key}
              item={item}
              isOpen={openKey === item.key}
              draft={drafts[item.key]}
              onEdit={() => startEdit(item)}
              onClose={() => setOpenKey(null)}
              onDraftChange={(v) => setDrafts((d) => ({ ...d, [item.key]: v }))}
              onSave={() => save(item.key)}
              saving={saving}
            />
          ))}

          {/* missing default keys → create buttons */}
          {missingKeys.length > 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-4">
              <div className="mb-2 text-xs font-semibold text-slate-500">
                Missing keys (click to create):
              </div>
              <div className="flex flex-wrap gap-2">
                {missingKeys.map((k) => (
                  <button
                    key={k}
                    onClick={() => {
                      setItems((arr) => [...arr, { key: k, content: {} }]);
                      setOpenKey(k);
                      setDrafts((d) => ({ ...d, [k]: '{}' }));
                    }}
                    className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f2744] shadow-sm hover:bg-[#0f2744] hover:text-white transition"
                  >
                    + {k}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SiteItem({ item, isOpen, draft, onEdit, onClose, onDraftChange, onSave, saving }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="rounded-md bg-[#0f2744]/5 px-2 py-1 font-mono text-xs font-bold text-[#0f2744]">
            {item.key}
          </span>
          <span className="text-[11px] text-slate-400">
            {Object.keys(item.content || {}).length} fields
          </span>
        </div>
        {!isOpen ? (
          <button
            onClick={onEdit}
            className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg px-3 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rounded-lg bg-[#0f2744] px-3 py-1 text-xs font-semibold text-white hover:bg-[#12325a] disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4">
          <textarea
            value={draft ?? ''}
            onChange={(e) => onDraftChange(e.target.value)}
            rows={10}
            spellCheck={false}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-800 outline-none focus:border-[#0f2744]/40 focus:ring-4 focus:ring-[#0f2744]/5"
          />
          <p className="mt-1 text-[10px] text-slate-400">Must be valid JSON</p>
        </div>
      )}
    </div>
  );
}