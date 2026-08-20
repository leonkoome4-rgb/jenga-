import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Trash2, Check, X } from 'lucide-react'
import { cohorts as initialCohorts } from '../data/cohorts.js'
import { projects as allProjects } from '../data/projects.js'
import Button from '../components/Button.jsx'

export default function AdminCohorts() {
  const [cohorts, setCohorts] = useState(initialCohorts)
  const [newCohort, setNewCohort] = useState('')
  const [editingIndex, setEditingIndex] = useState(null)
  const [draftName, setDraftName] = useState('')

  const projectCount = (name) => allProjects.filter((p) => p.cohort === name).length

  const handleAdd = () => {
    const value = newCohort.trim()
    if (value && !cohorts.includes(value)) {
      setCohorts((prev) => [value, ...prev])
      setNewCohort('')
    }
  }

  const startEdit = (index) => {
    setEditingIndex(index)
    setDraftName(cohorts[index])
  }

  const saveEdit = (index) => {
    setCohorts((prev) => prev.map((c, i) => (i === index ? draftName.trim() || c : c)))
    setEditingIndex(null)
  }

  const handleRemove = (name) => {
    if (window.confirm(`Remove "${name}"? Projects already in this cohort will keep the label.`)) {
      setCohorts((prev) => prev.filter((c) => c !== name))
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-[13px] text-text-secondary">
        <ArrowLeft size={14} strokeWidth={1.75} />
        Admin dashboard
      </Link>

      <h1 className="font-heading mt-4 text-[24px] font-bold text-navy">Manage cohorts</h1>
      <p className="mt-1 text-[14px] text-text-secondary">
        Add, rename, or remove the cohorts students choose from when publishing a project.
      </p>

      <div className="mt-6 flex gap-2">
        <input
          value={newCohort}
          onChange={(e) => setNewCohort(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. Cohort 13"
          className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-[14px] text-navy placeholder:text-text-muted focus:outline-none focus:border-orange"
        />
        <Button variant="primary" onClick={handleAdd}>
          <Plus size={15} strokeWidth={2} />
          Add
        </Button>
      </div>

      <div className="mt-6 flex flex-col divide-y divide-border rounded-2xl border border-border bg-white">
        {cohorts.map((cohort, index) => {
          const isEditing = editingIndex === index
          return (
            <div key={cohort + index} className="flex items-center justify-between gap-3 px-5 py-4">
              {isEditing ? (
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  className="w-full rounded-md border border-border px-2 py-1 text-[14px] focus:outline-none"
                  autoFocus
                />
              ) : (
                <div>
                  <p className="text-[14px] font-medium text-navy">{cohort}</p>
                  <p className="text-[13px] text-text-muted">{projectCount(cohort)} projects</p>
                </div>
              )}

              <div className="flex shrink-0 items-center gap-3">
                {isEditing ? (
                  <>
                    <button type="button" onClick={() => saveEdit(index)} aria-label="Save">
                      <Check size={16} strokeWidth={2} className="text-navy" />
                    </button>
                    <button type="button" onClick={() => setEditingIndex(null)} aria-label="Cancel">
                      <X size={16} strokeWidth={2} className="text-text-muted" />
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" onClick={() => startEdit(index)} aria-label="Edit">
                      <Pencil size={15} strokeWidth={1.75} className="text-text-secondary hover:text-navy" />
                    </button>
                    <button type="button" onClick={() => handleRemove(cohort)} aria-label="Remove">
                      <Trash2 size={15} strokeWidth={1.75} className="text-text-secondary hover:text-navy" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
