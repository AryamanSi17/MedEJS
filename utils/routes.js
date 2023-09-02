const { Course,User } = require("./db"); 
const { JWT_SECRET } = require('./config');
const mongoose = require('mongoose');

function setRoutes(app) {
  
  app.get("/", function(req, res) {
    const pageTitle = 'Fellowship Course, Online Medical Certificate Courses - GlobalMedAcademy';
    const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
    const metaKeywords = 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine ';
    const ogDescription = 'GlobalMedAcademy is a healthcare EdTech company. We provide various blended learning medical fellowship, certificate courses, and diplomas for medical professionals';
    const canonicalLink = 'https://globalmedacademy.com/';

    // Check if the user is logged in using the isUserLoggedIn property set by the middleware
    if (req.isUserLoggedIn) {
        // Retrieve username from the session
        const username = req.session.username || null;

        // Render the authenticated view and pass necessary variables
        res.render('auth_index', {
            pageTitle,
            metaRobots,
            metaKeywords,
            ogDescription,
            canonicalLink,
            username: username // Pass the username to the view
        });
    } else {
        // Render the non-authenticated view and pass necessary variables
        res.render('index', {
            pageTitle,
            metaRobots,
            metaKeywords,
            ogDescription,
            canonicalLink
        });
    }
});
function checkEmailVerified(req, res, next) {
  if (req.session.emailVerified) {
    next();  // If email is verified, proceed to the next middleware/route
  } else {
    res.redirect('/auth_email');  // If not, redirect to the email authentication page
  }
}

  app.get("/data", (req,res) => {
    res.render("data");
  })
  app.get("/course-masonry", async function(req, res) {
    const pageTitle = 'Professional, Advanced, Fellowship courses';
    const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
    const metaKeywords = 'small courses view, view all courses, course listings, online course catalog, course directory, course offerings, course categories, course search, explore courses, browse courses online medical instructor, medical teacher, apply for medical instructor';
    const ogDescription = '';
    const canonicalLink = 'https://globalmedacademy.com/course-masonry';
    const username = req.session.username || null;
    res.render('course-masonry', { pageTitle, metaRobots, metaKeywords, ogDescription,canonicalLink ,isUserLoggedIn: req.isUserLoggedIn,
      username: username });
  
});
  
    app.get("/course-details", function(req, res) {
      if (req.user) {
        res.render('course-details', { loggedIn: true });
      } else {
        res.render('course-details', { loggedIn: false });
      }
    });
  
    app.get("/auth_index", function(req, res) {
      res.render("auth_index");
    });
  
    app.get("/become-teacher", function(req, res) {
      const pageTitle = 'Become a Teacher/Instructor';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'medical instructor, medical teacher, apply for medical instructor';
      const ogDescription = 'Medical Academic Instructor - Apply for medical teacher and shine your career with us.';
      const canonicalLink = 'https://globalmedacademy.com/become-teacher';
      const username = req.session.username || null;
      res.render('becometeacher', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink ,isUserLoggedIn: req.isUserLoggedIn,
        username: username });
    });
  
    app.get("/privacy-policy", function(req, res) {
      const pageTitle = 'Privacy Policy - GlobalMedAcademy';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = '';
      const ogDescription = 'If you have any queries, read our privacy policy and terms and conditions carefully.';
      const canonicalLink = 'https://globalmedacademy.com/privacy-policy';
      const username = req.session.username || null;
      res.render('privacy-policy', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/terms-conditions", function(req, res) {
      const pageTitle = 'Terms and Conditions - GlobalMedAcademy';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = '';
      const ogDescription = 'Before inquiring about our courses then read our T&C. If you have any queries terms and conditions carefully.';
      const canonicalLink = 'https://globalmedacademy.com/terms-conditions';
      const username = req.session.username || null;
      res.render('terms-conditions', { pageTitle, metaRobots, metaKeywords, ogDescription,canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/admission-guide", function(req, res) {
      const pageTitle = 'Admission Guide - GlobalMedAcademy';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = '';
      const ogDescription = '';
      const canonicalLink = 'https://globalmedacademy.com/admission-guide';
      const username = req.session.username || null;
      res.render('admission-guide', { pageTitle, metaRobots, metaKeywords, ogDescription,canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
  
    app.get("/course-details-fellowship-in-internal-medicine", function(req, res) {
      const pageTitle = 'Fellowship in Internal Medicine Program, Internal Medicine Online';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'fellowship in internal medicine, internal medicine subspecialty, fellowship in general medicine, fellowships of internal medicine, online internal medicine fellowship, fellowship in internal medicine program, general medicine fellowship';
      const ogDescription = 'Internal medicine fellowship help you to become a board-certified subspecialist. Join our fellowship programs and learn more with CPD standards certified course.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-fellowship-in-internal-medicine';
      const username = req.session.username || null;
      res.render('course-details-fellowship-in-internal-medicine', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-fellowship-in-diabetes-management", function(req, res) {
      const pageTitle = 'Fellowship in Diabetes Mellitus Online, Fellowship Courses Diabetology';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'fellowship in diabetology, fellowship in diabetes, fellowship in diabetes mellitus, diabetes fellowship online, diabetes fellowship courses, fellowship in diabetology online, diabetology fellowship online, online fellowship in diabetology, diabetes fellowship for family physician, diabetes fellowship for primary care physicians, diabetes fellowship program, online diabetology fellowship, fellowship in diabetes management program';
      const ogDescription = 'Fellowship in Diabetes Mellitus involves training on comprehensive management of Diabetes Mellitus. Boost your career goal by gaining expertise in diabetology.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-fellowship-in-diabetes-management';
      const username = req.session.username || null;
      res.render('course-details-fellowship-in-diabetes-management', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-fellowship-in-critical-care", function(req, res) {
      const pageTitle = 'Fellowship in Critical Care, Intensive Care, Internal Medicine Programs';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'fellowship in critical care, critical care medicine fellowship, fellowship in intensive care medicine, fellowship in critical care medicine online, critical care internal medicine, critical care medicine fellowship programs';
      const ogDescription = 'Fellowship in Critical Care Medicine Programs - Gain expertise with fellowship critical care medicine. Fellowship act as suppliment for students after the medical degree.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-fellowship-in-critical-care';
      const username = req.session.username || null;
      res.render('course-details-fellowship-in-critical-care', { pageTitle, metaRobots, metaKeywords, ogDescription , canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-advanced-professional-certificate-in-critical-care", function(req, res) {
      const pageTitle = 'Advanced Certificate in Critical Care Medicine, Intesive Care';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'emergency medical technician course, diploma in critical care medicine, advanced diploma in critical care, certificate in emergency medicine, advance diploma in critical care, advanced certificate in critical care medicine, certificate course in critical care medicine, certificate in critical care medicine, diploma in critical care after mbbs, emergency certificate medical, advanced certificate in critical care nursing, advanced certificate in neonatal critical care, advanced diploma in critical care nursing, advanced diploma in nursing critical care, certificate in critical care, certified critical care paramedic, critical care certificate program, diploma in intensive care medicine, pediatric critical care certification';
      const ogDescription = 'Advanced Certificate in Critical Care Medicine is designed to provide healthcare professionals with advanced knowledge and skills in the field of critical care.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-advanced-professional-certificate-in-critical-care';
      const username = req.session.username || null;
      res.render('course-details-advanced-professional-certificate-in-critical-care', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink ,isUserLoggedIn: req.isUserLoggedIn,
        username: username });
    });
    app.get("/course-details-professional-certificate-in-diabetes-management", function(req, res) {
      const pageTitle = 'Professional Diabetes Certificate Course, Diabetology Online Programs';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'diabetes management, diabetes certificate course, certificate course in diabetology, certificate in diabetes, diabetes certificate course online, certificate course in diabetes management, advanced certificate course in diabetes, certificate in diabetes management, certificate in diabetes mellitus, certificate in diabetology, advanced certificate in diabetes mellitus, advanced diabetes management, certificate course in diabetes mellitus, diabetes certificate program online';
      const ogDescription = 'Professional Diabetes Certificate Course - Join online diabetes certificate course & equips healthcare professionals with the necessary skills and knowledge';
      const canonicalLink = 'https://globalmedacademy.com/course-details-professional-certificate-in-diabetes-management';
      const username = req.session.username || null;
      res.render('course-details-professional-certificate-in-diabetes-management', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-advanced-professional-certificate-in-diabetes-management", function(req, res) {
      const pageTitle = 'Advanced Certificate in Diabetes Mellitus, Diabetology Online';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'diabetes management, diabetes certificate course, certificate course in diabetology, certificate in diabetes, diabetes certificate course online, certificate course in diabetes management, advanced certificate course in diabetes, certificate in diabetes management, certificate in diabetes mellitus, certificate in diabetology, advanced certificate in diabetes mellitus, advanced diabetes management, certificate course in diabetes mellitus, diabetes certificate program online';
      const ogDescription = 'Advanced Certificate in Diabetes Mellitus is designed by leading diabetologists to cover the clinical features, screening & diagnosis etc to help you.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-advanced-professional-certificate-in-diabetes-management';
      const username = req.session.username || null;
      res.render('course-details-advanced-professional-certificate-in-diabetes-management', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-fellowship-in-general-practice", function(req, res) {
      const pageTitle = 'Advanced Certificate in Diabetes Mellitus, Diabetology Online';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'diabetes management, diabetes certificate course, certificate course in diabetology, certificate in diabetes, diabetes certificate course online, certificate course in diabetes management, advanced certificate course in diabetes, certificate in diabetes management, certificate in diabetes mellitus, certificate in diabetology, advanced certificate in diabetes mellitus, advanced diabetes management, certificate course in diabetes mellitus, diabetes certificate program online';
      const ogDescription = 'Advanced Certificate in Diabetes Mellitus is designed by leading diabetologists to cover the clinical features, screening & diagnosis etc to help you.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-advanced-professional-certificate-in-diabetes-management';
      const username = req.session.username || null;
      res.render('course-details-fellowship-in-general-practice', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-advanced-professional-certificate-in-general-practice", function(req, res) {
      const pageTitle = 'Advanced Certificate in Diabetes Mellitus, Diabetology Online';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'diabetes management, diabetes certificate course, certificate course in diabetology, certificate in diabetes, diabetes certificate course online, certificate course in diabetes management, advanced certificate course in diabetes, certificate in diabetes management, certificate in diabetes mellitus, certificate in diabetology, advanced certificate in diabetes mellitus, advanced diabetes management, certificate course in diabetes mellitus, diabetes certificate program online';
      const ogDescription = 'Advanced Certificate in Diabetes Mellitus is designed by leading diabetologists to cover the clinical features, screening & diagnosis etc to help you.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-advanced-professional-certificate-in-diabetes-management';
      const username = req.session.username || null;
      res.render('course-details-advanced-professional-certificate-in-general-practice', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-professional-certificate-in-critical-care", function(req, res) {
      const pageTitle = 'Professional Certificate Course in Critical Care Medicine Program';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'professional certificate in emergency medicine, certificate course in critical care medicine, professional certificate in critical care medicine, professional certificate in critical care, professional critical care certificate program';
      const ogDescription = 'Professional Certificate Course in Critical Care Medicine is proposed to impart structured critical care training to MBBS doctors to improve patient management skills.';
      const canonicalLink = 'https://globalmedacademy.com/course-details-professional-certificate-in-critical-care';
      const username = req.session.username || null;
      res.render('course-details-professional-certificate-in-critical-care', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });
    app.get("/course-details-obsgynae", function(req, res) {
      res.render("course-details-obsgynae");
    });
    app.get("/about-us",function(req,res){
      const pageTitle = 'About Fellowship, Ceritifcate Courses Online - GlobalMedAcademy';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'certificate courses online, fellowship course, fellowship course details, fellowship in diabetology, critical care medicine, internal medicine';
      const ogDescription = 'GlobalMedAcademy (GMA) is a cutting-edge Medical Ed-tech organization that provides specialized courses for medical graduates through hybrid learning approach.';
      const canonicalLink = 'https://globalmedacademy.com/about-us';
      const username = req.session.username || null;
      res.render('about-us', {
        pageTitle,
        metaRobots,
        metaKeywords,
        ogDescription,
        canonicalLink,
        isUserLoggedIn: req.isUserLoggedIn,
        username: username 
      });
    })
    app.get("/404",function(req,res){
      const pageTitle = 'Professional,Advanced, Fellowship courses';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'mall courses view, view all courses, course listings, online course catalog, course directory, course offerings, course categories, course search, explore courses, browse courses onlineedical instructor, medical teacher, apply for medical instructor';
      const ogDescription = '';
      res.render('404',{ pageTitle, metaRobots, metaKeywords, ogDescription })
    })
    app.get("/auth_email", function(req, res) {
      const pageTitle = 'Authorize your Email';
      const metaRobots = '';
      const metaKeywords = '';
      const ogDescription = '';
      const canonicalLink = 'https://globalmedacademy.com/auth_email';
      res.render('auth_email', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink });
    });
    app.get("/faqs", function(req, res) {
      const pageTitle = 'Frequently Ask Question About Fellowship & Certificate Program';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = 'Fellowship & Certificate Faqs';
      const ogDescription = 'Ask your question regarding our fellowship and certificate programs from our experts.';
      const canonicalLink = 'https://globalmedacademy.com/faqs';
      const username = req.session.username || null;
      res.render('faqs', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink,isUserLoggedIn: req.isUserLoggedIn,
        username: username  });
    });

  
    app.get("/loginn",function(req,res){
      const pageTitle = 'Login';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = '';
      const ogDescription = '';
      const canonicalLink = 'https://globalmedacademy.com/loginn';
      res.render('loginn', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink });
    });

    app.get("/register",checkEmailVerified,function(req,res){
      // const email=req.body.email
      const pageTitle = 'Registration!';
      const metaRobots = 'follow, index, max-snippet:-1, max-video-preview:-1, max-image-preview:large';
      const metaKeywords = '';
      const ogDescription = '';
      const canonicalLink = 'https://globalmedacademy.com/register';
      res.render('login', { pageTitle, metaRobots, metaKeywords, ogDescription, canonicalLink });
    });

    app.get("/becometeacher", (req, res) => {
      res.redirect(301, "/become-teacher");
    });
  
    app.get("/course-details-advanceddiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-advanced-professional-certificate-in-diabetes-management");
    });
  
    app.get("/course-details-apcc", (req, res) => {
      res.redirect(301, "/course-details-advanced-professional-certificate-in-critical-care");
    });
  
    app.get("/course-details-fcc", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-critical-care");
    });
  
    app.get("/course-details-fellowshipindiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-diabetes-management");
    });
  
    app.get("/course-details-fellowshipininternalmedicine", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-internal-medicine");
    });
  
    app.get("/course-details-professionalcriticalcare", (req, res) => {
      res.redirect(301, "/course-details-professional-certificate-in-critical-care");
    });
  
    app.get("/course-details-professionaldiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-professional-certificate-in-diabetes-management");
    });
  
    app.get("/aboutus", (req, res) => {
      res.redirect(301, "/about-us");
    });
  
    app.get("/course-details-obsgynae", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-obsgynae");
    });
    app.get("/.html", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/verify-otp", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/send-otp", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/instructor-wishlist.html", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/course-details-fellowship-in-diabetes-mellitus", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-diabetes-management");
    });
    
    app.get("/course-details-fellowship-in-obsgynae", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/index-2.html", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/:search_term_string", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/course-details-fpd", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/course-card-3.html", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/course-details-fcc", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-critical-care");
    });
    
    app.get("/course-details-advanceddiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-advanced-professional-certificate-in-diabetes-management");
    });
    
    app.get("/terms-conditions", (req, res) => {
      res.redirect(301, "/terms-conditions");
    });
    
    app.get("/course-details-fellowshipincriticalcare", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-critical-care");
    });
    
    app.get("/course-details-professionaldiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-professional-certificate-in-diabetes-management");
    });
    
    app.get("/course-details-obsgynae", (req, res) => {
      res.redirect(301, "/");
    });
    
    app.get("/course-details-fellowshipindiabetesmellitus", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-diabetes-management");
    });
    
    app.get("/course-details-fellowshipininternalmedicine", (req, res) => {
      res.redirect(301, "/course-details-fellowship-in-internal-medicine");
    });
    
    app.get("/course-details", (req, res) => {
      res.redirect(301, "/course-masonry");
    });
    app.get("/about.html",(req,res)=>{
      res.redirect(301,"/about-us")
    });
    app.get("*", function(req, res) {
      res.redirect(301,"/");
    });
  }
  
  
  module.exports = setRoutes;
  