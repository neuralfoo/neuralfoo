const endpoints = {}

endpoints.host = process.env.REACT_APP_FRONTEND_HOST //"http://0.0.0.0:3000"

endpoints.login =  "/web/login"
endpoints.signup =  "/web/signup"

endpoints.dashboard =  "/web/dashboard"
endpoints.settings =  "/web/settings"

endpoints.newTestboard =  "/web/testboard/new"
endpoints.getTestboard =  "/web/testboard/get/:testboardID"

endpoints.getTestboardPrefix =  "/web/testboard/get/"

endpoints.onboardMemberPrefix = endpoints.host + "/web/onboard/"
endpoints.onboardMember =  "/web/onboard/:referralCode"

endpoints.accuracyReport 		= "/web/report/accuracy/:testboardID/:testID"
endpoints.accuracyReportPrefix 	= "/web/report/accuracy/"

endpoints.functionalReport 		= "/web/report/functional/:testboardID/:testID"
endpoints.functionalReportPrefix 	= "/web/report/functional/"



export default endpoints
