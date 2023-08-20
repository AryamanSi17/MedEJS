const axios=require('axios');
async function getTokenGuid(userLogin){
    const response= await axios.get(`http://sipapi.kit19.com/Enquiry/TokenGuidOPR?UserName=${userLogin}&Mode=Get`);
    return response.data.Details;
}
async function saveEnquiry(data){
    const tokenGuid="3AF2A8C6-1CF8-4D8A-8A8B-9B1224651FB0"
    const enquiryData={
        Username: "ANVIK1002215",
        Password: "Global@123",
        PersonName: data.name,
        MobileNo: data.phone,
        CountryCode:"+91",
        EmailID: data.email,
        CourseInterested: data.course,
        // ... Add other fields as required, and provide default values if necessary
        SourceName: "ramyogi", // Replace with actual source name
        // ...
    };
    const response = await axios.post(`http://sipapi.kit19.com/Enquiry/${tokenGuid}/AddEnquiryAPI`, enquiryData, {
        headers: {
            'Content-Type': 'application/json'
        }
    });

    return response;
}
module.exports={
    saveEnquiry
};