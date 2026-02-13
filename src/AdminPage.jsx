import { useMemo, useState } from 'react'
import { useSiteAdmin } from './useSiteAdmin'

const shouldUseTextarea = (value) => value.includes('\n') || value.length > 80

function FieldEditor({ path, field, onChange, onSave, disabled, dirty }) {
  const useTextarea = shouldUseTextarea(field.ru) || shouldUseTextarea(field.uz)

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <code className="text-xs break-all">{path}</code>
          <button className="btn btn-sm btn-primary" type="button" onClick={onSave} disabled={disabled || !dirty}>
            {field.status === 'saving' ? 'Saving…' : 'Save'}
          </button>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="form-control gap-1">
            <span className="label-text font-medium">RU ({field.ruType})</span>
            {useTextarea ? (
              <textarea
                className="textarea textarea-bordered"
                value={field.ru}
                rows={3}
                onChange={(event) => onChange(path, 'ru', event.target.value)}
              />
            ) : (
              <input
                className="input input-bordered"
                value={field.ru}
                onChange={(event) => onChange(path, 'ru', event.target.value)}
              />
            )}
          </label>

          <label className="form-control gap-1">
            <span className="label-text font-medium">UZ ({field.uzType})</span>
            {useTextarea ? (
              <textarea
                className="textarea textarea-bordered"
                value={field.uz}
                rows={3}
                onChange={(event) => onChange(path, 'uz', event.target.value)}
              />
            ) : (
              <input
                className="input input-bordered"
                value={field.uz}
                onChange={(event) => onChange(path, 'uz', event.target.value)}
              />
            )}
          </label>
        </div>

        {field.error && <p className="text-error text-sm">{field.error}</p>}
      </div>
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

  return (
    <main className="min-h-screen bg-base-200 py-6">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <header>
              <h1 className="text-2xl font-bold">Site i18n Admin</h1>
              <p className="text-sm opacity-70">API: {apiBase}</p>
              <p className="text-sm">Каждый ключ ниже редактируется отдельно (RU и UZ).</p>
            </header>

            <section className="flex flex-col gap-2 sm:flex-row">
              <input
                className="input input-bordered w-full"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search key/value..."
              />
              <button
                className="btn btn-primary"
                type="button"
                onClick={saveAll}
                disabled={isLoading || isSavingAll || dirtyCount === 0}
              >
                {isSavingAll ? 'Saving all…' : `Save All (${dirtyCount})`}
              </button>
              <button className="btn btn-outline" type="button" onClick={reload} disabled={isLoading || isSavingAll}>
                Reload
              </button>
            </section>

            {isLoading && <span className="loading loading-dots loading-md" aria-label="Loading site data" />}
            {loadError && <div className="alert alert-error text-sm">{loadError}</div>}
            {globalMessage && <div className="alert alert-success text-sm">{globalMessage}</div>}

            {!isLoading && !loadError && filteredPaths.length === 0 && <p className="text-sm">No fields found.</p>}

            {!isLoading && !loadError && (
              <section className="space-y-3">
                <h2 className="text-lg font-semibold">All keys ({filteredPaths.length})</h2>
                <div className="grid gap-3">
                  {filteredPaths.map((path) => (
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
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
