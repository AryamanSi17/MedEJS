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
  
    app.get("/becometeacher", function(req, res) {
      res.render("becometeacher");
    });
  
    app.get("/privacy-policy", function(req, res) {
      res.render("privacy-policy");
    });
  
    app.get("/admission-guide", function(req, res) {
      res.render("admission-guide");
    });
  
    app.get("/course-details-fellowshipininternalmedicine", function(req, res) {
      res.render("course-details-fellowshipininternalmedicine");
    });
  
    app.get("/course-details-fellowshipincriticalcare", function(req, res) {
      res.render("course-details-fellowshipincriticalcare");
    });
  
    app.get("/course-details-obsgynae", function(req, res) {
      res.render("course-details-obsgynae");
    });
  
    app.get("/auth_email", function(req, res) {
      res.render("auth_email");
    });
    app.get("/loginn",function(req,res){
      res.render("loginn");
    })
    
  }
  
  module.exports = setRoutes;
  