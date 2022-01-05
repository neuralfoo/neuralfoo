import dbops 
from loguru import logger
import traceback 
from bson.objectid import ObjectId
import global_vars as g 
import api_controller
import datetime
import sklearn.metrics as metrics

'''
parse request
fetch all test cases
hit api
compare response with expected response
update passed/failed cases
'''


if __name__=="__main__":

	import sys

	testID = sys.argv[1]
	logger.info(f"Received testID {testID}")

	test_details = dbops.get_test(testID)
	logger.info(f"Test object fetched {test_details}")

	request_list = api_controller.extract_requests_from_testboard(test_details["testboard"])
	logger.info(f"Request list generated")

	testcases_list = dbops.list_testcases(test_details["testboard"]["testboardID"])
	logger.info(f"Testcases received")

	passed_cases_count = 0
	failed_cases_count = 0

	for testcase in testcases_list:
	
		api_hit_result = api_controller.functional_api_runner(testcase,request_list)

		api_hit_result["testID"] = testID

		dbops.insert_api_hit(api_hit_result)

		if api_hit_result["result"] == True:
			passed_cases_count += 1

		if api_hit_result["result"] == False:
			failed_cases_count += 1

		logger.info("api_hit_result")
		logger.info(api_hit_result)


		logger.info(f"Passed test cases: {passed_cases_count}")
		logger.info(f"Failed test cases: {failed_cases_count}")

		dbops.update_test(testID,"passedCasesCount",passed_cases_count)
		dbops.update_test(testID,"failedCasesCount",failed_cases_count)
	
	end_time = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

	dbops.update_test(testID,"endTime",end_time)

	lastrunon = datetime.datetime.now().strftime("%d %b'%y %H:%M:%S")
	dbops.update_testboard(test_details["testboard"]["testboardID"],"apiLastRunOn",lastrunon)
	
	dbops.update_test(testID,"testStatus","completed")




