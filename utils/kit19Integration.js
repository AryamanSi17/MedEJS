const axios=require('axios');
async function getTokenGuid(userLogin){
    const response= await axios.get(`http://sipapi.kit19.com/Enquiry/TokenGuidOPR?UserName=${userLogin}&Mode=Get`);
    return response.data.Details;
}
async function saveEnquiry(data){
    const tokenGuid=process.env.TOKEN_GUID
    const enquiryData={
        Username: process.env.KIT19_USERNAME,
        Password: process.env.KIT19_PASSWORD,
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