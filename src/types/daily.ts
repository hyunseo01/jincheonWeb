export interface DailyRow {
  id: string;
  // Text Slots
  t1: string;
  t2: string;
  t3: string;
  t4: string;
  // Boolean Slots
  b1: boolean | null;
  b2: boolean | null;

  // [New] 비활성화된 셀의 키 목록 (예: ['b1', 'b2'])
  disabledCells?: string[];
}

export interface DailyGroupConfig {
  // [Changed] Width 필드 제거
  t1_label?: string;
  t2_label?: string;
  t3_label?: string;
  t4_label?: string;
  b1_label?: string;
  b2_label?: string;
}

export interface DailyGroup {
  id: string;
  title: string;
  isSkipped: boolean;
  config: DailyGroupConfig;
  rows: DailyRow[];
}
