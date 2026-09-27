import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Field, Toggle, SectionHeader, IconGrip, IconX, IconSearch, IconChevronDown, IconInfo } from './ui.jsx';
import { startResearchJob } from '../api.js';

// ── Complete World Countries List ────────────────────────────────────────────

const ALL_COUNTRIES = [
  'UAE', 'Saudi Arabia', 'Oman', 'Bahrain', 'Qatar', 'Kuwait',
  'Pakistan', 'India', 'Bangladesh', 'Nepal', 'Sri Lanka', 'UK', 'USA',
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaijan', 'Bahamas', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan',
  'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde', 'Cambodia',
  'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo (Brazzaville)', 'Congo (Kinshasa)',
  'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
  'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau',
  'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
  'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
  'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway',
  'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
  'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria',
  'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey',
  'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'Uruguay', 'Uzbekistan', 'Vanuatu',
  'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const SEARCH_FILTERS = [
  { label: 'All prices', value: 'all' },
  { label: 'Cheapest', value: 'cheapest' },
  { label: 'Premium only', value: 'premium' },
];

const DEFAULT_FORM = {
  website_name: '',
  website_url: '',
  product_query: '',
  category: '',
  brand: '',
  search_filter: 'all',
  target_country: 'UAE',
  fallback_countries: [],
  include_retailers: true,
  include_wholesalers: true,
  include_importers: true,
  include_official_distributors: true,
  output_formats: ['PDF'],
};

// ── Searchable Country Select Dropdown ────────────────────────────────────────

function SearchableCountrySelect({ value, onChange, placeholder = "Select country..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef(null);

  const filteredCountries = ALL_COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="field-base flex items-center justify-between text-left cursor-pointer"
      >
        <span className={value ? "text-[var(--text-primary)] font-medium" : "text-[var(--text-faint)]"}>
          {value || placeholder}
        </span>
        <IconChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Floating Searchable Menu */}
      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1.5 rounded-lg border border-[rgba(var(--border-rgb),0.2)] bg-white shadow-lg overflow-hidden">
          {/* Search Box */}
          <div className="p-2 border-b border-[rgba(var(--border-rgb),0.15)] relative">
            <IconSearch className="w-3.5 h-3.5 text-[var(--text-muted)] absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search 195+ countries..."
              className="w-full bg-white border border-[rgba(var(--border-rgb),0.15)] rounded-md pl-9 pr-7 py-1.5 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus:border-[#2563EB]/60 outline-none"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              >
                <IconX className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Country List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-[rgba(var(--border-rgb),0.08)]">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected = country === value;
                return (
                  <button
                    key={country}
                    type="button"
                    onClick={() => {
                      onChange(country);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-[var(--text-secondary)] hover:bg-[rgba(var(--border-rgb),0.04)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <span>{country}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB]" />
                    )}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs text-[var(--text-muted)]">
                No country matching "{search}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sortable country tag ─────────────────────────────────────────────────────

function SortableCountryTag({ id, country, onRemove }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} className="tag-pill">
      <span {...listeners} className="text-[var(--text-faint)] hover:text-[var(--text-secondary)] cursor-grab active:cursor-grabbing">
        <IconGrip className="w-3 h-3" />
      </span>
      <span className="text-xs">{country}</span>
      <button
        type="button"
        onClick={() => onRemove(id)}
        className="text-[var(--text-faint)] hover:text-red-600 transition-colors ml-0.5"
        title="Remove"
      >
        <IconX className="w-2.5 h-2.5" />
      </button>
    </div>
  );
}

// ── Main Form Component ──────────────────────────────────────────────────────

export default function ResearchForm({ onJobStarted }) {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [errors, setErrors] = useState({});
  const [apiErrors, setApiErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [countrySearch, setCountrySearch] = useState('');

  // dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Form helpers
  const set = (field) => (value) => setForm((f) => ({ ...f, [field]: value }));
  const setVal = (field) => (e) => set(field)(e.target.value);

  // Fallback countries drag-and-drop
  const handleDragEnd = ({ active, over }) => {
    if (!over || active.id === over.id) return;
    setForm((f) => {
      const oldIndex = f.fallback_countries.indexOf(active.id);
      const newIndex = f.fallback_countries.indexOf(over.id);
      return { ...f, fallback_countries: arrayMove(f.fallback_countries, oldIndex, newIndex) };
    });
  };

  const removeCountry = (country) =>
    setForm((f) => ({ ...f, fallback_countries: f.fallback_countries.filter((c) => c !== country) }));

  const addCountry = (country) => {
    if (!form.fallback_countries.includes(country)) {
      setForm((f) => ({ ...f, fallback_countries: [...f.fallback_countries, country] }));
    }
    setCountrySearch('');
  };

  // Validation
  const validate = () => {
    const errs = {};
    if (!form.product_query.trim()) errs.product_query = 'Product name / keyword is required.';
    if (!form.target_country) errs.target_country = 'Target country is required.';
    if (form.website_url && !/^https?:\/\/.+\..+/.test(form.website_url))
      errs.website_url = 'Enter a valid URL (e.g. https://example.com).';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const isFormValid =
    !!form.product_query.trim() &&
    !!form.target_country;

  // Build the payload — omit optional empty fields
  const buildPayload = () => {
    const payload = {
      product_query: form.product_query.trim(),
      target_country: form.target_country,
      fallback_countries: form.fallback_countries,
      search_filter: form.search_filter,
      include_retailers: form.include_retailers,
      include_wholesalers: form.include_wholesalers,
      include_importers: form.include_importers,
      include_official_distributors: form.include_official_distributors,
      output_formats: form.output_formats,
    };
    if (form.website_name.trim()) payload.website_name = form.website_name.trim();
    if (form.website_url.trim())  payload.website_url  = form.website_url.trim();
    if (form.category.trim())     payload.category     = form.category.trim();
    if (form.brand.trim())        payload.brand        = form.brand.trim();
    return payload;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiErrors([]);
    setNetworkError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      const payload = buildPayload();
      const result  = await startResearchJob(payload);
      if (!result.success || !result.job_id) {
        throw new Error(result.message || result.error || "The research job couldn't be started.");
      }
      onJobStarted(result);
    } catch (err) {
      if (err.isNetwork || err.isTimeout) {
        setNetworkError(err.message);
      } else if (err.body?.errors && Array.isArray(err.body.errors)) {
        setApiErrors(err.body.errors);
      } else {
        setNetworkError(err.message || 'An unexpected error occurred. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const availableToAdd = ALL_COUNTRIES.filter(
    (c) =>
      !form.fallback_countries.includes(c) &&
      c !== form.target_country &&
      c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // The start call responds quickly with a job_id; show a brief loading
  // state until then, after which the app switches to the progress view.
  if (submitting) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 space-y-5">
        <span className="spinner spinner-lg" />
        <p className="text-base font-medium text-[var(--text-primary)]">Starting research job…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* ── API / Network errors ── */}
      {networkError && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <svg className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1={12} y1={9} x2={12} y2={13}/><line x1={12} y1={17} x2={12.01} y2={17}/>
          </svg>
          <div className="flex-1">
            <p className="text-red-700 text-sm font-medium">Submission failed</p>
            <p className="text-[var(--text-secondary)] text-sm mt-0.5">{networkError}</p>
          </div>
        </div>
      )}

      {apiErrors.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-amber-800 text-sm font-medium mb-2">Validation errors from server</p>
          <ul className="space-y-1">
            {apiErrors.map((err, i) => (
              <li key={i} className="text-[var(--text-secondary)] text-sm flex items-start gap-2">
                <span className="text-amber-600 mt-0.5">•</span>
                {typeof err === 'string' ? err : JSON.stringify(err)}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Section 1: Target ── */}
      <section>
        <SectionHeader
          title="Target"
          description="Identify the website and product you want to research."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Website name" error={errors.website_name}>
            <input
              id="website_name"
              type="text"
              placeholder="e.g. LuLu UAE"
              value={form.website_name}
              onChange={setVal('website_name')}
              className={`field-base ${errors.website_name ? 'field-error' : ''}`}
            />
          </Field>
          <Field label="Website URL" error={errors.website_url} hint="Optional — include https://">
            <input
              id="website_url"
              type="url"
              placeholder="https://www.luluwebstore.com"
              value={form.website_url}
              onChange={setVal('website_url')}
              className={`field-base ${errors.website_url ? 'field-error' : ''}`}
            />
          </Field>
          <Field label="Product name / keyword" required error={errors.product_query} className="sm:col-span-2">
            <input
              id="product_query"
              type="text"
              placeholder='e.g. "organic juice bottle", "steel rebar", "vitamin D supplement"'
              value={form.product_query}
              onChange={setVal('product_query')}
              className={`field-base ${errors.product_query ? 'field-error' : ''}`}
              autoFocus
            />
          </Field>
          <Field label="Category" error={errors.category}>
            <input
              id="category"
              type="text"
              placeholder="e.g. beverage, construction, healthcare"
              value={form.category}
              onChange={setVal('category')}
              className={`field-base ${errors.category ? 'field-error' : ''}`}
            />
          </Field>
          <Field label="Brand" error={errors.brand}>
            <input
              id="brand"
              type="text"
              placeholder="e.g. Nestlé, Samsung, Unilever"
              value={form.brand}
              onChange={setVal('brand')}
              className={`field-base ${errors.brand ? 'field-error' : ''}`}
            />
          </Field>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Section 2: Search Parameters ── */}
      <section>
        <SectionHeader
          title="Search parameters"
          description="Choose which price tier to target."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Field label="Search filter">
            <select
              id="search_filter"
              value={form.search_filter}
              onChange={setVal('search_filter')}
              className="field-base"
            >
              {SEARCH_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </Field>
        </div>
      </section>

      <div className="section-divider" />

      {/* ── Section 3: Geography ── */}
      <section>
        <SectionHeader
          title="Geography"
          description="Set the primary target country for research."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          <Field label="Target country" required error={errors.target_country}>
            <SearchableCountrySelect
              value={form.target_country}
              onChange={set('target_country')}
              placeholder="Search & select target country..."
            />
          </Field>
        </div>

        <div className="flex items-start gap-3 p-4 rounded-lg bg-[#2563EB]/5 border border-[#2563EB]/20 mb-4">
          <IconInfo className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-[var(--text-primary)] font-medium">Fallback Countries</p>
            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
              If the target country doesn't have enough results, we'll search these countries next, in the order
              you add them. Add as many as you'd like — leave empty to search only the target country.
            </p>
          </div>
        </div>

        <Field
          label="Fallback countries"
          hint="Drag to reorder — priority runs left to right, top to bottom."
        >
          {/* Drag and drop tags */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={form.fallback_countries}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex flex-wrap gap-2 p-3 rounded-md bg-[var(--bg-surface)] border border-[rgba(var(--border-rgb),0.15)] min-h-[52px]">
                {form.fallback_countries.length === 0 && (
                  <p className="text-xs text-[var(--text-faint)] self-center">No fallback countries added.</p>
                )}
                {form.fallback_countries.map((country) => (
                  <SortableCountryTag
                    key={country}
                    id={country}
                    country={country}
                    onRemove={removeCountry}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {/* Add country */}
          <div className="mt-2">
            <div className="relative">
              <input
                type="text"
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                placeholder="Search & add fallback country (195+ available)..."
                className="field-base pr-8 text-xs"
              />
              {countrySearch && (
                <button
                  type="button"
                  onClick={() => setCountrySearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)] hover:text-[var(--text-secondary)]"
                >
                  <IconX className="w-3 h-3" />
                </button>
              )}
            </div>
            {countrySearch && availableToAdd.length > 0 && (
              <div className="mt-1 rounded-md border border-[rgba(var(--border-rgb),0.15)] bg-[var(--bg-surface)] overflow-hidden max-h-36 overflow-y-auto">
                {availableToAdd.slice(0, 10).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => addCountry(c)}
                    className="w-full text-left px-3 py-2 text-xs text-[var(--text-secondary)] hover:bg-[rgba(var(--border-rgb),0.04)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Field>
      </section>

      <div className="section-divider" />

      {/* ── Section 4: Source Types ── */}
      <section>
        <SectionHeader
          title="Source types"
          description="Choose which types of business entities to include in the research."
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { field: 'include_retailers', label: 'Retailers' },
            { field: 'include_wholesalers', label: 'Wholesalers' },
            { field: 'include_importers', label: 'Importers' },
            { field: 'include_official_distributors', label: 'Official distributors' },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center justify-between p-3 rounded-md bg-[var(--bg-surface)] border border-[rgba(var(--border-rgb),0.15)]">
              <div>
                <p className="text-sm text-[var(--text-primary)] font-medium">{label}</p>
              </div>
              <Toggle
                id={field}
                checked={form[field]}
                onChange={set(field)}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ── Submit ── */}
      <div className="pt-2 flex items-start gap-4">
        <button
          type="submit"
          id="submit-research-btn"
          disabled={!isFormValid}
          className="btn-primary px-8 py-3 text-base"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start Research
        </button>

        {!isFormValid && (
          <div className="flex flex-col gap-1 mt-1">
            {!form.product_query.trim() && (
              <p className="text-xs text-[var(--text-faint)]">• Product keyword required</p>
            )}
            {!form.target_country && (
              <p className="text-xs text-[var(--text-faint)]">• Target country required</p>
            )}
          </div>
        )}
      </div>
    </form>
  );
}
