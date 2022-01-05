import pymongo
import string
import secrets
import datetime 
from loguru import logger
from bson.objectid import ObjectId
import traceback

# connect=False
myclient = pymongo.MongoClient("mongodb://localhost:27017/")
db = myclient["neuralfoo"]

'''
db.users.createIndex( { "email": 1 }, { unique: true } )
db.tokens.createIndex( { "token": 1 }, { unique: true } )
db.organizations.createIndex( { "referralCode": 1 }, { unique: true } )
db.images.createIndex( { "imageHash": 1, "testboardID":1 }, { unique: true } )
'''

def insert_user(firstName,lastName,email,password,signupdate,organizationID,role="",parentemail=""):

    try:
        

        users = db["users"]
        user = {
        		"firstName": firstName,
                "lastName": lastName, 
        		"email":email, 
        		"password": password,
        		"role":role,
        		"parentEmail":parentemail,
                "organizationID":organizationID,
        		"signupDate":signupdate,
                "disabled":False
        		}
        
        r = users.insert_one(user)

    except Exception as e:
        logger.error("Error while inserting user into db "+str(e))
        return False

    return str(r.inserted_id)

def insert_plan(userID,organizationID,plan,billingID,billingDate,amount):

    billings = db["billings"]
    bill = {
            "userID":userID,
            "organizationID":organizationID,
            "plan":plan,
            "billingID":billingID,
            "billingDate":billingDate,
            "amount":amount
            }
    try:
        r = billings.insert_one(bill)
    except Exception as e:
        logger.error("Error while inserting plan into db "+str(e))
        return False

    return str(r.inserted_id)


def insert_organization(organization):

    coll = db["organizations"]
    doc = {
            "organization":organization
    }
    try:
        r = coll.insert_one(doc)
    except Exception as e:
        logger.error("Error while inserting organization into db "+str(e))
        return False


    organizationID = str(r.inserted_id)
    generate_organization_referral_code(organizationID)

    return organizationID

def insert_token(userID,token):

    try:
        collection = db["tokens"]
        doc = {
                "userID":userID,
                "token":token
            }

    
        r = collection.insert_one(doc)
    except Exception as e:
        logger.error("Error while inserting auth token into db "+str(e))
        return False

    return str(r.inserted_id)


def check_if_exists(collection,field,value,field2=None,value2=None):

    coll = db[collection]

    rows = []

    if field2 is None:
        rows = coll.find({field:value})
    else:
        rows = coll.find({field:value,field2:value2})

    if len(list(rows)) > 0:
        return True 
    else:
        return False



def create_auth_token(email,password):


    try:

        salt = secrets.choice(["#$%^&*<>","=!@#&*<>","=!@$%^>"])
        alphabet = string.ascii_letters + string.digits + salt
        token = ''.join(secrets.choice(alphabet) for i in range(1024))

        while ( check_if_exists("tokens","token",token) ):

            salt = secrets.choice(["#$%^&*<>","=!@#&*<>","=!@$%^>"])
            alphabet = string.ascii_letters + string.digits + salt
            token = ''.join(secrets.choice(alphabet) for i in range(1024))


        users = db["users"]
        user = { "password": password, "email":email }
        u = users.find_one(user,{"_id"})

        tokens = db["tokens"]
        newtoken = { "$set": { "token": token } }

        r = tokens.update_one({"userID":str(u["_id"])},newtoken)

        if r.modified_count == 0:
            logger.error("token could not be updated, probably userid does not exist in tokens collection.")
            return None

    except Exception as e:
        logger.error("Error while updating auth token into db "+str(e))
        traceback.print_exc()
        return None
    
    return token

def get_organization(userID):

    users = db["users"]
    result = users.find_one({"_id":ObjectId(userID)})
    if result:
        return result['organizationID']
    return None    


def authenticate_user(token):

    tokens = db["tokens"]
    result = tokens.find_one({"token":token})
    if result:
        return result['userID']
    return None

def validate_token(token):

    tokens = db["tokens"]
    t = tokens.find_one({"token":token})
    if t:
        return True
    return False

def insert_testboard(apiName,apiType,apiEnvironment,visibility,userID,organizationID):

    creationTime = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    
    testboards = db["testboards"]
    testboard = {
            "apiName": apiName, 
            "apiType": apiType, 
            "apiEnvironment":apiEnvironment,
            "apiCreationDate":creationTime,
            "apiStatus":"ready",
            "apiLastRunOn":"-",
            "apiRequests":[],
            "creatorID":userID,
            "organizationID":organizationID,
            "collaboratorIDs":[userID],
            "apiLastUpdatedBy":userID,
            "visibility":visibility
            }
    try:
        r = testboards.insert_one(testboard)
    except Exception as e:
        logger.error("Error while inserting testboard into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)



def insert_request(testboardID,apiHeader,apiHttpMethod,apiEndpoint,apiRequestBody,
    apiResponseBody,apiInputDataType,apiRequestBodyType,apiResponseBodyType):


    creationTime = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")
    
    requests = db["requests"]
    request = {
            "testboardID":testboardID ,
            "apiHttpMethod":apiHttpMethod ,
            "apiEndpoint":apiEndpoint ,
            "apiRequestBody":apiRequestBody ,
            "apiResponseBody":apiResponseBody ,
            "apiInputDataType":apiInputDataType ,
            "apiRequestBodyType":apiRequestBodyType ,
            "apiResponseBodyType":apiResponseBodyType ,
            "apiHeader":apiHeader
            }
    try:
        r = requests.insert_one(request)
    except Exception as e:
        logger.error("Error while inserting request into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)


def update_testboard(testboardID,field,value):

    coll = db["testboards"]
    
    query = { "_id": ObjectId(testboardID) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating db "+str(e))
        traceback.print_exc()
        return False
    
    return True



def push_request_in_testboard(testboardID,requestID):

    coll = db["testboards"]
    
    query = { "_id": ObjectId(testboardID) }
    
    entity = { "$push": { "apiRequests" : requestID } }

    try:
        r = coll.update(query,entity)
    except Exception as e:
        logger.error("Error while pushing request into testboard collection. "+str(e))
        traceback.print_exc()
        return False
    
    return True



def clear_all_requests(testboardID):

    try:
        requests = db["requests"]
        requests.delete_many({"testboardID":testboardID})
        return True

    except Exception as e:
        logger.error("Error while deleting requests related to testboard. "+str(e))
        traceback.print_exc()
        return False


def update_collection(collection,id,field,value):

    coll = db[collection]
    
    query = { "_id": ObjectId(id) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating db "+str(e))
        traceback.print_exc()
        return False
    
    return True


def get_testboard(testboardID):

    testboards = db["testboards"]
    details = testboards.find({"_id":ObjectId(testboardID)})
    details = list(details)
    if len(details)>0:
        return details[0]

    logger.error("db find returned no results")
    traceback.print_exc()
    return None

def get_request(requestID):

    requests = db["requests"]
    details = requests.find({"_id":ObjectId(requestID)})
    details = list(details)
    if len(details)>0:
        return details[0]
    logger.error("db find returned no results")
    traceback.print_exc()
    return None

def list_testboards(userID,organizationID):

    '''
    List all testboards such that userID is either in collaboratorIDs 
    or belong to the organizationID and are pulic
    '''

    testboards = db["testboards"]
    
    results = testboards.find({
        "$or":[
            {
                "collaboratorIDs":{ 
                    "$in" : [userID] 
                }
            },
            {
                "organizationID":organizationID,
                "visibility":"public"
            }
        ]
    })

    return list(results)
    


def fetch_user_details(userID):

    coll = db["users"]

    user = coll.find_one({"_id":ObjectId(userID)})    

    return user


def update_user_details(userID,field,value):

    coll = db["users"]
    
    query = { "_id": ObjectId(userID) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating user collection "+str(e))
        return False
    
    return True


def fetch_organization_details(organizationID):

    coll = db["organizations"]

    org = coll.find_one({"_id":ObjectId(organizationID)})    

    return org



def generate_organization_referral_code(organizationID):

    alphabet = string.ascii_letters + string.digits
    code = ''.join(secrets.choice(alphabet) for i in range(32))

    while ( check_if_exists("organizations","referralCode",code) ):
        code = ''.join(secrets.choice(alphabet) for i in range(32))


    coll = db["organizations"]
    
    query = { "_id": ObjectId(organizationID) }
    
    entity = { "$set": { "referralCode" : code } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while generating referral code for organization collection "+str(e))
        traceback.print_exc()
        return None
    
    return code


def get_organization_referral_code(organizationID):
    # get referral code from orgid

    coll = db["organizations"]
    
    query = { "_id": ObjectId(organizationID) }
    
    try:
        r = coll.find_one(query)
    except Exception as e:
        logger.error("Error while getting referral code from organization collection "+str(e))
        traceback.print_exc()
        return None,None

    if r:
        return r["referralCode"],r["organization"]

    else:
        return None,None

def get_organization_from_referral_code(referralCode):
    # get orgid form referral code

    coll = db["organizations"]
    
    query = { "referralCode": referralCode }
    
    try:
        r = coll.find_one(query)
    except Exception as e:
        logger.error("Error while getting referral code from organization collection "+str(e))
        traceback.print_exc()
        return None
    
    if r:
        return str(r["_id"])
    else:
        return None

def fetch_item(collection,field=None,value=None):

    coll = db[collection]
    rows = []

    if field is None:
        rows = coll.find({})
    else:
        rows = coll.find({field:value})

    return list(rows)



def fetch_item_with_projection(collection,projection,field=None,value=None):

    coll = db[collection]

    if field is None:
        rows = coll.find({},projection)
    else:
        rows = coll.find({field:value},projection)

    return list(rows)



def insert_image(filename,testboardID,imageUrl,fileSize,imageHeight,imageWidth,imageHash,imageOcr,annotation,fileType,creatorID):

    creationTime = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

    images = db["images"]

    entry = {"filename":filename,
        "testboardID":testboardID,
        "imageUrl":imageUrl,
        "fileSize":fileSize,
        "imageHeight":imageHeight,
        "imageWidth":imageWidth,
        "imageHash":imageHash,
        "imageOcr":imageOcr,
        "annotation":annotation,
        "uploadTime":creationTime,
        "fileType":fileType,
        "creatorID":creatorID,
        "visible":True
        }
    try:
        r = images.insert_one(entry)
    except Exception as e:
        logger.error("Error while inserting image into db. "+str(e))
        traceback.print_exc()
        return None

    return str(r.inserted_id)

def update_image_details(imageID,field,value):

    coll = db["images"]
    
    query = { "_id": ObjectId(imageID) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating image collection "+str(e))
        traceback.print_exc()
        return False
    
    return True


def get_image_details(imageID):

    coll = db["images"]
    
    query = { "_id": ObjectId(imageID) }
    
    try:
        r = coll.find_one(query)
    except Exception as e:
        logger.error("Error while getting image details "+str(e))
        traceback.print_exc()
        return None
    
    if r:
        return r
    else:
        return None


def get_images_for_testboard(testboardID):

    
    coll = db["images"]
    
    query = { "testboardID": testboardID, "visible":True }
    
    try:
        r = coll.find(query)
    except Exception as e:
        logger.error(f"Error while getting images attached to testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return []
    
    return list(r)




def delete_images_from_testboard(testboardID,imageIDs):

    try:
        imageIDs = [ObjectId(imageID) for imageID in imageIDs]

        coll = db["images"]

        query = {"_id" : { "$in" : imageIDs }, "testboardID":testboardID }

        r = coll.delete_many(query)

        return r.deleted_count

    except Exception as e:
        logger.error(f"Error while deleting images attached to testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return None



def get_links_for_images(testboardID,imageIDs):

    
    try:
        imageIDs = [ObjectId(imageID) for imageID in imageIDs]

        coll = db["images"]

        query = {"_id" : { "$in" : imageIDs }, "testboardID":testboardID }

        r = coll.find(query,["imageUrl"])

        if r:
            return list(r)
        else:
            return []

    except Exception as e:
        logger.error(f"Error while deleting images attached to testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return None    



def update_testfile_annotation(testboardID,imageID,annotation):

    try:
        imageID = ObjectId(imageID)

        coll = db["images"]

        query = {"_id" : imageID , "testboardID":str(testboardID) }

        r = coll.update_one(query,{ "$set": {"annotation":annotation} })

        print(r.matched_count)

        if r.matched_count == 1:
            return True
        else:
            return False

    except Exception as e:
        logger.error(f"Error while updating image annotations for testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return False


def insert_accuracy_test_image_classification():

    images = db["image_classification_accuracy_tests"]

    entry = {
        "testboardID":testboardID,
        "creatorID":creatorID
        }
    try:
        r = images.insert_one(entry)
    except Exception as e:
        logger.error("Error while inserting image into db. "+str(e))
        traceback.print_exc()
        return None

    return str(r.inserted_id)


def update_accuracy_test_details(test,field,value):

    coll = db["images"]
    
    query = { "_id": ObjectId(imageID) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating image collection "+str(e))
        traceback.print_exc()
        return False
    
    return True



def insert_imageclassification_accuracytest(creatorID,testboard_snapshot,start_time,end_time,num_test_images,
                                            test_type,test_status,accuracy,confusion_matrix):


    coll = db["tests"]
    doc = {
            "creatorID":creatorID ,
            "testboard":testboard_snapshot,
            "startTime":start_time ,
            "endTime":end_time ,
            "testImagesCount":num_test_images,
            "testType":test_type ,
            "testStatus":test_status ,
            "accuracy":accuracy ,
            "confusionMatrix":confusion_matrix
            }
    try:
        r = coll.insert_one(doc)
    except Exception as e:
        logger.error("Error while inserting image classification accuracy test into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)



def get_test(testID):

    tests = db["tests"]
    details = tests.find({"_id":ObjectId(testID)})
    details = list(details)
    if len(details)>0:
        return details[0]

    logger.error("db find returned no results")
    traceback.print_exc()
    return None



def update_test(testID,field,value):

    coll = db["tests"]
    
    query = { "_id": ObjectId(testID) }
    
    entity = { "$set": { field : value } }

    try:
        r = coll.update_one(query,entity)
    except Exception as e:
        logger.error("Error while updating db "+str(e))
        traceback.print_exc()
        return False
    
    return True


def list_tests(testboardID,test_type):


    coll = db["tests"]
    
    query = { "testboard.testboardID": testboardID , "testType":test_type }
    
    try:
        r = coll.find(query)
    except Exception as e:
        logger.error(f"Error while getting tests attached to testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return []
    
    return list(r)


def list_all_hits(testID):
    
    coll = db["hits"]
    
    query = { "testID": testID }
    
    try:
        r = coll.find(query)
    except Exception as e:
        logger.error(f"Error while getting api hits attached to testID {testID} "+str(e))
        traceback.print_exc()
        return []
    
    return list(r)


def delete_test(testID):

    try:
        coll = db["tests"]
        coll.delete_one({"_id":ObjectId(testID)})
        return True

    except Exception as e:
        logger.error(f"Error while deleting test {testID}"+str(e))
        traceback.print_exc()
        return False


def delete_all_api_hits(testID):

    try:
        coll = db["hits"]
        r = coll.delete_many({"testID":testID})
        return r.deleted_count

    except Exception as e:
        logger.error(f"Error while deleting test {testID}"+str(e))
        traceback.print_exc()
        return None



def insert_api_hit(hit_object):


    coll = db["hits"]
    try:
        r = coll.insert_one(hit_object)
    except Exception as e:
        logger.error("Error while inserting api hit into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)


def update_image_visibility(imageIDs,visibility):

    try:

        imageIDs = [ObjectId(imageID) for imageID in imageIDs]
        coll = db["images"]
        newentry = { "$set": { "visible": visibility } }
        query = {"_id" : { "$in" : imageIDs }}

        r = coll.update_many(query,newentry)

        return r.modified_count

    except Exception as e:
        logger.error(f"Error while updating visibility of images "+str(e))
        traceback.print_exc()
        return None



def insert_functional_testcase(testboardID,testcase_name,request_data,userID):

    coll = db["testcases"]
    doc = {
            "testboardID":testboardID,
            "testcaseName":testcase_name,
            "requests":request_data,
            "updatedByID":[userID],
            }
    try:
        r = coll.insert_one(doc)
    except Exception as e:
        logger.error("Error while inserting image classification accuracy test into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)



def list_testcases(testboardID):


    coll = db["testcases"]
    
    query = { "testboardID": testboardID }
    
    try:
        r = coll.find(query)
    except Exception as e:
        logger.error(f"Error while getting testcases attached to testboardID {testboardID} "+str(e))
        traceback.print_exc()
        return []
    
    return list(r)




def delete_functional_testcase(testcaseID):

    try:
        coll = db["testcases"]
        coll.delete_one({"_id":ObjectId(testcaseID)})
        return True

    except Exception as e:
        logger.error(f"Error while deleting testcase {testcaseID}"+str(e))
        traceback.print_exc()
        return False


def update_functional_testcase(testcaseID,testcaseName,testcaseValues,userID):

    coll = db["testcases"]
    
    query = { "_id": ObjectId(testcaseID) }
    
    name = { "$set": { "testcaseName" : testcaseName } }
    values = { "$set": { "requests" : testcaseValues } }
    updatedByID = { "$push": { "updatedByID" : userID } }

    try:
        r = coll.update_one(query,name)
        r = coll.update_one(query,values)
        r = coll.update_one(query,updatedByID)
    except Exception as e:
        logger.error("Error while updating db "+str(e))
        traceback.print_exc()
        return False
    
    return True



def insert_functionaltest(creatorID,testboard_snapshot,start_time,end_time,
    total_cases_count,passed_cases_count,failed_cases_count,remarks,test_type,test_status):


    coll = db["tests"]
    doc = {
            "creatorID":creatorID ,
            "testboard":testboard_snapshot,
            "startTime":start_time ,
            "endTime":end_time ,
            "testType":test_type ,
            "testStatus":test_status ,
            "passedCasesCount":passed_cases_count,
            "failedCasesCount":failed_cases_count,
            "totalCasesCount":total_cases_count,
            "remarks":remarks
        }
    try:
        r = coll.insert_one(doc)
    except Exception as e:
        logger.error("Error while inserting functional test into db "+str(e))
        traceback.print_exc()
        return False

    return str(r.inserted_id)

