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
  
    app.get("/course-details-fellowship-in-internal-medicine", function(req, res) {
      res.render("course-details-fellowship-in-internal-medicine");
    });
    app.get("/course-details-fellowship-in-diabetes-mellitus", function(req, res) {
      res.render("course-details-fellowship-in-diabetes-mellitus");
    });
    app.get("/course-details-fellowship-in-critical-care", function(req, res) {
      res.render("course-details-fellowship-in-critical-care");
    });
    app.get("/course-details-advanced-professional-certificate-in-critical-care", function(req, res) {
      res.render("course-details-advanced-professional-certificate-in-critical-care");
    });
    app.get("/course-details-professional-certificate-in-diabetes-management", function(req, res) {
      res.render("course-details-professional-certificate-in-diabetes-management");
    });
    app.get("/course-details-advanced-professional-certificate-in-diabetes-management", function(req, res) {
      res.render("course-details-advanced-professional-certificate-in-diabetes-management");
    });
    app.get("/course-details-professional-certificate-in-critical-care", function(req, res) {
      res.render("course-details-professional-certificate-in-critical-care");
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

    app.get("/register",function(req,res){
      // const email=req.body.email
      res.render("login");
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
      res.redirect(301, "/course-details-fellowship-in-diabetes-mellitus");
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
    app.get("*", function(req, res) {
      res.render("404");
    });
  }
  
  
  module.exports = setRoutes;
  