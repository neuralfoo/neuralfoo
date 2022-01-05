from flask import Blueprint,request
import testboard_utils as functions
from loguru import logger
import global_vars as g 
import traceback 
import utils
from bson.objectid import ObjectId

# import time

profile = Blueprint('testboard', __name__)


@profile.route("/app/testboard/create",methods=["POST"])
def create_testboard():

    endpoint = "/app/testboard/create"

    try:

        #### request authentication ####
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))
        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        #### request body sanity checks ####
        data = request.json
        
        if utils.check_params(
            ["apiName","apiType","apiEnvironment","visibility","apiRequests"],([str]*4)+[list],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)


        check_values_list = [
            ["apiType",g.api_types],
            ["apiEnvironment",g.api_environments],
            ["visibility",g.api_visibility]
        ]

        for [param,possible_values] in check_values_list:
            if utils.invalid_param_values(data[param],possible_values):
                message = "Invalid value sent in "+param+" for "+endpoint
                logger.error(message+":"+str(data[param]))
                return utils.return_400_error(message)


        for r in data["apiRequests"]:
            if utils.check_params(
                ["apiHttpMethod","apiEndpoint","apiRequestBody","apiResponseBody","apiInputDataType",
                "apiRequestBodyType","apiResponseBodyType","apiHeader"],([str]*7)+[list],r) == False:
                message = "Invalid params sent in request body for"+endpoint
                logger.error(message+":"+str(data))
                return utils.return_400_error(message)


            check_values_list = [
                ["apiHttpMethod",g.api_methods],
                ["apiInputDataType",g.api_input_data_types],
                ["apiRequestBodyType",g.api_request_body_type],
                ["apiResponseBodyType",g.api_response_body_type]
            ]

            for [param,possible_values] in check_values_list:
                if utils.invalid_param_values(r[param],possible_values):
                    message = "Invalid value sent in "+param+" for "+endpoint
                    logger.error(message+":"+str(r[param]))
                    return utils.return_400_error(message)

        #### sanity checks completed and we can now proceed to insert data into DB ####


        logger.info("Testboard CREATE attempt: "+str(data) + "by user "+userID)


        testboard_id,msg = functions.create_testboard(data,userID,organizationID)
        
        if testboard_id is None:
            message = "Unexpected error occurred."
            return utils.return_400_error(message)

        if testboard_id == "":
            return utils.return_400_error(msg)            

        logger.info("Testboard created successfully")

        return utils.return_200_response({"message":"success","status":200,"id":testboard_id})
    
        

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/testboard/update",methods=["POST"])
def update_testboard():

    endpoint = "/app/testboard/update"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        data = request.json
        
        if utils.check_params(
            ["testboardID","apiName","apiType","apiEnvironment","visibility","apiRequests"],([str]*5)+[list],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)


        check_values_list = [
            ["apiType",g.api_types],
            ["apiEnvironment",g.api_environments],
            ["visibility",g.api_visibility]
        ]

        for [param,possible_values] in check_values_list:
            if utils.invalid_param_values(data[param],possible_values):
                message = "Invalid value sent in "+param+" for "+endpoint
                logger.error(message+":"+str(data[param]))
                return utils.return_400_error(message)


        for r in data["apiRequests"]:
            if utils.check_params(
                ["apiHttpMethod","apiEndpoint","apiRequestBody","apiResponseBody","apiInputDataType",
                "apiRequestBodyType","apiResponseBodyType","apiHeader"],([str]*7)+[list],r) == False:
                message = "Invalid params sent in request body for"+endpoint
                logger.error(message+":"+str(data))
                return utils.return_400_error(message)


            check_values_list = [
                ["apiHttpMethod",g.api_methods],
                ["apiInputDataType",g.api_input_data_types],
                ["apiRequestBodyType",g.api_request_body_type],
                ["apiResponseBodyType",g.api_response_body_type]
            ]

            for [param,possible_values] in check_values_list:
                if utils.invalid_param_values(r[param],possible_values):
                    message = "Invalid value sent in "+param+" for "+endpoint
                    logger.error(message+":"+str(r[param]))
                    return utils.return_400_error(message)


        testboardID = data["testboardID"]

        access_granted,msg = utils.check_permissions("testboards",ObjectId(testboardID),userID)
        if not access_granted:
            logger.error(f"Invalid access rights for {endpoint} by {userID}")
            return utils.return_403_error("You do not have access priviliges for this page.")

        logger.info("Testboard UPDATE attempt: "+str(data) + "by user "+userID)

        testboardID,msg = functions.update_testboard(data,userID)
        
        if testboardID is None:
            message = "Unexpected error occurred."
            return utils.return_400_error(message)

        if testboardID == "":
            return utils.return_400_error(msg)            

        logger.info("Testboard updated successfully")

        return utils.return_200_response({"message":"success","status":200,"id":testboardID})
    
        

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/testboard/get/<testboardID>",methods=["GET"])
def get_testboard(testboardID):

    endpoint = "/app/testboard/get/<testboardID>"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        logger.info("Testboard GET attempt: "+testboardID+" by user "+userID)

        access_granted,msg = utils.check_permissions("testboards",ObjectId(testboardID),userID)
        if not access_granted:
            logger.error(f"Invalid access rights for {endpoint} by {userID}")
            return utils.return_403_error("You do not have access priviliges for this page.")

        testboard_details,msg = functions.get_testboard(testboardID)
        
        if testboard_details is None:
            message = "Unexpected error occurred."
            return utils.return_400_error(message)

        return utils.return_200_response({"message":msg,"status":200,"testboard":testboard_details})
    
        

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/testboard/list",methods=["GET"])
def list_testboard():


    endpoint = "/app/testboard/list"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        logger.info(f"Testboard LIST attempt: by user {userID}")


        testboard_list,msg = functions.list_testboard(userID,organizationID)
        
        if testboard_list is None:
            message = "Unexpected error occurred."
            return utils.return_400_error(message)            

        return utils.return_200_response({"message":msg,"status":200,"testboards":testboard_list})
    
        

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)





@profile.route("/app/testboard/testFiles/list",methods=["POST"])
def get_test_files():

    endpoint = "/app/testboard/testFiles/list"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        logger.info(f"Testboard LIST test images attempt by user {userID}")

        data = request.json

        if utils.check_params(["testboardID"],[str],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)

        testboardID = data["testboardID"]

        access_granted,msg = utils.check_permissions("testboards",ObjectId(testboardID),userID)
        if not access_granted:
            logger.error(f"Invalid access rights for {endpoint} by {userID}")
            return utils.return_403_error("You do not have access priviliges for this page.")

        file_list,msg = functions.get_test_files(testboardID)
        
        if file_list is None:
            logger.error(msg)
            return utils.return_400_error(msg)

        return utils.return_200_response({"message":msg,"status":200,"files":file_list})


    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/testboard/testFiles/delete",methods=["POST"])
def delete_test_files():

    endpoint = "/app/testboard/testFiles/delete"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        logger.info(f"Testboard DELETE test images attempt by user {userID}")

        data = request.json

        if utils.check_params(["testboardID","imageIDs"],[str,list],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)

        testboardID = data["testboardID"]
        imageIDs = data["imageIDs"]

        original_count = len(imageIDs)

        access_granted,msg = utils.check_permissions("testboards",ObjectId(testboardID),userID)
        if not access_granted:
            logger.error(f"Invalid access rights for {endpoint} by {userID}")
            return utils.return_403_error("You do not have access priviliges for this page.")

        delete_count = functions.update_image_visibility(testboardID,imageIDs,visible=False)
        
        if delete_count is None:
            msg = "Unexpected error occurred"
            logger.error(msg)
            return utils.return_400_error(msg)

        return utils.return_200_response({"message":msg,"status":200,"deleteCount":delete_count,"originalCount":original_count})


    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)




@profile.route("/app/testboard/testFiles/annotation/update",methods=["POST"])
def update_test_files_annotation():

    endpoint = "/app/testboard/testFiles/annotation/update"

    try:

        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for"+endpoint)
            return utils.return_401_error("Session expired. Please login again.")

        logger.info(f"Testboard annotation UPDATE attempt by user {userID}")

        data = request.json

        if utils.check_params(["testboardID","imageID","annotation"],[str,str,str],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)

        testboardID = data["testboardID"]
        imageID = data["imageID"]
        annotation = data["annotation"]

        print(data)

        access_granted,msg = utils.check_permissions("testboards",ObjectId(testboardID),userID)
        if not access_granted:
            logger.error(f"Invalid access rights for {endpoint} by {userID}")
            return utils.return_403_error("You do not have access priviliges for this page.")


        result = functions.update_testfile_annotation(testboardID,imageID,annotation)

        if result == False:
            msg = "Unexpected error occurred"
            logger.error(msg)
            return utils.return_400_error(msg)

        logger.info(f"Testboard annotation UPDATE successful by user {userID}")

        return utils.return_200_response({"message":"success","status":200})


    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)


















