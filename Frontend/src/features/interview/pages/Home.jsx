import React, { useEffect, useRef, useState } from 'react'
import "../style/home.scss"
import { useInterview } from '../hook/useInterview'
import { useNavigate } from 'react-router'

const Home = () => {
    const { loading, generateReport, reports, getReports } = useInterview()
    const [jobDescription, setJobDescription] = useState("")
    const [selfDescription, setSelfDescription] = useState("")
    const [resumeFileName, setResumeFileName] = useState("")
    const [error, setError] = useState("")
    const resumeInputRef = useRef()

    const navigate = useNavigate()

    useEffect(() => {
        getReports()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        setResumeFileName(file ? file.name : "")
    }

    const handleGenrateReport = async () => {
        setError("")
        const resumeFile = resumeInputRef.current.files[0]

        if (!jobDescription.trim()) {
            setError("Please enter a job description")
            return
        }
        if (!resumeFile) {
            setError("Please upload a resume")
            return
        }

        try {
            const data = await generateReport({ jobDescription, selfDescription, resumeFile })
            if (!data) {
                setError("Failed to generate report")
                return
            }
            navigate(`/interview/${data._id}`)
        } catch (err) {
            console.error("genrateReport failed:", err)
            setError(err?.message || "Failed to generate report")
        }
    }

    if (loading) {
        return (
            <main className='loading-screen'>
                <h1>Loading ...</h1>
            </main>
        )
    }

    return (
        <main className="home">
            <div className="container">
                <div className="page-header">
                    <h1>AI Interview Generator</h1>
                    <p>
                        Upload your resume, paste the job description, and let AI generate
                        a personalized interview report.
                    </p>
                </div>

                <div className="interview-input-group">
                    <div className="left">
                        <label htmlFor="jobDescription">Job Description</label>
                        <textarea
                            onChange={(e) => setJobDescription(e.target.value)}
                            name="jobDescription"
                            id="jobDescription"
                            placeholder='enter job description'
                        ></textarea>
                    </div>
                    <div className="right">
                        <div className="input-group">
                            <p>Resume <small className='highlight'>(use resume and self description together for best result)</small></p>
                            <label className='file-label' htmlFor="resume">
                                {resumeFileName || "Upload Resume"}
                            </label>
                            <input
                                ref={resumeInputRef}
                                hidden
                                type="file"
                                name="resume"
                                id="resume"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="input-group">
                            <label htmlFor="selfDescription">Self Description</label>
                            <textarea
                                onChange={(e) => setSelfDescription(e.target.value)}
                                name="selfDescription"
                                id="selfDescription"
                                placeholder='enter self description'
                            ></textarea>
                        </div>

                        {error && <p className="error-text">{error}</p>}

                        <button
                            onClick={handleGenrateReport}
                            disabled={loading}
                            className='button primary-button'
                        >
                            Generate Interview Report
                        </button>
                    </div>
                </div>
            </div>

            {/* recent reports */}
            {reports && reports.length > 0 && (
                <section className="recent-reports container">
                    <h2>Recent Reports</h2>
                    <ul className="report-list">
                        {reports.map((report) => (
                            <li
                                key={report._id}
                                className="report-item"
                                onClick={() => navigate(`/interview/${report._id}`)}
                            >
                                <div className="report-item-main">
                                    <p className="report-title">{report.title || "Untitled Report"}</p>
                                    <p className="report-date">
                                        {report.createdAt
                                            ? new Date(report.createdAt).toLocaleDateString(undefined, {
                                                  year: "numeric",
                                                  month: "short",
                                                  day: "numeric",
                                              })
                                            : ""}
                                    </p>
                                </div>
                                {typeof report.matchScore === "number" && (
                                    <span className="report-score">{report.matchScore}%</span>
                                )}
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <footer className="app-footer">
                <div className="container footer-content">
                    <p>&copy; {new Date().getFullYear()} AI Interview Generator. All rights reserved.</p>
                </div>
            </footer>
        </main>
    )
}

export default Home