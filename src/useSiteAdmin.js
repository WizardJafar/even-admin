import { useCallback, useEffect, useMemo, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5050'

const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const getValueType = (value) => {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  return 'string'
}

const toEditableString = (value) => {
  if (value === null || value === undefined) return ''
  return String(value)
}

const parseByType = (value, type) => {
  if (type === 'number') {
    const parsed = Number(value)
    if (Number.isNaN(parsed)) {
      throw new Error('Expected a number value')
    }
    return parsed
  }

  if (type === 'boolean') {
    const normalized = value.trim().toLowerCase()
    if (normalized === 'true' || normalized === '1') return true
    if (normalized === 'false' || normalized === '0') return false
    throw new Error('Expected boolean: true/false')
  }

  if (type === 'null') {
    if (!value.trim() || value.trim().toLowerCase() === 'null') return null
    return value
  }

  return value
}

const flattenEditableLeaves = (value, path = '', result = {}) => {
  const valueType = getValueType(value)

  if (valueType !== 'string' && valueType !== 'number' && valueType !== 'boolean' && valueType !== 'null') {
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        const nextPath = path ? `${path}.${index}` : `${index}`
        flattenEditableLeaves(item, nextPath, result)
      })
      return result
    }

    if (isPlainObject(value)) {
      Object.entries(value).forEach(([key, nestedValue]) => {
        const nextPath = path ? `${path}.${key}` : key
        flattenEditableLeaves(nestedValue, nextPath, result)
      })
    }

    return result
  }

  result[path] = { raw: value, type: valueType, text: toEditableString(value) }
  return result
}

const buildInitialFields = (ru = {}, uz = {}) => {
  const ruFlat = flattenEditableLeaves(ru)
  const uzFlat = flattenEditableLeaves(uz)
  const allPaths = Array.from(new Set([...Object.keys(ruFlat), ...Object.keys(uzFlat)])).sort()

  return allPaths.reduce((acc, path) => {
    const ruEntry = ruFlat[path] ?? { raw: '', type: 'string', text: '' }
    const uzEntry = uzFlat[path] ?? { raw: '', type: 'string', text: '' }

    acc[path] = {
      ru: ruEntry.text,
      uz: uzEntry.text,
      ruType: ruEntry.type,
      uzType: uzEntry.type,
      saved: { ru: ruEntry.text, uz: uzEntry.text },
      status: 'idle',
      error: '',
    }
    return acc
  }, {})
}

export const useSiteAdmin = () => {
  const [fields, setFields] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [globalMessage, setGlobalMessage] = useState('')

  const fetchSite = useCallback(async () => {
    setIsLoading(true)
    setLoadError('')

    try {
      const response = await fetch(`${API_BASE}/site`)
      if (!response.ok) {
        throw new Error(`GET /site failed with status ${response.status}`)
      }

      const data = await response.json()
      const ru = data?.site?.i18n?.ru ?? {}
      const uz = data?.site?.i18n?.uz ?? {}
      setFields(buildInitialFields(ru, uz))
    } catch (error) {
      setLoadError(error.message || 'Failed to load site data')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSite()
  }, [fetchSite])

  const updateValue = useCallback((path, lang, value) => {
    setFields((prev) => {
      const field = prev[path]
      if (!field) return prev
      return {
        ...prev,
        [path]: {
          ...field,
          [lang]: value,
          status: 'idle',
          error: '',
        },
      }
    })
  }, [])

  const isDirty = useCallback((field) => field.ru !== field.saved.ru || field.uz !== field.saved.uz, [])

  const dirtyCount = useMemo(
    () => Object.values(fields).filter((field) => isDirty(field)).length,
    [fields, isDirty],
  )

  const saveLangValue = useCallback(async (lang, path, value) => {
    const response = await fetch(`${API_BASE}/site`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: `site.i18n.${lang}.${path}`, value }),
    })

    if (!response.ok) {
      throw new Error(`PATCH /site failed for ${lang}:${path} with status ${response.status}`)
    }
  }, [])

  const saveField = useCallback(
    async (path) => {
      const currentField = fields[path]
      if (!currentField || !isDirty(currentField)) return

      setFields((prev) => ({
        ...prev,
        [path]: { ...prev[path], status: 'saving', error: '' },
      }))

      try {
        if (currentField.ru !== currentField.saved.ru) {
          await saveLangValue('ru', path, parseByType(currentField.ru, currentField.ruType))
        }
        if (currentField.uz !== currentField.saved.uz) {
          await saveLangValue('uz', path, parseByType(currentField.uz, currentField.uzType))
        }

        setFields((prev) => ({
          ...prev,
          [path]: {
            ...prev[path],
            saved: { ru: prev[path].ru, uz: prev[path].uz },
            status: 'saved',
            error: '',
          },
        }))
      } catch (error) {
        setFields((prev) => ({
          ...prev,
          [path]: {
            ...prev[path],
            status: 'error',
            error: error.message || 'Failed to save field',
          },
        }))
      }
    },
    [fields, isDirty, saveLangValue],
  )

  const saveAll = useCallback(async () => {
    setIsSavingAll(true)
    setGlobalMessage('')

    const dirtyPaths = Object.entries(fields)
      .filter(([, field]) => isDirty(field))
      .map(([path]) => path)

    for (const path of dirtyPaths) {
      await saveField(path)
    }

    setGlobalMessage(
      dirtyPaths.length > 0 ? `Saved ${dirtyPaths.length} changed field(s).` : 'No changes to save.',
    )
    setIsSavingAll(false)
  }, [fields, isDirty, saveField])

  return {
    apiBase: API_BASE,
    fields,
    isLoading,
    isSavingAll,
    loadError,
    globalMessage,
    dirtyCount,
    updateValue,
    saveField,
    saveAll,
    reload: fetchSite,
    isDirty,
  }
}
