'use client'

import { RESUME_ONE_PAGER } from '@/config/resume'
import styles from './ResumeOnePager.module.css'

interface ResumeOnePagerProps {
  showActions?: boolean
  embedded?: boolean
}

export function ResumeOnePager({
  showActions = false,
  embedded = false,
}: ResumeOnePagerProps) {
  const resume = RESUME_ONE_PAGER

  return (
    <section className={styles.wrap}>
      {showActions ? (
        <div className={styles.actions} aria-label="Resume actions">
          <a href="/#resume" className={`${styles.btn} ${styles.btnSecondary}`}>
            Back to portfolio
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            Print / Save as PDF
          </button>
        </div>
      ) : null}

      <article className={`${styles.sheet} ${embedded ? styles.embedded : ''}`}>
        <header className={styles.header}>
          <h1>
            Don H. <span className={styles.accentName}>Laliberte</span>
          </h1>
          <p className={styles.target}>{resume.targetRole}</p>
          <p className={styles.meta}>
            {resume.person.location} ·{' '}
            <a href={`mailto:${resume.person.email}`}>{resume.person.email}</a>
          </p>
          <p className={styles.links}>
            {resume.person.links.map((link, i) => {
              const linkKey = link.label.toLowerCase()
              const toneClass =
                linkKey === 'portfolio'
                  ? styles.linkPortfolio
                  : linkKey === 'github'
                    ? styles.linkGithub
                    : linkKey === 'linkedin'
                      ? styles.linkLinkedin
                      : ''

              return (
                <span key={link.label}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${styles.resumeLink} ${toneClass}`}
                  >
                    {link.label}
                  </a>
                  {i < resume.person.links.length - 1 ? ' · ' : ''}
                </span>
              )
            })}
          </p>
        </header>

        <section className={styles.section}>
          <h2>Summary</h2>
          <p>{resume.summary}</p>
        </section>

        <section className={styles.section}>
          <h2>Education</h2>
          {resume.education.map((item) => (
            <div key={`${item.school}-${item.program}`} className={styles.entry}>
              <div className={styles.row}>
                <strong>{item.school}</strong>
                <span>{item.timeframe}</span>
              </div>
              <p>{item.program}</p>
              {item.details ? <p className={styles.muted}>{item.details}</p> : null}
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>Skills</h2>
          <div className={styles.skillGrid}>
            {resume.skills.map((group) => (
              <div key={group.label}>
                <p className={styles.skillLabel}>{group.label}</p>
                <p>{group.skills.join(', ')}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2>Experience</h2>
          {resume.experience.map((item) => (
            <div key={`${item.company}-${item.role}`} className={styles.entry}>
              <div className={styles.row}>
                <strong>
                  {item.role} · {item.company}
                </strong>
                <span>{item.timeframe}</span>
              </div>
              <ul>
                {item.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className={styles.section}>
          <h2>Projects</h2>
          {resume.projects.map((project) => (
            <div key={project.name} className={styles.entry}>
              <div className={styles.row}>
                <strong>
                  {project.name} · {project.role}
                </strong>
                <span>{project.timeframe}</span>
              </div>
              <p className={styles.muted}>{project.stack.join(' · ')}</p>
              <ul>
                {project.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>
      </article>
    </section>
  )
}
