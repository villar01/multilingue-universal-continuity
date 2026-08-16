export interface Hotspot {
  id: string;
  x: number;
  y: number;
  label: string;
  translation: string;
  pronunciation: string;
  example: string;
  examplePt: string;
  icon: string;
  color: string;
}

export interface DialogLine {
  speaker: "teacher" | "user";
  text: string;
  textPt: string;
  options?: string[];
  correctIndex?: number;
}

export interface Scene {
  id: string;
  name: string;
  nameEn: string;
  bgImage: string;
  teacherImage: string;
  teacherName: string;
  teacherLang: string;
  langCode: string;
  flag: string;
  teacherGender?: "male" | "female";
  teacherGreeting: string;
  greetingPt: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  premium: boolean;
  hotspots: Hotspot[];
  dialog: DialogLine[];
  teacherAnimation?: "professor-wave" | "professor-nod" | "professor-celebrate";
}
