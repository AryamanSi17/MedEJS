let AdminJS, AdminJSExpress, AdminJSMongoose;

async function setupAdminJS() {
  AdminJS = (await import('adminjs')).default;
  AdminJSExpress = (await import('@adminjs/express')).default;
  AdminJSMongoose = (await import('@adminjs/mongoose')).default;

  AdminJS.registerAdapter(AdminJSMongoose);

  const { User, File, Request, Course, Session, UserSession, InstructorApplication } = await import('./db.js'); // Adjust the path as necessary

  const adminJs = new AdminJS({
    databases: [],
    rootPath: '/admin-panel',
    resources: [User, File, Request, Course, Session, UserSession, InstructorApplication],
    // Additional customization...
  });

  return AdminJSExpress.buildRouter(adminJs);
}

export default setupAdminJS;
