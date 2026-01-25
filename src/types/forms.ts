export interface FormHistory {
  id: string; // 고유 ID
  note: string; // 수정 내역
  date: string; // 업로드 날짜 (YYYY-MM-DD)
  user: string; // 업로드한 사람
  // fileUrl?: string; // 실제 파일 다운로드 경로 (Optional)
}

export interface FormItem {
  id: string;
  title: string;
  type: 'XLSX' | 'PDF' | 'DOCX' | 'HWP'; // 파일 타입
  category: string; // 탭 분류용 (예: '입고/출고', '시설관리')
  latestDate: string;
  latestUser: string;
  history: FormHistory[];
}
