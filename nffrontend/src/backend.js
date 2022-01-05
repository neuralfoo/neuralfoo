const backend = {}

backend.host = process.env.REACT_APP_BACKEND_HOST

backend.login 						= backend.host + "/app/login"
backend.signup 						= backend.host + "/app/signup"
backend.validateToken 				= backend.host + "/app/auth/validate"

backend.createTestboard 			= backend.host + "/app/testboard/create"
backend.getTestboard 				= backend.host + "/app/testboard/get/"
backend.updateTestboard 			= backend.host + "/app/testboard/update"
backend.listTestboards 				= backend.host + "/app/testboard/list"

backend.fetchUserDetails 			= backend.host + "/app/user/details/get"
backend.updateUserDetails 			= backend.host + "/app/user/details/update"
backend.changePassword 				= backend.host + "/app/user/changePassword"
backend.getReferralCode 			= backend.host + "/app/organization/referralCode/get"
backend.refreshReferralCode 		= backend.host + "/app/organization/referralCode/refresh"

backend.uploadImageFile 			= backend.host + "/app/fs/image/upload"
backend.getImageFile 				= backend.host + "/app/fs/image/"
backend.getTestFiles 				= backend.host + "/app/testboard/testFiles/list"
backend.deleteTestFiles 			= backend.host + "/app/testboard/testFiles/delete"
backend.updateAnnotation 			= backend.host + "/app/testboard/testFiles/annotation/update"

backend.deleteTest 					= backend.host + "/app/testcontroller/test/delete"
backend.listApiHits					= backend.host + "/app/testcontroller/test/hitlist"

backend.runAccuracyTestImgClf 		= backend.host + "/app/testcontroller/imageclassification/accuracytest/action"
backend.getImgClfAccuracyTests 		= backend.host + "/app/testcontroller/imageclassification/accuracytest/list"
backend.getImgClfAccuracyReport 	= backend.host + "/app/testcontroller/imageclassification/accuracytest/get"

backend.addFunctionalTestcase		= backend.host + "/app/testcontroller/functionaltest/testcase/add"
backend.listFunctionalTestcases		= backend.host + "/app/testcontroller/functionaltest/testcase/list"
backend.deleteFunctionalTestcase	= backend.host + "/app/testcontroller/functionaltest/testcase/delete"
backend.editFunctionalTestcase		= backend.host + "/app/testcontroller/functionaltest/testcase/update"

backend.functionalTestAction 		= backend.host + "/app/testcontroller/functionaltest/action"
backend.functionalTestList 			= backend.host + "/app/testcontroller/functionaltest/list"
backend.functionalTestDetails 		= backend.host + "/app/testcontroller/functionaltest/details"
backend.functionalTestApiHits 		= backend.host + "/app/testcontroller/functionaltest/hits"


export default backend
