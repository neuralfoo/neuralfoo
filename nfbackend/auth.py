from flask import Blueprint,request

import json
import dbops 
from loguru import logger
import traceback
import datetime 
import utils


profile = Blueprint('auth', __name__)


@profile.route("/app/login",methods=["POST"])
def login():

    try:

        data = request.json

        if utils.check_params(["email","password"],[str,str],data) == False:
            message = "Invalid params sent in request body"
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)

        logger.info("Login attempt: "+str(data))
        
        combo_exists = dbops.check_if_exists("users",field="email",value=data["email"],field2="password",value2=data["password"])

        if combo_exists:
            token = dbops.create_auth_token(data["email"],data["password"])
            body = {"token":token}
            return utils.return_200_response(body)
        
        logger.error("Invalid authentication credentials")
        return utils.return_401_error("Invalid email ID or password")

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)
        

@profile.route("/app/auth/validate",methods=["POST"])
def validate_token():

    try:


        data = request.json

        if utils.check_params(["token"],[str],data) == False:
            message = "Invalid params sent in request body"
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)

        logger.info("Relogin: Auth validation attempt")
        
        token_exists = dbops.validate_token(data["token"])

        if token_exists:
            # token = dbops.create_auth_token(token_data["email"],token_data["password"])
            body = {"message":"success"}
            logger.info("Relogin: Auth validation success.")
            return utils.return_200_response(body)
        
        logger.error("Invalid authentication token")
        return utils.return_401_error("Session expired")

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)



@profile.route("/app/signup",methods=["POST"])
def signup():

    try:

        data = request.json

        if utils.check_params(["email","password","firstName","lastName","organization","referral"],[str,str,str,str,str,bool],data) == False:
            message = "Invalid params sent in request body"
            logger.error(message+":"+str(data))
            return utils.return_400_error(message)
            

        logger.info("Sign up request received:"+str(data))

        email_exists = dbops.check_if_exists(collection="users",field="email",value=data["email"],field2=None,value2=None)

        if email_exists :
            message = "Email id is already registered "
            logger.error(message+str(data))
            return utils.return_400_error(message)

        signupdatetime = datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S")

        if data["referral"] == True:

            # in case of referral is true, referral code is sent in data["organization"]

            organizationID = dbops.get_organization_from_referral_code(data["organization"])

            if organizationID is None:
                message = "Onboarding link is invalid"
                logger.error(message+str(data))
                return utils.return_400_error(message)                

            userID = dbops.insert_user(
                data["firstName"],
                data["lastName"],
                data["email"],
                data["password"],
                signupdatetime,
                organizationID,
                role="tester")

            dbops.insert_token(userID = userID, token = "")

        elif data["referral"] == False:
            
            organizationID = dbops.insert_organization(data["organization"])

            userID = dbops.insert_user(
                data["firstName"],
                data["lastName"],
                data["email"],
                data["password"],
                signupdatetime,
                organizationID,
                role="admin")
            
            dbops.insert_plan(userID = userID, organizationID = organizationID, plan = "free",billingID = "",billingDate = signupdatetime,amount = "0")
            dbops.insert_token(userID = userID, token = "")

        token = dbops.create_auth_token(data["email"],data["password"])       
        body = {"token":str(token)}

        return utils.return_200_response(body)

    except Exception as e:

        message = "Unexpected error"
        logger.error(message+":"+str(e))
        traceback.print_exc()

        return utils.return_400_error(message)


