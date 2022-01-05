from flask import Blueprint,request

import json
import dbops 
from loguru import logger
import traceback
import datetime 
import utils


profile = Blueprint('user', __name__)


@profile.route("/app/user/details/get",methods=["GET"])
def get_user_details():

    try:
        endpoint = "/app/user/details/get"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("User details GET attempt: "+str(userID))
        
        user = dbops.fetch_user_details(userID)

        org = dbops.fetch_organization_details(organizationID)

        orgname = ""
        if org:
            orgname = org["organization"]

        d = datetime.datetime.strptime(user["signupDate"][:10], '%d-%m-%Y').strftime('%d %b %Y')

        body = {
            "firstName":user["firstName"],
            "lastName":user["lastName"],
            "email":user["email"],
            "signupDate":d,
            "organization":orgname
        }

        logger.info("User details GET successful: "+str(userID))

        return utils.return_200_response(body)
        
        
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)


@profile.route("/app/user/details/update",methods=["POST"])
def update_user_details():

    try:
        endpoint = "/app/user/details/update"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("User details UPDATE attempt: "+str(userID))
        
        data = request.json
        
        if utils.check_params(["firstName","lastName"],[str,str],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)
        
        for key in ["firstName","lastName"]:
            r = dbops.update_user_details(userID,key,data[key])

            if r == False:
                message = "Error in updating DB for "+endpoint
                logger.error(message+":"+str(data))
                return utils.return_400_error("Unexpected error.")        

        body = {
            "result":"success"
        }

        logger.info("User details UPDATE successful: "+str(userID))

        return utils.return_200_response(body)
        
        
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)


@profile.route("/app/user/changePassword",methods=["POST"])
def change_password():

    try:
        endpoint = "/app/user/changePassword"
        userID,organizationID = utils.authenticate(request.headers.get('Authorization'))

        if userID is None:
            logger.error("Invalid auth token sent for "+endpoint)
            return utils.return_401_error("Session expired. Please login again.")


        logger.info("User password UPDATE attempt: "+str(userID))
        
        data = request.json
        
        if utils.check_params(["oldPassword","newPassword"],[str,str],data) == False:
            message = "Invalid params sent in request body for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)
        

        user = dbops.fetch_user_details(userID)

        if user["password"] != data["oldPassword"]:
            message = "Old password is incorrect"
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)        

        r = dbops.update_user_details(userID,"password",data["newPassword"])

        if r == False:
            message = "Error in updating DB for "+endpoint
            logger.error(message+":"+str(data))
            return utils.return_400_error("Unexpected error.")        

        body = {
            "result":"success"
        }

        logger.info("User password UPDATE successful: "+str(userID))

        return utils.return_200_response(body)
        
        
    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)


