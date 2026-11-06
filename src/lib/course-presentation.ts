/** Catalogue artwork only. Learning IDs and the canonical book payloads stay separate. */
export const COURSE_ART: Record<string, { src: string; alt: string; collection?: boolean }> = {
  school: { src: '/book-covers/school-collection.jpg', alt: 'مجموعهٔ کتاب‌های انگلیسی مدرسه', collection: true },
  general: { src: '/book-covers/evolve-collection.jpg', alt: 'Evolve English course books', collection: true },
  evolve: { src: '/book-covers/evolve-collection.jpg', alt: 'Evolve collection', collection: true },
  project: { src: '/book-covers/project-collection.jpg', alt: 'Project collection', collection: true },
  oxford: { src: '/book-covers/ows-elementary.jpg', alt: 'Oxford Word Skills Elementary cover' },
  ielts: { src: '/book-covers/ielts-grammar-65.jpg', alt: 'IELTS Grammar cover' },
  ...Object.fromEntries([
    ...Array.from({ length: 6 }, (_, i) => `evolve-${i + 1}`),
    ...Array.from({ length: 5 }, (_, i) => `project-${i + 1}`),
    'ows-elementary', 'ows-intermediate', 'ows-upper-intermediate',
    'ielts-grammar-65', 'ielts-vocabulary-65', 'ielts-vocabulary-60', 'ielts-speaking-maximizer',
  ].map(id => [id, { src: `/book-covers/${id}.jpg`, alt: 'Book cover' }])),
};

export const courseFamily = (id: string) => id.startsWith('evolve') ? 'evolve' : id.startsWith('project') ? 'project' : /^(ows-|oxford)/.test(id) ? 'oxford' : id.startsWith('ielts') ? 'ielts' : id === 'general' ? 'general' : 'school';
