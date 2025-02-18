import { IndexData } from "@/app/pages/storage-dashboard/models";

export interface IndexSummarizer {
    summerize: (pattern: string) => Promise<IndexData>;
};
