export type Severity = 'error' | 'warning';

export interface CheckResult {
  checkId: string;
  severity: Severity;
  message: string;
  file: string;
  line?: number;
  blockType?: string;
}

export type CheckFn = (doc: import('../parser/types.js').PbcDocument) => CheckResult[];
