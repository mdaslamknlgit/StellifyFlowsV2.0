export class AuditLogData {
    Id: number;
    DocumentId: number;
    LogDate: Date;
    Level: string;
    Logger: number;
    Message: string;
    Exception: string;
    PageName: string;
    Method: string;
    Action: string;
    AuditChanges: AuditDelta[];
}

export class AuditDelta {
    FieldName: string;
    ValueBefore: string;
    ValueAfter: string;
}