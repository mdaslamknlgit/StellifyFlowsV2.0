export class SchedulerNo {
    SchedulerNoId: number;
    ScheduleCategoryName: string;
    ScheduleTypeName: string
    SchedulerNumber: number;
    SchedulerDescription: string;
    CreatedBy: number;
    UpdatedBy: number;
    IsActive: boolean;
}

export class SchedulerNoDisplayResult {
    SchedulerNo: Array<SchedulerNo>
    TotalRecords: number;
}

export class ScheduleType {
    ScheduleTypeId: number;
    ScheduleTypeName: string;
    IsActive: boolean;
}

export class ScheduleCategory {
    ScheduleCategoryId: number;
    ScheduleCategoryName: string;
    IsActive: boolean;
}