const mongoose = require('mongoose')

/**
 * job description String
 * resume text : String
 * seld description : string
 * 
 * matchscore: Number
 * 
 * technical questions :
 *  [{
 *        question: ""
 *        intention : ""
 *         answer: ""
 * }]
 * behaviora questions : []
 * skill gaps: [{
 *     
 * }]
 * preparation plan : [{
 * skill
 * severity
 * type : String
 * enum: ["low","high"..]
 * }]
 * perapration plan : [{
 * day
 * focus
 * taks
 * }]
 */

const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question required"]
    },
    category: {
        type: String,
    },
    intention: {
        type: String,
    },
    answer: {
        type: String,
    }
},{
    _id: false
})

const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question required"]
    },
    category: {
        type: String,
    },
    intention: {
        type: String,
    },
    answer: {
        type: String,
    }
},{
    _id: false
})

const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "skill required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high", "Low", "Medium", "High"],
    },
    notes: {
        type: String,
    }
},{
    _id: false
})

const preparationPlanSchema = new mongoose.Schema({
    day: {
        type: String,
    },
    focus: {
        type: String,
    },
    topics: [{
        type: String,
    }],
    tasks: [{
        type: String,
    }]
},)

const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true,"js is required"],
    },
    resume: {
        type: String,
    },
    selfDescription: {
        type: String
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preparationPlan: [preparationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users"
    },
    title: {
        type: String,
        required: [true, "job title is required"]
    }
},{
    timestamps: true
})



const InterviewReport = mongoose.model('InterviewReport', interviewReportSchema)

module.exports = InterviewReport

