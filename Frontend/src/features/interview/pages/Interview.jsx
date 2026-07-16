import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import "../style/interview.scss"
import { useInterview } from '../hook/useInterview'

const NAV_ITEMS = [
  {
    key: "technical",
    label: "Technical",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 6 3 12l6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "behavioral",
    label: "Behavioral",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "roadmap",
    label: "Road Map",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M9 20V10M9 10 4 8v10l5 2M9 10l6-3M15 20V10M15 10l5-2v10l-5 2M15 10l-6-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

// Fallback data shown when no report has been generated yet / API returns nothing
// NOTE: shapes match exactly what renderMainContent() and the right sidebar expect
const SAMPLE_DATA = {
  matchScore: 78,
  technicalQuestions: [
    {
      question: "Explain the difference between SQL JOIN types (INNER, LEFT, RIGHT, FULL).",
      answer: "INNER JOIN returns only matching rows from both tables. LEFT JOIN returns all rows from the left table plus matches from the right. RIGHT JOIN does the opposite. FULL JOIN returns all rows from both, matching where possible."
    },
    {
      question: "How would you optimize a slow-running SQL query?",
      answer: "Check the execution plan, add appropriate indexes, avoid SELECT *, reduce subqueries in favor of joins, and filter data as early as possible in the query."
    },
    {
      question: "What is the difference between a list and a tuple in Python?",
      answer: "Lists are mutable and defined with [], tuples are immutable and defined with (). Tuples are generally faster and used for fixed collections of data."
    },
  ],
  behavioralQuestions: [
    {
      question: "Tell me about a time you had to debug a difficult issue under time pressure.",
      answer: "Use the STAR method: describe the Situation, the Task, the Actions you took to isolate and fix the bug, and the Result, including what you learned."
    },
    {
      question: "Describe a situation where you disagreed with a teammate. How did you resolve it?",
      answer: "Focus on active listening, presenting data/reasoning calmly, and reaching a collaborative decision rather than a personal conflict."
    },
  ],
  preparationPlan: [
    {
      day: "Day 1–2",
      focus: "Strengthen SQL fundamentals",
      topics: ["Joins", "Window functions", "Query optimization"],
      tasks: ["Practice 10 join-based problems on a mock dataset", "Rewrite 3 slow queries using EXPLAIN"],
    },
    {
      day: "Day 3",
      focus: "Core data structures & algorithms",
      topics: ["Arrays", "Hashmaps", "Trees"],
      tasks: ["Solve 5 problems using two-pointer / sliding window patterns"],
    },
    {
      day: "Day 4",
      focus: "Mock behavioral interviews",
      topics: ["STAR method"],
      tasks: ["Prepare 4–5 STAR stories covering teamwork, conflict, failure, leadership"],
    },
    {
      day: "Day 5",
      focus: "Review your own projects deeply",
      topics: ["EduSage", "ReceiptAI"],
      tasks: ["Be ready to explain design decisions, trade-offs, and challenges"],
    },
  ],
  skillGaps: [
    { skill: "Redis", severity: "high", notes: "Not mentioned in resume; appears as a requirement in the JD." },
    { skill: "Message Queue", severity: "medium", notes: "Some exposure implied but not explicit." },
    { skill: "Event Loop", severity: "medium", notes: "Core JS concept worth reviewing before the interview." },
    { skill: "System Design", severity: "high", notes: "No large-scale design experience listed." },
  ],
}

const Interview = () => {
  const [activeSection, setActiveSection] = useState("technical")
  const { interviewId } = useParams()
  const { report, getReportById, loading, getResumePdf } = useInterview()

  useEffect(() => {
    if (interviewId) {
      getReportById(interviewId)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId])

  const hasData = report && (
    report.technicalQuestions?.length ||
    report.behavioralQuestions?.length ||
    report.preparationPlan?.length ||
    report.skillGaps?.length
  )

  const source = hasData ? report : SAMPLE_DATA
  const isSample = !hasData

  const technicalQuestions = source.technicalQuestions || []
  const behavioralQuestions = source.behavioralQuestions || []
  const preparationPlan = source.preparationPlan || []
  const skillGaps = source.skillGaps || []
  const matchScore = source.matchScore ?? null

  if (loading) {
    return (
      <main className="loading-screen">
        <div className="loading-mark" />
        <p>Preparing your report…</p>
      </main>
    )
  }

  const renderMainContent = () => {
    if (activeSection === "technical") {
      if (!technicalQuestions.length) {
        return <p className="empty-state">No technical questions generated yet.</p>
      }
      return (
        <div className="qa-list">
          {technicalQuestions.map((item, idx) => (
            <div className="qa-item" key={idx}>
              <p className="question"><span className="q-index">{String(idx + 1).padStart(2, "0")}</span>{item.question}</p>
              {item.answer && <p className="answer">{item.answer}</p>}
            </div>
          ))}
        </div>
      )
    }

    if (activeSection === "behavioral") {
      if (!behavioralQuestions.length) {
        return <p className="empty-state">No behavioral questions generated yet.</p>
      }
      return (
        <div className="qa-list">
          {behavioralQuestions.map((item, idx) => (
            <div className="qa-item" key={idx}>
              <p className="question"><span className="q-index">{String(idx + 1).padStart(2, "0")}</span>{item.question}</p>
              {item.answer && <p className="answer">{item.answer}</p>}
            </div>
          ))}
        </div>
      )
    }

    if (activeSection === "roadmap") {
      if (!preparationPlan.length) {
        return <p className="empty-state">No preparation plan generated yet.</p>
      }
      return (
        <div className="roadmap-list">
          {preparationPlan.map((item, idx) => (
            <div className="roadmap-item" key={idx}>
              <div className="roadmap-marker">
                <span className="step-number">{idx + 1}</span>
                {idx < preparationPlan.length - 1 && <span className="step-line" />}
              </div>
              <div className="step-content">
                <p className="step-title">
                  {item.day && <span className="step-day">{item.day}</span>}
                  {item.focus || ""}
                </p>
                {item.topics?.length > 0 && (
                  <p className="step-description">
                    <span className="step-label">Topics</span> {item.topics.join(" · ")}
                  </p>
                )}
                {item.tasks?.length > 0 && (
                  <ul className="step-tasks">
                    {item.tasks.map((task, taskIdx) => (
                      <li key={taskIdx}>{task}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )
    }

    return null
  }

  // 0-100 -> stroke-dashoffset for the arc gauge (circumference ≈ 214 for r=34, 3/4 arc)
  const gaugeCircumference = 214
  const gaugeOffset = matchScore !== null
    ? gaugeCircumference - (gaugeCircumference * Math.min(matchScore, 100)) / 100
    : gaugeCircumference

  return (
    <main className="interview">
      <div className="interview-layout">

        <aside className="sidebar left-sidebar">
          <div className="brand-mark">Interview Report</div>
          <nav>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${activeSection === item.key ? "active" : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <button
            onClick={() => getResumePdf(interviewId)}
            className="sidebar-bottom-btn"
          >
            Download tailored resume
          </button>
        </aside>

        <section className="main-content">
          <div className="content-header">
            <h1>{NAV_ITEMS.find((n) => n.key === activeSection)?.label}</h1>
            {isSample && <span className="sample-badge">Sample data</span>}
          </div>
          {renderMainContent()}
        </section>

        <aside className="sidebar right-sidebar">
          {matchScore !== null && (
            <div className="match-score">
              <p className="sidebar-title">Match Score</p>
              <div className="gauge">
                <svg viewBox="0 0 100 100">
                  <circle className="gauge-track" cx="50" cy="50" r="34" />
                  <circle
                    className="gauge-value"
                    cx="50" cy="50" r="34"
                    strokeDasharray={gaugeCircumference}
                    strokeDashoffset={gaugeOffset}
                  />
                </svg>
                <span className="gauge-number">{matchScore}<small>%</small></span>
              </div>
            </div>
          )}

          <p className="sidebar-title">Skill Gaps</p>
          <div className="skill-gaps">
            {skillGaps.length ? (
              skillGaps.map((item, idx) => (
                <span
                  className={`skill-tag ${item.severity ? `severity-${item.severity}` : ""}`}
                  key={idx}
                  title={item.notes || ""}
                >
                  {item.skill}
                </span>
              ))
            ) : (
              <p className="empty-state">No skill gaps identified.</p>
            )}
          </div>
        </aside>

      </div>
    </main>
  )
}

export default Interview