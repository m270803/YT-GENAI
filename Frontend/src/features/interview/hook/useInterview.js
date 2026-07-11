import { useContext, useEffect } from "react"
import {getAllInterviewReports,getInterviewReportById,generateInterviewReport,generateResumePdf} from "../services/interview.api"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()

    if(!context){
        throw new Error("userInterview must be used within an interviewProvider")
    }

    const {loading, setLoading, report , setReport, reports, setReports} = context

const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    setLoading(true)
    try {
        const response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
        setReport(response.interviewReport)
        return response.interviewReport
    } catch (error) {
        console.log(error)
        return null
    } finally {
        setLoading(false)
    }
}

const getReportById = async (interviewId) => {
    setLoading(true)
    try {
        const response = await getInterviewReportById(interviewId)
        setReport(response.interviewReport)
        return response.interviewReport
    } catch (error) {
        console.log(error)
        return null
    } finally {
        setLoading(false)
    }
}

    const getReports = async () => {
        setLoading(true)
        let response = null
        try{
             response = await getAllInterviewReports()
            setReports(response.interviewReports)
        }catch(error){
            console.log(error)
        } finally{
            setLoading(false)
        }
        return response.interviewReport
    }

    const getResumePdf = async (interviewReportId) => {
        setLoading(true)
        let response = null
        try {
            response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
        }
        catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId)
        } else {
            getReports()
        }
    }, [ interviewId ])

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}