
import { CourseData } from '../../CourseCreator';

export const generateDefaultFrontPageContent = (courseData: CourseData): string => {
  const pagesList = courseData.pages
    .filter(page => page.isPublished)
    .map(page => `<li><a href="/courses/${courseData.code}/pages/${page.title.toLowerCase().replace(/\s+/g, '-')}">${page.title}</a></li>`)
    .join('\n');

  return `
<div class="course-welcome">
  <h1>${courseData.frontPage.title}</h1>
  <p class="welcome-message">${courseData.frontPage.welcomeMessage}</p>
  
  <div class="course-info">
    <h2>Course Information</h2>
    <p><strong>Course:</strong> ${courseData.title}</p>
    <p><strong>Code:</strong> ${courseData.code}</p>
    ${courseData.term ? `<p><strong>Term:</strong> ${courseData.term}</p>` : ''}
    ${courseData.description ? `<p><strong>Description:</strong> ${courseData.description}</p>` : ''}
  </div>

  <div class="course-navigation">
    <h2>Course Pages</h2>
    <ul class="page-list">
      ${pagesList}
    </ul>
  </div>

  <div class="getting-started">
    <h2>Getting Started</h2>
    <p>Welcome to the course! Please review the course pages above and familiarize yourself with the content structure.</p>
  </div>
</div>

<style>
.course-welcome {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.welcome-message {
  font-size: 1.2em;
  color: #2c5282;
  margin-bottom: 30px;
}

.course-info, .course-navigation, .getting-started {
  background: #f7fafc;
  padding: 20px;
  margin: 20px 0;
  border-radius: 8px;
  border-left: 4px solid #3182ce;
}

.page-list {
  list-style-type: none;
  padding: 0;
}

.page-list li {
  margin: 10px 0;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
}

.page-list a {
  color: #3182ce;
  text-decoration: none;
  font-weight: 500;
}

.page-list a:hover {
  text-decoration: underline;
}
</style>
  `.trim();
};
