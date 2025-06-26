
import { CourseData } from '@/components/CourseCreator';
import { escapeXml } from '../xmlUtils';

export class CourseSettingsGenerator {
  private courseData: CourseData;

  constructor(courseData: CourseData) {
    this.courseData = courseData;
  }

  generate(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<course xmlns="http://canvas.instructure.com/xsd/cccv1p0"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://canvas.instructure.com/xsd/cccv1p0 http://canvas.instructure.com/xsd/cccv1p0.xsd">
  
  <title>${escapeXml(this.courseData.title)}</title>
  <course_code>${escapeXml(this.courseData.code)}</course_code>
  <description>${escapeXml(this.courseData.description || '')}</description>
  
  ${this.generateDateSettings()}
  
  <syllabus_body>${escapeXml(this.courseData.frontPage.content)}</syllabus_body>
  <default_view>wiki</default_view>
  <wiki_has_front_page>true</wiki_has_front_page>
  
  <canvas:course_home_sub_navigation_enabled xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">true</canvas:course_home_sub_navigation_enabled>
  <canvas:course_home_view xmlns:canvas="http://canvas.instructure.com/xsd/cccv1p0">wiki</canvas:course_home_view>
</course>`;
  }

  private generateDateSettings(): string {
    let dateXml = '';
    if (this.courseData.startDate) {
      dateXml += `  <start_at>${this.courseData.startDate}T00:00:00Z</start_at>\n`;
    }
    if (this.courseData.endDate) {
      dateXml += `  <conclude_at>${this.courseData.endDate}T23:59:59Z</conclude_at>\n`;
    }
    return dateXml;
  }
}
