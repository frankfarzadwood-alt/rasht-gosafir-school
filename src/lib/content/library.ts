import packText from '@/data/library/library.pack.json?raw';
import taskText from '@/data/library/source_tasks.json?raw';
import updatesText from '@/data/library/catalogue_updates.json?raw';
import type { CatalogueNode, Placement, QuestionPack } from './contracts';
export interface SourceTask {
 id: string; book_id: string; placements: Placement[]; kind: string; title_en: string; prompt_en: string;
 images: string[]; answer_images: string[]; audio_ids: string[]; source_id: string; source_pages: number[]; key_pages: number[];
 review_status: string; evaluation: 'self_review'; reviewer_label: string; rubric: string[]; answer_reference_label?: string; notice_en?: string;
}
export const LIBRARY = JSON.parse(packText) as QuestionPack;
export const SOURCE_TASKS = (JSON.parse(taskText) as { tasks: SourceTask[] }).tasks;
export const CATALOGUE_UPDATES = JSON.parse(updatesText) as Partial<CatalogueNode>[];
