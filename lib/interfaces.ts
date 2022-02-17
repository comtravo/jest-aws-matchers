export interface Principal {
  AWS?: string;
  Service?: string;
}

interface StringEquals {
  'AWS:SourceOwner': string;
}

interface ForAnyValueArnLike {
  'aws:SourceArn': string[];
}

interface Condition {
  StringEquals?: StringEquals;
  'ForAnyValue:ArnLike'?: ForAnyValueArnLike;
}

export interface Statement {
  Sid: string;
  Effect: string;
  Principal?: Principal;
  Action: string[] | string;
  Resource?: string[] | string;
  Condition?: Condition;
}

// eslint-disable-next-line @typescript-eslint/interface-name-prefix
export interface IAMPolicy {
  Version: string;
  Id?: string;
  Statement: Statement[];
}
