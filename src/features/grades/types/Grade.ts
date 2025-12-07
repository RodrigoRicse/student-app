export interface Grade {
  id?: string;
  studentDni: string;
  courseId: string;
  term: 1 | 2 | 3; // bimestre
  evaluation: 1 | 2 | 3 | 4; // nota dentro del bimestre
  score: number;
  comment?: string;
}
