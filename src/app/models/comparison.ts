import { SelectItem } from 'primeng/api';
import { MedianExpression } from './';

export interface GCTGeneTissue {
  name: string;
  logfc: number;
  adj_p_val: number;
  ci_l: number;
  ci_r: number;
  medianexpression?: MedianExpression;
}

export interface GCTGeneNominations {
  count: number;
  year: number;
  teams: string[];
  studies: string[];
  inputs: string[];
  programs: string[];
  validations: string[];
}

export interface GCTGene {
  ensembl_gene_id: string;
  hgnc_symbol: string;
  uniprotid?: string;
  uid?: string;
  search_string?: string;
  search_array?: string[];
  tissues: GCTGeneTissue[];
  nominations?: GCTGeneNominations;
  associations?: number[];
  pinned?: boolean;
}

export interface GCTGeneResponse {
  items: GCTGene[];
}

export interface GCTSelectOption extends SelectItem {
  label?: string;
  value: any;
  disabled?: boolean;

  name?: string;
}

export interface GCTFilterOption {
  label: string;
  value?: any;
  preset?: any;
  selected?: boolean;
}

export interface GCTFilter {
  name: string;
  label: string;
  short?: string;
  description?: string;
  field?: string;
  matchMode?: string;
  order?: string;
  options: GCTFilterOption[];
}

export interface GCTDetailsPanelData {
  label?: string;
  heading?: string;
  subHeading?: string;
  value?: number;
  valueLabel?: string;
  pValue?: number;
  min?: number;
  max?: number;
  intervalMin?: number;
  intervalMax?: number;
  footer?: string;
}

export interface GCTSortEvent {
  //data: string[] | number[];
  field: string;
  mode: string;
  order: number;
}
