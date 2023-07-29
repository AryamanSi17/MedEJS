function setRoutes(app) {
  app.get("/",function(req,res){
    if(req.isAuthenticated()){
      res.render("auth_index");
    } else {
    res.render("index");
    }
    
  });
  app.get("/data", (req,res) => {
    res.render("data");
  })
    app.get("/course-masonry", function(req, res) {
      if (req.user) {
        res.render('course-masonry', { loggedIn: true });
      } else {
        res.render('course-masonry', { loggedIn: false });
      }
      
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
      res.render("becometeacher");
    });
  
    app.get("/privacy-policy", function(req, res) {
      res.render("privacy-policy");
    });
    app.get("/terms-conditions", function(req, res) {
      res.render("terms-conditions");
    });
    app.get("/admission-guide", function(req, res) {
      res.render("admission-guide");
    });
  
    app.get("/course-details-fellowshipininternalmedicine", function(req, res) {
      res.render("course-details-fellowshipininternalmedicine");
    });
    app.get("/course-details-fellowship-in-diabetes-mellitus", function(req, res) {
      res.render("course-details-fellowshipindiabetesmellitus");
    });
    app.get("/course-details-fellowship-in-critical-care", function(req, res) {
      res.render("course-details-fcc");
    });
    app.get("/course-details-advanced-professional-certificate-in-critical-care", function(req, res) {
      res.render("course-details-apcc");
    });
    app.get("/course-details-advanced-professional-certificate-in-diabetes-management", function(req, res) {
      res.render("course-details-advanceddiabetesmellitus");
    });
    app.get("/course-details-advanced-professional-certificate-in-diabetes-management", function(req, res) {
      res.render("course-details-professionaldiabetesmellitus");
    });
    app.get("/course-details-advanced-professional-certificate-in-critical-care", function(req, res) {
      res.render("course-details-professionalcriticalcare");
    });
    app.get("/course-details-obsgynae", function(req, res) {
      res.render("course-details-obsgynae");
    });
    app.get("/aboutus",function(req,res){
      res.render("aboutus");
    })
    app.get("/404",function(req,res){
      res.render("404");
    })
    app.get("/auth_email", function(req, res) {
      res.render("auth_email");
    });
    app.get("/faqs", function(req, res) {
      res.render("faqs");
    });
    app.get("/loginn",function(req,res){
      const email=req.body.email
      res.render("loginn");
    });
    
  }
  
  module.exports = setRoutes;
  