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
fetch all images
fetch class names
hit api
compare predicton with gt
track metrics


need to add api hits update to db
'''


if __name__=="__main__":

	import sys

	testID = sys.argv[1]
	logger.info(f"Received testID {testID}")

	test_details = dbops.get_test(testID)
	logger.info(f"Test object fetched {test_details}")

	request_list = api_controller.extract_requests_from_testboard(test_details["testboard"])
	logger.info(f"Request list generated")

	imageIDs = dbops.get_images_for_testboard(test_details["testboard"]["testboardID"])
	logger.info(f"Image ID received")

	y_true = []
	y_pred = []	
	all_classes = []

	for imageID in imageIDs:
	
		api_hit_result = api_controller.imageclassification_accuracy_api_runner(str(imageID["_id"]),request_list)

		api_hit_result["testID"] = testID

		dbops.insert_api_hit(api_hit_result)

		logger.info("api_hit_result")
		logger.info(api_hit_result)

		if api_hit_result["groundTruth"] is not None and api_hit_result["prediction"] is not None:
			y_true.append(api_hit_result["groundTruth"])
			y_pred.append(api_hit_result["prediction"])

		if api_hit_result["groundTruth"] is not None:
			all_classes.append(api_hit_result["groundTruth"])

	all_classes = sorted(list(set(y_true)))

	acc = metrics.accuracy_score(y_true, y_pred)

	acc = round(float(acc*100),2)

	dbops.update_test(testID,"accuracy",acc)

	dbops.update_test(testID,"classes",all_classes)

	logger.info(f"Final accuray score: {acc}")

	confusion_matrix = metrics.confusion_matrix(y_true, y_pred,labels=all_classes)

	confusion_matrix = confusion_matrix.tolist()

	m = len(all_classes)+1
	final_confusion_matrix = [ [ '' for i in range(m) ] for j in range(m) ]
	
	for i in range(len(final_confusion_matrix)):

		for j in range(len(final_confusion_matrix[i])):
		
			if i == 0 and j == 0:
				final_confusion_matrix[i][j] = 'gt\\pred'

			elif i == 0 and j !=0 :

				final_confusion_matrix[i][j] = all_classes[j-1]

			elif i != 0 and j == 0 :
				final_confusion_matrix[i][j] = all_classes[i-1]

			elif i != 0 and j != 0 :

				final_confusion_matrix[i][j] = confusion_matrix[i-1][j-1]			



	dbops.update_test(testID,"confusionMatrix",final_confusion_matrix)

	logger.info(f"Confusion matrix: \n {final_confusion_matrix}")

	end_time = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

	dbops.update_test(testID,"endTime",end_time)

	lastrunon = datetime.datetime.now().strftime("%d %b'%y %H:%M:%S")
	dbops.update_testboard(test_details["testboard"]["testboardID"],"apiLastRunOn",lastrunon)

	dbops.update_test(testID,"testStatus","completed")




