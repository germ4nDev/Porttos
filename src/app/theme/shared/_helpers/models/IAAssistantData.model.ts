export class ToolExecutedModel {
    constructor(
        public name?: string,
        public inputs: { [key: string]: any } = {},
        public dataRetrieved: any = null
    ) { }
}

export class IaAssistantDataModel {
    constructor(
        public query?: string,
        public response?: string,
        public toolExecuted: ToolExecutedModel | null = null,
        public executionMode?: string,
        public timestamp?: string
    ) { }
}

export class IaAssistantResponseModel {
    constructor(
        public success?: boolean,
        public data: IaAssistantDataModel = new IaAssistantDataModel()
    ) { }
}
