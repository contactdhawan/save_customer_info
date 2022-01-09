const AWS = require("aws-sdk") 

const TABLE_NAME = process.env.TABLE_NAME
const documentClient = new AWS.DynamoDB.DocumentClient({
    region: "us-west-2",
})

module.exports.saveCustomerInfo = async (firstName, lastName, cityName, phoneNumber) => {
    console.log(`firstName ${firstName} lastName ${lastName} city ${cityName} phoneNumber ${phoneNumber}`)
    const result = await putItem(firstName, lastName, cityName, phoneNumber)
    return result;
}

async function listAllItems() {

    const result = await documentClient
        .scan({
            TableName: TABLE_NAME,
        })
        .promise();
    return result;

}

module.exports.getCustomerInfo = async (phoneNumber) => {

    const res = await documentClient
        .get({
            "TableName": TABLE_NAME,
            Key: {
                "phone_number": phoneNumber
            },
        })
        .promise()
    return res.Item

}

async function putItem(firstName, lastName, cityName, phoneNumber) {

    const result = await documentClient
        .put({
            Item: {
                "phone_number": phoneNumber,
                "firstName": firstName,
                "lastName": lastName,
                "cityName": cityName
            },
            TableName: TABLE_NAME,
        })
        .promise();
    console.log(`result `, JSON.stringify(result));
    return "result save successfully";


}

module.exports.updateCustomerInfo = async (firstName, lastName, cityName, phoneNumber) => {

    console.log(`firstName ${firstName} lastName ${lastName} city ${cityName} phoneNumber ${phoneNumber}`)
    const result = await documentClient
        .update({
            "Key": {
                "phone_number": phoneNumber
            },
            UpdateExpression: 'set firstName = :firstName, lastName = :lastName, cityName = :cityName ',
            ExpressionAttributeValues: {
                ":firstName": firstName,
                ":lastName": lastName,
                ":cityName": cityName
            },
            TableName: TABLE_NAME,
        })
        .promise();
    console.log(`result `, JSON.stringify(result));
    return "result updated successfully";


}
