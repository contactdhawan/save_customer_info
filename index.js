const { saveCustomerInfo, getCustomerInfo,updateCustomerInfo } = require('./db.js')

exports.handler = async (event) => {
    console.log(JSON.stringify(event));
    var response = {}
    const sessionAttributes = event.sessionState.sessionAttributes;
    var phoneNumber = await determineCustmerPhoneNumber(event)
    const intentName = event.sessionState.intent.name
    console.log(`intent name ${intentName} ${phoneNumber}`);
    var checkCustomerInfo = undefined
    if(intentName !== "update_info")
        checkCustomerInfo = await getCustomerInfo(phoneNumber);
    var slots = {}
    var fullFillmentMsg = ""
    if (checkCustomerInfo !== undefined) {
        fullFillmentMsg = `<speak>I can find the information associated with this phoneNumber, your first name is 
        ${checkCustomerInfo.firstName},yor last name is ${checkCustomerInfo.lastName} and your city is ${checkCustomerInfo.cityName} 
        and your phone number is <say-as interpret-as="telephone">${phoneNumber}</say-as></speak>`
        console.log("Successfully able to find user")
        slots = await createSlot(checkCustomerInfo)
    }
    else {
        console.log("Unable to find user info")
        slots = event.sessionState.intent.slots
    }
    // var name = event.sessionState.intent.name
    if (event.invocationSource === 'DialogCodeHook') {
        response = await getDelegateSlot(slots, intentName)
    }
    else {
        response = await getFullFillment(slots, sessionAttributes, intentName, phoneNumber, fullFillmentMsg)
    }
    console.log(response, JSON.stringify(response))
    return response;
};

async function getFullFillment(slots, sessionAttributes, intentName, phone, fullFillmentMsg) {
    var firstName = slots.firstName.value.interpretedValue;
    var lastName = slots.lastName.value.interpretedValue;
    var cityName = slots.cityName.value.interpretedValue;
    
    var msg = ""
    if(fullFillmentMsg !== "")
        msg = fullFillmentMsg
    else if(intentName == "update_info"){
        msg = `<speak>Welcome ${firstName} ${lastName} from ${cityName}. Your info has been updated successfully with your phone number 
    <say-as interpret-as="telephone">${phone}</say-as></speak>`
        await updateCustomerInfo(firstName,lastName,cityName,phone)
    }else{
        msg = `<speak>Welcome ${firstName} ${lastName} from ${cityName}. Your info has been saved successfully with your phone number 
    <say-as interpret-as="telephone">${phone}</say-as></speak>`
        await saveCustomerInfo(firstName,lastName,cityName,phone)
    }
    
    return {
        "sessionState": {
            sessionAttributes,
            "dialogAction": {
                "type": "Close"
            },
            "intent": {
                "name": intentName,
                "state": "Fulfilled",
                "confirmationState": "Confirmed"
            }
        },
        messages: [{
            "contentType": "SSML",
            "content": msg
        }]
    }
}



async function getDelegateSlot(slots, name) {
    return {
        "sessionState": {
            "dialogAction": {
                "type": "Delegate",
            },
            "intent": {
                "name": name,
                slots
            }
        }
    }
}

async function createSlot(checkCustomerInfo){
    return {
            "firstName": {
                "shape": "Scalar",
                "value": {
                    "originalValue": checkCustomerInfo.firstName,
                    "resolvedValues": [],
                    "interpretedValue": checkCustomerInfo.firstName
                }
            },
            "lastName": {
                "shape": "Scalar",
                "value": {
                    "originalValue": checkCustomerInfo.lastName,
                    "resolvedValues": [],
                    "interpretedValue": checkCustomerInfo.lastName
                }
            },
            "cityName": {
                "shape": "Scalar",
                "value": {
                    "originalValue": checkCustomerInfo.cityName,
                    "resolvedValues": [],
                    "interpretedValue": checkCustomerInfo.cityName
                }
            }
        }
}

async function determineCustmerPhoneNumber(event){
    const sessionAttributes = event.sessionState.sessionAttributes;
    var phoneNumber = ""
    if (event.requestAttributes == undefined) // this is testing with lex
        phoneNumber = "+18032691522"
    else
        phoneNumber = sessionAttributes.phone
    return phoneNumber
}
