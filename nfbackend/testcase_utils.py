from loguru import logger
import traceback 
import os
import dbops 
import datetime
import global_vars as g

def add_testcase(testboardID,testcase_name,requests,userID):


	testcaseID = dbops.insert_functional_testcase(testboardID,testcase_name,requests,userID)

	if testcaseID == False:
		return False,"Seems like there is an error on our end, please contact support."

	return True,"Testcase added"


def get_functional_testcases(testboardID):

	try:
		testcases_list = dbops.list_testcases(testboardID)

		for i in range(len(testcases_list)):
			testcases_list[i]["key"] = i+1
			testcases_list[i]["testcaseID"] = str(testcases_list[i]["_id"]) 
			del testcases_list[i]["_id"]

			j = 1
			for r in testcases_list[i]["requests"]:
				testcases_list[i]["requestBody"+str(j)]  = r["requestBody"]
				testcases_list[i]["responseCode"+str(j)] = r["responseCode"]
				testcases_list[i]["responseBody"+str(j)] = r["responseBody"]
				testcases_list[i]["responseTime"+str(j)] = r["responseTime"]
				j+=1

			del testcases_list[i]["requests"]


		return testcases_list,"success"
	except Exception as e:
		logger.error("Error while fetching test list")
		traceback.print_exc()
		return None,"Error while fetching test list"



def delete_testcase(testcaseID):

	try:
	    delete_result = dbops.delete_functional_testcase(testcaseID)
	    return delete_result,"Deleted testcase"

	except Exception as e:
		logger.error("Error while deleting testcase")
		traceback.print_exc()
		return False,"Error while deleting testcase"	    


def edit_testcase(testcaseID,testcaseName,testcaseValues,userID):

	try:
	    edit_result = dbops.update_functional_testcase(testcaseID,testcaseName,testcaseValues,userID)
	    return edit_result,"Edited testcase"

	except Exception as e:
		logger.error("Error while editing testcase")
		traceback.print_exc()
		return False,"Error while editing testcase"	    






