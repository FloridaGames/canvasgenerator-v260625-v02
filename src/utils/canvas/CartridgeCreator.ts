
import JSZip from 'jszip';
import { CourseData } from '@/components/CourseCreator';
import { ManifestGenerator } from './ManifestGenerator';
import { CourseSettingsGenerator } from './CourseSettingsGenerator';
import { WikiPageGenerator } from './WikiPageGenerator';
import { ModuleGenerator } from './ModuleGenerator';
import { ResourceManager } from './ResourceManager';

export class CartridgeCreator {
  private courseData: CourseData;
  private resourceManager: ResourceManager;
  private zip: JSZip;

  constructor(courseData: CourseData) {
    this.courseData = courseData;
    this.resourceManager = new ResourceManager();
    this.zip = new JSZip();
  }

  async create(): Promise<Blob> {
    console.log('Creating IMSCC cartridge...');
    
    // Initialize resources
    this.initializeResources();
    
    // Generate manifest
    const manifestGenerator = new ManifestGenerator(this.courseData, this.resourceManager);
    const manifest = manifestGenerator.generate();
    this.zip.file('imsmanifest.xml', manifest);
    
    // Generate course settings
    const courseSettingsGenerator = new CourseSettingsGenerator(this.courseData);
    const courseSettings = courseSettingsGenerator.generate();
    this.zip.file('course_settings/course_settings.xml', courseSettings);
    
    // Generate wiki pages
    const wikiPageGenerator = new WikiPageGenerator(this.courseData, this.resourceManager);
    await wikiPageGenerator.generate(this.zip);
    
    // Generate modules
    const moduleGenerator = new ModuleGenerator(this.courseData, this.resourceManager);
    const moduleXml = moduleGenerator.generate();
    this.zip.file('course_settings/module_meta.xml', moduleXml);
    
    console.log('IMSCC cartridge created successfully');
    return await this.zip.generateAsync({ type: 'blob' });
  }

  private initializeResources(): void {
    // Add front page resource
    this.resourceManager.addResource({
      type: 'wiki_page',
      identifier: 'front_page',
      title: this.courseData.frontPage.title,
      href: 'wiki_content/front-page.html'
    });

    // Add wiki page resources
    this.courseData.pages.forEach((page) => {
      this.resourceManager.addResource({
        type: 'wiki_page',
        identifier: this.generatePageIdentifier(page.id, page.title),
        title: page.title,
        href: `wiki_content/${this.sanitizeFileName(page.title)}.html`
      });
    });

    // Add document page resources
    this.courseData.documents.forEach((doc) => {
      const title = doc.name.replace(/\.[^/.]+$/, '');
      this.resourceManager.addResource({
        type: 'wiki_page',
        identifier: this.generatePageIdentifier(`doc_${doc.id}`, title),
        title: title,
        href: `wiki_content/${this.sanitizeFileName(title)}.html`
      });
    });
  }

  private generatePageIdentifier(id: string, title: string): string {
    const baseString = `${id}_${title}`.toLowerCase().replace(/[^a-z0-9]/g, '');
    let hash = 0;
    for (let i = 0; i < baseString.length; i++) {
      const char = baseString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    const hexHash = Math.abs(hash).toString(16).padEnd(32, '0').substring(0, 32);
    return `g${hexHash}`;
  }

  private sanitizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}
