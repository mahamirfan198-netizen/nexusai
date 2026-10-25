import { api } from "./api";

export interface Subject { id: string; name: string; created_at: string; }
export interface Chapter { id: string; title: string; subject_id: string; }
export interface Question { id: string; text: string; question_type: string; correct_answer: string; options: string[]; explanation: string; }
export interface UploadResponse { id: string; filename: string; status: string; chapter_id: string; plan: any; }

export async function getSubjects(): Promise<Subject[]> {
  const { data } = await api.get("/api/education/subjects");
  return data;
}
export async function createSubject(name: string): Promise<Subject> {
  const { data } = await api.post("/api/education/subjects", { name });
  return data;
}
export async function getChapters(subjectId: string): Promise<Chapter[]> {
  const { data } = await api.get("/api/education/chapters/" + subjectId);
  return data;
}
export async function createChapter(title: string, subjectId: string): Promise<Chapter> {
  const { data } = await api.post("/api/education/chapters", { title, subject_id: subjectId });
  return data;
}
export async function uploadDocument(file: File, chapterId: string): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  form.append("chapter_id", chapterId);
  const { data } = await api.post("/api/education/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" }
  });
  return data;
}
export async function getChapterQuiz(chapterId: string): Promise<Question[]> {
  const { data } = await api.get("/api/education/chapters/" + chapterId + "/quiz");
  return data;
}
export async function saveAttempt(chapterId: string, score: number, max_score: number, answers: any[]) {
  await api.post("/api/education/attempts", { chapter_id: chapterId, score, max_score, answers });
}