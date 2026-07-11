import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import "../style/interview.scss"
import { useInterview } from '../hook/useInterview'

// Expected shape of the interview report data (from backend / DB):
// {
//   jobDescription: string,
//   resume: string,
//   selfDescription: string,
//   matchScore: number,
//   technicalQuestions: [{ question: string, answer: string }],
//   behavioralQuestions: [{ question: string, answer: string }],
//   skillGaps: [string],
//   preparationPlan: [{ title: string, description: string }]
// }

const NAV_ITEMS = [
  { key: "technical", label: "Technical questions" },
  { key: "behavioral", label: "Behavioral questions" },
  { key: "roadmap", label: "Road Map" },
]

// Fallback data shown when no report has been generated yet / API returns nothing
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
      title: "Strengthen SQL fundamentals",
      description: "Practice joins, window functions, and query optimization using a mock dataset for 3-4 days."
    },
    {
      title: "Review core Data Structures & Algorithms",
      description: "Revisit arrays, hashmaps, trees, and common patterns like two-pointer and sliding window."
    },
    {
      title: "Mock behavioral interviews",
      description: "Prepare 4-5 STAR stories covering teamwork, conflict, failure, and leadership."
    },
    {
      title: "Review your own projects deeply",
      description: "Be ready to explain design decisions, trade-offs, and challenges in EduSage and ReceiptAI."
    },
  ],
  skillGaps: ["Redis", "Message Queue", "Event Loop", "System Design"],
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
      <main className='loading-screen'>
        <h1>Loading ...</h1>
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
              <p className="question">{idx + 1}. {item.question}</p>
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
              <p className="question">{idx + 1}. {item.question}</p>
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
          <span className="step-number">{idx + 1}</span>
          <div className="step-content">
            <p className="step-title">{item.day}{item.focus ? ` — ${item.focus}` : ""}</p>
            {item.topics?.length > 0 && (
              <p className="step-description">
                <strong>Topics:</strong> {item.topics.join(", ")}
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

  return (
    <main className="interview">
      <div className="interview-layout">

        <aside className="sidebar left-sidebar">
          <nav>
            {NAV_ITEMS.map((item) => (
              <button
                key={item.key}
                className={`nav-item ${activeSection === item.key ? "active" : ""}`}
                onClick={() => setActiveSection(item.key)}
              >
                {item.label}
              </button>
              
            ))}
          </nav>
          <button 
          onClick={() => (getResumePdf(interviewId))}
          className="sidebar-bottom-btn">
            Download Ai generated Resume
          </button>

        </aside>

        <section className="main-content">
          {isSample && (
            <span className="sample-badge"></span>
          )}
          {renderMainContent()}
        </section>

        <aside className="sidebar right-sidebar">
          {matchScore !== null && (
            <div className="match-score">
              <p className="sidebar-title">Match Score</p>
              <div className="score-circle">
                <span className="score-value">{matchScore}%</span>
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