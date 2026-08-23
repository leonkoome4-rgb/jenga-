import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import { selectAllProjects, projectUpdated, projectDeleted } from '../features/projects/projectsSlice.js'
import { users } from '../data/users.js'
import { cohorts } from '../data/cohorts.js'

function StatBlock({ label, value, accent }) {
  return (
    <div className="flex-1 text-center sm:text-left">
      <p className={`font-heading text-[32px] font-bold ${accent === 'orange' ? 'text-orange' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1 text-[13px] text-white/70">{label}</p>
    </div>
  )
}

export default function AdminDashboard() {
  const dispatch = useDispatch()
  const projects = useSelector(selectAllProjects)
  const [editingId, setEditingId] = useState(null)
  const [draft, setDraft] = useState({ name: '', cohort: '' })

  const sorted = useMemo(
    () => [...projects].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    [projects],
  )

  const startEdit = (project) => {
    setEditingId(project.id)
    setDraft({ name: project.name, cohort: project.cohort })
  }

  const saveEdit = (id) => {
    dispatch(projectUpdated({ id, changes: draft }))
    setEditingId(null)
  }

  const handleDelete = (project) => {
    if (window.confirm(`Delete "${project.name}"? This can't be undone.`)) {
      dispatch(projectDeleted(project.id))
    }
  }

  return (
    <div>
      <div className="bg-navy px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="font-heading text-[22px] font-bold text-white">Admin dashboard</h1>
            <Link to="/admin/cohorts" className="text-[14px] font-medium text-orange">
              Manage cohorts
            </Link>
          </div>
          <div className="mt-8 flex flex-col gap-8 sm:flex-row">
            <StatBlock label="Total projects" value={projects.length} accent="orange" />
            <StatBlock label="Total students" value={users.length} accent="white" />
            <StatBlock label="Total cohorts" value={cohorts.length} accent="orange" />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-6 lg:px-8 lg:pb-8">
        <h2 className="font-heading text-[16px] font-semibold text-navy">Recent projects</h2>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead>
              <tr className="border-b border-border text-[12px] uppercase tracking-wide text-text-muted">
                <th className="px-5 py-3 font-medium">Project</th>
                <th className="px-5 py-3 font-medium">Creator</th>
                <th className="px-5 py-3 font-medium">Cohort</th>
                <th className="px-5 py-3 font-medium">Date posted</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((project) => {
                const isEditing = editingId === project.id
                return (
                  <tr key={project.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3">
                      {isEditing ? (
                        <input
                          value={draft.name}
                          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                          className="w-full rounded-md border border-border px-2 py-1 text-[13px] focus:outline-none"
                        />
                      ) : (
                        <Link to={`/projects/${project.id}`} className="text-navy hover:text-orange">
                          {project.name}
                        </Link>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{project.owner.name}</td>
                    <td className="px-5 py-3 text-text-secondary">
                      {isEditing ? (
                        <select
                          value={draft.cohort}
                          onChange={(e) => setDraft((d) => ({ ...d, cohort: e.target.value }))}
                          className="rounded-md border border-border px-2 py-1 text-[13px] focus:outline-none"
                        >
                          {cohorts.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      ) : (
                        project.cohort
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-muted">{project.createdAt}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(project.id)}
                              className="text-navy"
                              aria-label="Save"
                            >
                              <Check size={16} strokeWidth={2} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="text-text-muted"
                              aria-label="Cancel"
                            >
                              <X size={16} strokeWidth={2} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(project)}
                              className="text-text-secondary hover:text-navy"
                              aria-label="Edit"
                            >
                              <Pencil size={15} strokeWidth={1.75} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(project)}
                              className="text-text-secondary hover:text-navy"
                              aria-label="Delete"
                            >
                              <Trash2 size={15} strokeWidth={1.75} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
