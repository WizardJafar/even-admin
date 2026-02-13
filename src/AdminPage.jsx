import { useMemo, useState } from 'react'
import { useSiteAdmin } from './useSiteAdmin'

const shouldUseTextarea = (value) => value.includes('\n') || value.length > 80

function SelectedKeyEditor({ path, field, onChange }) {
  if (!path || !field) {
    return (
      <div className="alert">
        <span>Kalit topilmadi.</span>
      </div>
    )
  }

  const useTextarea = shouldUseTextarea(field.ru) || shouldUseTextarea(field.uz)

  return (
    <article className="card bg-base-100 border border-base-300 shadow-sm">
      <div className="card-body p-4 gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="badge badge-outline">Tanlangan kalit</span>
          <code className="text-xs break-all">{path}</code>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="form-control gap-1">
            <span className="label-text font-medium">RU qiymati ({field.ruType})</span>
            {useTextarea ? (
              <textarea
                className="textarea textarea-bordered"
                value={field.ru}
                rows={4}
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
            <span className="label-text font-medium">UZ qiymati ({field.uzType})</span>
            {useTextarea ? (
              <textarea
                className="textarea textarea-bordered"
                value={field.uz}
                rows={4}
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

        {field.error && <div className="alert alert-error text-sm">{field.error}</div>}
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

  const [selectedPath, setSelectedPath] = useState('')

  const effectiveSelectedPath = useMemo(() => {
    if (selectedPath && filteredPaths.includes(selectedPath)) return selectedPath
    return filteredPaths[0] ?? ''
  }, [filteredPaths, selectedPath])

  const selectedField = effectiveSelectedPath ? fields[effectiveSelectedPath] : null

  const handleSaveSelected = async () => {
    if (!effectiveSelectedPath) return
    await saveField(effectiveSelectedPath)
  }

  return (
    <main className="min-h-screen bg-base-200 py-6">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="card bg-base-100 shadow">
          <div className="card-body gap-4">
            <header>
              <h1 className="text-2xl font-bold">Sayt matnlarini tahrirlash</h1>
              <p className="text-sm opacity-70">API: {apiBase}</p>
              <p className="text-sm">
                Faqat qiymat (value) o‘zgaradi. Kalit nomi (path/object nomi) o‘zgarmaydi.
              </p>
            </header>

            <section className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
              <input
                className="input input-bordered w-full"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Kalit yoki matn bo‘yicha qidirish..."
              />
              <button
                className="btn btn-outline"
                type="button"
                onClick={reload}
                disabled={isLoading || isSavingAll}
              >
                Yangilash
              </button>
              <button
                className="btn btn-primary"
                type="button"
                onClick={saveAll}
                disabled={isLoading || isSavingAll || dirtyCount === 0}
              >
                {isSavingAll ? 'Hammasi saqlanmoqda…' : `Hammasini saqlash (${dirtyCount})`}
              </button>
            </section>

            {isLoading && <span className="loading loading-dots loading-md" aria-label="Yuklanmoqda" />}
            {loadError && <div className="alert alert-error text-sm">{loadError}</div>}
            {globalMessage && <div className="alert alert-success text-sm">{globalMessage}</div>}

            {!isLoading && !loadError && filteredPaths.length > 0 && (
              <section className="space-y-3">
                <label className="form-control gap-1">
                  <span className="label-text font-medium">Kalitni tanlang</span>
                  <select
                    className="select select-bordered"
                    value={effectiveSelectedPath}
                    onChange={(event) => setSelectedPath(event.target.value)}
                  >
                    {filteredPaths.map((path) => (
                      <option key={path} value={path}>
                        {path}
                      </option>
                    ))}
                  </select>
                </label>

                <SelectedKeyEditor path={effectiveSelectedPath} field={selectedField} onChange={updateValue} />

                <div className="flex flex-wrap gap-2">
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleSaveSelected}
                    disabled={!selectedField || isSavingAll || !isDirty(selectedField)}
                  >
                    Tanlangan kalitni saqlash
                  </button>
                </div>
              </section>
            )}

            {!isLoading && !loadError && filteredPaths.length === 0 && <p className="text-sm">Kalit topilmadi.</p>}
          </div>
        </div>
      </div>
    </main>
  )
}
