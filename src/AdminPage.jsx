import { useMemo, useState } from 'react'
import { useSiteAdmin } from './useSiteAdmin'

const shouldUseTextarea = (value) => value.includes('\n') || value.length > 80

const groupByFirstSegment = (paths) => {
  const grouped = {}

  paths.forEach((path) => {
    const firstSegment = path.split('.')[0] || 'other'
    if (!grouped[firstSegment]) {
      grouped[firstSegment] = []
    }
    grouped[firstSegment].push(path)
  })

  return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
}

function FieldEditor({ path, field, onChange, onSave, disabled, dirty }) {
  const Component = shouldUseTextarea(field.ru) || shouldUseTextarea(field.uz) ? 'textarea' : 'input'

  return (
    <article className="field-card">
      <div className="field-header">
        <code>{path}</code>
        <button type="button" onClick={onSave} disabled={disabled || !dirty}>
          {field.status === 'saving' ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="field-grid">
        <label>
          <span>RU</span>
          <Component
            value={field.ru}
            onChange={(event) => onChange(path, 'ru', event.target.value)}
            rows={Component === 'textarea' ? 3 : undefined}
          />
        </label>

        <label>
          <span>UZ</span>
          <Component
            value={field.uz}
            onChange={(event) => onChange(path, 'uz', event.target.value)}
            rows={Component === 'textarea' ? 3 : undefined}
          />
        </label>
      </div>

      {field.error && <p className="error-text">{field.error}</p>}
    </article>
  )
}

export default function AdminPage() {
  const {
    apiBase,
    fields,
    isLoading,
    isSavingAll,
    loadError,
    globalMessage,
    dirtyCount,
    updateValue,
    saveField,
    saveAll,
    reload,
    isDirty,
  } = useSiteAdmin()

  const [search, setSearch] = useState('')

  const filteredPaths = useMemo(() => {
    const allPaths = Object.keys(fields)
    if (!search.trim()) return allPaths
    const normalized = search.toLowerCase()

    return allPaths.filter((path) => {
      const field = fields[path]
      return (
        path.toLowerCase().includes(normalized) ||
        field.ru.toLowerCase().includes(normalized) ||
        field.uz.toLowerCase().includes(normalized)
      )
    })
  }, [fields, search])

  const groupedFields = useMemo(() => groupByFirstSegment(filteredPaths), [filteredPaths])

  return (
    <main className="admin-page">
      <header>
        <h1>Site i18n Admin</h1>
        <p>API: {apiBase}</p>
      </header>

      <section className="toolbar">
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search key/value..."
        />
        <button type="button" onClick={saveAll} disabled={isLoading || isSavingAll || dirtyCount === 0}>
          {isSavingAll ? 'Saving all…' : `Save All (${dirtyCount})`}
        </button>
        <button type="button" onClick={reload} disabled={isLoading || isSavingAll}>
          Reload
        </button>
      </section>

      {isLoading && <p>Loading site data…</p>}
      {loadError && <p className="error-text">{loadError}</p>}
      {globalMessage && <p className="success-text">{globalMessage}</p>}

      {!isLoading && !loadError && groupedFields.length === 0 && <p>No fields found.</p>}

      {!isLoading && !loadError &&
        groupedFields.map(([groupName, paths]) => (
          <section key={groupName} className="group-section">
            <h2>
              {groupName} <small>({paths.length})</small>
            </h2>

            <div className="group-content">
              {paths.map((path) => (
                <FieldEditor
                  key={path}
                  path={path}
                  field={fields[path]}
                  onChange={updateValue}
                  onSave={() => saveField(path)}
                  disabled={isSavingAll}
                  dirty={isDirty(fields[path])}
                />
              ))}
            </div>
          </section>
        ))}
    </main>
  )
}
